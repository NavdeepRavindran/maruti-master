"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import {
  capitalizeWords,
  formatClientDisplayName,
  sanitizeAlphabetsOnly,
  formatFamilyName,
  FAMILY_RELATIONSHIPS,
  getRecycleBinRetention,
  formatDate,
  validateDateRange,
  isValidDateYear,
} from "@/lib/formatUtils";
import { validateEmail, getEmailError } from "@/lib/emailValidator";

export interface FormFamilyMember {
  id?: string;
  name: string;
  relationship: string;
  date_of_birth: string;
  phone: string;
  occupation?: string;
}

interface ClientData {
  id: string;
  name: string;
  surname?: string;
  phone: string;
  alternate_mobile?: string;
  alternateMobile?: string;
  email?: string;
  date_of_birth: string;
  anniversary_date?: string;
  anniversaryDate?: string;
  address?: string;
  town?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  pinCode?: string;
  gender?: string;
  marital_status?: string;
  maritalStatus?: string;
  occupation?: string;
  notes?: string;
  status: string;
  is_deleted?: boolean;
  deleted_at?: string;
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
  Restore:   () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  Close:     () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>,
  Doc:       () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  Users:     () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  Calendar:  () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
  Phone:     () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>,
  Check:     () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>,
  Camera:    () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  X:         () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>,
  Empty:     () => <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
};

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-xl bg-slate-100 ${className}`} />
);

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
const getGradient = (name: string) => avatarGradients[name.charCodeAt(0) % avatarGradients.length];

// ── Reusable Avatar component ──────────────────────────────────────────────
function ClientAvatar({
  name,
  profile_pic,
  size = "md",
  className = "",
}: {
  name: string;
  profile_pic?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeMap = {
    sm: "w-8 h-8 text-[11px]",
    md: "w-11 h-11 text-sm",
    lg: "w-12 h-12 text-[15px]",
  };

  if (profile_pic) {
    return (
      <img
        src={profile_pic}
        alt={name || "Client"}
        className={`${sizeMap[size]} rounded-full object-cover shrink-0 shadow-sm ${className}`}
      />
    );
  }

  const initial = (name?.[0] || "?").toUpperCase();

  return (
    <div
      className={`${sizeMap[size]} rounded-full bg-gradient-to-br ${getGradient(name || "A")} flex items-center justify-center text-white font-bold shrink-0 shadow-sm ${className}`}
    >
      {initial}
    </div>
  );
}

export default function ClientsPage() {
  const supabase = createClient();

  const [clients, setClients]       = useState<ClientData[]>([]);
  const [allClients, setAllClients] = useState<ClientData[]>([]);
  const [search, setSearch]         = useState("");
  const [filter, setFilter]         = useState("all");
  const [loading, setLoading]       = useState(true);
  const [showAddModal, setShowAdd]  = useState(false);
  const [editingClient, setEditing] = useState<ClientData | null>(null);

  const defaultForm = {
    name: "", surname: "", phone: "", alternateMobile: "", email: "", date_of_birth: "",
    anniversaryDate: "", gender: "", maritalStatus: "", occupation: "",
    address: "", town: "", city: "", state: "", pinCode: "", notes: "",
    status: "Active",
    profile_pic: "", // base64 data URL
  };

  const [formData, setForm]         = useState(defaultForm);
  const [familyMembers, setFamilyMembers] = useState<FormFamilyMember[]>([]);
  const [saving, setSaving]         = useState(false);
  const [total, setTotal]           = useState(0);
  const [modalError, setModalError] = useState<string | null>(null);

  // Helper for auth headers
  const getAuthTokenAndHeaders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || null;
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return { token, headers };
  }, [supabase]);

  // Discard Confirmation Modal state (prevents accidental closing on outside clicks)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const requestCloseModal = () => {
    const hasContent = Boolean(
      formData.name ||
      formData.surname ||
      formData.phone ||
      formData.email ||
      formData.date_of_birth ||
      formData.pinCode ||
      familyMembers.length > 0 ||
      editingClient
    );
    if (hasContent) {
      setShowDiscardConfirm(true);
    } else {
      closeModal();
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardConfirm(false);
    closeModal();
  };

  // Real-time Duplicate Client Detection
  const trimmedPhone = (formData.phone || "").trim();
  const trimmedEmail = (formData.email || "").trim().toLowerCase();

  const duplicateClient = useMemo(() => {
    const pool = allClients.length > 0 ? allClients : clients;
    if (!trimmedPhone && !trimmedEmail) return null;
    return (
      pool.find((c) => {
        if (editingClient && c.id === editingClient.id) return false;
        const matchPhone = Boolean(
          trimmedPhone.length === 10 &&
          c.phone &&
          c.phone.trim() === trimmedPhone
        );
        const matchEmail = Boolean(
          trimmedEmail &&
          trimmedEmail.includes("@") &&
          c.email &&
          c.email.trim().toLowerCase() === trimmedEmail
        );
        return matchPhone || matchEmail;
      }) || null
    );
  }, [allClients, clients, trimmedPhone, trimmedEmail, editingClient]);

  const isDuplicatePhone = Boolean(
    duplicateClient &&
    trimmedPhone.length === 10 &&
    duplicateClient.phone?.trim() === trimmedPhone
  );

  const isDuplicateEmail = Boolean(
    duplicateClient &&
    trimmedEmail.includes("@") &&
    duplicateClient.email?.trim().toLowerCase() === trimmedEmail
  );

  const emailValidation = useMemo(() => {
    return formData.email ? validateEmail(formData.email) : null;
  }, [formData.email]);
async function fetchPincode(pin: string) {
  try {
    console.log("Fetching PIN:", pin);

    const res = await fetch(`/api/pincode/${pin}`);

    if (!res.ok) return;

    const data = await res.json();

    console.log("PIN DATA:", data);

setForm(prev => ({
  ...prev,
  town: data.town,
  city: data.city,
  state: data.state,
}));

  } catch (error) {
    console.error(error);
  }
}
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.get("action") === "add") setShowAdd(true);
    }
  }, []);

  const fetchAllClientsSummary = useCallback(async () => {
    try {
      const { token, headers } = await getAuthTokenAndHeaders();
      if (!token) return;
      const res = await fetch("/api/clients", { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.clients) setAllClients(data.clients);
      }
    } catch { /* silent */ }
  }, [getAuthTokenAndHeaders]);

  useEffect(() => {
    fetchAllClientsSummary();
  }, [fetchAllClientsSummary]);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const { token, headers } = await getAuthTokenAndHeaders();
      if (!token) return;
      const p = new URLSearchParams();
      if (search) p.set("search", search);
      if (filter !== "all") p.set("status", filter);
      const res = await fetch(`/api/clients?${p}`, { headers });
      const data = await res.json();
      setClients(data.clients || []);
      setTotal(data.total || (data.clients?.length) || 0);
      if (!search && filter === "all") {
        setAllClients(data.clients || []);
      }
    } catch { /* silent */ } finally { setLoading(false); }
  }, [search, filter, getAuthTokenAndHeaders]);

  useEffect(() => {
    const t = setTimeout(fetchClients, 300);
    return () => clearTimeout(t);
  }, [fetchClients]);

  // Ensure allClients is available when Add Modal opens
  useEffect(() => {
    if (showAddModal && allClients.length === 0) {
      fetchAllClientsSummary();
    }
  }, [showAddModal, allClients.length, fetchAllClientsSummary]);

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
      setForm(prev => ({ ...prev, profile_pic: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setModalError(null);
    if (!editingClient && duplicateClient) {
      const msg = `Duplicate client identified! A client with this mobile number or email already exists (${duplicateClient.name} ${duplicateClient.surname || ""}). Cannot add duplicate client.`;
      setModalError(msg);
      toast.error(msg);
      return;
    }
    if (!formData.name.trim()) {
      const msg = "Please enter Full Name.";
      setModalError(msg);
      toast.error(msg);
      return;
    }
    if (!formData.surname.trim()) {
      const msg = "Please enter Surname.";
      setModalError(msg);
      toast.error(msg);
      return;
    }
    const phoneValid = /^\d{10}$/.test(formData.phone.trim());
    if (!phoneValid) {
      const msg = "Please enter a valid 10-digit mobile number.";
      setModalError(msg);
      toast.error(msg);
      return;
    }
    const emailCheck = validateEmail(formData.email);
    if (!emailCheck.isValid) {
      const msg = emailCheck.error || "Please enter a valid email address.";
      setModalError(msg);
      toast.error(msg);
      return;
    }
    if (!formData.date_of_birth) {
      const msg = "Please select Date of Birth.";
      setModalError(msg);
      toast.error(msg);
      return;
    }
    const dobCheck = validateDateRange(formData.date_of_birth, "Date of Birth");
    if (!dobCheck.isValid) {
      const msg = dobCheck.error || "Please select a valid Date of Birth.";
      setModalError(msg);
      toast.error(msg);
      return;
    }
    const anniv = (formData.anniversaryDate || "").trim();
    if (anniv) {
      const annivCheck = validateDateRange(anniv, "Anniversary date");
      if (!annivCheck.isValid) {
        const msg = annivCheck.error || "Please select a valid Anniversary date.";
        setModalError(msg);
        toast.error(msg);
        return;
      }
      if (formData.date_of_birth && anniv < formData.date_of_birth) {
        const msg = "Anniversary date cannot be earlier than Date of Birth.";
        setModalError(msg);
        toast.error(msg);
        return;
      }
    }
    // Validate family members' dates of birth if provided
    for (const fm of familyMembers) {
      if (fm.date_of_birth) {
        const fmDobCheck = validateDateRange(fm.date_of_birth, `${fm.name || "Family member"}'s Date of Birth`);
        if (!fmDobCheck.isValid) {
          const msg = fmDobCheck.error || "Invalid family member date of birth.";
          setModalError(msg);
          toast.error(msg);
          return;
        }
      }
    }
    const pinValid = /^\d{6}$/.test(formData.pinCode.trim());
    if (!pinValid) {
      const msg = "Please enter a valid 6-digit PIN code.";
      setModalError(msg);
      toast.error(msg);
      return;
    }

    setSaving(true);
    try {
      const { token, headers } = await getAuthTokenAndHeaders();
      if (!token) {
        toast.error("Authentication missing. Please log in.");
        return;
      }
      const authHeaders = {
        "Content-Type": "application/json",
        ...headers,
      };

      const payload = {
        ...formData,
        anniversaryDate: anniv || null,
        anniversary_date: anniv || null,
        notes: formData.notes ?? "",
        status: formData.status || "Active",
        name: capitalizeWords(formData.name),
        surname: formData.surname.trim().toUpperCase(),
      };

      let targetClientId = editingClient?.id;

      if (editingClient) {
        const res = await fetch(`/api/clients/${editingClient.id}`, {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to update client.");
        }
        toast.success("Client updated successfully!");
      } else {
        const res = await fetch("/api/clients", {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to create client.");
        }
        const data = await res.json();
        targetClientId = data.client?.id;

        if (data.isDoubleEntry) {
          alert(`Double entry / Re-entry detected!\n\nAllotment Reference: ${data.allotmentId}\nFollow-up Reminder: ${data.reminderDate}\n\n${data.message}`);
        } else if (data.client && data.client.clientLoginId) {
          alert(`Client created successfully!\n\nPortal Login ID: ${data.client.clientLoginId}\nTemporary Password: ${data.client.temporaryPassword}\n\nPlease copy and share these credentials with the client.`);
        }
      }

      // Save Family Members if any were added/updated
      if (targetClientId && familyMembers.length > 0) {
        for (const fm of familyMembers) {
          if (!fm.name.trim()) continue;
          const fmPayload = {
            name: formatFamilyName(fm.name),
            relationship: fm.relationship || "Other",
            date_of_birth: fm.date_of_birth || "2000-01-01",
            phone: fm.phone || null,
            occupation: fm.occupation || "",
          };
          if (fm.id) {
            await fetch(`/api/clients/${targetClientId}/family/${fm.id}`, {
              method: "PUT",
              headers: authHeaders,
              body: JSON.stringify(fmPayload),
            }).catch(() => {});
          } else {
            await fetch(`/api/clients/${targetClientId}/family`, {
              method: "POST",
              headers: authHeaders,
              body: JSON.stringify(fmPayload),
            }).catch(() => {});
          }
        }
      }

      closeModal();
      await fetchClients();
      await fetchAllClientsSummary();
      await fetchRecycleCount();
    } catch (err: any) {
      const errMsg = err?.message || "An error occurred while saving client details.";
      setModalError(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const [recycleCount, setRecycleCount] = useState(0);

  const fetchRecycleCount = useCallback(async () => {
    try {
      const { token, headers } = await getAuthTokenAndHeaders();
      if (!token) return;
      const res = await fetch("/api/clients?status=recycle_bin", {
        headers,
      });
      if (res.ok) {
        const d = await res.json();
        setRecycleCount(d.total || d.clients?.length || 0);
      }
    } catch { /* silent */ }
  }, [getAuthTokenAndHeaders]);

  useEffect(() => {
    fetchRecycleCount();
  }, [fetchRecycleCount]);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const { headers } = await getAuthTokenAndHeaders();
      const res = await fetch(`/api/clients/${id}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        setClients(prev => prev.filter(c => c.id !== id));
        setAllClients(prev => prev.map(c => c.id === id ? { ...c, is_deleted: true } : c));
        setRecycleCount(prev => prev + 1);
        toast.success("Client moved to Recycle Bin.");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to delete client");
      }
      fetchClients();
      fetchAllClientsSummary();
      fetchRecycleCount();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete client");
      fetchClients();
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    try {
      const { headers } = await getAuthTokenAndHeaders();
      const res = await fetch(`/api/clients/${id}/restore`, {
        method: "POST",
        headers,
      });
      if (res.ok) {
        setClients(prev => prev.filter(c => c.id !== id));
        setAllClients(prev => prev.map(c => c.id === id ? { ...c, is_deleted: false } : c));
        setRecycleCount(prev => Math.max(0, prev - 1));
        toast.success("Client restored successfully!");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to restore client");
      }
      await Promise.all([
        fetchClients(),
        fetchAllClientsSummary(),
        fetchRecycleCount(),
      ]);
    } catch (e: any) {
      toast.error(e.message || "Failed to restore client");
      fetchClients();
    } finally {
      setRestoringId(null);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm("Permanently delete this client and all associated documents? This action CANNOT be undone.")) return;
    try {
      const { headers } = await getAuthTokenAndHeaders();
      const res = await fetch(`/api/clients/${id}?permanent=true`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        toast.success("Client permanently deleted.");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to permanently delete client");
      }
      fetchClients();
      fetchAllClientsSummary();
      fetchRecycleCount();
    } catch (e: any) {
      toast.error(e.message || "Failed to permanently delete client");
      fetchClients();
    }
  };

  const handleEmptyRecycleBin = async () => {
    if (!confirm("Permanently delete ALL clients in the Recycle Bin? This action CANNOT be undone.")) return;
    try {
      const { headers } = await getAuthTokenAndHeaders();
      const res = await fetch("/api/clients/recycle-bin", {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        toast.success("Recycle Bin emptied.");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to empty Recycle Bin");
      }
      fetchClients();
      fetchAllClientsSummary();
      fetchRecycleCount();
    } catch (e: any) {
      toast.error(e.message || "Failed to empty Recycle Bin");
      fetchClients();
    }
  };

  const openEdit = async (c: ClientData | any) => {
    setModalError(null);
    setEditing(c);

    const { firstName, surname } = formatClientDisplayName(c.name, c.surname);

    setForm({
      name: firstName,
      surname: surname,
      phone: c.phone || "",
      alternateMobile: c.alternateMobile || c.alternate_mobile || "",
      email: c.email || "",
      date_of_birth: c.date_of_birth || "",
      anniversaryDate: isValidDateYear(c.anniversaryDate || c.anniversary_date)
        ? (c.anniversaryDate || c.anniversary_date)
        : "",
      gender: c.gender || "",
      maritalStatus: c.maritalStatus || c.marital_status || "",
      occupation: c.occupation || "",

      address: c.address || "",
      town: c.town || "",
      city: c.city || "",
      state: c.state || "",
      pinCode: c.pinCode || c.pin_code || "",

      notes: c.notes || "",
      status: c.status || "Active",
      profile_pic: c.profile_pic || "",
    });

    // Open modal immediately so user sees zero delay
    setShowAdd(true);

    // Also load family members for this client in background
    try {
      const { token, headers } = await getAuthTokenAndHeaders();
      if (token) {
        const res = await fetch(`/api/clients/${c.id}/family`, {
          headers,
        });
        if (res.ok) {
          const data = await res.json();
          const rawFm = data.family_members || [];
          setFamilyMembers(rawFm.map((fm: any) => ({
            name: fm.name || "",
            relationship: fm.relationship || "",
            date_of_birth: fm.date_of_birth || "",
            phone: fm.phone || "",
            occupation: fm.occupation || "",
          })));
        }
      }
    } catch {
      setFamilyMembers([]);
    }
  };

  const closeModal = () => {
    setShowAdd(false);
    setEditing(null);
    setModalError(null);
    setForm(defaultForm);
    setFamilyMembers([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatDob = (d: string) => formatDate(d);

  const handleAddFamilyMember = () => {
    const nextIdx = familyMembers.length;
    setFamilyMembers(prev => [...prev, { name: "", relationship: "", date_of_birth: "", phone: "", occupation: "" }]);
    toast.success(`Family Member #${nextIdx + 1} added! Fill in their details below.`, { icon: "👥" });
    setTimeout(() => {
      const el = document.getElementById(`family-member-card-${nextIdx}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const firstInput = el.querySelector("input");
        if (firstInput) firstInput.focus();
      }
    }, 120);
  };

  const inputCls = "w-full px-4 py-3 rounded-2xl bg-[#F7F9FC] border border-slate-200 focus:bg-white focus:border-[#0E7AC7] focus:ring-2 focus:ring-[#DDF3FF] outline-none transition-all text-[13px] font-semibold text-[#1F2937] placeholder:text-slate-400 placeholder:font-normal";
  const labelCls = "block text-xs font-semibold text-[#6B7280] mb-1.5";

  const toggleClientStatus = async (c: ClientData) => {
    const isInactive = c.status === "Inactive";
    const hasKyc = Boolean(c.document_count && c.document_count > 0);
    // If activating: if KYC not found, move to Pending, not to Active!
    const newStatus = isInactive ? (hasKyc ? "Active" : "Pending") : "Inactive";
    const msg = isInactive
      ? (hasKyc
          ? `Reactivate client ${c.name} ${(c.surname || "")}?`
          : `Client ${c.name} ${(c.surname || "")} does not have KYC uploaded yet. Move them to Pending?`)
      : `Deactivate client ${c.name} ${(c.surname || "")}? They will be moved to the Inactive list.`;
    if (!confirm(msg)) return;

    // Immediately update UI numbers and list in real time
    setClients((prev) =>
      prev.map((cl) => (cl.id === c.id ? { ...cl, status: newStatus } : cl))
    );
    setAllClients((prev) => {
      const exists = prev.some((cl) => cl.id === c.id);
      if (exists) {
        return prev.map((cl) => (cl.id === c.id ? { ...cl, status: newStatus } : cl));
      }
      return [...prev, { ...c, status: newStatus }];
    });

    try {
      const { token, headers } = await getAuthTokenAndHeaders();
      if (!token) return;
      const res = await fetch(`/api/clients/${c.id}`, {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        if (!isInactive) {
          toast.success("Client marked as Inactive!");
        } else if (hasKyc) {
          toast.success("Client reactivated to Active!");
        } else {
          toast("Client moved to Pending (KYC document required to become Active).", { icon: "ℹ️" });
        }
      }
      await fetchClients();
      await fetchAllClientsSummary();
    } catch {
      /* silent */
    }
  };

  const statusStyle = (status: string) => {
    if (status === "Active") return "bg-[#14B86A]/10 text-[#14B86A]";
    if (status === "Inactive") return "bg-slate-100 text-slate-600 border border-slate-200/60";
    return "bg-[#F59E0B]/10 text-[#F59E0B]";
  };
  const statusDot = (status: string) => {
    if (status === "Active") return "bg-[#14B86A]";
    if (status === "Inactive") return "bg-slate-400";
    return "bg-[#F59E0B]";
  };

  const statusCounts = useMemo(() => {
    const pool = allClients.length > 0 ? allClients : clients;
    const nonDeleted = pool.filter((c) => !c.is_deleted);
    return {
      all: nonDeleted.length,
      Active: nonDeleted.filter((c) => c.status === "Active").length,
      Pending: nonDeleted.filter((c) => c.status === "Pending").length,
      Inactive: nonDeleted.filter((c) => c.status === "Inactive").length,
    };
  }, [allClients, clients]);

  const displayedClients = useMemo(() => {
    return clients.filter((c) => {
      if (filter === "all") return !c.is_deleted;
      if (filter === "recycle_bin") return Boolean(c.is_deleted);
      return !c.is_deleted && c.status?.toLowerCase() === filter.toLowerCase();
    });
  }, [clients, filter]);

  return (
    <div className="min-h-screen bg-[#F7F9FC]">

      {/* ── Sticky Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[#6B7280] leading-none">Management</p>
            <h1 className="text-[17px] sm:text-lg font-bold text-[#1F2937] leading-tight truncate mt-0.5">
              Client <span className="text-[#0E7AC7]">Directory</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#F7F9FC] rounded-full text-xs font-semibold text-[#6B7280]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#14B86A]" />
              {total} clients
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 h-11 bg-[#005A87] hover:bg-[#00476b] text-white text-[13px] font-bold rounded-2xl transition-all active:scale-95 shadow-sm shadow-[#005A87]/20"
            >
              <IC.UserPlus />
              <span className="hidden sm:inline">Add Client</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-8 space-y-5">

        {/* ── Search + Filter Bar ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#6B7280]">
              <IC.Search />
            </div>
            <input
              type="text"
              placeholder="Search by name, phone or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 h-12 bg-white border border-slate-200 rounded-2xl text-[13px] font-medium text-[#1F2937] placeholder:text-slate-400 focus:outline-none focus:border-[#0E7AC7] focus:ring-2 focus:ring-[#DDF3FF] transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm shrink-0 overflow-x-auto">
            {[
              { key: "all", label: "All", count: statusCounts.all },
              { key: "Active", label: "Active", count: statusCounts.Active },
              { key: "Pending", label: "Pending", count: statusCounts.Pending },
              { key: "Inactive", label: "Inactive", count: statusCounts.Inactive },
              { key: "recycle_bin", label: "Recycle Bin", icon: "🗑️", count: recycleCount },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-1 sm:flex-none px-3.5 sm:px-4 h-9 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  filter === tab.key
                    ? tab.key === "recycle_bin"
                      ? "bg-rose-700 text-white shadow-sm"
                      : "bg-[#005A87] text-white shadow-sm"
                    : "text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F7F9FC]"
                }`}
              >
                {tab.icon && <span className="text-xs">{tab.icon}</span>}
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                    filter === tab.key ? "bg-white/20 text-white" : "bg-[#F7F9FC] text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Recycle Bin Notice Banner ────────────────────────────── */}
        {filter === "recycle_bin" && (
          <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-lg shrink-0">🗑️</span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-bold text-rose-950">Recycle Bin</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200/80 text-rose-800">
                    3-Month Retention Policy
                  </span>
                </div>
                <p className="text-xs text-rose-700 mt-0.5">
                  Deleted clients are retained for up to 3 months (90 days). Any records beyond 3 months are automatically and permanently purged.
                </p>
              </div>
            </div>
            {clients.length > 0 && (
              <button
                onClick={handleEmptyRecycleBin}
                className="px-3.5 h-9 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shrink-0 self-end sm:self-center shadow-xs"
              >
                Empty Recycle Bin
              </button>
            )}
          </div>
        )}

        {/* ── MOBILE CARDS ────────────────────────────────────────── */}
        <div className="lg:hidden space-y-3">
          {loading ? (
            [1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-[22px] border border-slate-100 p-4 space-y-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-32" /><Skeleton className="h-2.5 w-24" /></div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="flex gap-2"><Skeleton className="h-9 flex-1 rounded-xl" /><Skeleton className="h-9 flex-1 rounded-xl" /><Skeleton className="h-9 w-11 rounded-xl" /></div>
              </div>
            ))
          ) : displayedClients.length === 0 ? (
            <div className="bg-white rounded-[22px] border border-slate-100 py-16 text-center px-5">
              <div className="w-14 h-14 rounded-2xl bg-[#F7F9FC] flex items-center justify-center mx-auto mb-3 text-[#6B7280]">
                <IC.Empty />
              </div>
              <p className="text-sm font-semibold text-[#1F2937]">{search ? "No clients match your search" : "No clients yet"}</p>
              {!search && <button onClick={() => setShowAdd(true)} className="text-xs text-[#005A87] font-bold hover:underline mt-1 inline-block">Add your first client →</button>}
            </div>
          ) : (
            displayedClients.map(c => (
              <div key={c.id} className="bg-white rounded-[22px] border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <ClientAvatar name={c.name} profile_pic={c.profile_pic} size="lg" />
                  <div className="flex-1 min-w-0">
                    {(() => {
                      const { firstName, surname } = formatClientDisplayName(c.name, c.surname);
                      return (
                        <Link href={`/dashboard/clients/${c.id}`} className="text-[15px] font-bold truncate block hover:underline">
                          {surname && (
                            <span className="text-[#0E7AC7] font-bold mr-1.5">{surname}</span>
                          )}
                          <span className="text-black font-bold">{firstName}</span>
                        </Link>
                      );
                    })()}
                    <div className="flex items-center gap-1.5 text-xs text-[#6B7280] font-medium mt-0.5">
                      <IC.Calendar />
                      Born {formatDob(c.date_of_birth)}
                    </div>
                  </div>
                  {filter === "recycle_bin" ? (
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        Deleted
                      </span>
                      <span className="text-[10px] font-semibold text-rose-600">
                        ⏳ {getRecycleBinRetention(c.deleted_at).label}
                      </span>
                    </div>
                  ) : (
                    <span className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${statusStyle(c.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot(c.status)}`} />
                      {c.status}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F7F9FC] rounded-xl text-[11px] font-semibold text-[#1F2937]">
                    <span className="text-[#0E7AC7]"><IC.Phone /></span> {c.phone}
                  </div>
                  {c.email && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F7F9FC] rounded-xl text-[11px] font-semibold text-[#1F2937] truncate max-w-[160px]">
                      {c.email}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F7F9FC] rounded-xl text-[11px] font-semibold text-[#1F2937]">
                    <span className="text-[#7C6CF6]"><IC.Users /></span> {c.family_count || 0} family
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F7F9FC] rounded-xl text-[11px] font-semibold text-[#1F2937]">
                    <span className="text-[#F59E0B]"><IC.Doc /></span> {c.document_count || 0} docs
                  </div>
                </div>

                {filter === "recycle_bin" ? (
                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <button
                      disabled={restoringId === c.id}
                      onClick={() => handleRestore(c.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-2xs disabled:opacity-60 cursor-pointer"
                    >
                      {restoringId === c.id ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0" />
                          <span>Restoring...</span>
                        </>
                      ) : (
                        <>
                          <IC.Restore /> Restore
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(c.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-600 hover:text-white transition-all shadow-2xs"
                    >
                      <IC.Trash /> Delete Forever
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <Link href={`/dashboard/clients/${c.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-[#DDF3FF] text-[#005A87] text-xs font-bold hover:bg-[#005A87] hover:text-white transition-all">
                      <IC.Eye /> View
                    </Link>
                    <button onClick={() => openEdit(c)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-[#F7F9FC] text-[#1F2937] text-xs font-bold hover:bg-slate-200 transition-all">
                      <IC.Edit /> Edit
                    </button>
                    <button onClick={() => toggleClientStatus(c)}
                      className={`px-2.5 h-10 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                        c.status === "Inactive"
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                      title={c.status === "Inactive" ? "Activate" : "Deactivate"}>
                      {c.status === "Inactive" ? "Activate" : "Deactivate"}
                    </button>
                    <button onClick={() => setDeleteConfirm(c.id)}
                      className="w-10 flex items-center justify-center rounded-xl bg-[#F7F9FC] text-[#6B7280] hover:bg-[#EF4444]/10 hover:text-[#EF4444] transition-all"
                      title="Move to Recycle Bin">
                      <IC.Trash />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* ── DESKTOP TABLE ───────────────────────────────────────── */}
        <div className="hidden lg:block bg-white rounded-[22px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 px-6 py-3 bg-[#F7F9FC]">
            {[
              { label: "Client",    span: "col-span-4" },
              { label: "Contact",   span: "col-span-3" },
              { label: "Status",    span: "col-span-1 text-center" },
              { label: "Family",    span: "col-span-1 text-center" },
              { label: "Docs",      span: "col-span-1 text-center" },
              { label: "Actions",   span: "col-span-2 text-right" },
            ].map(h => (
              <span key={h.label} className={`text-[10px] font-bold uppercase tracking-widest text-[#6B7280] ${h.span}`}>{h.label}</span>
            ))}
          </div>

          <div className="divide-y divide-slate-50">
            {loading ? (
              [1,2,3,4,5].map(i => (
                <div key={i} className="grid grid-cols-12 items-center px-6 py-4 gap-2 animate-pulse">
                  <div className="col-span-4 flex items-center gap-3"><Skeleton className="w-11 h-11 rounded-full" /><div className="space-y-1.5"><Skeleton className="h-3.5 w-28" /><Skeleton className="h-2.5 w-20" /></div></div>
                  <div className="col-span-3 space-y-1.5"><Skeleton className="h-3 w-24" /><Skeleton className="h-2.5 w-32" /></div>
                  <div className="col-span-1 flex justify-center"><Skeleton className="h-6 w-16 rounded-full" /></div>
                  <div className="col-span-1 flex justify-center"><Skeleton className="h-6 w-8 rounded-lg" /></div>
                  <div className="col-span-1 flex justify-center"><Skeleton className="h-6 w-10 rounded-lg" /></div>
                  <div className="col-span-2 flex justify-end gap-1"><Skeleton className="h-8 w-8 rounded-lg" /><Skeleton className="h-8 w-8 rounded-lg" /><Skeleton className="h-8 w-8 rounded-lg" /></div>
                </div>
              ))
            ) : displayedClients.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#F7F9FC] flex items-center justify-center mx-auto mb-3 text-[#6B7280]">
                  <IC.Empty />
                </div>
                <p className="text-sm font-semibold text-[#1F2937]">{search ? "No clients match your search" : "No clients yet"}</p>
                {!search && <button onClick={() => setShowAdd(true)} className="text-xs text-[#005A87] font-bold hover:underline mt-1 inline-block">Add your first client →</button>}
              </div>
            ) : (
              displayedClients.map(c => (
                <div key={c.id} className="grid grid-cols-12 items-center px-6 py-3.5 hover:bg-[#F7F9FC] transition-colors group">
                  {/* Client */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <ClientAvatar
                      name={c.name}
                      profile_pic={c.profile_pic}
                      size="md"
                      className="group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0">
                      {(() => {
                        const { firstName, surname } = formatClientDisplayName(c.name, c.surname);
                        return (
                          <Link href={`/dashboard/clients/${c.id}`} className="text-[13px] font-bold truncate block hover:underline">
                            {surname && (
                              <span className="text-[#0E7AC7] group-hover:text-[#0E7AC7] font-bold mr-1.5">{surname}</span>
                            )}
                            <span className="text-black group-hover:text-black font-bold">{firstName}</span>
                          </Link>
                        );
                      })()}
                      <div className="flex items-center gap-1 text-[11px] text-[#6B7280] font-medium mt-0.5">
                        <IC.Calendar /> {formatDob(c.date_of_birth)}
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="col-span-3 min-w-0">
                    <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#1F2937]">
                      <span className="text-[#0E7AC7]"><IC.Phone /></span> {c.phone}
                    </div>
                    <p className="text-[11px] text-[#6B7280] font-medium mt-0.5 truncate pl-5">{c.email || "—"}</p>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 flex flex-col items-center justify-center gap-1">
                    {filter === "recycle_bin" ? (
                      <>
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                          Deleted
                        </span>
                        <span className="text-[10px] font-semibold text-rose-600 whitespace-nowrap">
                          ⏳ {getRecycleBinRetention(c.deleted_at).label}
                        </span>
                      </>
                    ) : (
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${statusStyle(c.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot(c.status)} ${c.status === "Active" ? "animate-pulse" : ""}`} />
                        {c.status}
                      </span>
                    )}
                  </div>

                  {/* Family */}
                  <div className="col-span-1 flex justify-center">
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-[#7C6CF6]/10 rounded-lg text-[11px] font-bold text-[#7C6CF6]">
                      <IC.Users /> {c.family_count || 0}
                    </div>
                  </div>

                  {/* Docs */}
                  <div className="col-span-1 flex justify-center">
                    <Link href={`/dashboard/clients/${c.id}`}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#F59E0B]/10 text-[#F59E0B] rounded-lg text-[11px] font-bold hover:bg-[#F59E0B] hover:text-white transition-all">
                      <IC.Doc /> {c.document_count || 0}
                    </Link>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    {filter === "recycle_bin" ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={restoringId === c.id}
                          onClick={() => handleRestore(c.id)}
                          className="h-8 px-2.5 flex items-center gap-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white text-[11px] font-bold transition-all shadow-xs disabled:opacity-60 cursor-pointer"
                          title="Restore Client"
                        >
                          {restoringId === c.id ? (
                            <>
                              <span className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0" />
                              <span>Restoring...</span>
                            </>
                          ) : (
                            <>
                              <IC.Restore /> Restore
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(c.id)}
                          className="h-8 px-2 flex items-center gap-1 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white text-[11px] font-bold transition-all shadow-xs"
                          title="Delete Forever"
                        >
                          <IC.Trash /> Delete Forever
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleClientStatus(c)}
                          className={`h-8 px-2 flex items-center justify-center rounded-xl text-[11px] font-bold transition-all ${
                            c.status === "Inactive"
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white"
                              : "bg-[#F7F9FC] text-[#6B7280] hover:bg-slate-200 hover:text-[#1F2937]"
                          }`}
                          title={c.status === "Inactive" ? "Activate Client" : "Deactivate Client"}
                        >
                          {c.status === "Inactive" ? "Activate" : "Deactivate"}
                        </button>
                        <Link href={`/dashboard/clients/${c.id}`}
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#F7F9FC] text-[#6B7280] hover:bg-[#005A87] hover:text-white transition-all"
                          title="View">
                          <IC.Eye />
                        </Link>
                        <button onClick={() => openEdit(c)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#F7F9FC] text-[#6B7280] hover:bg-[#1F2937] hover:text-white transition-all"
                          title="Edit">
                          <IC.Edit />
                        </button>
                        <button onClick={() => setDeleteConfirm(c.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#F7F9FC] text-[#6B7280] hover:bg-[#EF4444]/10 hover:text-[#EF4444] transition-all"
                          title="Move to Recycle Bin">
                          <IC.Trash />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-6 py-3.5 bg-[#F7F9FC] flex items-center justify-between">
            <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest">{total} total clients</p>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6B7280]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#14B86A] inline-block" /> Live data
            </div>
          </div>
        </div>

        <div className="lg:hidden text-center pb-2">
          <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest">{total} total clients</p>
        </div>

      </main>

      {/* ── Delete Confirmation Modal ────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[10002] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-[22px] w-full max-w-sm p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/10 flex items-center justify-center mx-auto mb-4 text-[#EF4444]">
              <IC.Trash />
            </div>
            <h3 className="text-[16px] font-bold text-[#1F2937] text-center mb-1">Move to Recycle Bin?</h3>
            <p className="text-[12px] text-[#6B7280] text-center font-medium mb-5">
              This client will be stored in the Recycle Bin for 3 months (90 days). You can restore them anytime during this period before they are permanently deleted.
            </p>
            <div className="flex gap-3">
              <button 
                disabled={isDeleting}
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 h-12 rounded-2xl border border-slate-200 text-[13px] font-bold text-[#1F2937] hover:bg-[#F7F9FC] transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button 
                disabled={isDeleting}
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 h-12 rounded-2xl bg-[#EF4444] text-white text-[13px] font-bold hover:bg-[#dc2626] transition-colors active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer">
                {isDeleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>Moving...</span>
                  </>
                ) : (
                  <>
                    <IC.Trash /> Move to Bin
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ─────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={requestCloseModal} />
          <div className="relative bg-white w-full sm:max-w-xl rounded-t-[28px] sm:rounded-[22px] shadow-2xl max-h-[95vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-[28px] sm:rounded-t-[22px] z-10">
              <div>
                <h2 className="text-[16px] font-bold text-[#1F2937]">{editingClient ? "Edit Client" : "Add New Client"}</h2>
                <p className="text-xs text-[#6B7280] font-medium">{editingClient ? "Update client information" : "Register a new insurance client"}</p>
              </div>
              <button onClick={requestCloseModal} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F7F9FC] transition-colors text-[#6B7280]">
                <IC.Close />
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-5 space-y-4">

              {/* Alert Message Banner (on the same layer) */}
              {modalError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start justify-between gap-2.5 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">⚠️</span>
                    <div>
                      <p className="font-bold text-rose-900">Please correct the following:</p>
                      <p className="mt-0.5 text-rose-700 font-medium">{modalError}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalError(null)}
                    className="w-5 h-5 rounded-lg text-rose-400 hover:text-rose-700 flex items-center justify-center shrink-0 font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Duplicate Notice */}
              {!editingClient && duplicateClient && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-left">
                  <p className="text-xs font-semibold text-red-700">
                    Duplicate client (already exists with this mobile or email: {duplicateClient.name} {duplicateClient.surname || ""})
                  </p>
                </div>
              )}

              {/* ── Profile Picture Upload ─────────────────────────── */}
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="relative group">
                  {/* Avatar preview */}
                  {formData.profile_pic ? (
                    <img
                      src={formData.profile_pic}
                      alt="Profile preview"
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-[#DDF3FF]"
                    />
                  ) : (
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getGradient(formData.name || "A")} flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg ring-2 ring-[#DDF3FF]`}>
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
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#DDF3FF] hover:bg-[#c9ecff] text-xs font-bold text-[#005A87] transition-all"
                  >
                    <IC.Camera />
                    {formData.profile_pic ? "Change Photo" : "Add Photo"}
                  </button>

                  {formData.profile_pic && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm(prev => ({ ...prev, profile_pic: "" }));
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#EF4444]/10 hover:bg-[#EF4444]/15 text-xs font-bold text-[#EF4444] transition-all"
                    >
                      <IC.X />
                      Remove
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-[#6B7280] font-medium">JPG, PNG or WEBP · Max 2 MB</p>

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
                  <label className={labelCls}>Full Name <span className="text-[#EF4444]">*</span></label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setForm({...formData, name: sanitizeAlphabetsOnly(e.target.value)})}
                    placeholder="First Name"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Surname <span className="text-[#EF4444]">*</span></label>
                  <input
                    type="text"
                    value={formData.surname}
                    onChange={e => setForm({...formData, surname: sanitizeAlphabetsOnly(e.target.value).toUpperCase()})}
                    placeholder="e.g. KUMAR"
                    className={`${inputCls} uppercase`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Mobile <span className="text-[#EF4444]">*</span></label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={formData.phone}
                    onChange={e => setForm({...formData, phone: e.target.value.replace(/\D/g, '')})}
                    placeholder="10-digit number"
                    className={`${inputCls} ${!editingClient && isDuplicatePhone ? "!border-red-400 !bg-red-50/30 text-red-900" : ""}`}
                  />
                  {!editingClient && isDuplicatePhone && (
                    <p className="text-[11px] font-medium text-red-600 mt-1">
                      Already exists with this mobile: {duplicateClient?.name} {duplicateClient?.surname || ""}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Alternate Mobile</label>
                  <input type="tel" maxLength={10} value={formData.alternateMobile} onChange={e => setForm({...formData, alternateMobile: e.target.value.replace(/\D/g, '')})} placeholder="Optional" className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Email (Gmail) <span className="text-[#EF4444]">*</span></label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setForm({...formData, email: e.target.value})}
                  placeholder="client@gmail.com"
                  className={`${inputCls} ${
                    !editingClient && isDuplicateEmail
                      ? "!border-red-400 !bg-red-50/30 text-red-900"
                      : emailValidation && !emailValidation.isValid
                      ? "!border-rose-400 !bg-rose-50/20 text-rose-900"
                      : ""
                  }`}
                />
                {!editingClient && isDuplicateEmail && (
                  <p className="text-[11px] font-medium text-red-600 mt-1">
                    Already exists with this email: {duplicateClient?.name} {duplicateClient?.surname || ""}
                  </p>
                )}
                {emailValidation && !emailValidation.isValid && (
                  <div className="mt-1.5 space-y-1">
                    <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1.5 bg-rose-50 border border-rose-200/80 rounded-xl px-2.5 py-1.5">
                      <svg className="w-3.5 h-3.5 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {emailValidation.error}
                    </p>
                    {emailValidation.suggestion && (
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, email: emailValidation.suggestion! }))}
                        className="text-[11px] font-bold text-[#005A87] hover:underline flex items-center gap-1 px-1 py-0.5"
                      >
                        💡 Suggested: <span className="underline font-extrabold">{emailValidation.suggestion}</span> (Click to fix)
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Date of Birth <span className="text-[#EF4444]">*</span></label>
                  <input
                    type="date"
                    min="1900-01-01"
                    max={new Date().toISOString().split("T")[0]}
                    value={formData.date_of_birth}
                    onChange={e => setForm({...formData, date_of_birth: e.target.value})}
                    className={inputCls}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={labelCls}>Anniversary Date</label>
                    {formData.anniversaryDate && (
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, anniversaryDate: "" }))}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                        title="Reset anniversary date to empty"
                      >
                        ✕ Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="date"
                    min="1900-01-01"
                    max={new Date().toISOString().split("T")[0]}
                    value={formData.anniversaryDate}
                    onChange={e => setForm({...formData, anniversaryDate: e.target.value})}
                    className={inputCls}
                  />
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

              <div className="grid sm:grid-cols-2 gap-4">

  {/* Town */}
  <div>
    <label className={labelCls}>Town / Locality</label>
    <input
      type="text"
      value={formData.town}
      onChange={(e) =>
        setForm({
          ...formData,
          town: e.target.value,
        })
      }
      placeholder="Town / Locality"
      className={inputCls}
    />
  </div>

  {/* City */}
  <div>
    <label className={labelCls}>City</label>
    <input
      type="text"
      value={formData.city}
      onChange={(e) =>
        setForm({
          ...formData,
          city: e.target.value,
        })
      }
      placeholder="City"
      className={inputCls}
    />
  </div>

  {/* State */}
  <div>
    <label className={labelCls}>State</label>
    <select
      value={formData.state}
      onChange={(e) =>
        setForm({
          ...formData,
          state: e.target.value,
        })
      }
      className={inputCls}
    >
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

  {/* PIN Code */}
  <div>
    <label className={labelCls}>
      PIN Code <span className="text-[#EF4444]">*</span>
    </label>

    <input
      type="text"
      maxLength={6}
      value={formData.pinCode}
      onChange={async (e) => {
        const pin = e.target.value.replace(/\D/g, "");

        setForm((prev) => ({
          ...prev,
          pinCode: pin,
        }));

        if (pin.length === 6) {
          await fetchPincode(pin);
        }
      }}
      placeholder="6 digits"
      className={inputCls}
    />
  </div>

</div>

              {/* ── Family Details Section (Item 7) ────────────────── */}
              <div className="border border-slate-200/80 bg-slate-50/50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider">Family Details</h3>
                    <p className="text-[11px] text-[#6B7280]">Add or manage family members directly with this client</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFamilyMember}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#005A87] text-white text-xs font-bold hover:bg-[#00476b] transition-all shadow-sm active:scale-95"
                  >
                    + Add Member
                  </button>
                </div>

                {familyMembers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-1">No family members added yet. Click &quot;+ Add Member&quot; to include family details.</p>
                ) : (
                  <div className="space-y-3">
                    {familyMembers.map((fm, idx) => (
                      <div
                        key={idx}
                        id={`family-member-card-${idx}`}
                        className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs space-y-2.5 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#005A87]">Family Member #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => setFamilyMembers(prev => prev.filter((_, i) => i !== idx))}
                            className="text-[11px] text-[#EF4444] font-bold hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">Full Name *</label>
                            <input
                              type="text"
                              placeholder="Name (e.g. Ramya)"
                              value={fm.name || ""}
                              onChange={e => {
                                const val = sanitizeAlphabetsOnly(e.target.value);
                                setFamilyMembers(prev => prev.map((m, i) => i === idx ? { ...m, name: val } : m));
                              }}
                              onBlur={e => {
                                const val = formatFamilyName(e.target.value);
                                setFamilyMembers(prev => prev.map((m, i) => i === idx ? { ...m, name: val } : m));
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-[#F7F9FC] border border-slate-200 text-xs font-semibold text-[#1F2937]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">Relationship *</label>
                            <select
                              value={fm.relationship || ""}
                              onChange={e => {
                                const val = e.target.value;
                                setFamilyMembers(prev => prev.map((m, i) => i === idx ? { ...m, relationship: val } : m));
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-[#F7F9FC] border border-slate-200 text-xs font-semibold text-[#1F2937]"
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
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">Date of Birth</label>
                            <input
                              type="date"
                              min="1900-01-01"
                              max={new Date().toISOString().split("T")[0]}
                              value={fm.date_of_birth || ""}
                              onChange={e => {
                                const val = e.target.value;
                                setFamilyMembers(prev => prev.map((m, i) => i === idx ? { ...m, date_of_birth: val } : m));
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-[#F7F9FC] border border-slate-200 text-xs font-semibold text-[#1F2937]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">Phone</label>
                            <input
                              type="tel"
                              maxLength={10}
                              placeholder="10 digits (Optional)"
                              value={fm.phone || ""}
                              onChange={e => {
                                const val = e.target.value.replace(/\D/g, "");
                                setFamilyMembers(prev => prev.map((m, i) => i === idx ? { ...m, phone: val } : m));
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-[#F7F9FC] border border-slate-200 text-xs font-semibold text-[#1F2937]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">Occupation</label>
                            <input
                              type="text"
                              placeholder="e.g. Teacher, Engineer"
                              value={fm.occupation || ""}
                              onChange={e => {
                                const val = e.target.value;
                                setFamilyMembers(prev => prev.map((m, i) => i === idx ? { ...m, occupation: val } : m));
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-[#F7F9FC] border border-slate-200 text-xs font-semibold text-[#1F2937]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className={labelCls}>Status</label>
                <select
                  value={formData.status || "Active"}
                  onChange={e => setForm({ ...formData, status: e.target.value as any })}
                  className={inputCls}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Notes</label>
                <textarea value={formData.notes} onChange={e => setForm({...formData, notes: e.target.value})} placeholder="Any additional notes..." className={inputCls} style={{ minHeight: "100px" }} />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-slate-100 px-6 py-4 flex gap-3">
              <button onClick={requestCloseModal}
                className="flex-1 h-12 rounded-2xl border border-slate-200 text-[13px] font-bold text-[#1F2937] hover:bg-[#F7F9FC] transition-all active:scale-95">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || (!editingClient && Boolean(duplicateClient))}
                className="flex-1 h-12 rounded-2xl bg-[#005A87] hover:bg-[#00476b] text-white text-[13px] font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-[#005A87]/20"
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