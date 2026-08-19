import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, CalendarDays, Clock, MapPin, Flag, Users, Award, HeartHandshake, ChevronLeft, ChevronRight } from "lucide-react";
import { useStore, fmtDate, daysFromNow, prefersReduced } from "../lib/store";
import { Reveal, SectionHead, Btn, SmartImg, Pill } from "../components/ui";

const VALUE_ICONS: Record<string, React.ReactNode> = {
  clock: <Clock size={22} />, flag: <Flag size={22} />, users: <Users size={22} />, heart: <HeartHandshake size={22} />, award: <Award size={22} />,
};

function useCountUp(target: number, start: boolean, dur = 1600) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (prefersReduced()) { setV(target); return; }
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, dur]);
  return v;
}

function StatBlock({ value, suffix, label, start }: { value: number; suffix?: string; label: string; start: boolean }) {
  const v = useCountUp(value, start);
  return (
    <div>
      <div className="font-display font-bold text-4xl sm:text-5xl text-gold-400 tabular-nums">{v.toLocaleString()}{suffix ?? ""}</div>
      <div className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-pine-100/70 mt-1.5">{label}</div>
    </div>
  );
}

export default function Home() {
  const { db } = useStore();
  const s = db.settings;
  const [statsOn, setStatsOn] = useState(false);
  const [tIdx, setTIdx] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsOn(true); }, { threshold: 0.3 });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  const upcomingEvents = useMemo(
    () => db.events.filter(e => e.status === "published" && daysFromNow(e.date) >= 0).sort((a, b) => a.date.localeCompare(b.date)),
    [db.events],
  );
  const featured = db.programs.filter(p => p.featured && p.status === "published").slice(0, 3);
  const latestNews = db.news.filter(n => n.status === "published").sort((a, b) => b.publishAt.localeCompare(a.publishAt)).slice(0, 3);

  useEffect(() => {
    if (s.testimonials.length < 2 || reduce) return;
    const t = setInterval(() => setTIdx(i => (i + 1) % s.testimonials.length), 6000);
    return () => clearInterval(t);
  }, [s.testimonials.length, reduce]);

  const heroLines = s.heroTitle.split(/(?<=\.)\s+/).filter(Boolean);
  const t = s.testimonials[tIdx % Math.max(1, s.testimonials.length)];

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="relative min-h-[92vh] flex flex-col bg-pine-950 text-paper overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <SmartImg src={s.heroImage} alt="" className="w-full h-full object-cover kenburns" />
          <div className="absolute inset-0 bg-gradient-to-r from-pine-950 via-pine-950/78 to-pine-950/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-pine-950/90 via-transparent to-pine-950/40" />
        </div>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4 text-gold-400/70" aria-hidden="true">
          <span className="w-px h-16 bg-gold-500/40" />
          <span className="text-[0.62rem] font-bold tracking-[0.5em] uppercase [writing-mode:vertical-rl]">Est. 2011 — Eight Regions</span>
          <span className="w-px h-16 bg-gold-500/40" />
        </div>

        <div className="relative flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-5 w-full py-24">
            <div className="max-w-3xl">
              <div className="mask-line"><span style={{ animationDelay: "0.1s" }}>
                <span className="inline-flex items-center gap-3 text-[0.7rem] font-bold tracking-[0.32em] uppercase text-gold-300">
                  <span className="h-px w-10 bg-gold-400" /> The National Cadets Association — Est. 2011
                </span>
              </span></div>
              <h1 className="font-display font-bold uppercase leading-[0.98] text-[2.9rem] sm:text-7xl lg:text-[5.2rem] mt-6 tracking-tight">
                {heroLines.map((line, i) => (
                  <span key={i} className="mask-line"><span style={{ animationDelay: `${0.22 + i * 0.14}s` }}>
                    {i === heroLines.length - 1 ? <span className="text-gold-400">{line}</span> : line}
                  </span></span>
                ))}
              </h1>
              <div className="mask-line mt-7"><span style={{ animationDelay: `${0.28 + heroLines.length * 0.14}s` }}>
                <p className="text-pine-100/85 text-[0.98rem] sm:text-lg leading-relaxed max-w-xl">{s.heroDescription}</p>
              </span></div>
              <div className="mask-line mt-9"><span style={{ animationDelay: `${0.4 + heroLines.length * 0.14}s` }}>
                <span className="flex flex-wrap gap-3.5">
                  <Btn variant="gold" size="lg" href={s.heroCtaPrimaryUrl}>{s.heroCtaPrimary} <ArrowRight size={16} /></Btn>
                  <Btn variant="outlineLight" size="lg" href={s.heroCtaSecondaryUrl}>{s.heroCtaSecondary}</Btn>
                </span>
              </span></div>
            </div>
          </div>
        </div>

        {/* bottom strip: stats + live ticker */}
        <div className="relative border-t border-paper/12 bg-pine-950/70 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-5 flex flex-col lg:flex-row">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 lg:w-[52%] lg:border-r lg:border-paper/12 lg:pr-10">
              {s.stats.slice(0, 4).map(st => (
                <div key={st.label}>
                  <div className="font-display font-bold text-2xl sm:text-[1.7rem] text-paper tabular-nums">{st.value.toLocaleString()}{st.suffix ?? ""}</div>
                  <div className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-gold-300/80 mt-0.5">{st.label}</div>
                </div>
              ))}
            </div>
            <div className="flex-1 flex items-center gap-3 py-4 overflow-hidden" aria-label="Upcoming events ticker">
              <span className="flex-shrink-0 bg-gold-500 text-pine-950 text-[0.62rem] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-[3px]">Up Next</span>
              <div className="overflow-hidden flex-1">
                <div className="ticker-track flex gap-10 whitespace-nowrap w-max">
                  {[...upcomingEvents, ...upcomingEvents].map((e, i) => (
                    <Link key={e.id + i} to={`/events/${e.id}`} className="text-sm text-pine-100/80 hover:text-gold-300 transition-colors">
                      <span className="text-gold-400 font-bold mr-2">{fmtDate(e.date, { day: "numeric", month: "short" })}</span>{e.title}
                    </Link>
                  ))}
                  {upcomingEvents.length === 0 && <span className="text-sm text-pine-100/50">No upcoming events on the calendar.</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHO WE ARE ============ */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-5 grid lg:grid-cols-[1fr_1.15fr] gap-14 items-center">
          <div className="relative">
            <Reveal>
              <div className="absolute -top-5 -left-5 w-40 h-40 border-2 border-gold-500 rounded-sm" aria-hidden="true" />
              <SmartImg src={db.albums[0]?.cover ?? s.heroImage} alt="Cadets at training" className="relative w-full aspect-[4/3] object-cover rounded-sm shadow-2xl" />
              <div className="absolute -bottom-6 -right-4 sm:-right-8 bg-pine-900 text-paper px-6 py-5 rounded-sm shadow-xl max-w-[240px]">
                <div className="font-display font-bold text-3xl text-gold-400">15<span className="text-lg">yrs</span></div>
                <div className="text-[0.65rem] uppercase tracking-[0.18em] font-bold text-pine-100/70 mt-1">Of unbroken cadet tradition</div>
              </div>
            </Reveal>
          </div>
          <div>
            <SectionHead kicker="Sec. 01 — Who We Are" title={s.aboutTitle} />
            <Reveal delay={0.1}>
              <p className="text-inksoft leading-relaxed mt-6">{s.aboutText}</p>
              <div className="flex flex-wrap gap-2 mt-6">
                {s.coreValues.map(v => (
                  <span key={v.title} className="flex items-center gap-2 border border-pine-800/20 bg-pine-50 text-pine-800 px-3.5 py-2 rounded-[4px] text-[0.72rem] font-bold uppercase tracking-[0.12em] hover:border-gold-500 hover:bg-gold-100 transition-colors">
                    <span className="text-gold-600">{VALUE_ICONS[v.icon] ?? <Flag size={14} />}</span>{v.title}
                  </span>
                ))}
              </div>
              <div className="mt-8"><Btn variant="pine" href="/about">More About PACOSA <ArrowRight size={15} /></Btn></div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ CORE VALUES LEDGER ============ */}
      <section className="bg-pine-900 text-paper py-24 relative overflow-hidden">
        <div className="absolute inset-0 grid-lines" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-5 grid lg:grid-cols-[0.9fr_1.4fr] gap-14">
          <div className="lg:sticky lg:top-28 self-start">
            <SectionHead light kicker="Sec. 02 — The Code We Keep" title="Five values. One standard." text="Every activity, parade and program is measured against the same five commitments every cadet makes on the square." />
            <div className="mt-8"><Btn variant="gold" href="/about">Our Mission & Vision</Btn></div>
          </div>
          <div>
            {s.coreValues.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.06}>
                <div className="group flex gap-6 py-7 border-b border-paper/12 hover:bg-paper/5 transition-colors px-3 -mx-3 rounded">
                  <span className="font-display font-bold text-gold-500/60 text-3xl w-12 flex-shrink-0 group-hover:text-gold-400 transition-colors">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-gold-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform">{VALUE_ICONS[v.icon] ?? <Flag size={22} />}</span>
                  <div>
                    <h3 className="font-display font-bold uppercase text-2xl tracking-wide group-hover:text-gold-300 transition-colors">{v.title}</h3>
                    <p className="text-pine-100/75 text-sm leading-relaxed mt-1.5 max-w-lg">{v.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED PROGRAMS ============ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHead kicker="Sec. 03 — On The Calendar" title="Featured Programs" text="Training, service and leadership — the national calendar for the season ahead." />
            <Reveal delay={0.15}><Btn variant="outline" href="/programs">All Programs <ArrowRight size={15} /></Btn></Reveal>
          </div>
          <div className="grid md:grid-cols-3 gap-7 mt-12">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <Link to={`/programs/${p.id}`} className="group block bg-[#fbfbf6] border border-pine-900/10 rounded-md overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                  <div className="relative overflow-hidden aspect-[16/10]">
                    <SmartImg src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3"><Pill tone="gold">{p.category}</Pill></div>
                    <div className="absolute bottom-0 left-0 bg-pine-950/90 text-paper px-4 py-2.5 flex items-center gap-2 text-sm">
                      <CalendarDays size={14} className="text-gold-400" /> {fmtDate(p.startDate)}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display font-bold uppercase text-2xl leading-tight text-pine-900 group-hover:text-gold-600 transition-colors">{p.title}</h3>
                    <p className="text-inksoft text-sm leading-relaxed mt-2.5 line-clamp-3">{p.description}</p>
                    <div className="flex items-center gap-2 text-[0.75rem] text-inksoft mt-4"><MapPin size={13} className="text-gold-600" />{p.location}</div>
                    <span className="inline-flex items-center gap-1.5 mt-5 text-[0.75rem] font-bold uppercase tracking-[0.16em] text-pine-800 group-hover:text-gold-600 transition-colors">Programme details <ArrowUpRight size={14} /></span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ UPCOMING EVENTS + TESTIMONIAL / STATS ============ */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-5 grid lg:grid-cols-[1.25fr_1fr] gap-10">
          <div className="bg-[#fbfbf6] border border-pine-900/10 rounded-md p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold uppercase text-3xl text-pine-900">Upcoming Events</h2>
              <Link to="/events" className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-gold-600 hover:text-pine-800 inline-flex items-center gap-1.5 transition-colors">Full calendar <ArrowRight size={13} /></Link>
            </div>
            <div className="divide-y divide-pine-900/8">
              {upcomingEvents.slice(0, 4).map(e => {
                const dt = new Date(e.date + "T12:00:00");
                return (
                  <Link key={e.id} to={`/events/${e.id}`} className="group flex items-center gap-5 py-4">
                    <div className="w-16 flex-shrink-0 text-center bg-pine-900 text-paper rounded-[4px] py-2 group-hover:bg-gold-500 group-hover:text-pine-950 transition-colors">
                      <div className="font-display font-bold text-2xl leading-none">{dt.getDate()}</div>
                      <div className="text-[0.6rem] font-bold uppercase tracking-[0.2em] mt-0.5">{dt.toLocaleDateString("en-GB", { month: "short" })}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-pine-900 group-hover:text-gold-700 transition-colors truncate">{e.title}</div>
                      <div className="text-[0.75rem] text-inksoft flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1"><Clock size={11} />{e.startTime}</span>
                        <span className="flex items-center gap-1 truncate"><MapPin size={11} />{e.location}</span>
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="text-pine-300 group-hover:text-gold-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
                  </Link>
                );
              })}
              {upcomingEvents.length === 0 && <p className="py-8 text-inksoft text-sm">No upcoming events — check the full calendar soon.</p>}
            </div>
          </div>

          <div ref={statsRef} className="bg-pine-950 text-paper rounded-md p-8 relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 topo-bg opacity-60" aria-hidden="true" />
            <div className="relative">
              <div className="text-[0.68rem] font-bold tracking-[0.3em] uppercase text-gold-300">The Association in Numbers</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-8 mt-8">
                {s.stats.map(st => <StatBlock key={st.label} value={st.value} suffix={st.suffix} label={st.label} start={statsOn} />)}
              </div>
            </div>
            {t && (
              <div className="relative mt-auto pt-10">
                <div className="border-l-2 border-gold-500 pl-5">
                  <motion.blockquote key={tIdx} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    className="text-pine-100/90 italic leading-relaxed text-[0.95rem]">“{t.quote}”</motion.blockquote>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gold-300 text-sm">{t.name}</div>
                      <div className="text-[0.68rem] uppercase tracking-[0.16em] text-pine-100/60">{t.role}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setTIdx(i => (i - 1 + s.testimonials.length) % s.testimonials.length)} aria-label="Previous testimonial" className="p-2 rounded border border-paper/20 hover:bg-paper/10"><ChevronLeft size={14} /></button>
                      <button onClick={() => setTIdx(i => (i + 1) % s.testimonials.length)} aria-label="Next testimonial" className="p-2 rounded border border-paper/20 hover:bg-paper/10"><ChevronRight size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ LATEST NEWS ============ */}
      <section className="py-24 bg-pine-50 border-y border-pine-900/8">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHead kicker="Sec. 04 — From The News Desk" title="Latest Dispatches" />
            <Reveal delay={0.15}><Btn variant="outline" href="/news">All News <ArrowRight size={15} /></Btn></Reveal>
          </div>
          <div className="grid md:grid-cols-3 gap-7 mt-12">
            {latestNews.map((n, i) => (
              <Reveal key={n.id} delay={i * 0.08}>
                <Link to={`/news/${n.id}`} className="group block">
                  <div className="overflow-hidden rounded-md aspect-[16/10]">
                    <SmartImg src={n.image} alt={n.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex items-center gap-3 mt-4 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-gold-600">
                    <span>{n.category}</span><span className="w-1 h-1 rounded-full bg-gold-500" /><span className="text-inksoft font-semibold normal-case tracking-normal">{fmtDate(n.publishAt)}</span>
                  </div>
                  <h3 className="font-display font-bold uppercase text-2xl leading-tight text-pine-900 mt-2 group-hover:text-gold-600 transition-colors">{n.title}</h3>
                  <p className="text-inksoft text-sm leading-relaxed mt-2 line-clamp-2">{n.excerpt}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ GALLERY STRIP ============ */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 flex flex-wrap items-end justify-between gap-6">
          <SectionHead kicker="Sec. 05 — The Archive" title="From The Albums" text="Parades, training grounds, service days — the association, frame by frame." />
          <Reveal delay={0.15}><Btn variant="outline" href="/gallery">Open Gallery <ArrowRight size={15} /></Btn></Reveal>
        </div>
        <div className="mt-12 flex gap-4 overflow-x-auto pb-4 px-5 max-w-7xl mx-auto" style={{ scrollbarWidth: "thin" }}>
          {db.albums.flatMap(a => a.images.map(im => ({ ...im, album: a.title }))).slice(0, 10).map((im, i) => (
            <Reveal key={im.id} delay={i * 0.04} className="flex-shrink-0">
              <Link to="/gallery" className="group block w-64">
                <div className="overflow-hidden rounded-md aspect-[4/5]">
                  <SmartImg src={im.url} alt={im.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-inksoft mt-2 group-hover:text-gold-600 transition-colors">{im.album}</div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ JOIN CTA ============ */}
      <section className="relative bg-pine-900 text-paper overflow-hidden">
        <div className="tape-strip h-2" aria-hidden="true" />
        <div className="absolute inset-0 grid-lines" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-5 py-20 grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
          <div>
            <div className="text-[0.7rem] font-bold tracking-[0.3em] uppercase text-gold-300">Fall In</div>
            <h2 className="font-display font-bold uppercase text-5xl sm:text-6xl leading-[1.02] mt-3">The square is open.<br /><span className="text-gold-400">Take your place in the ranks.</span></h2>
            <p className="text-pine-100/80 mt-5 max-w-xl leading-relaxed">Serving or former cadet — your training does not end at the school gate. Join 1,240+ members keeping the tradition alive in all eight regions.</p>
          </div>
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 lg:items-end">
            <Btn variant="gold" size="lg" href="/join">Join PACOSA <ArrowRight size={16} /></Btn>
            <Btn variant="outlineLight" size="lg" href="/support">Support The Mission</Btn>
          </div>
        </div>
        <div className="tape-strip h-2" aria-hidden="true" />
      </section>
    </div>
  );
}
