"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";

interface ClientData {
  id: string;
  name: string;
  phone: string;
  email?: string;
  date_of_birth: string;
  address?: string;
  status: string;
  family_count?: number;
  document_count?: number;
  created_at: string;
  profile_pic?: string; // base64 or URL from server
}

// ── Icons ──────────────────────────────────────────────────────────────────
const IC = {
  Search:    () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>,
  UserPlus:  () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>,
  Eye:       () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>,
  Edit:      () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>,
  Trash:     () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>,
  Close:     () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>,
  Doc:       () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  Users:     () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  Calendar:  () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
  Phone:     () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>,
  Check:     () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>,
  Camera:    () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  X:         () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>,
};

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-lg bg-slate-100 ${className}`} />
);

const avatarGradients = [
  "from-blue-500 to-blue-700",
  "from-violet-500 to-purple-700",
  "from-rose-500 to-pink-700",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-700",
  "from-sky-500 to-cyan-700",
  "from-indigo-500 to-indigo-700",
  "from-fuchsia-500 to-pink-700",
];
const getGradient = (name: string) => avatarGradients[name.charCodeAt(0) % avatarGradients.length];

// ── Reusable Avatar component ──────────────────────────────────────────────
function ClientAvatar({
  name,
  profilePic,
  size = "md",
  className = "",
}: {
  name: string;
  profilePic?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeMap = {
    sm: "w-8 h-8 text-[11px]",
    md: "w-10 h-10 text-[14px]",
    lg: "w-11 h-11 text-[15px]",
  };

  if (profilePic) {
    return (
      <img
        src={profilePic}
        alt={name}
        className={`${sizeMap[size]} rounded-full object-cover shrink-0 shadow-sm ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeMap[size]} rounded-full bg-gradient-to-br ${getGradient(name)} flex items-center justify-center text-white font-black shrink-0 shadow-sm ${className}`}
    >
      {name[0].toUpperCase()}
    </div>
  );
}

export default function ClientsPage() {
  const [clients, setClients]       = useState<ClientData[]>([]);
  const [search, setSearch]         = useState("");
  const [filter, setFilter]         = useState("all");
  const [loading, setLoading]       = useState(true);
  const [showAddModal, setShowAdd]  = useState(false);
  const [editingClient, setEditing] = useState<ClientData | null>(null);

  const defaultForm = {
    name: "", surname: "", phone: "", alternateMobile: "", email: "", date_of_birth: "",
    anniversaryDate: "", gender: "", maritalStatus: "", occupation: "",
    address: "", city: "", state: "", pinCode: "", notes: "",
    profilePic: "", // base64 data URL
  };

  const [formData, setForm]         = useState(defaultForm);
  const [saving, setSaving]         = useState(false);
  const [total, setTotal]           = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.get("action") === "add") setShowAdd(true);
    }
  }, []);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (search) p.set("search", search);
      if (filter !== "all") p.set("status", filter);
      const res = await fetch(`/api/clients?${p}`);
      const data = await res.json();
      setClients(data.clients || []);
      setTotal(data.total || 0);
    } catch { /* silent */ } finally { setLoading(false); }
  }, [search, filter]);

  useEffect(() => {
    const t = setTimeout(fetchClients, 300);
    return () => clearTimeout(t);
  }, [fetchClients]);

  // ── Profile pic handler ──────────────────────────────────────────────────
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm(prev => ({ ...prev, profilePic: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const phoneValid = /^\d{10}$/.test(formData.phone);
    const pinValid = /^\d{6}$/.test(formData.pinCode);
    if (!formData.name || !formData.surname || !phoneValid || !formData.date_of_birth || !formData.email || !pinValid) {
      alert("Please ensure all mandatory fields are filled correctly (10-digit phone, 6-digit PIN).");
      return;
    }
    setSaving(true);
    try {
      if (editingClient) {
        await fetch(`/api/clients/${editingClient.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        closeModal(); fetchClients();
      } else {
        const res = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.client && data.client.clientLoginId) {
          alert(`Client created successfully!\n\nPortal Login ID: ${data.client.clientLoginId}\nTemporary Password: ${data.client.temporaryPassword}\n\nPlease copy and share these credentials with the client.`);
        }
        closeModal(); fetchClients();
      }
    } catch { /* silent */ } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try { await fetch(`/api/clients/${id}`, { method: "DELETE" }); fetchClients(); } catch { /* silent */ }
    setDeleteConfirm(null);
  };

  const openEdit = (c: ClientData | any) => {
    setEditing(c);
    setForm({
      name: c.name || "", surname: c.surname || "", phone: c.phone || "", alternateMobile: c.alternateMobile || "",
      email: c.email || "", date_of_birth: c.date_of_birth || "", anniversaryDate: c.anniversaryDate || "",
      gender: c.gender || "", maritalStatus: c.maritalStatus || "", occupation: c.occupation || "",
      address: c.address || "", city: c.city || "", state: c.state || "", pinCode: c.pinCode || "",
      notes: c.notes || "", profilePic: c.profile_pic || "",
    });
    setShowAdd(true);
  };

  const closeModal = () => {
    setShowAdd(false); setEditing(null);
    setForm(defaultForm);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatDob = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const inputCls = "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-[13px] font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal";
  const labelCls = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5";

  return (
    <div className="min-h-screen bg-[#f5f6fa]">

      {/* ── Sticky Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 h-[60px] flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none">Management</p>
            <h1 className="text-[15px] font-black text-slate-900 leading-tight truncate">
              Client <span className="text-blue-600">Directory</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {total} clients
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold rounded-lg transition-all active:scale-95 shadow-sm shadow-blue-200"
            >
              <IC.UserPlus />
              <span className="hidden sm:inline">Add Client</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8 space-y-5">

        {/* ── Search + Filter Bar ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
              <IC.Search />
            </div>
            <input
              type="text"
              placeholder="Search by name, phone or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-sm shrink-0">
            {["all", "Active", "Pending"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                  filter === f
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>
        </div>

        {/* ── MOBILE CARDS ────────────────────────────────────────── */}
        <div className="lg:hidden space-y-3">
          {loading ? (
            [1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-11 h-11 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-32" /><Skeleton className="h-2.5 w-24" /></div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="flex gap-2"><Skeleton className="h-8 flex-1 rounded-lg" /><Skeleton className="h-8 flex-1 rounded-lg" /><Skeleton className="h-8 w-10 rounded-lg" /></div>
              </div>
            ))
          ) : clients.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </div>
              <p className="text-sm font-semibold text-slate-500">{search ? "No clients match your search" : "No clients yet"}</p>
              {!search && <button onClick={() => setShowAdd(true)} className="text-xs text-blue-600 font-bold hover:underline mt-1 inline-block">Add your first client →</button>}
            </div>
          ) : (
            clients.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <ClientAvatar name={c.name} profilePic={c.profile_pic} size="lg" />
                  <div className="flex-1 min-w-0">
                    <Link href={`/dashboard/clients/${c.id}`} className="text-[14px] font-black text-slate-900 hover:text-blue-600 transition-colors truncate block">{c.name}</Link>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mt-0.5">
                      <IC.Calendar />
                      Born {formatDob(c.date_of_birth)}
                    </div>
                  </div>
                  <span className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    c.status === "Active"
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${c.status === "Active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                    {c.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-semibold text-slate-600">
                    <IC.Phone /> {c.phone}
                  </div>
                  {c.email && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-semibold text-slate-600 truncate max-w-[160px]">
                      {c.email}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-semibold text-slate-600">
                    <IC.Users /> {c.family_count || 0} family
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-semibold text-slate-600">
                    <IC.Doc /> {c.document_count || 0} docs
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <Link href={`/dashboard/clients/${c.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold hover:bg-blue-600 hover:text-white transition-all">
                    <IC.Eye /> View
                  </Link>
                  <button onClick={() => openEdit(c)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold hover:bg-slate-200 transition-all">
                    <IC.Edit /> Edit
                  </button>
                  <button onClick={() => setDeleteConfirm(c.id)}
                    className="w-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all">
                    <IC.Trash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── DESKTOP TABLE ───────────────────────────────────────── */}
        <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 px-6 py-3 bg-slate-50 border-b border-slate-100">
            {[
              { label: "Client",    span: "col-span-4" },
              { label: "Contact",   span: "col-span-3" },
              { label: "Status",    span: "col-span-1 text-center" },
              { label: "Family",    span: "col-span-1 text-center" },
              { label: "Docs",      span: "col-span-1 text-center" },
              { label: "Actions",   span: "col-span-2 text-right" },
            ].map(h => (
              <span key={h.label} className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${h.span}`}>{h.label}</span>
            ))}
          </div>

          <div className="divide-y divide-slate-50">
            {loading ? (
              [1,2,3,4,5].map(i => (
                <div key={i} className="grid grid-cols-12 items-center px-6 py-4 gap-2 animate-pulse">
                  <div className="col-span-4 flex items-center gap-3"><Skeleton className="w-10 h-10 rounded-full" /><div className="space-y-1.5"><Skeleton className="h-3.5 w-28" /><Skeleton className="h-2.5 w-20" /></div></div>
                  <div className="col-span-3 space-y-1.5"><Skeleton className="h-3 w-24" /><Skeleton className="h-2.5 w-32" /></div>
                  <div className="col-span-1 flex justify-center"><Skeleton className="h-6 w-16 rounded-full" /></div>
                  <div className="col-span-1 flex justify-center"><Skeleton className="h-6 w-8 rounded-lg" /></div>
                  <div className="col-span-1 flex justify-center"><Skeleton className="h-6 w-10 rounded-lg" /></div>
                  <div className="col-span-2 flex justify-end gap-1"><Skeleton className="h-8 w-8 rounded-lg" /><Skeleton className="h-8 w-8 rounded-lg" /><Skeleton className="h-8 w-8 rounded-lg" /></div>
                </div>
              ))
            ) : clients.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <p className="text-sm font-semibold text-slate-500">{search ? "No clients match your search" : "No clients yet"}</p>
                {!search && <button onClick={() => setShowAdd(true)} className="text-xs text-blue-600 font-bold hover:underline mt-1 inline-block">Add your first client →</button>}
              </div>
            ) : (
              clients.map(c => (
                <div key={c.id} className="grid grid-cols-12 items-center px-6 py-3.5 hover:bg-slate-50/80 transition-colors group">
                  {/* Client */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <ClientAvatar
                      name={c.name}
                      profilePic={c.profile_pic}
                      size="md"
                      className="group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0">
                      <Link href={`/dashboard/clients/${c.id}`} className="text-[13px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate block">{c.name}</Link>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mt-0.5">
                        <IC.Calendar /> {formatDob(c.date_of_birth)}
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="col-span-3 min-w-0">
                    <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700">
                      <IC.Phone /> {c.phone}
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate pl-5">{c.email || "—"}</p>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 flex justify-center">
                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      c.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                        : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                      {c.status}
                    </span>
                  </div>

                  {/* Family */}
                  <div className="col-span-1 flex justify-center">
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-600">
                      <IC.Users /> {c.family_count || 0}
                    </div>
                  </div>

                  {/* Docs */}
                  <div className="col-span-1 flex justify-center">
                    <Link href={`/dashboard/clients/${c.id}`}
                      className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[11px] font-bold hover:bg-blue-600 hover:text-white transition-all">
                      <IC.Doc /> {c.document_count || 0}
                    </Link>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-1.5">
                    <Link href={`/dashboard/clients/${c.id}`}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-blue-600 hover:text-white border border-transparent hover:border-blue-600 transition-all"
                      title="View">
                      <IC.Eye />
                    </Link>
                    <button onClick={() => openEdit(c)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-700 hover:text-white border border-transparent transition-all"
                      title="Edit">
                      <IC.Edit />
                    </button>
                    <button onClick={() => setDeleteConfirm(c.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-200 transition-all"
                      title="Delete">
                      <IC.Trash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{total} total clients</p>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Live data
            </div>
          </div>
        </div>

        <div className="lg:hidden text-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{total} total clients</p>
        </div>

      </main>

      {/* ── Delete Confirmation Modal ────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4 text-red-500">
              <IC.Trash />
            </div>
            <h3 className="text-[15px] font-black text-slate-900 text-center mb-1">Delete Client?</h3>
            <p className="text-[12px] text-slate-500 text-center font-medium mb-5">This will permanently remove the client, all their documents and family members. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-[13px] font-bold hover:bg-red-700 transition-colors active:scale-95">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ─────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
              <div>
                <h2 className="text-[15px] font-black text-slate-900">{editingClient ? "Edit Client" : "Add New Client"}</h2>
                <p className="text-[11px] text-slate-400 font-medium">{editingClient ? "Update client information" : "Register a new insurance client"}</p>
              </div>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
                <IC.Close />
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-5 space-y-4">

              {/* ── Profile Picture Upload ─────────────────────────── */}
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="relative group">
                  {/* Avatar preview */}
                  {formData.profilePic ? (
                    <img
                      src={formData.profilePic}
                      alt="Profile preview"
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-slate-200"
                    />
                  ) : (
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getGradient(formData.name || "A")} flex items-center justify-center text-white font-black text-2xl border-4 border-white shadow-lg ring-2 ring-slate-200`}>
                      {formData.name ? formData.name[0].toUpperCase() : "?"}
                    </div>
                  )}

                  {/* Camera overlay button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all"
                    title="Upload photo"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white flex flex-col items-center gap-0.5">
                      <IC.Camera />
                      <span className="text-[9px] font-bold">Upload</span>
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-600 transition-all"
                  >
                    <IC.Camera />
                    {formData.profilePic ? "Change Photo" : "Add Photo"}
                  </button>

                  {formData.profilePic && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm(prev => ({ ...prev, profilePic: "" }));
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 text-[11px] font-bold text-red-600 transition-all"
                    >
                      <IC.X />
                      Remove
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 font-medium">JPG, PNG or WEBP · Max 2 MB</p>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleProfilePicChange}
                  className="hidden"
                />
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.name} onChange={e => setForm({...formData, name: e.target.value})} placeholder="First Name" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Surname <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.surname} onChange={e => setForm({...formData, surname: e.target.value})} placeholder="Last Name" className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Mobile <span className="text-red-500">*</span></label>
                  <input type="tel" maxLength={10} value={formData.phone} onChange={e => setForm({...formData, phone: e.target.value.replace(/\D/g, '')})} placeholder="10-digit number" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Alternate Mobile</label>
                  <input type="tel" maxLength={10} value={formData.alternateMobile} onChange={e => setForm({...formData, alternateMobile: e.target.value.replace(/\D/g, '')})} placeholder="Optional" className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Email Address <span className="text-red-500">*</span></label>
                <input type="email" value={formData.email} onChange={e => setForm({...formData, email: e.target.value})} placeholder="client@email.com" className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Date of Birth <span className="text-red-500">*</span></label>
                  <input type="date" value={formData.date_of_birth} onChange={e => setForm({...formData, date_of_birth: e.target.value})} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Anniversary Date</label>
                  <input type="date" value={formData.anniversaryDate} onChange={e => setForm({...formData, anniversaryDate: e.target.value})} className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Gender</label>
                  <select value={formData.gender} onChange={e => setForm({...formData, gender: e.target.value})} className={inputCls}>
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Marital Status</label>
                  <select value={formData.maritalStatus} onChange={e => setForm({...formData, maritalStatus: e.target.value})} className={inputCls}>
                    <option value="">Select...</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Occupation</label>
                <input type="text" value={formData.occupation} onChange={e => setForm({...formData, occupation: e.target.value})} placeholder="e.g. Engineer, Business" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Address</label>
                <textarea value={formData.address} onChange={e => setForm({...formData, address: e.target.value})} placeholder="Full address" className={inputCls} rows={2} />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>City</label>
                  <input type="text" value={formData.city} onChange={e => setForm({...formData, city: e.target.value})} placeholder="City" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>State</label>
                  <select value={formData.state} onChange={e => setForm({...formData, state: e.target.value})} className={inputCls}>
                    <option value="">Select State</option>
                    <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Assam">Assam</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Chandigarh">Chandigarh</option>
                    <option value="Chhattisgarh">Chhattisgarh</option>
                    <option value="Dadra and Nagar Haveli">Dadra and Nagar Haveli</option>
                    <option value="Daman and Diu">Daman and Diu</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Goa">Goa</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                    <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                    <option value="Jharkhand">Jharkhand</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Lakshadweep">Lakshadweep</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Puducherry">Puducherry</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Sikkim">Sikkim</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Tripura">Tripura</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Uttarakhand">Uttarakhand</option>
                    <option value="West Bengal">West Bengal</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>PIN Code <span className="text-red-500">*</span></label>
                  <input type="text" maxLength={6} value={formData.pinCode} onChange={e => setForm({...formData, pinCode: e.target.value.replace(/\D/g, '')})} placeholder="6 digits" className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Notes</label>
                <textarea value={formData.notes} onChange={e => setForm({...formData, notes: e.target.value})} placeholder="Any additional notes..." className={inputCls} style={{ minHeight: "100px" }} />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex gap-3">
              <button onClick={closeModal}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.name || !formData.surname || !/^\d{10}$/.test(formData.phone) || !formData.date_of_birth || !formData.email || !/^\d{6}$/.test(formData.pinCode)}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Saving…
                  </span>
                ) : (
                  <>
                    <IC.Check />
                    {editingClient ? "Update Client" : "Add Client"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}