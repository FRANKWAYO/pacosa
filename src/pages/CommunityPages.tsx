import { useMemo, useState, type ReactNode } from "react";
import { Search, MapPin, Phone, Mail, Clock, ShieldCheck, Copy, Check, ArrowRight, Landmark, Smartphone, Receipt, Send } from "lucide-react";
import { useStore, uid, nextRefNo, processImageFile } from "../lib/store";
import { Reveal, SectionHead, Btn, SmartImg, Monogram, Pill, Field } from "../components/ui";
import { REGIONS, RANKS } from "../lib/types";
import { PageHero } from "./AboutLeadership";

/* ================= MEMBER DIRECTORY ================= */
export function MembersPage() {
  const { db } = useStore();
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("All");
  const approved = db.members.filter(m => m.status === "approved");
  const filtered = useMemo(() => approved.filter(m => {
    const t = q.trim().toLowerCase();
    const okQ = !t || [m.fullName, m.cadetUnit, m.occupation, m.yearJoined, m.yearCompleted, m.region].join(" ").toLowerCase().includes(t);
    const okR = region === "All" || m.region === region;
    return okQ && okR;
  }), [approved, q, region]);
  return (
    <div>
      <PageHero kicker="File 08 — The Roster" title="Member Directory" text={`${approved.length} approved members across ${REGIONS.length} regions. Sensitive details are kept private by the secretariat.`} />
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3 bg-[#fbfbf6] border border-pine-900/10 rounded-md p-4 shadow-sm">
              <div className="relative flex-1 min-w-[240px]">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-inksoft" />
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, unit, occupation or year…" aria-label="Search members" className="field pl-10" />
              </div>
              <select value={region} onChange={e => setRegion(e.target.value)} aria-label="Filter by region" className="field w-auto min-w-[180px]">
                <option value="All">All regions</option>
                {REGIONS.map(r => <option key={r}>{r}</option>)}
              </select>
              <span className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-inksoft">{filtered.length} shown</span>
            </div>
          </Reveal>
          <div className="flex items-start gap-3 mt-6 text-[0.78rem] text-inksoft bg-gold-100/60 border border-gold-500/40 rounded-md px-4 py-3">
            <ShieldCheck size={16} className="text-gold-600 mt-0.5 flex-shrink-0" />
            <span><strong className="text-pine-800">Privacy first:</strong> phone numbers, emails, dates of birth and emergency contacts are never displayed publicly. Only members may request full contact details through the secretariat.</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {filtered.map((m, i) => (
              <Reveal key={m.id} delay={(i % 4) * 0.05}>
                <div className="bg-[#fbfbf6] border border-pine-900/10 rounded-md overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                  <div className="flex items-center gap-4 p-5">
                    {m.photo ? <SmartImg src={m.photo} alt={m.fullName} className="w-16 h-16 rounded object-cover" /> : <Monogram name={m.fullName} size={64} rankLines={1} className="rounded" />}
                    <div className="min-w-0">
                      <div className="font-display font-bold uppercase text-xl text-pine-900 leading-tight truncate">{m.fullName}</div>
                      <div className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-gold-600 mt-0.5">{m.rank}</div>
                    </div>
                  </div>
                  <div className="px-5 pb-5 space-y-1.5 text-[0.78rem] text-inksoft border-t border-pine-900/8 pt-4">
                    <div className="truncate"><span className="font-bold text-pine-800">Unit:</span> {m.cadetUnit}</div>
                    <div className="truncate"><span className="font-bold text-pine-800">Occupation:</span> {m.occupation}</div>
                    <div className="flex items-center justify-between">
                      <Pill tone="pine">{m.region}</Pill>
                      <span className="text-[0.68rem] text-inksoft">{m.yearJoined}–{m.yearCompleted}</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          {filtered.length === 0 && <p className="text-center text-inksoft py-16">No members match that search. Adjust the filters and try again.</p>}
          <div className="text-center mt-12"><Btn variant="pine" href="/join">Not on the roster yet? Join PACOSA <ArrowRight size={15} /></Btn></div>
        </div>
      </section>
    </div>
  );
}

/* ================= JOIN / APPLICATION ================= */
const emptyForm = { fullName: "", dob: "", gender: "", phone: "", email: "", location: "", region: "", cadetUnit: "", rank: "", yearJoined: "", yearCompleted: "", occupation: "", emergencyContact: "", bio: "" };

export function JoinPage() {
  const { db, update, toast, logActivity } = useStore();
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState("");
  const [busy, setBusy] = useState(false);
  const [refNo, setRefNo] = useState<string | null>(null);
  const set = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const pickPhoto = async (f: File | null) => {
    if (!f) return;
    try { const { url } = await processImageFile(f); setPhoto(url); toast("Profile photo attached."); }
    catch (e) { toast((e as Error).message, "error"); }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim() || !form.region || !form.cadetUnit.trim()) {
      toast("Please complete name, email, phone, region and cadet unit.", "error"); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast("Please enter a valid email address.", "error"); return; }
    setBusy(true);
    setTimeout(() => {
      const ref = nextRefNo(db);
      update(d => ({
        ...d,
        members: [...d.members, { id: uid("m"), refNo: ref, ...form, photo, status: "pending" as const, appliedAt: new Date().toISOString() }],
      }));
      logActivity(`New membership application received — ${form.fullName} (${form.region})`, "application");
      if (db.settings.smtp.enabled) logActivity(`Email notification sent to administrators (${db.settings.smtp.notifyEmails})`, "email");
      setRefNo(ref);
      setBusy(false);
      window.scrollTo({ top: 0 });
    }, 600);
  };

  if (refNo) {
    return (
      <div>
        <PageHero kicker="Application Received" title="Welcome to the ranks" />
        <section className="py-20">
          <div className="max-w-2xl mx-auto px-5 text-center">
            <Reveal>
              <div className="bg-[#fbfbf6] border-2 border-gold-500 rounded-md p-10 shadow-xl">
                <div className="w-16 h-16 mx-auto rounded-full bg-pine-900 text-gold-400 flex items-center justify-center"><Check size={30} /></div>
                <h2 className="font-display font-bold uppercase text-4xl text-pine-900 mt-6">Application submitted</h2>
                <p className="text-inksoft mt-3 leading-relaxed">Your details are with the membership desk. The administrators have been notified by email and will review your application shortly.</p>
                <div className="mt-8 bg-pine-950 text-paper rounded-md py-6 px-4">
                  <div className="text-[0.64rem] font-bold uppercase tracking-[0.28em] text-gold-300">Your application reference</div>
                  <div className="font-display font-bold text-4xl text-gold-400 tracking-[0.08em] mt-2">{refNo}</div>
                </div>
                <p className="text-[0.78rem] text-inksoft mt-6">Keep this reference — you will need it when enquiring about your status. Approved members appear in the public directory.</p>
                <div className="flex flex-wrap justify-center gap-3 mt-8">
                  <Btn variant="pine" href="/">Back Home</Btn>
                  <Btn variant="outline" href="/programs">Browse Programs</Btn>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <PageHero kicker="File 09 — Enlistment" title="Join PACOSA" text="Open to serving and former cadets of chartered corps. Applications are reviewed by the membership desk within ten working days." />
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 grid lg:grid-cols-[1fr_1.7fr] gap-12">
          <aside className="space-y-5 lg:sticky lg:top-28 self-start">
            <Reveal>
              <div className="bg-pine-900 text-paper rounded-md p-7">
                <h3 className="font-display font-bold uppercase text-2xl text-gold-300">What membership brings</h3>
                <ul className="mt-4 space-y-2.5 text-sm text-pine-100/85">
                  {["Access to all national training programs", "Voting rights at the General Assembly", "Eligibility for the leadership pipeline", "Community service corps deployment", "Member directory and chapter network"].map(x => (
                    <li key={x} className="flex gap-2.5"><Check size={15} className="text-gold-400 mt-0.5 flex-shrink-0" />{x}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="bg-[#fbfbf6] border border-pine-900/10 rounded-md p-7">
                <h3 className="font-display font-bold uppercase text-xl text-pine-900">The process</h3>
                <ol className="mt-4 space-y-3 text-sm text-inksoft">
                  {["Submit the enlistment form", "Receive your application reference", "Membership desk verifies your cadet record", "Approval — you appear in the directory"].map((x, i) => (
                    <li key={x} className="flex gap-3"><span className="w-6 h-6 flex-shrink-0 rounded-full bg-gold-500 text-pine-950 font-bold text-xs flex items-center justify-center">{i + 1}</span>{x}</li>
                  ))}
                </ol>
              </div>
            </Reveal>
          </aside>

          <Reveal delay={0.05}>
            <form onSubmit={submit} className="bg-[#fbfbf6] border border-pine-900/10 rounded-md p-8 shadow-sm" noValidate>
              <h2 className="font-display font-bold uppercase text-3xl text-pine-900">Enlistment Form</h2>
              <p className="text-inksoft text-sm mt-1.5 mb-8">Fields marked * are required. Your information is stored securely and never sold.</p>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Full Name *"><input className="field" value={form.fullName} onChange={set("fullName")} placeholder="e.g. Kwame A. Mensah" required /></Field>
                <Field label="Date of Birth"><input type="date" className="field" value={form.dob} onChange={set("dob")} /></Field>
                <Field label="Gender">
                  <select className="field" value={form.gender} onChange={set("gender")}>
                    <option value="">Select…</option><option>Male</option><option>Female</option>
                  </select>
                </Field>
                <Field label="Phone Number *"><input className="field" value={form.phone} onChange={set("phone")} placeholder="+233 …" required /></Field>
                <Field label="Email *"><input type="email" className="field" value={form.email} onChange={set("email")} placeholder="you@mail.com" required /></Field>
                <Field label="Location (Town/City)"><input className="field" value={form.location} onChange={set("location")} /></Field>
                <Field label="Region *">
                  <select className="field" value={form.region} onChange={set("region")} required>
                    <option value="">Select region…</option>
                    {REGIONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </Field>
                <Field label="Previous Cadet School / Unit *"><input className="field" value={form.cadetUnit} onChange={set("cadetUnit")} placeholder="e.g. Achimota School Cadet Unit" required /></Field>
                <Field label="Cadet Rank">
                  <select className="field" value={form.rank} onChange={set("rank")}>
                    <option value="">Select rank…</option>
                    {RANKS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </Field>
                <Field label="Current Occupation"><input className="field" value={form.occupation} onChange={set("occupation")} /></Field>
                <Field label="Year Joined Cadets"><input className="field" value={form.yearJoined} onChange={set("yearJoined")} placeholder="e.g. 2014" /></Field>
                <Field label="Year Completed"><input className="field" value={form.yearCompleted} onChange={set("yearCompleted")} placeholder="e.g. 2017" /></Field>
                <Field label="Emergency Contact"><input className="field" value={form.emergencyContact} onChange={set("emergencyContact")} placeholder="Name — phone" /></Field>
                <Field label="Profile Photo" hint="JPG, PNG or WEBP, max 8 MB. Auto-optimised on upload.">
                  <div className="flex items-center gap-3">
                    {photo ? <SmartImg src={photo} alt="Profile preview" className="w-14 h-14 rounded object-cover border border-pine-900/10" /> : <Monogram name={form.fullName || "New Recruit"} size={56} rankLines={1} className="rounded" />}
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[4px] border border-pine-800/40 text-pine-800 font-bold uppercase tracking-[0.1em] text-[0.72rem] cursor-pointer hover:bg-pine-800 hover:text-paper transition-colors">
                      Upload photo<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => void pickPhoto(e.target.files?.[0] ?? null)} />
                    </label>
                  </div>
                </Field>
              </div>
              <div className="mt-5">
                <Field label="Short Biography"><textarea className="field" rows={4} value={form.bio} onChange={set("bio")} placeholder="A few lines about your cadet background and what you hope to contribute…" /></Field>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <Btn variant="gold" size="lg" type="submit" disabled={busy}>{busy ? "Filing your application…" : "Join PACOSA"} {!busy && <ArrowRight size={16} />}</Btn>
                <span className="text-[0.72rem] text-inksoft">Submitting agrees to the association's data policy.</span>
              </div>
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

/* ================= CONTACT ================= */
export function ContactPage() {
  const { db, update, toast, logActivity } = useStore();
  const s = db.settings;
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", body: "" });
  const [busy, setBusy] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.body.trim()) { toast("Please complete name, email and message.", "error"); return; }
    setBusy(true);
    setTimeout(() => {
      update(d => ({ ...d, messages: [{ id: uid("msg"), ...form, createdAt: new Date().toISOString(), read: false }, ...d.messages] }));
      logActivity(`New contact message from ${form.name} — "${form.subject || "No subject"}"`, "message");
      toast("Message received. The secretariat replies within two working days.");
      setForm({ name: "", email: "", phone: "", subject: "", body: "" });
      setBusy(false);
    }, 500);
  };
  const infoCard = (icon: ReactNode, t: string, v: string) => (
    <div className="flex items-start gap-4 bg-[#fbfbf6] border border-pine-900/10 rounded-md p-5 hover:border-gold-500/60 transition-colors">
      <span className="w-10 h-10 rounded bg-pine-900 text-gold-400 flex items-center justify-center flex-shrink-0">{icon}</span>
      <div><div className="text-[0.64rem] font-bold uppercase tracking-[0.2em] text-inksoft">{t}</div><div className="font-semibold text-pine-900 mt-1 text-[0.92rem]">{v}</div></div>
    </div>
  );
  return (
    <div>
      <PageHero kicker="File 10 — Open Channel" title="Contact The Secretariat" text="Questions, partnerships, media or member enquiries — one desk, answered promptly." />
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 grid lg:grid-cols-[1fr_1.3fr] gap-12">
          <div className="space-y-4">
            {infoCard(<MapPin size={18} />, "National Secretariat", s.address)}
            {infoCard(<Phone size={18} />, "Phone", s.phone)}
            {infoCard(<Mail size={18} />, "Email", s.email)}
            {infoCard(<Clock size={18} />, "Office Hours", "Monday – Friday, 08:00 – 16:30")}
            <Reveal delay={0.1}>
              <div className="rounded-md overflow-hidden border border-pine-900/10 shadow-sm aspect-[4/3]">
                <iframe title="PACOSA office location map" src={`https://maps.google.com/maps?q=${encodeURIComponent(s.mapQuery)}&z=14&output=embed`} className="w-full h-full" loading="lazy" />
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.06}>
            <form onSubmit={submit} className="bg-[#fbfbf6] border border-pine-900/10 rounded-md p-8 shadow-sm" noValidate>
              <h2 className="font-display font-bold uppercase text-3xl text-pine-900">Send a Message</h2>
              <p className="text-inksoft text-sm mt-1.5 mb-7">Messages land directly in the admin dashboard and are triaged by the General Secretary's desk.</p>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Name *"><input className="field" value={form.name} onChange={set("name")} required /></Field>
                <Field label="Email *"><input type="email" className="field" value={form.email} onChange={set("email")} required /></Field>
                <Field label="Phone"><input className="field" value={form.phone} onChange={set("phone")} /></Field>
                <Field label="Subject"><input className="field" value={form.subject} onChange={set("subject")} /></Field>
              </div>
              <div className="mt-5">
                <Field label="Message *"><textarea className="field" rows={6} value={form.body} onChange={set("body")} required /></Field>
              </div>
              <Btn variant="gold" size="lg" type="submit" disabled={busy} className="mt-7">{busy ? "Sending…" : <>Send Message <Send size={15} /></>}</Btn>
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

/* ================= SUPPORT / DONATIONS ================= */
export function SupportPage() {
  const { db, toast } = useStore();
  const dn = db.settings.donation;
  const [copied, setCopied] = useState("");
  const copy = async (label: string, value: string) => {
    try { await navigator.clipboard.writeText(value); setCopied(label); toast(`${label} copied to clipboard.`); setTimeout(() => setCopied(""), 2000); }
    catch { toast("Copy failed — please note it manually.", "error"); }
  };
  return (
    <div>
      <PageHero kicker="File 11 — The Supply Line" title="Support PACOSA" text={dn.intro} />
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-2 gap-8">
          <Reveal>
            <div className="bg-pine-900 text-paper rounded-md p-8 h-full relative overflow-hidden">
              <div className="absolute inset-0 topo-bg opacity-50" aria-hidden="true" />
              <div className="relative">
                <Landmark size={26} className="text-gold-400" />
                <h2 className="font-display font-bold uppercase text-3xl mt-4">Bank Transfer</h2>
                <div className="mt-6 space-y-4">
                  {[["Bank", dn.bankName], ["Account Name", dn.accountName], ["Account Number", dn.bankAccount], ["Branch", dn.branch]].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-4 border-b border-paper/12 pb-3.5">
                      <div>
                        <div className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-gold-300">{k}</div>
                        <div className="font-semibold mt-0.5">{v}</div>
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
          <div className="space-y-5">
            {dn.momo.map((m, i) => (
              <Reveal key={m.network} delay={i * 0.06}>
                <div className="bg-[#fbfbf6] border border-pine-900/10 rounded-md p-6 flex items-center justify-between gap-4 hover:border-gold-500/60 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="w-11 h-11 rounded bg-gold-100 text-gold-600 flex items-center justify-center flex-shrink-0"><Smartphone size={19} /></span>
                    <div>
                      <div className="text-[0.64rem] font-bold uppercase tracking-[0.2em] text-inksoft">{m.network}</div>
                      <div className="font-display font-bold text-2xl text-pine-900">{m.number}</div>
                      <div className="text-[0.72rem] text-inksoft">Name: {m.name}</div>
                    </div>
                  </div>
                  <button onClick={() => copy(m.network, m.number)} aria-label={`Copy ${m.network} number`} className="p-2.5 rounded border border-pine-800/25 text-pine-800 hover:bg-pine-800 hover:text-paper transition-colors flex-shrink-0">
                    {copied === m.network ? <Check size={15} className="text-gold-500" /> : <Copy size={15} />}
                  </button>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.2}>
              <div className="bg-gold-100/70 border border-gold-500/50 rounded-md p-6">
                <div className="flex items-center gap-2.5 text-pine-900 font-display font-bold uppercase text-xl"><Receipt size={19} className="text-gold-600" />Donation Instructions</div>
                <ol className="mt-3 space-y-2 text-sm text-pine-800 list-decimal list-inside">{dn.instructions.map((x, i) => <li key={i}>{x}</li>)}</ol>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-5">
          <SectionHead center kicker="Where it goes" title="Every cedi accounted for" text="Donations fund training kits, transport for service corps deployments, the annual summit and chapter seed grants. Audited accounts are presented at every General Assembly." />
        </div>
      </section>
    </div>
  );
}
