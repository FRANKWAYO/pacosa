import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Target, Eye, Linkedin, Instagram, Globe } from "lucide-react";
import { useStore } from "../lib/store";
import { Reveal, SectionHead, Btn, SmartImg, Monogram, Modal, Pill } from "../components/ui";
import type { Leader } from "../lib/types";

function PageHero({ kicker, title, text }: { kicker: string; title: string; text?: string }) {
  return (
    <section className="bg-pine-950 text-paper relative overflow-hidden">
      <div className="absolute inset-0 topo-bg opacity-50" aria-hidden="true" />
      <div className="tape-strip absolute top-0 inset-x-0 h-1.5" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-5 pt-20 pb-16">
        <div className="mask-line"><span style={{ animationDelay: "0.05s" }}>
          <span className="text-[0.7rem] font-bold tracking-[0.32em] uppercase text-gold-300">{kicker}</span>
        </span></div>
        <h1 className="mask-line font-display font-bold uppercase leading-[1.0] text-5xl sm:text-7xl mt-4 tracking-tight"><span style={{ animationDelay: "0.15s" }}>{title}</span></h1>
        {text && <p className="mask-line mt-5 max-w-2xl text-pine-100/80 leading-relaxed"><span style={{ animationDelay: "0.25s" }}>{text}</span></p>}
      </div>
    </section>
  );
}
export { PageHero };

export function AboutPage() {
  const { db } = useStore();
  const s = db.settings;
  return (
    <div>
      <PageHero kicker="File 01 — The Association" title="About PACOSA" text="Who we are, where we came from, and the standard we hold every member to." />

      {/* Who we are */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-5 grid lg:grid-cols-2 gap-14 items-center">
          <Reveal>
            <div className="relative">
              <div className="absolute -bottom-5 -right-5 w-44 h-44 border-2 border-gold-500 rounded-sm" aria-hidden="true" />
              <SmartImg src={db.videos.find(v => v.category === "Training")?.thumbnail ?? s.heroImage} alt="PACOSA members at training" className="relative w-full aspect-[4/3] object-cover rounded-sm shadow-xl" />
            </div>
          </Reveal>
          <div>
            <SectionHead kicker="Who We Are" title={s.aboutTitle} />
            <Reveal delay={0.1}>
              <p className="text-inksoft leading-relaxed mt-6">{s.aboutText}</p>
              <p className="text-inksoft leading-relaxed mt-4">The association is governed by an elected National Executive Council, administered by a professional secretariat, and delivered through chartered regional chapters — each with its own coordinator, training calendar and service corps.</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="py-20 bg-pine-900 text-paper relative overflow-hidden">
        <div className="absolute inset-0 grid-lines" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-5 grid md:grid-cols-2 gap-8">
          <Reveal>
            <div className="h-full border border-gold-500/40 bg-pine-950/60 rounded-md p-9 hover:border-gold-400 transition-colors">
              <Target size={26} className="text-gold-400" />
              <h2 className="font-display font-bold uppercase text-3xl mt-5">Our Mission</h2>
              <p className="text-pine-100/85 leading-relaxed mt-4">{s.mission}</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="h-full border border-gold-500/40 bg-pine-950/60 rounded-md p-9 md:translate-y-6 hover:border-gold-400 transition-colors">
              <Eye size={26} className="text-gold-400" />
              <h2 className="font-display font-bold uppercase text-3xl mt-5">Our Vision</h2>
              <p className="text-pine-100/85 leading-relaxed mt-4">{s.vision}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Objectives */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-5 grid lg:grid-cols-[0.9fr_1.3fr] gap-12">
          <SectionHead kicker="Our Objectives" title="What the association exists to do" />
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-5 content-start">
            {s.objectives.map((o, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="flex gap-3.5 items-start py-2">
                  <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-pine-800 text-gold-300 flex items-center justify-center"><Check size={13} /></span>
                  <p className="text-inksoft leading-relaxed text-[0.92rem]">{o}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* History timeline */}
      <section className="py-20 bg-pine-50 border-y border-pine-900/8">
        <div className="max-w-5xl mx-auto px-5">
          <SectionHead center kicker="Our History" title="Fifteen years on the square" text="From a bench on a parade ground to a national movement." />
          <div className="relative mt-14">
            <div className="absolute left-[19px] sm:left-1/2 sm:-translate-x-px top-0 bottom-0 w-0.5 bg-gold-500/50" aria-hidden="true" />
            {s.history.map((h, i) => (
              <Reveal key={h.year} delay={0.05} className={`relative flex sm:w-1/2 ${i % 2 === 0 ? "sm:pr-12" : "sm:ml-auto sm:pl-12"} pl-14 sm:pl-0 pb-10`}>
                <span className={`absolute top-1 w-10 h-10 rounded-full bg-pine-900 text-gold-300 border-2 border-gold-500 flex items-center justify-center font-display font-bold text-[0.68rem] ${i % 2 === 0 ? "left-0 sm:left-auto sm:-right-5" : "left-0 sm:-left-5"}`}>{h.year.slice(2)}</span>
                <div className="bg-[#fbfbf6] border border-pine-900/10 rounded-md p-6 shadow-sm w-full hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="font-display font-bold text-gold-600 text-lg">{h.year}</div>
                  <h3 className="font-display font-bold uppercase text-2xl text-pine-900 mt-0.5">{h.title}</h3>
                  <p className="text-inksoft text-sm leading-relaxed mt-2">{h.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Org structure */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-5">
          <SectionHead center kicker="Organizational Structure" title="How the association is organised" />
          <div className="mt-14 space-y-4">
            {[
              { t: "General Assembly", d: "All members in good standing — meets annually; elects the council and approves audited accounts.", w: "max-w-xl" },
              { t: "National Executive Council", d: "President, Vice President, General Secretary, Organising Secretary, Treasurer and PRO.", w: "max-w-2xl" },
              { t: "National Secretariat & Desks", d: "Training, Ceremonial, Community Service, Education, Sports, Welfare and Public Relations.", w: "max-w-3xl" },
              { t: "Regional Chapters", d: "Eight chartered chapters, each led by an elected Regional Coordinator and chapter executives.", w: "max-w-4xl" },
            ].map((o, i) => (
              <Reveal key={o.t} delay={i * 0.07} className="flex justify-center">
                <div className={`w-full ${o.w} bg-pine-900 text-paper rounded-md px-7 py-5 text-center relative hover:bg-pine-800 transition-colors`}>
                  <h3 className="font-display font-bold uppercase text-xl tracking-wide text-gold-300">{o.t}</h3>
                  <p className="text-pine-100/75 text-sm mt-1">{o.d}</p>
                  {i < 3 && <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-gold-500" aria-hidden="true">▼</span>}
                </div>
              </Reveal>
            ))}
          </div>
          <div className="text-center mt-12"><Btn variant="pine" href="/leadership">Meet The Leadership <ArrowRight size={15} /></Btn></div>
        </div>
      </section>
    </div>
  );
}

/* ================= LEADERSHIP ================= */
function LeaderCard({ l, onOpen, delay }: { l: Leader; onOpen: () => void; delay: number }) {
  return (
    <Reveal delay={delay}>
      <button onClick={onOpen} className="group w-full text-left bg-[#fbfbf6] border border-pine-900/10 rounded-md overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
        <div className="aspect-[4/3.4] overflow-hidden">
          {l.photo
            ? <SmartImg src={l.photo} alt={`${l.name} — ${l.position}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            : <Monogram name={l.name} size={999} className="w-full h-full" rankLines={l.order <= 2 ? 3 : 2} />}
        </div>
        <div className="p-5">
          <div className="text-[0.64rem] font-bold uppercase tracking-[0.18em] text-gold-600">{l.position}</div>
          <h3 className="font-display font-bold uppercase text-2xl text-pine-900 mt-1 group-hover:text-gold-600 transition-colors">{l.name}</h3>
          <p className="text-inksoft text-xs mt-2 line-clamp-2">{l.background}</p>
        </div>
      </button>
    </Reveal>
  );
}

export function LeadershipPage() {
  const { db } = useStore();
  const [sel, setSel] = useState<Leader | null>(null);
  const leaders = [...db.leaders].sort((a, b) => a.order - b.order);
  const socialIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("linkedin")) return <Linkedin size={13} />;
    if (l.includes("instagram")) return <Instagram size={13} />;
    return <Globe size={13} />;
  };
  return (
    <div>
      <PageHero kicker="File 02 — Command Team" title="Our Leadership" text="Elected by the General Assembly, accountable to every member. Meet the National Executive and Regional Coordinators." />
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {leaders.map((l, i) => <LeaderCard key={l.id} l={l} delay={(i % 4) * 0.07} onOpen={() => setSel(l)} />)}
          </div>
        </div>
      </section>
      <Modal open={!!sel} onClose={() => setSel(null)} title={sel?.position ?? ""}>
        {sel && (
          <div className="grid sm:grid-cols-[180px_1fr] gap-6">
            {sel.photo ? <SmartImg src={sel.photo} alt={sel.name} className="w-full h-52 object-cover rounded" /> : <Monogram name={sel.name} size={180} rankLines={sel.order <= 2 ? 3 : 2} className="rounded" />}
            <div>
              <h4 className="font-display font-bold uppercase text-3xl text-pine-900">{sel.name}</h4>
              <Pill tone="gold">{sel.position}</Pill>
              <p className="text-inksoft text-sm leading-relaxed mt-4">{sel.bio}</p>
              <p className="text-[0.78rem] text-pine-700 font-semibold mt-4 border-l-2 border-gold-500 pl-3">{sel.background}</p>
              {sel.socials.length > 0 && (
                <div className="flex gap-2 mt-5">
                  {sel.socials.map(sl => (
                    <a key={sl.label} href={sl.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 border border-pine-800/20 rounded px-3 py-2 text-[0.7rem] font-bold uppercase tracking-wider text-pine-800 hover:bg-pine-800 hover:text-paper transition-colors">
                      {socialIcon(sl.label)} {sl.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-5 text-center">
          <Link to="/join" className="inline-flex items-center gap-2 font-display font-bold uppercase text-2xl text-pine-800 hover:text-gold-600 transition-colors">
            Led by old cadets, for all cadets — join the ranks <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
