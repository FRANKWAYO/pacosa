import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Camera, Play, ArrowRight, Images, CalendarDays } from "lucide-react";
import { useStore, fmtDate } from "../lib/store";
import { Reveal, SmartImg, Lightbox, Modal, Pill, EmptyState } from "../components/ui";
import type { Video } from "../lib/types";
import { PageHero, NotFound } from "./AboutLeadership";

/* ================= PHOTO GALLERY ================= */
export function GalleryPage() {
  const { db } = useStore();
  return (
    <div>
      <PageHero kicker="File 06 — The Archive" title="Photo Gallery" text="Parades, training grounds, service days and ceremonies — the association, frame by frame." />
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5">
          {db.albums.length === 0 ? <EmptyState title="Albums coming soon" text="The archive is being organised. Check back shortly." /> : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {db.albums.map((al, i) => (
                <Reveal key={al.id} delay={(i % 3) * 0.07}>
                  <Link to={`/gallery/${al.id}`} className="group block relative rounded-md overflow-hidden aspect-[4/3] shadow-sm hover:shadow-2xl transition-all">
                    <SmartImg src={al.cover ?? al.images[0]?.url} alt={al.title} className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-pine-950/95 via-pine-950/30 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <div className="flex items-center gap-2 text-gold-300 text-[0.66rem] font-bold uppercase tracking-[0.2em]"><Camera size={13} />{al.images.length} photos</div>
                      <h3 className="font-display font-bold uppercase text-3xl text-paper mt-1.5 group-hover:text-gold-300 transition-colors">{al.title}</h3>
                      <p className="text-pine-100/75 text-sm mt-1 line-clamp-2">{al.description}</p>
                      <span className="inline-flex items-center gap-1.5 mt-3 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-gold-400 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">Open album <ArrowRight size={13} /></span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export function AlbumPage() {
  const { db } = useStore();
  const { albumId } = useParams();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const album = db.albums.find(a => a.id === albumId);
  if (!album) return <NotFound title="Album not found" />;
  return (
    <div>
      <PageHero kicker={`Album — ${album.images.length} photos`} title={album.title} text={album.description} />
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5">
          <div className="mb-8"><Link to="/gallery" className="text-[0.75rem] font-bold uppercase tracking-[0.16em] text-gold-600 hover:text-pine-800 inline-flex items-center gap-2 transition-colors">← All albums</Link></div>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:balance]">
            {album.images.map((im, i) => (
              <Reveal key={im.id} delay={(i % 3) * 0.05} className="mb-5 break-inside-avoid">
                <button onClick={() => setLightbox(i)} className="group block w-full overflow-hidden rounded-md shadow-sm hover:shadow-xl transition-all" aria-label={`Open photo: ${im.caption || im.id}`}>
                  <SmartImg src={im.url} alt={im.caption || `${album.title} photo ${i + 1}`} className={`w-full object-cover group-hover:scale-105 transition-transform duration-500 ${i % 3 === 0 ? "aspect-[4/5]" : i % 3 === 1 ? "aspect-[4/3]" : "aspect-square"}`} />
                  <span className="block bg-[#fbfbf6] border border-t-0 border-pine-900/10 px-4 py-2.5 text-left text-[0.75rem] text-inksoft group-hover:text-pine-900 transition-colors">{im.caption || "Untitled"}</span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      {lightbox !== null && <Lightbox images={album.images} index={lightbox} onClose={() => setLightbox(null)} onNav={setLightbox} />}
    </div>
  );
}

/* ================= VIDEO GALLERY ================= */
function videoEmbed(v: Video): string | null {
  const m = v.url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}`;
  const vm = v.url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

export function VideosPage() {
  const { db } = useStore();
  const [active, setActive] = useState<Video | null>(null);
  const cats = ["All", ...Array.from(new Set(db.videos.map(v => v.category)))];
  const [cat, setCat] = useState("All");
  const list = cat === "All" ? db.videos : db.videos.filter(v => v.category === cat);
  const embed = active ? videoEmbed(active) : null;
  return (
    <div>
      <PageHero kicker="File 07 — The Screen Room" title="Video Gallery" text="Ceremonies, training days and summit keynotes — the association in motion." />
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex flex-wrap gap-2 mb-10">
            {cats.map(c => (
              <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
                className={`px-4 py-2.5 rounded-[4px] text-[0.74rem] font-bold uppercase tracking-[0.1em] transition-all ${cat === c ? "bg-pine-900 text-gold-300 shadow" : "bg-pine-100 text-pine-800 hover:bg-pine-200"}`}>{c}</button>
            ))}
          </div>
          {list.length === 0 ? <EmptyState title="No videos here yet" text="The media desk adds new footage after every major event." /> : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {list.map((v, i) => (
                <Reveal key={v.id} delay={(i % 3) * 0.06}>
                  <button onClick={() => setActive(v)} className="group block w-full text-left">
                    <div className="relative overflow-hidden rounded-md aspect-video shadow-sm group-hover:shadow-xl transition-all">
                      <SmartImg src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-16 h-16 rounded-full bg-gold-500 text-pine-950 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform"><Play size={26} className="ml-1" fill="currentColor" /></span>
                      </span>
                      <span className="absolute top-3 left-3"><Pill tone="gold">{v.category}</Pill></span>
                    </div>
                    <h3 className="font-display font-bold uppercase text-2xl text-pine-900 mt-4 group-hover:text-gold-600 transition-colors leading-tight">{v.title}</h3>
                    <p className="text-inksoft text-sm mt-1.5 line-clamp-2">{v.description}</p>
                    <div className="flex items-center gap-1.5 text-[0.72rem] text-inksoft mt-2"><CalendarDays size={12} className="text-gold-600" />{fmtDate(v.date)}</div>
                  </button>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
      {active && (
        <Modal open onClose={() => setActive(null)} title={active.title} wide>
          {embed
            ? <div className="aspect-video rounded overflow-hidden bg-pine-950"><iframe src={embed} title={active.title} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
            : <div className="aspect-video rounded overflow-hidden relative">
                <SmartImg src={active.thumbnail} alt={active.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-pine-950/70 flex flex-col items-center justify-center text-paper text-center px-8">
                  <Images size={28} className="text-gold-400" />
                  <p className="mt-3 text-sm text-pine-100/80">This video is hosted externally.<br /><a className="text-gold-300 underline underline-offset-4" href={active.url} target="_blank" rel="noreferrer">Open it in a new tab</a></p>
                </div>
              </div>}
          <p className="text-inksoft text-sm mt-4 leading-relaxed">{active.description}</p>
        </Modal>
      )}
    </div>
  );
}
