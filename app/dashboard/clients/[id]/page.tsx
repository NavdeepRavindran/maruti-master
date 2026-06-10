"use client";

import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import toast from "react-hot-toast";


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
  profile_pic?: string;
}

interface FamilyMember {
  id: string;
  client_id: string;
  name: string;
  date_of_birth: string;
  relationship: string;
  phone?: string;
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
}

const labelCls =
  "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5";
const inputCls =
  "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-[13px] font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal";

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
const getGradient = (name: string) =>
  avatarGradients[name.charCodeAt(0) % avatarGradients.length];

function Avatar({
  name,
  src,
  size = "lg",
}: {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeMap = {
    sm: "w-9 h-9 text-sm",
    md: "w-11 h-11 text-base",
    lg: "w-16 h-16 text-2xl",
    xl: "w-24 h-24 text-3xl",
  };
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeMap[size]} rounded-2xl object-cover shrink-0 ring-4 ring-white shadow-lg`}
      />
    );
  }
  return (
    <div
      className={`${sizeMap[size]} rounded-2xl bg-gradient-to-br ${getGradient(name)} flex items-center justify-center text-white font-black shrink-0 ring-4 ring-white shadow-lg`}
    >
      {name[0]?.toUpperCase()}
    </div>
  );
}

export default function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [client, setClient] = useState<ClientData | null>(null);
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [docs, setDocs] = useState<DocData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [familyForm, setFamilyForm] = useState({
    name: "",
    date_of_birth: "",
    relationship: "",
    phone: "",
  });
  const [docForm, setDocForm] = useState({
    name: "",
    file_name: "",
    file_size: 0,
    file_url: "",
    family_member_id: "",
    category: "",
  });
  const [selectedDocFile, setSelectedDocFile] = useState<File | null>(null);
  const [editForm, setEditForm] = useState<
    Partial<ClientData & { profilePic?: string }>
  >({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"docs" | "family">("docs");
  const [showPassword, setShowPassword] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const picInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchClient();
  }, [id]);

  async function fetchClient() {
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${id}`);
      const data = await res.json();
      if (data.client) setClient(data.client);
      if (data.family_members) setFamily(data.family_members);
      if (data.documents) setDocs(data.documents);
    } catch {
    } finally {
      setLoading(false);
    }
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
      profilePic: client.profile_pic || "",
    });
    setShowEditModal(true);
  }

  function handleEditPicChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setEditForm((prev) => ({ ...prev, profilePic: reader.result as string }));
    reader.readAsDataURL(file);
  }

  async function saveEdit() {
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, profile_pic: editForm.profilePic }),
      });
      const data = await res.json();
      if (data.client) setClient(data.client);
      setShowEditModal(false);
      fetchClient();
    } catch {
      alert("Failed to update client.");
    } finally {
      setSaving(false);
    }
  }

  async function regeneratePassword() {
    if (!client) return;
    if (
      !confirm(
        "Regenerate portal password? The old password will be invalidated.",
      )
    )
      return;
    setRegenerating(true);
    try {
      const res = await fetch(`/api/clients/${id}/regenerate`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.client) {
        setClient({
          ...client,
          temporarypassword: data.client.temporaryPassword,
        });
        alert("Password regenerated.");
      }
    } catch {
      alert("Failed to regenerate password.");
    } finally {
      setRegenerating(false);
    }
  }

  function copyToClipboard(text: string, msg: string) {
    navigator.clipboard.writeText(text);
  }
  function copyAllCredentials() {
    if (!client) return;
    const text = `Client Portal Access\n\nLogin ID: ${client.clientloginid || "N/A"}\nPassword: ${client.temporarypassword || "N/A"}\nPortal URL: ${window.location.origin}/client-login`;
    copyToClipboard(text, "All credentials copied!");
  }

  const formatSize = (b: number) =>
    b < 1048576
      ? (b / 1024).toFixed(1) + " KB"
      : (b / 1048576).toFixed(1) + " MB";
  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return d;
    }
  };
  const getAge = (dob: string) => {
    const b = new Date(dob),
      n = new Date();
    let a = n.getFullYear() - b.getFullYear();
    if (
      n.getMonth() < b.getMonth() ||
      (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())
    )
      a--;
    return a;
  };
  const docColor = (t: string) =>
    ({
      PDF: "bg-rose-50 text-rose-600 border-rose-100",
      IMG: "bg-amber-50 text-amber-600 border-amber-100",
      DOC: "bg-indigo-50 text-indigo-600 border-indigo-100",
    })[t] || "bg-emerald-50 text-emerald-600 border-emerald-100";

  async function addFamilyMember() {
    if (
      !familyForm.name ||
      !familyForm.date_of_birth ||
      !familyForm.relationship
    )
      return;
    setSaving(true);
    try {
      await fetch(`/api/clients/${id}/family`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(familyForm),
      });
      setShowFamilyModal(false);
      setFamilyForm({
        name: "",
        date_of_birth: "",
        relationship: "",
        phone: "",
      });
      fetchClient();
    } catch {
    } finally {
      setSaving(false);
    }
  }

  async function deleteFamilyMember(fid: string) {
    if (!confirm("Delete this family member and their documents?")) return;
    try {
      await fetch(`/api/clients/${id}/family/${fid}`, { method: "DELETE" });
      fetchClient();
    } catch {}
  }

  async function addDocument() {
    if (!docForm.name || !selectedDocFile || !docForm.category)
      return alert(
        "Please provide a name, select a category and attach a file",
      );
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedDocFile);
      formData.append("client_id", id);
      formData.append("name", docForm.name);
      formData.append("category", docForm.category);
      if (docForm.family_member_id)
        formData.append("family_member_id", docForm.family_member_id);
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Upload failed");
      }
      setShowDocModal(false);
      setDocForm({
        name: "",
        file_name: "",
        file_size: 0,
        file_url: "",
        family_member_id: "",
        category: "",
      });
      setSelectedDocFile(null);
      fetchClient();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteDocument(did: string) {
    if (!confirm("Delete this document?")) return;
    try {
      await fetch(`/api/documents/${did}`, { method: "DELETE" });
      fetchClient();
    } catch {}
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-8 h-8 border-[3px] border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!client)
    return (
      <div className="py-32 text-center">
        <p className="text-slate-400 font-bold mb-4">Client not found.</p>
        <Link href="/dashboard/clients" className="text-blue-600 font-bold">
          ← Back to Clients
        </Link>
      </div>
    );

  const fullName = [client.name, client.surname].filter(Boolean).join(" ");
  const fullAddress = [
    client.address,
    client.city,
    client.state,
    client.pin_code,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      {/* ── Top nav bar ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link
          href="/dashboard/clients"
          className="flex items-center gap-2 text-[12px] font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Clients
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDocModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[11px] font-bold hover:bg-blue-600 transition-all active:scale-95"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Upload
          </button>
          <button
            onClick={openEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[11px] font-bold hover:border-blue-500 hover:text-blue-600 transition-all"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </button>
        </div>
      </div>

      {/* ── Hero / Profile Header ────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Mobile: stacked, Desktop: row */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            {/* Avatar */}
            <div className="shrink-0">
              {client.profile_pic ? (
                <img
                  src={client.profile_pic}
                  alt={fullName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-white shadow-xl"
                />
              ) : (
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${getGradient(client.name)} flex items-center justify-center text-white font-black text-3xl sm:text-4xl ring-4 ring-white shadow-xl`}
                >
                  {fullName[0]?.toUpperCase()}
                </div>
              )}
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                    {fullName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        client.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${client.status === "Active" ? "bg-emerald-500" : "bg-amber-400"}`}
                      />
                      {client.status}
                    </span>
                    {client.gender && (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-widest">
                        {client.gender}
                      </span>
                    )}
                    {client.occupation && (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-500 truncate max-w-[140px]">
                        {client.occupation}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick stats row */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Age
                  </p>
                  <p className="text-[15px] font-black text-slate-900">
                    {getAge(client.date_of_birth)} yrs
                  </p>
                </div>
                <div className="w-px bg-slate-200" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    DOB
                  </p>
                  <p className="text-[15px] font-black text-slate-900">
                    {formatDate(client.date_of_birth)}
                  </p>
                </div>
                <div className="w-px bg-slate-200" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Documents
                  </p>
                  <p className="text-[15px] font-black text-slate-900">
                    {docs.length}
                  </p>
                </div>
                <div className="w-px bg-slate-200" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Family
                  </p>
                  <p className="text-[15px] font-black text-slate-900">
                    {family.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact strip */}
          <div className="mt-5 pt-5 border-t border-slate-100 flex flex-wrap gap-4">
            <a
              href={`tel:${client.phone}`}
              className="flex items-center gap-2 text-[12px] font-bold text-slate-700 hover:text-blue-600 transition-colors"
            >
              <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </span>
              {client.phone}
            </a>
            {client.email && (
              <a
                href={`mailto:${client.email}`}
                className="flex items-center gap-2 text-[12px] font-bold text-slate-700 hover:text-blue-600 transition-colors truncate"
              >
                <span className="w-7 h-7 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                  <svg
                    className="w-3.5 h-3.5 text-violet-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </span>
                {client.email}
              </a>
            )}
            {fullAddress && (
              <div className="flex items-center gap-2 text-[12px] font-bold text-slate-500">
                <span className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                  <svg
                    className="w-3.5 h-3.5 text-rose-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </span>

                <span className="truncate max-w-[220px]">{fullAddress}</span>

                <button
  onClick={() => {
    navigator.clipboard.writeText(fullAddress);
    toast.success("Address copied successfully!");
  }}
  className="shrink-0 p-1 rounded hover:bg-slate-100"
  title="Copy address"
>
  <svg
    className="w-4 h-4 text-slate-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 16h8M8 12h8m-8-4h8M8 4h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z"
    />
  </svg>
</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Personal details card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Personal Details
            </h2>
          </div>
          <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
            {[
              { label: "Marital Status", value: client.marital_status },
              { label: "Alternate Mobile", value: client.alternate_mobile },
              {
                label: "Anniversary",
                value: client.anniversary_date
                  ? formatDate(client.anniversary_date)
                  : null,
              },
              { label: "City", value: client.city },
              { label: "State", value: client.state },
              { label: "PIN Code", value: client.pin_code },
            ]
              .filter((i) => i.value)
              .map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                    {label}
                  </p>
                  <p className="text-[13px] font-bold text-slate-800">
                    {value}
                  </p>
                </div>
              ))}
          </div>
          {client.notes && (
            <div className="px-5 pb-4 pt-0">
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">
                  Notes
                </p>
                <p className="text-[13px] text-amber-900 font-medium">
                  {client.notes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Portal access card */}
        {client.clientloginid && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-slate-900 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Portal Access
                </h2>
              </div>
<button
  onClick={async () => {
    try {
      await copyAllCredentials();
      toast.success("Credentials copied successfully!");
    } catch {
      toast.error("Failed to copy credentials");
    }
  }}
  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
>
  Copy all
</button>
            </div>
            <div className="px-5 py-4 grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Login ID</label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={client.clientloginid || ""}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-bold text-slate-700 outline-none"
                  />
                  <button
                    onClick={() =>
                      copyToClipboard(
                        client.clientloginid || "",
                        "Login ID copied!",
                      )
                    }
                    className="w-9 h-9 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      readOnly
                      value={client.temporarypassword || ""}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-9 py-2.5 text-[13px] font-bold text-slate-700 outline-none tracking-widest"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        {showPassword ? (
                          <>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </>
                        ) : (
                          <>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        client.temporarypassword || "",
                        "Password copied!",
                      )
                    }
                    className="w-9 h-9 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={regeneratePassword}
                    disabled={regenerating}
                    className="w-9 h-9 flex items-center justify-center bg-red-50 border border-red-100 rounded-xl text-red-500 hover:bg-red-100 transition-colors shrink-0 disabled:opacity-50"
                    title="Regenerate"
                  >
                    <svg
                      className={`w-3.5 h-3.5 ${regenerating ? "animate-spin" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-2xl w-fit">
          {[
            { key: "docs", label: `Documents`, count: docs.length },
            { key: "family", label: `Family`, count: family.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.key
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {tab.label}
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                  activeTab === tab.key
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Documents tab */}
        {activeTab === "docs" && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Documents
              </h2>
              <button
                onClick={() => setShowDocModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[11px] font-bold hover:bg-blue-600 transition-all active:scale-95"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Upload
              </button>
            </div>
            {docs.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-300">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-[13px] font-bold text-slate-400 mb-2">
                  No documents yet
                </p>
                <button
                  onClick={() => setShowDocModal(true)}
                  className="text-[12px] text-blue-600 font-bold hover:underline"
                >
                  Upload first document →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors group"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black text-[10px] shrink-0 ${docColor(doc.file_type)}`}
                    >
                      {doc.file_type}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] text-slate-400 font-medium truncate">
                          {doc.file_name}
                        </p>
                        {doc.family_member_id && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                            {family.find((f) => f.id === doc.family_member_id)
                              ?.name || "Family"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 hidden sm:block">
                      <p className="text-[11px] font-bold text-slate-400">
                        {formatSize(doc.file_size)}
                      </p>
                      <p className="text-[10px] text-slate-300 font-medium">
                        {formatDate(doc.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <a
                        href={
                          doc.file_url && doc.file_url.length > 5
                            ? doc.file_url
                            : "#"
                        }
                        download={doc.file_name}
                        target="_blank"
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      </a>
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Family tab */}
        {activeTab === "family" && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Family Members
              </h2>
              <button
                onClick={() => setShowFamilyModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[11px] font-bold hover:bg-blue-600 transition-all active:scale-95"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add
              </button>
            </div>
            {family.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-300">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <p className="text-[13px] font-bold text-slate-400 mb-2">
                  No family members yet
                </p>
                <button
                  onClick={() => setShowFamilyModal(true)}
                  className="text-[12px] text-blue-600 font-bold hover:underline"
                >
                  Add first family member →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {family.map((fm) => (
                  <div
                    key={fm.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors group"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getGradient(fm.name)} flex items-center justify-center text-white font-black text-sm shrink-0`}
                    >
                      {fm.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {fm.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                          {fm.relationship}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Age {getAge(fm.date_of_birth)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          · {formatDate(fm.date_of_birth)}
                        </span>
                        {fm.phone && (
                          <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
                            · {fm.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                        {
                          docs.filter((d) => d.family_member_id === fm.id)
                            .length
                        }{" "}
                        docs
                      </span>
                      <button
                        onClick={() => deleteFamilyMember(fm.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Edit Client Modal ────────────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-3xl sm:rounded-t-2xl">
              <div>
                <h2 className="text-[15px] font-black text-slate-900">
                  Edit Client
                </h2>
                <p className="text-[11px] text-slate-400 font-medium">
                  Update client information
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Profile pic section */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                {editForm.profilePic ? (
                  <img
                    src={editForm.profilePic}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover ring-2 ring-white shadow-md shrink-0"
                  />
                ) : (
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getGradient(editForm.name || "A")} flex items-center justify-center text-white font-black text-2xl ring-2 ring-white shadow-md shrink-0`}
                  >
                    {editForm.name ? editForm.name[0].toUpperCase() : "?"}
                  </div>
                )}
                <div>
                  <p className="text-[12px] font-black text-slate-700 mb-2">
                    Profile Photo
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => picInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition-all"
                    >
                      {editForm.profilePic ? "Change" : "Upload"}
                    </button>
                    {editForm.profilePic && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditForm((p) => ({ ...p, profilePic: "" }));
                          if (picInputRef.current)
                            picInputRef.current.value = "";
                        }}
                        className="px-3 py-1.5 rounded-lg border border-red-100 bg-red-50 text-[11px] font-bold text-red-600 hover:bg-red-100 transition-all"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    JPG, PNG or WEBP · Max 2 MB
                  </p>
                </div>
                <input
                  ref={picInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleEditPicChange}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>First Name</label>
                  <input
                    type="text"
                    value={editForm.name || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Surname</label>
                  <input
                    type="text"
                    value={editForm.surname || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, surname: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Mobile</label>
                  <input
                    type="tel"
                    value={editForm.phone || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        phone: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    maxLength={10}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Alternate Mobile</label>
                  <input
                    type="tel"
                    value={editForm.alternate_mobile || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        alternate_mobile: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    maxLength={10}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input
                  type="email"
                  value={editForm.email || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Date of Birth</label>
                  <input
                    type="date"
                    value={editForm.date_of_birth || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        date_of_birth: e.target.value,
                      })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Anniversary Date</label>
                  <input
                    type="date"
                    value={editForm.anniversary_date || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        anniversary_date: e.target.value,
                      })
                    }
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Gender</label>
                  <select
                    value={editForm.gender || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, gender: e.target.value })
                    }
                    className={inputCls}
                  >
                    <option value="">Select...</option>
                    {["Male", "Female", "Other", "Prefer not to say"].map(
                      (g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ),
                    )}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Marital Status</label>
                  <select
                    value={editForm.marital_status || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        marital_status: e.target.value,
                      })
                    }
                    className={inputCls}
                  >
                    <option value="">Select...</option>
                    {["Single", "Married", "Divorced", "Widowed"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Occupation</label>
                <input
                  type="text"
                  value={editForm.occupation || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, occupation: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Address</label>
                <textarea
                  value={editForm.address || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                  className={inputCls}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>City</label>
                  <input
                    type="text"
                    value={editForm.city || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, city: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>State</label>
                  <select
                    value={editForm.state || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, state: e.target.value })
                    }
                    className={inputCls}
                  >
                    <option value="">Select State</option>
                    {[
                      "Andhra Pradesh",
                      "Assam",
                      "Bihar",
                      "Chandigarh",
                      "Chhattisgarh",
                      "Delhi",
                      "Goa",
                      "Gujarat",
                      "Haryana",
                      "Himachal Pradesh",
                      "Jammu and Kashmir",
                      "Jharkhand",
                      "Karnataka",
                      "Kerala",
                      "Madhya Pradesh",
                      "Maharashtra",
                      "Manipur",
                      "Meghalaya",
                      "Mizoram",
                      "Nagaland",
                      "Odisha",
                      "Puducherry",
                      "Punjab",
                      "Rajasthan",
                      "Sikkim",
                      "Tamil Nadu",
                      "Telangana",
                      "Tripura",
                      "Uttar Pradesh",
                      "Uttarakhand",
                      "West Bengal",
                    ].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>PIN Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={editForm.pin_code || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        pin_code: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select
                  value={editForm.status || "Active"}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className={inputCls}
                >
                  {["Active", "Pending", "Inactive"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Notes</label>
                <textarea
                  value={editForm.notes || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  className={inputCls}
                  rows={3}
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {saving ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Family Modal ─────────────────────────────────────── */}
      {showFamilyModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowFamilyModal(false)}
          />
          <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-[15px] font-black text-slate-900">
                Add Family Member
              </h2>
              <button
                onClick={() => setShowFamilyModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className={labelCls}>Full Name *</label>
                <input
                  type="text"
                  value={familyForm.name}
                  onChange={(e) =>
                    setFamilyForm({ ...familyForm, name: e.target.value })
                  }
                  className={inputCls}
                  placeholder="e.g. Priya Sharma"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Date of Birth *</label>
                  <input
                    type="date"
                    value={familyForm.date_of_birth}
                    onChange={(e) =>
                      setFamilyForm({
                        ...familyForm,
                        date_of_birth: e.target.value,
                      })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Relationship *</label>
                  <select
                    value={familyForm.relationship}
                    onChange={(e) =>
                      setFamilyForm({
                        ...familyForm,
                        relationship: e.target.value,
                      })
                    }
                    className={inputCls}
                  >
                    <option value="">Select...</option>
                    {[
                      "Wife",
                      "Husband",
                      "Son",
                      "Daughter",
                      "Father",
                      "Mother",
                      "Brother",
                      "Sister",
                      "Other",
                    ].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input
                  type="tel"
                  value={familyForm.phone}
                  onChange={(e) =>
                    setFamilyForm({ ...familyForm, phone: e.target.value })
                  }
                  className={inputCls}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setShowFamilyModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={addFamilyMember}
                disabled={
                  saving ||
                  !familyForm.name ||
                  !familyForm.date_of_birth ||
                  !familyForm.relationship
                }
                className="flex-1 py-3 rounded-xl bg-slate-900 text-white text-[13px] font-bold hover:bg-blue-600 transition-all disabled:opacity-50 active:scale-95"
              >
                {saving ? "Saving…" : "Add Member"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Upload Document Modal ────────────────────────────────── */}
      {showDocModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowDocModal(false)}
          />
          <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-[15px] font-black text-slate-900">
                Upload Document
              </h2>
              <button
                onClick={() => setShowDocModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className={labelCls}>Document Name *</label>
                <input
                  type="text"
                  value={docForm.name}
                  onChange={(e) =>
                    setDocForm({ ...docForm, name: e.target.value })
                  }
                  className={inputCls}
                  placeholder="e.g. LIC Term Policy"
                />
              </div>
              <div>
                <label className={labelCls}>Category *</label>
                <select
                  value={docForm.category}
                  onChange={(e) =>
                    setDocForm({ ...docForm, category: e.target.value })
                  }
                  className={inputCls}
                >
                  <option value="">Select Category...</option>
                  {[
                    "Policy Documents",
                    "KYC / Identity",
                    "Health Records",
                    "Vehicle RC / Insurance",
                    "Financial / Tax",
                    "Others",
                  ].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Attach File *</label>
                <input
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setSelectedDocFile(f);
                      setDocForm({
                        ...docForm,
                        file_name: f.name,
                        file_size: f.size,
                      });
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-slate-700 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white cursor-pointer text-[13px]"
                />
                {docForm.file_name && (
                  <p className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {docForm.file_name} ·{" "}
                    {(docForm.file_size / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>
              <div>
                <label className={labelCls}>Assign to Family Member</label>
                <select
                  value={docForm.family_member_id}
                  onChange={(e) =>
                    setDocForm({ ...docForm, family_member_id: e.target.value })
                  }
                  className={inputCls}
                >
                  <option value="">Client (Self)</option>
                  {family.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.relationship})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setShowDocModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={addDocument}
                disabled={
                  saving ||
                  !docForm.name ||
                  !selectedDocFile ||
                  !docForm.category
                }
                className="flex-1 py-3 rounded-xl bg-slate-900 text-white text-[13px] font-bold hover:bg-blue-600 transition-all disabled:opacity-50 active:scale-95"
              >
                {saving ? "Uploading…" : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
