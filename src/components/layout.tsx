import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, Phone, Mail, MapPin, ArrowRight, Facebook, Instagram, Youtube, Linkedin, Send } from "lucide-react";
import { useStore, uid } from "../lib/store";
import { Wordmark, SmartImg } from "./ui";

const NAV = [
  { to: "/", label: "Home" }, { to: "/about", label: "About" }, { to: "/programs", label: "Programs" },
  { to: "/events", label: "Events" }, { to: "/news", label: "News" }, { to: "/gallery", label: "Gallery" },
  { to: "/videos", label: "Videos" }, { to: "/leadership", label: "Leadership" }, { to: "/members", label: "Members" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const { db } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const loc = useLocation();
  useEffect(() => { setMobile(false); }, [loc.pathname]);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    h(); window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  const s = db.settings;
  return (
    <header className="sticky top-0 z-[60]">
      <div className="bg-pine-950 text-pine-100 text-[0.7rem] tracking-wide hidden md:block">
        <div className="max-w-7xl mx-auto px-5 h-8 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5"><Mail size={11} className="text-gold-400" />{s.email}</span>
            <span className="flex items-center gap-1.5"><Phone size={11} className="text-gold-400" />{s.phone}</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="uppercase tracking-[0.22em] text-gold-300/90">{s.tagline}</span>
            <Link to="/admin/login" className="hover:text-gold-300 transition-colors">Admin Login</Link>
          </div>
        </div>
      </div>
      <div className={`bg-paper/95 backdrop-blur border-b transition-shadow ${scrolled ? "shadow-[0_6px_24px_rgba(18,29,18,0.12)] border-pine-900/10" : "border-pine-900/5"}`}>
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between h-[72px]">
          <Link to="/" aria-label="PACOSA home"><Wordmark compact /></Link>
          <nav className="hidden xl:flex items-center gap-1" aria-label="Main navigation">
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to} end={n.to === "/"}
                className={({ isActive }) => `px-3 py-2 text-[0.8rem] font-semibold uppercase tracking-[0.08em] rounded transition-colors ${isActive ? "text-pine-900 bg-pine-100" : "text-inksoft hover:text-pine-900"}`}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => setSearch(true)} aria-label="Search website" className="p-2.5 rounded hover:bg-pine-100 text-pine-800 transition-colors"><Search size={19} /></button>
            <Link to="/join" className="hidden sm:inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-pine-950 font-bold uppercase tracking-[0.14em] text-[0.78rem] px-5 py-3 rounded-[4px] transition-all shadow-[0_2px_14px_rgba(194,155,60,0.35)] active:translate-y-px">
              Join PACOSA
            </Link>
            <button onClick={() => setMobile(true)} aria-label="Open menu" className="xl:hidden p-2.5 rounded hover:bg-pine-100 text-pine-800"><Menu size={22} /></button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-pine-950/60 xl:hidden" onClick={() => setMobile(false)}>
            <motion.nav aria-label="Mobile navigation" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.28 }}
              className="absolute right-0 top-0 h-full w-[300px] bg-pine-950 text-paper p-6 flex flex-col dark-scroll overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-8">
                <Wordmark light compact />
                <button onClick={() => setMobile(false)} aria-label="Close menu" className="p-2 rounded hover:bg-paper/10"><X size={20} /></button>
              </div>
              {NAV.map((n, i) => (
                <motion.div key={n.to} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.04 }}>
                  <NavLink to={n.to} end={n.to === "/"} className={({ isActive }) => `flex items-center justify-between py-3.5 border-b border-paper/10 font-display uppercase text-xl tracking-wide ${isActive ? "text-gold-300" : "text-paper/90 hover:text-gold-300"}`}>
                    {n.label} <ArrowRight size={15} className="opacity-40" />
                  </NavLink>
                </motion.div>
              ))}
              <Link to="/join" className="mt-8 inline-flex justify-center items-center bg-gold-500 text-pine-950 font-bold uppercase tracking-[0.14em] text-[0.82rem] px-5 py-3.5 rounded-[4px]">Join PACOSA</Link>
              <Link to="/admin/login" className="mt-4 text-center text-[0.72rem] uppercase tracking-[0.2em] text-paper/50 hover:text-gold-300">Admin Login</Link>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay open={search} onClose={() => setSearch(false)} />
    </header>
  );
}

/* ---------- global search ---------- */
function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { db } = useStore();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) { setQ(""); setTimeout(() => inputRef.current?.focus(), 60); } }, [open]);
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (t.length < 2) return [];
    const has = (...strs: (string | string[] | undefined)[]) => strs.some(s => (Array.isArray(s) ? s.join(" ") : s ?? "").toLowerCase().includes(t));
    const r: { type: string; title: string; meta: string; to: string }[] = [];
    db.news.filter(a => a.status === "published" && has(a.title, a.excerpt, a.tags, a.category)).forEach(a => r.push({ type: "News", title: a.title, meta: a.category, to: `/news/${a.id}` }));
    db.programs.filter(p => p.status !== "draft" && has(p.title, p.description, p.category, p.location)).forEach(p => r.push({ type: "Program", title: p.title, meta: p.category, to: `/programs/${p.id}` }));
    db.events.filter(e => e.status === "published" && has(e.title, e.description, e.location, e.category)).forEach(e => r.push({ type: "Event", title: e.title, meta: e.location, to: `/events/${e.id}` }));
    db.albums.filter(a => has(a.title, a.description)).forEach(a => r.push({ type: "Gallery", title: a.title, meta: `${a.images.length} photos`, to: `/gallery/${a.id}` }));
    db.leaders.filter(l => has(l.name, l.position)).forEach(l => r.push({ type: "Leadership", title: l.name, meta: l.position, to: "/leadership" }));
    db.pages.filter(p => p.published && has(p.title, p.content)).forEach(p => r.push({ type: "Page", title: p.title, meta: "", to: `/page/${p.slug}` }));
    return r.slice(0, 12);
  }, [q, db]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[85] bg-pine-950/85 backdrop-blur-sm flex flex-col" role="dialog" aria-modal="true" aria-label="Search the website" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="max-w-3xl w-full mx-auto px-5 pt-[12vh]">
        <div className="flex items-center gap-3 border-b-2 border-gold-500 pb-3">
          <Search size={22} className="text-gold-400 flex-shrink-0" />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Search news, programs, events, gallery…"
            className="flex-1 bg-transparent text-paper text-xl sm:text-2xl font-display uppercase tracking-wide placeholder:text-paper/30" aria-label="Search query" />
          <button onClick={onClose} aria-label="Close search" className="p-2 text-paper/70 hover:text-paper"><X size={20} /></button>
        </div>
        <p className="text-paper/40 text-[0.7rem] uppercase tracking-[0.25em] mt-4">{q.trim().length < 2 ? "Type at least two characters" : `${results.length} result${results.length === 1 ? "" : "s"}`}</p>
        <div className="mt-3 max-h-[55vh] overflow-y-auto dark-scroll pr-1">
          {results.map((r, i) => (
            <Link key={i} to={r.to} onClick={onClose} className="flex items-center justify-between gap-4 py-3.5 border-b border-paper/10 group">
              <div>
                <span className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold-400">{r.type}</span>
                <div className="text-paper font-semibold group-hover:text-gold-300 transition-colors">{r.title}</div>
                {r.meta && <div className="text-paper/50 text-xs mt-0.5">{r.meta}</div>}
              </div>
              <ArrowRight size={16} className="text-paper/30 group-hover:text-gold-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- footer ---------- */
export function Footer() {
  const { db, update, toast, logActivity } = useStore();
  const [email, setEmail] = useState("");
  const s = db.settings;
  const subscribe = () => {
    const e = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { toast("Please enter a valid email address.", "error"); return; }
    if (db.subscribers.some(x => x.email.toLowerCase() === e.toLowerCase())) { toast("You are already subscribed.", "info"); return; }
    update(d => ({ ...d, subscribers: [...d.subscribers, { id: uid("sub"), email: e, createdAt: new Date().toISOString() }] }));
    logActivity(`Newsletter subscriber added: ${e}`, "newsletter");
    toast("Welcome aboard — you are subscribed to PACOSA updates.");
    setEmail("");
  };
  const socials = [
    { label: "Facebook", url: s.social.facebook, icon: <Facebook size={15} /> },
    { label: "Instagram", url: s.social.instagram, icon: <Instagram size={15} /> },
    { label: "YouTube", url: s.social.youtube, icon: <Youtube size={15} /> },
    { label: "LinkedIn", url: s.social.linkedin, icon: <Linkedin size={15} /> },
  ];
  return (
    <footer className="bg-pine-950 text-paper relative overflow-hidden">
      <div className="tape-strip h-2" aria-hidden="true" />
      <div className="absolute inset-0 grid-lines pointer-events-none" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-5 py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          {s.footerLogo ? <SmartImg src={s.footerLogo} alt={`${s.orgName} logo`} className="h-14 w-auto object-contain" /> : <Wordmark light />}
          <p className="text-pine-100/70 text-sm leading-relaxed mt-5 max-w-sm">{s.footerText}</p>
          <div className="flex gap-2 mt-6">
            {socials.filter(x => x.url).map(x => (
              <a key={x.label} href={x.url} target="_blank" rel="noreferrer" aria-label={x.label}
                className="w-9 h-9 flex items-center justify-center rounded border border-paper/20 text-paper/80 hover:bg-gold-500 hover:text-pine-950 hover:border-gold-500 transition-all">{x.icon}</a>
            ))}
          </div>
        </div>
        <nav aria-label="Footer quick links">
          <h4 className="font-display font-bold uppercase tracking-[0.2em] text-gold-300 text-sm mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-sm">
            {[["About PACOSA", "/about"], ["Programs", "/programs"], ["Events Calendar", "/events"], ["News & Announcements", "/news"], ["Photo Gallery", "/gallery"], ["Leadership", "/leadership"], ["Support PACOSA", "/support"]].map(([l, to]) => (
              <li key={to}><Link to={to} className="text-pine-100/75 hover:text-gold-300 transition-colors inline-flex items-center gap-2"><span className="w-1 h-1 bg-gold-500 rounded-full" />{l}</Link></li>
            ))}
          </ul>
        </nav>
        <div>
          <h4 className="font-display font-bold uppercase tracking-[0.2em] text-gold-300 text-sm mb-4">Contact</h4>
          <ul className="space-y-3 text-sm text-pine-100/75">
            <li className="flex gap-2.5"><MapPin size={15} className="text-gold-400 mt-0.5 flex-shrink-0" />{s.address}</li>
            <li className="flex gap-2.5"><Phone size={15} className="text-gold-400 mt-0.5 flex-shrink-0" />{s.phone}</li>
            <li className="flex gap-2.5"><Mail size={15} className="text-gold-400 mt-0.5 flex-shrink-0" />{s.email}</li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-bold uppercase tracking-[0.2em] text-gold-300 text-sm mb-4">Stay on Parade</h4>
          <p className="text-pine-100/70 text-sm mb-4">Monthly dispatches: events, training dates and association news. No spam — signed off by the secretariat.</p>
          <div className="flex gap-2">
            <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && subscribe()} placeholder="Your email" aria-label="Email for newsletter"
              className="flex-1 bg-paper/10 border border-paper/20 rounded-[4px] px-3.5 py-2.5 text-sm text-paper placeholder:text-paper/35 focus:border-gold-400" />
            <button onClick={subscribe} aria-label="Subscribe" className="bg-gold-500 hover:bg-gold-400 text-pine-950 px-4 rounded-[4px] transition-colors"><Send size={16} /></button>
          </div>
        </div>
      </div>
      <div className="relative border-t border-paper/10">
        <div className="max-w-7xl mx-auto px-5 py-5 flex flex-wrap items-center justify-between gap-3 text-[0.72rem] text-pine-100/55">
          <span>© 2026 PACOSA. All Rights Reserved. • <Link to="/page/constitution" className="hover:text-gold-300">Constitution</Link></span>
          <span className="uppercase tracking-[0.25em]">Discipline • Leadership • Unity • Service • Excellence</span>
          <Link to="/admin/login" className="hover:text-gold-300 transition-colors flex items-center gap-1.5">Admin Login <ArrowRight size={11} /></Link>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="noise-layer" aria-hidden="true" />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
