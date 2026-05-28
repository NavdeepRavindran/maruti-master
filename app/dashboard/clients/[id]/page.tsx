"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { supabase } from "../../../../lib/supabaseClient";

interface ClientData { id: string; name: string; phone: string; email?: string; date_of_birth: string; address?: string; status: string; family_count?: number; document_count?: number; clientLoginId?: string; temporaryPassword?: string; }
interface FamilyMember { id: string; client_id: string; name: string; date_of_birth: string; relationship: string; phone?: string; }
interface DocData { id: string; name: string; file_name: string; file_type: string; file_size: number; created_at: string; family_member_id?: string | null; file_url?: string; }

export default function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [client, setClient] = useState<ClientData | null>(null);
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [docs, setDocs] = useState<DocData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [familyForm, setFamilyForm] = useState({ name: "", date_of_birth: "", relationship: "", phone: "" });
  const [docForm, setDocForm] = useState({ name: "", file_name: "", file_size: 0, file_url: "", family_member_id: "", category: "" });
  const [selectedDocFile, setSelectedDocFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"docs" | "family">("docs");
  const [showPassword, setShowPassword] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  async function regeneratePassword() {
    if (!client) return;
    if (!confirm("Are you sure you want to regenerate the portal password? The old password will be invalidated.")) return;
    setRegenerating(true);
    try {
      const res = await fetch(`/api/clients/${id}/regenerate`, { method: "POST" });
      const data = await res.json();
      if (data.client) {
        setClient({ ...client, temporaryPassword: data.client.temporaryPassword });
        alert("Password regenerated successfully.");
      }
    } catch {
      alert("Failed to regenerate password.");
    } finally {
      setRegenerating(false);
    }
  }

  function copyToClipboard(text: string, msg: string) {
    navigator.clipboard.writeText(text);
    alert(msg);
  }

  function copyAllCredentials() {
    if (!client) return;
    const text = `Client Portal Access\n\nLogin ID: ${client.clientLoginId || "N/A"}\nPassword: ${client.temporaryPassword || "N/A"}\nPortal URL: ${window.location.origin}/client-login`;
    copyToClipboard(text, "All credentials copied to clipboard!");
  }

  useEffect(() => { fetchClient(); }, [id]);

  async function fetchClient() {
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${id}`);
      const data = await res.json();
      if (data.client) setClient(data.client);
      if (data.family_members) setFamily(data.family_members);
      if (data.documents) setDocs(data.documents);
    } catch {} finally { setLoading(false); }
  }

  const formatSize = (b: number) => b < 1048576 ? (b / 1024).toFixed(1) + " KB" : (b / 1048576).toFixed(1) + " MB";
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const getAge = (dob: string) => { const b = new Date(dob), n = new Date(); let a = n.getFullYear() - b.getFullYear(); if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--; return a; };
  const docColor = (t: string) => ({ PDF: "bg-rose-50 text-rose-600", IMG: "bg-amber-50 text-amber-600", DOC: "bg-indigo-50 text-indigo-600" }[t] || "bg-emerald-50 text-emerald-600");

  async function addFamilyMember() {
    if (!familyForm.name || !familyForm.date_of_birth || !familyForm.relationship) return;
    setSaving(true);
    try {
      await fetch(`/api/clients/${id}/family`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(familyForm) });
      setShowFamilyModal(false);
      setFamilyForm({ name: "", date_of_birth: "", relationship: "", phone: "" });
      fetchClient();
    } catch {} finally { setSaving(false); }
  }

  async function deleteFamilyMember(fid: string) {
    if (!confirm("Delete this family member and their documents?")) return;
    try { await fetch(`/api/clients/${id}/family/${fid}`, { method: "DELETE" }); fetchClient(); } catch {}
  }

  async function addDocument() {
    if (!docForm.name || !selectedDocFile || !docForm.category) return alert("Please provide a name, select a category and attach a file");
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedDocFile);
      formData.append("client_id", id);
      formData.append("name", docForm.name);
      formData.append("category", docForm.category);
      if (docForm.family_member_id) {
        formData.append("family_member_id", docForm.family_member_id);
      }

      const res = await fetch("/api/documents", { 
        method: "POST", 
        body: formData 
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Upload failed");
      }

      setShowDocModal(false);
      setDocForm({ name: "", file_name: "", file_size: 0, file_url: "", family_member_id: "", category: "" });
      setSelectedDocFile(null);
      fetchClient();
    } catch (e: any) {
      alert("Error uploading document: " + e.message);
    } finally { 
      setSaving(false); 
    }
  }

  async function deleteDocument(did: string) {
    if (!confirm("Delete this document?")) return;
    try { await fetch(`/api/documents/${did}`, { method: "DELETE" }); fetchClient(); } catch {}
  }

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!client) return <div className="py-32 text-center"><p className="text-slate-400 font-bold">Client not found.</p><Link href="/dashboard/clients" className="text-primary font-bold mt-4 inline-block">← Back to Clients</Link></div>;

  return (
    <>
      {/* Breadcrumb + Header */}
      <div className="mb-6 animate-in fade-in duration-300">
        <Link href="/dashboard/clients" className="text-sm text-slate-400 hover:text-primary font-bold transition-colors">← Back to Client Directory</Link>
      </div>

      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary-light to-primary text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-primary/20">{client.name[0]}</div>
          <div>
            <h1 className="text-3xl font-black text-navy mb-1">{client.name}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${client.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${client.status === "Active" ? "bg-emerald-500" : "bg-amber-500"}`}></span>{client.status}
              </span>
              <span className="text-xs text-slate-400 font-bold">Age: {getAge(client.date_of_birth)}</span>
              <span className="text-xs text-slate-400 font-bold">DOB: {formatDate(client.date_of_birth)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowDocModal(true)} className="px-6 py-3 bg-navy text-white rounded-2xl font-bold text-sm hover:bg-primary transition-all shadow-xl shadow-navy/20 active:scale-95">📄 Upload Document</button>
          <button onClick={() => setShowFamilyModal(true)} className="px-6 py-3 bg-white border border-slate-200 text-navy rounded-2xl font-bold text-sm hover:border-primary hover:text-primary transition-all shadow-sm">👤 Add Family</button>
        </div>
      </header>

      {/* Info Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Phone", value: client.phone, icon: "📞" },
          { label: "Email", value: client.email || "—", icon: "✉️" },
          { label: "Address", value: client.address || "—", icon: "📍" },
          { label: "Family Members", value: family.length.toString(), icon: "👨‍👩‍👧‍👦" },
        ].map((c) => (
          <div key={c.label} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2"><span>{c.icon}</span><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.label}</span></div>
            <p className="font-bold text-navy text-sm truncate">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Portal Access Card */}
      {client.clientLoginId && (
        <div className="mb-10 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full pointer-events-none -z-10" />
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-navy flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Portal Access
              </h2>
              <p className="text-xs text-slate-400 font-bold mt-1">Manage credentials for the client self-service portal</p>
            </div>
            <button onClick={copyAllCredentials} className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              Copy Details
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Client Login ID</label>
              <div className="flex items-center gap-2">
                <input type="text" readOnly value={client.clientLoginId || ""} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none" />
                <button onClick={() => copyToClipboard(client.clientLoginId || "", "Login ID copied!")} className="p-3 bg-slate-50 hover:bg-slate-200 rounded-xl text-slate-500 transition-colors border border-slate-200">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Temporary Password</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input type={showPassword ? "text" : "password"} readOnly value={client.temporaryPassword || ""} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm font-bold text-slate-700 outline-none tracking-widest" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy">
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
                <button onClick={() => copyToClipboard(client.temporaryPassword || "", "Password copied!")} className="p-3 bg-slate-50 hover:bg-slate-200 rounded-xl text-slate-500 transition-colors border border-slate-200">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
                <button onClick={regeneratePassword} disabled={regenerating} className="p-3 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 transition-colors border border-red-100 font-bold text-xs disabled:opacity-50 flex items-center gap-1.5" title="Regenerate Password">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  <span className="hidden xl:inline">Regenerate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-8 p-1 bg-slate-50 rounded-2xl border border-slate-100 w-fit">
        <button onClick={() => setActiveTab("docs")} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "docs" ? "bg-white text-primary shadow-sm border border-slate-100" : "text-slate-400 hover:text-navy"}`}>Documents ({docs.length})</button>
        <button onClick={() => setActiveTab("family")} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "family" ? "bg-white text-primary shadow-sm border border-slate-100" : "text-slate-400 hover:text-navy"}`}>Family Members ({family.length})</button>
      </div>

      {/* Documents Tab */}
      {activeTab === "docs" && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 animate-in fade-in duration-300">
          {docs.length === 0 ? (
            <div className="py-16 text-center">
              <span className="text-4xl block mb-4">📂</span>
              <p className="text-slate-400 font-bold mb-4">No documents uploaded yet</p>
              <button onClick={() => setShowDocModal(true)} className="text-primary font-bold text-sm hover:underline">Upload first document →</button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {docs.map((doc) => (
                <div key={doc.id} className="p-5 rounded-2xl border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${docColor(doc.file_type)} flex items-center justify-center font-black text-xs`}>{doc.file_type}</div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={doc.file_url && doc.file_url.length > 5 ? doc.file_url : "#"} download={doc.file_name} target="_blank" className="p-2 rounded-lg text-slate-300 hover:text-primary hover:bg-primary/10 transition-all" title="Download Document"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg></a>
                      <button onClick={() => deleteDocument(doc.id)} className="p-2 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all" title="Delete"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                    </div>
                  </div>
                  <h4 className="font-black text-navy text-sm truncate mb-1 group-hover:text-primary transition-colors">{doc.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold mb-3">{doc.file_name}</p>
                  {doc.family_member_id && <p className="text-[10px] text-primary bg-primary/5 px-2 py-1 rounded-lg inline-block font-bold mb-2">👤 {family.find(f => f.id === doc.family_member_id)?.name || "Family"}</p>}
                  <div className="flex justify-between pt-3 border-t border-slate-50 text-[10px] font-bold text-slate-400">{formatSize(doc.file_size)}<span>{formatDate(doc.created_at)}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Family Tab */}
      {activeTab === "family" && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 animate-in fade-in duration-300">
          {family.length === 0 ? (
            <div className="py-16 text-center">
              <span className="text-4xl block mb-4">👨‍👩‍👧‍👦</span>
              <p className="text-slate-400 font-bold mb-4">No family members added yet</p>
              <button onClick={() => setShowFamilyModal(true)} className="text-primary font-bold text-sm hover:underline">Add first family member →</button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {family.map((fm) => (
                <div key={fm.id} className="flex items-center justify-between py-5 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-light/50 to-primary/50 text-white flex items-center justify-center font-black shadow-sm">{fm.name[0]}</div>
                    <div>
                      <p className="font-black text-navy group-hover:text-primary transition-colors">{fm.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{fm.relationship} • Age {getAge(fm.date_of_birth)} • DOB {formatDate(fm.date_of_birth)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {fm.phone && <span className="text-xs text-slate-500 font-bold hidden sm:block">{fm.phone}</span>}
                    <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-1 rounded-lg">{docs.filter(d => d.family_member_id === fm.id).length} docs</span>
                    <button onClick={() => deleteFamilyMember(fm.id)} className="p-2 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Family Modal */}
      {showFamilyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={() => setShowFamilyModal(false)}></div>
          <div className="relative bg-white rounded-[2.5rem] p-8 md:p-12 w-full max-w-lg shadow-2xl animate-in zoom-in-95 fade-in duration-300">
            <h2 className="text-2xl font-black text-navy mb-8">Add Family Member</h2>
            <div className="space-y-5">
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">Full Name *</label><input type="text" value={familyForm.name} onChange={e => setFamilyForm({...familyForm, name: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary outline-none font-bold text-navy" placeholder="e.g. Rajesh Kumar" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">Date of Birth *</label><input type="date" value={familyForm.date_of_birth} onChange={e => setFamilyForm({...familyForm, date_of_birth: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary outline-none font-bold text-navy" /></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">Relationship *</label><select value={familyForm.relationship} onChange={e => setFamilyForm({...familyForm, relationship: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary outline-none font-bold text-navy appearance-none"><option value="">Select...</option>{["Wife","Husband","Son","Daughter","Father","Mother","Brother","Sister","Other"].map(r => <option key={r} value={r}>{r}</option>)}</select></div>
              </div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">Phone</label><input type="tel" value={familyForm.phone} onChange={e => setFamilyForm({...familyForm, phone: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary outline-none font-bold text-navy" placeholder="+91 00000 00000" /></div>
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
              <button onClick={() => setShowFamilyModal(false)} className="px-6 py-3 rounded-2xl border border-slate-200 text-navy font-bold hover:bg-slate-50">Cancel</button>
              <button onClick={addFamilyMember} disabled={saving || !familyForm.name || !familyForm.date_of_birth || !familyForm.relationship} className="px-8 py-3 rounded-2xl bg-navy text-white font-bold hover:bg-primary transition-all disabled:opacity-50">{saving ? "Saving..." : "Add Member"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={() => setShowDocModal(false)}></div>
          <div className="relative bg-white rounded-[2.5rem] p-8 md:p-12 w-full max-w-lg shadow-2xl animate-in zoom-in-95 fade-in duration-300">
            <h2 className="text-2xl font-black text-navy mb-8">Upload Document</h2>
            <div className="space-y-5">
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">Document Name *</label><input type="text" value={docForm.name} onChange={e => setDocForm({...docForm, name: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary outline-none font-bold text-navy" placeholder="e.g. LIC Term Policy" /></div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">Category *</label><select value={docForm.category} onChange={e => setDocForm({...docForm, category: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary outline-none font-bold text-navy appearance-none"><option value="">Select Category...</option>{["Policy Documents", "KYC / Identity", "Health Records", "Vehicle RC / Insurance", "Financial / Tax", "Others"].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Attach File *</label>
                <input 
                  type="file" 
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedDocFile(file);
                      setDocForm({...docForm, file_name: file.name, file_size: file.size});
                    }
                  }} 
                  className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-bold text-navy file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer text-sm" 
                />
                {docForm.file_name && (
                  <p className="text-xs text-emerald-500 font-bold mt-2 ml-1">Selected: {docForm.file_name} ({(docForm.file_size / 1024).toFixed(1)} KB)</p>
                )}
              </div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">Assign to Family Member (optional)</label><select value={docForm.family_member_id} onChange={e => setDocForm({...docForm, family_member_id: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary outline-none font-bold text-navy appearance-none"><option value="">Client (Self)</option>{family.map(f => <option key={f.id} value={f.id}>{f.name} ({f.relationship})</option>)}</select></div>
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
              <button onClick={() => setShowDocModal(false)} className="px-6 py-3 rounded-2xl border border-slate-200 text-navy font-bold hover:bg-slate-50">Cancel</button>
              <button onClick={addDocument} disabled={saving || !docForm.name || !selectedDocFile || !docForm.category} className="px-8 py-3 rounded-2xl bg-navy text-white font-bold hover:bg-primary transition-all disabled:opacity-50">{saving ? "Uploading..." : "Upload"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
