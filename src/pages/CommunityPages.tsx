import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, ArrowLeft, Check, Mail, Phone, MapPin, Clock, Search, BadgeCheck,
  FileCheck2, Send, Copy, Users, ChevronDown, Landmark, ShieldCheck, Flag,
  Smartphone, Receipt, HeartHandshake,
} from "lucide-react";
import { useStore, uid, nextRefNo } from "../lib/store";
import { Reveal, Btn, Pill, Monogram, Field, SectionHead } from "../components/ui";
import { PageHero } from "./AboutLeadership";
import { REGIONS, RANKS } from "../lib/types";
import type { Member } from "../lib/types";

/* ============================================================
   JOIN — multi-step membership application
============================================================ */
type FormState = {
  fullName: string; dob: string; gender: string; phone: string; email: string;
  location: string; region: string; cadetUnit: string; rank: string;
  yearJoined: string; yearCompleted: string; occupation: string;
  emergencyContact: string; bio: string;
};
const EMPTY: FormState = {
  fullName: "", dob: "", gender: "", phone: "", email: "", location: "", region: "",
  cadetUnit: "", rank: "", yearJoined: "", yearCompleted: "", occupation: "",
  emergencyContact: "", bio: "",
};
const STEPS = ["Personal Particulars", "Cadet Record", "Review & Attest"];
const YEARS = Array.from({ length: 46 }, (_, i) => String(2026 - i));

export function JoinPage() {
  const { db, update, toast, logActivity } = useStore();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [f, setF] = useState<FormState>(EMPTY);
  const [doneRef, setDoneRef] = useState<string | null>(null);
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF(p => ({ ...p, [k]: e.target.value }));

  const errors = useMemo(() => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (step === 0) {
      if (f.fullName.trim().length < 3) e.fullName = "Enter your full name as it appears on your records.";
      if (!f.dob) e.dob = "Date of birth is required.";
      if (!f.gender) e.gender = "Select an option.";
      if (f.phone.trim().length < 9) e.phone = "Enter a valid phone number.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid email address.";
      if (!f.location.trim()) e.location = "Town / city is required.";
      if (!f.region) e.region = "Select your region.";
    }
    if (step === 1) {
      if (!f.cadetUnit.trim()) e.cadetUnit = "Name of your cadet unit is required.";
      if (!f.rank) e.rank = "Select your highest rank.";
      if (!f.yearJoined) e.yearJoined = "Year enrolled is required.";
      if (f.emergencyContact.trim().length < 5) e.emergencyContact = "Name and phone of an emergency contact.";
    }
    return e;
  }, [f, step]);

  const next = () => {
    if (Object.keys(errors).length) { toast("Please complete the highlighted fields.", "error"); return; }
    setDir(1); setStep(s => s + 1);
  };
  const back = () => { setDir(-1); setStep(s => Math.max(0, s - 1)); };

  const submit = () => {
    const ref = nextRefNo(db);
    const member: Member = {
      id: uid("m"), refNo: ref, ...f, fullName: f.fullName.trim(), photo: "",
      status: "pending", appliedAt: new Date().toISOString(), adminNote: "",
    };
    update(d => ({ ...d, members: [...d.members, member] }));
    logActivity(`New membership application received — ${member.fullName} (${member.region})`, "application");
    if (db.settings.smtp.enabled) logActivity(`Email notification sent to administrators (${db.settings.smtp.notifyEmails})`, "email");
    toast("Application received — welcome to the square.");
    setDoneRef(ref);
    window.scrollTo(0, 0);
  };

  const copyRef = async () => {
    if (!doneRef) return;
    try { await navigator.clipboard.writeText(doneRef); toast("Reference number copied."); }
    catch { toast("Could not copy — note it down manually.", "error"); }
  };

  if (doneRef) {
    return (
      <div>
        <PageHero kicker="Application Received" title="You've fallen in" />
        <section className="py-20">
          <div className="max-w-2xl mx-auto px-5 text-center">
            <Reveal>
              <span className="inline-flex w-20 h-20 rounded-full bg-pine-900 text-gold-400 items-center justify-center shadow-xl"><BadgeCheck size={38} /></span>
              <h2 className="font-display font-bold uppercase text-4xl text-pine-900 mt-6">Application Logged</h2>
              <p className="text-inksoft leading-relaxed mt-4">
                Your particulars are with the Membership Desk and the administrators have been notified. You will
                receive a decision by email once your cadet record is verified — usually within seven working days.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-8 bg-pine-950 text-paper rounded-md p-7 border border-gold-500/40 relative overflow-hidden">
                <div className="absolute inset-0 topo-bg opacity-60" aria-hidden="true" />
                <div className="relative">
                  <div className="text-[0.66rem] font-bold uppercase tracking-[0.28em] text-gold-300">Your Reference Number</div>
                  <div className="font-display font-bold text-4xl text-gold-400 tracking-wide mt-2 tabular-nums">{doneRef}</div>
                  <button onClick={copyRef} className="mt-4 inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-paper/80 hover:text-gold-300 transition-colors">
                    <Copy size={13} /> Copy reference
                  </button>
                </div>
              </div>
              <p className="text-[0.78rem] text-inksoft mt-5">Quote this number in every enquiry about your application. Approved members appear in the public directory.</p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="flex flex-wrap justify-center gap-3 mt-9">
                <Btn variant="pine" href="#/members">Browse the Directory <ArrowRight size={15} /></Btn>
                <Btn variant="outline" href="#/">Back Home</Btn>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <PageHero kicker="File 08 — Enlistment" title="Join PACOSA" text="Open to serving and former cadets of chartered corps. Three short steps — the Membership Desk reviews every application personally." />
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-[300px_1fr] gap-10">
          {/* left rail */}
          <aside className="space-y-6 lg:sticky lg:top-32 self-start">
            <div>
              <div className="text-[0.66rem] font-bold uppercase tracking-[0.24em] text-gold-600 mb-4">Enlistment Progress</div>
              {STEPS.map((s, i) => (
                <div key={s} className="flex gap-3.5 pb-5 last:pb-0">
                  <div className="flex flex-col items-center">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm border-2 transition-colors ${i < step ? "bg-pine-800 border-pine-800 text-gold-300" : i === step ? "bg-gold-500 border-gold-500 text-pine-950" : "border-pine-300 text-pine-400"}`}>
                      {i < step ? <Check size={14} /> : i + 1}
                    </span>
                    {i < STEPS.length - 1 && <span className={`w-0.5 flex-1 mt-1.5 ${i < step ? "bg-pine-800" : "bg-pine-200"}`} />}
                  </div>
                  <div className="pt-1.5">
                    <div className={`font-bold text-[0.82rem] uppercase tracking-wide ${i === step ? "text-pine-900" : i < step ? "text-pine-700" : "text-pine-400"}`}>{s}</div>
                    <div className="text-[0.7rem] text-inksoft mt-0.5">{i === 0 ? "Who you are" : i === 1 ? "Your training record" : "Check and submit"}</div>
                  </div>
                </div>
              ))}
            </div>
            <Reveal delay={0.1}>
              <div className="bg-pine-900 text-paper rounded-md p-6">
                <div className="text-[0.64rem] font-bold uppercase tracking-[0.22em] text-gold-300">Before you start</div>
                <ul className="mt-3 space-y-2.5 text-[0.82rem] text-pine-100/85">
                  <li className="flex gap-2"><Check size={14} className="text-gold-400 mt-0.5 flex-shrink-0" />Your cadet unit and years of service</li>
                  <li className="flex gap-2"><Check size={14} className="text-gold-400 mt-0.5 flex-shrink-0" />Highest rank attained</li>
                  <li className="flex gap-2"><Check size={14} className="text-gold-400 mt-0.5 flex-shrink-0" />An emergency contact</li>
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="bg-[#fbfbf6] border border-pine-900/10 rounded-md p-6">
                <div className="text-[0.64rem] font-bold uppercase tracking-[0.22em] text-inksoft">What membership brings</div>
                <ul className="mt-3 space-y-2.5 text-[0.82rem] text-inksoft">
                  {["Access to all national training programs", "Voting rights at the General Assembly", "Eligibility for the leadership pipeline", "Chapter network in all eight regions"].map(x => (
                    <li key={x} className="flex gap-2"><Check size={14} className="text-gold-600 mt-0.5 flex-shrink-0" />{x}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </aside>

          {/* form card */}
          <div className="bg-[#fbfbf6] border border-pine-900/10 rounded-md shadow-sm p-7 sm:p-10 overflow-hidden">
            <div className="h-1 bg-pine-200 rounded-full mb-8 overflow-hidden">
              <motion.div className="h-full bg-gold-500" animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ duration: 0.45, ease: "easeOut" }} />
            </div>
            <div key={step}>
              <motion.div initial={{ opacity: 0, x: dir * 36 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                <h2 className="font-display font-bold uppercase text-3xl text-pine-900">{STEPS[step]}</h2>
                <p className="text-inksoft text-sm mt-1.5">{step === 0 ? "Particulars as recorded on your national ID." : step === 1 ? "The corps you trained with and the rank you earned." : "Read it back like an oath — then sign on."}</p>

                {step === 0 && (
                  <div className="grid sm:grid-cols-2 gap-5 mt-8">
                    <div className="sm:col-span-2"><Field label="Full name *"><input className="field" value={f.fullName} onChange={set("fullName")} placeholder="e.g. Kwame Mensah Boateng" /></Field>{errors.fullName && <Err t={errors.fullName} />}</div>
                    <div><Field label="Date of birth *"><input type="date" className="field" value={f.dob} max="2010-12-31" onChange={set("dob")} /></Field>{errors.dob && <Err t={errors.dob} />}</div>
                    <div><Field label="Gender *">
                      <select className="field" value={f.gender} onChange={set("gender")}>
                        <option value="">Select…</option><option>Male</option><option>Female</option>
                      </select></Field>{errors.gender && <Err t={errors.gender} />}</div>
                    <div><Field label="Phone *"><input className="field" value={f.phone} onChange={set("phone")} placeholder="+233 24 000 0000" /></Field>{errors.phone && <Err t={errors.phone} />}</div>
                    <div><Field label="Email *"><input type="email" className="field" value={f.email} onChange={set("email")} placeholder="you@mail.com" /></Field>{errors.email && <Err t={errors.email} />}</div>
                    <div><Field label="Town / City *"><input className="field" value={f.location} onChange={set("location")} placeholder="e.g. Kumasi" /></Field>{errors.location && <Err t={errors.location} />}</div>
                    <div><Field label="Region *">
                      <select className="field" value={f.region} onChange={set("region")}>
                        <option value="">Select region…</option>
                        {REGIONS.map(r => <option key={r}>{r}</option>)}
                      </select></Field>{errors.region && <Err t={errors.region} />}</div>
                  </div>
                )}

                {step === 1 && (
                  <div className="grid sm:grid-cols-2 gap-5 mt-8">
                    <div className="sm:col-span-2"><Field label="Cadet unit / corps *"><input className="field" value={f.cadetUnit} onChange={set("cadetUnit")} placeholder="e.g. Prempeh College Cadet Corps" /></Field>{errors.cadetUnit && <Err t={errors.cadetUnit} />}</div>
                    <div><Field label="Highest rank *">
                      <select className="field" value={f.rank} onChange={set("rank")}>
                        <option value="">Select rank…</option>
                        {RANKS.map(r => <option key={r}>{r}</option>)}
                      </select></Field>{errors.rank && <Err t={errors.rank} />}</div>
                    <Field label="Occupation"><input className="field" value={f.occupation} onChange={set("occupation")} placeholder="e.g. Teacher" /></Field>
                    <div><Field label="Year enrolled *">
                      <select className="field" value={f.yearJoined} onChange={set("yearJoined")}>
                        <option value="">Year…</option>{YEARS.map(y => <option key={y}>{y}</option>)}
                      </select></Field>{errors.yearJoined && <Err t={errors.yearJoined} />}</div>
                    <Field label="Year completed" hint="Leave blank if still serving.">
                      <select className="field" value={f.yearCompleted} onChange={set("yearCompleted")}>
                        <option value="">Year…</option>{YEARS.map(y => <option key={y}>{y}</option>)}
                      </select>
                    </Field>
                    <div className="sm:col-span-2"><Field label="Emergency contact (name — phone) *"><input className="field" value={f.emergencyContact} onChange={set("emergencyContact")} placeholder="Mrs. Ama Boateng — +233 20 000 0000" /></Field>{errors.emergencyContact && <Err t={errors.emergencyContact} />}</div>
                    <div className="sm:col-span-2">
                      <Field label="A few lines about you" hint="What drew you to the corps? What do you want to give back?">
                        <textarea className="field" rows={4} value={f.bio} onChange={set("bio")} placeholder="Former parade sergeant with a passion for mentoring…" />
                      </Field>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="mt-8">
                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                      <ReviewRow k="Full name" v={f.fullName} /><ReviewRow k="Date of birth" v={f.dob} />
                      <ReviewRow k="Gender" v={f.gender} /><ReviewRow k="Phone" v={f.phone} />
                      <ReviewRow k="Email" v={f.email} /><ReviewRow k="Location" v={`${f.location}, ${f.region}`} />
                      <ReviewRow k="Cadet unit" v={f.cadetUnit} /><ReviewRow k="Rank" v={f.rank} />
                      <ReviewRow k="Years of service" v={`${f.yearJoined}${f.yearCompleted ? ` — ${f.yearCompleted}` : " — serving"}`} />
                      <ReviewRow k="Occupation" v={f.occupation || "—"} />
                      <ReviewRow k="Emergency contact" v={f.emergencyContact} wide />
                      {f.bio && <ReviewRow k="About" v={f.bio} wide />}
                    </div>
                    <div className="mt-8 border-l-2 border-gold-500 bg-gold-100/50 rounded-r-md p-5 text-[0.85rem] text-pine-800 leading-relaxed">
                      <span className="font-bold uppercase tracking-wide text-[0.7rem] block mb-1">Attestation</span>
                      I declare that the particulars above are true and that I accept the constitution, code of conduct
                      and disciplinary procedures of PACOSA.
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            <div className="flex items-center justify-between mt-10 pt-6 border-t border-pine-900/10">
              <Btn variant="ghost" onClick={back} disabled={step === 0}><ArrowLeft size={15} /> Back</Btn>
              {step < 2
                ? <Btn variant="pine" onClick={next}>Continue <ArrowRight size={15} /></Btn>
                : <Btn variant="gold" size="lg" onClick={submit}><FileCheck2 size={16} /> Submit Application</Btn>}
            </div>
          </div>
        </div>

        {/* membership benefits */}
        <div className="max-w-6xl mx-auto px-5 mt-20">
          <SectionHead center kicker="Why Enlist" title="What membership carries" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {[
              { icon: <Flag size={20} />, t: "The National Network", d: "A chartered chapter and fellow old cadets in all eight regions — home ground wherever you land." },
              { icon: <Users size={20} />, t: "Training & Certification", d: "Priority seats on drill, first aid, disaster response and officer foundation courses." },
              { icon: <Landmark size={20} />, t: "Career Doors", d: "STEM mentorship, CV clinics and a referral network of members across industries." },
              { icon: <ShieldCheck size={20} />, t: "Welfare & Standing", d: "A member-first welfare desk and certificates of standing recognised by partner institutions." },
            ].map((b, i) => (
              <Reveal key={b.t} delay={i * 0.06}>
                <div className="group h-full bg-[#fbfbf6] border border-pine-900/10 rounded-md p-6 hover:shadow-lg hover:-translate-y-1 transition-all">
                  <span className="w-11 h-11 rounded bg-pine-900 text-gold-400 flex items-center justify-center group-hover:bg-gold-500 group-hover:text-pine-950 transition-colors">{b.icon}</span>
                  <h3 className="font-display font-bold uppercase text-xl text-pine-900 mt-4">{b.t}</h3>
                  <p className="text-inksoft text-sm leading-relaxed mt-2">{b.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Err({ t }: { t: string }) {
  return <span className="block text-[0.72rem] font-semibold text-red-700 mt-1">{t}</span>;
}
function ReviewRow({ k, v, wide }: { k: string; v: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <div className="text-[0.64rem] font-bold uppercase tracking-[0.18em] text-inksoft">{k}</div>
      <div className="font-semibold text-pine-900 mt-0.5">{v || "—"}</div>
    </div>
  );
}

/* ============================================================
   MEMBERS — public directory of approved members
============================================================ */
export function MembersPage() {
  const { db } = useStore();
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("All");
  const [rank, setRank] = useState("All");
  const [visible, setVisible] = useState(12);

  const approved = db.members.filter(m => m.status === "approved");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return approved.filter(m =>
      (region === "All" || m.region === region) &&
      (rank === "All" || m.rank === rank) &&
      (!t || m.fullName.toLowerCase().includes(t) || m.cadetUnit.toLowerCase().includes(t) || m.occupation.toLowerCase().includes(t)),
    );
  }, [approved, q, region, rank]);

  const ranks = Array.from(new Set(approved.map(m => m.rank)));

  return (
    <div>
      <PageHero kicker="File 09 — The Muster Roll" title="Members Directory" text={`${approved.length} approved members stand on the national roll. Sensitive details stay private with the secretariat.`} />
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5">
          <Reveal>
            <div className="bg-pine-900 text-paper rounded-md p-5 grid sm:grid-cols-[1.6fr_1fr_1fr] gap-3 items-center shadow-lg">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-400" />
                <input value={q} onChange={e => { setQ(e.target.value); setVisible(12); }} placeholder="Search name, cadet unit, occupation…" aria-label="Search members"
                  className="w-full bg-paper/10 border border-paper/20 rounded-[4px] pl-10 pr-4 py-2.5 text-sm text-paper placeholder:text-paper/35 focus:border-gold-400" />
              </div>
              <select value={region} onChange={e => { setRegion(e.target.value); setVisible(12); }} aria-label="Filter by region"
                className="bg-paper/10 border border-paper/20 rounded-[4px] px-3 py-2.5 text-sm text-paper [&>option]:text-ink focus:border-gold-400">
                <option value="All">All regions</option>
                {REGIONS.map(r => <option key={r} value={r} className="text-ink">{r}</option>)}
              </select>
              <select value={rank} onChange={e => { setRank(e.target.value); setVisible(12); }} aria-label="Filter by rank"
                className="bg-paper/10 border border-paper/20 rounded-[4px] px-3 py-2.5 text-sm text-paper [&>option]:text-ink focus:border-gold-400">
                <option value="All">All ranks</option>
                {ranks.map(r => <option key={r} value={r} className="text-ink">{r}</option>)}
              </select>
            </div>
          </Reveal>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-8 mb-6">
            <p className="text-[0.74rem] font-bold uppercase tracking-[0.18em] text-inksoft">{list.length} member{list.length === 1 ? "" : "s"} on parade</p>
            <div className="flex items-start gap-2.5 text-[0.74rem] text-inksoft bg-gold-100/60 border border-gold-500/40 rounded-md px-3.5 py-2">
              <ShieldCheck size={15} className="text-gold-600 mt-0.5 flex-shrink-0" />
              <span><strong className="text-pine-800">Privacy first:</strong> phone numbers, emails and dates of birth are never displayed publicly.</span>
            </div>
          </div>

          {list.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-pine-300 rounded-lg">
              <Users size={40} className="mx-auto text-pine-300" />
              <h3 className="font-display font-bold uppercase text-2xl text-pine-900 mt-4">No one answers that call</h3>
              <p className="text-inksoft text-sm mt-2">Try a different name, region or rank.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {list.slice(0, visible).map((m, i) => (
                <Reveal key={m.id} delay={(i % 4) * 0.05}>
                  <div className="group h-full bg-[#fbfbf6] border border-pine-900/10 rounded-md overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                    <div className="p-6 flex flex-col items-center text-center">
                      <div className="rounded-full overflow-hidden ring-2 ring-gold-500/60 ring-offset-2 ring-offset-[#fbfbf6] group-hover:ring-gold-500 transition-all">
                        {m.photo ? <img src={m.photo} alt={m.fullName} className="w-20 h-20 object-cover" /> : <Monogram name={m.fullName} size={80} rankLines={m.rank.includes("Warrant") || m.rank.includes("Officer") ? 3 : 2} className="rounded-full" />}
                      </div>
                      <h3 className="font-display font-bold uppercase text-xl text-pine-900 mt-4 leading-tight">{m.fullName}</h3>
                      <div className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-gold-600 mt-1">{m.rank}</div>
                      <p className="text-[0.78rem] text-inksoft mt-2 leading-relaxed line-clamp-2">{m.cadetUnit}</p>
                    </div>
                    <div className="border-t border-pine-900/8 px-6 py-3.5 flex items-center justify-between gap-2 text-[0.72rem]">
                      <span className="text-inksoft truncate">{m.occupation || "—"}</span>
                      <Pill tone="gold">{m.region}</Pill>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}

          {list.length > visible && (
            <div className="text-center mt-10">
              <Btn variant="outline" onClick={() => setVisible(v => v + 12)}>Show More Members <ChevronDown size={15} /></Btn>
            </div>
          )}

          <Reveal className="mt-16">
            <div className="bg-pine-950 text-paper rounded-md p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute inset-0 topo-bg opacity-60" aria-hidden="true" />
              <div className="relative">
                <h3 className="font-display font-bold uppercase text-3xl">Not on the roll yet?</h3>
                <p className="text-pine-100/75 text-sm mt-2 max-w-lg">If you served in a chartered corps, your place in the ranks is waiting. Applications are reviewed by the Membership Desk every week.</p>
              </div>
              <Btn variant="gold" href="#/join" className="relative flex-shrink-0">Join PACOSA <ArrowRight size={15} /></Btn>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   CONTACT — form + secretariat details
============================================================ */
export function ContactPage() {
  const { db, update, toast, logActivity } = useStore();
  const s = db.settings;
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", email: "", phone: "", subject: "", body: "" });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF(p => ({ ...p, [k]: e.target.value }));

  const submit = () => {
    if (f.name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) || f.subject.trim().length < 3 || f.body.trim().length < 10) {
      toast("Please complete all fields — the message needs at least 10 characters.", "error");
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      update(d => ({ ...d, messages: [{ id: uid("msg"), name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim(), subject: f.subject.trim(), body: f.body.trim(), createdAt: new Date().toISOString(), read: false }, ...d.messages] }));
      logActivity(`New contact message — ${f.subject.trim()} (${f.name.trim()})`, "message");
      toast("Message received — the secretariat replies within two working days.");
      setBusy(false); setSent(true);
    }, 700);
  };

  return (
    <div>
      <PageHero kicker="File 10 — Signal Office" title="Contact The Secretariat" text="Partnerships, press, membership queries or a word of advice — the signal office is open." />
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 grid lg:grid-cols-[1fr_380px] gap-10">
          <Reveal>
            <div className="bg-[#fbfbf6] border border-pine-900/10 rounded-md shadow-sm p-7 sm:p-9">
              {sent ? (
                <div className="text-center py-14">
                  <span className="inline-flex w-16 h-16 rounded-full bg-pine-900 text-gold-400 items-center justify-center"><Check size={30} /></span>
                  <h2 className="font-display font-bold uppercase text-3xl text-pine-900 mt-5">Message Logged</h2>
                  <p className="text-inksoft mt-3 max-w-md mx-auto">Your signal has reached the secretariat. Expect a reply at <span className="font-semibold text-pine-800">{f.email}</span> within two working days.</p>
                  <div className="flex justify-center gap-3 mt-7">
                    <Btn variant="pine" onClick={() => { setSent(false); setF({ name: "", email: "", phone: "", subject: "", body: "" }); }}>Send Another</Btn>
                    <Btn variant="outline" onClick={() => navigate("/")}>Back Home</Btn>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="font-display font-bold uppercase text-3xl text-pine-900">Send a Dispatch</h2>
                  <p className="text-inksoft text-sm mt-1.5">Messages land directly in the admin dashboard and are triaged by the General Secretary's desk.</p>
                  <div className="grid sm:grid-cols-2 gap-5 mt-7">
                    <Field label="Your name *"><input className="field" value={f.name} onChange={set("name")} placeholder="Full name" /></Field>
                    <Field label="Email *"><input type="email" className="field" value={f.email} onChange={set("email")} placeholder="you@mail.com" /></Field>
                    <Field label="Phone"><input className="field" value={f.phone} onChange={set("phone")} placeholder="+233 …" /></Field>
                    <Field label="Subject *">
                      <select className="field" value={f.subject} onChange={set("subject")}>
                        <option value="">Choose a subject…</option>
                        <option>Membership enquiry</option><option>Partnership proposal</option>
                        <option>Press & media</option><option>Training & programs</option>
                        <option>Donations & support</option><option>Other</option>
                      </select>
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Message *">
                        <textarea className="field" rows={6} value={f.body} onChange={set("body")} placeholder="Write your message — the more detail, the faster the reply." />
                      </Field>
                    </div>
                  </div>
                  <div className="mt-7 flex flex-wrap items-center gap-4">
                    <Btn variant="gold" size="lg" onClick={submit} disabled={busy}>{busy ? "Sending…" : <>Send Message <Send size={15} /></>}</Btn>
                    <span className="text-[0.72rem] text-inksoft">Replies within 2 working days.</span>
                  </div>
                </>
              )}
            </div>
          </Reveal>

          <div className="space-y-4">
            {[
              { icon: <MapPin size={18} />, k: "National Secretariat", v: s.address, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.mapQuery)}` },
              { icon: <Phone size={18} />, k: "Telephone", v: s.phone, href: `tel:${s.phone.replace(/\s/g, "")}` },
              { icon: <Mail size={18} />, k: "Email", v: s.email, href: `mailto:${s.email}` },
              { icon: <Clock size={18} />, k: "Office Hours", v: "Mon – Fri, 08:00 – 17:00 • Sat, 09:00 – 13:00" },
            ].map((c, i) => (
              <Reveal key={c.k} delay={0.05 + i * 0.05}>
                {c.href ? (
                  <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
                    className="group flex items-start gap-4 bg-[#fbfbf6] border border-pine-900/10 rounded-md p-5 hover:border-gold-500/70 hover:shadow-md transition-all">
                    <span className="w-11 h-11 rounded bg-pine-900 text-gold-400 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500 group-hover:text-pine-950 transition-colors">{c.icon}</span>
                    <span><span className="block text-[0.64rem] font-bold uppercase tracking-[0.2em] text-inksoft">{c.k}</span><span className="font-semibold text-pine-900 text-sm mt-0.5 block">{c.v}</span></span>
                  </a>
                ) : (
                  <div className="flex items-start gap-4 bg-[#fbfbf6] border border-pine-900/10 rounded-md p-5">
                    <span className="w-11 h-11 rounded bg-pine-900 text-gold-400 flex items-center justify-center flex-shrink-0">{c.icon}</span>
                    <span><span className="block text-[0.64rem] font-bold uppercase tracking-[0.2em] text-inksoft">{c.k}</span><span className="font-semibold text-pine-900 text-sm mt-0.5 block">{c.v}</span></span>
                  </div>
                )}
              </Reveal>
            ))}
            <Reveal delay={0.28}>
              <div className="bg-pine-950 text-paper rounded-md overflow-hidden">
                <iframe
                  title="Map to the National Secretariat"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(s.mapQuery)}&output=embed`}
                  className="w-full h-64 border-0 grayscale-[35%] contrast-[1.05]"
                  loading="lazy"
                />
                <div className="px-5 py-3.5 flex items-center justify-between gap-3">
                  <span className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-gold-300">Independence Avenue, Accra</span>
                  <a className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-paper/70 hover:text-gold-300 transition-colors whitespace-nowrap" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.mapQuery)}`}>Open Maps ↗</a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   SUPPORT — donations & giving
============================================================ */
const ALLOCATIONS = [
  { label: "Training kits & equipment", pct: 40, note: "Boots, uniforms, first-aid kits and field gear for intakes." },
  { label: "Service corps logistics", pct: 25, note: "Transport and materials for clean-ups and disaster response." },
  { label: "Summit & leadership labs", pct: 20, note: "Venue, facilitators and bursaries for the annual summit." },
  { label: "Chapter seed grants", pct: 15, note: "Start-up support for new regional chapters and clubs." },
];

export function SupportPage() {
  const { db, update, toast, logActivity } = useStore();
  const dn = db.settings.donation;
  const s = db.settings;
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState("");
  const [f, setF] = useState({ name: "", email: "", amount: "", channel: "MTN Mobile Money", reference: "" });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF(p => ({ ...p, [k]: e.target.value }));

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label); toast(`${label} copied to clipboard.`);
      setTimeout(() => setCopied(""), 2000);
    } catch { toast("Copy failed — please note it manually.", "error"); }
  };

  const notify = () => {
    const amt = Number(f.amount);
    if (f.name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) || !Number.isFinite(amt) || amt <= 0) {
      toast("Enter your name, a valid email and the amount donated.", "error"); return;
    }
    setBusy(true);
    window.setTimeout(() => {
      const body = `Donation notification.\n\nDonor: ${f.name.trim()}\nAmount: GHS ${amt.toLocaleString()}\nChannel: ${f.channel}\nPayment reference: ${f.reference.trim() || "—"}`;
      update(d => ({ ...d, messages: [{ id: uid("msg"), name: f.name.trim(), email: f.email.trim(), phone: "", subject: `Donation notification — GHS ${amt.toLocaleString()}`, body, createdAt: new Date().toISOString(), read: false }, ...d.messages] }));
      logActivity(`Donation notification received — GHS ${amt.toLocaleString()} via ${f.channel} (${f.name.trim()})`, "donation");
      toast("Thank you — your donation has been logged. A receipt will follow by email.");
      setBusy(false); setSent(true);
    }, 650);
  };

  return (
    <div>
      <PageHero kicker="File 11 — The Supply Line" title="Support The Mission" text={dn.intro} />

      {/* allocation bars + payment channels */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 grid lg:grid-cols-[1fr_1.1fr] gap-12 items-start">
          <div>
            <SectionHead kicker="Where It Goes" title="Every cedi on parade" text="Donations fund the work you see: uniforms on backs, seedlings in the ground and young leaders in training. Audited accounts are presented at every General Assembly." />
            <div className="mt-10 space-y-6">
              {ALLOCATIONS.map((a, i) => (
                <Reveal key={a.label} delay={i * 0.06}>
                  <div>
                    <div className="flex items-end justify-between gap-4">
                      <div className="font-display font-bold uppercase text-xl text-pine-900">{a.label}</div>
                      <div className="font-display font-bold text-2xl text-gold-600 tabular-nums">{a.pct}%</div>
                    </div>
                    <div className="h-2.5 bg-pine-100 rounded-full mt-2.5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-pine-800 to-gold-500"
                        initial={reduce ? { width: `${a.pct}%` } : { width: 0 }}
                        whileInView={{ width: `${a.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    <p className="text-inksoft text-[0.8rem] mt-2">{a.note}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.3}>
              <div className="flex items-start gap-3 mt-9 bg-gold-100/60 border border-gold-500/40 rounded-md px-5 py-4">
                <ShieldCheck size={18} className="text-gold-600 mt-0.5 flex-shrink-0" />
                <p className="text-[0.82rem] text-pine-800 leading-relaxed"><strong>Transparent by constitution.</strong> Donations above GHS 1,000 receive a patron certificate signed by the National President, and every contribution is reported in the audited annual statement.</p>
              </div>
            </Reveal>
          </div>

          <div className="space-y-5">
            <Reveal>
              <div className="bg-pine-900 text-paper rounded-md p-8 relative overflow-hidden">
                <div className="absolute inset-0 topo-bg opacity-50" aria-hidden="true" />
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <span className="w-11 h-11 rounded bg-gold-500 text-pine-950 flex items-center justify-center"><Landmark size={20} /></span>
                    <h2 className="font-display font-bold uppercase text-3xl">Bank Transfer</h2>
                  </div>
                  <div className="mt-6 space-y-4">
                    {[["Bank", dn.bankName], ["Account Name", dn.accountName], ["Account Number", dn.bankAccount], ["Branch", dn.branch]].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-4 border-b border-paper/12 pb-3.5">
                        <div>
                          <div className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-gold-300">{k}</div>
                          <div className="font-semibold mt-0.5 text-[0.95rem]">{v}</div>
                        </div>
                        <button onClick={() => copy(k, v)} aria-label={`Copy ${k}`} className="p-2.5 rounded border border-paper/25 hover:bg-gold-500 hover:text-pine-950 hover:border-gold-500 transition-colors flex-shrink-0">
                          {copied === k ? <Check size={15} className="text-gold-300" /> : <Copy size={15} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
            {dn.momo.map((m, i) => (
              <Reveal key={m.network} delay={0.08 + i * 0.06}>
                <div className="group bg-[#fbfbf6] border border-pine-900/10 rounded-md p-5 flex items-center justify-between gap-4 hover:border-gold-500/70 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <span className="w-11 h-11 rounded bg-gold-100 text-gold-600 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500 group-hover:text-pine-950 transition-colors"><Smartphone size={19} /></span>
                    <div>
                      <div className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-inksoft">{m.network}</div>
                      <div className="font-display font-bold text-2xl text-pine-900 tabular-nums">{m.number}</div>
                      <div className="text-[0.72rem] text-inksoft">Name: {m.name}</div>
                    </div>
                  </div>
                  <button onClick={() => copy(m.network, m.number)} aria-label={`Copy ${m.network} number`} className="p-2.5 rounded border border-pine-800/25 text-pine-800 hover:bg-pine-800 hover:text-paper transition-colors flex-shrink-0">
                    {copied === m.network ? <Check size={15} className="text-gold-500" /> : <Copy size={15} />}
                  </button>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.28}>
              <div className="bg-gold-100/70 border border-gold-500/50 rounded-md p-6">
                <div className="flex items-center gap-2.5 text-pine-900 font-display font-bold uppercase text-xl"><Receipt size={19} className="text-gold-600" />After You Give</div>
                <ol className="mt-3 space-y-2.5">
                  {dn.instructions.map((x, i) => (
                    <li key={i} className="flex gap-3 text-sm text-pine-800 leading-relaxed">
                      <span className="w-6 h-6 flex-shrink-0 rounded-full bg-pine-900 text-gold-300 font-display font-bold text-xs flex items-center justify-center mt-0.5">{i + 1}</span>{x}
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* donation notification form */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-5">
          <Reveal>
            <div className="bg-pine-950 text-paper rounded-md relative overflow-hidden">
              <div className="tape-strip h-2" aria-hidden="true" />
              <div className="absolute inset-0 grid-lines pointer-events-none" aria-hidden="true" />
              <div className="relative grid lg:grid-cols-2 gap-10 p-8 sm:p-12">
                <div>
                  <div className="text-[0.68rem] font-bold tracking-[0.3em] uppercase text-gold-300">Already Gave?</div>
                  <h2 className="font-display font-bold uppercase text-4xl sm:text-5xl leading-[1.02] mt-3">Log your donation<br /><span className="text-gold-400">for an official receipt</span></h2>
                  <p className="text-pine-100/80 mt-5 leading-relaxed max-w-md">Tell the treasury desk what you sent and how. Your receipt — and patron certificate where applicable — follows by email within three working days.</p>
                  <div className="flex items-center gap-3 mt-7 text-[0.78rem] text-pine-100/70">
                    <HeartHandshake size={16} className="text-gold-400" /> Signed off by the National Treasurer's desk.
                  </div>
                </div>
                <div className="bg-paper text-ink rounded-md p-7 shadow-2xl">
                  {sent ? (
                    <div className="text-center py-10">
                      <span className="inline-flex w-16 h-16 rounded-full bg-pine-900 text-gold-400 items-center justify-center"><FileCheck2 size={28} /></span>
                      <h3 className="font-display font-bold uppercase text-3xl text-pine-900 mt-5">Donation Logged</h3>
                      <p className="text-inksoft text-sm mt-3">The treasury desk has your details. Watch <span className="font-semibold text-pine-800">{f.email}</span> for the official receipt.</p>
                      <Btn variant="outline" className="mt-6" onClick={() => { setSent(false); setF({ name: "", email: "", amount: "", channel: "MTN Mobile Money", reference: "" }); }}>Log Another</Btn>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-display font-bold uppercase text-2xl text-pine-900">Donation Notification</h3>
                      <div className="grid sm:grid-cols-2 gap-4 mt-5">
                        <Field label="Full name *"><input className="field" value={f.name} onChange={set("name")} placeholder="Your name" /></Field>
                        <Field label="Email *"><input type="email" className="field" value={f.email} onChange={set("email")} placeholder="you@mail.com" /></Field>
                        <Field label="Amount (GHS) *"><input type="number" min="1" className="field" value={f.amount} onChange={set("amount")} placeholder="e.g. 250" /></Field>
                        <Field label="Channel *">
                          <select className="field" value={f.channel} onChange={set("channel")}>
                            <option>Bank Transfer</option>
                            {dn.momo.map(m => <option key={m.network}>{m.network}</option>)}
                            <option>Cheque</option><option>In person — Secretariat</option>
                          </select>
                        </Field>
                        <div className="sm:col-span-2">
                          <Field label="Payment reference" hint="The transaction ID or slip number, if you have one.">
                            <input className="field" value={f.reference} onChange={set("reference")} placeholder="e.g. MP240312.1530.A12345" />
                          </Field>
                        </div>
                      </div>
                      <div className="mt-6">
                        <Btn variant="gold" size="lg" onClick={notify} disabled={busy}>{busy ? "Logging…" : <>Submit Notification <Send size={15} /></>}</Btn>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* other ways to give */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-5">
          <SectionHead center kicker="Beyond Money" title="Other ways to supply the line" />
          <div className="grid sm:grid-cols-3 gap-6 mt-12">
            {[
              { t: "Volunteer Hours", d: "Join a service corps deployment — clean-ups, greening and disaster response need hands more than funds.", cta: "See events", to: "/events" },
              { t: "Professional Mentorship", d: "Engineers, clinicians, teachers and technologists — give a senior cadet twelve weeks of your trade.", cta: "Contact the desk", to: "/contact" },
              { t: "Kit & Equipment", d: "Donate serviceable boots, uniforms, tents and first-aid kits through the secretariat stores desk.", cta: "Get in touch", to: "/contact" },
            ].map((x, i) => (
              <Reveal key={x.t} delay={i * 0.07}>
                <div className="group h-full bg-[#fbfbf6] border border-pine-900/10 rounded-md p-7 hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col">
                  <h3 className="font-display font-bold uppercase text-2xl text-pine-900 group-hover:text-gold-600 transition-colors">{x.t}</h3>
                  <p className="text-inksoft text-sm leading-relaxed mt-2.5 flex-1">{x.d}</p>
                  <a href={`#${x.to}`} className="inline-flex items-center gap-1.5 mt-5 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-gold-600 hover:text-pine-800 transition-colors">{x.cta} →</a>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.15}>
            <p className="text-center text-[0.8rem] text-inksoft mt-14 max-w-2xl mx-auto leading-relaxed">
              Questions about giving? Write to <a href={`mailto:${s.email}`} className="font-bold text-pine-800 underline underline-offset-4 decoration-gold-500 hover:text-gold-600 transition-colors">{s.email}</a> or call the secretariat on {s.phone}.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
