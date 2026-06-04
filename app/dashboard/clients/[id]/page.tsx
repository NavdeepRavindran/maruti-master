"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface ClientData {
  id: string;
  name: string;
  surname?: string;
  phone: string;
  alternate_mobile?: string;
  email?: string;
  date_of_birth: string;
  anniversary_date?: string;
  address?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  gender?: string;
  marital_status?: string;
  occupation?: string;
  notes?: string;
  status: string;
  family_count?: number;
  document_count?: number;
  clientloginid?: string;
  temporarypassword?: string;
}

interface FamilyMember { id: string; client_id: string; name: string; date_of_birth: string; relationship: string; phone?: string; }
interface DocData { id: string; name: string; file_name: string; file_type: string; file_size: number; created_at: string; family_member_id?: string | null; file_url?: string; }

const labelCls = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5";
const inputCls = "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-[13px] font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal";

export default function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [client, setClient] = useState<ClientData | null>(null);
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [docs, setDocs] = useState<DocData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [familyForm, setFamilyForm] = useState({ name: "", date_of_birth: "", relationship: "", phone: "" });
  const [docForm, setDocForm] = useState({ name: "", file_name: "", file_size: 0, file_url: "", family_member_id: "", category: "" });
  const [selectedDocFile, setSelectedDocFile] = useState<File | null>(null);
  const [editForm, setEditForm] = useState<Partial<ClientData>>({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"docs" | "family">("docs");
  const [showPassword, setShowPassword] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

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

  function openEdit() {
    if (!client) return;
    setEditForm({
      name: client.name || "",
      surname: client.surname || "",
      phone: client.phone || "",
      alternate_mobile: client.alternate_mobile || "",
      email: client.email || "",
      date_of_birth: client.date_of_birth || "",
      anniversary_date: client.anniversary_date || "",
      gender: client.gender || "",
      marital_status: client.marital_status || "",
      occupation: client.occupation || "",
      address: client.address || "",
      city: client.city || "",
      state: client.state || "",
      pin_code: client.pin_code || "",
      notes: client.notes || "",
      status: client.status || "Active",
    });
    setShowEditModal(true);
  }

  async function saveEdit() {
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.client) setClient(data.client);
      setShowEditModal(false);
      fetchClient();
    } catch { alert("Failed to update client."); } 
    finally { setSaving(false); }
  }

  async function regeneratePassword() {
    if (!client) return;
    if (!confirm("Regenerate portal password? The old password will be invalidated.")) return;
    setRegenerating(true);
    try {
      const res = await fetch(`/api/clients/${id}/regenerate`, { method: "POST" });
      const data = await res.json();
      if (data.client) { setClient({ ...client, temporarypassword: data.client.temporaryPassword }); alert("Password regenerated."); }
    } catch { alert("Failed to regenerate password."); } 
    finally { setRegenerating(false); }
  }

  function copyToClipboard(text: string, msg: string) { navigator.clipboard.writeText(text); alert(msg); }
  function copyAllCredentials() {
    if (!client) return;
    const text = `Client Portal Access\n\nLogin ID: ${client.clientloginid || "N/A"}\nPassword: ${client.temporarypassword || "N/A"}\nPortal URL: ${window.location.origin}/client-login`;
    copyToClipboard(text, "All credentials copied!");
  }

  const formatSize = (b: number) => b < 1048576 ? (b / 1024).toFixed(1) + " KB" : (b / 1048576).toFixed(1) + " MB";
  const formatDate = (d: string) => { try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); } catch { return d; } };
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
      if (docForm.family_member_id) formData.append("family_member_id", docForm.family_member_id);
      const res = await fetch("/api/documents", { method: "POST", body: formData });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Upload failed"); }
      setShowDocModal(false);
      setDocForm({ name: "", file_name: "", file_size: 0, file_url: "", family_member_id: "", category: "" });
      setSelectedDocFile(null);
      fetchClient();
    } catch (e: any) { alert("Error: " + e.message); } 
    finally { setSaving(false); }
  }

  async function deleteDocument(did: string) {
    if (!confirm("Delete this document?")) return;
    try { await fetch(`/api/documents/${did}`, { method: "DELETE" }); fetchClient(); } catch {}
  }

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!client) return <div className="py-32 text-center"><p className="text-slate-400 font-bold">Client not found.</p><Link href="/dashboard/clients" className="text-blue-600 font-bold mt-4 inline-block">← Back to Clients</Link></div>;

  const fullName = [client.name, client.surname].filter(Boolean).join(" ");
  const fullAddress = [client.address, client.city, client.state, client.pin_code].filter(Boolean).join(", ");

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/dashboard/clients" className="text-sm text-slate-400 hover:text-blue-600 font-bold transition-colors">← Back to Client Directory</Link>
      </div>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-blue-200">
            {fullName[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-1">{fullName}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${client.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${client.status === "Active" ? "bg-emerald-500" : "bg-amber-500"}`}></span>{client.status}
              </span>
              <span className="text-xs text-slate-400 font-bold">Age: {getAge(client.date_of_birth)}</span>
              <span className="text-xs text-slate-400 font-bold">DOB: {formatDate(client.date_of_birth)}</span>
              {client.gender && <span className="text-xs text-slate-400 font-bold">{client.gender}</span>}
              {client.marital_status && <span className="text-xs text-slate-400 font-bold">{client.marital_status}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={openEdit} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm">✏️ Edit Client</button>
          <button onClick={() => setShowDocModal(true)} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/20 active:scale-95">📄 Upload Document</button>
          <button onClick={() => setShowFamilyModal(true)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold text-sm hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm">👤 Add Family</button>
        </div>
      </header>

      {/* Info Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Phone", value: client.phone, icon: "📞" },
          { label: "Email", value: client.email || "—", icon: "✉️" },
          { label: "Occupation", value: client.occupation || "—", icon: "💼" },
          { label: "Family Members", value: family.length.toString(), icon: "👨‍👩‍👧‍👦" },
        ].map((c) => (
          <div key={c.label} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2"><span>{c.icon}</span><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.label}</span></div>
            <p className="font-bold text-slate-900 text-sm truncate">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Full Details Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Personal Details</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
          {[
            { label: "Alternate Mobile", value: client.alternate_mobile },
            { label: "Anniversary Date", value: client.anniversary_date ? formatDate(client.anniversary_date) : null },
            { label: "Address", value: fullAddress || null },
            { label: "City", value: client.city },
            { label: "State", value: client.state },
            { label: "PIN Code", value: client.pin_code },
          ].map(({ label, value }) => value ? (
            <div key={label}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-slate-700">{value}</p>
            </div>
          ) : null)}
        </div>
        {client.notes && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Notes</p>
            <p className="text-sm text-slate-600 font-medium">{client.notes}</p>
          </div>
        )}
      </div>

      {/* Portal Access Card */}
      {client.clientloginid && (
        <div className="mb-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">🔐 Portal Access</h2>
              <p className="text-xs text-slate-400 font-bold mt-1">Client self-service portal credentials</p>
            </div>
            <button onClick={copyAllCredentials} className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-colors">Copy All</button>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Client Login ID</label>
              <div className="flex items-center gap-2">
                <input type="text" readOnly value={client.clientloginid || ""} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none" />
                <button onClick={() => copyToClipboard(client.clientloginid || "", "Login ID copied!")} className="p-3 bg-slate-50 hover:bg-slate-200 rounded-xl text-slate-500 border border-slate-200">📋</button>
              </div>
            </div>
            <div>
              <label className={labelCls}>Temporary Password</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input type={showPassword ? "text" : "password"} readOnly value={client.temporarypassword || ""} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm font-bold text-slate-700 outline-none tracking-widest" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? "🙈" : "👁️"}</button>
                </div>
                <button onClick={() => copyToClipboard(client.temporarypassword || "", "Password copied!")} className="p-3 bg-slate-50 hover:bg-slate-200 rounded-xl text-slate-500 border border-slate-200">📋</button>
                <button onClick={regeneratePassword} disabled={regenerating} className="p-3 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 border border-red-100 disabled:opacity-50" title="Regenerate">🔄</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-slate-50 rounded-2xl border border-slate-100 w-fit">
        <button onClick={() => setActiveTab("docs")} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "docs" ? "bg-white text-blue-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-900"}`}>Documents ({docs.length})</button>
        <button onClick={() => setActiveTab("family")} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "family" ? "bg-white text-blue-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-900"}`}>Family Members ({family.length})</button>
      </div>

      {/* Documents Tab */}
      {activeTab === "docs" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          {docs.length === 0 ? (
            <div className="py-16 text-center">
              <span className="text-4xl block mb-4">📂</span>
              <p className="text-slate-400 font-bold mb-4">No documents uploaded yet</p>
              <button onClick={() => setShowDocModal(true)} className="text-blue-600 font-bold text-sm hover:underline">Upload first document →</button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {docs.map((doc) => (
                <div key={doc.id} className="p-5 rounded-2xl border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${docColor(doc.file_type)} flex items-center justify-center font-black text-xs`}>{doc.file_type}</div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={doc.file_url && doc.file_url.length > 5 ? doc.file_url : "#"} download={doc.file_name} target="_blank" className="p-2 rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all">⬇️</a>
                      <button onClick={() => deleteDocument(doc.id)} className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">🗑️</button>
                    </div>
                  </div>
                  <h4 className="font-black text-slate-900 text-sm truncate mb-1 group-hover:text-blue-600 transition-colors">{doc.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold mb-3">{doc.file_name}</p>
                  {doc.family_member_id && <p className="text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded-lg inline-block font-bold mb-2">👤 {family.find(f => f.id === doc.family_member_id)?.name || "Family"}</p>}
                  <div className="flex justify-between pt-3 border-t border-slate-50 text-[10px] font-bold text-slate-400">{formatSize(doc.file_size)}<span>{formatDate(doc.created_at)}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Family Tab */}
      {activeTab === "family" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          {family.length === 0 ? (
            <div className="py-16 text-center">
              <span className="text-4xl block mb-4">👨‍👩‍👧‍👦</span>
              <p className="text-slate-400 font-bold mb-4">No family members added yet</p>
              <button onClick={() => setShowFamilyModal(true)} className="text-blue-600 font-bold text-sm hover:underline">Add first family member →</button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {family.map((fm) => (
                <div key={fm.id} className="flex items-center justify-between py-5 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center font-black shadow-sm">{fm.name[0]}</div>
                    <div>
                      <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{fm.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{fm.relationship} · Age {getAge(fm.date_of_birth)} · DOB {formatDate(fm.date_of_birth)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {fm.phone && <span className="text-xs text-slate-500 font-bold hidden sm:block">{fm.phone}</span>}
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{docs.filter(d => d.family_member_id === fm.id).length} docs</span>
                    <button onClick={() => deleteFamilyMember(fm.id)} className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Edit Client Modal ─────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-[15px] font-black text-slate-900">Edit Client</h2>
                <p className="text-[11px] text-slate-400 font-medium">Update client information</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>First Name</label><input type="text" value={editForm.name || ""} onChange={e => setEditForm({...editForm, name: e.target.value})} className={inputCls} /></div>
                <div><label className={labelCls}>Surname</label><input type="text" value={editForm.surname || ""} onChange={e => setEditForm({...editForm, surname: e.target.value})} className={inputCls} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Mobile</label><input type="tel" value={editForm.phone || ""} onChange={e => setEditForm({...editForm, phone: e.target.value.replace(/\D/g,'')})} maxLength={10} className={inputCls} /></div>
                <div><label className={labelCls}>Alternate Mobile</label><input type="tel" value={editForm.alternate_mobile || ""} onChange={e => setEditForm({...editForm, alternate_mobile: e.target.value.replace(/\D/g,'')})} maxLength={10} className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>Email</label><input type="email" value={editForm.email || ""} onChange={e => setEditForm({...editForm, email: e.target.value})} className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Date of Birth</label><input type="date" value={editForm.date_of_birth || ""} onChange={e => setEditForm({...editForm, date_of_birth: e.target.value})} className={inputCls} /></div>
                <div><label className={labelCls}>Anniversary Date</label><input type="date" value={editForm.anniversary_date || ""} onChange={e => setEditForm({...editForm, anniversary_date: e.target.value})} className={inputCls} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Gender</label>
                  <select value={editForm.gender || ""} onChange={e => setEditForm({...editForm, gender: e.target.value})} className={inputCls}>
                    <option value="">Select...</option>
                    {["Male","Female","Other","Prefer not to say"].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>Marital Status</label>
                  <select value={editForm.marital_status || ""} onChange={e => setEditForm({...editForm, marital_status: e.target.value})} className={inputCls}>
                    <option value="">Select...</option>
                    {["Single","Married","Divorced","Widowed"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div><label className={labelCls}>Occupation</label><input type="text" value={editForm.occupation || ""} onChange={e => setEditForm({...editForm, occupation: e.target.value})} className={inputCls} /></div>
              <div><label className={labelCls}>Address</label><textarea value={editForm.address || ""} onChange={e => setEditForm({...editForm, address: e.target.value})} className={inputCls} rows={2} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className={labelCls}>City</label><input type="text" value={editForm.city || ""} onChange={e => setEditForm({...editForm, city: e.target.value})} className={inputCls} /></div>
                <div><label className={labelCls}>State</label>
                  <select value={editForm.state || ""} onChange={e => setEditForm({...editForm, state: e.target.value})} className={inputCls}>
                    <option value="">Select State</option>
                    {["Andhra Pradesh","Assam","Bihar","Chandigarh","Chhattisgarh","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Puducherry","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>PIN Code</label><input type="text" maxLength={6} value={editForm.pin_code || ""} onChange={e => setEditForm({...editForm, pin_code: e.target.value.replace(/\D/g,'')})} className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>Status</label>
                <select value={editForm.status || "Active"} onChange={e => setEditForm({...editForm, status: e.target.value})} className={inputCls}>
                  {["Active","Pending","Inactive"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Notes</label><textarea value={editForm.notes || ""} onChange={e => setEditForm({...editForm, notes: e.target.value})} className={inputCls} rows={3} /></div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex gap-3">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={saveEdit} disabled={saving} className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? "Saving…" : "✓ Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Family Modal */}
      {showFamilyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowFamilyModal(false)}></div>
          <div className="relative bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-black text-slate-900 mb-6">Add Family Member</h2>
            <div className="space-y-4">
              <div><label className={labelCls}>Full Name *</label><input type="text" value={familyForm.name} onChange={e => setFamilyForm({...familyForm, name: e.target.value})} className={inputCls} placeholder="e.g. Rajesh Kumar" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Date of Birth *</label><input type="date" value={familyForm.date_of_birth} onChange={e => setFamilyForm({...familyForm, date_of_birth: e.target.value})} className={inputCls} /></div>
                <div><label className={labelCls}>Relationship *</label>
                  <select value={familyForm.relationship} onChange={e => setFamilyForm({...familyForm, relationship: e.target.value})} className={inputCls}>
                    <option value="">Select...</option>
                    {["Wife","Husband","Son","Daughter","Father","Mother","Brother","Sister","Other"].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div><label className={labelCls}>Phone</label><input type="tel" value={familyForm.phone} onChange={e => setFamilyForm({...familyForm, phone: e.target.value})} className={inputCls} placeholder="+91 00000 00000" /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-100">
              <button onClick={() => setShowFamilyModal(false)} className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50">Cancel</button>
              <button onClick={addFamilyMember} disabled={saving || !familyForm.name || !familyForm.date_of_birth || !familyForm.relationship} className="px-8 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-blue-600 transition-all disabled:opacity-50">{saving ? "Saving..." : "Add Member"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDocModal(false)}></div>
          <div className="relative bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-black text-slate-900 mb-6">Upload Document</h2>
            <div className="space-y-4">
              <div><label className={labelCls}>Document Name *</label><input type="text" value={docForm.name} onChange={e => setDocForm({...docForm, name: e.target.value})} className={inputCls} placeholder="e.g. LIC Term Policy" /></div>
              <div><label className={labelCls}>Category *</label>
                <select value={docForm.category} onChange={e => setDocForm({...docForm, category: e.target.value})} className={inputCls}>
                  <option value="">Select Category...</option>
                  {["Policy Documents","KYC / Identity","Health Records","Vehicle RC / Insurance","Financial / Tax","Others"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Attach File *</label>
                <input type="file" onChange={e => { const f = e.target.files?.[0]; if (f) { setSelectedDocFile(f); setDocForm({...docForm, file_name: f.name, file_size: f.size}); }}} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-slate-700 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white cursor-pointer text-sm" />
                {docForm.file_name && <p className="text-xs text-emerald-500 font-bold mt-2">Selected: {docForm.file_name} ({(docForm.file_size / 1024).toFixed(1)} KB)</p>}
              </div>
              <div><label className={labelCls}>Assign to Family Member (optional)</label>
                <select value={docForm.family_member_id} onChange={e => setDocForm({...docForm, family_member_id: e.target.value})} className={inputCls}>
                  <option value="">Client (Self)</option>
                  {family.map(f => <option key={f.id} value={f.id}>{f.name} ({f.relationship})</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-100">
              <button onClick={() => setShowDocModal(false)} className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50">Cancel</button>
              <button onClick={addDocument} disabled={saving || !docForm.name || !selectedDocFile || !docForm.category} className="px-8 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-blue-600 transition-all disabled:opacity-50">{saving ? "Uploading..." : "Upload"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}