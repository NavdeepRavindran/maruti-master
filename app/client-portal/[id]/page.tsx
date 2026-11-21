"use client";

import { useEffect, useState } from "react";
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
  gender?: string;
  occupation?: string;
  profile_pic?: string;
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
  const [selectedMemberId, setSelectedMemberId] = useState<string>("self");

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

  const isSelf = selectedMemberId === "self";
  const selectedFamilyMember = !isSelf
    ? familyMembers.find((m) => m.id === selectedMemberId)
    : null;

  const currentMemberDocs = isSelf
    ? clientDocs
    : allDocuments.filter((d) => d.family_member_id === selectedMemberId);

  const selectedMemberName = isSelf
    ? capitalizeWords(client.name)
    : selectedFamilyMember
    ? formatFamilyName(selectedFamilyMember.name)
    : "";

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['DM_Sans'] pb-20">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 shadow-xs">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#005A87] rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-[#005A87]/20">
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
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 space-y-8">
        {/* ── Welcome Banner with Modern High-Contrast Gradient (img 3 updated) ── */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 rounded-3xl p-6 sm:p-10 md:p-12 text-white shadow-xl shadow-slate-950/25 relative overflow-hidden border border-slate-800/80">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-slate-200 border border-white/15 uppercase tracking-widest mb-3.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Secure Client Vault
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2.5">
              Welcome back, {client.name.split(" ")[0]}
            </h1>
            <p className="text-slate-300 font-medium max-w-xl text-sm sm:text-base leading-relaxed">
              Your secure vault for insurance policies, health records, and family KYC documents.
            </p>
          </div>
        </div>

        {/* ── Top Profile Overview Banner / Card ── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              {client.profile_pic ? (
                <img
                  src={client.profile_pic}
                  alt={client.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 shadow-md shadow-[#005A87]/15 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-[#005A87] text-white font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-md shadow-[#005A87]/20">
                  {client.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-[#0f172a]">
                    {capitalizeWords(client.name)}
                  </h2>
                  <span className="text-[10px] font-bold text-[#005A87] bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Primary Account Holder
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Client ID: #{client.id.slice(0, 8)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 text-center min-w-[100px]">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Family</div>
                <div className="text-base font-extrabold text-slate-800 mt-0.5">
                  {familyMembers.length + 1} {familyMembers.length + 1 === 1 ? "Member" : "Members"}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 text-center min-w-[100px]">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Documents</div>
                <div className="text-base font-extrabold text-[#005A87] mt-0.5">
                  {allDocuments.length} Total
                </div>
              </div>
            </div>
          </div>

          {/* Quick contact strip: Email closer to Phone, Address closer to Email and showing completely */}
          <div className="pt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs">
            {/* Phone */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#005A87] flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</div>
                <div className="font-bold text-slate-800">{client.phone}</div>
              </div>
            </div>

            {/* Email - right next to phone */}
            {client.email && (
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</div>
                  <div className="font-bold text-slate-800">{client.email}</div>
                </div>
              </div>
            )}

            {/* Address - right next to email, completely visible inside container */}
            {fullAddress && (
              <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address</div>
                  <div className="font-bold text-slate-800 leading-snug break-words">
                    {fullAddress}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Family Members List Clickable Buttons ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-[#0f172a] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#005A87]"></span>
                Select Family Member
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Click any member to view their complete profile details and dedicated documents
              </p>
            </div>
            <div className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
              {familyMembers.length + 1} Profile{familyMembers.length + 1 === 1 ? "" : "s"} Available
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {/* Self (Primary) Button */}
            <button
              type="button"
              onClick={() => setSelectedMemberId("self")}
              className={`p-4 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between gap-3 border ${
                selectedMemberId === "self"
                  ? "bg-[#005A87] text-white border-[#005A87] shadow-md shadow-[#005A87]/20 ring-2 ring-[#005A87]/30"
                  : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-xs"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {client.profile_pic ? (
                  <img
                    src={client.profile_pic}
                    alt={client.name}
                    className={`w-11 h-11 rounded-xl object-cover ring-1 shrink-0 ${
                      selectedMemberId === "self" ? "ring-white/40" : "ring-slate-200"
                    }`}
                  />
                ) : (
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-base shrink-0 ${
                      selectedMemberId === "self"
                        ? "bg-white/20 text-white"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {client.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-extrabold text-sm truncate">
                    {capitalizeWords(client.name)}
                  </div>
                  <div
                    className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                      selectedMemberId === "self" ? "text-blue-200" : "text-blue-600"
                    }`}
                  >
                    Self (Primary)
                  </div>
                </div>
              </div>
              <span
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${
                  selectedMemberId === "self"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {clientDocs.length} {clientDocs.length === 1 ? "doc" : "docs"}
              </span>
            </button>

            {/* Other Family Members Buttons */}
            {familyMembers.map((member) => {
              const memberDocCount = allDocuments.filter(
                (d) => d.family_member_id === member.id
              ).length;
              const isSelected = selectedMemberId === member.id;

              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setSelectedMemberId(member.id)}
                  className={`p-4 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between gap-3 border ${
                    isSelected
                      ? "bg-[#005A87] text-white border-[#005A87] shadow-md shadow-[#005A87]/20 ring-2 ring-[#005A87]/30"
                      : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-xs"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        className={`w-11 h-11 rounded-xl object-cover ring-1 shrink-0 ${
                          isSelected ? "ring-white/40" : "ring-slate-200"
                        }`}
                      />
                    ) : (
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-base shrink-0 ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        {member.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-extrabold text-sm truncate">
                        {formatFamilyName(member.name)}
                      </div>
                      <div
                        className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                          isSelected ? "text-blue-200" : "text-indigo-600"
                        }`}
                      >
                        {member.relationship || "Family"}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {memberDocCount} {memberDocCount === 1 ? "doc" : "docs"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Selected Member's Dedicated Container (Profile Info + Documents Inside) ── */}
        <div className="space-y-6">
          {/* Member Profile Info Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                {isSelf ? (
                  client.profile_pic ? (
                    <img
                      src={client.profile_pic}
                      alt={client.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-sm shrink-0">
                      {client.name?.[0]?.toUpperCase()}
                    </div>
                  )
                ) : selectedFamilyMember?.photo_url ? (
                  <img
                    src={selectedFamilyMember.photo_url}
                    alt={selectedFamilyMember.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-sm shrink-0">
                    {selectedFamilyMember?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-black text-[#0f172a]">
                      {selectedMemberName}
                    </h3>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isSelf
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      }`}
                    >
                      {isSelf ? "Self (Primary)" : selectedFamilyMember?.relationship || "Family Member"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
                {currentMemberDocs.length} {currentMemberDocs.length === 1 ? "Record in Vault" : "Records in Vault"}
              </div>
            </div>

            {/* Profile Info Details Grid */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {isSelf ? (
                <>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Full Name
                    </div>
                    <div className="font-bold text-slate-800 text-[14px]">
                      {capitalizeWords(client.name)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Phone Number
                    </div>
                    <div className="font-bold text-slate-700 text-[13px]">
                      {client.phone}
                    </div>
                  </div>
                  {client.email && (
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Email Address
                      </div>
                      <div className="font-bold text-slate-700 text-[13px] break-words">
                        {client.email}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Date of Birth
                    </div>
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
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Anniversary
                      </div>
                      <div className="font-bold text-slate-700 text-[13px]">
                        {formatDate(client.anniversary_date || client.anniversaryDate)}
                      </div>
                    </div>
                  )}
                  {client.occupation && (
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Occupation
                      </div>
                      <div className="font-bold text-slate-700 text-[13px]">
                        {client.occupation}
                      </div>
                    </div>
                  )}
                  <div className="col-span-2">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Address
                    </div>
                    <div className="font-bold text-slate-700 text-[13px] leading-snug break-words">
                      {fullAddress || "Not provided"}
                    </div>
                  </div>
                </>
              ) : selectedFamilyMember ? (
                <>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Profile Name
                    </div>
                    <div className="font-bold text-[#005A87] text-[14px]">
                      {formatFamilyName(selectedFamilyMember.name)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Full Name
                    </div>
                    <div className="font-bold text-slate-800 text-[14px]">
                      {selectedFamilyMember.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Relationship
                    </div>
                    <div className="font-bold text-indigo-700 text-[13px]">
                      {selectedFamilyMember.relationship || "Family"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Date of Birth
                    </div>
                    <div className="font-bold text-slate-700 text-[13px]">
                      {selectedFamilyMember.date_of_birth
                        ? formatDate(selectedFamilyMember.date_of_birth)
                        : "Not specified"}
                      {selectedFamilyMember.date_of_birth &&
                        getAge(selectedFamilyMember.date_of_birth) > 0 && (
                          <span className="text-slate-400 text-xs font-medium ml-1.5">
                            ({getAge(selectedFamilyMember.date_of_birth)} yrs)
                          </span>
                        )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Phone Number
                    </div>
                    <div className="font-bold text-slate-700 text-[13px]">
                      {selectedFamilyMember.phone ? (
                        <a
                          href={`tel:${selectedFamilyMember.phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {selectedFamilyMember.phone}
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Occupation
                    </div>
                    <div className="font-bold text-slate-700 text-[13px]">
                      {selectedFamilyMember.occupation || "Not specified"}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* Member's Documents Section (Exclusively Inside Member View) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-black text-[#0f172a] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Documents Vault for {selectedMemberName}
                </h3>
              </div>
              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                {currentMemberDocs.length} Document{currentMemberDocs.length === 1 ? "" : "s"}
              </div>
            </div>

            {currentMemberDocs.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-slate-700 mb-0.5">
                  No documents for {selectedMemberName} yet
                </h4>
                <p className="text-xs font-medium text-slate-400 max-w-sm mx-auto">
                  Your insurance agent has not uploaded any documents under {selectedMemberName}&apos;s profile yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentMemberDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-2xl border border-slate-200/90 hover:border-[#005A87] hover:shadow-xs transition-all group bg-white flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                        <DocTypeIcon type={doc.file_type} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 text-[13px] truncate group-hover:text-[#005A87] transition-colors" title={doc.name}>
                          {doc.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {doc.category && (
                            <span className="inline-block px-1.5 py-0.5 bg-blue-50 text-[#005A87] text-[9px] font-bold uppercase tracking-wider rounded border border-blue-100 shrink-0">
                              {doc.category}
                            </span>
                          )}
                          <span className="text-[10px] font-medium text-slate-400 shrink-0">
                            {formatSize(doc.file_size)} · {formatDate(doc.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-8 h-8 rounded-xl bg-slate-50 text-slate-500 hover:bg-[#005A87] hover:text-white transition-all border border-slate-200 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                      title="View / Download"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
