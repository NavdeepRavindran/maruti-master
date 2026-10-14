"use client";

import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import {
  capitalizeWords,
  sanitizeAlphabetsOnly,
  formatFamilyName,
  FAMILY_RELATIONSHIPS,
  formatDate,
  getAge,
  validateDateRange,
} from "@/lib/formatUtils";
import { validateEmail } from "@/lib/emailValidator";


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
  plain_password?: string;
  profile_pic?: string;
}

interface FamilyMember {
  id: string;
  client_id: string;
  name: string;
  date_of_birth: string;
  relationship: string;
  phone?: string;
  occupation?: string;
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

const labelCls = "block text-xs font-semibold text-[#6B7280] mb-1.5";
const inputCls =
  "w-full px-4 py-3 rounded-2xl bg-[#F7F9FC] border border-slate-200 focus:bg-white focus:border-[#0E7AC7] focus:ring-2 focus:ring-[#DDF3FF] outline-none transition-all text-[13px] font-semibold text-[#1F2937] placeholder:text-slate-400 placeholder:font-normal";

const avatarGradients = [
  "from-[#0E7AC7] to-[#005A87]",
  "from-[#7C6CF6] to-[#5B4FD1]",
  "from-[#EF4444] to-[#B91C1C]",
  "from-[#F59E0B] to-[#C2740A]",
  "from-[#14B86A] to-[#0E8F52]",
  "from-[#06B6D4] to-[#0E7AC7]",
  "from-[#6366F1] to-[#4338CA]",
  "from-[#EC4899] to-[#BE185D]",
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
      className={`${sizeMap[size]} rounded-2xl bg-gradient-to-br ${getGradient(name)} flex items-center justify-center text-white font-bold shrink-0 ring-4 ring-white shadow-lg`}
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
  const supabase = createClient();

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
    occupation: "",
  });
  const [docFilterMember, setDocFilterMember] = useState<string>("all");
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
    Partial<ClientData & { profile_pic?: string }>
  >({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"docs" | "family">("docs");
  const [showPassword, setShowPassword] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const picInputRef = useRef<HTMLInputElement>(null);
  const directPicInputRef = useRef<HTMLInputElement>(null);

  // Password change modal state (Item 8)
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // In-App Document Viewer state (Item 9)
  const [viewingDoc, setViewingDoc] = useState<DocData | null>(null);

  // Family details view and edit state (Item 5 & 11)
  const [viewingFamilyMember, setViewingFamilyMember] = useState<FamilyMember | null>(null);
  const [editingFamilyMember, setEditingFamilyMember] = useState<FamilyMember | null>(null);
  const [savingFamilyEdit, setSavingFamilyEdit] = useState(false);

  // In-modal error banners (displayed directly on the same layer)
  const [editModalError, setEditModalError] = useState<string | null>(null);
  const [familyModalError, setFamilyModalError] = useState<string | null>(null);
  const [editFamilyModalError, setEditFamilyModalError] = useState<string | null>(null);

  // Discard Confirmation Modal state (prevents accidental closing on outside clicks)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [discardTarget, setDiscardTarget] = useState<"editClient" | "addFamily" | "editFamily" | null>(null);

  const requestCloseEditModal = () => {
    setDiscardTarget("editClient");
    setShowDiscardConfirm(true);
  };

  const requestCloseFamilyModal = () => {
    if (familyForm.name || familyForm.date_of_birth || familyForm.phone || familyForm.occupation) {
      setDiscardTarget("addFamily");
      setShowDiscardConfirm(true);
    } else {
      setShowFamilyModal(false);
      setFamilyModalError(null);
    }
  };

  const requestCloseEditFamilyModal = () => {
    setDiscardTarget("editFamily");
    setShowDiscardConfirm(true);
  };

  const handleConfirmDiscard = () => {
    if (discardTarget === "editClient") {
      setShowEditModal(false);
      setEditModalError(null);
    } else if (discardTarget === "addFamily") {
      setShowFamilyModal(false);
      setFamilyModalError(null);
    } else if (discardTarget === "editFamily") {
      setEditingFamilyMember(null);
      setEditFamilyModalError(null);
    }
    setShowDiscardConfirm(false);
    setDiscardTarget(null);
  };

  useEffect(() => {
    fetchClient();
  }, [id]);

  // ── Helper: always attach the current Supabase session token ────────────
  async function authHeaders(json = true) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const headers: HeadersInit = {};
    if (json) headers["Content-Type"] = "application/json";
    if (session) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }
    return headers;
  }

  async function fetchClient() {
    setLoading(true);
    try {
      const headers = await authHeaders(false);
      const res = await fetch(`/api/clients/${id}`, { headers });
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
      profile_pic: client.profile_pic || "",
    });
    setEditModalError(null);
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
      setEditForm((prev) => ({ ...prev, profile_pic: reader.result as string }));
    reader.readAsDataURL(file);
  }

  async function saveEdit() {
    setEditModalError(null);
    if (editForm.date_of_birth) {
      const dobVal = validateDateRange(editForm.date_of_birth, "Date of Birth");
      if (!dobVal.isValid) {
        setEditModalError(dobVal.error!);
        toast.error(dobVal.error!);
        return;
      }
    }
    if (editForm.anniversary_date) {
      const annivVal = validateDateRange(editForm.anniversary_date, "Anniversary date");
      if (!annivVal.isValid) {
        setEditModalError(annivVal.error!);
        toast.error(annivVal.error!);
        return;
      }
      if (editForm.date_of_birth && editForm.anniversary_date < editForm.date_of_birth) {
        const err = "Anniversary date cannot be earlier than Date of Birth.";
        setEditModalError(err);
        toast.error(err);
        return;
      }
    }
    if (editForm.email && editForm.email.trim()) {
      const emailCheck = validateEmail(editForm.email);
      if (!emailCheck.isValid) {
        const err = emailCheck.error || "Please enter a valid email address.";
        setEditModalError(err);
        toast.error(err);
        return;
      }
    }
    setSaving(true);
    try {
      const headers = await authHeaders(true);
      const res = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          ...editForm,
          surname: (editForm.surname || "").trim().toUpperCase(),
          profile_pic: editForm.profile_pic,
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || `Update failed (${res.status})`);
      }
      const data = await res.json();
      if (data.client) setClient(data.client);
      setShowEditModal(false);
      setEditModalError(null);
      toast.success("Profile updated successfully!");
      fetchClient();
    } catch (e: any) {
      const errMsg = e?.message || "Failed to update client.";
      setEditModalError(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  }

  // Direct photo upload handler (Item 3)
  async function handleDirectPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = reader.result as string;
      try {
        const headers = await authHeaders(true);
        const res = await fetch(`/api/clients/${id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ profile_pic: b64 }),
        });
        if (res.ok) {
          setClient((prev: any) => (prev ? { ...prev, profile_pic: b64 } : prev));
          toast.success("Profile photo updated successfully!");
        } else {
          toast.error("Failed to update photo.");
        }
      } catch {
        toast.error("Failed to update photo.");
      }
    };
    reader.readAsDataURL(file);
  }

  // Custom password change handler (Item 8)
  async function handleSavePassword() {
    if (!newPasswordInput.trim() || newPasswordInput.trim().length < 4) {
      alert("Password must be at least 4 characters long.");
      return;
    }
    setSavingPassword(true);
    try {
      const headers = await authHeaders(true);
      const res = await fetch(`/api/clients/${id}/password`, {
        method: "POST",
        headers,
        body: JSON.stringify({ password: newPasswordInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      setClient((prev: any) =>
        prev ? { ...prev, plain_password: newPasswordInput.trim(), temporaryPassword: newPasswordInput.trim() } : prev
      );
      setShowPasswordModal(false);
      setNewPasswordInput("");
      toast.success("Client password changed successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  }

  // Edit Family Member handler (Item 5 & 11)
  async function handleSaveFamilyEdit() {
    setEditFamilyModalError(null);
    if (!editingFamilyMember || !editingFamilyMember.name.trim()) {
      const err = "Family member name is required.";
      setEditFamilyModalError(err);
      toast.error(err);
      return;
    }
    if (editingFamilyMember.date_of_birth) {
      const dobCheck = validateDateRange(editingFamilyMember.date_of_birth, "Date of Birth");
      if (!dobCheck.isValid) {
        setEditFamilyModalError(dobCheck.error!);
        toast.error(dobCheck.error!);
        return;
      }
    }
    setSavingFamilyEdit(true);
    try {
      const headers = await authHeaders(true);
      const res = await fetch(`/api/clients/${id}/family/${editingFamilyMember.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          name: formatFamilyName(editingFamilyMember.name),
          relationship: editingFamilyMember.relationship,
          date_of_birth: editingFamilyMember.date_of_birth,
          phone: editingFamilyMember.phone,
          occupation: editingFamilyMember.occupation || "",
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Failed to update family member.");
      }
      toast.success("Family member updated successfully!");
      setEditingFamilyMember(null);
      setEditFamilyModalError(null);
      fetchClient();
    } catch (err: any) {
      const errMsg = err?.message || "Failed to update family member.";
      setEditFamilyModalError(errMsg);
      toast.error(errMsg);
    } finally {
      setSavingFamilyEdit(false);
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
      const headers = await authHeaders(true);
      const res = await fetch(`/api/clients/${id}/regenerate`, {
        method: "POST",
        headers,
      });
      const data = await res.json();
      if (data.client) {
        setClient({
          ...client,
           plain_password: data.client.temporaryPassword,
        });
        toast.success("Password regenerated.");
      }
    } catch {
      toast.error("Failed to regenerate password.");
    } finally {
      setRegenerating(false);
    }
  }

  function copyToClipboard(text: string, msg: string) {
    navigator.clipboard.writeText(text);
    if (msg) toast.success(msg);
  }
  function copyAllCredentials() {
    if (!client) return;
    const text = `Client Portal Access\n\nLogin ID: ${client.clientloginid || "N/A"}\nPassword: ${client.plain_password || "N/A"}\nPortal URL: ${window.location.origin}/client-login`;
    copyToClipboard(text, "");
  }

  const formatSize = (b: number) =>
    b < 1048576
      ? (b / 1024).toFixed(1) + " KB"
      : (b / 1048576).toFixed(1) + " MB";
  const docColor = (t: string) =>
    ({
      PDF: "bg-[#EF4444]/10 text-[#EF4444]",
      IMG: "bg-[#F59E0B]/10 text-[#F59E0B]",
      DOC: "bg-[#7C6CF6]/10 text-[#7C6CF6]",
    })[t] || "bg-[#14B86A]/10 text-[#14B86A]";

  async function addFamilyMember() {
    setFamilyModalError(null);
    if (
      !familyForm.name ||
      !familyForm.date_of_birth ||
      !familyForm.relationship
    ) {
      const err = "Please provide Name, Date of Birth, and Relationship.";
      setFamilyModalError(err);
      toast.error(err);
      return;
    }
    const dobCheck = validateDateRange(familyForm.date_of_birth, "Date of Birth");
    if (!dobCheck.isValid) {
      setFamilyModalError(dobCheck.error!);
      toast.error(dobCheck.error!);
      return;
    }
    setSaving(true);
    try {
      const headers = await authHeaders(true);
      const res = await fetch(`/api/clients/${id}/family`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...familyForm,
          name: formatFamilyName(familyForm.name),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to add family member (${res.status})`);
      }
      const data = await res.json();
      setShowFamilyModal(false);
      setFamilyForm({
        name: "",
        date_of_birth: "",
        relationship: "",
        phone: "",
        occupation: "",
      });
      toast.success("Family member added.");
      if (data.family_member) {
        setFamily((prev) => [
          ...prev.filter((f) => f.id !== data.family_member.id),
          data.family_member,
        ]);
      }
      setActiveTab("family");
      fetchClient();
    } catch (err: any) {
      toast.error(err?.message || "Failed to add family member.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteFamilyMember(fid: string) {
    if (!confirm("Delete this family member and their documents?")) return;
    try {
      const headers = await authHeaders(false);
      const res = await fetch(`/api/clients/${id}/family/${fid}`, { method: "DELETE", headers });
      if (res.ok) {
        setFamily((prev) => prev.filter((f) => f.id !== fid));
        toast.success("Family member removed.");
      }
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
      const authOnly = await authHeaders(false);
      const formData = new FormData();
      formData.append("file", selectedDocFile);
      formData.append("client_id", id);
      formData.append("name", docForm.name);
      formData.append("category", docForm.category);
      if (docForm.family_member_id)
        formData.append("family_member_id", docForm.family_member_id);
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: authOnly,
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
      toast.success("Document uploaded.");
      fetchClient();
    } catch (e: any) {
      toast.error("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  }

async function deleteDocument(did: string) {
  if (!confirm("Delete this document?")) return;
  try {
    const headers = await authHeaders(false);
    const res = await fetch(`/api/documents/${did}`, { method: "DELETE", headers });
    if (!res.ok) {
      const e = await res.json();
      toast.error("Delete failed: " + (e.error || res.status));
      return;
    }
    fetchClient();
  } catch (e: any) {
    toast.error("Delete failed: " + e.message);
  }
}

  if (loading)
    return (
      <div className="flex items-center justify-center py-40">
        <svg className="w-8 h-8 animate-spin text-[#005A87]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );

  if (!client)
    return (
      <div className="py-32 text-center">
        <p className="text-[#6B7280] font-semibold mb-4">Client not found.</p>
        <Link href="/dashboard/clients" className="text-[#005A87] font-bold">
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
    <div className="min-h-screen bg-[#F7F9FC]">
      {/* ── Top nav bar ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/dashboard/clients"
          className="flex items-center gap-2 text-[13px] font-bold text-[#6B7280] hover:text-[#1F2937] transition-colors"
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
          <span className="hidden sm:inline">Clients</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              if (!client) return;
              const isInactive = client.status === "Inactive";
              const newStatus = isInactive ? "Active" : "Inactive";
              if (!confirm(isInactive ? `Reactivate client ${client.name}?` : `Deactivate client ${client.name}?`)) return;
              try {
                const headers = await authHeaders(true);
                const res = await fetch(`/api/clients/${id}`, {
                  method: "PUT",
                  headers,
                  body: JSON.stringify({ status: newStatus }),
                });
                if (res.ok) {
                  setClient((prev) => (prev ? { ...prev, status: newStatus } : prev));
                  toast.success(isInactive ? "Client reactivated!" : "Client marked as Inactive!");
                  fetchClient();
                }
              } catch {
                toast.error("Failed to update status");
              }
            }}
            className={`px-3.5 h-10 rounded-xl text-xs font-bold transition-all ${
              client?.status === "Inactive"
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {client?.status === "Inactive" ? "Activate" : "Deactivate"}
          </button>
          <button
            onClick={() => setShowDocModal(true)}
            className="flex items-center gap-1.5 px-3.5 h-10 bg-[#005A87] text-white rounded-xl text-xs font-bold hover:bg-[#00476b] transition-all active:scale-95"
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
            <span className="hidden sm:inline">Upload</span>
          </button>
          <button
            onClick={openEdit}
            className="flex items-center gap-1.5 px-3.5 h-10 bg-white border border-slate-200 text-[#1F2937] rounded-xl text-xs font-bold hover:border-[#0E7AC7] hover:text-[#005A87] transition-all"
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

      {/* ── CKYC Pending Warning Banner ── */}
      {client &&
        !docs.some(
          (d) =>
            d.category === "KYC / Identity" ||
            /ckyc|kyc|aadhaar|pan/i.test(d.name) ||
            /ckyc|kyc|aadhaar|pan/i.test(d.file_name)
        ) &&
        client.status !== "Inactive" && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 sm:px-6 py-3">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center text-sm font-bold shrink-0">
                  ⚠️
                </span>
                <div>
                  <p className="text-xs font-bold text-amber-900">
                    CKYC Documents Pending — Automatic Pending Status
                  </p>
                  <p className="text-[11px] text-amber-700">
                    Client CKYC / Identity document (Aadhaar, PAN) has not been uploaded yet. Upload KYC document to mark client Active.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setDocForm({
                    name: `${client.name} Aadhaar / CKYC Document`,
                    file_name: "",
                    file_size: 0,
                    file_url: "",
                    family_member_id: "",
                    category: "KYC / Identity",
                  });
                  setShowDocModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shrink-0 shadow-xs"
              >
                + Upload CKYC Now
              </button>
            </div>
          </div>
        )}

      {/* ── Hero / Profile Header ────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Mobile: stacked, Desktop: row */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            {/* Avatar with Direct Photo Upload (Item 3) */}
            <div className="shrink-0 relative group">
              {client.profile_pic ? (
                <img
                  src={client.profile_pic}
                  alt={fullName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-[22px] object-cover ring-4 ring-white shadow-xl"
                />
              ) : (
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-[22px] bg-gradient-to-br ${getGradient(client.name)} flex items-center justify-center text-white font-bold text-3xl sm:text-4xl ring-4 ring-white shadow-xl`}
                >
                  {fullName[0]?.toUpperCase()}
                </div>
              )}
              {/* Photo Upload Overlay Button */}
              <button
                type="button"
                onClick={() => directPicInputRef.current?.click()}
                className="absolute inset-0 rounded-[22px] bg-black/0 group-hover:bg-black/50 flex flex-col items-center justify-center transition-all opacity-0 group-hover:opacity-100 text-white cursor-pointer"
                title="Change Profile Photo"
              >
                <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[10px] font-bold">Upload</span>
              </button>
              <input
                ref={directPicInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleDirectPhotoUpload}
                className="hidden"
              />
            </div>

            {/* Name + meta (Item 1 & Item 6) */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-baseline gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-[28px] font-bold text-[#1F2937]">
                      {capitalizeWords(client.name)}
                    </h1>
                    {client.surname && (
                      <span className="text-2xl sm:text-[28px] font-bold text-[#005A87]">
                        {(client.surname || "").toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-[#6B7280] flex-wrap">
                    <span>First Name: <strong className="text-[#1F2937]">{capitalizeWords(client.name)}</strong></span>
                    {client.surname && (
                      <>
                        <span>•</span>
                        <span>Surname: <strong className="text-[#005A87]">{(client.surname || "").toUpperCase()}</strong></span>
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                        client.status === "Active"
                          ? "bg-[#14B86A]/10 text-[#14B86A]"
                          : client.status === "Inactive"
                          ? "bg-slate-100 text-slate-600 border border-slate-200"
                          : "bg-[#F59E0B]/10 text-[#F59E0B]"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          client.status === "Active"
                            ? "bg-[#14B86A]"
                            : client.status === "Inactive"
                            ? "bg-slate-400"
                            : "bg-[#F59E0B]"
                        }`}
                      />
                      {client.status}
                    </span>
                    {client.gender && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#F7F9FC] text-[#6B7280]">
                        {client.gender}
                      </span>
                    )}
                    {client.occupation && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#F7F9FC] text-[#6B7280] truncate max-w-[140px]">
                        {client.occupation}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick stats row */}
              <div className="flex flex-wrap gap-4 sm:gap-6 mt-5">
                <div>
                  <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
                    Age
                  </p>
                  <p className="text-[16px] font-bold text-[#1F2937] mt-0.5">
                    {getAge(client.date_of_birth)} yrs
                  </p>
                </div>
                <div className="w-px bg-slate-100" />
                <div>
                  <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
                    DOB
                  </p>
                  <p className="text-[16px] font-bold text-[#1F2937] mt-0.5">
                    {formatDate(client.date_of_birth)}
                  </p>
                </div>
                <div className="w-px bg-slate-100" />
                <div>
                  <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
                    Documents
                  </p>
                  <p className="text-[16px] font-bold text-[#7C6CF6] mt-0.5">
                    {docs.length}
                  </p>
                </div>
                <div className="w-px bg-slate-100" />
                <div>
                  <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
                    Family
                  </p>
                  <p className="text-[16px] font-bold text-[#0E7AC7] mt-0.5">
                    {family.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact strip */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-3 sm:gap-4">
            <a
              href={`tel:${client.phone}`}
              className="flex items-center gap-2 text-[13px] font-semibold text-[#1F2937] hover:text-[#005A87] transition-colors"
            >
              <span className="w-9 h-9 rounded-xl bg-[#DDF3FF] flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 text-[#005A87]"
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
                className="flex items-center gap-2 text-[13px] font-semibold text-[#1F2937] hover:text-[#005A87] transition-colors truncate"
              >
                <span className="w-9 h-9 rounded-xl bg-[#7C6CF6]/10 flex items-center justify-center shrink-0">
                  <svg
                    className="w-4 h-4 text-[#7C6CF6]"
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
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#6B7280] basis-full sm:basis-auto">
                <span className="w-9 h-9 rounded-xl bg-[#EF4444]/10 flex items-center justify-center shrink-0">
                  <svg
                    className="w-4 h-4 text-[#EF4444]"
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

                <span className="break-words text-[#1F2937] leading-relaxed">{fullAddress}</span>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(fullAddress);
                    toast.success("Address copied successfully!");
                  }}
                  className="shrink-0 p-1.5 rounded-lg hover:bg-[#F7F9FC]"
                  title="Copy address"
                >
                  <svg
                    className="w-4 h-4 text-[#6B7280]"
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4 sm:space-y-5">
        {/* Personal details card */}
        <div className="bg-white rounded-[22px] border border-slate-100 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">
              Personal Details
            </h2>
            {client.notes && client.notes.includes("Allotment:") && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Re-entry Allotment Active
              </span>
            )}
          </div>
          <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
            {[
              { label: "First Name", value: capitalizeWords(client.name) },
              { label: "Surname", value: (client.surname || "").toUpperCase() || "—" },
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
              { label: "Full Address", value: fullAddress || "—" },
            ]
              .filter((i) => i.value)
              .map(({ label, value }) => (
                <div key={label} className={label === "Full Address" ? "col-span-2 sm:col-span-3" : ""}>
                  <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1">
                    {label}
                  </p>
                  <p className="text-[13px] font-bold text-[#1F2937] break-words">
                    {value}
                  </p>
                </div>
              ))}
          </div>
          {client.notes && (
            <div className="px-5 pb-5 pt-0">
              <div className="bg-[#F59E0B]/10 rounded-2xl px-4 py-3">
                <p className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-widest mb-1">
                  Notes / Allotment Reminders
                </p>
                <p className="text-[13px] text-[#92640a] font-medium whitespace-pre-line">
                  {client.notes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Portal access card */}
        {client.clientloginid && (
          <div className="bg-white rounded-[22px] border border-slate-100 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#005A87] flex items-center justify-center">
                  <svg
                    className="w-3.5 h-3.5 text-white"
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
                <h2 className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">
                  Portal Access
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setNewPasswordInput("");
                    setShowPasswordModal(true);
                  }}
                  className="text-xs font-bold text-[#0E7AC7] hover:underline transition-colors flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Change Password
                </button>
                <button
                  onClick={async () => {
                    try {
                      await copyAllCredentials();
                      toast.success("Credentials copied successfully!");
                    } catch {
                      toast.error("Failed to copy credentials");
                    }
                  }}
                  className="text-xs font-bold text-[#005A87] hover:text-[#0E7AC7] transition-colors"
                >
                  Copy all
                </button>
              </div>
            </div>
            <div className="px-5 py-4 grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Login ID</label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                      value={client.phone || ""}
                    className="flex-1 bg-[#F7F9FC] border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-bold text-[#1F2937] outline-none"
                  />
                  <button
                    onClick={() =>
                      copyToClipboard(
                        client.clientloginid || "",
                        "Login ID copied!",
                      )
                    }
                    className="w-10 h-10 flex items-center justify-center bg-[#F7F9FC] border border-slate-200 rounded-xl text-[#6B7280] hover:bg-slate-100 transition-colors shrink-0"
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
                      value={client.plain_password || ""}
                      className="w-full bg-[#F7F9FC] border border-slate-200 rounded-xl pl-3 pr-9 py-2.5 text-[13px] font-bold text-[#1F2937] outline-none tracking-widest"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937]"
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
                        client.plain_password || "",
                        "Password copied!",
                      )
                    }
                    className="w-10 h-10 flex items-center justify-center bg-[#F7F9FC] border border-slate-200 rounded-xl text-[#6B7280] hover:bg-slate-100 transition-colors shrink-0"
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
                    className="w-10 h-10 flex items-center justify-center bg-[#EF4444]/10 rounded-xl text-[#EF4444] hover:bg-[#EF4444]/15 transition-colors shrink-0 disabled:opacity-50"
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
        <div className="flex items-center gap-1 p-1.5 bg-white border border-slate-100 rounded-2xl w-fit shadow-sm">
          {[
            { key: "docs", label: `Documents`, count: docs.length },
            { key: "family", label: `Family`, count: family.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 sm:px-5 h-10 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.key
                  ? "bg-[#005A87] text-white shadow-sm"
                  : "text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F7F9FC]"
              }`}
            >
              {tab.label}
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                  activeTab === tab.key
                    ? "bg-white/20 text-white"
                    : "bg-[#F7F9FC] text-[#6B7280]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Documents tab */}
        {activeTab === "docs" && (
          <div className="bg-white rounded-[22px] border border-slate-100 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">
                  Documents
                </h2>
                <p className="text-[11px] text-[#6B7280]">
                  Separate documents for {client.name} and each family member
                </p>
              </div>
              <button
                onClick={() => {
                  setDocForm({
                    name: "",
                    file_name: "",
                    file_size: 0,
                    file_url: "",
                    family_member_id: docFilterMember !== "all" && docFilterMember !== "client" ? docFilterMember : "",
                    category: "",
                  });
                  setShowDocModal(true);
                }}
                className="flex items-center gap-1.5 px-3.5 h-9 bg-[#005A87] text-white rounded-xl text-xs font-bold hover:bg-[#00476b] transition-all active:scale-95"
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
                Upload Document
              </button>
            </div>

            {/* Separate Document Filter Bar by Member */}
            <div className="px-5 py-2.5 bg-[#F7F9FC] border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
              <span className="text-[11px] font-bold text-[#6B7280] shrink-0 mr-1">Filter By:</span>
              <button
                onClick={() => setDocFilterMember("all")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  docFilterMember === "all"
                    ? "bg-[#005A87] text-white shadow-xs"
                    : "bg-white text-[#6B7280] hover:text-[#1F2937] border border-slate-200"
                }`}
              >
                All Documents ({docs.length})
              </button>
              <button
                onClick={() => setDocFilterMember("client")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  docFilterMember === "client"
                    ? "bg-[#005A87] text-white shadow-xs"
                    : "bg-white text-[#6B7280] hover:text-[#1F2937] border border-slate-200"
                }`}
              >
                Client: {capitalizeWords(client.name)} ({docs.filter((d) => !d.family_member_id).length})
              </button>
              {family.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setDocFilterMember(f.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    docFilterMember === f.id
                      ? "bg-[#7C6CF6] text-white shadow-xs"
                      : "bg-white text-[#6B7280] hover:text-[#1F2937] border border-slate-200"
                  }`}
                >
                  {f.name} ({docs.filter((d) => d.family_member_id === f.id).length})
                </button>
              ))}
            </div>

            {docs.length === 0 ? (
              <div className="py-16 text-center px-5">
                <div className="w-14 h-14 rounded-2xl bg-[#F7F9FC] flex items-center justify-center mx-auto mb-3 text-[#6B7280]">
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
                <p className="text-[13px] font-semibold text-[#1F2937] mb-2">
                  No documents uploaded yet
                </p>
                <button
                  onClick={() => setShowDocModal(true)}
                  className="text-xs text-[#005A87] font-bold hover:underline"
                >
                  Upload first document →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {docs
                  .filter((d) => {
                    if (docFilterMember === "all") return true;
                    if (docFilterMember === "client") return !d.family_member_id;
                    return d.family_member_id === docFilterMember;
                  })
                  .map((doc) => {
                    const famMember = family.find((f) => f.id === doc.family_member_id);
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F7F9FC] transition-colors group"
                      >
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-[10px] shrink-0 ${docColor(doc.file_type)}`}
                        >
                          {doc.file_type}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-[#1F2937] truncate group-hover:text-[#005A87] transition-colors">
                            {doc.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <p className="text-[11px] text-[#6B7280] font-medium truncate">
                              {doc.file_name}
                            </p>
                            {/* Distinct separate owner indicator */}
                            {famMember ? (
                              <span className="text-[10px] font-bold text-[#7C6CF6] bg-[#7C6CF6]/10 px-2 py-0.5 rounded shrink-0">
                                Family: {famMember.name}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-[#005A87] bg-[#DDF3FF] px-2 py-0.5 rounded shrink-0">
                                Self: {capitalizeWords(client.name)}
                              </span>
                            )}
                            {doc.category && (
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                                {doc.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0 hidden sm:block">
                          <p className="text-[11px] font-semibold text-[#6B7280]">
                            {formatSize(doc.file_size)}
                          </p>
                          <p className="text-[10px] text-slate-300 font-medium">
                            {formatDate(doc.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                          {/* View In-App */}
                          <button
                            type="button"
                            onClick={() => setViewingDoc(doc)}
                            title="View Document in App"
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#EEF6FF] text-[#0E7AC7] hover:bg-[#0E7AC7] hover:text-white transition-all"
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
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                              <circle
                                cx="12"
                                cy="12"
                                r="3"
                                stroke="currentColor"
                                strokeWidth={2}
                              />
                            </svg>
                          </button>

                          {/* Download */}
                          <a
                            href={doc.file_url && doc.file_url.length > 5 ? doc.file_url : "#"}
                            download={doc.file_name}
                            title="Download"
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#DDF3FF] text-[#005A87] hover:bg-[#005A87] hover:text-white transition-all"
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

                          {/* Delete */}
                          <button
                            onClick={() => deleteDocument(doc.id)}
                            title="Delete"
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#F7F9FC] text-[#6B7280] hover:bg-[#EF4444]/10 hover:text-[#EF4444] transition-all"
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
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Family tab */}
        {activeTab === "family" && (
          <div className="bg-white rounded-[22px] border border-slate-100 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">
                  Family Members
                </h2>
                <p className="text-[11px] text-[#6B7280]">
                  Manage family details, occupations, and separate document uploads
                </p>
              </div>
              <button
                onClick={() => setShowFamilyModal(true)}
                className="flex items-center gap-1.5 px-3.5 h-9 bg-[#005A87] text-white rounded-xl text-xs font-bold hover:bg-[#00476b] transition-all active:scale-95"
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
                Add Member
              </button>
            </div>
            {family.length === 0 ? (
              <div className="py-16 text-center px-5">
                <div className="w-14 h-14 rounded-2xl bg-[#F7F9FC] flex items-center justify-center mx-auto mb-3 text-[#6B7280]">
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
                <p className="text-[13px] font-semibold text-[#1F2937] mb-2">
                  No family members yet
                </p>
                <button
                  onClick={() => setShowFamilyModal(true)}
                  className="text-xs text-[#005A87] font-bold hover:underline"
                >
                  Add first family member →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {family.map((fm) => (
                  <div
                    key={fm.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 hover:bg-[#F7F9FC] transition-colors group"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getGradient(fm.name)} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                      >
                        {fm.name[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-[#1F2937] group-hover:text-[#005A87] transition-colors">
                          {formatFamilyName(fm.name)}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] font-bold text-[#7C6CF6] bg-[#7C6CF6]/10 px-2 py-0.5 rounded uppercase tracking-wider">
                            {fm.relationship}
                          </span>
                          <span className="text-[11px] text-[#6B7280] font-medium">
                            Age {getAge(fm.date_of_birth)} ({formatDate(fm.date_of_birth)})
                          </span>
                          {fm.occupation && (
                            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                              <span>💼</span> {fm.occupation}
                            </span>
                          )}
                          {fm.phone && (
                            <span className="text-[11px] text-[#6B7280] font-medium">
                              · {fm.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {/* Separate Upload Document for this Family Member */}
                      <button
                        type="button"
                        onClick={() => {
                          setDocForm({
                            name: `${formatFamilyName(fm.name)} Document`,
                            file_name: "",
                            file_size: 0,
                            file_url: "",
                            family_member_id: fm.id,
                            category: "KYC / Identity",
                          });
                          setShowDocModal(true);
                        }}
                        title={`Upload Document for ${formatFamilyName(fm.name)}`}
                        className="h-8 px-2.5 flex items-center gap-1 rounded-xl bg-[#DDF3FF] text-[#005A87] hover:bg-[#005A87] hover:text-white transition-all text-[11px] font-bold shadow-2xs"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Upload Doc
                      </button>

                      <span className="text-[10px] font-bold text-[#005A87] bg-[#DDF3FF] px-2 py-1 rounded-lg">
                        {
                          docs.filter((d) => d.family_member_id === fm.id)
                            .length
                        }{" "}
                        docs
                      </span>

                      {/* View Profile */}
                      <button
                        type="button"
                        onClick={() => setViewingFamilyMember(fm)}
                        title={`View ${formatFamilyName(fm.name)}'s Profile`}
                        className="h-8 px-2.5 flex items-center gap-1 rounded-xl bg-[#EEF6FF] text-[#0E7AC7] hover:bg-[#0E7AC7] hover:text-white transition-all text-[11px] font-bold"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Profile</span>
                      </button>

                      {/* Edit Family Details */}
                      <button
                        type="button"
                        onClick={() => setEditingFamilyMember(fm)}
                        title="Edit Family Member"
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => deleteFamilyMember(fm.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F7F9FC] text-[#6B7280] hover:bg-[#EF4444]/10 hover:text-[#EF4444] transition-all"
                        title="Delete Family Member"
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
        <div className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={requestCloseEditModal}
          />
          <div className="relative bg-white w-full sm:max-w-xl rounded-t-[28px] sm:rounded-[22px] shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-[28px] sm:rounded-t-[22px]">
              <div>
                <h2 className="text-[16px] font-bold text-[#1F2937]">
                  Edit Client
                </h2>
                <p className="text-xs text-[#6B7280] font-medium">
                  Update client information
                </p>
              </div>
              <button
                onClick={requestCloseEditModal}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F7F9FC] text-[#6B7280]"
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
              {/* Alert Message Banner (on the same layer) */}
              {editModalError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start justify-between gap-2.5 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">⚠️</span>
                    <div>
                      <p className="font-bold text-rose-900">Please correct the following:</p>
                      <p className="mt-0.5 text-rose-700 font-medium">{editModalError}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditModalError(null)}
                    className="w-5 h-5 rounded-lg text-rose-400 hover:text-rose-700 flex items-center justify-center shrink-0 font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Profile pic section */}
              <div className="flex items-center gap-4 p-4 bg-[#F7F9FC] rounded-2xl">
                {editForm.profile_pic ? (
                  <img
                    src={editForm.profile_pic}
                    alt="Preview"
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white shadow-md shrink-0"
                  />
                ) : (
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getGradient(editForm.name || "A")} flex items-center justify-center text-white font-bold text-2xl ring-2 ring-white shadow-md shrink-0`}
                  >
                    {editForm.name ? editForm.name[0].toUpperCase() : "?"}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-[#1F2937] mb-2">
                    Profile Photo
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => picInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-[#DDF3FF] text-[11px] font-bold text-[#005A87] hover:bg-[#c9ecff] transition-all"
                    >
                      {editForm.profile_pic ? "Change" : "Upload"}
                    </button>
                    {editForm.profile_pic && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditForm((p) => ({ ...p, profile_pic: "" }));
                          if (picInputRef.current)
                            picInputRef.current.value = "";
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#EF4444]/10 text-[11px] font-bold text-[#EF4444] hover:bg-[#EF4444]/15 transition-all"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-[#6B7280] mt-1.5">
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
                      setEditForm({ ...editForm, name: sanitizeAlphabetsOnly(e.target.value) })
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
                      setEditForm({ ...editForm, surname: sanitizeAlphabetsOnly(e.target.value).toUpperCase() })
                    }
                    placeholder="e.g. KUMAR"
                    className={`${inputCls} uppercase`}
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
                <label className={labelCls}>Email (Gmail)</label>
                <input
                  type="email"
                  value={editForm.email || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className={`${inputCls} ${
                    editForm.email && !validateEmail(editForm.email).isValid
                      ? "!border-rose-400 !bg-rose-50/20 text-rose-900"
                      : ""
                  }`}
                  placeholder="client@gmail.com"
                />
                {editForm.email && !validateEmail(editForm.email).isValid && (
                  <div className="mt-1.5 space-y-1">
                    <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1.5 bg-rose-50 border border-rose-200/80 rounded-xl px-2.5 py-1.5">
                      <svg className="w-3.5 h-3.5 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {validateEmail(editForm.email).error}
                    </p>
                    {validateEmail(editForm.email).suggestion && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditForm((prev) => ({
                            ...prev,
                            email: validateEmail(editForm.email).suggestion!,
                          }))
                        }
                        className="text-[11px] font-bold text-[#005A87] hover:underline flex items-center gap-1 px-1 py-0.5"
                      >
                        💡 Suggested: <span className="underline font-extrabold">{validateEmail(editForm.email).suggestion}</span> (Click to fix)
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Date of Birth</label>
                  <input
                    type="date"
                    min="1900-01-01"
                    max={new Date().toISOString().split("T")[0]}
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
                    min="1900-01-01"
                    max={new Date().toISOString().split("T")[0]}
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

            <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-slate-100 px-6 py-4 flex gap-3">
              <button
                onClick={requestCloseEditModal}
                className="flex-1 h-12 rounded-2xl border border-slate-200 text-[13px] font-bold text-[#1F2937] hover:bg-[#F7F9FC] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex-1 h-12 rounded-2xl bg-[#005A87] hover:bg-[#00476b] text-white text-[13px] font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm shadow-[#005A87]/20"
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
        <div className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={requestCloseFamilyModal}
          />
          <div className="relative bg-white w-full sm:max-w-md rounded-t-[28px] sm:rounded-[22px] shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#1F2937]">
                Add Family Member
              </h2>
              <button
                onClick={requestCloseFamilyModal}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F7F9FC] text-[#6B7280]"
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
              {/* Alert Message Banner (on the same layer) */}
              {familyModalError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start justify-between gap-2.5 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">⚠️</span>
                    <div>
                      <p className="font-bold text-rose-900">Please correct the following:</p>
                      <p className="mt-0.5 text-rose-700 font-medium">{familyModalError}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFamilyModalError(null)}
                    className="w-5 h-5 rounded-lg text-rose-400 hover:text-rose-700 flex items-center justify-center shrink-0 font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div>
                <label className={labelCls}>Full Name *</label>
                <input
                  type="text"
                  value={familyForm.name}
                  onChange={(e) =>
                    setFamilyForm({ ...familyForm, name: sanitizeAlphabetsOnly(e.target.value) })
                  }
                  onBlur={(e) =>
                    setFamilyForm({ ...familyForm, name: formatFamilyName(e.target.value) })
                  }
                  className={inputCls}
                  placeholder="e.g. Ramya"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Date of Birth *</label>
                  <input
                    type="date"
                    min="1900-01-01"
                    max={new Date().toISOString().split("T")[0]}
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
                    {FAMILY_RELATIONSHIPS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className={labelCls}>Occupation</label>
                  <input
                    type="text"
                    value={familyForm.occupation || ""}
                    onChange={(e) =>
                      setFamilyForm({ ...familyForm, occupation: e.target.value })
                    }
                    className={inputCls}
                    placeholder="e.g. Teacher, Engineer"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={requestCloseFamilyModal}
                className="flex-1 h-12 rounded-2xl border border-slate-200 text-[13px] font-bold text-[#1F2937] hover:bg-[#F7F9FC]"
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
                className="flex-1 h-12 rounded-2xl bg-[#005A87] text-white text-[13px] font-bold hover:bg-[#00476b] transition-all disabled:opacity-50 active:scale-95"
              >
                {saving ? "Saving…" : "Add Member"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Upload Document Modal ────────────────────────────────── */}
      {showDocModal && (
        <div className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowDocModal(false)}
          />
          <div className="relative bg-white w-full sm:max-w-md rounded-t-[28px] sm:rounded-[22px] shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-bold text-[#1F2937]">
                  Upload Document
                </h2>
                <p className="text-xs text-[#6B7280]">Upload client or family member records</p>
              </div>
              <button
                onClick={() => setShowDocModal(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F7F9FC] text-[#6B7280]"
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
                <label className={labelCls}>Document Belongs To *</label>
                <select
                  value={docForm.family_member_id}
                  onChange={(e) =>
                    setDocForm({ ...docForm, family_member_id: e.target.value })
                  }
                  className={`${inputCls} font-bold text-[#005A87] bg-sky-50/60 border-sky-200`}
                >
                  <option value="">👤 Client: {client?.name} {client?.surname}</option>
                  {family.map((f) => (
                    <option key={f.id} value={f.id}>
                      👥 Family Member: {f.name} ({f.relationship})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#6B7280] mt-1">
                  Upload separately for {client?.name} or select a family member
                </p>
              </div>
              <div>
                <label className={labelCls}>Document Name *</label>
                <input
                  type="text"
                  value={docForm.name}
                  onChange={(e) =>
                    setDocForm({ ...docForm, name: e.target.value })
                  }
                  className={inputCls}
                  placeholder="e.g. Aadhaar Card, LIC Policy, Health Card"
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
                  className="w-full px-4 py-3 rounded-2xl bg-[#F7F9FC] border border-slate-200 outline-none font-bold text-[#1F2937] file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#005A87] file:text-white cursor-pointer text-[13px]"
                />
                {docForm.file_name && (
                  <p className="text-[11px] text-[#14B86A] font-bold mt-1.5 flex items-center gap-1">
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
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setShowDocModal(false)}
                className="flex-1 h-12 rounded-2xl border border-slate-200 text-[13px] font-bold text-[#1F2937] hover:bg-[#F7F9FC]"
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
                className="flex-1 h-12 rounded-2xl bg-[#005A87] text-white text-[13px] font-bold hover:bg-[#00476b] transition-all disabled:opacity-50 active:scale-95"
              >
                {saving ? "Uploading…" : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Change Password Modal (Item 8) ─────────────────────────── */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowPasswordModal(false)}
          />
          <div className="relative bg-white w-full sm:max-w-md rounded-t-[28px] sm:rounded-[22px] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-bold text-[#1F2937]">Change Password</h2>
                <p className="text-xs text-[#6B7280]">Update client portal access password</p>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F7F9FC] text-[#6B7280]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className={labelCls}>New Password</label>
                <input
                  type="text"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Enter new password (min 4 characters)"
                  className={inputCls}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 h-12 rounded-2xl border border-slate-200 text-[13px] font-bold text-[#1F2937] hover:bg-[#F7F9FC]"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePassword}
                disabled={savingPassword || !newPasswordInput.trim()}
                className="flex-1 h-12 rounded-2xl bg-[#005A87] text-white text-[13px] font-bold hover:bg-[#00476b] transition-all disabled:opacity-50 active:scale-95"
              >
                {savingPassword ? "Updating…" : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── In-App Document Viewer Modal (Item 9) ─────────────────── */}
      {viewingDoc && (
        <div className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setViewingDoc(null)}
          />
          <div className="relative bg-white w-full sm:max-w-2xl rounded-t-[28px] sm:rounded-[22px] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-[16px] font-bold text-[#1F2937] truncate max-w-sm">
                  {viewingDoc.name}
                </h2>
                <p className="text-xs text-[#6B7280]">
                  {viewingDoc.file_name} · {formatSize(viewingDoc.file_size)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {viewingDoc.file_url && (
                  <a
                    href={viewingDoc.file_url}
                    download={viewingDoc.file_name}
                    className="p-2 rounded-xl bg-[#DDF3FF] text-[#005A87] hover:bg-[#005A87] hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
                    title="Download"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                )}
                <button
                  onClick={() => setViewingDoc(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F7F9FC] text-[#6B7280]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-slate-50 flex items-center justify-center min-h-[340px]">
              {viewingDoc.file_type === "IMG" && viewingDoc.file_url ? (
                <img
                  src={viewingDoc.file_url}
                  alt={viewingDoc.name}
                  className="max-h-[65vh] max-w-full rounded-xl object-contain shadow-sm border border-slate-200"
                />
              ) : viewingDoc.file_url && viewingDoc.file_url.startsWith("http") ? (
                <iframe
                  src={viewingDoc.file_url}
                  className="w-full h-[60vh] rounded-xl border border-slate-200 bg-white"
                  title={viewingDoc.name}
                />
              ) : (
                <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 max-w-md">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-lg mx-auto mb-3 ${docColor(viewingDoc.file_type)}`}>
                    {viewingDoc.file_type}
                  </div>
                  <h3 className="font-bold text-[#1F2937] text-base mb-1">{viewingDoc.name}</h3>
                  <p className="text-xs text-[#6B7280] mb-4">
                    Category: {viewingDoc.category || "General Document"}
                  </p>
                  <p className="text-xs text-slate-500 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    In-app document viewer is rendering this {viewingDoc.file_type} record. You can download or preview it securely.
                  </p>
                  {viewingDoc.file_url && (
                    <a
                      href={viewingDoc.file_url}
                      download={viewingDoc.file_name}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#005A87] text-white text-xs font-bold hover:bg-[#00476b] transition-all"
                    >
                      Download Document
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Separate Family Member Profile Modal ───────────────── */}
      {viewingFamilyMember && (
        <div className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setViewingFamilyMember(null)}
          />
          <div className="relative bg-white w-full sm:max-w-xl rounded-t-[28px] sm:rounded-[22px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Profile Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-[#F7F9FC]/70">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getGradient(viewingFamilyMember.name)} flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0`}
                >
                  {viewingFamilyMember.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-[#1F2937] truncate">
                      {formatFamilyName(viewingFamilyMember.name)}
                    </h2>
                    <span className="text-[10px] font-bold text-[#7C6CF6] bg-[#7C6CF6]/10 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                      {viewingFamilyMember.relationship}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] truncate">
                    Family Profile · Client: {capitalizeWords(client?.name)} {(client?.surname || "").toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingFamilyMember(null)}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-200/60 text-[#6B7280] transition-colors shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Individual Details Grid */}
              <div>
                <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2.5">
                  Individual Details
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F7F9FC] p-3 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Date of Birth</p>
                    <p className="text-[13px] font-bold text-[#1F2937]">{formatDate(viewingFamilyMember.date_of_birth)}</p>
                  </div>
                  <div className="bg-[#F7F9FC] p-3 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Age</p>
                    <p className="text-[13px] font-bold text-[#1F2937]">{getAge(viewingFamilyMember.date_of_birth)} years</p>
                  </div>
                  <div className="bg-[#F7F9FC] p-3 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Phone Number</p>
                    <p className="text-[13px] font-bold text-[#1F2937]">
                      {viewingFamilyMember.phone ? (
                        <a href={`tel:${viewingFamilyMember.phone}`} className="text-[#005A87] hover:underline">
                          {viewingFamilyMember.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400 font-normal">Not provided</span>
                      )}
                    </p>
                  </div>
                  <div className="bg-[#F7F9FC] p-3 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Occupation</p>
                    <p className="text-[13px] font-bold text-[#1F2937]">
                      {viewingFamilyMember.occupation || <span className="text-slate-400 font-normal">Not specified</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dedicated Document Management Section */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div>
                    <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                      Documents for {formatFamilyName(viewingFamilyMember.name)}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Manage documents uploaded specifically for this member
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDocForm({
                        name: `${formatFamilyName(viewingFamilyMember.name)} Document`,
                        file_name: "",
                        file_size: 0,
                        file_url: "",
                        family_member_id: viewingFamilyMember.id,
                        category: "KYC / Identity",
                      });
                      setShowDocModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#005A87] text-white text-xs font-bold hover:bg-[#00476b] transition-all shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Upload Doc
                  </button>
                </div>

                {/* Member's Documents List */}
                {(() => {
                  const memberDocs = docs.filter((d) => d.family_member_id === viewingFamilyMember.id);
                  if (memberDocs.length === 0) {
                    return (
                      <div className="p-6 text-center bg-[#F7F9FC] rounded-2xl border border-dashed border-slate-200">
                        <p className="text-xs font-semibold text-slate-600 mb-1">
                          No documents uploaded for {formatFamilyName(viewingFamilyMember.name)} yet
                        </p>
                        <p className="text-[11px] text-slate-400 mb-3">
                          Upload identity proof, medical records, or insurance policies under their name.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setDocForm({
                              name: `${formatFamilyName(viewingFamilyMember.name)} Document`,
                              file_name: "",
                              file_size: 0,
                              file_url: "",
                              family_member_id: viewingFamilyMember.id,
                              category: "KYC / Identity",
                            });
                            setShowDocModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#005A87] hover:bg-[#DDF3FF] transition-all"
                        >
                          Upload First Document →
                        </button>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-2">
                      {memberDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 hover:border-[#0E7AC7] transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[10px] shrink-0 ${docColor(doc.file_type)}`}>
                              {doc.file_type}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-bold text-[#1F2937] truncate">{doc.name}</p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                                <span>{doc.category || "Document"}</span>
                                <span>·</span>
                                <span>{formatSize(doc.file_size)}</span>
                                <span>·</span>
                                <span>{formatDate(doc.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <button
                              type="button"
                              onClick={() => setViewingDoc(doc)}
                              title="View Document"
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#EEF6FF] text-[#0E7AC7] hover:bg-[#0E7AC7] hover:text-white transition-all"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <a
                              href={doc.file_url && doc.file_url.length > 5 ? doc.file_url : "#"}
                              download={doc.file_name}
                              title="Download"
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#DDF3FF] text-[#005A87] hover:bg-[#005A87] hover:text-white transition-all"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </a>
                            <button
                              type="button"
                              onClick={() => deleteDocument(doc.id)}
                              title="Delete"
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F7F9FC] text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Profile Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0 bg-[#F7F9FC]/70">
              <button
                onClick={() => setViewingFamilyMember(null)}
                className="flex-1 h-11 rounded-2xl border border-slate-200 text-[13px] font-bold text-[#1F2937] hover:bg-white transition-all"
              >
                Close Profile
              </button>
              <button
                onClick={() => {
                  const m = viewingFamilyMember;
                  setViewingFamilyMember(null);
                  setEditingFamilyMember(m);
                }}
                className="flex-1 h-11 rounded-2xl bg-[#005A87] text-white text-[13px] font-bold hover:bg-[#00476b] transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Family Member Modal (Item 5 & 11) ────────────────── */}
      {editingFamilyMember && (
        <div className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={requestCloseEditFamilyModal}
          />
          <div className="relative bg-white w-full sm:max-w-md rounded-t-[28px] sm:rounded-[22px] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-bold text-[#1F2937]">Edit Family Member</h2>
                <p className="text-xs text-[#6B7280]">Modify saved family details</p>
              </div>
              <button
                onClick={requestCloseEditFamilyModal}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F7F9FC] text-[#6B7280]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Alert Message Banner (on the same layer) */}
              {editFamilyModalError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start justify-between gap-2.5 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">⚠️</span>
                    <div>
                      <p className="font-bold text-rose-900">Please correct the following:</p>
                      <p className="mt-0.5 text-rose-700 font-medium">{editFamilyModalError}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditFamilyModalError(null)}
                    className="w-5 h-5 rounded-lg text-rose-400 hover:text-rose-700 flex items-center justify-center shrink-0 font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div>
                <label className={labelCls}>Full Name *</label>
                <input
                  type="text"
                  value={editingFamilyMember.name}
                  onChange={(e) =>
                    setEditingFamilyMember({
                      ...editingFamilyMember,
                      name: sanitizeAlphabetsOnly(e.target.value),
                    })
                  }
                  onBlur={(e) =>
                    setEditingFamilyMember({
                      ...editingFamilyMember,
                      name: formatFamilyName(e.target.value),
                    })
                  }
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Date of Birth *</label>
                  <input
                    type="date"
                    min="1900-01-01"
                    max={new Date().toISOString().split("T")[0]}
                    value={editingFamilyMember.date_of_birth}
                    onChange={(e) =>
                      setEditingFamilyMember({
                        ...editingFamilyMember,
                        date_of_birth: e.target.value,
                      })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Relationship *</label>
                  <select
                    value={editingFamilyMember.relationship}
                    onChange={(e) =>
                      setEditingFamilyMember({
                        ...editingFamilyMember,
                        relationship: e.target.value,
                      })
                    }
                    className={inputCls}
                  >
                    <option value="">Select...</option>
                    {FAMILY_RELATIONSHIPS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Phone</label>
                  <input
                    type="tel"
                    value={editingFamilyMember.phone || ""}
                    onChange={(e) =>
                      setEditingFamilyMember({
                        ...editingFamilyMember,
                        phone: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className={inputCls}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className={labelCls}>Occupation</label>
                  <input
                    type="text"
                    value={editingFamilyMember.occupation || ""}
                    onChange={(e) =>
                      setEditingFamilyMember({
                        ...editingFamilyMember,
                        occupation: e.target.value,
                      })
                    }
                    className={inputCls}
                    placeholder="e.g. Teacher, Engineer"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={requestCloseEditFamilyModal}
                className="flex-1 h-12 rounded-2xl border border-slate-200 text-[13px] font-bold text-[#1F2937] hover:bg-[#F7F9FC]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFamilyEdit}
                disabled={savingFamilyEdit || !editingFamilyMember.name.trim()}
                className="flex-1 h-12 rounded-2xl bg-[#005A87] text-white text-[13px] font-bold hover:bg-[#00476b] transition-all disabled:opacity-50 active:scale-95"
              >
                {savingFamilyEdit ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Discard Changes Confirmation Modal ────────────────────── */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setShowDiscardConfirm(false)}
          />
          <div className="relative bg-white rounded-[24px] w-full max-w-sm p-6 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center mx-auto mb-4 text-xl shadow-2xs">
              ⚠️
            </div>
            <h3 className="text-[17px] font-bold text-[#1F2937] mb-1.5">
              Discard Unsaved Changes?
            </h3>
            <p className="text-[12px] text-[#6B7280] leading-relaxed mb-6 font-medium">
              You have unsaved changes in this form. Exiting now will discard your progress. Are you sure you want to exit?
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="flex-1 h-11 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-[12px] font-bold transition-all"
              >
                Discard Changes
              </button>
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="flex-1 h-11 rounded-2xl bg-[#005A87] hover:bg-[#00476b] text-white text-[12px] font-bold transition-all shadow-sm"
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}