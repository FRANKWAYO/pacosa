import { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, Clock, MapPin, Users, ChevronLeft, ChevronRight, ExternalLink, CheckCircle2 } from "lucide-react";
import { useStore, fmtDate, daysFromNow } from "../lib/store";
import { Reveal, SectionHead, Btn, SmartImg, Pill, EmptyState } from "../components/ui";
import { PROGRAM_CATEGORIES, EVENT_CATEGORIES } from "../lib/types";
import type { Program, EventItem } from "../lib/types";
import { PageHero } from "./AboutLeadership";

/* ================= PROGRAMS ================= */
export function ProgramCard({ p, delay = 0 }: { p: Program; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <Link to={`/programs/${p.id}`} className="group block h-full bg-[#fbfbf6] border border-pine-900/10 rounded-md overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
        <div className="relative overflow-hidden aspect-[16/9]">
          <SmartImg src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-3 left-3 flex gap-2">
            <Pill tone="gold">{p.category}</Pill>
            {p.status === "completed" && <Pill tone="gray">Completed</Pill>}
          </div>
          {p.registrationOpen && p.status === "published" && (
            <div className="absolute bottom-3 right-3 bg-pine-950/90 text-gold-300 text-[0.62rem] font-bold uppercase tracking-[0.16em] px-2.5 py-1.5 rounded flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 pulse-dot" /> Registration open
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="text-[0.72rem] font-semibold text-inksoft flex items-center gap-2"><CalendarDays size={13} className="text-gold-600" />{fmtDate(p.startDate)}{p.endDate ? ` — ${fmtDate(p.endDate)}` : ""}</div>
          <h3 className="font-display font-bold uppercase text-2xl leading-tight text-pine-900 mt-2 group-hover:text-gold-600 transition-colors">{p.title}</h3>
          <p className="text-inksoft text-sm leading-relaxed mt-2.5 line-clamp-3">{p.description}</p>
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-pine-900/8">
            <span className="text-[0.75rem] text-inksoft flex items-center gap-1.5 truncate"><MapPin size={13} className="text-gold-600 flex-shrink-0" />{p.location}</span>
            <ArrowRight size={16} className="text-pine-300 group-hover:text-gold-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export function ProgramsPage() {
  const { db } = useStore();
  const [cat, setCat] = useState("All");
  const visible = db.programs.filter(p => p.status === "published" || p.status === "completed");
  const filtered = cat === "All" ? visible : visible.filter(p => p.category === cat);
  const cats = ["All", ...PROGRAM_CATEGORIES.filter(c => visible.some(p => p.category === c))];
  return (
    <div>
      <PageHero kicker="File 03 — The National Calendar" title="Programs & Activities" text="Training, ceremonies, service and development — every program run by the association, open to members in good standing." />
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex flex-wrap gap-2 mb-10" role="tablist" aria-label="Filter programs by category">
            {cats.map(c => (
              <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)}
                className={`px-4 py-2.5 rounded-[4px] text-[0.74rem] font-bold uppercase tracking-[0.1em] transition-all ${cat === c ? "bg-pine-900 text-gold-300 shadow" : "bg-pine-100 text-pine-800 hover:bg-pine-200"}`}>
                {c}
              </button>
            ))}
          </div>
          {filtered.length === 0
            ? <EmptyState title="No programs in this category" text="The training directorate updates the calendar each quarter — check back soon." />
            : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">{filtered.map((p, i) => <ProgramCard key={p.id} p={p} delay={(i % 3) * 0.06} />)}</div>}
        </div>
      </section>
    </div>
  );
}

export function ProgramDetail({ program }: { program?: Program }) {
  const { db } = useStore();
  const { id } = useParams();
  const p = program ?? db.programs.find(x => x.id === id);
  if (!p) return <NotFound title="Program not found" />;
  const upcoming = db.programs.filter(x => x.id !== p.id && x.status === "published").slice(0, 3);
  return (
    <div>
      <PageHero kicker={p.category} title={p.title} text={undefined} />
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-[1.5fr_1fr] gap-12">
          <div>
            <Reveal>
              <div className="overflow-hidden rounded-md aspect-[16/9] shadow-lg"><SmartImg src={p.image} alt={p.title} className="w-full h-full object-cover" /></div>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="font-display font-bold uppercase text-3xl text-pine-900 mt-10">Programme Brief</h2>
              <p className="text-inksoft leading-relaxed mt-4 text-[0.98rem]">{p.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {p.registrationOpen && p.status === "published"
                  ? (p.registrationUrl
                    ? <Btn variant="gold" href={p.registrationUrl}>Register Now <ExternalLink size={15} /></Btn>
                    : <Btn variant="gold" href="/join">Register via Your Regional Desk</Btn>)
                  : <Pill tone="gray">{p.status === "completed" ? "This program has concluded" : "Registration closed"}</Pill>}
                <Btn variant="outline" href="/programs">All Programs</Btn>
              </div>
            </Reveal>
          </div>
          <aside className="space-y-4 lg:pt-2">
            {[
              { icon: <CalendarDays size={16} />, k: "Date", v: `${fmtDate(p.startDate)}${p.endDate ? ` — ${fmtDate(p.endDate)}` : ""}` },
              { icon: <Clock size={16} />, k: "Time", v: p.time },
              { icon: <MapPin size={16} />, k: "Location", v: p.location },
              { icon: <Users size={16} />, k: "Organizer", v: p.organizer },
            ].map(r => (
              <Reveal key={r.k} delay={0.05}>
                <div className="flex items-start gap-4 bg-[#fbfbf6] border border-pine-900/10 rounded-md p-5 hover:border-gold-500/60 transition-colors">
                  <span className="text-gold-600 mt-0.5">{r.icon}</span>
                  <div>
                    <div className="text-[0.64rem] font-bold uppercase tracking-[0.2em] text-inksoft">{r.k}</div>
                    <div className="font-semibold text-pine-900 mt-0.5">{r.v}</div>
                  </div>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.1}>
              <div className="bg-pine-900 text-paper rounded-md p-6">
                <div className="text-[0.64rem] font-bold uppercase tracking-[0.2em] text-gold-300">Good to know</div>
                <ul className="mt-3 space-y-2 text-sm text-pine-100/85">
                  <li className="flex gap-2"><CheckCircle2 size={15} className="text-gold-400 mt-0.5 flex-shrink-0" />Open to members in good standing unless noted.</li>
                  <li className="flex gap-2"><CheckCircle2 size={15} className="text-gold-400 mt-0.5 flex-shrink-0" />Arrive 15 minutes early in the prescribed dress.</li>
                  <li className="flex gap-2"><CheckCircle2 size={15} className="text-gold-400 mt-0.5 flex-shrink-0" />Certificates are issued through the secretariat.</li>
                </ul>
              </div>
            </Reveal>
          </aside>
        </div>
        {upcoming.length > 0 && (
          <div className="max-w-6xl mx-auto px-5 mt-20">
            <SectionHead kicker="Also on the calendar" title="More Programs" />
            <div className="grid md:grid-cols-3 gap-7 mt-10">{upcoming.map((x, i) => <ProgramCard key={x.id} p={x} delay={i * 0.06} />)}</div>
          </div>
        )}
      </section>
    </div>
  );
}

/* ================= EVENTS ================= */
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function EventsPage() {
  const { db } = useStore();
  const navigate = useNavigate();
  const [view, setView] = useState<"month" | "week" | "list">("month");
  const [cursor, setCursor] = useState(() => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), 1); });
  const [weekStart, setWeekStart] = useState(() => { const t = new Date(); const d = new Date(t); d.setDate(t.getDate() - t.getDay()); return d; });
  const [showPast, setShowPast] = useState(false);

  const published = db.events.filter(e => e.status === "published");
  const byDate = useMemo(() => {
    const m = new Map<string, EventItem[]>();
    published.forEach(e => { const arr = m.get(e.date) ?? []; arr.push(e); m.set(e.date, arr); });
    return m;
  }, [published]);

  const monthCells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first); start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  }, [cursor]);

  const toKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const todayKey = toKey(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d; });

  const upcoming = published.filter(e => daysFromNow(e.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));
  const past = published.filter(e => daysFromNow(e.date) < 0).sort((a, b) => b.date.localeCompare(a.date));

  const viewBtn = (v: "month" | "week" | "list") => (
    <button onClick={() => setView(v)} aria-pressed={view === v}
      className={`px-5 py-2.5 rounded-[4px] text-[0.74rem] font-bold uppercase tracking-[0.14em] transition-all ${view === v ? "bg-pine-900 text-gold-300 shadow" : "bg-pine-100 text-pine-800 hover:bg-pine-200"}`}>{v}</button>
  );

  return (
    <div>
      <PageHero kicker="File 04 — Order Of The Day" title="Events Calendar" text="Every parade, sitting, clean-up and competition on the national calendar. Click any event for the full brief." />
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex gap-2" role="tablist" aria-label="Calendar view">{viewBtn("month")}{viewBtn("week")}{viewBtn("list")}</div>
            {view !== "list" && (
              <div className="flex items-center gap-3">
                <button onClick={() => view === "month" ? setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1)) : setWeekStart(w => { const d = new Date(w); d.setDate(d.getDate() - 7); return d; })} aria-label="Previous" className="p-2.5 rounded border border-pine-800/25 hover:bg-pine-800 hover:text-paper transition-colors"><ChevronLeft size={16} /></button>
                <span className="font-display font-bold uppercase text-2xl text-pine-900 min-w-[180px] text-center tracking-wide">
                  {view === "month" ? cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : `${weekDays[0].getDate()} ${weekDays[0].toLocaleDateString("en-GB", { month: "short" })} — ${weekDays[6].getDate()} ${weekDays[6].toLocaleDateString("en-GB", { month: "short" })}`}
                </span>
                <button onClick={() => view === "month" ? setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)) : setWeekStart(w => { const d = new Date(w); d.setDate(d.getDate() + 7); return d; })} aria-label="Next" className="p-2.5 rounded border border-pine-800/25 hover:bg-pine-800 hover:text-paper transition-colors"><ChevronRight size={16} /></button>
              </div>
            )}
          </div>

          {view === "month" && (
            <div className="bg-[#fbfbf6] border border-pine-900/10 rounded-md overflow-hidden shadow-sm">
              <div className="grid grid-cols-7 bg-pine-900 text-gold-300 text-[0.66rem] font-bold uppercase tracking-[0.2em]">
                {WD.map(w => <div key={w} className="py-3 text-center">{w}</div>)}
              </div>
              <div className="grid grid-cols-7">
                {monthCells.map((d, i) => {
                  const key = toKey(d);
                  const evts = byDate.get(key) ?? [];
                  const inMonth = d.getMonth() === cursor.getMonth();
                  return (
                    <div key={i} className={`min-h-[92px] sm:min-h-[110px] border-b border-r border-pine-900/6 p-1.5 sm:p-2 ${inMonth ? "bg-transparent" : "bg-pine-900/[0.04]"} ${key === todayKey ? "bg-gold-100/60" : ""}`}>
                      <div className={`text-[0.72rem] font-bold ${key === todayKey ? "text-gold-700" : inMonth ? "text-pine-800" : "text-pine-300"}`}>{d.getDate()}</div>
                      <div className="mt-1 space-y-1">
                        {evts.slice(0, 2).map(e => (
                          <Link key={e.id} to={`/events/${e.id}`} className="block bg-pine-800 text-paper hover:bg-gold-500 hover:text-pine-950 text-[0.64rem] font-semibold px-1.5 py-1 rounded truncate transition-colors">{e.title}</Link>
                        ))}
                        {evts.length > 2 && <Link to={`/events/${evts[2].id}`} className="block text-[0.64rem] font-bold text-gold-600 hover:text-pine-800">+{evts.length - 2} more</Link>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === "week" && (
            <div className="grid md:grid-cols-7 gap-3">
              {weekDays.map(d => {
                const key = toKey(d);
                const evts = byDate.get(key) ?? [];
                return (
                  <div key={key} className={`rounded-md border p-3 min-h-[150px] ${key === todayKey ? "border-gold-500 bg-gold-100/40" : "border-pine-900/10 bg-[#fbfbf6]"}`}>
                    <div className="text-[0.64rem] font-bold uppercase tracking-[0.16em] text-inksoft">{d.toLocaleDateString("en-GB", { weekday: "short" })}</div>
                    <div className="font-display font-bold text-2xl text-pine-900">{d.getDate()}</div>
                    <div className="mt-2 space-y-2">
                      {evts.map(e => (
                        <Link key={e.id} to={`/events/${e.id}`} className="block bg-pine-800 hover:bg-gold-500 text-paper hover:text-pine-950 text-[0.7rem] font-semibold px-2 py-2 rounded transition-colors">
                          <span className="text-gold-300">{e.startTime}</span> {e.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === "list" && (
            <div className="space-y-3">
              <h3 className="font-display font-bold uppercase text-2xl text-pine-900">Upcoming</h3>
              {upcoming.map(e => <EventRow key={e.id} e={e} onOpen={() => navigate(`/events/${e.id}`)} />)}
              {upcoming.length === 0 && <p className="text-inksoft text-sm py-4">No upcoming events.</p>}
              <button onClick={() => setShowPast(v => !v)} className="font-display font-bold uppercase text-2xl text-pine-900 hover:text-gold-600 transition-colors pt-4 inline-flex items-center gap-3">
                Past events {showPast ? "▲" : "▼"}
              </button>
              {showPast && past.map(e => <EventRow key={e.id} e={e} past onOpen={() => navigate(`/events/${e.id}`)} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function EventRow({ e, past = false, onOpen }: { e: EventItem; past?: boolean; onOpen: () => void }) {
  const dt = new Date(e.date + "T12:00:00");
  return (
    <button onClick={onOpen} className={`group w-full text-left flex items-center gap-5 bg-[#fbfbf6] border border-pine-900/10 rounded-md p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all ${past ? "opacity-75" : ""}`}>
      <div className={`w-16 flex-shrink-0 text-center rounded-[4px] py-2.5 transition-colors ${past ? "bg-pine-200 text-pine-700" : "bg-pine-900 text-paper group-hover:bg-gold-500 group-hover:text-pine-950"}`}>
        <div className="font-display font-bold text-2xl leading-none">{dt.getDate()}</div>
        <div className="text-[0.6rem] font-bold uppercase tracking-[0.2em] mt-0.5">{dt.toLocaleDateString("en-GB", { month: "short" })}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-pine-900 truncate">{e.title}</div>
        <div className="text-[0.75rem] text-inksoft flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
          <span className="flex items-center gap-1"><Clock size={11} />{e.startTime}{e.endTime ? `–${e.endTime}` : ""}</span>
          <span className="flex items-center gap-1"><MapPin size={11} />{e.location}</span>
        </div>
      </div>
      <Pill tone={past ? "gray" : "pine"}>{e.category}</Pill>
      <ArrowRight size={16} className="text-pine-300 group-hover:text-gold-600 group-hover:translate-x-1 transition-all hidden sm:block" />
    </button>
  );
}

export function EventDetail({ event }: { event?: EventItem }) {
  const { db } = useStore();
  const { id } = useParams();
  const e = event ?? db.events.find(x => x.id === id);
  if (!e) return <NotFound title="Event not found" />;
  const dt = new Date(e.date + "T12:00:00");
  const more = db.events.filter(x => x.id !== e.id && x.status === "published").slice(0, 3);
  return (
    <div>
      <PageHero kicker={`Event — ${e.category}`} title={e.title} />
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-5 grid lg:grid-cols-[1fr_360px] gap-12">
          <div>
            <Reveal>
              {e.image && <div className="overflow-hidden rounded-md aspect-[16/9] shadow-lg"><SmartImg src={e.image} alt={e.title} className="w-full h-full object-cover" /></div>}
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="font-display font-bold uppercase text-3xl text-pine-900 mt-10">Event Brief</h2>
              <p className="text-inksoft leading-relaxed mt-4">{e.description}</p>
              <div className="mt-8"><Btn variant="outline" href="/events">Back to Calendar</Btn></div>
            </Reveal>
          </div>
          <aside className="space-y-4">
            <Reveal>
              <div className="bg-pine-900 text-paper rounded-md p-7 text-center">
                <div className="font-display font-bold text-6xl text-gold-400">{dt.getDate()}</div>
                <div className="font-display font-bold uppercase text-2xl tracking-wide mt-1">{dt.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</div>
                <div className="text-[0.7rem] uppercase tracking-[0.24em] text-pine-100/70 mt-1">{dt.toLocaleDateString("en-GB", { weekday: "long" })}</div>
              </div>
            </Reveal>
            {[
              { icon: <Clock size={16} />, k: "Time", v: `${e.startTime}${e.endTime ? ` — ${e.endTime}` : ""}` },
              { icon: <MapPin size={16} />, k: "Location", v: e.location },
              { icon: <Users size={16} />, k: "Category", v: e.category },
            ].map((r, i) => (
              <Reveal key={r.k} delay={0.05 + i * 0.04}>
                <div className="flex items-start gap-4 bg-[#fbfbf6] border border-pine-900/10 rounded-md p-5">
                  <span className="text-gold-600 mt-0.5">{r.icon}</span>
                  <div><div className="text-[0.64rem] font-bold uppercase tracking-[0.2em] text-inksoft">{r.k}</div><div className="font-semibold text-pine-900 mt-0.5">{r.v}</div></div>
                </div>
              </Reveal>
            ))}
          </aside>
        </div>
        {more.length > 0 && (
          <div className="max-w-5xl mx-auto px-5 mt-20">
            <SectionHead kicker="More on the calendar" title="Other Events" />
            <div className="mt-8 space-y-3">{more.map(x => <EventRow key={x.id} e={x} past={daysFromNow(x.date) < 0} onOpen={() => { window.location.hash = `#/events/${x.id}`; }} />)}</div>
          </div>
        )}
      </section>
    </div>
  );
}

export function NotFound({ title = "Page not found" }: { title?: string }) {
  return (
    <div className="max-w-3xl mx-auto px-5 py-32 text-center">
      <div className="font-display font-bold text-8xl text-pine-200">404</div>
      <h1 className="font-display font-bold uppercase text-4xl text-pine-900 mt-2">{title}</h1>
      <p className="text-inksoft mt-3">The page you marched toward does not exist. Fall back to familiar ground.</p>
      <div className="mt-8 flex justify-center gap-3"><Btn variant="pine" href="/">Back Home</Btn><Btn variant="outline" href="/contact">Contact Us</Btn></div>
    </div>
  );
}

export { EVENT_CATEGORIES };
