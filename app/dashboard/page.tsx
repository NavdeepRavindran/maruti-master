"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  Users: () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Folder: () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>,
  Cake: () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18z" /></svg>,
  Star: () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  UserPlus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
  Upload: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  Calendar: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  List: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
  ChevronRight: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
  ArrowRight: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>,
  Quote: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>,
  Whatsapp: () => <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  Lightning: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Doc: () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
};

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-md bg-slate-100 ${className}`} />
);

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<DashboardStats>({ totalClients: 0, totalDocuments: 0, upcomingBirthdays: 0, todayBirthdays: 0, todayAnniversaries: 0, upcomingAnniversaries: 0 });
  const [birthdays, setBirthdays] = useState<BirthdayItem[]>([]);
  const [recentDocs, setRecentDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const todayQuote = QUOTES[new Date().getDate() % QUOTES.length];

  useEffect(() => {
    const raw = window.localStorage.getItem("supabase_user");
    if (raw) { try { setUser(JSON.parse(raw)); } catch { setUser(null); } }
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const [cR, dR, bR, aR] = await Promise.all([
        fetch("/api/clients"), fetch("/api/documents"), fetch("/api/birthdays?range=week"), fetch("/api/anniversaries?range=week")
      ]);
      const c = await cR.json(), d = await dR.json(), b = await bR.json(), a = await aR.json();
      setStats({ totalClients: c.total || 0, totalDocuments: d.total || 0, upcomingBirthdays: b.stats?.thisWeek || 0, todayBirthdays: b.stats?.today || 0, todayAnniversaries: a.stats?.today || 0, upcomingAnniversaries: a.stats?.thisWeek || 0 });
      setBirthdays((b.birthdays || []).slice(0, 5));
      setRecentDocs((d.documents || []).slice(0, 5));
    } catch { /* silent */ } finally { setLoading(false); }
  }

  const getGreeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };
  const formatSize = (b: number) => b < 1024 ? b + " B" : b < 1048576 ? (b / 1024).toFixed(1) + " KB" : (b / 1048576).toFixed(1) + " MB";
  const formatTime = (s: string) => { const h = Math.floor((Date.now() - new Date(s).getTime()) / 3600000); return h < 1 ? "Just now" : h < 24 ? `${h}h ago` : h < 48 ? "Yesterday" : `${Math.floor(h / 24)}d ago`; };
  const getNextBday = (d: string) => { const b = new Date(d), n = new Date(), ty = new Date(n.getFullYear(), b.getMonth(), b.getDate()); return (ty >= n ? ty : new Date(n.getFullYear() + 1, b.getMonth(), b.getDate())).toLocaleDateString("en-IN", { day: "numeric", month: "short" }); };
  const getAge = (d: string) => { const b = new Date(d), n = new Date(); let a = n.getFullYear() - b.getFullYear(); if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--; return a + 1; };

  const getDocMeta = (t: string) => ({ PDF: { bg: "bg-red-50", text: "text-red-600", border: "border-red-100" }, IMG: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" }, DOC: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" }, DOCX: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" }, XLS: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" } }[t] ?? { bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-200" });

  const statCards = [
    { label: "Total Clients",      value: stats.totalClients,      icon: <IC.Users />,  sub: "Active profiles",   ib: "bg-blue-50 text-blue-600",   bb: "bg-blue-50 text-blue-600 ring-1 ring-blue-100" },
    { label: "Documents",          value: stats.totalDocuments,     icon: <IC.Folder />, sub: "Stored files",      ib: "bg-violet-50 text-violet-600",bb: "bg-violet-50 text-violet-600 ring-1 ring-violet-100" },
  ];

  const actions = [
    { label: "Add Client",     icon: <IC.UserPlus />, href: "/dashboard/clients?action=add", h: "hover:bg-blue-600   hover:border-blue-600   hover:text-white" },
    { label: "Upload Policy",  icon: <IC.Upload />,   href: "/dashboard/documents",           h: "hover:bg-violet-600 hover:border-violet-600 hover:text-white" },
    { label: "View Birthdays", icon: <IC.Calendar />, href: "/dashboard/birthdays",           h: "hover:bg-rose-600   hover:border-rose-600   hover:text-white" },
    { label: "All Clients",    icon: <IC.List />,     href: "/dashboard/clients",             h: "hover:bg-slate-800  hover:border-slate-800  hover:text-white" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6fa]">

      {/* ── Top Bar ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 h-[60px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-[13px] shrink-0 select-none shadow-sm shadow-blue-200">
              {(user?.name?.[0] || "G").toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none">{getGreeting()}</p>
              <h1 className="text-[15px] font-black text-slate-900 leading-tight flex items-center gap-2 truncate">
                {user?.name?.split(" ")[0] || "Guest"}
                {stats.todayBirthdays > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full shrink-0">
                    <IC.Star /> {stats.todayBirthdays} birthday{stats.todayBirthdays > 1 ? "s" : ""} today
                  </span>
                )}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {stats.totalClients} clients
            </div>
            <Link href="/dashboard/clients" className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-blue-600 hover:text-white transition-all">
              <IC.Search />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Page Body ─────────────────────────────────────────────── */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8 space-y-5">

        {/* Quote + Actions row */}
        <div className="grid lg:grid-cols-5 gap-4">

          {/* Quote of the Day */}
          <div className="lg:col-span-3 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden px-6 py-5 flex items-start gap-4 shadow-sm">
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(ellipse at 10% 50%, rgba(96,165,250,0.12) 0%, transparent 60%), radial-gradient(ellipse at 90% 20%, rgba(129,140,248,0.10) 0%, transparent 60%)" }} />
            <div className="shrink-0 mt-0.5 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-blue-300">
              <IC.Quote />
            </div>
            <div className="relative z-10 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Quote of the Day</p>
              <p className="text-sm sm:text-[15px] font-semibold text-white leading-relaxed">"{todayQuote.text}"</p>
              <p className="text-xs text-slate-400 font-medium mt-2.5">— {todayQuote.author}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-3">
            {actions.map(a => (
              <Link key={a.label} href={a.href}
                className={`flex items-center gap-2.5 px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-[12px] font-semibold text-slate-700 shadow-sm transition-all active:scale-[0.97] ${a.h}`}>
                <span className="opacity-75 shrink-0">{a.icon}</span>
                <span className="truncate">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {statCards.map((c) => (
            <div key={c.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.ib}`}>{c.icon}</div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${c.bb}`}>{c.sub}</span>
              </div>
              <div>
                {loading ? <Skeleton className="h-8 w-14 mb-1" /> : <p className="text-3xl font-black text-slate-900 tabular-nums leading-none">{c.value}</p>}
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{c.label}</p>
              </div>
            </div>
          ))}
          
          {/* Card 3: Split Events */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col justify-center gap-3">
            {/* Row 1: Birthdays */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 transition-colors hover:bg-slate-100/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0"><IC.Cake /></div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-1.5">Birthdays</p>
                  <div className="flex items-center gap-2.5">
                    <Link href="/dashboard/clients?filter=birthdays-today" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                      <span className="text-[13px] font-black text-rose-600 leading-none">{stats.todayBirthdays}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Today</span>
                    </Link>
                    <span className="text-slate-300 text-xs">|</span>
                    <Link href="/dashboard/clients?filter=birthdays-upcoming" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                      <span className="text-[13px] font-black text-slate-700 leading-none">{stats.upcomingBirthdays}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Next 7 Days</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Anniversaries */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 transition-colors hover:bg-slate-100/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center shrink-0">
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-1.5">Anniversaries</p>
                  <div className="flex items-center gap-2.5">
                    <Link href="/dashboard/clients?filter=anniversaries-today" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                      <span className="text-[13px] font-black text-fuchsia-600 leading-none">{stats.todayAnniversaries}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Today</span>
                    </Link>
                    <span className="text-slate-300 text-xs">|</span>
                    <Link href="/dashboard/clients?filter=anniversaries-upcoming" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                      <span className="text-[13px] font-black text-slate-700 leading-none">{stats.upcomingAnniversaries}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Next 7 Days</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main 3-col grid */}
        <div className="grid lg:grid-cols-5 gap-5">

          {/* Documents — 3 cols */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                  <IC.Doc />
                </div>
                <div>
                  <h2 className="text-[13px] font-black text-slate-900">Recent Documents</h2>
                  <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">Latest uploads across clients</p>
                </div>
              </div>
              <Link href="/dashboard/documents" className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors">
                View all <IC.ChevronRight />
              </Link>
            </div>

            {/* Column labels — desktop */}
            <div className="hidden sm:grid grid-cols-12 px-6 py-2 bg-slate-50 border-b border-slate-100">
              {["Name", "Client", "Size", "Uploaded"].map((h, i) => (
                <span key={h} className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${i === 0 ? "col-span-5" : i === 1 ? "col-span-3" : i === 2 ? "col-span-2 text-right" : "col-span-2 text-right"}`}>{h}</span>
              ))}
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-50">
              {loading ? (
                [1,2,3,4].map(i => (
                  <div key={i} className="flex items-center gap-3 px-6 py-4">
                    <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-2/5" /><Skeleton className="h-2.5 w-1/4" /></div>
                    <Skeleton className="h-2.5 w-16 hidden sm:block" />
                  </div>
                ))
              ) : recentDocs.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400"><IC.Folder /></div>
                  <p className="text-sm font-semibold text-slate-500">No documents yet</p>
                  <Link href="/dashboard/documents" className="text-xs text-blue-600 font-bold hover:underline mt-1 inline-block">Upload your first →</Link>
                </div>
              ) : (
                recentDocs.map((doc, i) => {
                  const m = getDocMeta(doc.file_type);
                  return (
                    <div key={i} className="grid sm:grid-cols-12 items-center px-6 py-3.5 gap-3 sm:gap-0 hover:bg-slate-50/80 transition-colors group">
                      <div className="sm:col-span-5 flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${m.bg} ${m.border}`}>
                          <span className={`text-[9px] font-black leading-none ${m.text}`}>{doc.file_type}</span>
                        </div>
                        <p className="text-[13px] font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{doc.file_name}</p>
                      </div>
                      <p className="sm:col-span-3 hidden sm:block text-[12px] text-slate-400 font-medium truncate pl-1">{doc.client_name || "—"}</p>
                      <p className="sm:col-span-2 hidden sm:block text-[11px] text-slate-400 font-medium text-right">{formatSize(doc.file_size)}</p>
                      <p className="sm:col-span-2 hidden sm:block text-[11px] text-slate-400 font-medium text-right">{formatTime(doc.created_at)}</p>
                      <p className="sm:hidden text-[11px] text-slate-400 font-medium -mt-1">{formatSize(doc.file_size)} · {formatTime(doc.created_at)}{doc.client_name ? ` · ${doc.client_name}` : ""}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right col — 2 cols */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Birthdays */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center"><IC.Cake /></div>
                  <div>
                    <h2 className="text-[13px] font-black text-slate-900">Birthdays</h2>
                    <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">This week</p>
                  </div>
                </div>
                <Link href="/dashboard/birthdays" className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Calendar <IC.ChevronRight />
                </Link>
              </div>

              <div className="divide-y divide-slate-50">
                {loading ? (
                  [1,2,3].map(i => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                      <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-24" /><Skeleton className="h-2.5 w-32" /></div>
                      <Skeleton className="h-3 w-10" />
                    </div>
                  ))
                ) : birthdays.length === 0 ? (
                  <div className="py-12 text-center"><p className="text-sm font-semibold text-slate-400">No birthdays this week</p></div>
                ) : (
                  birthdays.map(b => (
                    <div key={b.name + b.date_of_birth} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center text-white font-black text-[13px] shrink-0 shadow-sm shadow-rose-200">
                        {b.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-slate-900 truncate">{b.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium capitalize">{b.relationship} · Turns {getAge(b.date_of_birth)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[11px] font-black text-rose-500">{getNextBday(b.date_of_birth)}</span>
                        {b.phone && (
                          <a href={`https://wa.me/${b.phone.replace(/\s/g,"")}?text=Happy%20Birthday%20${b.name}!`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
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
            <div className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 rounded-2xl overflow-hidden p-6 shadow-lg shadow-blue-300/20">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-4 w-24 h-24 bg-indigo-900/20 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center text-white"><IC.Lightning /></div>
                  <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Client Hub</span>
                </div>
                <h3 className="text-[16px] font-black text-white mb-2 leading-snug">All your clients, one place</h3>
                <p className="text-blue-200/80 text-[12px] font-medium mb-5 leading-relaxed">Manage profiles, policies, family members, and never miss an important date.</p>
                <Link href="/dashboard/clients"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 text-[12px] font-black rounded-xl hover:bg-blue-50 transition-all active:scale-95 shadow-md">
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