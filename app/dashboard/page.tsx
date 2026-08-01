"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// import { supabase } from "@/lib/supabaseClient";
import { createClient } from "@/lib/supabase/client";


interface UserData { name?: string; email?: string; role?: string; }
interface DashboardStats { totalClients: number; totalDocuments: number; upcomingBirthdays: number; todayBirthdays: number; todayAnniversaries: number; upcomingAnniversaries: number; }
interface BirthdayItem { name: string; date_of_birth: string; relationship: string; phone?: string; client_id: string; }
interface DocumentItem { name: string; file_name: string; file_type: string; file_size: number; created_at: string; client_name?: string; }

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Success is not final; failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "What you get by achieving your goals is not as important as what you become.", author: "Goethe" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Keep your eyes on the stars and your feet on the ground.", author: "Theodore Roosevelt" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "Whether you think you can or you can't, you're right.", author: "Henry Ford" },
  { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
  { text: "An unexamined life is not worth living.", author: "Socrates" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { text: "Spread love everywhere you go. Let no one ever come without leaving happier.", author: "Mother Teresa" },
  { text: "When you reach the end of your rope, tie a knot in it and hang on.", author: "Franklin D. Roosevelt" },
  { text: "Always remember that you are absolutely unique. Just like everyone else.", author: "Margaret Mead" },
  { text: "Do not go where the path may lead; go where there is no path and leave a trail.", author: "Ralph Waldo Emerson" },
  { text: "You will face many defeats in life, but never let yourself be defeated.", author: "Maya Angelou" },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
  { text: "In the end, it's not the years in your life that count. It's the life in your years.", author: "Abraham Lincoln" },
  { text: "Never let the fear of striking out keep you from playing the game.", author: "Babe Ruth" },
  { text: "Life is either a daring adventure or nothing at all.", author: "Helen Keller" },
];

// ── Icons ──────────────────────────────────────────────────────────────────
const IC = {
  Users: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Folder: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>,
  Cake: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18z" /></svg>,
  Star: () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  Search: () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  UserPlus: () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
  Upload: () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  Calendar: () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  List: () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
  ChevronRight: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
  ArrowRight: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>,
  Quote: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>,
  Whatsapp: () => <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  Lightning: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Doc: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Heart: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
};

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-2xl bg-slate-100 ${className}`} />
);

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<DashboardStats>({ totalClients: 0, totalDocuments: 0, upcomingBirthdays: 0, todayBirthdays: 0, todayAnniversaries: 0, upcomingAnniversaries: 0 });
  const [birthdays, setBirthdays] = useState<BirthdayItem[]>([]);
  const [recentDocs, setRecentDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  // ✅ KEY FIX: Start as null (unknown) not true/false.
  // null = "we don't know yet", false = "definitely not authed" → redirect
  const [authChecked, setAuthChecked] = useState<boolean | null>(null);


  const supabase = createClient();   // ← ADD THIS LINE HERE
  const todayQuote = QUOTES[new Date().getDate() % QUOTES.length];

  useEffect(() => {
    // ✅ Use onAuthStateChange — this fires immediately with the current session
    // state AND whenever auth changes. Much more reliable than getSession() alone.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          // Definitely not logged in → redirect
          setAuthChecked(false);
          router.replace("/login");
          return;
        }

        // We have a valid session
        setAuthChecked(true);
        setUser({
          name: session.user.user_metadata?.name,
          email: session.user.email,
          role: session.user.user_metadata?.role,
        });

        await fetchDashboardData(session.access_token);
      }
    );

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  async function fetchDashboardData(accessToken: string) {
    const headers: HeadersInit = { Authorization: `Bearer ${accessToken}` };
    try {
      const [cR, dR, bR, aR] = await Promise.all([
        fetch("/api/clients",                  { headers }),
        fetch("/api/documents",                { headers }),
        fetch("/api/birthdays?range=week",     { headers }),
        fetch("/api/anniversaries?range=week", { headers }),
      ]);
      const c = await cR.json(), d = await dR.json(), b = await bR.json(), a = await aR.json();
      setStats({
        totalClients:          c.total            || 0,
        totalDocuments:        d.total            || 0,
        upcomingBirthdays:     b.stats?.thisWeek  || 0,
        todayBirthdays:        b.stats?.today     || 0,
        todayAnniversaries:    a.stats?.today     || 0,
        upcomingAnniversaries: a.stats?.thisWeek  || 0,
      });
      setBirthdays((b.birthdays || []).slice(0, 5));
      setRecentDocs((d.documents || []).slice(0, 5));
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }

  const getGreeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };
  const formatSize = (b: number) => b < 1024 ? b + " B" : b < 1048576 ? (b / 1024).toFixed(1) + " KB" : (b / 1048576).toFixed(1) + " MB";
  const formatTime = (s: string) => { const h = Math.floor((Date.now() - new Date(s).getTime()) / 3600000); return h < 1 ? "Just now" : h < 24 ? `${h}h ago` : h < 48 ? "Yesterday" : `${Math.floor(h / 24)}d ago`; };
  const getNextBday = (d: string) => { const b = new Date(d), n = new Date(), ty = new Date(n.getFullYear(), b.getMonth(), b.getDate()); return (ty >= n ? ty : new Date(n.getFullYear() + 1, b.getMonth(), b.getDate())).toLocaleDateString("en-IN", { day: "numeric", month: "short" }); };
  const getAge = (d: string) => { const b = new Date(d), n = new Date(); let a = n.getFullYear() - b.getFullYear(); if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--; return a + 1; };
  const getDocMeta = (t: string) => ({ PDF: { bg: "bg-[#EF4444]/10", text: "text-[#EF4444]" }, IMG: { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]" }, DOC: { bg: "bg-[#0E7AC7]/10", text: "text-[#0E7AC7]" }, DOCX: { bg: "bg-[#0E7AC7]/10", text: "text-[#0E7AC7]" }, XLS: { bg: "bg-[#14B86A]/10", text: "text-[#14B86A]" } }[t] ?? { bg: "bg-slate-100", text: "text-slate-500" });

  const statCards = [
    { label: "Total Clients",  value: stats.totalClients,   icon: <IC.Users />,  sub: "Active profiles", ib: "bg-[#DDF3FF] text-[#005A87]" },
    { label: "Documents",      value: stats.totalDocuments, icon: <IC.Folder />, sub: "Stored files",    ib: "bg-[#7C6CF6]/10 text-[#7C6CF6]" },
  ];

  const actions = [
    { label: "Add Client",     icon: <IC.UserPlus />, href: "/dashboard/clients?action=add", ib: "bg-[#DDF3FF] text-[#005A87]" },
    { label: "Upload Policy",  icon: <IC.Upload />,   href: "/dashboard/documents",           ib: "bg-[#7C6CF6]/10 text-[#7C6CF6]" },
    { label: "View Birthdays", icon: <IC.Calendar />, href: "/dashboard/birthdays",           ib: "bg-[#EF4444]/10 text-[#EF4444]" },
    { label: "All Clients",    icon: <IC.List />,     href: "/dashboard/clients",             ib: "bg-[#F59E0B]/10 text-[#F59E0B]" },
  ];

  // ✅ Show a blank loading screen while auth state is being determined.
  // This prevents the dashboard from flashing before redirect.
  if (authChecked === null) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#005A87]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-[#6B7280] font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-8">

      {/* ── Top Bar ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#005A87] flex items-center justify-center text-white font-bold text-sm shrink-0 select-none shadow-sm shadow-[#005A87]/20">
              {(user?.name?.[0] || "G").toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-[#6B7280] leading-none">{getGreeting()}</p>
              <h1 className="text-[15px] sm:text-base font-bold text-[#1F2937] leading-tight truncate mt-0.5">
                {user?.name?.split(" ")[0] || "Guest"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {stats.todayBirthdays > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-[#F59E0B]/10 text-[#F59E0B] px-3 py-1.5 rounded-full">
                <IC.Star /> {stats.todayBirthdays} today
              </span>
            )}
            <Link href="/dashboard/clients" aria-label="Search clients" className="w-10 h-10 flex items-center justify-center rounded-2xl bg-[#F7F9FC] text-[#6B7280] hover:bg-[#005A87] hover:text-white transition-colors">
              <IC.Search />
            </Link>
          </div>
        </div>
        {stats.todayBirthdays > 0 && (
          <div className="sm:hidden px-4 pb-3 -mt-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#F59E0B]/10 text-[#F59E0B] px-3 py-1.5 rounded-full">
              <IC.Star /> {stats.todayBirthdays} birthday{stats.todayBirthdays > 1 ? "s" : ""} today
            </span>
          </div>
        )}
      </header>

      {/* ── Page Body ─────────────────────────────────────────────── */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-8 space-y-5 sm:space-y-6">

        {/* Quote card */}
        <div className="relative bg-[#005A87] rounded-[22px] overflow-hidden px-5 sm:px-7 py-5 sm:py-6 flex items-start gap-4 shadow-sm">
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(ellipse at 10% 20%, rgba(14,122,199,0.35) 0%, transparent 60%), radial-gradient(ellipse at 95% 100%, rgba(124,108,246,0.20) 0%, transparent 55%)" }} />
          <div className="shrink-0 mt-0.5 w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white">
            <IC.Quote />
          </div>
          <div className="relative z-10 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/60 mb-2">Quote of the Day</p>
            <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">&ldquo;{todayQuote.text}&rdquo;</p>
            <p className="text-xs text-white/70 font-medium mt-2.5">— {todayQuote.author}</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {actions.map(a => (
            <Link key={a.label} href={a.href}
              className="flex items-center gap-3 px-4 py-4 bg-white border border-slate-100 rounded-[20px] text-sm font-semibold text-[#1F2937] shadow-sm transition-all active:scale-[0.97] hover:shadow-md hover:-translate-y-0.5">
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.ib}`}>{a.icon}</span>
              <span className="truncate">{a.label}</span>
            </Link>
          ))}
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {statCards.map((c) => (
            <div key={c.label} className="bg-white rounded-[22px] border border-slate-100 shadow-sm p-5 sm:p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${c.ib}`}>{c.icon}</div>
                <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-[#F7F9FC] text-[#6B7280]">{c.sub}</span>
              </div>
              <div>
                {loading ? <Skeleton className="h-9 w-16 mb-1.5" /> : <p className="text-[32px] font-bold text-[#1F2937] tabular-nums leading-none">{c.value}</p>}
                <p className="text-xs font-medium text-[#6B7280] mt-2">{c.label}</p>
              </div>
            </div>
          ))}

          {/* Card 3: Split Events */}
          <div className="bg-white rounded-[22px] border border-slate-100 shadow-sm p-4 sm:p-5 flex flex-col justify-center gap-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F7F9FC] transition-colors hover:bg-[#EF4444]/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center shrink-0"><IC.Cake /></div>
                <div>
                  <p className="text-xs font-semibold text-[#6B7280] leading-none mb-2">Birthdays</p>
                  <div className="flex items-center gap-3">
                    <Link href="/dashboard/clients?filter=birthdays-today" className="flex items-center gap-1.5 hover:opacity-75 transition-opacity">
                      <span className="text-sm font-bold text-[#EF4444] leading-none">{stats.todayBirthdays}</span>
                      <span className="text-[10px] font-semibold text-[#6B7280] uppercase leading-none">Today</span>
                    </Link>
                    <span className="text-slate-200 text-xs">|</span>
                    <Link href="/dashboard/clients?filter=birthdays-upcoming" className="flex items-center gap-1.5 hover:opacity-75 transition-opacity">
                      <span className="text-sm font-bold text-[#1F2937] leading-none">{stats.upcomingBirthdays}</span>
                      <span className="text-[10px] font-semibold text-[#6B7280] uppercase leading-none">7 Days</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F7F9FC] transition-colors hover:bg-[#7C6CF6]/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#7C6CF6]/10 text-[#7C6CF6] flex items-center justify-center shrink-0">
                  <IC.Heart />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#6B7280] leading-none mb-2">Anniversaries</p>
                  <div className="flex items-center gap-3">
                    <Link href="/dashboard/clients?filter=anniversaries-today" className="flex items-center gap-1.5 hover:opacity-75 transition-opacity">
                      <span className="text-sm font-bold text-[#7C6CF6] leading-none">{stats.todayAnniversaries}</span>
                      <span className="text-[10px] font-semibold text-[#6B7280] uppercase leading-none">Today</span>
                    </Link>
                    <span className="text-slate-200 text-xs">|</span>
                    <Link href="/dashboard/clients?filter=anniversaries-upcoming" className="flex items-center gap-1.5 hover:opacity-75 transition-opacity">
                      <span className="text-sm font-bold text-[#1F2937] leading-none">{stats.upcomingAnniversaries}</span>
                      <span className="text-[10px] font-semibold text-[#6B7280] uppercase leading-none">7 Days</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-5 gap-5 sm:gap-6">

          {/* Documents — 3 cols */}
          <div className="lg:col-span-3 bg-white rounded-[22px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#7C6CF6]/10 text-[#7C6CF6] flex items-center justify-center"><IC.Doc /></div>
                <div>
                  <h2 className="text-[15px] font-bold text-[#1F2937]">Recent Documents</h2>
                  <p className="text-xs text-[#6B7280] font-medium leading-none mt-1">Latest uploads across clients</p>
                </div>
              </div>
              <Link href="/dashboard/documents" className="flex items-center gap-1 text-xs font-bold text-[#005A87] hover:text-[#0E7AC7] transition-colors shrink-0">
                View all <IC.ChevronRight />
              </Link>
            </div>
            <div className="hidden sm:grid grid-cols-12 px-6 py-2.5 bg-[#F7F9FC]">
              {["Name", "Client", "Size", "Uploaded"].map((h, i) => (
                <span key={h} className={`text-[10px] font-bold uppercase tracking-widest text-[#6B7280] ${i === 0 ? "col-span-5" : i === 1 ? "col-span-3" : i === 2 ? "col-span-2 text-right" : "col-span-2 text-right"}`}>{h}</span>
              ))}
            </div>
            <div className="divide-y divide-slate-50">
              {loading ? (
                [1,2,3,4].map(i => (
                  <div key={i} className="flex items-center gap-3 px-5 sm:px-6 py-4">
                    <Skeleton className="w-10 h-10 shrink-0" />
                    <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-2/5" /><Skeleton className="h-2.5 w-1/4" /></div>
                    <Skeleton className="h-2.5 w-16 hidden sm:block" />
                  </div>
                ))
              ) : recentDocs.length === 0 ? (
                <div className="py-16 text-center px-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#F7F9FC] flex items-center justify-center mx-auto mb-3 text-[#6B7280]"><IC.Folder /></div>
                  <p className="text-sm font-semibold text-[#1F2937]">No documents yet</p>
                  <Link href="/dashboard/documents" className="text-xs text-[#005A87] font-bold hover:underline mt-1 inline-block">Upload your first →</Link>
                </div>
              ) : (
                recentDocs.map((doc, i) => {
                  const m = getDocMeta(doc.file_type);
                  return (
                    <div key={i} className="grid sm:grid-cols-12 items-center px-5 sm:px-6 py-3.5 gap-1 sm:gap-0 hover:bg-[#F7F9FC] transition-colors group">
                      <div className="sm:col-span-5 flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.bg}`}>
                          <span className={`text-[9px] font-bold leading-none ${m.text}`}>{doc.file_type}</span>
                        </div>
                        <p className="text-sm font-semibold text-[#1F2937] truncate group-hover:text-[#005A87] transition-colors">{doc.file_name}</p>
                      </div>
                      <p className="sm:col-span-3 hidden sm:block text-[13px] text-[#6B7280] font-medium truncate pl-1">{doc.client_name || "—"}</p>
                      <p className="sm:col-span-2 hidden sm:block text-xs text-[#6B7280] font-medium text-right">{formatSize(doc.file_size)}</p>
                      <p className="sm:col-span-2 hidden sm:block text-xs text-[#6B7280] font-medium text-right">{formatTime(doc.created_at)}</p>
                      <p className="sm:hidden text-xs text-[#6B7280] font-medium pl-[52px] -mt-1">{formatSize(doc.file_size)} · {formatTime(doc.created_at)}{doc.client_name ? ` · ${doc.client_name}` : ""}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right col */}
          <div className="lg:col-span-2 flex flex-col gap-5 sm:gap-6">
            <div className="bg-white rounded-[22px] border border-slate-100 shadow-sm overflow-hidden flex-1">
              <div className="flex items-center justify-between px-5 py-4 sm:py-5 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center"><IC.Cake /></div>
                  <div>
                    <h2 className="text-[15px] font-bold text-[#1F2937]">Birthdays</h2>
                    <p className="text-xs text-[#6B7280] font-medium leading-none mt-1">This week</p>
                  </div>
                </div>
                <Link href="/dashboard/birthdays" className="flex items-center gap-1 text-xs font-bold text-[#005A87] hover:text-[#0E7AC7] transition-colors shrink-0">
                  Calendar <IC.ChevronRight />
                </Link>
              </div>
              <div className="divide-y divide-slate-50">
                {loading ? (
                  [1,2,3].map(i => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-24" /><Skeleton className="h-2.5 w-32" /></div>
                      <Skeleton className="h-3 w-10" />
                    </div>
                  ))
                ) : birthdays.length === 0 ? (
                  <div className="py-12 text-center"><p className="text-sm font-semibold text-[#6B7280]">No birthdays this week</p></div>
                ) : (
                  birthdays.map(b => (
                    <div key={b.name + b.date_of_birth} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#F7F9FC] transition-colors">
                      <div className="w-10 h-10 rounded-full bg-[#EF4444] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm shadow-[#EF4444]/20">
                        {b.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#1F2937] truncate">{b.name}</p>
                        <p className="text-xs text-[#6B7280] font-medium capitalize">{b.relationship} · Turns {getAge(b.date_of_birth)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-xs font-bold text-[#EF4444] bg-[#EF4444]/10 px-2.5 py-1 rounded-full">{getNextBday(b.date_of_birth)}</span>
                        {b.phone && (
                          <a href={`https://wa.me/${b.phone.replace(/\s/g,"")}?text=Happy%20Birthday%20${b.name}!`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] font-bold text-[#14B86A] hover:text-[#0f9d59] transition-colors">
                            <IC.Whatsapp /> Wish
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="relative bg-[#0E7AC7] rounded-[22px] overflow-hidden p-6 shadow-lg shadow-[#0E7AC7]/20">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-4 w-24 h-24 bg-[#005A87]/30 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white"><IC.Lightning /></div>
                  <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest">Client Hub</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 leading-snug">All your clients, one place</h3>
                <p className="text-white/75 text-[13px] font-medium mb-5 leading-relaxed">Manage profiles, policies, family members, and never miss an important date.</p>
                <Link href="/dashboard/clients"
                  className="inline-flex items-center gap-2 px-5 h-12 bg-white text-[#005A87] text-sm font-bold rounded-2xl hover:bg-[#DDF3FF] transition-all active:scale-95 shadow-md">
                  Open Directory <IC.ArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}