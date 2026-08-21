import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { DB, AdminUser, Activity, Role } from "./types";
import { ROLE_PERMS } from "./types";
import { SEED_VERSION, makeSeed, hashPw } from "./seed";
import { supabase, SITE_DATA_ROW_ID } from "./supabase";

const DB_KEY = "pacosa_db";
const SES_KEY = "pacosa_session";
const FAIL_KEY = "pacosa_login_fail";

export interface Session { userId: string; token: string; exp: number; }
export interface Toast { id: number; text: string; kind: "success" | "error" | "info"; }

interface StoreValue {
  db: DB;
  session: Session | null;
  user: AdminUser | null;
  toasts: Toast[];
  synced: boolean;
  toast: (text: string, kind?: Toast["kind"]) => void;
  dismissToast: (id: number) => void;
  update: (fn: (d: DB) => DB) => void;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  can: (perm: string) => boolean;
  logActivity: (text: string, type?: string) => void;
  patchSettings: (patch: Partial<DB["settings"]>) => void;
}

const Ctx = createContext<StoreValue | null>(null);

function loadLocalDb(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      if (parsed && parsed.__v === SEED_VERSION) return parsed;
    }
  } catch { /* corrupted — reseed */ }
  const seeded = makeSeed();
  try { localStorage.setItem(DB_KEY, JSON.stringify(seeded)); } catch { /* storage full */ }
  return seeded;
}

function cacheLocal(next: DB) {
  try { localStorage.setItem(DB_KEY, JSON.stringify(next)); } catch { /* quota */ }
}

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SES_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (s.exp < Date.now()) { localStorage.removeItem(SES_KEY); return null; }
    return s;
  } catch { return null; }
}

/**
 * Fetch (or, on first run, seed) the single shared site-data row in Supabase.
 * Everything the admin panel edits — programs, events, news, settings, etc. —
 * lives in one jsonb column so every visitor's browser reads/writes the same
 * source of truth instead of each browser's own localStorage copy.
 */
async function fetchRemoteDb(): Promise<DB | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("site_data")
    .select("data")
    .eq("id", SITE_DATA_ROW_ID)
    .maybeSingle();
  if (error) { console.warn("[supabase] fetch site_data failed:", error.message); return null; }
  if (data?.data) return data.data as DB;

  // No row yet — this is a brand-new database. Seed it once so every future
  // visitor (and browser) starts from the same content instead of each
  // device generating its own local seed.
  const seeded = makeSeed();
  const { error: insertErr } = await supabase
    .from("site_data")
    .insert({ id: SITE_DATA_ROW_ID, data: seeded });
  if (insertErr) console.warn("[supabase] seed insert failed:", insertErr.message);
  return seeded;
}

async function pushRemoteDb(next: DB) {
  if (!supabase) return;
  const { error } = await supabase
    .from("site_data")
    .upsert({ id: SITE_DATA_ROW_ID, data: next, updated_at: new Date().toISOString() });
  if (error) console.warn("[supabase] save failed:", error.message);
}

/** Look up an authenticated Supabase user's app role from admin_users. */
async function lookupAdminRole(email: string): Promise<Role | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("admin_users")
    .select("role")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (error || !data) return null;
  return data.role as Role;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(loadLocalDb);
  const [session, setSession] = useState<Session | null>(loadSession);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [synced, setSynced] = useState(false);
  const remoteReady = useRef(false);
  const saveTimer = useRef<number | null>(null);

  // On mount: pull the shared database from Supabase (if configured) so
  // every browser/device converges on the same content, then keep a local
  // cache as an offline fallback.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const remote = await fetchRemoteDb();
      if (cancelled) return;
      if (remote) {
        setDb(remote);
        cacheLocal(remote);
        remoteReady.current = true;
      }
      setSynced(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // Restore a real Supabase Auth session on load (survives refresh/new tab)
  // and react to sign-in/sign-out events.
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      if (s?.user?.email) void hydrateSessionFromAuth(s.user.id, s.user.email, s.access_token, s.expires_at);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s?.user?.email) void hydrateSessionFromAuth(s.user.id, s.user.email, s.access_token, s.expires_at);
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hydrateSessionFromAuth = useCallback(async (authId: string, email: string, token: string, expiresAt?: number) => {
    const role = (await lookupAdminRole(email)) ?? "editor";
    const sess: Session = { userId: authId, token, exp: expiresAt ? expiresAt * 1000 : Date.now() + 12 * 3600 * 1000 };
    localStorage.setItem(SES_KEY, JSON.stringify(sess));
    setSession(sess);
    setDb(prev => {
      const exists = prev.users.some(u => u.id === authId);
      if (exists) return prev;
      const entry: AdminUser = {
        id: authId, name: email.split("@")[0], email, passwordHash: "", role,
        active: true, color: "#2b3e2b", lastLogin: new Date().toISOString(),
      };
      return { ...prev, users: [...prev.users, entry] };
    });
  }, []);

  // Debounced write-through to Supabase so rapid successive edits (typing,
  // drag-reorder, etc.) don't fire a network request per keystroke.
  const persist = useCallback((next: DB) => {
    cacheLocal(next);
    if (!supabase) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => { void pushRemoteDb(next); }, 600);
  }, []);

  const update = useCallback((fn: (d: DB) => DB) => {
    setDb(prev => { const next = fn(prev); persist(next); return next; });
  }, [persist]);

  const dismissToast = useCallback((id: number) => setToasts(t => t.filter(x => x.id !== id)), []);
  const toast = useCallback((text: string, kind: Toast["kind"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t.slice(-3), { id, text, kind }]);
    window.setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4200);
  }, []);

  const user = useMemo(
    () => (session ? db.users.find(u => u.id === session.userId && u.active) ?? null : null),
    [db.users, session],
  );

  const can = useCallback((perm: string) => {
    if (!user) return false;
    const perms = ROLE_PERMS[user.role];
    return perms === "*" || perms.includes(perm);
  }, [user]);

  const logActivity = useCallback((text: string, type = "system") => {
    const entry: Activity = { id: "ac" + Date.now().toString(36), text, type, user: user?.name ?? "System", at: new Date().toISOString() };
    update(d => ({ ...d, activity: [entry, ...d.activity].slice(0, 200) }));
  }, [update, user]);

  const patchSettings = useCallback((patch: Partial<DB["settings"]>) => {
    update(d => ({ ...d, settings: { ...d.settings, ...patch } }));
  }, [update]);

  const login = useCallback(async (email: string, password: string) => {
    // Real accounts (yours) go through Supabase Auth once it's configured.
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error || !data.session) {
        return { ok: false, error: error?.message === "Invalid login credentials"
          ? "Invalid credentials." : (error?.message || "Sign-in failed.") };
      }
      await hydrateSessionFromAuth(data.session.user.id, data.session.user.email!, data.session.access_token, data.session.expires_at);
      return { ok: true };
    }

    // Fallback demo auth — only used when Supabase isn't configured (e.g. local preview).
    let fails = { count: 0, until: 0, email: "" };
    try { fails = JSON.parse(localStorage.getItem(FAIL_KEY) || "null") || fails; } catch { /* ignore */ }
    if (fails.email === email && fails.until > Date.now()) {
      return { ok: false, error: `Too many attempts. Locked for ${Math.ceil((fails.until - Date.now()) / 1000)}s.` };
    }
    await new Promise(r => setTimeout(r, 450));
    const acct = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    const ok = !!acct && acct.active && acct.passwordHash === hashPw(password);
    if (!ok) {
      const next = fails.email === email && fails.until < Date.now() ? { ...fails, count: fails.count + 1 } : { email, count: 1, until: 0 };
      if (next.count >= 5) next.until = Date.now() + 60000;
      localStorage.setItem(FAIL_KEY, JSON.stringify(next));
      return { ok: false, error: next.count >= 5 ? "Too many failed attempts. Try again in a minute." : "Invalid credentials or inactive account." };
    }
    localStorage.removeItem(FAIL_KEY);
    const s: Session = { userId: acct.id, token: Math.random().toString(36).slice(2) + Date.now().toString(36), exp: Date.now() + 12 * 3600 * 1000 };
    localStorage.setItem(SES_KEY, JSON.stringify(s));
    setSession(s);
    update(d => ({ ...d, users: d.users.map(u => u.id === acct.id ? { ...u, lastLogin: new Date().toISOString() } : u) }));
    return { ok: true };
  }, [db.users, update, hydrateSessionFromAuth]);

  const logout = useCallback(() => {
    if (supabase) void supabase.auth.signOut();
    localStorage.removeItem(SES_KEY);
    setSession(null);
  }, []);

  const value: StoreValue = { db, session, user, toasts, synced, toast, dismissToast, update, login, logout, can, logActivity, patchSettings };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore outside provider");
  return v;
}

/* ---------------- shared helpers ---------------- */

export function uid(prefix = "id"): string {
  return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function nextRefNo(d: DB): string {
  const year = new Date().getFullYear();
  const max = d.members.reduce((m, x) => {
    const n = parseInt(x.refNo.split("-").pop() || "0", 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `PAC-${year}-${String(max + 1).padStart(4, "0")}`;
}

export function fmtDate(isoStr: string, opts?: Intl.DateTimeFormatOptions): string {
  if (!isoStr) return "—";
  const dt = new Date(isoStr.length <= 10 ? isoStr + "T12:00:00" : isoStr);
  return dt.toLocaleDateString("en-GB", opts ?? { day: "numeric", month: "short", year: "numeric" });
}

export function daysFromNow(isoStr: string): number {
  const a = new Date(); a.setHours(0, 0, 0, 0);
  const b = new Date(isoStr + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/** Strip scripts / event handlers from editor HTML (XSS mitigation). */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

/** Read + downscale an uploaded image to a storable data-URL (max 1400px, JPEG 0.82). */
export function processImageFile(file: File): Promise<{ url: string; size: number }> {
  return new Promise((resolve, reject) => {
    if (!/^image\/(jpeg|jpg|png|webp)$/i.test(file.type)) { reject(new Error("Only JPG, PNG or WEBP images are supported.")); return; }
    if (file.size > 8 * 1024 * 1024) { reject(new Error("Image exceeds the 8 MB limit.")); return; }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Not a valid image file."));
      img.onload = () => {
        const max = 1400;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve({ url: String(reader.result), size: file.size }); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const url = canvas.toDataURL("image/jpeg", 0.82);
        resolve({ url, size: Math.round(url.length * 0.75) });
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/** Per-page document title / meta description (SEO). */
export function usePageMeta(title?: string, description?: string) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      let m = document.querySelector('meta[name="description"]');
      if (!m) { m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); }
      m.setAttribute("content", description);
    }
  }, [title, description]);
}

export function prefersReduced(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
