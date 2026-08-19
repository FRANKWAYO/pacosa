import { useEffect, type ReactNode } from "react";
import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { StoreProvider, useStore, usePageMeta } from "./lib/store";
import { PublicLayout } from "./components/layout";
import { ToastHost, Btn, Crest } from "./components/ui";
import Home from "./pages/Home";
import { AboutPage, LeadershipPage } from "./pages/AboutLeadership";
import { ProgramsPage, ProgramDetail, EventsPage, EventDetail, NotFound } from "./pages/ProgramsEvents";
import { NewsPage, NewsDetail, StaticPage } from "./pages/NewsPages";
import { GalleryPage, AlbumPage, VideosPage } from "./pages/GalleryVideos";
import { MembersPage, JoinPage, ContactPage, SupportPage } from "./pages/CommunityPages";
import { AdminLogin, AdminLayout, AdminDashboard, ActivityLogsPage } from "./admin/AdminCore";
import { ProgramsAdmin, EventsAdmin, NewsAdmin, LeadershipAdmin, PagesAdmin } from "./admin/ContentAdmin";
import { GalleryAdmin, VideosAdmin, MediaAdmin } from "./admin/MediaAdmin";
import { MembersAdmin, ApplicationsAdmin, MessagesAdmin, UsersAdmin, HomepageAdmin, DonationsAdmin, SettingsAdmin } from "./admin/PeopleAdmin";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Meta({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  usePageMeta(title, desc);
  return <>{children}</>;
}

function Public({ children }: { children: ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}

function NoAccess() {
  const { user, logout } = useStore();
  return (
    <div className="max-w-xl mx-auto text-center py-20">
      <Crest size={64} className="mx-auto opacity-40" />
      <h1 className="font-display font-bold uppercase text-4xl text-pine-900 mt-6">Access Restricted</h1>
      <p className="text-inksoft mt-3">Your role ({user?.role ?? "unknown"}) does not have permission for this section. Contact a Super Administrator if you believe this is an error.</p>
      <div className="mt-8 flex justify-center gap-3"><Btn variant="pine" href="#/admin">Back to Dashboard</Btn><Btn variant="outline" onClick={logout}>Switch Account</Btn></div>
    </div>
  );
}

function Gate({ children, perm }: { children: ReactNode; perm?: string }) {
  const { session, user, can } = useStore();
  const loc = useLocation();
  if (!session || !user) return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />;
  if (perm && !can(perm)) return <AdminLayout><NoAccess /></AdminLayout>;
  return <AdminLayout>{children}</AdminLayout>;
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <ScrollToTop />
        <div className="noise-layer" aria-hidden="true" />
        <ToastHost />
        <Routes>
          {/* ---------- public ---------- */}
          <Route path="/" element={<Meta title="PACOSA — Cadets Association | Discipline • Leadership • Unity • Service • Excellence" desc="The national cadets association connecting serving and former cadets through training, service and fellowship."><Public><Home /></Public></Meta>} />
          <Route path="/about" element={<Meta title="About PACOSA — Who We Are, Mission, Vision & History"><Public><AboutPage /></Public></Meta>} />
          <Route path="/programs" element={<Meta title="Programs & Activities — PACOSA"><Public><ProgramsPage /></Public></Meta>} />
          <Route path="/programs/:id" element={<Meta title="Program Details — PACOSA"><Public><ProgramDetail /></Public></Meta>} />
          <Route path="/events" element={<Meta title="Events Calendar — PACOSA"><Public><EventsPage /></Public></Meta>} />
          <Route path="/events/:id" element={<Meta title="Event Details — PACOSA"><Public><EventDetail /></Public></Meta>} />
          <Route path="/news" element={<Meta title="News & Announcements — PACOSA"><Public><NewsPage /></Public></Meta>} />
          <Route path="/news/:id" element={<Meta title="News — PACOSA"><Public><NewsDetail /></Public></Meta>} />
          <Route path="/gallery" element={<Meta title="Photo Gallery — PACOSA"><Public><GalleryPage /></Public></Meta>} />
          <Route path="/gallery/:albumId" element={<Meta title="Gallery Album — PACOSA"><Public><AlbumPage /></Public></Meta>} />
          <Route path="/videos" element={<Meta title="Video Gallery — PACOSA"><Public><VideosPage /></Public></Meta>} />
          <Route path="/leadership" element={<Meta title="Our Leadership — PACOSA"><Public><LeadershipPage /></Public></Meta>} />
          <Route path="/members" element={<Meta title="Member Directory — PACOSA"><Public><MembersPage /></Public></Meta>} />
          <Route path="/join" element={<Meta title="Join PACOSA — Membership Application"><Public><JoinPage /></Public></Meta>} />
          <Route path="/contact" element={<Meta title="Contact the Secretariat — PACOSA"><Public><ContactPage /></Public></Meta>} />
          <Route path="/support" element={<Meta title="Support PACOSA — Donations"><Public><SupportPage /></Public></Meta>} />
          <Route path="/page/:slug" element={<Meta title="PACOSA"><Public><StaticPage /></Public></Meta>} />

          {/* ---------- admin ---------- */}
          <Route path="/admin/login" element={<Meta title="Admin Login — PACOSA"><AdminLogin /></Meta>} />
          <Route path="/admin" element={<Meta title="Dashboard — PACOSA Admin"><Gate perm="dashboard"><AdminDashboard /></Gate></Meta>} />
          <Route path="/admin/activity-logs" element={<Meta title="Activity Logs — PACOSA Admin"><Gate perm="logs"><ActivityLogsPage /></Gate></Meta>} />
          <Route path="/admin/homepage" element={<Meta title="Homepage CMS — PACOSA Admin"><Gate perm="homepage"><HomepageAdmin /></Gate></Meta>} />
          <Route path="/admin/programs" element={<Meta title="Programs — PACOSA Admin"><Gate perm="programs"><ProgramsAdmin /></Gate></Meta>} />
          <Route path="/admin/events" element={<Meta title="Events — PACOSA Admin"><Gate perm="events"><EventsAdmin /></Gate></Meta>} />
          <Route path="/admin/news" element={<Meta title="News — PACOSA Admin"><Gate perm="news"><NewsAdmin /></Gate></Meta>} />
          <Route path="/admin/pages" element={<Meta title="Pages — PACOSA Admin"><Gate perm="pages"><PagesAdmin /></Gate></Meta>} />
          <Route path="/admin/gallery" element={<Meta title="Gallery — PACOSA Admin"><Gate perm="gallery"><GalleryAdmin /></Gate></Meta>} />
          <Route path="/admin/videos" element={<Meta title="Videos — PACOSA Admin"><Gate perm="videos"><VideosAdmin /></Gate></Meta>} />
          <Route path="/admin/media" element={<Meta title="Media Library — PACOSA Admin"><Gate perm="media"><MediaAdmin /></Gate></Meta>} />
          <Route path="/admin/members" element={<Meta title="Members — PACOSA Admin"><Gate perm="members"><MembersAdmin /></Gate></Meta>} />
          <Route path="/admin/applications" element={<Meta title="Applications — PACOSA Admin"><Gate perm="applications"><ApplicationsAdmin /></Gate></Meta>} />
          <Route path="/admin/leadership" element={<Meta title="Leadership — PACOSA Admin"><Gate perm="leadership"><LeadershipAdmin /></Gate></Meta>} />
          <Route path="/admin/messages" element={<Meta title="Messages — PACOSA Admin"><Gate perm="messages"><MessagesAdmin /></Gate></Meta>} />
          <Route path="/admin/donations" element={<Meta title="Donations — PACOSA Admin"><Gate perm="donations"><DonationsAdmin /></Gate></Meta>} />
          <Route path="/admin/users" element={<Meta title="Users — PACOSA Admin"><Gate perm="users"><UsersAdmin /></Gate></Meta>} />
          <Route path="/admin/settings" element={<Meta title="Settings — PACOSA Admin"><Gate perm="settings"><SettingsAdmin /></Gate></Meta>} />

          <Route path="*" element={<Meta title="Page Not Found — PACOSA"><Public><NotFound /></Public></Meta>} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
}
