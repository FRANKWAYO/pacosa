import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, CalendarDays, Eye, User, Link2, Check } from "lucide-react";
import { useStore, fmtDate, sanitizeHtml } from "../lib/store";
import { Reveal, SectionHead, Btn, SmartImg, Pill, EmptyState } from "../components/ui";
import { NEWS_CATEGORIES } from "../lib/types";
import type { Article } from "../lib/types";
import { PageHero, NotFound } from "./AboutLeadership";

export function ArticleCard({ a, delay = 0 }: { a: Article; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <Link to={`/news/${a.id}`} className="group block h-full bg-[#fbfbf6] border border-pine-900/10 rounded-md overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
        <div className="overflow-hidden aspect-[16/9]">
          <SmartImg src={a.image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3 text-[0.66rem] font-bold uppercase tracking-[0.16em]">
            <span className="text-gold-600">{a.category}</span><span className="w-1 h-1 rounded-full bg-gold-500" /><span className="text-inksoft font-semibold normal-case tracking-normal">{fmtDate(a.publishAt)}</span>
          </div>
          <h3 className="font-display font-bold uppercase text-2xl leading-tight text-pine-900 mt-2.5 group-hover:text-gold-600 transition-colors">{a.title}</h3>
          <p className="text-inksoft text-sm leading-relaxed mt-2 line-clamp-3">{a.excerpt}</p>
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-pine-900/8 text-[0.72rem] text-inksoft">
            <span className="flex items-center gap-1.5"><User size={12} className="text-gold-600" />{a.author}</span>
            <ArrowRight size={15} className="text-pine-300 group-hover:text-gold-600 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export function NewsPage() {
  const { db } = useStore();
  const [cat, setCat] = useState("All");
  const published = db.news.filter(n => n.status === "published").sort((a, b) => b.publishAt.localeCompare(a.publishAt));
  const filtered = cat === "All" ? published : published.filter(n => n.category === cat);
  const [featured, ...rest] = filtered;
  const cats = ["All", ...NEWS_CATEGORIES.filter(c => published.some(n => n.category === c))];
  return (
    <div>
      <PageHero kicker="File 05 — The News Desk" title="News & Announcements" text="Dispatches from the secretariat: events, training updates, partnerships and official announcements." />
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex flex-wrap gap-2 mb-10" role="tablist" aria-label="Filter news by category">
            {cats.map(c => (
              <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)}
                className={`px-4 py-2.5 rounded-[4px] text-[0.74rem] font-bold uppercase tracking-[0.1em] transition-all ${cat === c ? "bg-pine-900 text-gold-300 shadow" : "bg-pine-100 text-pine-800 hover:bg-pine-200"}`}>{c}</button>
            ))}
          </div>
          {!featured ? <EmptyState title="No dispatches yet" text="The news desk has nothing filed under this category at the moment." /> : (
            <>
              <Reveal>
                <Link to={`/news/${featured.id}`} className="group grid lg:grid-cols-2 bg-[#fbfbf6] border border-pine-900/10 rounded-md overflow-hidden shadow-sm hover:shadow-xl transition-all">
                  <div className="overflow-hidden aspect-[16/10] lg:aspect-auto">
                    <SmartImg src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-8 lg:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-3"><Pill tone="gold">{featured.category}</Pill><span className="text-[0.72rem] text-inksoft font-semibold">{fmtDate(featured.publishAt)}</span></div>
                    <h2 className="font-display font-bold uppercase text-4xl leading-[1.02] text-pine-900 mt-4 group-hover:text-gold-600 transition-colors">{featured.title}</h2>
                    <p className="text-inksoft leading-relaxed mt-4">{featured.excerpt}</p>
                    <span className="inline-flex items-center gap-2 mt-6 text-[0.78rem] font-bold uppercase tracking-[0.16em] text-pine-800 group-hover:text-gold-600 transition-colors">Read the dispatch <ArrowRight size={15} /></span>
                  </div>
                </Link>
              </Reveal>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7 mt-10">
                {rest.map((a, i) => <ArticleCard key={a.id} a={a} delay={(i % 3) * 0.06} />)}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export function NewsDetail({ article }: { article?: Article }) {
  const { db, update, toast } = useStore();
  const { id } = useParams();
  const [copied, setCopied] = useState(false);
  const a = article ?? db.news.find(x => x.id === id);
  useMemo(() => {
    if (a && !article) update(d => ({ ...d, news: d.news.map(n => n.id === a.id ? { ...n, views: n.views + 1 } : n) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!a) return <NotFound title="Article not found" />;
  const shareUrl = window.location.href;
  const copy = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { toast("Could not copy the link.", "error"); }
  };
  const related = db.news.filter(n => n.status === "published" && n.id !== a.id).slice(0, 3);
  return (
    <div>
      <PageHero kicker={a.category} title={a.title} text={`By ${a.author} • ${fmtDate(a.publishAt)}`} />
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-5">
          <Reveal>
            <div className="overflow-hidden rounded-md aspect-[16/8] shadow-lg"><SmartImg src={a.image} alt={a.title} className="w-full h-full object-cover" /></div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="flex flex-wrap items-center gap-4 mt-8 pb-6 border-b border-pine-900/10 text-[0.78rem] text-inksoft">
              <span className="flex items-center gap-1.5"><User size={13} className="text-gold-600" />{a.author}</span>
              <span className="flex items-center gap-1.5"><CalendarDays size={13} className="text-gold-600" />{fmtDate(a.publishAt)}</span>
              <span className="flex items-center gap-1.5"><Eye size={13} className="text-gold-600" />{a.views.toLocaleString()} reads</span>
              <span className="ml-auto flex items-center gap-2">
                <span className="text-[0.66rem] font-bold uppercase tracking-[0.16em]">Share:</span>
                <a aria-label="Share on X" target="_blank" rel="noreferrer" href={`https://x.com/intent/tweet?text=${encodeURIComponent(a.title)}&url=${encodeURIComponent(shareUrl)}`} className="w-8 h-8 flex items-center justify-center rounded border border-pine-800/20 text-pine-800 hover:bg-pine-800 hover:text-paper transition-colors font-bold text-xs">𝕏</a>
                <a aria-label="Share on Facebook" target="_blank" rel="noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} className="w-8 h-8 flex items-center justify-center rounded border border-pine-800/20 text-pine-800 hover:bg-pine-800 hover:text-paper transition-colors font-bold text-xs">f</a>
                <a aria-label="Share on WhatsApp" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(a.title + " " + shareUrl)}`} className="w-8 h-8 flex items-center justify-center rounded border border-pine-800/20 text-pine-800 hover:bg-pine-800 hover:text-paper transition-colors font-bold text-xs">w</a>
                <button onClick={copy} aria-label="Copy link" className="w-8 h-8 flex items-center justify-center rounded border border-pine-800/20 text-pine-800 hover:bg-pine-800 hover:text-paper transition-colors">{copied ? <Check size={13} className="text-gold-500" /> : <Link2 size={13} />}</button>
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="rt-content mt-8" dangerouslySetInnerHTML={{ __html: sanitizeHtml(a.content) }} />
          </Reveal>
          {a.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-pine-900/10">
              {a.tags.map(t => <span key={t} className="bg-pine-100 text-pine-800 text-[0.7rem] font-bold uppercase tracking-[0.12em] px-3 py-1.5 rounded">#{t}</span>)}
            </div>
          )}
          <div className="mt-10"><Btn variant="outline" href="/news">All News <ArrowRight size={15} /></Btn></div>
        </div>
        {related.length > 0 && (
          <div className="max-w-7xl mx-auto px-5 mt-20">
            <SectionHead kicker="Keep reading" title="More Dispatches" />
            <div className="grid md:grid-cols-3 gap-7 mt-10">{related.map((n, i) => <ArticleCard key={n.id} a={n} delay={i * 0.06} />)}</div>
          </div>
        )}
      </section>
    </div>
  );
}

export function StaticPage() {
  const { db } = useStore();
  const { slug } = useParams();
  const page = db.pages.find(p => p.slug === slug && p.published);
  if (!page) return <NotFound title="Page not found" />;
  return (
    <div>
      <PageHero kicker="Association Document" title={page.title} />
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-5">
          <div className="rt-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }} />
        </div>
      </section>
    </div>
  );
}
