import { useMemo, useRef, useState, type DragEvent } from "react";
import { Plus, Upload, Trash2, PencilLine, Search, Star, Play, Copy, Check, FolderOpen } from "lucide-react";
import { useStore, uid, processImageFile, fmtDate } from "../lib/store";
import { Btn, Modal, SmartImg, Pill, PageHead, Field, MediaPicker, ConfirmBtn, EmptyState } from "../components/ui";
import type { Album, GalleryImage, Video, MediaItem } from "../lib/types";

/* ================= GALLERY ADMIN ================= */
export function GalleryAdmin() {
  const { db, update, toast, logActivity } = useStore();
  const [selId, setSelId] = useState<string | null>(db.albums[0]?.id ?? null);
  const [newAlbum, setNewAlbum] = useState(false);
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumDesc, setAlbumDesc] = useState("");
  const [caption, setCaption] = useState<{ id: string; value: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const album = db.albums.find(a => a.id === selId) ?? null;

  const createAlbum = () => {
    if (!albumTitle.trim()) { toast("Album name is required.", "error"); return; }
    const a: Album = { id: uid("a"), title: albumTitle.trim(), description: albumDesc.trim(), images: [] };
    update(d => ({ ...d, albums: [...d.albums, a] }));
    logActivity(`Gallery album created: "${a.title}"`, "gallery");
    toast("Album created.");
    setSelId(a.id); setNewAlbum(false); setAlbumTitle(""); setAlbumDesc("");
  };

  const addImages = async (files: FileList | null) => {
    if (!album || !files?.length) return;
    setBusy(true);
    try {
      const imgs: GalleryImage[] = [];
      for (const f of Array.from(files)) {
        const { url } = await processImageFile(f);
        imgs.push({ id: uid("i"), url, caption: f.name.replace(/\.[^.]+$/, "") });
      }
      update(d => ({ ...d, albums: d.albums.map(a => a.id === album.id ? { ...a, cover: a.cover || imgs[0].url, images: [...a.images, ...imgs] } : a) }));
      logActivity(`Gallery updated: "${album.title}" — ${imgs.length} photo(s) added`, "gallery");
      toast(`${imgs.length} photo(s) added to "${album.title}".`);
    } catch (e) { toast((e as Error).message, "error"); }
    setBusy(false);
  };

  return (
    <div>
      <PageHead title="Photo Gallery" sub="Albums power the public gallery. Set covers, captions and order here." actions={<Btn variant="gold" onClick={() => setNewAlbum(true)}><Plus size={15} />New Album</Btn>} />
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <div className="space-y-2">
          {db.albums.map(a => (
            <button key={a.id} onClick={() => setSelId(a.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${selId === a.id ? "border-gold-500 bg-gold-100/50 shadow" : "border-pine-900/10 bg-[#fbfbf6] hover:border-pine-400"}`}>
              <SmartImg src={a.cover ?? a.images[0]?.url} alt="" className="w-14 h-11 rounded object-cover flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-pine-900 text-sm truncate">{a.title}</div>
                <div className="text-[0.68rem] text-inksoft">{a.images.length} photos</div>
              </div>
            </button>
          ))}
          {db.albums.length === 0 && <p className="text-inksoft text-sm p-4">No albums yet — create the first one.</p>}
        </div>

        {album ? (
          <div className="bg-[#fbfbf6] border border-pine-900/10 rounded-lg p-6">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <input className="field max-w-xs font-semibold" value={album.title} aria-label="Album name"
                onChange={e => update(d => ({ ...d, albums: d.albums.map(a => a.id === album.id ? { ...a, title: e.target.value } : a) }))} />
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[4px] bg-pine-800 text-paper font-bold uppercase tracking-[0.12em] text-[0.72rem] cursor-pointer hover:bg-pine-700 transition-colors">
                <Upload size={14} />{busy ? "Uploading…" : "Upload Photos"}
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={e => { void addImages(e.target.files); e.target.value = ""; }} />
              </label>
              <div className="ml-auto">
                <ConfirmBtn label="Delete Album" onConfirm={() => {
                  update(d => ({ ...d, albums: d.albums.filter(a => a.id !== album.id) }));
                  logActivity(`Gallery album deleted: "${album.title}"`, "gallery");
                  toast("Album deleted."); setSelId(db.albums.find(a => a.id !== album.id)?.id ?? null);
                }} />
              </div>
            </div>
            <textarea className="field mb-6 text-sm" rows={2} value={album.description} aria-label="Album description" placeholder="Album description…"
              onChange={e => update(d => ({ ...d, albums: d.albums.map(a => a.id === album.id ? { ...a, description: e.target.value } : a) }))} />
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {album.images.map(im => (
                <div key={im.id} className="group relative rounded-md overflow-hidden border border-pine-900/10">
                  <SmartImg src={im.url} alt={im.caption} className="w-full aspect-square object-cover" />
                  {album.cover === im.url && <span className="absolute top-2 left-2 bg-gold-500 text-pine-950 text-[0.58rem] font-bold uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1"><Star size={10} fill="currentColor" />Cover</span>}
                  <div className="absolute inset-x-0 bottom-0 bg-pine-950/85 p-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {caption?.id === im.id ? (
                      <input autoFocus className="flex-1 bg-paper/10 border border-gold-500/60 rounded px-2 py-1 text-paper text-xs" value={caption.value}
                        onChange={e => setCaption({ id: im.id, value: e.target.value })}
                        onBlur={() => { update(d => ({ ...d, albums: d.albums.map(a => a.id === album.id ? { ...a, images: a.images.map(x => x.id === im.id ? { ...x, caption: caption.value } : x) } : a) })); setCaption(null); toast("Caption updated."); }}
                        onKeyDown={e => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
                    ) : (
                      <>
                        <button title="Edit caption" aria-label="Edit caption" onClick={() => setCaption({ id: im.id, value: im.caption })} className="p-1.5 rounded text-paper hover:bg-paper/15"><PencilLine size={13} /></button>
                        <button title="Set as cover" aria-label="Set as album cover" onClick={() => { update(d => ({ ...d, albums: d.albums.map(a => a.id === album.id ? { ...a, cover: im.url } : a) })); toast("Cover updated."); }} className="p-1.5 rounded text-paper hover:bg-paper/15"><Star size={13} /></button>
                        <button title="Delete photo" aria-label="Delete photo" onClick={() => { update(d => ({ ...d, albums: d.albums.map(a => a.id === album.id ? { ...a, images: a.images.filter(x => x.id !== im.id) } : a) })); toast("Photo removed."); }} className="p-1.5 rounded text-paper hover:bg-red-500"><Trash2 size={13} /></button>
                        <span className="ml-auto text-[0.6rem] text-paper/60 truncate px-1">{im.caption}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {album.images.length === 0 && <p className="col-span-full text-inksoft text-sm py-10 text-center border border-dashed border-pine-300 rounded-md">This album is empty — upload photos to fill it.</p>}
            </div>
          </div>
        ) : <EmptyState title="Select an album" text="Choose an album on the left, or create a new one." />}
      </div>

      <Modal open={newAlbum} onClose={() => setNewAlbum(false)} title="New Album">
        <div className="space-y-4">
          <Field label="Album Name *"><input className="field" value={albumTitle} onChange={e => setAlbumTitle(e.target.value)} placeholder="e.g. Annual Events 2026" /></Field>
          <Field label="Description"><textarea className="field" rows={3} value={albumDesc} onChange={e => setAlbumDesc(e.target.value)} /></Field>
          <div className="flex justify-end gap-3"><Btn variant="ghost" onClick={() => setNewAlbum(false)}>Cancel</Btn><Btn variant="pine" onClick={createAlbum}>Create Album</Btn></div>
        </div>
      </Modal>
    </div>
  );
}

/* ================= VIDEOS ADMIN ================= */
const blankVideo = (): Video => ({ id: "", title: "", description: "", provider: "youtube", url: "", thumbnail: "", category: "Training", date: new Date().toISOString().slice(0, 10) });

export function VideosAdmin() {
  const { db, update, toast, logActivity } = useStore();
  const [draft, setDraft] = useState<Video | null>(null);
  const set = (k: keyof Video, v: unknown) => setDraft(d => d ? { ...d, [k]: v } : d);
  const save = () => {
    if (!draft || !draft.title.trim() || !draft.url.trim()) { toast("Title and video URL are required.", "error"); return; }
    const isNew = !draft.id;
    const item = { ...draft, id: draft.id || uid("v") };
    update(d => ({ ...d, videos: isNew ? [item, ...d.videos] : d.videos.map(x => x.id === item.id ? item : x) }));
    logActivity(`Video ${isNew ? "added" : "updated"}: "${item.title}"`, "video");
    toast(isNew ? "Video added." : "Video updated.");
    setDraft(null);
  };
  return (
    <div>
      <PageHead title="Videos" sub="YouTube and Vimeo links with custom thumbnails, shown in the public video gallery." actions={<Btn variant="gold" onClick={() => setDraft(blankVideo())}><Plus size={15} />Add Video</Btn>} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {db.videos.map(v => (
          <div key={v.id} className="bg-[#fbfbf6] border border-pine-900/10 rounded-lg overflow-hidden">
            <div className="relative aspect-video">
              <SmartImg src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center"><span className="w-11 h-11 rounded-full bg-gold-500 text-pine-950 flex items-center justify-center"><Play size={18} className="ml-0.5" fill="currentColor" /></span></span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2"><Pill tone="gold">{v.category}</Pill><span className="text-[0.68rem] text-inksoft">{fmtDate(v.date)}</span></div>
              <h3 className="font-semibold text-pine-900 mt-2 leading-snug">{v.title}</h3>
              <div className="flex justify-end gap-1.5 mt-3">
                <button onClick={() => setDraft({ ...v })} className="p-2 rounded hover:bg-pine-100 text-pine-700" aria-label="Edit video"><PencilLine size={15} /></button>
                <ConfirmBtn onConfirm={() => { update(d => ({ ...d, videos: d.videos.filter(x => x.id !== v.id) })); toast("Video deleted."); }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {db.videos.length === 0 && <EmptyState title="No videos yet" text="Add YouTube or Vimeo links — they display in a modern grid on the public site." />}
      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? "Edit Video" : "Add Video"}>
        {draft && (
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2"><Field label="Video Title *"><input className="field" value={draft.title} onChange={e => set("title", e.target.value)} /></Field></div>
            <div className="sm:col-span-2"><Field label="Description"><textarea className="field" rows={2} value={draft.description} onChange={e => set("description", e.target.value)} /></Field></div>
            <div className="sm:col-span-2"><Field label="Video URL *" hint="YouTube or Vimeo link."><input className="field" value={draft.url} onChange={e => set("url", e.target.value)} placeholder="https://www.youtube.com/watch?v=…" /></Field></div>
            <Field label="Category"><input className="field" value={draft.category} onChange={e => set("category", e.target.value)} /></Field>
            <Field label="Date"><input type="date" className="field" value={draft.date} onChange={e => set("date", e.target.value)} /></Field>
            <div className="sm:col-span-2"><MediaPicker value={draft.thumbnail} onChange={v => set("thumbnail", v)} label="Thumbnail" /></div>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2 border-t border-pine-900/10">
              <Btn variant="ghost" onClick={() => setDraft(null)}>Cancel</Btn>
              <Btn variant="pine" onClick={save}>Save Video</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ================= MEDIA LIBRARY ================= */
export function MediaAdmin() {
  const { db, update, toast, logActivity } = useStore();
  const [q, setQ] = useState("");
  const [folder, setFolder] = useState("All");
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [renaming, setRenaming] = useState<{ id: string; value: string } | null>(null);
  const [copied, setCopied] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const folders = ["All", ...Array.from(new Set(db.media.map(m => m.folder)))];
  const list = useMemo(() => db.media.filter(m => (folder === "All" || m.folder === folder) && m.name.toLowerCase().includes(q.toLowerCase())), [db.media, q, folder]);

  const upload = async (files: FileList | File[] | null) => {
    if (!files) return;
    const arr = Array.from(files);
    if (arr.length === 0) return;
    setBusy(true);
    try {
      const added: MediaItem[] = [];
      for (const f of arr) {
        const { url, size } = await processImageFile(f);
        added.push({ id: uid("md"), name: f.name, url, size, type: f.type, folder: folder === "All" ? "Uploads" : folder, createdAt: new Date().toISOString() });
      }
      update(d => ({ ...d, media: [...added, ...d.media] }));
      logActivity(`Media library: ${added.length} file(s) uploaded`, "media");
      toast(`${added.length} image(s) uploaded and optimised.`);
    } catch (e) { toast((e as Error).message, "error"); }
    setBusy(false);
  };

  const onDrop = (e: DragEvent) => { e.preventDefault(); setDrag(false); void upload(e.dataTransfer.files); };
  const copyUrl = async (m: MediaItem) => {
    try { await navigator.clipboard.writeText(m.url); setCopied(m.id); toast("Image URL copied."); setTimeout(() => setCopied(""), 1800); }
    catch { toast("Copy failed.", "error"); }
  };

  return (
    <div>
      <PageHead title="Media Library" sub="Every image available to the website. JPG, PNG and WEBP up to 8 MB — auto-optimised on upload." />
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={onDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all mb-6 ${drag ? "border-gold-500 bg-gold-100/50 scale-[1.005]" : "border-pine-300 bg-[#fbfbf6]"}`}>
        <Upload size={28} className={`mx-auto ${drag ? "text-gold-600" : "text-pine-400"}`} />
        <p className="font-display font-bold uppercase text-xl text-pine-900 mt-3">{busy ? "Optimising images…" : drag ? "Drop to upload" : "Drag & drop images here"}</p>
        <p className="text-inksoft text-sm mt-1">or</p>
        <button onClick={() => inputRef.current?.click()} className="mt-3 inline-flex items-center gap-2 bg-pine-800 hover:bg-pine-700 text-paper font-bold uppercase tracking-[0.12em] text-[0.75rem] px-5 py-2.5 rounded-[4px] transition-colors">Browse Files</button>
        <input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { void upload(e.target.files); e.target.value = ""; }} />
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-inksoft" />
          <input className="field pl-9" value={q} onChange={e => setQ(e.target.value)} placeholder="Search images…" aria-label="Search images" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {folders.map(f => (
            <button key={f} onClick={() => setFolder(f)} className={`px-3.5 py-2 rounded-[4px] text-[0.7rem] font-bold uppercase tracking-[0.1em] transition-all flex items-center gap-1.5 ${folder === f ? "bg-pine-900 text-gold-300" : "bg-pine-100 text-pine-800 hover:bg-pine-200"}`}>
              <FolderOpen size={12} />{f}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? <EmptyState title="No images found" text="Upload images or adjust the search and folder filters." /> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {list.map(m => (
            <div key={m.id} className="group bg-[#fbfbf6] border border-pine-900/10 rounded-lg overflow-hidden">
              <SmartImg src={m.url} alt={m.name} className="w-full aspect-square object-cover" />
              <div className="p-3">
                {renaming?.id === m.id ? (
                  <input autoFocus className="field py-1 text-xs" value={renaming.value} aria-label="Rename image"
                    onChange={e => setRenaming({ id: m.id, value: e.target.value })}
                    onBlur={() => { update(d => ({ ...d, media: d.media.map(x => x.id === m.id ? { ...x, name: renaming.value } : x) })); setRenaming(null); toast("Image renamed."); }}
                    onKeyDown={e => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
                ) : (
                  <div className="text-[0.72rem] font-semibold text-pine-900 truncate" title={m.name}>{m.name}</div>
                )}
                <div className="text-[0.62rem] text-inksoft mt-0.5">{m.folder} • {(m.size / 1024).toFixed(0)} KB</div>
                <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button title="Rename" aria-label="Rename" onClick={() => setRenaming({ id: m.id, value: m.name })} className="p-1.5 rounded hover:bg-pine-100 text-pine-700"><PencilLine size={13} /></button>
                  <button title="Copy URL" aria-label="Copy URL" onClick={() => void copyUrl(m)} className="p-1.5 rounded hover:bg-pine-100 text-pine-700">{copied === m.id ? <Check size={13} className="text-gold-600" /> : <Copy size={13} />}</button>
                  <ConfirmBtn onConfirm={() => { update(d => ({ ...d, media: d.media.filter(x => x.id !== m.id) })); toast("Image deleted from library."); }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
