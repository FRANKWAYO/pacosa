import { useState, type ReactNode } from "react";
import { Plus, Search, Eye, PencilLine, Star, ArrowUp, ArrowDown, Send } from "lucide-react";
import { useStore, uid, fmtDate } from "../lib/store";
import { Btn, Modal, SmartImg, Pill, PageHead, Field, MediaPicker, RichText, ConfirmBtn, EmptyState } from "../components/ui";
import { PROGRAM_CATEGORIES, EVENT_CATEGORIES, NEWS_CATEGORIES } from "../lib/types";
import type { Program, EventItem, Article, Leader, Page } from "../lib/types";

/* ---------- shared bits ---------- */
function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative flex-1 max-w-sm">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-inksoft" />
      <input className="field pl-9" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
    </div>
  );
}

function StatusPill({ s }: { s: string }) {
  const tone = s === "published" ? "green" : s === "draft" ? "gray" : s === "completed" ? "pine" : s === "scheduled" ? "gold" : "red";
  return <Pill tone={tone}>{s}</Pill>;
}

function PreviewModal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  return (
    <Modal open={open} onClose={onClose} title={`Live preview — ${title}`} wide>
      <div className="mb-4 flex items-center gap-2 bg-gold-100 border border-gold-500/50 rounded-md px-4 py-2.5 text-[0.75rem] font-semibold text-gold-700">
        <Eye size={14} /> This is exactly how visitors will see it once published.
      </div>
      {children}
    </Modal>
  );
}

function RowShell({ children }: { children: ReactNode }) {
  return <div className="bg-[#fbfbf6] border border-pine-900/10 rounded-lg overflow-hidden divide-y divide-pine-900/8">{children}</div>;
}
function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-4 px-5 py-3.5 hover:bg-pine-50/70 transition-colors">{children}</div>;
}
function Actions({ children }: { children: ReactNode }) {
  return <div className="ml-auto flex items-center gap-1.5">{children}</div>;
}
function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return <button title={label} aria-label={label} onClick={onClick} className="p-2 rounded hover:bg-pine-100 text-pine-700 transition-colors">{children}</button>;
}

/* ================= PROGRAMS ================= */
const blankProgram = (): Program => ({ id: "", title: "", description: "", image: "", startDate: new Date().toISOString().slice(0, 10), endDate: "", time: "", location: "", organizer: "National Secretariat", category: PROGRAM_CATEGORIES[0], registrationUrl: "", status: "draft", featured: false, registrationOpen: true, createdAt: new Date().toISOString() });

export function ProgramsAdmin() {
  const { db, update, toast, logActivity } = useStore();
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState<Program | null>(null);
  const [preview, setPreview] = useState<Program | null>(null);
  const list = db.programs.filter(p => (p.title + p.category + p.location).toLowerCase().includes(q.toLowerCase()));
  const set = (k: keyof Program, v: unknown) => setDraft(d => d ? { ...d, [k]: v } : d);

  const save = () => {
    if (!draft || !draft.title.trim()) { toast("Program name is required.", "error"); return; }
    const isNew = !draft.id;
    const item = { ...draft, id: draft.id || uid("p") };
    update(d => ({ ...d, programs: isNew ? [item, ...d.programs] : d.programs.map(p => p.id === item.id ? item : p) }));
    logActivity(item.status === "published" ? (isNew ? `New program published: "${item.title}"` : `Program updated: "${item.title}"`) : `Program saved as draft: "${item.title}"`, "program");
    toast(isNew ? "Program created." : "Program updated.");
    setDraft(null);
  };
  const toggleStatus = (p: Program) => {
    const status = p.status === "published" ? "draft" : "published";
    update(d => ({ ...d, programs: d.programs.map(x => x.id === p.id ? { ...x, status } : x) }));
    logActivity(status === "published" ? `Program published: "${p.title}"` : `Program unpublished: "${p.title}"`, "program");
    toast(status === "published" ? "Published — now live on the website." : "Moved to drafts.");
  };

  return (
    <div>
      <PageHead title="Programs" sub="Create, edit, publish and feature the association's programs." actions={<Btn variant="gold" onClick={() => setDraft(blankProgram())}><Plus size={15} />Add Program</Btn>} />
      <div className="flex gap-3 mb-5"><SearchBox value={q} onChange={setQ} placeholder="Search programs…" /></div>
      {list.length === 0 ? <EmptyState title="No programs yet" text="Add your first program — it will appear on the public site the moment you publish it." /> : (
        <RowShell>
          {list.map(p => (
            <Row key={p.id}>
              <SmartImg src={p.image} alt="" className="w-16 h-12 rounded object-cover flex-shrink-0" />
              <div className="min-w-[200px] flex-1">
                <div className="font-semibold text-pine-900">{p.title}</div>
                <div className="text-[0.72rem] text-inksoft">{p.category} • {fmtDate(p.startDate)} • {p.location}</div>
              </div>
              <StatusPill s={p.status} />
              <button title={p.featured ? "Unfeature" : "Feature on homepage"} aria-label="Toggle featured" onClick={() => { update(d => ({ ...d, programs: d.programs.map(x => x.id === p.id ? { ...x, featured: !x.featured } : x) })); toast(p.featured ? "Removed from homepage features." : "Featured on homepage."); }}
                className={`p-2 rounded transition-colors ${p.featured ? "text-gold-500 bg-gold-100" : "text-pine-300 hover:text-gold-500"}`}><Star size={17} fill={p.featured ? "currentColor" : "none"} /></button>
              <Actions>
                <IconBtn label="Preview" onClick={() => setPreview(p)}><Eye size={16} /></IconBtn>
                <IconBtn label="Edit" onClick={() => setDraft({ ...p })}><PencilLine size={16} /></IconBtn>
                <IconBtn label={p.status === "published" ? "Unpublish" : "Publish"} onClick={() => toggleStatus(p)}><Send size={16} /></IconBtn>
                <ConfirmBtn onConfirm={() => { update(d => ({ ...d, programs: d.programs.filter(x => x.id !== p.id) })); logActivity(`Program deleted: "${p.title}"`, "program"); toast("Program deleted."); }} />
              </Actions>
            </Row>
          ))}
        </RowShell>
      )}

      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? "Edit Program" : "Add Program"} wide>
        {draft && (
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2"><Field label="Program Name *"><input className="field" value={draft.title} onChange={e => set("title", e.target.value)} /></Field></div>
            <div className="sm:col-span-2"><Field label="Description"><textarea className="field" rows={3} value={draft.description} onChange={e => set("description", e.target.value)} /></Field></div>
            <div className="sm:col-span-2"><MediaPicker value={draft.image} onChange={v => set("image", v)} label="Featured Image" /></div>
            <Field label="Start Date"><input type="date" className="field" value={draft.startDate} onChange={e => set("startDate", e.target.value)} /></Field>
            <Field label="End Date"><input type="date" className="field" value={draft.endDate ?? ""} onChange={e => set("endDate", e.target.value)} /></Field>
            <Field label="Time"><input className="field" value={draft.time} onChange={e => set("time", e.target.value)} placeholder="e.g. 08:00 – 16:00" /></Field>
            <Field label="Location"><input className="field" value={draft.location} onChange={e => set("location", e.target.value)} /></Field>
            <Field label="Organizer"><input className="field" value={draft.organizer} onChange={e => set("organizer", e.target.value)} /></Field>
            <Field label="Category">
              <select className="field" value={draft.category} onChange={e => set("category", e.target.value)}>{PROGRAM_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
            </Field>
            <Field label="Registration URL" hint="Optional external registration link."><input className="field" value={draft.registrationUrl} onChange={e => set("registrationUrl", e.target.value)} placeholder="https://…" /></Field>
            <Field label="Status">
              <select className="field" value={draft.status} onChange={e => set("status", e.target.value)}>
                {["draft", "published", "completed", "cancelled"].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <label className="flex items-center gap-3 self-end pb-2 cursor-pointer"><input type="checkbox" checked={draft.featured} onChange={e => set("featured", e.target.checked)} className="w-4 h-4 accent-[#c29b3c]" /><span className="text-sm font-semibold text-pine-900">Featured on homepage</span></label>
            <label className="flex items-center gap-3 self-end pb-2 cursor-pointer"><input type="checkbox" checked={draft.registrationOpen} onChange={e => set("registrationOpen", e.target.checked)} className="w-4 h-4 accent-[#c29b3c]" /><span className="text-sm font-semibold text-pine-900">Registration open</span></label>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2 border-t border-pine-900/10">
              <Btn variant="ghost" onClick={() => setDraft(null)}>Cancel</Btn>
              <Btn variant="pine" onClick={save}>Save Program</Btn>
            </div>
          </div>
        )}
      </Modal>

      {preview && (
        <PreviewModal open onClose={() => setPreview(null)} title={preview.title}>
          <div className="overflow-hidden rounded-md aspect-[16/8]"><SmartImg src={preview.image} alt={preview.title} className="w-full h-full object-cover" /></div>
          <div className="flex items-center gap-2 mt-4"><Pill tone="gold">{preview.category}</Pill><StatusPill s={preview.status} /></div>
          <h3 className="font-display font-bold uppercase text-3xl text-pine-900 mt-3">{preview.title}</h3>
          <p className="text-inksoft leading-relaxed mt-3">{preview.description}</p>
          <div className="grid sm:grid-cols-2 gap-3 mt-5 text-sm">
            <div className="bg-pine-50 rounded p-3"><span className="font-bold text-pine-800">Date:</span> {fmtDate(preview.startDate)}{preview.endDate ? ` — ${fmtDate(preview.endDate)}` : ""}</div>
            <div className="bg-pine-50 rounded p-3"><span className="font-bold text-pine-800">Time:</span> {preview.time || "—"}</div>
            <div className="bg-pine-50 rounded p-3"><span className="font-bold text-pine-800">Location:</span> {preview.location || "—"}</div>
            <div className="bg-pine-50 rounded p-3"><span className="font-bold text-pine-800">Organizer:</span> {preview.organizer}</div>
          </div>
        </PreviewModal>
      )}
    </div>
  );
}

/* ================= EVENTS ================= */
const blankEvent = (): EventItem => ({ id: "", title: "", description: "", date: new Date().toISOString().slice(0, 10), startTime: "09:00", endTime: "", location: "", category: EVENT_CATEGORIES[0], image: "", status: "published" });

export function EventsAdmin() {
  const { db, update, toast, logActivity } = useStore();
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState<EventItem | null>(null);
  const list = db.events.filter(e => (e.title + e.location + e.category).toLowerCase().includes(q.toLowerCase())).sort((a, b) => b.date.localeCompare(a.date));
  const set = (k: keyof EventItem, v: unknown) => setDraft(d => d ? { ...d, [k]: v } : d);
  const save = () => {
    if (!draft || !draft.title.trim()) { toast("Event title is required.", "error"); return; }
    const isNew = !draft.id;
    const item = { ...draft, id: draft.id || uid("e") };
    update(d => ({ ...d, events: isNew ? [item, ...d.events] : d.events.map(x => x.id === item.id ? item : x) }));
    logActivity(isNew ? `New event created: "${item.title}"` : `Event updated: "${item.title}"`, "event");
    toast(isNew ? "Event created." : "Event updated.");
    setDraft(null);
  };
  return (
    <div>
      <PageHead title="Events" sub="The national calendar — everything here feeds the public events page." actions={<Btn variant="gold" onClick={() => setDraft(blankEvent())}><Plus size={15} />Add Event</Btn>} />
      <div className="flex gap-3 mb-5"><SearchBox value={q} onChange={setQ} placeholder="Search events…" /></div>
      {list.length === 0 ? <EmptyState title="No events yet" text="Create an event and it appears on the calendar instantly." /> : (
        <RowShell>
          {list.map(e => (
            <Row key={e.id}>
              <div className="w-14 text-center bg-pine-900 text-paper rounded py-1.5 flex-shrink-0">
                <div className="font-display font-bold text-xl leading-none">{new Date(e.date + "T12:00:00").getDate()}</div>
                <div className="text-[0.56rem] uppercase tracking-wider">{new Date(e.date + "T12:00:00").toLocaleDateString("en-GB", { month: "short" })}</div>
              </div>
              <div className="min-w-[200px] flex-1">
                <div className="font-semibold text-pine-900">{e.title}</div>
                <div className="text-[0.72rem] text-inksoft">{e.category} • {e.startTime} • {e.location}</div>
              </div>
              <StatusPill s={e.status} />
              <Actions>
                <IconBtn label="Edit" onClick={() => setDraft({ ...e })}><PencilLine size={16} /></IconBtn>
                <ConfirmBtn onConfirm={() => { update(d => ({ ...d, events: d.events.filter(x => x.id !== e.id) })); logActivity(`Event deleted: "${e.title}"`, "event"); toast("Event deleted."); }} />
              </Actions>
            </Row>
          ))}
        </RowShell>
      )}
      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? "Edit Event" : "Add Event"} wide>
        {draft && (
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2"><Field label="Event Title *"><input className="field" value={draft.title} onChange={e => set("title", e.target.value)} /></Field></div>
            <div className="sm:col-span-2"><Field label="Description"><textarea className="field" rows={3} value={draft.description} onChange={e => set("description", e.target.value)} /></Field></div>
            <Field label="Date"><input type="date" className="field" value={draft.date} onChange={e => set("date", e.target.value)} /></Field>
            <Field label="Start Time"><input type="time" className="field" value={draft.startTime} onChange={e => set("startTime", e.target.value)} /></Field>
            <Field label="End Time"><input type="time" className="field" value={draft.endTime ?? ""} onChange={e => set("endTime", e.target.value)} /></Field>
            <Field label="Location"><input className="field" value={draft.location} onChange={e => set("location", e.target.value)} /></Field>
            <Field label="Category"><select className="field" value={draft.category} onChange={e => set("category", e.target.value)}>{EVENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Status"><select className="field" value={draft.status} onChange={e => set("status", e.target.value)}><option value="published">published</option><option value="draft">draft</option></select></Field>
            <div className="sm:col-span-2"><MediaPicker value={draft.image ?? ""} onChange={v => set("image", v)} label="Event Image (optional)" /></div>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2 border-t border-pine-900/10">
              <Btn variant="ghost" onClick={() => setDraft(null)}>Cancel</Btn>
              <Btn variant="pine" onClick={save}>Save Event</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ================= NEWS ================= */
const blankArticle = (): Article => ({ id: "", title: "", image: "", author: "", category: NEWS_CATEGORIES[0], tags: [], content: "", excerpt: "", status: "draft", publishAt: new Date().toISOString(), views: 0 });

export function NewsAdmin() {
  const { db, update, toast, logActivity } = useStore();
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState<Article | null>(null);
  const [preview, setPreview] = useState<Article | null>(null);
  const list = db.news.filter(n => (n.title + n.category + n.author).toLowerCase().includes(q.toLowerCase()));
  const set = (k: keyof Article, v: unknown) => setDraft(d => d ? { ...d, [k]: v } : d);
  const save = () => {
    if (!draft || !draft.title.trim()) { toast("Article title is required.", "error"); return; }
    const isNew = !draft.id;
    const item = { ...draft, id: draft.id || uid("n") };
    update(d => ({ ...d, news: isNew ? [item, ...d.news] : d.news.map(x => x.id === item.id ? item : x) }));
    logActivity(item.status === "published" ? (isNew ? `News article published: "${item.title}"` : `Article updated: "${item.title}"`) : `Article saved (${item.status}): "${item.title}"`, "news");
    toast(isNew ? "Article created." : "Article updated.");
    setDraft(null);
  };
  const publishNow = (n: Article) => {
    update(d => ({ ...d, news: d.news.map(x => x.id === n.id ? { ...x, status: "published" as const, publishAt: new Date().toISOString() } : x) }));
    logActivity(`News article published: "${n.title}"`, "news");
    if (db.settings.smtp.enabled) logActivity(`Subscribers notified about: "${n.title}"`, "email");
    toast("Published — live on the news page.");
  };
  return (
    <div>
      <PageHead title="News & Articles" sub="Draft → Preview → Publish. Scheduled articles go live at their publish date." actions={<Btn variant="gold" onClick={() => setDraft(blankArticle())}><Plus size={15} />Add Article</Btn>} />
      <div className="flex gap-3 mb-5"><SearchBox value={q} onChange={setQ} placeholder="Search articles…" /></div>
      {list.length === 0 ? <EmptyState title="No articles yet" text="Write your first dispatch for the news desk." /> : (
        <RowShell>
          {list.map(n => (
            <Row key={n.id}>
              <SmartImg src={n.image} alt="" className="w-16 h-12 rounded object-cover flex-shrink-0" />
              <div className="min-w-[200px] flex-1">
                <div className="font-semibold text-pine-900">{n.title}</div>
                <div className="text-[0.72rem] text-inksoft">{n.category} • {n.author || "—"} • {fmtDate(n.publishAt)} • {n.views.toLocaleString()} reads</div>
              </div>
              <StatusPill s={n.status} />
              <Actions>
                <IconBtn label="Preview" onClick={() => setPreview(n)}><Eye size={16} /></IconBtn>
                <IconBtn label="Edit" onClick={() => setDraft({ ...n })}><PencilLine size={16} /></IconBtn>
                {n.status !== "published" && <IconBtn label="Publish now" onClick={() => publishNow(n)}><Send size={16} /></IconBtn>}
                <ConfirmBtn onConfirm={() => { update(d => ({ ...d, news: d.news.filter(x => x.id !== n.id) })); logActivity(`Article deleted: "${n.title}"`, "news"); toast("Article deleted."); }} />
              </Actions>
            </Row>
          ))}
        </RowShell>
      )}

      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? "Edit Article" : "Add Article"} wide>
        {draft && (
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2"><Field label="Article Title *"><input className="field" value={draft.title} onChange={e => set("title", e.target.value)} /></Field></div>
            <div className="sm:col-span-2"><Field label="Excerpt" hint="Shown on cards and in search results."><textarea className="field" rows={2} value={draft.excerpt} onChange={e => set("excerpt", e.target.value)} /></Field></div>
            <div className="sm:col-span-2"><MediaPicker value={draft.image} onChange={v => set("image", v)} label="Featured Image" /></div>
            <Field label="Author"><input className="field" value={draft.author} onChange={e => set("author", e.target.value)} /></Field>
            <Field label="Category"><select className="field" value={draft.category} onChange={e => set("category", e.target.value)}>{NEWS_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Tags" hint="Comma separated."><input className="field" value={draft.tags.join(", ")} onChange={e => set("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))} /></Field>
            <Field label="Status">
              <select className="field" value={draft.status} onChange={e => set("status", e.target.value)}>
                <option value="draft">draft</option><option value="published">published</option><option value="scheduled">scheduled</option>
              </select>
            </Field>
            <Field label="Publish Date"><input type="datetime-local" className="field" value={draft.publishAt.slice(0, 16)} onChange={e => set("publishAt", e.target.value ? new Date(e.target.value).toISOString() : draft.publishAt)} /></Field>
            <div className="sm:col-span-2">
              <span className="field-label">Content (rich text)</span>
              <RichText value={draft.content} onChange={v => set("content", v)} />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2 border-t border-pine-900/10">
              <Btn variant="ghost" onClick={() => setDraft(null)}>Cancel</Btn>
              <Btn variant="pine" onClick={save}>Save Article</Btn>
            </div>
          </div>
        )}
      </Modal>

      {preview && (
        <PreviewModal open onClose={() => setPreview(null)} title={preview.title}>
          <div className="overflow-hidden rounded-md aspect-[16/8]"><SmartImg src={preview.image} alt={preview.title} className="w-full h-full object-cover" /></div>
          <div className="flex items-center gap-2 mt-4"><Pill tone="gold">{preview.category}</Pill><StatusPill s={preview.status} /><span className="text-[0.72rem] text-inksoft">{preview.author} • {fmtDate(preview.publishAt)}</span></div>
          <h3 className="font-display font-bold uppercase text-3xl text-pine-900 mt-3">{preview.title}</h3>
          <div className="rt-content mt-4" dangerouslySetInnerHTML={{ __html: preview.content }} />
        </PreviewModal>
      )}
    </div>
  );
}

/* ================= LEADERSHIP ================= */
export function LeadershipAdmin() {
  const { db, update, toast, logActivity } = useStore();
  const [draft, setDraft] = useState<Leader | null>(null);
  const list = [...db.leaders].sort((a, b) => a.order - b.order);
  const set = (k: keyof Leader, v: unknown) => setDraft(d => d ? { ...d, [k]: v } : d);
  const save = () => {
    if (!draft || !draft.name.trim()) { toast("Name is required.", "error"); return; }
    const isNew = !draft.id;
    const item = { ...draft, id: draft.id || uid("l"), order: draft.order || list.length + 1 };
    update(d => ({ ...d, leaders: isNew ? [...d.leaders, item] : d.leaders.map(x => x.id === item.id ? item : x) }));
    logActivity(`Leadership profile ${isNew ? "added" : "updated"}: ${item.name}`, "leadership");
    toast(isNew ? "Leader added." : "Leader updated.");
    setDraft(null);
  };
  const move = (l: Leader, dir: -1 | 1) => {
    const sorted = [...list];
    const i = sorted.findIndex(x => x.id === l.id);
    const j = i + dir;
    if (j < 0 || j >= sorted.length) return;
    [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
    update(d => ({ ...d, leaders: d.leaders.map(x => { const pos = sorted.findIndex(s => s.id === x.id); return pos >= 0 ? { ...x, order: pos + 1 } : x; }) }));
  };
  return (
    <div>
      <PageHead title="Leadership" sub="Executive profiles shown on the public leadership page. Reorder with the arrows." actions={<Btn variant="gold" onClick={() => setDraft({ id: "", name: "", position: "", order: list.length + 1, bio: "", background: "", photo: "", socials: [] })}><Plus size={15} />Add Leader</Btn>} />
      <RowShell>
        {list.map((l, i) => (
          <Row key={l.id}>
            <span className="font-display font-bold text-pine-300 text-xl w-8">{String(i + 1).padStart(2, "0")}</span>
            <div className="min-w-[200px] flex-1">
              <div className="font-semibold text-pine-900">{l.name}</div>
              <div className="text-[0.72rem] text-inksoft">{l.position}</div>
            </div>
            <Actions>
              <IconBtn label="Move up" onClick={() => move(l, -1)}><ArrowUp size={15} /></IconBtn>
              <IconBtn label="Move down" onClick={() => move(l, 1)}><ArrowDown size={15} /></IconBtn>
              <IconBtn label="Edit" onClick={() => setDraft({ ...l })}><PencilLine size={16} /></IconBtn>
              <ConfirmBtn onConfirm={() => { update(d => ({ ...d, leaders: d.leaders.filter(x => x.id !== l.id) })); logActivity(`Leader removed: ${l.name}`, "leadership"); toast("Leader removed."); }} />
            </Actions>
          </Row>
        ))}
      </RowShell>
      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? "Edit Leader" : "Add Leader"} wide>
        {draft && (
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Full Name *"><input className="field" value={draft.name} onChange={e => set("name", e.target.value)} /></Field>
            <Field label="Position *"><input className="field" value={draft.position} onChange={e => set("position", e.target.value)} /></Field>
            <div className="sm:col-span-2"><Field label="Biography"><textarea className="field" rows={3} value={draft.bio} onChange={e => set("bio", e.target.value)} /></Field></div>
            <Field label="Cadet / Association Background"><input className="field" value={draft.background} onChange={e => set("background", e.target.value)} /></Field>
            <Field label="Display Order"><input type="number" className="field" value={draft.order} onChange={e => set("order", parseInt(e.target.value) || 1)} /></Field>
            <div className="sm:col-span-2"><MediaPicker value={draft.photo ?? ""} onChange={v => set("photo", v)} label="Photograph (optional — monogram used if empty)" /></div>
            <div className="sm:col-span-2">
              <span className="field-label">Social Links</span>
              <div className="space-y-2">
                {draft.socials.map((sl, i) => (
                  <div key={i} className="flex gap-2">
                    <input className="field flex-1" placeholder="Label (e.g. LinkedIn)" value={sl.label} onChange={e => set("socials", draft.socials.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                    <input className="field flex-[2]" placeholder="https://…" value={sl.url} onChange={e => set("socials", draft.socials.map((x, j) => j === i ? { ...x, url: e.target.value } : x))} />
                    <button onClick={() => set("socials", draft.socials.filter((_, j) => j !== i))} className="px-3 rounded bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100">✕</button>
                  </div>
                ))}
                <Btn variant="outline" size="sm" onClick={() => set("socials", [...draft.socials, { label: "", url: "" }])}><Plus size={13} />Add link</Btn>
              </div>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2 border-t border-pine-900/10">
              <Btn variant="ghost" onClick={() => setDraft(null)}>Cancel</Btn>
              <Btn variant="pine" onClick={save}>Save Leader</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ================= PAGES ================= */
export function PagesAdmin() {
  const { db, update, toast, logActivity } = useStore();
  const [draft, setDraft] = useState<Page | null>(null);
  const set = (k: keyof Page, v: unknown) => setDraft(d => d ? { ...d, [k]: v } : d);
  const save = () => {
    if (!draft || !draft.title.trim()) { toast("Page title is required.", "error"); return; }
    const isNew = !draft.id;
    const slug = draft.slug.trim() || draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const item = { ...draft, id: draft.id || uid("pg"), slug, updatedAt: new Date().toISOString() };
    update(d => ({ ...d, pages: isNew ? [...d.pages, item] : d.pages.map(x => x.id === item.id ? item : x) }));
    logActivity(`Page ${isNew ? "created" : "updated"}: "${item.title}"`, "page");
    toast(isNew ? "Page created." : "Page updated.");
    setDraft(null);
  };
  return (
    <div>
      <PageHead title="Pages" sub="Standalone pages such as the constitution, policies or FAQs." actions={<Btn variant="gold" onClick={() => setDraft({ id: "", slug: "", title: "", content: "", seoTitle: "", seoDescription: "", published: true, updatedAt: new Date().toISOString() })}><Plus size={15} />Add Page</Btn>} />
      <RowShell>
        {db.pages.map(p => (
          <Row key={p.id}>
            <div className="min-w-[200px] flex-1">
              <div className="font-semibold text-pine-900">{p.title}</div>
              <div className="text-[0.72rem] text-inksoft">/{p.slug} • updated {fmtDate(p.updatedAt)}</div>
            </div>
            <StatusPill s={p.published ? "published" : "draft"} />
            <Actions>
              <IconBtn label="Edit" onClick={() => setDraft({ ...p })}><PencilLine size={16} /></IconBtn>
              <ConfirmBtn onConfirm={() => { update(d => ({ ...d, pages: d.pages.filter(x => x.id !== p.id) })); toast("Page deleted."); }} />
            </Actions>
          </Row>
        ))}
      </RowShell>
      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? "Edit Page" : "Add Page"} wide>
        {draft && (
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Page Title *"><input className="field" value={draft.title} onChange={e => set("title", e.target.value)} /></Field>
            <Field label="URL Slug" hint="Blank = generated from title."><input className="field" value={draft.slug} onChange={e => set("slug", e.target.value)} placeholder="e.g. constitution" /></Field>
            <Field label="SEO Title"><input className="field" value={draft.seoTitle} onChange={e => set("seoTitle", e.target.value)} /></Field>
            <Field label="SEO Description"><input className="field" value={draft.seoDescription} onChange={e => set("seoDescription", e.target.value)} /></Field>
            <div className="sm:col-span-2">
              <span className="field-label">Content</span>
              <RichText value={draft.content} onChange={v => set("content", v)} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={draft.published} onChange={e => set("published", e.target.checked)} className="w-4 h-4 accent-[#c29b3c]" /><span className="text-sm font-semibold text-pine-900">Published</span></label>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2 border-t border-pine-900/10">
              <Btn variant="ghost" onClick={() => setDraft(null)}>Cancel</Btn>
              <Btn variant="pine" onClick={save}>Save Page</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
