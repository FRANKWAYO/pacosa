import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X, Bold, Italic, List, ListOrdered, Link2, Quote, Heading2, Heading3, Eraser, Upload, Search, ChevronLeft, ChevronRight, ImagePlus, Check } from "lucide-react";
import { useStore, sanitizeHtml, processImageFile } from "../lib/store";
import type { MediaItem } from "../lib/types";

/* ---------- brand crest ---------- */
export function Crest({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden="true">
      <path d="M32 3 57 13.5v20c0 14.6-10.4 22.9-25 27C17.4 56.4 7 48.1 7 33.5v-20Z" fill="#20301f" stroke="#c29b3c" strokeWidth="2" />
      <path d="M32 9.5 51 17.4v16c0 11-7.8 17.6-19 20.8-11.2-3.2-19-9.8-19-20.8v-16Z" fill="#2b3e2b" />
      <path d="m32 15 3.4 7.1 7.6 1-5.6 5.2 1.5 7.6L32 32.2l-6.9 3.7 1.5-7.6-5.6-5.2 7.6-1Z" fill="#c29b3c" />
      <path d="m21 41.5 11-5.5 11 5.5v3.4H21zM21 47.6h22v3.2H21z" fill="#c29b3c" />
    </svg>
  );
}

export function Wordmark({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  const { db } = useStore();
  const s = db.settings;
  const crestSize = compact ? 38 : 46;
  return (
    <div className="flex items-center gap-3">
      {s.logo
        ? <SmartImg src={s.logo} alt={`${s.orgName} logo`} className="object-contain" style={{ width: crestSize, height: crestSize }} />
        : <Crest size={crestSize} />}
      <div className="leading-none">
        <div className={`font-display font-bold tracking-[0.08em] ${compact ? "text-2xl" : "text-3xl"} ${light ? "text-paper" : "text-pine-900"}`}>{s.orgName || "PACOSA"}</div>
        <div className={`text-[0.6rem] font-bold tracking-[0.34em] uppercase mt-1 ${light ? "text-gold-300" : "text-gold-600"}`}>{s.subtitle || "Cadets Association"}</div>
      </div>
    </div>
  );
}

/* ---------- reveal on scroll ---------- */
export function Reveal({ children, delay = 0, y = 26, className = "" }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- section heading ---------- */
export function SectionHead({ kicker, title, text, light = false, center = false }: { kicker: string; title: string; text?: string; light?: boolean; center?: boolean }) {
  return (
    <div className={`max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      <Reveal>
        <div className={`flex items-center gap-3 text-[0.7rem] font-bold tracking-[0.3em] uppercase ${light ? "text-gold-300" : "text-gold-600"} ${center ? "justify-center" : ""}`}>
          <span className="h-px w-8 bg-gold-500" /> {kicker}
        </div>
        <h2 className={`font-display font-bold uppercase leading-[1.02] mt-3 ${light ? "text-paper" : "text-pine-900"} text-4xl sm:text-5xl tracking-tight`}>{title}</h2>
        {text && <p className={`mt-4 text-[0.95rem] leading-relaxed ${light ? "text-pine-100/80" : "text-inksoft"}`}>{text}</p>}
      </Reveal>
    </div>
  );
}

/* ---------- buttons ---------- */
type BtnVariant = "gold" | "pine" | "outline" | "outlineLight" | "dark" | "ghost";
export function Btn({ variant = "pine", size = "md", href, onClick, children, className = "", type, disabled }: {
  variant?: BtnVariant; size?: "sm" | "md" | "lg"; href?: string; onClick?: () => void; children: ReactNode; className?: string; type?: "button" | "submit"; disabled?: boolean;
}) {
  const sizes = { sm: "px-4 py-2 text-[0.78rem]", md: "px-6 py-3 text-[0.82rem]", lg: "px-8 py-3.5 text-[0.9rem]" };
  const variants: Record<BtnVariant, string> = {
    gold: "bg-gold-500 text-pine-950 hover:bg-gold-400 shadow-[0_2px_14px_rgba(194,155,60,0.35)]",
    pine: "bg-pine-800 text-paper hover:bg-pine-700",
    dark: "bg-pine-950 text-paper hover:bg-pine-800",
    outline: "border border-pine-800/40 text-pine-800 hover:bg-pine-800 hover:text-paper",
    outlineLight: "border border-paper/40 text-paper hover:bg-paper hover:text-pine-900",
    ghost: "text-pine-800 hover:bg-pine-800/10",
  };
  const cls = `inline-flex items-center justify-center gap-2 font-bold uppercase tracking-[0.14em] rounded-[4px] transition-all duration-200 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${className}`;
  if (href) return <a href={href} className={cls}>{children}</a>;
  return <button type={type ?? "button"} disabled={disabled} onClick={onClick} className={cls}>{children}</button>;
}

export function Pill({ children, tone = "pine" }: { children: ReactNode; tone?: "pine" | "gold" | "red" | "gray" | "green" }) {
  const tones = {
    pine: "bg-pine-100 text-pine-800", gold: "bg-gold-100 text-gold-700", red: "bg-red-100 text-red-700",
    gray: "bg-stone-200 text-stone-600", green: "bg-emerald-100 text-emerald-700",
  };
  return <span className={`inline-block px-2.5 py-1 rounded-[3px] text-[0.66rem] font-bold uppercase tracking-[0.12em] ${tones[tone]}`}>{children}</span>;
}

/* ---------- smart image with fallback ---------- */
export function SmartImg({ src, alt, className = "", style }: { src?: string; alt: string; className?: string; style?: CSSProperties }) {
  const [err, setErr] = useState(false);
  useEffect(() => setErr(false), [src]);
  if (!src || err) {
    return (
      <div className={`flex items-center justify-center bg-pine-800 topo-bg ${className}`} style={style} role="img" aria-label={alt}>
        <Crest size={Math.min(72, 72)} className="opacity-40" />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" className={className} style={style} onError={() => setErr(true)} />;
}

/* ---------- modal ---------- */
export function Modal({ open, onClose, title, children, wide = false }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-pine-950/70 backdrop-blur-[2px] p-4 sm:p-8" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div role="dialog" aria-modal="true" aria-label={title} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
        className={`w-full ${wide ? "max-w-5xl" : "max-w-2xl"} bg-paper rounded-lg shadow-2xl border border-pine-900/10 my-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-pine-900/10 sticky top-0 bg-paper z-10 rounded-t-lg">
          <h3 className="font-display font-bold uppercase text-xl text-pine-900 tracking-wide">{title}</h3>
          <button onClick={onClose} aria-label="Close dialog" className="p-2 rounded hover:bg-pine-100 text-pine-800"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}

/* ---------- lightbox ---------- */
export function Lightbox({ images, index, onClose, onNav }: { images: { url: string; caption?: string }[]; index: number; onClose: () => void; onNav: (i: number) => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav((index + 1) % images.length);
      if (e.key === "ArrowLeft") onNav((index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [index, images.length, onClose, onNav]);
  const img = images[index];
  return (
    <div className="fixed inset-0 z-[95] bg-pine-950/95 flex flex-col" role="dialog" aria-modal="true" aria-label="Image viewer">
      <div className="flex items-center justify-between px-5 py-4 text-paper">
        <span className="text-[0.72rem] font-bold tracking-[0.25em] uppercase text-gold-300">{index + 1} / {images.length}</span>
        <button onClick={onClose} aria-label="Close viewer" className="p-2 rounded hover:bg-paper/10"><X size={20} /></button>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-2 min-h-0">
        <img src={img.url} alt={img.caption ?? "Gallery image"} className="max-h-full max-w-full object-contain rounded shadow-2xl" />
      </div>
      {img.caption && <p className="text-center text-pine-100/80 text-sm px-8 py-3">{img.caption}</p>}
      <div className="flex items-center justify-center gap-6 pb-8 pt-2">
        <button onClick={() => onNav((index - 1 + images.length) % images.length)} aria-label="Previous image" className="p-3 rounded-full border border-paper/25 text-paper hover:bg-paper hover:text-pine-900 transition-colors"><ChevronLeft size={20} /></button>
        <button onClick={() => onNav((index + 1) % images.length)} aria-label="Next image" className="p-3 rounded-full border border-paper/25 text-paper hover:bg-paper hover:text-pine-900 transition-colors"><ChevronRight size={20} /></button>
      </div>
    </div>
  );
}

/* ---------- monogram avatar with chevrons ---------- */
export function Monogram({ name, size = 96, rankLines = 2, className = "" }: { name: string; size?: number; rankLines?: number; className?: string }) {
  const initials = name.replace(/^(Cmdr\.|Mr\.|Ms\.|Mrs\.|WO II|Sgt\.|Cpl\.|Cdt\.|Dr\.)\s*/i, "").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className={`relative flex flex-col items-center justify-center bg-pine-800 topo-bg overflow-hidden ${className}`} style={{ width: size, height: size }} role="img" aria-label={`${name} portrait placeholder`}>
      <span className="font-display font-bold text-gold-300" style={{ fontSize: size * 0.32, lineHeight: 1 }}>{initials}</span>
      <div className="mt-1.5 flex flex-col items-center gap-[3px]">
        {Array.from({ length: rankLines }).map((_, i) => (
          <svg key={i} width={size * 0.3 - i * 6} height={(size * 0.3 - i * 6) * 0.45} viewBox="0 0 30 14" aria-hidden="true">
            <path d="M2 12 15 4l13 8-2.5 2L15 8 4.5 14Z" fill="#c29b3c" />
          </svg>
        ))}
      </div>
    </div>
  );
}

/* ---------- rich text editor ---------- */
export function RichText({ value, onChange, minHeight = 220 }: { value: string; onChange: (html: string) => void; minHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value || ""; }, [value]);
  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    if (ref.current) onChange(sanitizeHtml(ref.current.innerHTML));
  };
  const addLink = () => {
    const url = window.prompt("Link URL (https://…)");
    if (url) exec("createLink", url);
  };
  const ToolBtn = ({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) => (
    <button type="button" title={label} aria-label={label} onMouseDown={e => e.preventDefault()} onClick={onClick}
      className="p-2 rounded hover:bg-pine-100 text-pine-800 transition-colors">{children}</button>
  );
  return (
    <div className="border border-[#d4d6c8] rounded-md bg-[#fbfbf6] overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-[#d4d6c8] bg-[#efefe6]">
        <ToolBtn label="Bold" onClick={() => exec("bold")}><Bold size={15} /></ToolBtn>
        <ToolBtn label="Italic" onClick={() => exec("italic")}><Italic size={15} /></ToolBtn>
        <ToolBtn label="Heading 2" onClick={() => exec("formatBlock", "<h2>")}><Heading2 size={15} /></ToolBtn>
        <ToolBtn label="Heading 3" onClick={() => exec("formatBlock", "<h3>")}><Heading3 size={15} /></ToolBtn>
        <ToolBtn label="Bulleted list" onClick={() => exec("insertUnorderedList")}><List size={15} /></ToolBtn>
        <ToolBtn label="Numbered list" onClick={() => exec("insertOrderedList")}><ListOrdered size={15} /></ToolBtn>
        <ToolBtn label="Insert link" onClick={addLink}><Link2 size={15} /></ToolBtn>
        <ToolBtn label="Blockquote" onClick={() => exec("formatBlock", "<blockquote>")}><Quote size={15} /></ToolBtn>
        <ToolBtn label="Clear formatting" onClick={() => exec("removeFormat")}><Eraser size={15} /></ToolBtn>
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning className="rt-content px-4 py-3 text-[0.92rem]" style={{ minHeight }}
        onInput={() => ref.current && onChange(sanitizeHtml(ref.current.innerHTML))} />
    </div>
  );
}

/* ---------- media picker ---------- */
export function MediaPicker({ value, onChange, label = "Featured image" }: { value: string; onChange: (url: string) => void; label?: string }) {
  const { db, update, toast, logActivity } = useStore();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const items = db.media.filter(m => m.name.toLowerCase().includes(q.toLowerCase()) || m.folder.toLowerCase().includes(q.toLowerCase()));

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const added: MediaItem[] = [];
      for (const f of Array.from(files)) {
        const { url, size } = await processImageFile(f);
        added.push({ id: "md-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name: f.name, url, size, type: f.type, folder: "Uploads", createdAt: new Date().toISOString() });
      }
      update(d => ({ ...d, media: [...added, ...d.media] }));
      logActivity(`Media uploaded: ${added.length} file(s)`, "media");
      toast(`${added.length} image(s) added to the media library`);
    } catch (e) { toast((e as Error).message, "error"); }
    setBusy(false);
  };

  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="flex items-start gap-3">
        <div className="w-28 h-20 rounded border border-[#d4d6c8] overflow-hidden flex-shrink-0 bg-pine-100">
          {value ? <SmartImg src={value} alt="Selected" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-pine-400"><ImagePlus size={20} /></div>}
        </div>
        <div className="flex flex-col gap-2">
          <Btn variant="outline" size="sm" onClick={() => setOpen(true)}>Choose from library</Btn>
          {value && <Btn variant="ghost" size="sm" onClick={() => onChange("")}>Remove image</Btn>}
        </div>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Media library" wide>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-inksoft" />
            <input className="field pl-9" placeholder="Search media…" value={q} onChange={e => setQ(e.target.value)} aria-label="Search media" />
          </div>
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-[4px] bg-pine-800 text-paper font-bold uppercase tracking-[0.12em] text-[0.75rem] cursor-pointer hover:bg-pine-700 transition-colors">
            <Upload size={14} /> {busy ? "Uploading…" : "Upload images"}
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={e => { void upload(e.target.files); e.target.value = ""; }} />
          </label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[52vh] overflow-y-auto pr-1">
          {items.map(m => (
            <button key={m.id} onClick={() => { onChange(m.url); setOpen(false); }}
              className={`group relative rounded overflow-hidden border-2 text-left transition-all ${value === m.url ? "border-gold-500" : "border-transparent hover:border-pine-400"}`}>
              <SmartImg src={m.url} alt={m.name} className="w-full h-28 object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-pine-950/80 text-paper text-[0.65rem] px-2 py-1 truncate">{m.name}</span>
              {value === m.url && <span className="absolute top-1.5 right-1.5 bg-gold-500 text-pine-950 rounded-full p-1"><Check size={12} /></span>}
            </button>
          ))}
          {items.length === 0 && <p className="col-span-full text-inksoft text-sm py-8 text-center">No media found. Upload images to build the library.</p>}
        </div>
      </Modal>
    </div>
  );
}

/* ---------- admin primitives ---------- */
export function PageHead({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display font-bold uppercase text-3xl text-pine-900 tracking-wide leading-none">{title}</h1>
        {sub && <p className="text-inksoft text-sm mt-1.5">{sub}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="block text-[0.7rem] text-inksoft mt-1">{hint}</span>}
    </label>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="text-center py-16 border border-dashed border-pine-300 rounded-lg">
      <Crest size={52} className="mx-auto opacity-30" />
      <h3 className="font-display font-bold uppercase text-xl text-pine-800 mt-4">{title}</h3>
      <p className="text-inksoft text-sm mt-1 max-w-sm mx-auto">{text}</p>
    </div>
  );
}

export function ConfirmBtn({ onConfirm, label = "Delete" }: { onConfirm: () => void; label?: string }) {
  const [arm, setArm] = useState(false);
  useEffect(() => { if (!arm) return; const t = setTimeout(() => setArm(false), 2600); return () => clearTimeout(t); }, [arm]);
  return (
    <button
      onClick={() => { if (arm) { onConfirm(); setArm(false); } else setArm(true); }}
      className={`px-2.5 py-1.5 rounded text-[0.68rem] font-bold uppercase tracking-wider transition-colors ${arm ? "bg-red-600 text-white" : "bg-red-50 text-red-700 hover:bg-red-100"}`}>
      {arm ? "Confirm?" : label}
    </button>
  );
}

/* ---------- toast host ---------- */
export function ToastHost() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="fixed bottom-5 right-5 z-[99] flex flex-col gap-2 max-w-sm" aria-live="polite">
      {toasts.map(t => (
        <motion.div key={t.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}
          className={`flex items-start gap-3 px-4 py-3 rounded-md shadow-xl border text-sm font-medium ${t.kind === "error" ? "bg-red-700 border-red-800 text-white" : t.kind === "info" ? "bg-pine-800 border-pine-900 text-paper" : "bg-pine-900 border-gold-500/50 text-paper"}`}>
          <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 pulse-dot" style={{ background: t.kind === "error" ? "#fca5a5" : "#c29b3c" }} />
          <span className="flex-1">{t.text}</span>
          <button onClick={() => dismissToast(t.id)} aria-label="Dismiss notification" className="opacity-70 hover:opacity-100"><X size={14} /></button>
        </motion.div>
      ))}
    </div>
  );
}
