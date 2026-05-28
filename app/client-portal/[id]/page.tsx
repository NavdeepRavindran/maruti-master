"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface ClientData {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  date_of_birth: string;
  anniversary_date?: string;
  documents?: any[];
  family_members?: any[];
}

export default function ClientPortalDashboard() {
  const router = useRouter();
  const params = useParams();
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientData();
  }, [params.id]);

  async function fetchClientData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch client");
      const data = await res.json();
      setClient(data.client);
    } catch (err) {
      console.error(err);
      alert("Could not load your portal data.");
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/client-logout", { method: "POST" });
    router.push("/client-login");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 KB";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const getDocIcon = (type: string) => {
    if (type === "PDF") return "📄";
    if (type === "IMG") return "🖼️";
    if (type === "DOC" || type === "XLS") return "📝";
    return "📎";
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

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['DM_Sans'] pb-20">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <div className="font-black text-[#0f172a] text-lg leading-tight">Maruthi Insure</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Client Portal</div>
            </div>
          </div>
          <button onClick={handleLogout} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-10">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#0f172a] to-blue-900 rounded-3xl p-8 md:p-12 text-white mb-8 shadow-xl shadow-blue-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-black mb-2">Welcome back, {client.name.split(' ')[0]}</h1>
            <p className="text-blue-200 font-medium max-w-xl">Your secure vault for all insurance policies, health records, and family KYC documents.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Profile & Family */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Profile Info */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-black text-[#0f172a] text-lg mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">👤</span>
                Profile Info
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</div>
                  <div className="font-bold text-slate-700">{client.name}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</div>
                  <div className="font-bold text-slate-700">{client.phone}</div>
                </div>
                {client.email && (
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</div>
                    <div className="font-bold text-slate-700">{client.email}</div>
                  </div>
                )}
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date of Birth</div>
                  <div className="font-bold text-slate-700">{formatDate(client.date_of_birth)}</div>
                </div>
                {client.anniversary_date && (
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Anniversary</div>
                    <div className="font-bold text-slate-700">{formatDate(client.anniversary_date)}</div>
                  </div>
                )}
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Address</div>
                  <div className="font-bold text-slate-700 leading-snug">{client.address || "Not provided"}</div>
                </div>
              </div>
            </div>

            {/* Family Members */}
            {client.family_members && client.family_members.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h2 className="font-black text-[#0f172a] text-lg mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">👥</span>
                  Family Members
                </h2>
                <div className="space-y-4">
                  {client.family_members.map(member => (
                    <div key={member.id} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-400">
                        {member.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-700">{member.name}</div>
                        <div className="text-xs font-bold text-slate-400">{member.relationship}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Documents */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm h-full">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-black text-[#0f172a] text-lg flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">📁</span>
                  My Documents
                </h2>
                <div className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  {client.documents?.length || 0} Files
                </div>
              </div>

              {!client.documents || client.documents.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <div className="text-5xl mb-4">🗂️</div>
                  <h3 className="text-lg font-black text-slate-700 mb-1">No documents yet</h3>
                  <p className="text-sm font-medium text-slate-400">Your agent hasn't uploaded any documents to your vault.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {client.documents.map(doc => (
                    <div key={doc.id} className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all group bg-white">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                          {getDocIcon(doc.file_type)}
                        </div>
                        <a 
                          href={doc.file_url} 
                          target="_blank" 
                          rel="noreferrer"
                          download={doc.file_name}
                          className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all border border-slate-100 hover:border-transparent"
                          title="Download Document"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </a>
                      </div>
                      
                      <h3 className="font-bold text-slate-800 text-sm mb-1 truncate" title={doc.name}>{doc.name}</h3>
                      
                      {doc.category && (
                        <div className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-wider rounded border border-blue-100 mb-3">
                          {doc.category}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400">{formatSize(doc.file_size)}</span>
                        <span className="text-[10px] font-bold text-slate-400">{formatDate(doc.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
