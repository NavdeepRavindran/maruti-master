"use client";

import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";

interface UserItem {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone?: string | null;
  status: string;
  created_at?: string;
  last_sign_in_at?: string | null;
}

interface AgencyForm {
  name: string;
  logoUrl: string;
  address: string;
  regNo: string;
  phone: string;
  email: string;
}

interface TemplatesForm {
  birthdayEnglish: string;
  birthdayTamil: string;
  anniversaryEnglish: string;
  anniversaryTamil: string;
}

interface NotificationForm {
  emailAlerts: boolean;
  smsAlerts: boolean;
  marketing: boolean;
}

interface PortalForm {
  enableClientPortal: boolean;
  require2FA: boolean;
}

interface SavedSnapshot {
  agency: AgencyForm;
  templates: TemplatesForm;
  notifications: NotificationForm;
  portal: PortalForm;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("agency");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Core settings states
  const [agencyForm, setAgencyForm] = useState<AgencyForm>({
    name: "Maruthi Insure Care",
    logoUrl: "https://example.com/logo.png",
    address: "123 Main St, City",
    regNo: "REG-987654321",
    phone: "+91 98765 43210",
    email: "contact@maruthiinsure.com",
  });

  const [categories, setCategories] = useState<string[]>([
    "Policy Documents",
    "KYC / Identity",
    "Health Records",
    "Vehicle RC / Insurance",
    "Financial / Tax",
    "Others",
  ]);

  const [templates, setTemplates] = useState<TemplatesForm>({
    birthdayEnglish:
      "Wishing you a very Happy Birthday! 🎉 May your year ahead be filled with happiness, health, and prosperity. Best wishes from Maruthi Insure Care.",
    birthdayTamil:
      "இனிய பிறந்தநாள் நல்வாழ்த்துகள்! 🎂 உங்கள் வாழ்வில் எல்லா வளங்களும் நலன்களும் பெற்று ஆரோக்கியத்துடனும் அமைதியுடனும் வாழ வாழ்த்துகிறோம். — மருதி இன்சூர் கேர்.",
    anniversaryEnglish:
      "Happy Wedding Anniversary! 💐 Wishing you many more years of love, togetherness, and wonderful milestones. Warm regards from Maruthi Insure Care.",
    anniversaryTamil:
      "இனிய திருமண நாள் நல்வாழ்த்துகள்! 💐 அன்பு, மகிழ்ச்சி, வளமையுடன் கூடிய நீடித்த இல்லற வாழ்விற்கு இதயங்கனிந்த வாழ்த்துகள். — மருதி இன்சூர் கேர்.",
  });

  const [notifications, setNotifications] = useState<NotificationForm>({
    emailAlerts: true,
    smsAlerts: false,
    marketing: false,
  });

  const [portal, setPortal] = useState<PortalForm>({
    enableClientPortal: true,
    require2FA: false,
  });

  // Snapshot of saved state to detect unsaved changes
  const savedSnapshotRef = useRef<SavedSnapshot>({
    agency: agencyForm,
    templates,
    notifications,
    portal,
  });

  // Prompt modal for unsaved changes before switching tab
  const [pendingTabSwitch, setPendingTabSwitch] = useState<string | null>(null);

  // Agent management states (Normal view, no filters)
  const [users, setUsers] = useState<UserItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchUser, setSearchUser] = useState("");

  // Add Agent modal states (Strictly Agent role)
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserName, setAddUserName] = useState("");
  const [addUserEmail, setAddUserEmail] = useState("");
  const [addUserPhone, setAddUserPhone] = useState("");
  const [addUserPassword, setAddUserPassword] = useState("");
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  // Delete Agent confirmation modal
  const [agentToDelete, setAgentToDelete] = useState<UserItem | null>(null);

  // Created Agent Credentials modal (shown once after creation)
  const [createdUserCredentials, setCreatedUserCredentials] = useState<{
    full_name: string;
    email: string;
    role: string;
    password: string;
  } | null>(null);

  // Add Category modal state
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  // Change Password state
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Check if current form tab has unsaved modifications
  const isTabDirty = () => {
    const snap = savedSnapshotRef.current;
    if (activeTab === "agency") {
      return JSON.stringify(agencyForm) !== JSON.stringify(snap.agency);
    }
    if (activeTab === "templates") {
      return JSON.stringify(templates) !== JSON.stringify(snap.templates);
    }
    if (activeTab === "notifications") {
      return JSON.stringify(notifications) !== JSON.stringify(snap.notifications);
    }
    if (activeTab === "portal") {
      return JSON.stringify(portal) !== JSON.stringify(snap.portal);
    }
    return false;
  };

  // Browser beforeunload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isTabDirty()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  });

  // Handle Tab Navigation with Unsaved Changes check
  const handleTabClick = (tabId: string) => {
    if (tabId === activeTab) return;
    if (isTabDirty()) {
      setPendingTabSwitch(tabId);
    } else {
      setActiveTab(tabId);
    }
  };

  // Discard changes and navigate
  const handleDiscardChanges = () => {
    const snap = savedSnapshotRef.current;
    if (activeTab === "agency") setAgencyForm(snap.agency);
    if (activeTab === "templates") setTemplates(snap.templates);
    if (activeTab === "notifications") setNotifications(snap.notifications);
    if (activeTab === "portal") setPortal(snap.portal);

    if (pendingTabSwitch) {
      setActiveTab(pendingTabSwitch);
      setPendingTabSwitch(null);
    }
  };

  // Save changes and navigate
  const handleSaveAndNavigate = async () => {
    const ok = await handleSave();
    if (ok && pendingTabSwitch) {
      setActiveTab(pendingTabSwitch);
      setPendingTabSwitch(null);
    }
  };

  // Load Settings from /api/settings
  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.agency) setAgencyForm(data.agency);
        if (Array.isArray(data.categories)) setCategories(data.categories);
        if (data.templates) setTemplates(data.templates);
        if (data.notifications) setNotifications(data.notifications);
        if (data.portal) setPortal(data.portal);

        savedSnapshotRef.current = {
          agency: data.agency || agencyForm,
          templates: data.templates || templates,
          notifications: data.notifications || notifications,
          portal: data.portal || portal,
        };
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load Users from /api/users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to load agent list");
      }
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
      toast.error("Could not load agent list.");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchUsers();
  }, []);

  // Save All Changes
  const handleSave = async (overrideData?: Partial<{
    agency: AgencyForm;
    categories: string[];
    templates: TemplatesForm;
    notifications: NotificationForm;
    portal: PortalForm;
  }>) => {
    setSaving(true);
    try {
      const payload = {
        agency: overrideData?.agency || agencyForm,
        categories: overrideData?.categories || categories,
        templates: overrideData?.templates || templates,
        notifications: overrideData?.notifications || notifications,
        portal: overrideData?.portal || portal,
      };

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save settings");
      }

      savedSnapshotRef.current = {
        agency: payload.agency,
        templates: payload.templates,
        notifications: payload.notifications,
        portal: payload.portal,
      };

      setSaved(true);
      toast.success("Settings saved successfully!");
      setTimeout(() => setSaved(false), 2500);
      return true;
    } catch (err: any) {
      toast.error(err.message || "Error saving settings");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Add Category Handler (Auto-saves immediately so changes cannot be forgotten!)
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) {
      toast.error("Please enter a category name");
      return;
    }
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("This category already exists");
      return;
    }

    const updated = [...categories, trimmed];
    setCategories(updated);
    setNewCatName("");
    setShowAddCatModal(false);

    // Auto-save immediately to prevent forgetting
    const ok = await handleSave({ categories: updated });
    if (ok) {
      toast.success(`Category "${trimmed}" added and saved!`);
    }
  };

  // Remove Category Handler (Auto-saves immediately)
  const handleRemoveCategory = async (catToRemove: string) => {
    if (!confirm(`Are you sure you want to remove the category "${catToRemove}"?`)) return;

    const updated = categories.filter((c) => c !== catToRemove);
    setCategories(updated);

    const ok = await handleSave({ categories: updated });
    if (ok) {
      toast.success(`Category "${catToRemove}" removed and saved.`);
    }
  };

  // Generate random password helper
  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAddUserPassword(pass);
    setShowPasswordText(true);
  };

  // Add Agent Submission (Strictly Agent role)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUserName.trim()) {
      toast.error("Please enter agent full name");
      return;
    }
    if (!addUserEmail.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!addUserPassword || addUserPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setCreatingUser(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: addUserName.trim(),
          email: addUserEmail.trim(),
          role: "Agent", // strictly Agent
          phone: addUserPhone.trim() || undefined,
          password: addUserPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create agent");
      }

      toast.success(`Agent ${addUserName} created successfully!`);
      setShowAddUserModal(false);

      // Show credentials modal with one-time copy reminder
      setCreatedUserCredentials({
        full_name: addUserName.trim(),
        email: addUserEmail.trim(),
        role: "Agent",
        password: addUserPassword,
      });

      // Reset form
      setAddUserName("");
      setAddUserEmail("");
      setAddUserPhone("");
      setAddUserPassword("");
      setShowPasswordText(false);

      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to create agent");
    } finally {
      setCreatingUser(false);
    }
  };

  // Confirm and Delete Agent
  const handleConfirmDeleteAgent = async () => {
    if (!agentToDelete) return;
    const target = agentToDelete;
    setAgentToDelete(null);

    const toastId = toast.loading(`Removing Agent ${target.full_name}...`);
    try {
      const res = await fetch(`/api/users?id=${target.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete agent");
      }
      toast.success(`Agent "${target.full_name}" removed successfully.`, { id: toastId });
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete agent", { id: toastId });
    }
  };

  // Copy credentials helper
  const handleCopyCredentials = () => {
    if (!createdUserCredentials) return;
    const text = `Maruthi Insure Care - Agent Login Details\nName: ${createdUserCredentials.full_name}\nRole: Agent\nEmail: ${createdUserCredentials.email}\nPassword: ${createdUserCredentials.password}\nPortal Link: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    toast.success("Agent credentials copied to clipboard!");
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.newPass || passwordForm.newPass.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast.error("New passwords do not match");
      return;
    }

    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPass,
      });

      if (error) throw error;

      toast.success("Your password has been changed successfully!");
      setPasswordForm({ current: "", newPass: "", confirm: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Filtered Agent Users (Simple search only, no complicated role/status filters)
  const filteredUsers = users.filter((u) => {
    if (!searchUser.trim()) return true;
    const q = searchUser.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone || "").toLowerCase().includes(q)
    );
  });

  const tabs = [
    { id: "agency", label: "Agency Profile", icon: "🏢" },
    { id: "users", label: "Agent Management", icon: "👥", count: users.length },
    { id: "templates", label: "WhatsApp Templates", icon: "💬" },
    { id: "notifications", label: "Notification Preferences", icon: "🔔" },
    { id: "categories", label: "Document Categories", icon: "📁", count: categories.length },
    { id: "portal", label: "Client Portal Settings", icon: "🌐" },
    { id: "security", label: "Change Password", icon: "🔒" },
  ];

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 animate-in fade-in slide-in-from-left-4 duration-500">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#0F172A] mb-1">
            System <span className="text-[#005A87]">Settings</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Configure agency details, agent staff accounts, document categories, and outreach automation.
          </p>
        </div>
        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#005A87] hover:bg-[#00476b] text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-[#005A87]/20 active:scale-95 disabled:opacity-50"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Saving Changes...
            </>
          ) : saved ? (
            "✓ Changes Saved!"
          ) : (
            "Save All Changes"
          )}
        </button>
      </header>

      <div className="grid lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-1 space-y-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                  isActive
                    ? "bg-white text-[#005A87] shadow-sm border border-slate-200/80 translate-x-1"
                    : "text-slate-500 hover:text-[#0F172A] hover:bg-white/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive ? "bg-[#005A87]/10 text-[#005A87]" : "bg-slate-200/60 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Content Container */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-10">
            {/* ── 1. Agency Profile ────────────────────────────────────────── */}
            {activeTab === "agency" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-black text-[#0F172A]">Agency Profile</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Core agency branding and contact credentials
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Agency Name *</label>
                    <input
                      type="text"
                      value={agencyForm.name}
                      onChange={(e) => setAgencyForm({ ...agencyForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#005A87] focus:ring-2 focus:ring-[#005A87]/10 outline-none font-semibold text-sm text-[#0F172A]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Registration / License No</label>
                    <input
                      type="text"
                      value={agencyForm.regNo}
                      onChange={(e) => setAgencyForm({ ...agencyForm, regNo: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#005A87] focus:ring-2 focus:ring-[#005A87]/10 outline-none font-semibold text-sm text-[#0F172A]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Contact Phone Number</label>
                    <input
                      type="text"
                      value={agencyForm.phone}
                      onChange={(e) => setAgencyForm({ ...agencyForm, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#005A87] focus:ring-2 focus:ring-[#005A87]/10 outline-none font-semibold text-sm text-[#0F172A]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Contact Email Address</label>
                    <input
                      type="email"
                      value={agencyForm.email}
                      onChange={(e) => setAgencyForm({ ...agencyForm, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#005A87] focus:ring-2 focus:ring-[#005A87]/10 outline-none font-semibold text-sm text-[#0F172A]"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-600">Registered Office Address</label>
                    <textarea
                      rows={2}
                      value={agencyForm.address}
                      onChange={(e) => setAgencyForm({ ...agencyForm, address: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#005A87] focus:ring-2 focus:ring-[#005A87]/10 outline-none font-semibold text-sm text-[#0F172A]"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-600">Logo Image URL</label>
                    <input
                      type="text"
                      value={agencyForm.logoUrl}
                      onChange={(e) => setAgencyForm({ ...agencyForm, logoUrl: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#005A87] focus:ring-2 focus:ring-[#005A87]/10 outline-none font-semibold text-sm text-[#0F172A]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-[#005A87] text-white text-xs font-bold hover:bg-[#00476b] transition-all shadow-sm"
                  >
                    Save Agency Profile
                  </button>
                </div>
              </div>
            )}

            {/* ── 2. Agent Management (Clean & Normal — No Filters, strictly Agent) ── */}
            {activeTab === "users" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-xl font-black text-[#0F172A]">Agent Management</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Manage agents who can manage clients, upload documents, view family records, and track renewals.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddUserModal(true);
                      setAddUserPassword("");
                      setShowPasswordText(false);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#005A87] text-white rounded-xl font-bold text-xs hover:bg-[#00476b] transition-all shadow-sm shadow-[#005A87]/20 active:scale-95"
                  >
                    <span className="text-base leading-none">+</span> Add Agent
                  </button>
                </div>

                {/* Simple Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search agents by name, email, or phone..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0F172A] focus:bg-white focus:border-[#005A87] outline-none"
                  />
                  <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
                </div>

                {/* Agent List */}
                {usersLoading ? (
                  <div className="py-12 text-center text-slate-400 font-medium text-sm">
                    <svg className="animate-spin h-6 w-6 text-[#005A87] mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Loading agents...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-sm font-bold text-slate-600">No agents found</p>
                    <p className="text-xs text-slate-400 mt-1">Click &quot;+ Add Agent&quot; above to onboard an agent account.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <div
                        key={u.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-slate-50/60 transition-colors"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm bg-blue-100 text-blue-700 border border-blue-200 shadow-xs shrink-0">
                            {u.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[#0F172A]">{u.full_name}</span>
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#005A87]/10 text-[#005A87] border border-[#005A87]/20">
                                🛡️ Agent
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                              Manage clients, upload documents, view family records, and track renewals
                            </p>
                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                              <span>📧 {u.email}</span>
                              {u.phone && <span>📞 {u.phone}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                          {u.created_at && (
                            <span className="text-[11px] text-slate-400 font-medium">
                              Joined {new Date(u.created_at).toLocaleDateString()}
                            </span>
                          )}
                          <button
                            onClick={() => setAgentToDelete(u)}
                            className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-all"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── 3. WhatsApp Templates ───────────────────────────────────── */}
            {activeTab === "templates" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-black text-[#0F172A]">WhatsApp Outreach Templates</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Personalized bilingual templates with instant WhatsApp preview
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Birthday English */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Birthday Wish (English)</label>
                      <span className="text-[11px] text-slate-400">English</span>
                    </div>
                    <textarea
                      rows={4}
                      value={templates.birthdayEnglish}
                      onChange={(e) => setTemplates({ ...templates, birthdayEnglish: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#005A87] outline-none text-xs font-semibold text-[#0F172A]"
                    />
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Supports emojis and line breaks</span>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(templates.birthdayEnglish)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#005A87] font-bold hover:underline"
                      >
                        📲 Test on WhatsApp →
                      </a>
                    </div>
                  </div>

                  {/* Birthday Tamil */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Birthday Wish (Tamil)</label>
                      <span className="text-[11px] text-slate-400">தமிழ் வாழ்த்து</span>
                    </div>
                    <textarea
                      rows={4}
                      value={templates.birthdayTamil}
                      onChange={(e) => setTemplates({ ...templates, birthdayTamil: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#005A87] outline-none text-xs font-semibold text-[#0F172A]"
                    />
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Tamil unicode font supported</span>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(templates.birthdayTamil)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#005A87] font-bold hover:underline"
                      >
                        📲 Test on WhatsApp →
                      </a>
                    </div>
                  </div>

                  {/* Anniversary English */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Wedding Anniversary (English)</label>
                      <span className="text-[11px] text-slate-400">English</span>
                    </div>
                    <textarea
                      rows={4}
                      value={templates.anniversaryEnglish}
                      onChange={(e) => setTemplates({ ...templates, anniversaryEnglish: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#005A87] outline-none text-xs font-semibold text-[#0F172A]"
                    />
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Supports emojis</span>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(templates.anniversaryEnglish)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#005A87] font-bold hover:underline"
                      >
                        📲 Test on WhatsApp →
                      </a>
                    </div>
                  </div>

                  {/* Anniversary Tamil */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Wedding Anniversary (Tamil)</label>
                      <span className="text-[11px] text-slate-400">திருமண நாள் வாழ்த்து</span>
                    </div>
                    <textarea
                      rows={4}
                      value={templates.anniversaryTamil}
                      onChange={(e) => setTemplates({ ...templates, anniversaryTamil: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#005A87] outline-none text-xs font-semibold text-[#0F172A]"
                    />
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Tamil unicode font supported</span>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(templates.anniversaryTamil)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#005A87] font-bold hover:underline"
                      >
                        📲 Test on WhatsApp →
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-[#005A87] text-white text-xs font-bold hover:bg-[#00476b] transition-all shadow-sm"
                  >
                    Save WhatsApp Templates
                  </button>
                </div>
              </div>
            )}

            {/* ── 4. Notification Preferences ─────────────────────────────── */}
            {activeTab === "notifications" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-black text-[#0F172A]">Notification Preferences</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Control automated alert notifications
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
                    <div>
                      <h4 className="font-bold text-sm text-[#0F172A]">Email Alerts</h4>
                      <p className="text-xs text-slate-500 font-medium">Daily summary of upcoming renewals and birthdays</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emailAlerts}
                      onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                      className="w-5 h-5 accent-[#005A87] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
                    <div>
                      <h4 className="font-bold text-sm text-[#0F172A]">SMS Alerts</h4>
                      <p className="text-xs text-slate-500 font-medium">Urgent policy expiry notifications via SMS gateway</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.smsAlerts}
                      onChange={(e) => setNotifications({ ...notifications, smsAlerts: e.target.checked })}
                      className="w-5 h-5 accent-[#005A87] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
                    <div>
                      <h4 className="font-bold text-sm text-[#0F172A]">Outreach & Marketing Broadcasts</h4>
                      <p className="text-xs text-slate-500 font-medium">Bulk seasonal festival greetings and promotional campaigns</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.marketing}
                      onChange={(e) => setNotifications({ ...notifications, marketing: e.target.checked })}
                      className="w-5 h-5 accent-[#005A87] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-[#005A87] text-white text-xs font-bold hover:bg-[#00476b] transition-all shadow-sm"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* ── 5. Document Categories ──────────────────────────────────── */}
            {activeTab === "categories" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-xl font-black text-[#0F172A]">Document Categories</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      Organize client vaults with customized category tags ({categories.length})
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setNewCatName("");
                      setShowAddCatModal(true);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#005A87] text-white rounded-xl font-bold text-xs hover:bg-[#00476b] transition-all shadow-sm shadow-[#005A87]/20 active:scale-95"
                  >
                    <span className="text-base leading-none">+</span> Add New Category
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((c, i) => (
                    <div
                      key={i}
                      className="px-4 py-3 bg-slate-50/80 border border-slate-200/90 rounded-2xl flex items-center justify-between group hover:bg-white hover:border-[#005A87]/40 transition-all shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#005A87]"></span>
                        <span className="font-bold text-xs text-[#0F172A]">{c}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveCategory(c)}
                        title="Delete category"
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 text-xs font-bold transition-all"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50/60 border border-blue-200/60 rounded-2xl p-4 text-xs text-slate-600 flex items-center gap-2.5">
                  <span className="text-lg">💡</span>
                  <span>
                    Categories added here automatically update across the <strong>Document Vault</strong> (including top category cards, filter tabs, and document upload pickers) and are saved automatically.
                  </span>
                </div>
              </div>
            )}

            {/* ── 6. Client Portal Settings ───────────────────────────────── */}
            {activeTab === "portal" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-black text-[#0F172A]">Client Portal Settings</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Self-service access configuration for policyholders
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 rounded-2xl border-2 border-[#005A87]/20 bg-blue-50/50">
                    <div>
                      <h4 className="font-black text-[#0F172A] text-base">Enable Client Portal Globally</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        When disabled, clients cannot log in to view documents even with valid credentials.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={portal.enableClientPortal}
                        onChange={(e) => setPortal({ ...portal, enableClientPortal: e.target.checked })}
                      />
                      <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#005A87]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
                    <div>
                      <h4 className="font-bold text-sm text-[#0F172A]">Require Two-Factor (OTP) Login</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Sends a verification code to client mobile number before granting portal access
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={portal.require2FA}
                      onChange={(e) => setPortal({ ...portal, require2FA: e.target.checked })}
                      className="w-5 h-5 accent-[#005A87] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-[#005A87] text-white text-xs font-bold hover:bg-[#00476b] transition-all shadow-sm"
                  >
                    Save Portal Settings
                  </button>
                </div>
              </div>
            )}

            {/* ── 7. Change Password ──────────────────────────────────────── */}
            {activeTab === "security" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-black text-[#0F172A]">Change Password</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Update your current login credentials
                  </p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">New Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={passwordForm.newPass}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#005A87] outline-none text-xs font-semibold text-[#0F172A]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Confirm New Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Re-type new password"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#005A87] outline-none text-xs font-semibold text-[#0F172A]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={updatingPassword}
                      className="px-6 py-2.5 rounded-xl bg-[#005A87] text-white text-xs font-bold hover:bg-[#00476b] transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      {updatingPassword ? "Updating Password..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal: Unsaved Changes Confirmation Before Tab Switching ────────── */}
      {pendingTabSwitch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl mx-auto shadow-xs">
                ⚠️
              </div>
              <h3 className="text-lg font-black text-[#0F172A]">Unsaved Changes</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                You have unsaved changes in this tab. Would you like to save them before proceeding, or discard them?
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleSaveAndNavigate}
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-[#005A87] text-white text-xs font-bold hover:bg-[#00476b] transition-all shadow-sm"
              >
                {saving ? "Saving Changes..." : "✓ Save Changes & Continue"}
              </button>
              <button
                onClick={handleDiscardChanges}
                className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all"
              >
                Discard Changes & Continue
              </button>
              <button
                onClick={() => setPendingTabSwitch(null)}
                className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Cancel / Stay Here
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Add Document Category ─────────────────────────────────────── */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0F172A]">Add Document Category</h3>
              <button
                onClick={() => setShowAddCatModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Property Deeds, Driving License, Tax Returns"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#005A87] outline-none text-xs font-semibold text-[#0F172A]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#005A87] text-white text-xs font-bold hover:bg-[#00476b] shadow-sm"
                >
                  {saving ? "Saving..." : "Add & Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Add Agent (Strictly Agent role) ───────────────────────────── */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#0F172A]">Add New Agent</h3>
                <p className="text-xs text-slate-400 font-semibold">Create an agent account for Maruthi Insure Care</p>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 mt-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Agent Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={addUserName}
                  onChange={(e) => setAddUserName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#005A87] outline-none text-xs font-semibold text-[#0F172A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@maruthiinsure.com"
                  value={addUserEmail}
                  onChange={(e) => setAddUserEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#005A87] outline-none text-xs font-semibold text-[#0F172A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Phone (Optional)</label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="10 digits"
                  value={addUserPhone}
                  onChange={(e) => setAddUserPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#005A87] outline-none text-xs font-semibold text-[#0F172A]"
                />
              </div>

              {/* Agent Role Info Box matching landing page */}
              <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#005A87]/10 text-[#005A87] flex items-center justify-center font-bold text-sm shrink-0">
                  🛡️
                </div>
                <div>
                  <div className="text-xs font-bold text-[#005A87]">Assigned Role: Agent</div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-medium">
                    Authorized to manage clients, upload documents, view family records, and track renewals.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Account Password *</label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-[11px] font-bold text-[#005A87] hover:underline"
                  >
                    🎲 Auto-generate Strong Password
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPasswordText ? "text" : "password"}
                    required
                    placeholder="Enter password (minimum 6 characters)"
                    value={addUserPassword}
                    onChange={(e) => setAddUserPassword(e.target.value)}
                    className="w-full pl-4 pr-16 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#005A87] outline-none text-xs font-semibold text-[#0F172A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-3 text-[11px] text-slate-500 font-bold hover:text-slate-700"
                  >
                    {showPasswordText ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 flex items-start gap-2">
                <span className="text-base leading-none">ℹ️</span>
                <span>
                  After creating this agent, you will be shown the generated credentials once. Make sure to copy and share
                  them immediately.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-5 py-2.5 rounded-xl bg-[#005A87] text-white text-xs font-bold hover:bg-[#00476b] shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {creatingUser ? "Creating Agent Account..." : "Create Agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Confirm Remove Agent ──────────────────────────────────────── */}
      {agentToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-2xl mx-auto shadow-xs">
                🗑️
              </div>
              <h3 className="text-lg font-black text-[#0F172A]">Confirm Agent Removal</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Are you sure you want to remove Agent <strong>{agentToDelete.full_name}</strong> ({agentToDelete.email})?
              </p>
            </div>

            <div className="bg-red-50 border border-red-200/80 rounded-2xl p-3 text-[11px] text-red-700 font-medium">
              ⚠️ This will revoke portal login access for this agent account. This action cannot be undone.
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAgentToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAgent}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                Yes, Remove Agent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: User Created Credentials Summary (One-Time View) ───────────── */}
      {createdUserCredentials && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mx-auto shadow-xs">
                ✓
              </div>
              <h3 className="text-lg font-black text-[#0F172A]">Agent Created Successfully!</h3>
              <p className="text-xs text-slate-500 font-medium">
                The agent account has been created and is ready to sign in.
              </p>
            </div>

            {/* Credential Details Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Agent Name</span>
                <span className="font-bold text-[#0F172A]">{createdUserCredentials.full_name}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Role</span>
                <span className="font-black text-[#005A87] px-2 py-0.5 rounded bg-[#005A87]/10">
                  🛡️ Agent
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Email</span>
                <span className="font-mono font-bold text-[#0F172A]">{createdUserCredentials.email}</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Password</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {createdUserCredentials.password}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdUserCredentials.password);
                      toast.success("Password copied!");
                    }}
                    className="text-[11px] text-[#005A87] font-bold hover:underline"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {/* Prominent Warning Callout */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-red-700 font-bold text-xs">
                <span>⚠️</span>
                <span>Important Security Notice</span>
              </div>
              <p className="text-[11px] text-red-600 leading-relaxed font-medium">
                You will <strong>NOT</strong> be able to view this password again after closing this dialog. Please make a
                copy now and securely share it with the agent.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={handleCopyCredentials}
                className="flex-1 py-2.5 rounded-xl border border-[#005A87] bg-blue-50 text-[#005A87] font-bold text-xs hover:bg-blue-100 transition-all flex items-center justify-center gap-1.5"
              >
                📋 Copy All Details
              </button>
              <button
                onClick={() => setCreatedUserCredentials(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#005A87] text-white font-bold text-xs hover:bg-[#00476b] transition-all shadow-sm"
              >
                Done & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
