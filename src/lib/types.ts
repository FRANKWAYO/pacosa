export type ID = string;

export type Role = "super" | "admin" | "editor" | "officer";
export type MemberStatus = "pending" | "approved" | "rejected" | "suspended";
export type ContentStatus = "draft" | "published" | "completed" | "cancelled";

export interface AdminUser {
  id: ID; name: string; email: string; passwordHash: string; role: Role;
  active: boolean; color: string; lastLogin?: string;
}

export interface Member {
  id: ID; refNo: string; fullName: string; dob: string; gender: string;
  phone: string; email: string; location: string; region: string;
  cadetUnit: string; rank: string; yearJoined: string; yearCompleted: string;
  occupation: string; photo?: string; emergencyContact: string; bio: string;
  status: MemberStatus; appliedAt: string; decidedAt?: string; adminNote?: string;
}

export interface Program {
  id: ID; title: string; description: string; image: string;
  startDate: string; endDate?: string; time: string; location: string;
  organizer: string; category: string; registrationUrl: string;
  status: ContentStatus; featured: boolean; registrationOpen: boolean; createdAt: string;
}

export interface EventItem {
  id: ID; title: string; description: string; date: string;
  startTime: string; endTime?: string; location: string; category: string;
  image?: string; status: "draft" | "published";
}

export interface Article {
  id: ID; title: string; image: string; author: string; category: string;
  tags: string[]; content: string; excerpt: string;
  status: "draft" | "published" | "scheduled"; publishAt: string; views: number;
}

export interface GalleryImage { id: ID; url: string; caption: string; }
export interface Album { id: ID; title: string; description: string; cover?: string; images: GalleryImage[]; }

export interface Video {
  id: ID; title: string; description: string; provider: "youtube" | "vimeo" | "file";
  url: string; thumbnail: string; category: string; date: string;
}

export interface Leader {
  id: ID; name: string; position: string; order: number;
  bio: string; background: string; photo?: string; socials: { label: string; url: string }[];
}

export interface Page {
  id: ID; slug: string; title: string; content: string;
  seoTitle: string; seoDescription: string; published: boolean; updatedAt: string;
}

export interface ContactMessage {
  id: ID; name: string; email: string; phone: string; subject: string;
  body: string; createdAt: string; read: boolean;
}

export interface MediaItem {
  id: ID; name: string; url: string; size: number; type: string; folder: string; createdAt: string;
}

export interface Activity { id: ID; text: string; type: string; user: string; at: string; }
export interface Subscriber { id: ID; email: string; createdAt: string; }
export interface CoreValue { title: string; text: string; icon: string; }
export interface TimelineEntry { year: string; title: string; text: string; }
export interface Stat { label: string; value: number; suffix?: string; }
export interface Testimonial { name: string; role: string; quote: string; }

export interface Settings {
  orgName: string; subtitle: string; tagline: string;
  logo: string | null; favicon: string | null; footerLogo: string | null;
  email: string; phone: string; address: string; description: string;
  heroTitle: string; heroDescription: string; heroImage: string;
  heroCtaPrimary: string; heroCtaPrimaryUrl: string;
  heroCtaSecondary: string; heroCtaSecondaryUrl: string;
  aboutTitle: string; aboutText: string; mission: string; vision: string;
  coreValues: CoreValue[]; objectives: string[]; history: TimelineEntry[];
  stats: Stat[]; testimonials: Testimonial[];
  social: { facebook: string; instagram: string; tiktok: string; youtube: string; x: string; linkedin: string; whatsapp: string };
  seo: { title: string; description: string; keywords: string; verification: string };
  smtp: { host: string; port: string; user: string; fromName: string; notifyEmails: string; enabled: boolean };
  donation: {
    intro: string; bankName: string; bankAccount: string; accountName: string; branch: string;
    momo: { network: string; number: string; name: string }[];
    instructions: string[];
  };
  footerText: string; mapQuery: string;
  primaryColor: string; accentColor: string;
}

export interface DB {
  __v: number;
  settings: Settings;
  users: AdminUser[];
  members: Member[];
  programs: Program[];
  events: EventItem[];
  news: Article[];
  albums: Album[];
  videos: Video[];
  leaders: Leader[];
  pages: Page[];
  messages: ContactMessage[];
  media: MediaItem[];
  activity: Activity[];
  subscribers: Subscriber[];
}

export const REGIONS = ["Greater Accra", "Ashanti", "Central", "Eastern", "Western", "Northern", "Volta", "Bono"];
export const PROGRAM_CATEGORIES = ["Cadet Training", "Leadership Development", "Community Service", "Parade & Ceremonies", "Sports Activities", "Educational Programs", "Career Development", "Youth Empowerment", "Annual Cadet Events"];
export const EVENT_CATEGORIES = ["Training", "Ceremony", "Community", "Sports", "Meeting", "Social", "Education"];
export const NEWS_CATEGORIES = ["Announcements", "Training", "Events", "Community", "Leadership", "Partnerships"];
export const RANKS = ["Cadet", "Lance Corporal", "Corporal", "Sergeant", "Staff Sergeant", "Warrant Officer", "Cadet Officer", "Honorary Member"];
export const ROLE_LABELS: Record<Role, string> = {
  super: "Super Administrator", admin: "Administrator", editor: "Editor", officer: "Membership Officer",
};
export const ROLE_PERMS: Record<Role, string[] | "*"> = {
  super: "*",
  admin: ["dashboard", "homepage", "programs", "events", "news", "gallery", "videos", "media", "leadership", "members", "applications", "messages", "pages", "donations", "logs", "settings"],
  editor: ["dashboard", "homepage", "programs", "news", "gallery", "videos", "media", "pages", "logs"],
  officer: ["dashboard", "members", "applications", "messages", "logs"],
};
