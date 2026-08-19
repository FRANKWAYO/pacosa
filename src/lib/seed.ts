import type { DB, Member, Article } from "./types";

export const SEED_VERSION = 3;

export const IMG = {
  hero: "https://image.qwenlm.ai/generated-images/d10da1f7-2bb0-4b47-920f-ff186aede23a/_result.png",
  training: "https://image.qwenlm.ai/generated-images/aa933be0-c0b8-4839-8005-be96436a118a/_result.png",
  parade: "https://image.qwenlm.ai/generated-images/d690fa02-92ec-407c-b202-f29bb722e491/_result.png",
  service: "https://image.qwenlm.ai/generated-images/81f958fd-26ba-476c-ae81-f4b395c0b78b/_result.png",
  graduation: "https://image.qwenlm.ai/generated-images/49a694a8-40fd-4849-97a3-204330f47d1b/_result.png",
  summit: "https://image.qwenlm.ai/generated-images/1e4e1fc8-a8cd-40c7-a98d-04398acb6f79/_result.png",
  team: "https://image.qwenlm.ai/generated-images/3a9b331b-ff67-4db4-a3d4-5bbcdbed4325/_result.png",
};

/** Deterministic salted hash used for demo credential storage. */
export function hashPw(pw: string): string {
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  const s = "pacosa::" + pw + "::salt";
  for (let i = 0; i < s.length; i++) {
    h1 ^= s.charCodeAt(i); h1 = Math.imul(h1, 16777619);
    h2 = Math.imul(h2 ^ s.charCodeAt(i), 2246822519);
  }
  return (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16);
}

const d = (offsetDays: number, time = "09:00") => {
  const t = new Date(); t.setDate(t.getDate() + offsetDays);
  return { date: t.toISOString().slice(0, 10), time, iso: t.toISOString() };
};
const iso = (offsetDays: number) => d(offsetDays).iso;

const members: Member[] = [
  { id: "m1", refNo: "PAC-2025-0114", fullName: "Kwabena Asamoah", dob: "1999-04-12", gender: "Male", phone: "+233 24 555 0114", email: "kwabena.asamoah@mail.com", location: "Kumasi", region: "Ashanti", cadetUnit: "Prempeh College Cadet Corps", rank: "Sergeant", yearJoined: "2014", yearCompleted: "2017", occupation: "Mechanical Engineer", emergencyContact: "Mrs. Akosua Asamoah — +233 20 111 2233", bio: "Former parade sergeant with a passion for mentoring young cadets in engineering careers.", status: "approved", appliedAt: iso(-240), decidedAt: iso(-236) },
  { id: "m2", refNo: "PAC-2025-0127", fullName: "Adwoa Nyarko", dob: "2000-08-03", gender: "Female", phone: "+233 55 410 0127", email: "adwoa.nyarko@mail.com", location: "Accra", region: "Greater Accra", cadetUnit: "Achimota School Cadet Unit", rank: "Warrant Officer", yearJoined: "2015", yearCompleted: "2018", occupation: "Registered Nurse", emergencyContact: "Mr. Kojo Nyarko — +233 24 778 0021", bio: "Leads our first-aid training volunteers and community health outreaches.", status: "approved", appliedAt: iso(-215), decidedAt: iso(-211) },
  { id: "m3", refNo: "PAC-2025-0141", fullName: "Emmanuel Dartey", dob: "1998-01-27", gender: "Male", phone: "+233 20 991 0141", email: "e.dartey@mail.com", location: "Cape Coast", region: "Central", cadetUnit: "Mfantsipim School Cadet Corps", rank: "Corporal", yearJoined: "2013", yearCompleted: "2016", occupation: "Teacher", photo: "", emergencyContact: "Ms. Aba Dartey — +233 54 220 9981", bio: "Coordinates educational programs and study circles in the Central Region.", status: "approved", appliedAt: iso(-180), decidedAt: iso(-177) },
  { id: "m4", refNo: "PAC-2025-0158", fullName: "Fatima Alhassan", dob: "2001-11-19", gender: "Female", phone: "+233 27 300 0158", email: "fatima.alhassan@mail.com", location: "Tamale", region: "Northern", cadetUnit: "Tamale Senior High Cadet Unit", rank: "Cadet Officer", yearJoined: "2016", yearCompleted: "2019", occupation: "Law Student", emergencyContact: "Alhaji Mustapha — +233 24 655 7712", bio: "Advocates for girls' participation in cadet programs across the north.", status: "approved", appliedAt: iso(-150), decidedAt: iso(-146) },
  { id: "m5", refNo: "PAC-2025-0173", fullName: "Selorm Agbeko", dob: "1999-06-30", gender: "Male", phone: "+233 54 882 0173", email: "selorm.agbeko@mail.com", location: "Ho", region: "Volta", cadetUnit: "Mawuli School Cadet Corps", rank: "Staff Sergeant", yearJoined: "2014", yearCompleted: "2017", occupation: "Software Developer", emergencyContact: "Mrs. Esi Agbeko — +233 20 445 1180", bio: "Built the region's digital membership records and runs our tech club.", status: "approved", appliedAt: iso(-120), decidedAt: iso(-117) },
  { id: "m6", refNo: "PAC-2025-0189", fullName: "Josephine Baah", dob: "2000-02-14", gender: "Female", phone: "+233 26 118 0189", email: "j.baah@mail.com", location: "Sekondi-Takoradi", region: "Western", cadetUnit: "Ghana National College Cadet Unit", rank: "Sergeant", yearJoined: "2015", yearCompleted: "2018", occupation: "Maritime Officer", emergencyContact: "Mr. Isaac Baah — +233 24 902 3341", bio: "Organises coastal clean-ups and sea-safety awareness for youth.", status: "approved", appliedAt: iso(-95), decidedAt: iso(-92) },
  { id: "m7", refNo: "PAC-2025-0204", fullName: "Michael Ofori", dob: "1997-09-09", gender: "Male", phone: "+233 24 731 0204", email: "m.ofori@mail.com", location: "Koforidua", region: "Eastern", cadetUnit: "Pope John SHS Cadet Corps", rank: "Warrant Officer", yearJoined: "2012", yearCompleted: "2015", occupation: "Accountant", emergencyContact: "Mrs. Dora Ofori — +233 55 610 4472", bio: "Serves on the regional audit sub-committee and sports desk.", status: "approved", appliedAt: iso(-70), decidedAt: iso(-66) },
  { id: "m8", refNo: "PAC-2026-0221", fullName: "Gifty Mensimah", dob: "2001-05-25", gender: "Female", phone: "+233 20 455 0221", email: "officer@pacosa.org", location: "Sunyani", region: "Bono", cadetUnit: "Sunyani SHS Cadet Unit", rank: "Corporal", yearJoined: "2016", yearCompleted: "2019", occupation: "HR Officer", emergencyContact: "Mr. Kwaku Mensimah — +233 24 118 6690", bio: "Membership Officer, National Executive.", status: "approved", appliedAt: iso(-55), decidedAt: iso(-54) },
  { id: "m9", refNo: "PAC-2026-0236", fullName: "Daniel Tetteh", dob: "2002-12-01", gender: "Male", phone: "+233 55 900 0236", email: "d.tetteh@mail.com", location: "Tema", region: "Greater Accra", cadetUnit: "Tema SHS Cadet Corps", rank: "Cadet", yearJoined: "2018", yearCompleted: "2021", occupation: "National Service Personnel", emergencyContact: "Mrs. Laryea Tetteh — +233 24 331 9080", bio: "Eager to volunteer in parade and ceremonial duties.", status: "approved", appliedAt: iso(-38), decidedAt: iso(-35) },
  { id: "m10", refNo: "PAC-2026-0244", fullName: "Rahima Seidu", dob: "2000-03-17", gender: "Female", phone: "+233 27 662 0244", email: "rahima.seidu@mail.com", location: "Bolgatanga", region: "Northern", cadetUnit: "Bolgatanga SHS Cadet Unit", rank: "Lance Corporal", yearJoined: "2015", yearCompleted: "2018", occupation: "Agro-Entrepreneur", emergencyContact: "Mr. Atia Seidu — +233 20 554 7812", bio: "Runs youth farming outreach weekends in the Upper East corridor.", status: "pending", appliedAt: iso(-12) },
  { id: "m11", refNo: "PAC-2026-0249", fullName: "Kofi Antwi-Boasiako", dob: "1999-07-21", gender: "Male", phone: "+233 24 118 0249", email: "kofi.antwi@mail.com", location: "Obuasi", region: "Ashanti", cadetUnit: "Obuasi SHS Cadet Corps", rank: "Sergeant", yearJoined: "2014", yearCompleted: "2017", occupation: "Mining Technician", emergencyContact: "Mrs. Mercy Antwi — +233 54 780 2214", bio: "Interested in the sports and disaster-response desks.", status: "pending", appliedAt: iso(-7) },
  { id: "m12", refNo: "PAC-2026-0252", fullName: "Esi Cudjoe", dob: "2001-10-05", gender: "Female", phone: "+233 20 903 0252", email: "esi.cudjoe@mail.com", location: "Winneba", region: "Central", cadetUnit: "Winneba SHS Cadet Unit", rank: "Cadet", yearJoined: "2017", yearCompleted: "2020", occupation: "Student — UEW", emergencyContact: "Mr. Samuel Cudjoe — +233 24 660 1975", bio: "Wants to join the education and mentorship programs.", status: "pending", appliedAt: iso(-2) },
  { id: "m13", refNo: "PAC-2026-0231", fullName: "Yaw Frimpong", dob: "1998-05-08", gender: "Male", phone: "+233 55 214 0231", email: "y.frimpong@mail.com", location: "Ejisu", region: "Ashanti", cadetUnit: "Ejisu SHS Cadet Corps", rank: "Corporal", yearJoined: "2013", yearCompleted: "2016", occupation: "Trader", emergencyContact: "—", bio: "Application withdrawn at applicant's request.", status: "rejected", appliedAt: iso(-25), decidedAt: iso(-20), adminNote: "Withdrawn by applicant via phone." },
  { id: "m14", refNo: "PAC-2024-0072", fullName: "Nana Adjei Sarpong", dob: "1996-08-15", gender: "Male", phone: "+233 24 550 0072", email: "nana.sarpong@mail.com", location: "Accra", region: "Greater Accra", cadetUnit: "Presby Boys' Legon Cadet Corps", rank: "Staff Sergeant", yearJoined: "2011", yearCompleted: "2014", occupation: "Logistics Officer", emergencyContact: "Mrs. Sarpong — +233 20 887 6540", bio: "Membership under review pending conduct committee report.", status: "suspended", appliedAt: iso(-320), decidedAt: iso(-315), adminNote: "Under review by the conduct committee." },
];

const articles: Article[] = [
  {
    id: "n1", title: "PACOSA Announces 2026 National Cadet Leadership Summit", image: IMG.summit, author: "Public Relations Desk", category: "Announcements",
    tags: ["summit", "leadership", "2026"],
    excerpt: "Over 400 delegates from all eight regions will gather in Accra for three days of leadership labs, drills and national dialogue.",
    content: "<p>The National Executive Council is pleased to announce that the <strong>2026 National Cadet Leadership Summit</strong> will hold in Accra, bringing together serving and former cadets from all eight regions under the theme <em>\"Discipline for a New Generation\"</em>.</p><h3>What to expect</h3><ul><li>Leadership laboratories facilitated by serving military and corporate officers</li><li>Inter-regional drill and turnout competitions</li><li>A national dialogue on youth service and employability</li><li>Election of the 2026–2028 student liaison council</li></ul><p>Registration opens to all members in good standing. Regional coordinators will circulate delegation quotas within fourteen days.</p><blockquote>A cadet is never finished being formed — the summit is where formation meets fellowship.</blockquote>",
    status: "published", publishAt: iso(-2), views: 486,
  },
  {
    id: "n2", title: "Recap: 3,000 Trees Planted in Greater Accra Clean-Up Drive", image: IMG.service, author: "Community Service Desk", category: "Community",
    tags: ["environment", "volunteers", "accra"],
    excerpt: "More than 260 PACOSA volunteers joined municipal assemblies to restore green cover along the Densu corridor.",
    content: "<p>Under a bright Saturday sun, <strong>260 PACOSA volunteers</strong> in green vests moved through the Densu corridor with shovels, seedlings and an unmistakable marching rhythm.</p><h3>By the numbers</h3><ul><li>3,000 tree seedlings planted</li><li>11 km of drains desilted</li><li>4 tonnes of waste sorted for recycling</li></ul><p>The exercise was jointly coordinated with the Municipal Assemblies and the Forestry Commission. Several first-time volunteers have since enrolled in our disaster-response training track.</p><blockquote>Service is the uniform we never take off. — Naa Adjeley Quartey, Organising Secretary</blockquote>",
    status: "published", publishAt: iso(-9), views: 1204,
  },
  {
    id: "n3", title: "Passing-Out Parade Celebrates Class of 2026 Cadet Officers", image: IMG.graduation, author: "Ceremonial Desk", category: "Events",
    tags: ["parade", "graduation", "ceremony"],
    excerpt: "148 cadet officers marched out to salute colours at the national parade grounds, joined by families and patrons.",
    content: "<p>The Class of 2026 marched out in review order before families, patrons and regional commanders at the national parade grounds last weekend.</p><p><strong>148 cadet officers</strong> completed the eighteen-month officer foundation track, which includes field craft, ceremonial drill, first aid and a community capstone project.</p><h3>Awards of excellence</h3><ul><li>Best in Drill — WO II Adwoa Nyarko (Greater Accra)</li><li>Best Community Capstone — Northern Region team, water-point mapping project</li><li>Sportsmanship Trophy — Volta Region contingent</li></ul><p>The full photo album is available in the <a href='#/gallery'>national gallery</a>.</p>",
    status: "published", publishAt: iso(-16), views: 2317,
  },
  {
    id: "n4", title: "New STEM Mentorship Track Pairs Cadets with Industry Professionals", image: IMG.training, author: "Education Desk", category: "Partnerships",
    tags: ["stem", "mentorship", "careers"],
    excerpt: "A new partnership links senior cadets with engineers, clinicians and technologists for a 12-week mentorship cycle.",
    content: "<p>PACOSA has signed a partnership with three professional bodies to pilot a <strong>STEM mentorship track</strong> for senior cadets and recent leavers.</p><p>Each mentee receives a 12-week structured cycle: workplace shadowing, project sprints and a mock professional review. The first cohort of 60 begins next month.</p><h3>Partner bodies</h3><ol><li>Institution of Engineering Practitioners</li><li>National Health Training Consortium</li><li>TechBridge Accra</li></ol><p>Applications open through the regional education desks.</p>",
    status: "published", publishAt: iso(-27), views: 894,
  },
  {
    id: "n5", title: "Inter-Regional Games: Volta Lifts the Commander's Cup", image: IMG.hero, author: "Sports Desk", category: "Events",
    tags: ["sports", "games", "volta"],
    excerpt: "A last-minute relay victory sealed a historic overall title for the Volta contingent at this year's games.",
    content: "<p>The <strong>Volta Region contingent</strong> produced a stunning anchor leg in the 4×400 m relay to edge Greater Accra by 0.3 seconds and lift the Commander's Cup for the first time in a decade.</p><p>More than 500 cadets competed across athletics, football, volleyball and the grueling cross-country team event.</p><blockquote>We trained in the rain at Ho. The cup travelled well. — Sgt. Selorm Agbeko, team captain</blockquote><p>Full results and highlights are in the sports album in our gallery.</p>",
    status: "published", publishAt: iso(-41), views: 1650,
  },
  {
    id: "n6", title: "Draft: Membership Portal Upgrade — What Is Coming", image: IMG.team, author: "Secretariat", category: "Announcements",
    tags: ["members", "portal", "upgrade"],
    excerpt: "A preview of the member self-service portal currently being tested by the secretariat.",
    content: "<p>The secretariat is testing a self-service portal that will allow members to update records, download certificates and pay dues online.</p><p>This article remains a <strong>draft</strong> pending approval from the National Executive Council.</p>",
    status: "draft", publishAt: iso(5), views: 0,
  },
];

export function makeSeed(): DB {
  return {
    __v: SEED_VERSION,
    settings: {
      orgName: "PACOSA", subtitle: "Cadets Association",
      tagline: "Patriotic Cadets' Old Students Association",
      logo: null, favicon: null, footerLogo: null,
      email: "secretariat@pacosa.org", phone: "+233 30 274 1188",
      address: "National Secretariat, 14 Independence Avenue, Accra",
      description: "PACOSA unites serving and former cadets across the nation to promote discipline, leadership, unity, service and excellence in every community.",
      heroTitle: "Building Leaders. Strengthening Unity. Serving Our Communities.",
      heroDescription: "PACOSA is the national home for serving and former cadets — a brotherhood and sisterhood formed on the parade ground, carrying discipline, service and excellence into every region of the country.",
      heroImage: IMG.hero,
      heroCtaPrimary: "Join PACOSA", heroCtaPrimaryUrl: "#/join",
      heroCtaSecondary: "View Programs", heroCtaSecondaryUrl: "#/programs",
      aboutTitle: "From the parade ground to the nation",
      aboutText: "Founded by a small circle of old cadets who refused to let their training end at the school gate, PACOSA has grown into a national association with chartered chapters in all eight regions. We keep the cadet tradition alive through training, ceremony, service and lifelong fellowship.",
      mission: "To develop disciplined, service-minded leaders by connecting cadets and old cadets through structured training, community service and lifelong fellowship.",
      vision: "A nation where every community is strengthened by the values of the cadet movement — discipline, leadership, unity, service and excellence.",
      coreValues: [
        { title: "Discipline", text: "We keep time, keep rank and keep our word — habits formed on the square that shape every part of life.", icon: "clock" },
        { title: "Leadership", text: "We train members to command with competence and serve with humility, from section level to national council.", icon: "flag" },
        { title: "Unity", text: "Region, school and corps never divide us. One association, one uniform of values, one family.", icon: "users" },
        { title: "Service", text: "From clean-ups to disaster response, our members answer the call wherever the community needs hands.", icon: "heart" },
        { title: "Excellence", text: "Turnout, turnout, turnout. Whatever we do, we do it to parade standard — and then a little better.", icon: "award" },
      ],
      objectives: [
        "Sustain a national network that connects serving and former cadets across all eight regions.",
        "Deliver structured training in drill, field craft, first aid and disaster response.",
        "Run leadership and career development programs for members aged 16–35.",
        "Organise national parades, games and ceremonial events that honour the cadet tradition.",
        "Coordinate community service projects with municipal and traditional authorities.",
        "Maintain a transparent, member-first secretariat with accountable leadership.",
      ],
      history: [
        { year: "2011", title: "The founding circle", text: "Fourteen old cadets from six schools meet in Accra and sign the founding charter on a parade-ground bench." },
        { year: "2013", title: "First national parade", text: "120 members march in review order at the Independence Day celebrations — the association's first national appearance." },
        { year: "2016", title: "Regional chapters chartered", text: "All eight regions receive chartered chapters with elected coordinators and regional training calendars." },
        { year: "2019", title: "Service corps launched", text: "The PACOSA Community Service Corps is launched, logging 12,000 volunteer hours in its first year." },
        { year: "2022", title: "National Leadership Summit", text: "The inaugural summit gathers 250 delegates and establishes the officer foundation track." },
        { year: "2026", title: "1,200 members strong", text: "Membership crosses 1,200 as the association prepares its second decade under the theme 'Discipline for a New Generation'." },
      ],
      stats: [
        { label: "Registered Members", value: 1240, suffix: "+" },
        { label: "Regional Chapters", value: 8 },
        { label: "Volunteer Hours / Year", value: 15400, suffix: "+" },
        { label: "Programs Delivered", value: 160, suffix: "+" },
      ],
      testimonials: [
        { name: "WO II Adwoa Nyarko", role: "Greater Accra Chapter", quote: "PACOSA gave my training a second life. The people I drilled with in 2015 are still my first call in 2026." },
        { name: "Sgt. Selorm Agbeko", role: "Volta Region Coordinator", quote: "The association runs like a well-kept parade: everyone knows the drill, and everyone matters." },
        { name: "Cdt. Fatima Alhassan", role: "Northern Region", quote: "I joined for the uniform values and stayed for the family. Every region feels like home ground." },
      ],
      social: {
        facebook: "https://facebook.com/pacosa.national", instagram: "https://instagram.com/pacosa.national",
        tiktok: "https://tiktok.com/@pacosa.national", youtube: "https://youtube.com/@pacosa-national",
        x: "https://x.com/pacosa_nat", linkedin: "https://linkedin.com/company/pacosa", whatsapp: "https://wa.me/233302741188",
      },
      seo: {
        title: "PACOSA — Cadets Association",
        description: "The national cadets association: discipline, leadership, unity, service and excellence.",
        keywords: "PACOSA, cadets, old cadets, youth leadership, community service",
        verification: "",
      },
      smtp: { host: "smtp.pacosa.org", port: "587", user: "no-reply@pacosa.org", fromName: "PACOSA Secretariat", notifyEmails: "secretariat@pacosa.org, membership@pacosa.org", enabled: true },
      donation: {
        intro: "Your support keeps uniforms on backs, seedlings in the ground and young leaders in training. Every contribution is receipted and reported in our audited annual statement.",
        bankName: "National Development Bank", bankAccount: "0011 4488 2266 90", accountName: "PACOSA National Secretariat", branch: "Independence Avenue Branch, Accra",
        momo: [
          { network: "MTN Mobile Money", number: "024 555 0188", name: "PACOSA NATIONAL" },
          { network: "Telecel Cash", number: "020 990 0188", name: "PACOSA NATIONAL" },
          { network: "AT Money", number: "026 410 0188", name: "PACOSA NATIONAL" },
        ],
        instructions: [
          "Quote your full name and region as the payment reference.",
          "Email your receipt to secretariat@pacosa.org for an official acknowledgement.",
          "Donations above GHS 1,000 receive a patron certificate signed by the National President.",
        ],
      },
      footerText: "PACOSA — the national home of serving and former cadets. Discipline • Leadership • Unity • Service • Excellence.",
      mapQuery: "Independence Avenue, Accra, Ghana",
      primaryColor: "#2b3e2b", accentColor: "#c29b3c",
    },
    users: [
      { id: "u1", name: "Cmdr. Daniel Osei", email: "admin@pacosa.org", passwordHash: hashPw("pacosa2026"), role: "super", active: true, color: "#2b3e2b" },
      { id: "u2", name: "Naa Adjeley Quartey", email: "manager@pacosa.org", passwordHash: hashPw("pacosa2026"), role: "admin", active: true, color: "#486343" },
      { id: "u3", name: "Selorm Kpodar", email: "editor@pacosa.org", passwordHash: hashPw("editor2026"), role: "editor", active: true, color: "#a37f2c" },
      { id: "u4", name: "Gifty Mensimah", email: "officer@pacosa.org", passwordHash: hashPw("officer2026"), role: "officer", active: true, color: "#5d7b55" },
    ],
    members,
    programs: [
      { id: "p1", title: "Cadet Basic Training Course — Intake 26", description: "The eighteen-week foundation course: drill, field craft, first aid, map reading and camp discipline for newly enlisted cadets.", image: IMG.training, startDate: d(21).date, endDate: d(147).date, time: "06:00 – 17:00 (weekends)", location: "National Training Grounds, Legon", organizer: "National Training Directorate", category: "Cadet Training", registrationUrl: "", status: "published", featured: true, registrationOpen: true, createdAt: iso(-30) },
      { id: "p2", title: "National Leadership Summit 2026", description: "Three days of leadership labs, national dialogue and inter-regional competitions under the theme 'Discipline for a New Generation'.", image: IMG.summit, startDate: d(35).date, endDate: d(37).date, time: "08:00 – 18:00 daily", location: "Accra International Conference Centre", organizer: "National Executive Council", category: "Leadership Development", registrationUrl: "", status: "published", featured: true, registrationOpen: true, createdAt: iso(-20) },
      { id: "p3", title: "Regional Community Clean-Up Drive", description: "Quarterly coordinated clean-up and greening exercise with municipal assemblies. All members and friends welcome — vests provided.", image: IMG.service, startDate: d(9).date, time: "06:30 – 11:00", location: "All regional capitals", organizer: "Community Service Corps", category: "Community Service", registrationUrl: "", status: "published", featured: true, registrationOpen: true, createdAt: iso(-15) },
      { id: "p4", title: "Independence Grand Parade", description: "The flagship ceremonial parade: 600 marchers, massed bands and a salute to colours at the national square.", image: IMG.parade, startDate: d(48).date, time: "07:00 – 12:00", location: "National Independence Square, Accra", organizer: "Ceremonial Directorate", category: "Parade & Ceremonies", registrationUrl: "", status: "published", featured: false, registrationOpen: false, createdAt: iso(-12) },
      { id: "p5", title: "Inter-Regional Cadet Games", description: "Athletics, football, volleyball and cross-country contested for the Commander's Cup across all eight regions.", image: IMG.hero, startDate: d(70).date, endDate: d(72).date, time: "All day", location: "El-Wak Stadium, Accra", organizer: "National Sports Desk", category: "Sports Activities", registrationUrl: "", status: "published", featured: false, registrationOpen: true, createdAt: iso(-10) },
      { id: "p6", title: "STEM & Career Mentorship Day", description: "Industry professionals mentor senior cadets through project sprints, CV clinics and mock interviews.", image: IMG.training, startDate: d(14).date, time: "09:00 – 15:00", location: "TechBridge Hub, Osu", organizer: "Education Desk", category: "Career Development", registrationUrl: "", status: "published", featured: false, registrationOpen: true, createdAt: iso(-8) },
      { id: "p7", title: "Youth Empowerment Workshop Series", description: "A four-weekend series on financial literacy, public speaking and civic responsibility for members aged 16–25.", image: IMG.summit, startDate: d(28).date, endDate: d(49).date, time: "Saturdays, 10:00 – 14:00", location: "Regional chapter halls", organizer: "Youth Empowerment Desk", category: "Youth Empowerment", registrationUrl: "", status: "published", featured: false, registrationOpen: true, createdAt: iso(-6) },
      { id: "p8", title: "First Aid & Disaster Response Certification", description: "Certified training in emergency first aid, search protocols and flood response — a prerequisite for the service corps.", image: IMG.service, startDate: d(-21).date, endDate: d(-19).date, time: "08:00 – 16:00", location: "Red Cross Training Centre, Accra", organizer: "Community Service Corps", category: "Educational Programs", registrationUrl: "", status: "completed", featured: false, registrationOpen: false, createdAt: iso(-60) },
      { id: "p9", title: "Annual General Assembly 2026", description: "The statutory assembly: audited accounts, state of the association address and elections to the liaison council.", image: IMG.team, startDate: d(90).date, time: "09:00 – 16:00", location: "National Secretariat, Accra", organizer: "General Secretariat", category: "Annual Cadet Events", registrationUrl: "", status: "draft", featured: false, registrationOpen: false, createdAt: iso(-2) },
    ],
    events: [
      { id: "e1", title: "Executive Council Monthly Sitting", description: "Monthly sitting of the National Executive Council — agenda: summit logistics and regional quotas.", date: d(3).date, startTime: "17:00", endTime: "20:00", location: "National Secretariat, Accra", category: "Meeting", status: "published", image: IMG.team },
      { id: "e2", title: "Regional Clean-Up Drive", description: "Quarterly clean-up across all regional capitals. Assemble at chapter halls by 06:15.", date: d(9).date, startTime: "06:30", endTime: "11:00", location: "All regional capitals", category: "Community", status: "published", image: IMG.service },
      { id: "e3", title: "STEM & Career Mentorship Day", description: "Mentorship sprints, CV clinics and mock interviews with industry professionals.", date: d(14).date, startTime: "09:00", endTime: "15:00", location: "TechBridge Hub, Osu", category: "Education", status: "published", image: IMG.training },
      { id: "e4", title: "Basic Training Intake 26 — Reporting Day", description: "New cadets report with kit list items 1–14. Late arrival forfeits first-week pass.", date: d(21).date, startTime: "06:00", endTime: "17:00", location: "National Training Grounds, Legon", category: "Training", status: "published", image: IMG.training },
      { id: "e5", title: "National Leadership Summit 2026", description: "Three-day summit: leadership labs, drill competitions and national dialogue.", date: d(35).date, startTime: "08:00", endTime: "18:00", location: "Accra International Conference Centre", category: "Ceremony", status: "published", image: IMG.summit },
      { id: "e6", title: "Independence Grand Parade", description: "Massed parade and salute to colours. Fall-in by 06:30 sharp in No. 2 dress.", date: d(48).date, startTime: "07:00", endTime: "12:00", location: "National Independence Square", category: "Ceremony", status: "published", image: IMG.parade },
      { id: "e7", title: "Commander's Cup Games — Opening Ceremony", description: "Opening ceremony and first fixtures of the inter-regional games.", date: d(70).date, startTime: "08:00", endTime: "17:00", location: "El-Wak Stadium, Accra", category: "Sports", status: "published", image: IMG.hero },
      { id: "e8", title: "Old Cadets' Social Night", description: "An evening of songs, stories and recognition for members of ten years and more.", date: d(-7).date, startTime: "18:30", endTime: "22:00", location: "Officers' Mess, Burma Camp", category: "Social", status: "published", image: IMG.graduation },
      { id: "e9", title: "Passing-Out Parade — Class of 2026", description: "148 cadet officers marched out in review order. Full album now in the gallery.", date: d(-16).date, startTime: "09:00", endTime: "13:00", location: "National Parade Grounds", category: "Ceremony", status: "published", image: IMG.graduation },
      { id: "e10", title: "Greater Accra Inter-Chapter Drill Meet", description: "Quarterly drill and turnout competition between Accra chapters.", date: d(-24).date, startTime: "08:00", endTime: "14:00", location: "Achimota Parade Square", category: "Training", status: "published", image: IMG.parade },
    ],
    news: articles,
    albums: [
      { id: "a1", title: "Cadet Training", description: "Field craft, drill practice and camp life from the national training grounds.", cover: IMG.training, images: [
        { id: "i1", url: IMG.training, caption: "Team wall obstacle — Intake 25, week 9" },
        { id: "i2", url: IMG.hero, caption: "Evening parade at the national training grounds" },
        { id: "i3", url: IMG.service, caption: "Field exercise: community water-point mapping" },
      ]},
      { id: "a2", title: "Parades & Ceremonies", description: "Marching in review order: grand parades, salutes to colours and ceremonial duties.", cover: IMG.parade, images: [
        { id: "i4", url: IMG.parade, caption: "Independence Grand Parade — column in review order" },
        { id: "i5", url: IMG.hero, caption: "Massed formation at golden hour" },
        { id: "i6", url: IMG.team, caption: "Executive council review of the guard of honour" },
      ]},
      { id: "a3", title: "Graduation & Passing-Out", description: "Certificates, salutes and proud families — the passing-out of the Class of 2026.", cover: IMG.graduation, images: [
        { id: "i7", url: IMG.graduation, caption: "Class of 2026 after the salute to colours" },
        { id: "i8", url: IMG.team, caption: "Award of excellence — Best in Drill" },
        { id: "i9", url: IMG.parade, caption: "The slow march past the saluting dais" },
      ]},
      { id: "a4", title: "Community Service", description: "Clean-ups, greening and disaster response — the service corps in action.", cover: IMG.service, images: [
        { id: "i10", url: IMG.service, caption: "Tree planting along the Densu corridor" },
        { id: "i11", url: IMG.training, caption: "Volunteers at the desilting line" },
        { id: "i12", url: IMG.hero, caption: "Debrief after the flood-response drill" },
      ]},
      { id: "a5", title: "Leadership Programs", description: "Summits, labs and mentorship — forming the next generation of officers.", cover: IMG.summit, images: [
        { id: "i13", url: IMG.summit, caption: "Leadership lab plenary, National Summit" },
        { id: "i14", url: IMG.team, caption: "Mentor cohort with the National President" },
        { id: "i15", url: IMG.graduation, caption: "Certificate presentation — officer foundation track" },
      ]},
      { id: "a6", title: "Annual Events", description: "Games, assemblies and the flagship gatherings of the association year.", cover: IMG.hero, images: [
        { id: "i16", url: IMG.hero, caption: "Opening formation — Inter-Regional Games" },
        { id: "i17", url: IMG.summit, caption: "State of the Association address" },
        { id: "i18", url: IMG.graduation, caption: "Commander's Cup presentation" },
      ]},
    ],
    videos: [
      { id: "v1", title: "Inside the Passing-Out Parade — Class of 2026", description: "The full story of parade day: from 05:00 turnout inspection to the final salute.", provider: "youtube", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnail: IMG.graduation, category: "Ceremonies", date: d(-15).date },
      { id: "v2", title: "A Day at National Training Grounds", description: "Follow Intake 25 through a full training day — PT, field craft and evening parade.", provider: "youtube", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnail: IMG.training, category: "Training", date: d(-40).date },
      { id: "v3", title: "Community Service Corps: 12,000 Hours", description: "Highlights from a year of clean-ups, greening and disaster-response drills.", provider: "youtube", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnail: IMG.service, category: "Community", date: d(-60).date },
      { id: "v4", title: "National Leadership Summit — Keynote", description: "The keynote address: 'Discipline for a New Generation'.", provider: "youtube", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnail: IMG.summit, category: "Leadership", date: d(-30).date },
      { id: "v5", title: "Commander's Cup — Final Relay", description: "The 0.3-second margin that decided this year's games.", provider: "youtube", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnail: IMG.hero, category: "Sports", date: d(-45).date },
    ],
    leaders: [
      { id: "l1", name: "Cmdr. Daniel Osei", position: "National President", order: 1, bio: "Elected in 2024, Cmdr. Osei is a retired naval officer and old cadet of Ghana National College. He has led the association's expansion to all eight regions and championed the officer foundation track.", background: "Naval Cadet Corps (1998–2001) • 22 years of service", photo: "", socials: [{ label: "LinkedIn", url: "https://linkedin.com" }] },
      { id: "l2", name: "WO II Abena Owusu", position: "Vice President", order: 2, bio: "A former warrant officer of the Achimota unit, WO II Owusu oversees chapter development and the national disciplinary code. She chairs the women-in-service desk.", background: "Achimota School Cadet Unit (2003–2006)", photo: "", socials: [] },
      { id: "l3", name: "Mr. Yaw Boateng", position: "General Secretary", order: 3, bio: "Keeper of the records and the constitution. Mr. Boateng runs the secretariat, the annual assembly and all statutory correspondence.", background: "Prempeh College Cadet Corps (2001–2004)", photo: "", socials: [{ label: "X", url: "https://x.com" }] },
      { id: "l4", name: "Ms. Naa Adjeley Quartey", position: "Organising Secretary", order: 4, bio: "From summit logistics to parade-day marshalling, Ms. Quartey coordinates the national event calendar and the volunteer corps.", background: "Presby Boys' Legon Cadet Corps (2005–2008)", photo: "", socials: [] },
      { id: "l5", name: "Mr. Kofi Adjei", position: "National Treasurer", order: 5, bio: "A chartered accountant who presents the association's audited accounts to every assembly — unqualified opinions, every year since 2020.", background: "Mfantsipim School Cadet Corps (1999–2002)", photo: "", socials: [{ label: "LinkedIn", url: "https://linkedin.com" }] },
      { id: "l6", name: "Ms. Ama Serwaa", position: "Public Relations Officer", order: 6, bio: "Runs the national news desk, media partnerships and the digital channels that keep 1,200 members informed.", background: "Aburi Girls' SHS Cadet Unit (2008–2011)", photo: "", socials: [{ label: "Instagram", url: "https://instagram.com" }] },
      { id: "l7", name: "Sgt. Ibrahim Fuseini", position: "Regional Coordinator — Northern", order: 7, bio: "Coordinates the northern chapters, the water-point mapping capstone and the girls-in-cadet advocacy program.", background: "Tamale SHS Cadet Unit (2009–2012)", photo: "", socials: [] },
      { id: "l8", name: "Cpl. Linda Quartey", position: "Regional Coordinator — Greater Accra", order: 8, bio: "Leads the largest chapter in the association and hosts the quarterly inter-chapter drill meets.", background: "Wesley Girls' SHS Cadet Unit (2010–2013)", photo: "", socials: [] },
    ],
    pages: [
      { id: "pg1", slug: "constitution", title: "Constitution & Bylaws", content: "<h2>The PACOSA Constitution</h2><p>Adopted at the inaugural assembly of 2011 and amended by the 2024 assembly, the constitution governs membership, elections, chapters and the conduct of all organs of the association.</p><h3>Key principles</h3><ul><li>Membership is open to all serving and former cadets of chartered corps.</li><li>Elections hold every two years under an independent electoral committee.</li><li>Regional chapters operate under charter from the National Executive Council.</li></ul><blockquote>The full text is available from the secretariat upon written request.</blockquote>", seoTitle: "PACOSA Constitution & Bylaws", seoDescription: "The governing constitution and bylaws of PACOSA.", published: true, updatedAt: iso(-90) },
    ],
    messages: [
      { id: "msg1", name: "Mr. Emmanuel Kpodzro", email: "e.kpodzro@municipal.gov", phone: "+233 30 220 9911", subject: "Partnership for district clean-up", body: "The Municipal Assembly would like to partner with PACOSA for our December sanitation exercise. We can provide logistics and waste bins. Kindly advise on your availability.", createdAt: iso(-4), read: false },
      { id: "msg2", name: "Selorm Attipoe", email: "sel.attipoe@studentmail.com", phone: "+233 55 100 2311", subject: "Joining as a serving cadet", body: "I am a second-year cadet at Mawuli School. Am I eligible to join PACOSA now, or must I complete my training first?", createdAt: iso(-8), read: false },
      { id: "msg3", name: "Mrs. Josephine Amoah", email: "j.amoah@parentsmail.com", phone: "+233 24 771 8090", subject: "Parent enquiry — training safety", body: "My daughter wants to enroll in Intake 26. Please share your safety and supervision arrangements for weekend training.", createdAt: iso(-13), read: true },
    ],
    media: [
      { id: "md1", name: "hero-formation.jpg", url: IMG.hero, size: 412000, type: "image/jpeg", folder: "Website", createdAt: iso(-45) },
      { id: "md2", name: "training-obstacle.jpg", url: IMG.training, size: 388000, type: "image/jpeg", folder: "Programs", createdAt: iso(-44) },
      { id: "md3", name: "grand-parade.jpg", url: IMG.parade, size: 402000, type: "image/jpeg", folder: "Programs", createdAt: iso(-40) },
      { id: "md4", name: "clean-up-drive.jpg", url: IMG.service, size: 371000, type: "image/jpeg", folder: "Community", createdAt: iso(-33) },
      { id: "md5", name: "passing-out.jpg", url: IMG.graduation, size: 395000, type: "image/jpeg", folder: "Ceremonies", createdAt: iso(-16) },
      { id: "md6", name: "summit-keynote.jpg", url: IMG.summit, size: 366000, type: "image/jpeg", folder: "Leadership", createdAt: iso(-30) },
      { id: "md7", name: "executive-team.jpg", url: IMG.team, size: 408000, type: "image/jpeg", folder: "Website", createdAt: iso(-50) },
    ],
    activity: [
      { id: "ac1", text: "New membership application received — Esi Cudjoe (Central)", type: "application", user: "System", at: iso(-2) },
      { id: "ac2", text: "News article published: 'National Cadet Leadership Summit'", type: "news", user: "Selorm Kpodar", at: iso(-2) },
      { id: "ac3", text: "New membership application received — Kofi Antwi-Boasiako (Ashanti)", type: "application", user: "System", at: iso(-7) },
      { id: "ac4", text: "Gallery updated: 'Community Service' — 3 photos added", type: "gallery", user: "Naa Adjeley Quartey", at: iso(-9) },
      { id: "ac5", text: "New program published: 'Regional Community Clean-Up Drive'", type: "program", user: "Naa Adjeley Quartey", at: iso(-15) },
      { id: "ac6", text: "News article published: 'Passing-Out Parade Celebrates Class of 2026'", type: "news", user: "Selorm Kpodar", at: iso(-16) },
      { id: "ac7", text: "Membership application approved — Daniel Tetteh (PAC-2026-0236)", type: "member", user: "Gifty Mensimah", at: iso(-35) },
    ],
    subscribers: [
      { id: "s1", email: "kwabena.asamoah@mail.com", createdAt: iso(-200) },
      { id: "s2", email: "adwoa.nyarko@mail.com", createdAt: iso(-160) },
      { id: "s3", email: "selorm.agbeko@mail.com", createdAt: iso(-90) },
    ],
  };
}
