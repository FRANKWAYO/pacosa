import { useMemo, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, FileText, CalendarDays, Newspaper, Image as Images, Video, Users, UserCheck, MessageSquare, FolderOpen, UserCog, Settings as SettingsIcon, Landmark, History, LogOut, Menu, Bell, ExternalLink, ShieldCheck, TrendingUp, Inbox, CheckCircle2, AlertCircle, ChevronDown } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useStore, fmtDate, daysFromNow } from "../lib/store";
import { Crest, Wordmark, Btn, SmartImg, Monogram, Pill, PageHead } from "../components/ui";
import { ROLE_LABELS } from "../lib/types";

/* ================= LOGIN ================= */
export function AdminLogin() {
  const { login, session, toast } = useStore();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@pacosa.org");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  if (session) { window.location.hash = "#/admin"; return null; }
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await login(email, pw);
    setBusy(false);
    if (r.ok) { toast("Welcome back. Signed in securely."); nav("/admin"); }
    else setErr(r.error ?? "Login failed.");
  };
  const demo = [
    ["Super Administrator", "admin@pacosa.org", "pacosa2026"],
    ["Administrator", "manager@pacosa.org", "pacosa2026"],
    ["Editor", "editor@pacosa.org", "editor2026"],
    ["Membership Officer", "officer@pacosa.org", "officer2026"],
  ];
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-paper">
      <div className="relative bg-pine-950 text-paper p-10 lg:p-16 flex flex-col overflow-hidden">
        <div className="absolute inset-0 grid-lines" aria-hidden="true" />
        <div className="tape-strip absolute top-0 inset-x-0 h-2" aria-hidden="true" />
        <div className="relative"><Wordmark light /></div>
        <div className="relative my-auto py-14">
          <div className="text-[0.7rem] font-bold tracking-[0.32em] uppercase text-gold-300">Restricted Area</div>
          <h1 className="font-display font-bold uppercase text-5xl sm:text-6xl leading-[1.0] mt-4">Command<br />Console</h1>
          <p className="text-pine-100/75 mt-5 max-w-md leading-relaxed">The administrative dashboard of the association: programs, events, news, gallery, members and settings — managed without touching a line of code.</p>
          <ul className="mt-8 space-y-3 text-sm text-pine-100/80">
            {["Role-based access for four officer classes", "Draft → Preview → Publish workflow", "Full activity audit trail"].map(x => (
              <li key={x} className="flex items-center gap-3"><ShieldCheck size={16} className="text-gold-400" />{x}</li>
            ))}
          </ul>
        </div>
        <div className="relative text-[0.68rem] uppercase tracking-[0.24em] text-pine-100/40">Discipline • Leadership • Unity • Service • Excellence</div>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="font-display font-bold uppercase text-4xl text-pine-900">Sign In</h2>
          <p className="text-inksoft text-sm mt-2">Authenticate with your secretariat credentials. Failed attempts are rate-limited.</p>
          <form onSubmit={e => void submit(e)} className="mt-8 space-y-5">
            <label className="block"><span className="field-label">Email</span><input className="field" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" required /></label>
            <label className="block"><span className="field-label">Password</span><input className="field" type="password" value={pw} onChange={e => setPw(e.target.value)} autoComplete="current-password" placeholder="••••••••••" required /></label>
            {err && <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3"><AlertCircle size={16} className="mt-0.5 flex-shrink-0" />{err}</div>}
            <Btn variant="pine" size="lg" type="submit" disabled={busy} className="w-full">{busy ? "Verifying…" : "Enter Dashboard"}</Btn>
          </form>
          <div className="mt-8 bg-pine-50 border border-pine-900/10 rounded-md p-5">
            <div className="text-[0.66rem] font-bold uppercase tracking-[0.22em] text-inksoft mb-3">Demo credentials</div>
            <div className="space-y-2">
              {demo.map(([role, em, p]) => (
                <button key={em} onClick={() => { setEmail(em); setPw(p); }} className="w-full flex items-center justify-between gap-3 text-left text-[0.78rem] bg-paper border border-pine-900/10 rounded px-3 py-2 hover:border-gold-500 transition-colors">
                  <span className="font-bold text-pine-900">{role}</span>
                  <span className="text-inksoft truncate">{em} / {p}</span>
                </button>
              ))}
            </div>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 mt-6 text-[0.75rem] font-bold uppercase tracking-[0.16em] text-gold-600 hover:text-pine-800 transition-colors">← Back to public site</Link>
        </div>
      </div>
    </div>
  );
}

/* ================= LAYOUT ================= */
const NAV_SECTIONS: { title: string; items: { to: string; label: string; icon: ReactNode; perm: string }[] }[] = [
  { title: "Overview", items: [
    { to: "/admin", label: "Dashboard", icon: <LayoutDashboard size={17} />, perm: "dashboard" },
    { to: "/admin/activity-logs", label: "Activity Logs", icon: <History size={17} />, perm: "logs" },
  ]},
  { title: "Content", items: [
    { to: "/admin/homepage", label: "Homepage", icon: <FolderOpen size={17} />, perm: "homepage" },
    { to: "/admin/programs", label: "Programs", icon: <FileText size={17} />, perm: "programs" },
    { to: "/admin/events", label: "Events", icon: <CalendarDays size={17} />, perm: "events" },
    { to: "/admin/news", label: "News", icon: <Newspaper size={17} />, perm: "news" },
    { to: "/admin/pages", label: "Pages", icon: <FileText size={17} />, perm: "pages" },
  ]},
  { title: "Media", items: [
    { to: "/admin/gallery", label: "Gallery", icon: <Images size={17} />, perm: "gallery" },
    { to: "/admin/videos", label: "Videos", icon: <Video size={17} />, perm: "videos" },
    { to: "/admin/media", label: "Media Library", icon: <Images size={17} />, perm: "media" },
  ]},
  { title: "People", items: [
    { to: "/admin/members", label: "Members", icon: <Users size={17} />, perm: "members" },
    { to: "/admin/applications", label: "Applications", icon: <UserCheck size={17} />, perm: "applications" },
    { to: "/admin/leadership", label: "Leadership", icon: <Users size={17} />, perm: "leadership" },
    { to: "/admin/messages", label: "Messages", icon: <MessageSquare size={17} />, perm: "messages" },
  ]},
  { title: "System", items: [
    { to: "/admin/donations", label: "Donations", icon: <Landmark size={17} />, perm: "donations" },
    { to: "/admin/users", label: "Users", icon: <UserCog size={17} />, perm: "users" },
    { to: "/admin/settings", label: "Settings", icon: <SettingsIcon size={17} />, perm: "settings" },
  ]},
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, can, logout, db } = useStore();
  const [mobile, setMobile] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const loc = useLocation();
  if (!user) return null;

  const pending = db.members.filter(m => m.status === "pending");
  const unread = db.messages.filter(m => !m.read);
  const soon = db.events.filter(e => e.status === "published" && daysFromNow(e.date) >= 0 && daysFromNow(e.date) <= 7);
  const badge = pending.length + unread.length;

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-paper/10"><Link to="/"><Wordmark light compact /></Link></div>
      <nav className="flex-1 overflow-y-auto dark-scroll px-3 py-4" aria-label="Admin navigation">
        {NAV_SECTIONS.map(sec => {
          const items = sec.items.filter(i => can(i.perm));
          if (items.length === 0) return null;
          return (
            <div key={sec.title} className="mb-5">
              <div className="px-3 mb-2 text-[0.6rem] font-bold tracking-[0.28em] uppercase text-gold-400/70">{sec.title}</div>
              {items.map(i => (
                <NavLink key={i.to} to={i.to} end={i.to === "/admin"} onClick={() => setMobile(false)}
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-md text-[0.84rem] font-semibold mb-0.5 transition-all border-l-2 ${isActive ? "bg-paper/10 text-gold-300 border-gold-500" : "text-pine-100/70 border-transparent hover:bg-paper/5 hover:text-paper"}`}>
                  {i.icon}{i.label}
                  {i.to === "/admin/applications" && pending.length > 0 && <span className="ml-auto bg-gold-500 text-pine-950 text-[0.62rem] font-bold px-1.5 py-0.5 rounded-full">{pending.length}</span>}
                  {i.to === "/admin/messages" && unread.length > 0 && <span className="ml-auto bg-gold-500 text-pine-950 text-[0.62rem] font-bold px-1.5 py-0.5 rounded-full">{unread.length}</span>}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>
      <div className="p-4 border-t border-paper/10">
        <div className="flex items-center gap-3 px-2 py-2">
          <Monogram name={user.name} size={40} rankLines={1} className="rounded" />
          <div className="min-w-0 flex-1">
            <div className="text-paper text-sm font-bold truncate">{user.name}</div>
            <div className="text-[0.64rem] uppercase tracking-[0.14em] text-gold-300/80">{ROLE_LABELS[user.role]}</div>
          </div>
          <button onClick={logout} aria-label="Logout" title="Logout" className="p-2 rounded text-pine-100/60 hover:text-paper hover:bg-paper/10 transition-colors"><LogOut size={17} /></button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper lg:pl-[260px]">
      <div className="noise-layer" aria-hidden="true" />
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-[260px] bg-pine-950 z-40">{sidebar}</aside>
      <AnimatePresence>
        {mobile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[75] bg-pine-950/60 lg:hidden" onClick={() => setMobile(false)}>
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "tween", duration: 0.25 }} className="absolute left-0 top-0 h-full w-[270px] bg-pine-950" onClick={e => e.stopPropagation()}>{sidebar}</motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-[55] bg-paper/95 backdrop-blur border-b border-pine-900/10">
        <div className="flex items-center gap-3 px-4 sm:px-6 h-16">
          <button onClick={() => setMobile(true)} aria-label="Open admin menu" className="lg:hidden p-2 rounded hover:bg-pine-100 text-pine-800"><Menu size={21} /></button>
          <div className="text-[0.66rem] font-bold uppercase tracking-[0.24em] text-inksoft hidden sm:block">PACOSA Admin — {ROLE_LABELS[user.role]}</div>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/" className="hidden sm:inline-flex items-center gap-2 border border-pine-800/30 text-pine-800 hover:bg-pine-800 hover:text-paper px-4 py-2 rounded-[4px] text-[0.72rem] font-bold uppercase tracking-[0.12em] transition-colors">
              <ExternalLink size={13} /> View Live Site
            </Link>
            <div className="relative">
              <button onClick={() => setBellOpen(v => !v)} aria-label="Notifications" className="relative p-2.5 rounded hover:bg-pine-100 text-pine-800 transition-colors">
                <Bell size={19} />
                {badge > 0 && <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gold-500 text-pine-950 text-[0.58rem] font-bold flex items-center justify-center">{badge}</span>}
              </button>
              {bellOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                  <div className="absolute right-0 top-12 z-50 w-[320px] bg-paper border border-pine-900/15 rounded-lg shadow-2xl overflow-hidden">
                    <div className="px-4 py-3 bg-pine-950 text-paper text-[0.7rem] font-bold uppercase tracking-[0.2em]">Notifications</div>
                    <div className="max-h-[340px] overflow-y-auto">
                      {pending.map(m => (
                        <Link key={m.id} to="/admin/applications" onClick={() => setBellOpen(false)} className="flex gap-3 px-4 py-3 border-b border-pine-900/8 hover:bg-pine-50 transition-colors">
                          <UserCheck size={16} className="text-gold-600 mt-0.5 flex-shrink-0" />
                          <div><div className="text-sm font-semibold text-pine-900">New membership application</div><div className="text-[0.72rem] text-inksoft">{m.fullName} — {m.region}</div></div>
                        </Link>
                      ))}
                      {unread.slice(0, 3).map(m => (
                        <Link key={m.id} to="/admin/messages" onClick={() => setBellOpen(false)} className="flex gap-3 px-4 py-3 border-b border-pine-900/8 hover:bg-pine-50 transition-colors">
                          <Inbox size={16} className="text-gold-600 mt-0.5 flex-shrink-0" />
                          <div><div className="text-sm font-semibold text-pine-900">New contact message</div><div className="text-[0.72rem] text-inksoft">{m.name}: {m.subject || "No subject"}</div></div>
                        </Link>
                      ))}
                      {soon.map(e => (
                        <div key={e.id} className="flex gap-3 px-4 py-3 border-b border-pine-900/8">
                          <CalendarDays size={16} className="text-gold-600 mt-0.5 flex-shrink-0" />
                          <div><div className="text-sm font-semibold text-pine-900">Upcoming event</div><div className="text-[0.72rem] text-inksoft">{e.title} — {fmtDate(e.date)}</div></div>
                        </div>
                      ))}
                      {badge === 0 && soon.length === 0 && <p className="px-4 py-8 text-center text-inksoft text-sm">All clear. Nothing pending.</p>}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="px-4 sm:px-6 py-8 max-w-[1400px] mx-auto" key={loc.pathname}>{children}</main>
    </div>
  );
}

/* ================= DASHBOARD ================= */
function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const PIE_COLORS = ["#2b3e2b", "#486343", "#5d7b55", "#7f9a75", "#a7bc9e", "#c29b3c", "#d4af5a", "#e2c578"];

export function AdminDashboard() {
  const { db, can, user } = useStore();
  const [monthCursor] = useState(() => new Date());

  const approved = db.members.filter(m => m.status === "approved");
  const pending = db.members.filter(m => m.status === "pending");
  const upcomingPrograms = db.programs.filter(p => p.status === "published" && daysFromNow(p.startDate) >= 0);
  const upcomingEvents = db.events.filter(e => e.status === "published" && daysFromNow(e.date) >= 0);
  const publishedNews = db.news.filter(n => n.status === "published");
  const galleryCount = db.albums.reduce((s, a) => s + a.images.length, 0);

  const growth = useMemo(() => {
    const months: { label: string; key: string }[] = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(monthCursor.getFullYear(), monthCursor.getMonth() - i, 1);
      months.push({ label: d.toLocaleDateString("en-GB", { month: "short" }), key: d.toISOString().slice(0, 7) });
    }
    let cum = db.members.filter(m => m.appliedAt.slice(0, 7) < months[0].key).length;
    return months.map(mo => {
      cum += db.members.filter(m => m.appliedAt.slice(0, 7) === mo.key).length;
      return { name: mo.label, members: cum, applications: db.members.filter(m => m.appliedAt.slice(0, 7) === mo.key).length };
    });
  }, [db.members, monthCursor]);

  const byRegion = useMemo(() => {
    const m = new Map<string, number>();
    approved.forEach(x => m.set(x.region, (m.get(x.region) ?? 0) + 1));
    return Array.from(m, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [approved]);

  const stats = [
    { label: "Total Members", value: db.members.length, icon: <Users size={18} />, to: "/admin/members", show: can("members") },
    { label: "Pending Applications", value: pending.length, icon: <UserCheck size={18} />, to: "/admin/applications", show: can("applications"), hot: pending.length > 0 },
    { label: "Approved Members", value: approved.length, icon: <CheckCircle2 size={18} />, to: "/admin/members", show: can("members") },
    { label: "Upcoming Programs", value: upcomingPrograms.length, icon: <FileText size={18} />, to: "/admin/programs", show: can("programs") },
    { label: "Upcoming Events", value: upcomingEvents.length, icon: <CalendarDays size={18} />, to: "/admin/events", show: can("events") },
    { label: "News Articles", value: publishedNews.length, icon: <Newspaper size={18} />, to: "/admin/news", show: can("news") },
    { label: "Gallery Images", value: galleryCount, icon: <Images size={18} />, to: "/admin/gallery", show: can("gallery") },
    { label: "Contact Messages", value: db.messages.filter(m => !m.read).length, icon: <MessageSquare size={18} />, to: "/admin/messages", show: can("messages"), suffix: "unread" },
  ].filter(s => s.show);

  const tooltipStyle = { background: "#20301f", border: "1px solid #c29b3c55", borderRadius: 6, color: "#f4f4ed", fontSize: 12 };

  return (
    <div>
      <PageHead title={`Fall in, ${user?.name.split(" ").pop() ?? "Officer"}`} sub={`Here is the state of the association on ${fmtDate(new Date().toISOString(), { weekday: "long", day: "numeric", month: "long", year: "numeric" })}.`} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.4 }}>
            <Link to={s.to} className={`block bg-[#fbfbf6] border rounded-lg p-5 h-full hover:shadow-lg hover:-translate-y-0.5 transition-all ${s.hot ? "border-gold-500" : "border-pine-900/10"}`}>
              <div className="flex items-center justify-between">
                <span className="text-pine-700">{s.icon}</span>
                {s.hot && <span className="w-2 h-2 rounded-full bg-gold-500 pulse-dot" />}
              </div>
              <div className="font-display font-bold text-4xl text-pine-900 mt-3 tabular-nums">{s.value}</div>
              <div className="text-[0.64rem] font-bold uppercase tracking-[0.16em] text-inksoft mt-1">{s.label}{s.suffix ? ` (${s.suffix})` : ""}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mt-6">
        <div className="lg:col-span-2 bg-[#fbfbf6] border border-pine-900/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold uppercase text-xl text-pine-900 flex items-center gap-2"><TrendingUp size={18} className="text-gold-600" />Membership Growth</h3>
            <Pill tone="pine">Last 8 months</Pill>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growth} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#486343" stopOpacity={0.5} /><stop offset="100%" stopColor="#486343" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#55604f" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#55604f" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="members" stroke="#2b3e2b" strokeWidth={2.5} fill="url(#g1)" name="Cumulative members" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-[#fbfbf6] border border-pine-900/10 rounded-lg p-6">
          <h3 className="font-display font-bold uppercase text-xl text-pine-900 mb-4">Members by Region</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byRegion} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={3} strokeWidth={0}>
                  {byRegion.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
            {byRegion.slice(0, 6).map((r, i) => (
              <div key={r.name} className="flex items-center gap-2 text-[0.7rem] text-inksoft"><span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} /><span className="truncate">{r.name}</span><span className="ml-auto font-bold text-pine-800">{r.value}</span></div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mt-6">
        <div className="bg-[#fbfbf6] border border-pine-900/10 rounded-lg p-6">
          <h3 className="font-display font-bold uppercase text-xl text-pine-900 mb-4">Applications Over Time</h3>
          <div className="h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growth} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#55604f" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#55604f" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#c29b3c22" }} />
                <Bar dataKey="applications" fill="#c29b3c" radius={[3, 3, 0, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-[#fbfbf6] border border-pine-900/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold uppercase text-xl text-pine-900">Recent Activity</h3>
            {can("logs") && <Link to="/admin/activity-logs" className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-gold-600 hover:text-pine-800 flex items-center gap-1">All logs <ChevronDown size={12} className="-rotate-90" /></Link>}
          </div>
          <div className="space-y-1">
            {db.activity.slice(0, 6).map(a => (
              <div key={a.id} className="flex gap-3 py-2.5 border-b border-pine-900/6 last:border-0">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-2 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[0.82rem] text-pine-900 leading-snug">{a.text}</p>
                  <p className="text-[0.66rem] text-inksoft mt-0.5">{a.user} • {timeAgo(a.at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-pine-950 text-paper rounded-lg p-6 relative overflow-hidden">
          <div className="absolute inset-0 topo-bg opacity-50" aria-hidden="true" />
          <div className="relative">
            <h3 className="font-display font-bold uppercase text-xl text-gold-300 mb-4">Next On The Calendar</h3>
            {upcomingEvents.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4).map(e => (
              <Link key={e.id} to="/admin/events" className="flex items-center gap-3.5 py-2.5 border-b border-paper/10 last:border-0 group">
                <span className="bg-gold-500 text-pine-950 font-display font-bold text-sm w-11 h-11 rounded flex flex-col items-center justify-center leading-none flex-shrink-0">
                  {new Date(e.date + "T12:00:00").getDate()}
                  <span className="text-[0.5rem] uppercase tracking-wider mt-0.5">{new Date(e.date + "T12:00:00").toLocaleDateString("en-GB", { month: "short" })}</span>
                </span>
                <span className="text-sm text-pine-100/85 group-hover:text-gold-300 transition-colors leading-snug">{e.title}</span>
              </Link>
            ))}
            {upcomingEvents.length === 0 && <p className="text-pine-100/60 text-sm py-6">No upcoming events scheduled.</p>}
            <div className="mt-5 grid grid-cols-2 gap-2">
              {can("programs") && <Link to="/admin/programs" className="text-center bg-paper/10 hover:bg-gold-500 hover:text-pine-950 text-paper text-[0.68rem] font-bold uppercase tracking-[0.12em] py-2.5 rounded transition-colors">+ Program</Link>}
              {can("news") && <Link to="/admin/news" className="text-center bg-paper/10 hover:bg-gold-500 hover:text-pine-950 text-paper text-[0.68rem] font-bold uppercase tracking-[0.12em] py-2.5 rounded transition-colors">+ Article</Link>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= ACTIVITY LOGS ================= */
export function ActivityLogsPage() {
  const { db } = useStore();
  const [type, setType] = useState("all");
  const types = ["all", ...Array.from(new Set(db.activity.map(a => a.type)))];
  const list = type === "all" ? db.activity : db.activity.filter(a => a.type === type);
  return (
    <div>
      <PageHead title="Activity Logs" sub="The full audit trail of administrative actions on the platform." />
      <div className="flex gap-2 mb-6 flex-wrap">
        {types.map(t => (
          <button key={t} onClick={() => setType(t)} className={`px-4 py-2 rounded-[4px] text-[0.72rem] font-bold uppercase tracking-[0.12em] transition-all ${type === t ? "bg-pine-900 text-gold-300" : "bg-pine-100 text-pine-800 hover:bg-pine-200"}`}>{t}</button>
        ))}
      </div>
      <div className="bg-[#fbfbf6] border border-pine-900/10 rounded-lg overflow-hidden">
        {list.map((a, i) => (
          <div key={a.id} className={`flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5 ${i % 2 ? "bg-pine-50/60" : ""}`}>
            <Pill tone={a.type === "application" ? "gold" : a.type === "member" ? "green" : "pine"}>{a.type}</Pill>
            <span className="flex-1 min-w-[220px] text-[0.88rem] text-pine-900">{a.text}</span>
            <span className="text-[0.72rem] text-inksoft">{a.user}</span>
            <span className="text-[0.72rem] text-inksoft tabular-nums w-32 text-right">{fmtDate(a.at, { day: "numeric", month: "short" })} {new Date(a.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        ))}
        {list.length === 0 && <p className="p-10 text-center text-inksoft text-sm">No activity recorded for this filter.</p>}
      </div>
      <div className="mt-4 flex items-center gap-2 text-[0.75rem] text-inksoft"><Crest size={20} className="opacity-40" />Logs are retained for the most recent 200 actions.</div>
    </div>
  );
}

export { SmartImg };
