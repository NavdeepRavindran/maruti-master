"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  formatFamilyName,
  formatAddress,
  formatDate,
  getAge,
  capitalizeWords,
} from "@/lib/formatUtils";

interface FamilyMemberData {
  id: string;
  client_id: string;
  name: string;
  date_of_birth?: string;
  relationship?: string;
  phone?: string;
  occupation?: string;
  photo_url?: string;
}

interface DocData {
  id: string;
  name: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  family_member_id?: string | null;
  file_url?: string;
  category?: string;
}

interface ClientData {
  id: string;
  name: string;
  surname?: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  pinCode?: string;
  date_of_birth: string;
  anniversary_date?: string;
  anniversaryDate?: string;
  documents?: DocData[];
  family_members?: FamilyMemberData[];
}

function DocTypeIcon({ type }: { type: string }) {
  const t = (type || "").toUpperCase();
  if (t === "PDF") {
    return (
      <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h2a1 1 0 001-1v-1a1 1 0 00-1-1H9v4m0 0v2" />
      </svg>
    );
  }
  if (t === "IMG" || t === "PNG" || t === "JPG" || t === "JPEG" || t === "WEBP") {
    return (
      <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  }
  if (t === "DOC" || t === "DOCX" || t === "XLS" || t === "XLSX" || t === "CSV") {
    return (
      <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  }
  return (
    <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  );
}

export default function ClientPortalDashboard() {
  const router = useRouter();
  const params = useParams();
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [docFilter, setDocFilter] = useState<string>("all");

  useEffect(() => {
    fetchClientData();
  }, [params.id]);

  async function fetchClientData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch client");
      const data = await res.json();

      setClient({
        ...data.client,
        family_members: data.family_members || [],
        documents: data.documents || [],
      });
    } catch (err) {
      console.error(err);
      alert("Could not load your portal data.");
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/client-logout", { method: "POST" });
    } catch { /* silent */ }
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      localStorage.removeItem("client_auth");
    }
    window.location.replace("/client-login");
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 KB";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center font-['DM_Sans']">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Loading Vault...</p>
      </div>
    );
  }

  if (!client) return null;

  const familyMembers = client.family_members || [];
  const allDocuments = client.documents || [];
  const clientDocs = allDocuments.filter((d) => !d.family_member_id);

  const fullAddress = formatAddress(
    [
      client.address,
      client.city,
      client.state,
      client.pin_code || client.pinCode,
    ]
      .filter(Boolean)
      .join(", ")
  ) || (client.address ? formatAddress(client.address) : "");

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['DM_Sans'] pb-20">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="font-black text-[#0f172a] text-lg leading-tight">Maruthi Insure</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Client Portal</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#0f172a] to-blue-900 rounded-3xl p-6 sm:p-10 md:p-12 text-white mb-8 shadow-xl shadow-blue-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2">
              Welcome back, {client.name.split(" ")[0]}
            </h1>
            <p className="text-blue-200 font-medium max-w-xl text-sm sm:text-base">
              Your secure vault for insurance policies, health records, and family KYC documents.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Personal Profile Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-black text-[#0f172a] text-lg mb-6 flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                Profile Info
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</div>
                  <div className="font-bold text-slate-800 text-[14px]">{capitalizeWords(client.name)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</div>
                  <div className="font-bold text-slate-700 text-[13px]">{client.phone}</div>
                </div>
                {client.email && (
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</div>
                    <div className="font-bold text-slate-700 text-[13px] break-words">{client.email}</div>
                  </div>
                )}
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date of Birth</div>
                  <div className="font-bold text-slate-700 text-[13px]">
                    {formatDate(client.date_of_birth)}
                    {getAge(client.date_of_birth) > 0 && (
                      <span className="text-slate-400 text-xs font-medium ml-1.5">
                        ({getAge(client.date_of_birth)} yrs)
                      </span>
                    )}
                  </div>
                </div>
                {(client.anniversary_date || client.anniversaryDate) && (
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Anniversary</div>
                    <div className="font-bold text-slate-700 text-[13px]">
                      {formatDate(client.anniversary_date || client.anniversaryDate)}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Address</div>
                  <div className="font-bold text-slate-700 text-[13px] leading-snug break-words">
                    {fullAddress || "Not provided"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Family Members & Documents per member */}
          <div className="lg:col-span-2 space-y-8">
            {/* Family Members Section */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-black text-[#0f172a] text-lg flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  Family Members
                </h2>
                <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  {familyMembers.length + 1} {familyMembers.length + 1 === 1 ? "Member" : "Members"}
                </div>
              </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Self Member Card */}
                  <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-200/80 hover:border-blue-300 hover:bg-white transition-all shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
                          {client.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-800 text-[14px] truncate">
                            {capitalizeWords(client.name)}
                          </h3>
                          <span className="inline-block mt-0.5 text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider">
                            Self (Primary)
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                        {client.date_of_birth && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-medium">Date of Birth:</span>
                            <span className="font-semibold text-slate-700">
                              {formatDate(client.date_of_birth)}
                              {getAge(client.date_of_birth) > 0 && (
                                <span className="text-slate-400 ml-1">({getAge(client.date_of_birth)} yrs)</span>
                              )}
                            </span>
                          </div>
                        )}
                        {(client as any).occupation && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-medium">Occupation:</span>
                            <span className="font-semibold text-slate-700 truncate max-w-[150px]">{(client as any).occupation}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-medium">Phone:</span>
                            <a href={`tel:${client.phone}`} className="font-semibold text-blue-600 hover:underline">
                              {client.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500">Documents Vault</span>
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        {clientDocs.length} {clientDocs.length === 1 ? "file" : "files"}
                      </span>
                    </div>
                  </div>

                  {/* Family Members Cards */}
                  {familyMembers.map((member) => {
                    const memberDocs = allDocuments.filter((d) => d.family_member_id === member.id);
                    return (
                      <div
                        key={member.id}
                        className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-blue-200 hover:bg-white transition-all shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start gap-3 mb-3">
                            {member.photo_url ? (
                              <img
                                src={member.photo_url}
                                alt={member.name}
                                className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 font-bold text-base flex items-center justify-center shrink-0">
                                {member.name?.[0]?.toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-slate-800 text-[14px] truncate">
                                {formatFamilyName(member.name)}
                              </h3>
                              <span className="inline-block mt-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider">
                                {member.relationship}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                            {member.date_of_birth && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400 font-medium">Date of Birth:</span>
                                <span className="font-semibold text-slate-700">
                                  {formatDate(member.date_of_birth)}
                                  {getAge(member.date_of_birth) > 0 && (
                                    <span className="text-slate-400 ml-1">({getAge(member.date_of_birth)} yrs)</span>
                                  )}
                                </span>
                              </div>
                            )}
                            {member.occupation && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400 font-medium">Occupation:</span>
                                <span className="font-semibold text-slate-700 truncate max-w-[150px]">{member.occupation}</span>
                              </div>
                            )}
                            {member.phone && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400 font-medium">Phone:</span>
                                <a href={`tel:${member.phone}`} className="font-semibold text-blue-600 hover:underline">
                                  {member.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-slate-500">Documents Vault</span>
                          <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {memberDocs.length} {memberDocs.length === 1 ? "file" : "files"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
            </div>

            {/* Documents Section (Grouped by Member) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="font-black text-[#0f172a] text-lg flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                      </svg>
                    </span>
                    Documents Vault
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Categorized records for you and each family member
                  </p>
                </div>
                <div className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 self-start sm:self-auto">
                  {allDocuments.length} Total Files
                </div>
              </div>

              {/* Filter Tabs by Member */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
                <button
                  type="button"
                  onClick={() => setDocFilter("all")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    docFilter === "all"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                  }`}
                >
                  All ({allDocuments.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDocFilter("client")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    docFilter === "client"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                  }`}
                >
                  {capitalizeWords(client.name)} (Self) ({clientDocs.length})
                </button>
                {familyMembers.map((fm) => {
                  const count = allDocuments.filter((d) => d.family_member_id === fm.id).length;
                  return (
                    <button
                      key={fm.id}
                      type="button"
                      onClick={() => setDocFilter(fm.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        docFilter === fm.id
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                      }`}
                    >
                      {formatFamilyName(fm.name)} ({count})
                    </button>
                  );
                })}
              </div>

              {allDocuments.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                  </svg>
                  <h3 className="text-base font-bold text-slate-700 mb-1">No documents yet</h3>
                  <p className="text-xs font-medium text-slate-400">Your agent hasn&apos;t uploaded any documents to your vault.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Client / Self Documents Group */}
                  {(docFilter === "all" || docFilter === "client") && (
                    <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs">
                      <div className="px-4 py-3 bg-gradient-to-r from-blue-50/60 to-white border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                            {capitalizeWords(client.name)} (Self)
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                          {clientDocs.length} {clientDocs.length === 1 ? "document" : "documents"}
                        </span>
                      </div>

                      {clientDocs.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400 font-medium">
                          No documents for {capitalizeWords(client.name)} yet.
                        </div>
                      ) : (
                        <div className="p-4 grid sm:grid-cols-2 gap-4">
                          {clientDocs.map((doc) => (
                            <div
                              key={doc.id}
                              className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all group bg-white flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-start justify-between mb-3">
                                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                                    <DocTypeIcon type={doc.file_type} />
                                  </div>
                                  <a
                                    href={doc.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all border border-slate-100 hover:border-transparent"
                                    title="View / Download"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                  </a>
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm mb-1 truncate" title={doc.name}>
                                  {doc.name}
                                </h4>
                                {doc.category && (
                                  <div className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-wider rounded border border-blue-100 mb-2">
                                    {doc.category}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-[10px] font-bold text-slate-400">
                                <span>{formatSize(doc.file_size)}</span>
                                <span>{formatDate(doc.created_at)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Family Members Individual Documents Groups */}
                  {familyMembers
                    .filter((fm) => docFilter === "all" || docFilter === fm.id)
                    .map((fm) => {
                      const fmDocs = allDocuments.filter((d) => d.family_member_id === fm.id);
                      return (
                        <div key={fm.id} className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs">
                          <div className="px-4 py-3 bg-gradient-to-r from-indigo-50/60 to-white border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                              <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                                {formatFamilyName(fm.name)}
                              </span>
                              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                {fm.relationship}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                              {fmDocs.length} {fmDocs.length === 1 ? "document" : "documents"}
                            </span>
                          </div>

                          {fmDocs.length === 0 ? (
                            <div className="py-6 text-center text-xs text-slate-400 font-medium">
                              No documents for {formatFamilyName(fm.name)} yet.
                            </div>
                          ) : (
                            <div className="p-4 grid sm:grid-cols-2 gap-4">
                              {fmDocs.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group bg-white flex flex-col justify-between"
                                >
                                  <div>
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-colors">
                                        <DocTypeIcon type={doc.file_type} />
                                      </div>
                                      <a
                                        href={doc.file_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all border border-slate-100 hover:border-transparent"
                                        title="View / Download"
                                      >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                      </a>
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-sm mb-1 truncate" title={doc.name}>
                                      {doc.name}
                                    </h4>
                                    {doc.category && (
                                      <div className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-wider rounded border border-indigo-100 mb-2">
                                        {doc.category}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-[10px] font-bold text-slate-400">
                                    <span>{formatSize(doc.file_size)}</span>
                                    <span>{formatDate(doc.created_at)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
