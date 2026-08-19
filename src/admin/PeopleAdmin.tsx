import { useState } from "react";
import { Search, Check, X as XIcon, Eye, Inbox, Archive, UserPlus, Plus, Mail } from "lucide-react";
import { useStore, uid, fmtDate } from "../lib/store";
import { hashPw } from "../lib/seed";
import { Btn, Modal, SmartImg, Monogram, Pill, PageHead, Field, MediaPicker, ConfirmBtn, EmptyState } from "../components/ui";
import { REGIONS, ROLE_LABELS, type AdminUser, type Member, type MemberStatus } from "../lib/types";

const statusTone = (s: MemberStatus) => s === "approved" ? "green" : s === "pending" ? "gold" : s === "rejected" ? "red" : "gray";

/* ================= MEMBERS ================= */
export function MembersAdmin() {
  const { db, update, toast, logActivity } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | MemberStatus>("all");
  const [sel, setSel] = useState<Member | null>(null);
  const list = db.members.filter(m =>
    (status === "all" || m.status === status) &&
    (m.fullName + m.region + m.cadetUnit + m.occupation + m.refNo).toLowerCase().includes(q.toLowerCase()),
  );
  const setStatusOf = (m: Member, s: MemberStatus) => {
    update(d => ({ ...d, members: d.members.map(x => x.id === m.id ? { ...x, status: s, decidedAt: new Date().toISOString() } : x) }));
    logActivity(`Member ${s}: ${m.fullName} (${m.refNo})`, "member");
    if (s === "approved" && db.settings.smtp.enabled) logActivity(`Confirmation email sent to ${m.email}`, "email");
    toast(`Status set to ${s}.`);
    setSel(sel && sel.id === m.id ? { ...m, status: s } : sel);
  };
  return (
    <div>
      <PageHead title="Members" sub="The full membership register. Only approved members appear in the public directory." />
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-inksoft" />
          <input className="field pl-9" value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, region, unit, ref no…" aria-label="Search members" />
        </div>
        {(["all", "approved", "pending", "rejected", "suspended"] as const).map(s => (
          <button key={s} onClick={() => setStatus(s)} className={`px-4 py-2 rounded-[4px] text-[0.72rem] font-bold uppercase tracking-[0.1em] transition-all ${status === s ? "bg-pine-900 text-gold-300" : "bg-pine-100 text-pine-800 hover:bg-pine-200"}`}>{s}</button>
        ))}
      </div>
      <div className="bg-[#fbfbf6] border border-pine-900/10 rounded-lg overflow-hidden divide-y divide-pine-900/8">
        {list.map(m => (
          <div key={m.id} className="flex flex-wrap items-center gap-4 px-5 py-3 hover:bg-pine-50/70 transition-colors">
            {m.photo ? <SmartImg src={m.photo} alt="" className="w-10 h-10 rounded object-cover" /> : <Monogram name={m.fullName} size={40} rankLines={1} className="rounded" />}
            <div className="min-w-[180px] flex-1">
              <div className="font-semibold text-pine-900">{m.fullName} <span className="text-[0.68rem] text-inksoft font-normal">({m.refNo})</span></div>
              <div className="text-[0.72rem] text-inksoft">{m.region} • {m.cadetUnit} • {m.occupation}</div>
            </div>
            <Pill tone={statusTone(m.status)}>{m.status}</Pill>
            <div className="ml-auto flex gap-1.5">
              <button title="View details" aria-label="View details" onClick={() => setSel(m)} className="p-2 rounded hover:bg-pine-100 text-pine-700"><Eye size={16} /></button>
              <ConfirmBtn onConfirm={() => { update(d => ({ ...d, members: d.members.filter(x => x.id !== m.id) })); logActivity(`Member record deleted: ${m.fullName}`, "member"); toast("Member record deleted."); }} />
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="p-10 text-center text-inksoft text-sm">No members match the current filters.</p>}
      </div>

      <Modal open={!!sel} onClose={() => setSel(null)} title="Member Record">
        {sel && (
          <div>
            <div className="flex items-center gap-4">
              {sel.photo ? <SmartImg src={sel.photo} alt={sel.fullName} className="w-20 h-20 rounded object-cover" /> : <Monogram name={sel.fullName} size={80} rankLines={2} className="rounded" />}
              <div>
                <h3 className="font-display font-bold uppercase text-2xl text-pine-900">{sel.fullName}</h3>
                <div className="flex items-center gap-2 mt-1"><Pill tone={statusTone(sel.status)}>{sel.status}</Pill><span className="text-[0.72rem] text-inksoft">{sel.refNo}</span></div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mt-6 text-sm">
              {[["Email", sel.email], ["Phone", sel.phone], ["Date of Birth", sel.dob], ["Gender", sel.gender], ["Location", sel.location], ["Region", sel.region], ["Cadet Unit", sel.cadetUnit], ["Rank", sel.rank], ["Joined Cadets", sel.yearJoined], ["Completed", sel.yearCompleted], ["Occupation", sel.occupation], ["Emergency Contact", sel.emergencyContact], ["Applied", fmtDate(sel.appliedAt)], ["Decided", sel.decidedAt ? fmtDate(sel.decidedAt) : "—"]].map(([k, v]) => (
                <div key={k} className="border-b border-pine-900/8 pb-2"><div className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-inksoft">{k}</div><div className="font-medium text-pine-900 mt-0.5">{v || "—"}</div></div>
              ))}
            </div>
            {sel.bio && <p className="text-sm text-inksoft italic mt-4 border-l-2 border-gold-500 pl-3">{sel.bio}</p>}
            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-pine-900/10">
              <Btn variant="pine" size="sm" onClick={() => setStatusOf(sel, "approved")}><Check size={14} />Approve</Btn>
              <Btn variant="outline" size="sm" onClick={() => setStatusOf(sel, "suspended")}>Suspend</Btn>
              <Btn variant="ghost" size="sm" onClick={() => setStatusOf(sel, "rejected")}><XIcon size={14} />Reject</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ================= APPLICATIONS ================= */
export function ApplicationsAdmin() {
  const { db, update, toast, logActivity } = useStore();
  const pending = db.members.filter(m => m.status === "pending").sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
  const decide = (m: Member, s: "approved" | "rejected") => {
    update(d => ({ ...d, members: d.members.map(x => x.id === m.id ? { ...x, status: s, decidedAt: new Date().toISOString() } : x) }));
    logActivity(`Membership application ${s}: ${m.fullName} (${m.refNo})`, "application");
    if (db.settings.smtp.enabled) logActivity(`Confirmation email sent to ${m.email}`, "email");
    toast(s === "approved" ? `Approved — ${m.fullName} is now in the member directory.` : "Application rejected.");
  };
  return (
    <div>
      <PageHead title="Membership Applications" sub={`${pending.length} application${pending.length === 1 ? "" : "s"} awaiting review. Approvals go live in the directory immediately.`} />
      {pending.length === 0 ? <EmptyState title="Inbox clear" text="No pending applications. New enlistments will appear here with an email notification." /> : (
        <div className="space-y-4">
          {pending.map(m => (
            <div key={m.id} className="bg-[#fbfbf6] border border-pine-900/10 rounded-lg p-6 hover:border-gold-500/60 transition-colors">
              <div className="flex flex-wrap items-start gap-5">
                {m.photo ? <SmartImg src={m.photo} alt={m.fullName} className="w-16 h-16 rounded object-cover" /> : <Monogram name={m.fullName} size={64} rankLines={1} className="rounded" />}
                <div className="flex-1 min-w-[240px]">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-display font-bold uppercase text-2xl text-pine-900">{m.fullName}</h3>
                    <Pill tone="gold">{m.refNo}</Pill>
                  </div>
                  <div className="text-[0.78rem] text-inksoft mt-1">{m.region} • {m.cadetUnit} • {m.rank || "Rank n/s"} ({m.yearJoined || "?"}–{m.yearCompleted || "present"}) • {m.occupation || "Occupation n/s"}</div>
                  <p className="text-sm text-inksoft mt-2 line-clamp-2">{m.bio || "No biography provided."}</p>
                  <div className="text-[0.68rem] text-inksoft mt-2">Applied {fmtDate(m.appliedAt)} • {m.email} • {m.phone}</div>
                </div>
                <div className="flex gap-2">
                  <Btn variant="pine" size="sm" onClick={() => decide(m, "approved")}><Check size={14} />Approve</Btn>
                  <Btn variant="outline" size="sm" onClick={() => decide(m, "rejected")}><XIcon size={14} />Reject</Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= MESSAGES ================= */
export function MessagesAdmin() {
  const { db, update, toast } = useStore();
  const [sel, setSel] = useState<string | null>(null);
  const open = (id: string) => {
    setSel(id);
    update(d => ({ ...d, messages: d.messages.map(m => m.id === id ? { ...m, read: true } : m) }));
  };
  return (
    <div>
      <PageHead title="Contact Messages" sub="Messages submitted through the public contact form." />
      <div className="bg-[#fbfbf6] border border-pine-900/10 rounded-lg overflow-hidden divide-y divide-pine-900/8">
        {db.messages.map(m => (
          <button key={m.id} onClick={() => open(m.id)} className={`w-full text-left flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-pine-50/70 transition-colors ${!m.read ? "bg-gold-100/40" : ""}`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${!m.read ? "bg-gold-500 pulse-dot" : "bg-pine-200"}`} />
            <div className="min-w-[200px] flex-1">
              <div className={`text-pine-900 ${!m.read ? "font-bold" : "font-semibold"}`}>{m.subject || "No subject"}</div>
              <div className="text-[0.72rem] text-inksoft">{m.name} • {m.email} • {fmtDate(m.createdAt)}</div>
            </div>
            <span className="text-[0.8rem] text-inksoft line-clamp-1 max-w-[300px] hidden md:block">{m.body}</span>
            <ConfirmBtn onConfirm={() => { update(d => ({ ...d, messages: d.messages.filter(x => x.id !== m.id) })); toast("Message archived."); }} label="Archive" />
          </button>
        ))}
        {db.messages.length === 0 && <p className="p-10 text-center text-inksoft text-sm flex items-center justify-center gap-2"><Inbox size={16} />No messages received yet.</p>}
      </div>
      {sel && (() => {
        const m = db.messages.find(x => x.id === sel);
        if (!m) return null;
        return (
          <Modal open onClose={() => setSel(null)} title={m.subject || "Message"}>
            <div className="text-sm space-y-4">
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-[0.78rem] text-inksoft">
                <span><strong className="text-pine-900">From:</strong> {m.name}</span>
                <span><strong className="text-pine-900">Email:</strong> {m.email}</span>
                {m.phone && <span><strong className="text-pine-900">Phone:</strong> {m.phone}</span>}
                <span><strong className="text-pine-900">Received:</strong> {fmtDate(m.createdAt, { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
              <p className="leading-relaxed text-pine-900 whitespace-pre-wrap border-t border-pine-900/10 pt-4">{m.body}</p>
              <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + (m.subject || "Your message to PACOSA"))}`}
                className="inline-flex items-center gap-2 bg-pine-800 hover:bg-pine-700 text-paper font-bold uppercase tracking-[0.12em] text-[0.75rem] px-5 py-2.5 rounded-[4px] transition-colors">
                <Mail size={14} />Reply by email
              </a>
            </div>
          </Modal>
        );
      })()}
      <div className="mt-4 text-[0.75rem] text-inksoft flex items-center gap-2"><Archive size={14} />Archived messages are removed from the inbox.</div>
    </div>
  );
}

/* ================= USERS ================= */
export function UsersAdmin() {
  const { db, update, toast, logActivity, user: me } = useStore();
  const [draft, setDraft] = useState<AdminUser | null>(null);
  const [pw, setPw] = useState("");
  const set = (k: keyof AdminUser, v: unknown) => setDraft(d => d ? { ...d, [k]: v } : d);
  const save = () => {
    if (!draft || !draft.name.trim() || !draft.email.trim()) { toast("Name and email are required.", "error"); return; }
    if (!draft.id && pw.length < 6) { toast("Password must be at least 6 characters.", "error"); return; }
    const isNew = !draft.id;
    const item: AdminUser = { ...draft, id: draft.id || uid("u"), passwordHash: pw ? hashPw(pw) : draft.passwordHash };
    update(d => ({ ...d, users: isNew ? [...d.users, item] : d.users.map(x => x.id === item.id ? item : x) }));
    logActivity(`Admin user ${isNew ? "created" : "updated"}: ${item.name} (${ROLE_LABELS[item.role]})`, "user");
    toast(isNew ? "User created." : "User updated.");
    setDraft(null); setPw("");
  };
  return (
    <div>
      <PageHead title="Admin Users" sub="Role-based access: Super Administrator, Administrator, Editor and Membership Officer." actions={<Btn variant="gold" onClick={() => setDraft({ id: "", name: "", email: "", passwordHash: "", role: "editor", active: true, color: "#486343" })}><UserPlus size={15} />Add User</Btn>} />
      <div className="bg-[#fbfbf6] border border-pine-900/10 rounded-lg overflow-hidden divide-y divide-pine-900/8">
        {db.users.map(u => (
          <div key={u.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5 hover:bg-pine-50/70 transition-colors">
            <Monogram name={u.name} size={40} rankLines={1} className="rounded" />
            <div className="min-w-[180px] flex-1">
              <div className="font-semibold text-pine-900">{u.name} {u.id === me?.id && <span className="text-[0.62rem] text-gold-600 font-bold uppercase">(you)</span>}</div>
              <div className="text-[0.72rem] text-inksoft">{u.email}{u.lastLogin ? ` • last login ${fmtDate(u.lastLogin)}` : ""}</div>
            </div>
            <Pill tone={u.role === "super" ? "gold" : "pine"}>{ROLE_LABELS[u.role]}</Pill>
            <Pill tone={u.active ? "green" : "gray"}>{u.active ? "active" : "disabled"}</Pill>
            <div className="ml-auto flex gap-1.5">
              <button onClick={() => { setDraft({ ...u }); setPw(""); }} className="px-3 py-1.5 rounded text-[0.68rem] font-bold uppercase tracking-wider bg-pine-100 text-pine-800 hover:bg-pine-200">Edit</button>
              {u.id !== me?.id && <ConfirmBtn onConfirm={() => { update(d => ({ ...d, users: d.users.filter(x => x.id !== u.id) })); logActivity(`Admin user removed: ${u.name}`, "user"); toast("User removed."); }} />}
            </div>
          </div>
        ))}
      </div>
      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? "Edit User" : "Add User"}>
        {draft && (
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Full Name *"><input className="field" value={draft.name} onChange={e => set("name", e.target.value)} /></Field>
            <Field label="Email *"><input type="email" className="field" value={draft.email} onChange={e => set("email", e.target.value)} /></Field>
            <Field label="Role">
              <select className="field" value={draft.role} onChange={e => set("role", e.target.value)}>
                {(Object.keys(ROLE_LABELS) as (keyof typeof ROLE_LABELS)[]).map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </Field>
            <Field label={draft.id ? "New Password (blank = keep)" : "Password *"}><input type="password" className="field" value={pw} onChange={e => setPw(e.target.value)} autoComplete="new-password" /></Field>
            <label className="flex items-center gap-3 self-end pb-2 cursor-pointer"><input type="checkbox" checked={draft.active} onChange={e => set("active", e.target.checked)} className="w-4 h-4 accent-[#c29b3c]" /><span className="text-sm font-semibold text-pine-900">Account active</span></label>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2 border-t border-pine-900/10">
              <Btn variant="ghost" onClick={() => setDraft(null)}>Cancel</Btn>
              <Btn variant="pine" onClick={save}>Save User</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ================= HOMEPAGE CMS ================= */
export function HomepageAdmin() {
  const { db, patchSettings, toast, logActivity } = useStore();
  const s = db.settings;
  const [f, setF] = useState({ ...s });
  const set = (k: keyof typeof f, v: unknown) => setF(prev => ({ ...prev, [k]: v }));
  const save = () => {
    patchSettings({ ...f });
    logActivity("Homepage content updated via CMS", "homepage");
    toast("Homepage saved — changes are live.");
  };
  const listEditor = (label: string, items: { title: string; text: string; icon?: string }[], onChange: (v: { title: string; text: string; icon?: string }[]) => void, iconOpts?: string[]) => (
    <div>
      <span className="field-label">{label}</span>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="border border-pine-900/10 rounded-md p-3 bg-[#fbfbf6]">
            <div className="flex gap-2">
              <input className="field flex-1" placeholder="Title" value={it.title} onChange={e => onChange(items.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} />
              {iconOpts && (
                <select className="field w-28" value={it.icon ?? iconOpts[0]} onChange={e => onChange(items.map((x, j) => j === i ? { ...x, icon: e.target.value } : x))}>
                  {iconOpts.map(o => <option key={o}>{o}</option>)}
                </select>
              )}
              <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="px-3 rounded bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100" aria-label="Remove item">✕</button>
            </div>
            <textarea className="field mt-2" rows={2} placeholder="Text" value={it.text} onChange={e => onChange(items.map((x, j) => j === i ? { ...x, text: e.target.value } : x))} />
          </div>
        ))}
        <Btn variant="outline" size="sm" onClick={() => onChange([...items, { title: "New item", text: "" }])}><Plus size={13} />Add</Btn>
      </div>
    </div>
  );
  return (
    <div>
      <PageHead title="Homepage" sub="Every section of the landing page, editable without code. Featured programs are starred in Programs." actions={<Btn variant="gold" onClick={save}><Check size={15} />Save & Publish</Btn>} />
      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-[#fbfbf6] border border-pine-900/10 rounded-lg p-6 space-y-4">
          <h3 className="font-display font-bold uppercase text-xl text-pine-900">Hero Section</h3>
          <Field label="Hero Title"><textarea className="field" rows={2} value={f.heroTitle} onChange={e => set("heroTitle", e.target.value)} /></Field>
          <Field label="Hero Description"><textarea className="field" rows={3} value={f.heroDescription} onChange={e => set("heroDescription", e.target.value)} /></Field>
          <MediaPicker value={f.heroImage} onChange={v => set("heroImage", v)} label="Hero Background Image" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Primary Button Label"><input className="field" value={f.heroCtaPrimary} onChange={e => set("heroCtaPrimary", e.target.value)} /></Field>
            <Field label="Primary Button URL"><input className="field" value={f.heroCtaPrimaryUrl} onChange={e => set("heroCtaPrimaryUrl", e.target.value)} /></Field>
            <Field label="Secondary Button Label"><input className="field" value={f.heroCtaSecondary} onChange={e => set("heroCtaSecondary", e.target.value)} /></Field>
            <Field label="Secondary Button URL"><input className="field" value={f.heroCtaSecondaryUrl} onChange={e => set("heroCtaSecondaryUrl", e.target.value)} /></Field>
          </div>
        </section>
        <section className="bg-[#fbfbf6] border border-pine-900/10 rounded-lg p-6 space-y-4">
          <h3 className="font-display font-bold uppercase text-xl text-pine-900">About / Mission / Vision</h3>
          <Field label="About Title"><input className="field" value={f.aboutTitle} onChange={e => set("aboutTitle", e.target.value)} /></Field>
          <Field label="About Text"><textarea className="field" rows={3} value={f.aboutText} onChange={e => set("aboutText", e.target.value)} /></Field>
          <Field label="Mission"><textarea className="field" rows={2} value={f.mission} onChange={e => set("mission", e.target.value)} /></Field>
          <Field label="Vision"><textarea className="field" rows={2} value={f.vision} onChange={e => set("vision", e.target.value)} /></Field>
          <Field label="Objectives (one per line)">
            <textarea className="field" rows={4} value={f.objectives.join("\n")} onChange={e => set("objectives", e.target.value.split("\n").filter(x => x.trim()))} />
          </Field>
        </section>
        <section className="bg-[#fbfbf6] border border-pine-900/10 rounded-lg p-6 space-y-4">
          <h3 className="font-display font-bold uppercase text-xl text-pine-900">Core Values</h3>
          {listEditor("Values shown on the homepage", f.coreValues, v => set("coreValues", v), ["clock", "flag", "users", "heart", "award"])}
        </section>
        <section className="bg-[#fbfbf6] border border-pine-900/10 rounded-lg p-6 space-y-4">
          <h3 className="font-display font-bold uppercase text-xl text-pine-900">Statistics & Testimonials</h3>
          <div>
            <span className="field-label">Animated counters</span>
            <div className="space-y-2">
              {f.stats.map((st, i) => (
                <div key={i} className="flex gap-2">
                  <input className="field flex-1" placeholder="Label" value={st.label} onChange={e => set("stats", f.stats.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                  <input type="number" className="field w-28" placeholder="Value" value={st.value} onChange={e => set("stats", f.stats.map((x, j) => j === i ? { ...x, value: parseInt(e.target.value) || 0 } : x))} />
                  <input className="field w-20" placeholder="Suffix" value={st.suffix ?? ""} onChange={e => set("stats", f.stats.map((x, j) => j === i ? { ...x, suffix: e.target.value } : x))} />
                  <button onClick={() => set("stats", f.stats.filter((_, j) => j !== i))} className="px-3 rounded bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100" aria-label="Remove stat">✕</button>
                </div>
              ))}
              <Btn variant="outline" size="sm" onClick={() => set("stats", [...f.stats, { label: "New stat", value: 0 }])}><Plus size={13} />Add</Btn>
            </div>
          </div>
          <div>
            <span className="field-label">Testimonials</span>
            <div className="space-y-3">
              {f.testimonials.map((t, i) => (
                <div key={i} className="border border-pine-900/10 rounded-md p-3 bg-[#fbfbf6]">
                  <div className="flex gap-2">
                    <input className="field flex-1" placeholder="Name" value={t.name} onChange={e => set("testimonials", f.testimonials.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                    <input className="field flex-1" placeholder="Role" value={t.role} onChange={e => set("testimonials", f.testimonials.map((x, j) => j === i ? { ...x, role: e.target.value } : x))} />
                    <button onClick={() => set("testimonials", f.testimonials.filter((_, j) => j !== i))} className="px-3 rounded bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100" aria-label="Remove testimonial">✕</button>
                  </div>
                  <textarea className="field mt-2" rows={2} placeholder="Quote" value={t.quote} onChange={e => set("testimonials", f.testimonials.map((x, j) => j === i ? { ...x, quote: e.target.value } : x))} />
                </div>
              ))}
              <Btn variant="outline" size="sm" onClick={() => set("testimonials", [...f.testimonials, { name: "", role: "", quote: "" }])}><Plus size={13} />Add</Btn>
            </div>
          </div>
        </section>
      </div>
      <div className="mt-6 flex justify-end"><Btn variant="gold" size="lg" onClick={save}><Check size={16} />Save & Publish Homepage</Btn></div>
    </div>
  );
}

/* ================= DONATIONS SETTINGS ================= */
export function DonationsAdmin() {
  const { db, patchSettings, toast, logActivity } = useStore();
  const [f, setF] = useState({ ...db.settings.donation });
  const save = () => {
    patchSettings({ donation: f });
    logActivity("Donation details updated", "donations");
    toast("Donation details saved — live on the Support page.");
  };
  return (
    <div>
      <PageHead title="Donations" sub="Bank and mobile money details shown on the public Support PACOSA page. Nothing is hard-coded." actions={<Btn variant="gold" onClick={save}><Check size={15} />Save</Btn>} />
      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-[#fbfbf6] border border-pine-900/10 rounded-lg p-6 space-y-4">
          <h3 className="font-display font-bold uppercase text-xl text-pine-900">Introduction & Bank</h3>
          <Field label="Intro Text"><textarea className="field" rows={3} value={f.intro} onChange={e => setF({ ...f, intro: e.target.value })} /></Field>
          <Field label="Bank Name"><input className="field" value={f.bankName} onChange={e => setF({ ...f, bankName: e.target.value })} /></Field>
          <Field label="Account Name"><input className="field" value={f.accountName} onChange={e => setF({ ...f, accountName: e.target.value })} /></Field>
          <Field label="Account Number"><input className="field" value={f.bankAccount} onChange={e => setF({ ...f, bankAccount: e.target.value })} /></Field>
          <Field label="Branch"><input className="field" value={f.branch} onChange={e => setF({ ...f, branch: e.target.value })} /></Field>
        </section>
        <section className="bg-[#fbfbf6] border border-pine-900/10 rounded-lg p-6 space-y-4">
          <h3 className="font-display font-bold uppercase text-xl text-pine-900">Mobile Money</h3>
          {f.momo.map((m, i) => (
            <div key={i} className="border border-pine-900/10 rounded-md p-3">
              <div className="flex gap-2">
                <input className="field flex-1" placeholder="Network" value={m.network} onChange={e => setF({ ...f, momo: f.momo.map((x, j) => j === i ? { ...x, network: e.target.value } : x) })} />
                <button onClick={() => setF({ ...f, momo: f.momo.filter((_, j) => j !== i) })} className="px-3 rounded bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100" aria-label="Remove network">✕</button>
              </div>
              <div className="flex gap-2 mt-2">
                <input className="field flex-1" placeholder="Number" value={m.number} onChange={e => setF({ ...f, momo: f.momo.map((x, j) => j === i ? { ...x, number: e.target.value } : x) })} />
                <input className="field flex-1" placeholder="Account name" value={m.name} onChange={e => setF({ ...f, momo: f.momo.map((x, j) => j === i ? { ...x, name: e.target.value } : x) })} />
              </div>
            </div>
          ))}
          <Btn variant="outline" size="sm" onClick={() => setF({ ...f, momo: [...f.momo, { network: "", number: "", name: "" }] })}><Plus size={13} />Add network</Btn>
          <Field label="Instructions (one per line)">
            <textarea className="field" rows={4} value={f.instructions.join("\n")} onChange={e => setF({ ...f, instructions: e.target.value.split("\n").filter(x => x.trim()) })} />
          </Field>
        </section>
      </div>
      <div className="mt-6 flex justify-end"><Btn variant="gold" size="lg" onClick={save}><Check size={16} />Save Donation Settings</Btn></div>
    </div>
  );
}

/* ================= WEBSITE SETTINGS ================= */
export function SettingsAdmin() {
  const { db, patchSettings, toast, logActivity } = useStore();
  const s = db.settings;
  const [tab, setTab] = useState("general");
  const [f, setF] = useState({ ...s, social: { ...s.social }, seo: { ...s.seo }, smtp: { ...s.smtp } });
  const set = (k: keyof typeof f, v: unknown) => setF(prev => ({ ...prev, [k]: v }));
  const setSoc = (k: keyof typeof f.social, v: string) => setF(prev => ({ ...prev, social: { ...prev.social, [k]: v } }));
  const setSeo = (k: keyof typeof f.seo, v: string) => setF(prev => ({ ...prev, seo: { ...prev.seo, [k]: v } }));
  const setSmtp = (k: keyof typeof f.smtp, v: unknown) => setF(prev => ({ ...prev, smtp: { ...prev.smtp, [k]: v } }));
  const save = () => {
    patchSettings({ ...f });
    logActivity("Website settings updated", "settings");
    toast("Settings saved.");
  };
  const tabs = [["general", "General"], ["branding", "Branding"], ["contact", "Contact"], ["social", "Social Media"], ["seo", "SEO"], ["email", "Email / SMTP"]];
  return (
    <div>
      <PageHead title="Website Settings" sub="Central configuration for the whole platform." actions={<Btn variant="gold" onClick={save}><Check size={15} />Save Settings</Btn>} />
      <div className="flex gap-2 flex-wrap mb-6">
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2.5 rounded-[4px] text-[0.72rem] font-bold uppercase tracking-[0.12em] transition-all ${tab === k ? "bg-pine-900 text-gold-300" : "bg-pine-100 text-pine-800 hover:bg-pine-200"}`}>{l}</button>
        ))}
      </div>
      <div className="bg-[#fbfbf6] border border-pine-900/10 rounded-lg p-6 max-w-3xl">
        {tab === "general" && (
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Organization Name"><input className="field" value={f.orgName} onChange={e => set("orgName", e.target.value)} /></Field>
            <Field label="Subtitle"><input className="field" value={f.subtitle} onChange={e => set("subtitle", e.target.value)} /></Field>
            <div className="sm:col-span-2"><Field label="Full Official Name / Tagline"><input className="field" value={f.tagline} onChange={e => set("tagline", e.target.value)} /></Field></div>
            <div className="sm:col-span-2"><Field label="Website Description"><textarea className="field" rows={3} value={f.description} onChange={e => set("description", e.target.value)} /></Field></div>
            <div className="sm:col-span-2"><Field label="Footer Text"><textarea className="field" rows={2} value={f.footerText} onChange={e => set("footerText", e.target.value)} /></Field></div>
          </div>
        )}
        {tab === "branding" && (
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2"><MediaPicker value={f.logo ?? ""} onChange={v => set("logo", v || null)} label="Site Logo (replaces the crest when set)" /></div>
            <div className="sm:col-span-2"><MediaPicker value={f.footerLogo ?? ""} onChange={v => set("footerLogo", v || null)} label="Footer Logo" /></div>
            <Field label="Primary Color">
              <div className="flex items-center gap-3"><input type="color" value={f.primaryColor} onChange={e => set("primaryColor", e.target.value)} className="w-12 h-10 rounded border border-pine-900/20 cursor-pointer" /><input className="field flex-1" value={f.primaryColor} onChange={e => set("primaryColor", e.target.value)} /></div>
            </Field>
            <Field label="Accent Color">
              <div className="flex items-center gap-3"><input type="color" value={f.accentColor} onChange={e => set("accentColor", e.target.value)} className="w-12 h-10 rounded border border-pine-900/20 cursor-pointer" /><input className="field flex-1" value={f.accentColor} onChange={e => set("accentColor", e.target.value)} /></div>
            </Field>
          </div>
        )}
        {tab === "contact" && (
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Email"><input className="field" value={f.email} onChange={e => set("email", e.target.value)} /></Field>
            <Field label="Phone"><input className="field" value={f.phone} onChange={e => set("phone", e.target.value)} /></Field>
            <div className="sm:col-span-2"><Field label="Address"><input className="field" value={f.address} onChange={e => set("address", e.target.value)} /></Field></div>
            <div className="sm:col-span-2"><Field label="Map Location (Google Maps query)"><input className="field" value={f.mapQuery} onChange={e => set("mapQuery", e.target.value)} /></Field></div>
          </div>
        )}
        {tab === "social" && (
          <div className="grid sm:grid-cols-2 gap-5">
            {(["facebook", "instagram", "tiktok", "youtube", "x", "linkedin", "whatsapp"] as const).map(k => (
              <Field key={k} label={k === "x" ? "X (Twitter)" : k.charAt(0).toUpperCase() + k.slice(1)}>
                <input className="field" value={f.social[k]} onChange={e => setSoc(k, e.target.value)} placeholder="https://…" />
              </Field>
            ))}
          </div>
        )}
        {tab === "seo" && (
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2"><Field label="Site Title"><input className="field" value={f.seo.title} onChange={e => setSeo("title", e.target.value)} /></Field></div>
            <div className="sm:col-span-2"><Field label="Meta Description"><textarea className="field" rows={2} value={f.seo.description} onChange={e => setSeo("description", e.target.value)} /></Field></div>
            <div className="sm:col-span-2"><Field label="Keywords"><input className="field" value={f.seo.keywords} onChange={e => setSeo("keywords", e.target.value)} /></Field></div>
            <div className="sm:col-span-2"><Field label="Google Site Verification" hint="Paste the content value of your verification meta tag."><input className="field" value={f.seo.verification} onChange={e => setSeo("verification", e.target.value)} /></Field></div>
          </div>
        )}
        {tab === "email" && (
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="SMTP Host"><input className="field" value={f.smtp.host} onChange={e => setSmtp("host", e.target.value)} /></Field>
            <Field label="SMTP Port"><input className="field" value={f.smtp.port} onChange={e => setSmtp("port", e.target.value)} /></Field>
            <Field label="SMTP User"><input className="field" value={f.smtp.user} onChange={e => setSmtp("user", e.target.value)} /></Field>
            <Field label="From Name"><input className="field" value={f.smtp.fromName} onChange={e => setSmtp("fromName", e.target.value)} /></Field>
            <div className="sm:col-span-2"><Field label="Notification Recipients" hint="Comma-separated admin emails that receive application/message alerts."><input className="field" value={f.smtp.notifyEmails} onChange={e => setSmtp("notifyEmails", e.target.value)} /></Field></div>
            <label className="flex items-center gap-3 cursor-pointer sm:col-span-2"><input type="checkbox" checked={f.smtp.enabled} onChange={e => setSmtp("enabled", e.target.checked)} className="w-4 h-4 accent-[#c29b3c]" /><span className="text-sm font-semibold text-pine-900">Email notifications enabled (application alerts, approval confirmations, subscriber digests)</span></label>
          </div>
        )}
        <div className="mt-6 pt-4 border-t border-pine-900/10 flex justify-end"><Btn variant="pine" onClick={save}>Save Settings</Btn></div>
      </div>
    </div>
  );
}
