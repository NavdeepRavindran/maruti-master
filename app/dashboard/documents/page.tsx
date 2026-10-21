"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface DocData {
  id: string;
  name: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  client_name?: string;
  client_id: string;
  file_url?: string;
  category?: DocCategory;
  family_member_id?: string;
  family_member_name?: string;
}

type DocCategory = string;

interface CategoryConfig {
  key: string;
  label: string;
  color: string;
  bg: string;
  borderColor: string;
}

const DEFAULT_CATEGORIES: CategoryConfig[] = [
  {
    key: "KYC / Identity",
    label: "KYC & Identity",
    color: "#7c3aed",
    bg: "#f5f3ff",
    borderColor: "#ddd6fe",
  },
  {
    key: "Policy Documents",
    label: "Policy Documents",
    color: "#2563eb",
    bg: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  {
    key: "Financial / Tax",
    label: "Financial & Tax",
    color: "#d97706",
    bg: "#fffbeb",
    borderColor: "#fde68a",
  },
  {
    key: "Health Records",
    label: "Health Records",
    color: "#16a34a",
    bg: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  {
    key: "Vehicle RC / Insurance",
    label: "Vehicle & Auto",
    color: "#0891b2",
    bg: "#ecfeff",
    borderColor: "#a5f3fc",
  },
  {
    key: "Others",
    label: "General / Others",
    color: "#64748b",
    bg: "#f8fafc",
    borderColor: "#e2e8f0",
  },
];

const PRESET_PALETTES = [
  { color: "#0284c7", bg: "#f0f9ff", borderColor: "#bae6fd" },
  { color: "#8b5cf6", bg: "#f5f3ff", borderColor: "#ddd6fe" },
  { color: "#ec4899", bg: "#fdf2f8", borderColor: "#fbcfe8" },
  { color: "#14b8a6", bg: "#f0fdfa", borderColor: "#99f6e4" },
  { color: "#f59e0b", bg: "#fffbeb", borderColor: "#fde68a" },
  { color: "#6366f1", bg: "#eef2ff", borderColor: "#c7d2fe" },
  { color: "#059669", bg: "#ecfdf5", borderColor: "#a7f3d0" },
];

let dynamicCategories: CategoryConfig[] = [...DEFAULT_CATEGORIES];

const getCat = (key?: string) => {
  if (!key) return dynamicCategories.find(c => c.key === "Others") || DEFAULT_CATEGORIES[5];
  const found = dynamicCategories.find(c => c.key.toLowerCase() === key.toLowerCase());
  if (found) return found;
  if (/kyc|aadhaar|pan|identity/i.test(key)) return DEFAULT_CATEGORIES[0];
  if (/policy|insurance|premium/i.test(key)) return DEFAULT_CATEGORIES[1];
  if (/financial|tax|form 16|itr|salary|bank/i.test(key)) return DEFAULT_CATEGORIES[2];
  if (/health|medical|hospital/i.test(key)) return DEFAULT_CATEGORIES[3];
  if (/vehicle|motor|rc|car|bike/i.test(key)) return DEFAULT_CATEGORIES[4];
  return {
    key: key,
    label: key,
    color: "#64748b",
    bg: "#f8fafc",
    borderColor: "#e2e8f0",
  };
};

function CategoryIcon({ category, size = 18, color }: { category?: string; size?: number; color?: string }) {
  const c = color || "currentColor";
  const catKey = getCat(category).key;
  switch (catKey) {
    case "KYC / Identity":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <circle cx="9" cy="10" r="2" />
          <path d="M15 8h2" />
          <path d="M15 12h2" />
          <path d="M7 16c0-1.5 1.5-2 3-2s3 .5 3 2" />
        </svg>
      );
    case "Policy Documents":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case "Financial / Tax":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "Health Records":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      );
    case "Vehicle RC / Insurance":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <path d="M9 17h6" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      );
    case "Others":
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      );
  }
}

function FileTypeIcon({ type, size = 18, color }: { type?: string; size?: number; color?: string }) {
  const c = color || "currentColor";
  if (type === "PDF") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 15h2a1.5 1.5 0 0 0 0-3H9v6" />
      </svg>
    );
  }
  if (type === "IMG") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="13 2 13 9 20 9" />
    </svg>
  );
}

export default function DocumentsPage() {
  const supabase = createClient();

  const [docs, setDocs] = useState<DocData[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<DocCategory | "all">("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<DocData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({
    name: "", file_name: "", file_size: 0, file_url: "", client_id: "", family_member_id: "",
    category: "" as DocCategory | "",
  });
  const [clientFamily, setClientFamily] = useState<{ id: string; name: string; relationship: string }[]>([]);
  const [vaultTab, setVaultTab] = useState<"active" | "recycle_bin">("active");
  const [restoringDocId, setRestoringDocId] = useState<string | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [categoryItems, setCategoryItems] = useState<CategoryConfig[]>(DEFAULT_CATEGORIES);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          const list: CategoryConfig[] = [];
          data.categories.forEach((name: string, i: number) => {
            const def = DEFAULT_CATEGORIES.find(c => c.key.toLowerCase() === name.toLowerCase());
            if (def) {
              list.push(def);
            } else {
              const pal = PRESET_PALETTES[i % PRESET_PALETTES.length];
              list.push({
                key: name,
                label: name,
                color: pal.color,
                bg: pal.bg,
                borderColor: pal.borderColor,
              });
            }
          });
          dynamicCategories = list;
          setCategoryItems(list);
        }
      }
    } catch (e) {
      console.error("Failed to load settings categories:", e);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchDocs, 300);
    fetchClients();
    return () => clearTimeout(t);
  }, [search]);

  async function getAuthHeaders(): Promise<Record<string, string> | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return null;
    return { Authorization: `Bearer ${session.access_token}` };
  }

  async function fetchClients() {
    try {
      const headers = await getAuthHeaders();
      if (!headers) return;
      const res = await fetch("/api/clients", { headers });
      const data = await res.json();
      setClients(data.clients || []);
    } catch (e) { console.error(e); }
  }

  async function handleClientSelect(cid: string) {
    setUploadForm(prev => ({ ...prev, client_id: cid, family_member_id: "" }));
    setClientFamily([]);
    if (!cid) return;
    try {
      const headers = await getAuthHeaders();
      if (!headers) return;
      const res = await fetch(`/api/clients/${cid}/family`, { headers });
      const d = await res.json();
      setClientFamily(d.family || []);
    } catch {}
  }

  async function fetchDocs() {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      if (!headers) return;
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/documents${params}`, { headers });
      const data = await res.json();
      setDocs(data.documents || []);
    } catch { } finally { setLoading(false); }
  }

  async function deleteDoc(id: string) {
    if (!confirm("Move this document to Recycle Bin? You can restore it anytime within 30 days.")) return;
    try {
      const headers = await getAuthHeaders();
      if (!headers) return;
      await fetch(`/api/documents/${id}`, {
        method: "DELETE",
        headers,
      });
      fetchDocs();
    } catch { }
  }

  async function restoreDoc(id: string) {
    setRestoringDocId(id);
    try {
      const headers = await getAuthHeaders();
      if (!headers) return;
      await fetch(`/api/documents/${id}/restore`, {
        method: "POST",
        headers,
      });
      fetchDocs();
    } catch { } finally {
      setRestoringDocId(null);
    }
  }

  async function permanentDeleteDoc(id: string) {
    if (!confirm("Permanently delete this document from storage? This action CANNOT be undone.")) return;
    setDeletingDocId(id);
    try {
      const headers = await getAuthHeaders();
      if (!headers) return;
      await fetch(`/api/documents/${id}?permanent=true`, {
        method: "DELETE",
        headers,
      });
      fetchDocs();
    } catch { } finally {
      setDeletingDocId(null);
    }
  }

  async function handleUpload() {
    if (!uploadForm.name || !selectedFile || !uploadForm.client_id || !uploadForm.category)
      return alert("Please fill all fields, select a category, and attach a file");
    setUploading(true);
    try {
      const headers = await getAuthHeaders();
      if (!headers) return;

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("client_id", uploadForm.client_id);
      if (uploadForm.family_member_id) {
        formData.append("family_member_id", uploadForm.family_member_id);
      }
      formData.append("name", uploadForm.name);
      formData.append("category", uploadForm.category);
      const res = await fetch("/api/documents", {
        method: "POST",
        headers,
        body: formData,
      });
      if (res.ok) {
        setShowUploadModal(false);
        setUploadForm({ name: "", file_name: "", file_size: 0, file_url: "", client_id: "", family_member_id: "", category: "" });
        setSelectedFile(null);
        setClientFamily([]);
        fetchDocs();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save document");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally { setUploading(false); }
  }

  const formatSize = (b: number) => b < 1048576 ? (b / 1024).toFixed(1) + " KB" : (b / 1048576).toFixed(1) + " MB";
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const typeConfig: Record<string, { bg: string; color: string }> = {
    PDF: { bg: "#fef2f2", color: "#dc2626" },
    IMG: { bg: "#fffbeb", color: "#d97706" },
    DOC: { bg: "#eff6ff", color: "#2563eb" },
  };
  const getType = (t: string) => typeConfig[t] || { bg: "#f8fafc", color: "#64748b" };

  const isDocDeleted = (d: DocData & { raw_name?: string; is_deleted?: boolean }) => {
    if (d.is_deleted === true || (d as any).is_deleted === "true") return true;
    if (typeof d.name === "string" && d.name.startsWith("[RECYCLE_BIN]")) return true;
    if (typeof d.raw_name === "string" && d.raw_name.startsWith("[RECYCLE_BIN]")) return true;
    return false;
  };

  const cleanDocName = (d: DocData & { raw_name?: string }) => {
    const raw = d.name || d.raw_name || "";
    return raw.replace(/^\[RECYCLE_BIN\]\s*/, "").trim();
  };

  const activeDocs = docs.filter(d => !isDocDeleted(d)).map(d => ({ ...d, name: cleanDocName(d) }));
  const recycledDocs = docs.filter(d => isDocDeleted(d)).map(d => ({ ...d, name: cleanDocName(d) }));

  const currentTabDocs = vaultTab === "active" ? activeDocs : recycledDocs;
  const filteredDocs = activeCategory === "all"
    ? currentTabDocs
    : currentTabDocs.filter(d => getCat(d.category).key === activeCategory);

  const totalSize = activeDocs.reduce((a, d) => a + d.file_size, 0);
  const pdfCount = activeDocs.filter(d => d.file_type === "PDF").length;
  const imgCount = activeDocs.filter(d => d.file_type === "IMG").length;
  const otherCount = activeDocs.filter(d => !["PDF", "IMG"].includes(d.file_type)).length;
  const usedPct = Math.min((totalSize / (2 * 1073741824)) * 100, 100);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');

        .dp-root {
          font-family: 'DM Sans', sans-serif;
          padding: 16px;
          max-width: 1400px;
          margin: 0 auto;
          color: #0f172a;
        }
        @media (min-width: 640px) { .dp-root { padding: 24px; } }
        @media (min-width: 1024px) { .dp-root { padding: 32px 40px; } }

        /* ── Header ── */
        .dp-header {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 24px;
        }
        @media (min-width: 640px) {
          .dp-header { flex-direction: row; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 32px; }
        }

        .dp-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(22px, 5vw, 36px);
          font-weight: 800;
          color: #0f172a;
          line-height: 1.1;
          margin: 0 0 4px;
          letter-spacing: -0.5px;
        }
        .dp-title span { color: #3b82f6; }
        .dp-subtitle { font-size: 13px; color: #64748b; font-weight: 500; margin: 0; }

        .dp-upload-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 20px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 4px 14px rgba(59,130,246,0.35);
          transition: all 0.18s;
          align-self: flex-start;
        }
        @media (min-width: 640px) { .dp-upload-btn { align-self: auto; } }
        .dp-upload-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(59,130,246,0.45); }
        .dp-upload-btn:active { transform: scale(0.97); }

        /* ── Category Cards (Top Permanent Section) ── */
        .dp-cat-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 14px;
        }
        @media (min-width: 640px) { .dp-cat-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; } }
        @media (min-width: 1024px) { .dp-cat-grid { grid-template-columns: repeat(6, 1fr); gap: 12px; } }

        .dp-cat-card {
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 16px;
          padding: 14px 16px;
          cursor: pointer;
          transition: all 0.18s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          text-align: left;
          font-family: inherit;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .dp-cat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
        .dp-cat-card.active { border-width: 2px; box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
        .dp-cat-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          flex-shrink: 0;
        }
        .dp-cat-count {
          font-family: 'Sora', sans-serif;
          font-size: clamp(20px,4vw,26px);
          font-weight: 800;
          color: #0f172a;
          line-height: 1;
          margin-bottom: 4px;
        }
        .dp-cat-name {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94a3b8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── Stats row (Top Permanent Section) ── */
        .dp-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 24px;
        }
        @media (min-width: 640px) { .dp-stats { grid-template-columns: repeat(4, 1fr); gap: 12px; } }

        .dp-stat {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px 16px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .dp-stat-info { display: flex; flex-direction: column; }
        .dp-stat-val {
          font-family: 'Sora', sans-serif;
          font-size: clamp(20px, 4vw, 28px);
          font-weight: 800;
          color: #0f172a;
          line-height: 1;
          margin-bottom: 4px;
        }
        .dp-stat-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8; }
        .dp-stat-icon-box {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* ── Lower Section: Filter Bar & Recycle Bin ── */
        .dp-filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }
        .dp-filter-tabs { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
        .dp-filter-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 20px;
          border: 1.5px solid #e2e8f0; background: #fff;
          font-size: 12px; font-weight: 700; color: #64748b;
          cursor: pointer; font-family: inherit; transition: all 0.15s; white-space: nowrap;
        }
        .dp-filter-tab:hover { border-color: #94a3b8; color: #1e293b; }
        .dp-filter-tab.active { color: #fff; border-color: transparent; box-shadow: 0 2px 8px rgba(0,0,0,0.12); }
        .dp-filter-tab-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

        .dp-recycle-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          border: 1.5px solid #fed7aa;
          background: #fff7ed;
          color: #c2410c;
          transition: all 0.18s;
          white-space: nowrap;
          box-shadow: 0 1px 3px rgba(194,65,12,0.06);
        }
        .dp-recycle-tab-btn:hover {
          background: #ffedd5;
          border-color: #fdba74;
          color: #9a3412;
          transform: translateY(-1px);
        }
        .dp-recycle-tab-btn.active {
          background: #ef4444;
          border-color: #ef4444;
          color: #fff;
          box-shadow: 0 3px 12px rgba(239,68,68,0.25);
        }
        .dp-recycle-badge {
          background: #fee2e2;
          color: #dc2626;
          font-size: 10px;
          font-weight: 800;
          padding: 1px 7px;
          border-radius: 99px;
          line-height: 1.3;
        }
        .dp-recycle-tab-btn.active .dp-recycle-badge {
          background: rgba(255,255,255,0.25);
          color: #fff;
        }

        /* ── Recycle Banner (Inside Files Area) ── */
        .dp-recycle-banner {
          background: #fff7ed;
          border-bottom: 1.5px solid #fed7aa;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .dp-recycle-banner-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .dp-recycle-banner-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #fee2e2;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .dp-recycle-banner-title {
          font-size: 13px;
          font-weight: 700;
          color: #9a3412;
        }
        .dp-recycle-banner-sub {
          font-size: 11px;
          color: #c2410c;
          font-weight: 500;
        }
        .dp-recycle-banner-close {
          padding: 6px 14px;
          background: #fff;
          border: 1px solid #fdba74;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          color: #c2410c;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }
        .dp-recycle-banner-close:hover {
          background: #fff7ed;
          color: #9a3412;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }

        .dp-empty-icon-box {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          color: #94a3b8;
        }

        /* ── Main layout ── */
        .dp-layout {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        @media (min-width: 1024px) {
          .dp-layout { flex-direction: row; align-items: flex-start; gap: 24px; }
        }

        /* ── File section ── */
        .dp-files {
          flex: 1;
          min-width: 0;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
        }

        .dp-files-header {
          padding: 14px 16px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        @media (min-width: 640px) { .dp-files-header { padding: 16px 20px; } }

        .dp-search-wrap {
          flex: 1;
          min-width: 140px;
          position: relative;
        }
        .dp-search-icon {
          position: absolute;
          left: 12px; top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }
        .dp-search {
          width: 100%;
          padding: 9px 12px 9px 36px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 13px;
          font-family: inherit;
          color: #0f172a;
          outline: none;
          background: #f8fafc;
          transition: border-color 0.15s, background 0.15s;
        }
        .dp-search:focus { border-color: #3b82f6; background: #fff; }

        .dp-view-toggle {
          display: flex;
          gap: 2px;
          background: #f1f5f9;
          border-radius: 9px;
          padding: 3px;
          flex-shrink: 0;
        }
        .dp-view-btn {
          padding: 6px 8px;
          border-radius: 7px;
          border: none;
          cursor: pointer;
          background: transparent;
          color: #94a3b8;
          transition: all 0.15s;
          display: flex;
          align-items: center;
        }
        .dp-view-btn.active { background: #fff; color: #3b82f6; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

        .dp-files-title {
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          display: none;
        }
        @media (min-width: 640px) { .dp-files-title { display: block; } }

        /* ── Empty / Loading ── */
        .dp-empty { padding: 48px 20px; text-align: center; }
        .dp-spinner {
          width: 28px; height: 28px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: dpspin 0.7s linear infinite;
          margin: 0 auto 12px;
        }
        @keyframes dpspin { to { transform: rotate(360deg); } }

        /* ── Category pill (NEW) ── */
        .dp-cat-pill {
          display: inline-flex; align-items: center; gap: 3px;
          padding: 2px 7px; border-radius: 99px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.04em;
        }

        /* ── Grid view ── */
        .dp-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          padding: 12px;
        }
        @media (min-width: 480px) { .dp-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 16px; } }
        @media (min-width: 768px) { .dp-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1280px) { .dp-grid { grid-template-columns: repeat(3, 1fr); } }

        .dp-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px;
          transition: all 0.18s;
          position: relative;
          overflow: hidden;
        }
        .dp-card:hover {
          background: #fff;
          border-color: #bfdbfe;
          box-shadow: 0 8px 24px rgba(59,130,246,0.12);
          transform: translateY(-2px);
        }
        .dp-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px; }
        .dp-card-type {
          width: 40px; height: 40px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
        }
        .dp-card-actions { display: flex; gap: 4px; }
        .dp-card-action {
          width: 28px; height: 28px;
          border-radius: 7px;
          background: #fff;
          border: 1px solid #e2e8f0;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #94a3b8;
          transition: all 0.15s; text-decoration: none;
        }
        .dp-card-action:hover { color: #3b82f6; border-color: #bfdbfe; background: #eff6ff; }
        .dp-card-action.del:hover { color: #ef4444; border-color: #fecaca; background: #fef2f2; }

        .dp-card-name {
          font-size: 13px; font-weight: 700; color: #0f172a;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 4px;
        }
        .dp-card-owner { font-size: 10px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
        .dp-card-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 8px;
          border-top: 1px solid #f1f5f9;
        }
        .dp-card-meta { font-size: 10px; font-weight: 600; color: #94a3b8; }

        /* ── List view ── */
        .dp-list { padding: 0; }
        .dp-list-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.12s;
        }
        .dp-list-row:last-child { border-bottom: none; }
        .dp-list-row:hover { background: #f8fafc; }

        .dp-list-type {
          width: 36px; height: 36px;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
        }
        .dp-list-info { flex: 1; min-width: 0; }
        .dp-list-name { font-size: 13px; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
        .dp-list-meta { font-size: 11px; color: #94a3b8; font-weight: 500; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

        /* Desktop table columns */
        .dp-list-col-owner { display: none; font-size: 12px; color: #64748b; font-weight: 500; min-width: 100px; }
        .dp-list-col-date  { display: none; font-size: 12px; color: #64748b; font-weight: 500; min-width: 90px; white-space: nowrap; }
        .dp-list-col-size  { display: none; font-size: 12px; color: #64748b; font-weight: 500; min-width: 60px; white-space: nowrap; }
        @media (min-width: 640px) { .dp-list-col-owner { display: block; } }
        @media (min-width: 768px) { .dp-list-col-date { display: block; } .dp-list-col-size { display: block; } }

        .dp-list-actions { display: flex; gap: 4px; flex-shrink: 0; }
        .dp-list-action {
          width: 30px; height: 30px;
          border-radius: 8px;
          background: transparent;
          border: 1px solid transparent;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #94a3b8;
          transition: all 0.15s; text-decoration: none;
        }
        .dp-list-action:hover { color: #3b82f6; border-color: #bfdbfe; background: #eff6ff; }
        .dp-list-action.del:hover { color: #ef4444; border-color: #fecaca; background: #fef2f2; }

        /* ── Sidebar ── */
        .dp-sidebar {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        @media (min-width: 1024px) { .dp-sidebar { width: 260px; flex-shrink: 0; } }

        .dp-storage-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
        }

        .dp-storage-title {
          font-family: 'Sora', sans-serif;
          font-size: 14px; font-weight: 800; color: #0f172a;
          margin-bottom: 16px; letter-spacing: -0.2px;
        }

        .dp-storage-bar-bg {
          width: 100%; height: 8px;
          background: #f1f5f9; border-radius: 99px;
          overflow: hidden; margin-bottom: 10px;
        }
        .dp-storage-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #60a5fa);
          border-radius: 99px;
          transition: width 1s;
        }
        .dp-storage-nums {
          display: flex; justify-content: space-between; margin-bottom: 18px;
        }
        .dp-storage-num { font-family: 'Sora', sans-serif; font-size: 18px; font-weight: 800; color: #0f172a; line-height: 1; }
        .dp-storage-num-lbl { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 3px; }
        .dp-storage-num.dim .dp-storage-num { color: #cbd5e1; }

        /* Sidebar category breakdown (NEW — replaces old type list) */
        .dp-cat-breakdown { display: flex; flex-direction: column; gap: 10px; }
        .dp-cat-br-row { display: flex; align-items: center; justify-content: space-between; }
        .dp-cat-br-left { display: flex; align-items: center; gap: 8px; }
        .dp-cat-br-icon { width: 26px; height: 26px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
        .dp-cat-br-lbl { font-size: 12px; font-weight: 600; color: #334155; }
        .dp-cat-br-count { font-size: 11px; font-weight: 700; color: #94a3b8; }
        .dp-cat-br-bar-bg { height: 3px; background: #f1f5f9; border-radius: 99px; margin-top: 5px; overflow: hidden; }
        .dp-cat-br-bar { height: 100%; border-radius: 99px; }

        /* ── Modal ── */
        .dp-modal-bg {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(15,23,42,0.7);
          backdrop-filter: blur(8px);
          display: flex; align-items: flex-end; justify-content: center;
          padding: 0;
        }
        @media (min-width: 640px) {
          .dp-modal-bg { align-items: center; padding: 20px; }
        }

        .dp-modal {
          background: #fff;
          width: 100%;
          border-radius: 24px 24px 0 0;
          padding: 24px 20px;
          max-height: 95vh;
          overflow-y: auto;
          animation: dpSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1);
        }
        @media (min-width: 640px) {
          .dp-modal { max-width: 480px; border-radius: 20px; padding: 28px; animation: dpZoom 0.22s ease-out; }
        }
        @keyframes dpSlideUp { from { transform: translateY(100%); opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes dpZoom { from { transform: scale(0.95); opacity: 0; } to { transform: none; opacity: 1; } }

        .dp-modal-handle { width: 36px; height: 4px; border-radius: 2px; background: #e2e8f0; margin: 0 auto 20px; }
        @media (min-width: 640px) { .dp-modal-handle { display: none; } }

        .dp-modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .dp-modal-title { font-family: 'Sora', sans-serif; font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px; }
        .dp-modal-close {
          width: 32px; height: 32px; border-radius: 50%;
          background: #f1f5f9; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #64748b; font-size: 14px; transition: background 0.15s;
        }
        .dp-modal-close:hover { background: #e2e8f0; }

        .dp-field { margin-bottom: 14px; }
        .dp-field-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.16em; color: #94a3b8; display: block; margin-bottom: 6px; }
        .dp-field-input, .dp-field-select {
          width: 100%; padding: 11px 14px;
          border: 1.5px solid #e2e8f0; border-radius: 12px;
          font-size: 13px; font-family: inherit; color: #0f172a;
          background: #f8fafc; outline: none; appearance: none;
          transition: border-color 0.15s, background 0.15s;
        }
        .dp-field-input:focus, .dp-field-select:focus { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .dp-field-file {
          width: 100%; padding: 11px 14px;
          border: 1.5px dashed #e2e8f0; border-radius: 12px;
          font-size: 12px; font-family: inherit; color: #64748b;
          background: #f8fafc; cursor: pointer;
          transition: border-color 0.15s;
        }
        .dp-field-file:hover { border-color: #93c5fd; }
        .dp-file-hint { font-size: 11px; color: #22c55e; font-weight: 600; margin-top: 5px; }

        /* Category picker in modal (NEW) */
        .dp-cat-picker { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .dp-cat-pick-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 12px; border-radius: 12px;
          border: 1.5px solid #e2e8f0; background: #f8fafc;
          cursor: pointer; font-family: inherit; font-size: 13px;
          font-weight: 600; color: #334155; transition: all 0.15s; text-align: left;
        }
        .dp-cat-pick-btn:hover { border-color: #94a3b8; background: #fff; }
        .dp-cat-pick-btn.active { border-width: 2px; }
        .dp-cat-pick-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }

        .dp-modal-actions { display: flex; gap: 10px; margin-top: 20px; }
        .dp-btn-cancel {
          flex: 1; padding: 12px; border-radius: 12px;
          background: #f1f5f9; border: none; color: #64748b;
          font-size: 13px; font-weight: 700; font-family: inherit; cursor: pointer;
          transition: background 0.15s;
        }
        .dp-btn-cancel:hover { background: #e2e8f0; }
        .dp-btn-upload {
          flex: 1; padding: 12px; border-radius: 12px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border: none; color: #fff;
          font-size: 13px; font-weight: 700; font-family: inherit; cursor: pointer;
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
          transition: all 0.15s;
        }
        .dp-btn-upload:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(59,130,246,0.4); }
        .dp-btn-upload:disabled { opacity: 0.55; cursor: not-allowed; }
      `}</style>

      <div className="dp-root">
        {/* Header */}
        <div className="dp-header">
          <div>
            <h1 className="dp-title">Document <span>Vault</span></h1>
            <p className="dp-subtitle">Securely manage all insurance documents in one place</p>
          </div>
          <button className="dp-upload-btn" onClick={() => setShowUploadModal(true)}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Upload Document
          </button>
        </div>
        {/* ── Category Cards (Top Permanent Section) ── */}
        <div className="dp-cat-grid">
          {categoryItems.map(cat => {
            const count = activeDocs.filter(d => getCat(d.category).key === cat.key).length;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                className={`dp-cat-card${isActive ? " active" : ""}`}
                style={isActive ? { borderColor: cat.color, background: cat.bg } : {}}
                onClick={() => {
                  if (vaultTab === "recycle_bin") setVaultTab("active");
                  setActiveCategory(isActive ? "all" : cat.key);
                }}
              >
                <div className="dp-cat-icon" style={{ background: cat.bg }}>
                  <CategoryIcon category={cat.key} size={20} color={cat.color} />
                </div>
                <div className="dp-cat-count" style={isActive ? { color: cat.color } : {}}>
                  {loading ? "—" : count}
                </div>
                <div className="dp-cat-name" style={isActive ? { color: cat.color } : {}} title={cat.label}>
                  {cat.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Quick Stats Row (Top Permanent Section) ── */}
        <div className="dp-stats">
          {[
            {
              label: "Active Files",
              val: activeDocs.length,
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              ),
              bg: "#eff6ff",
            },
            {
              label: "PDF Documents",
              val: pdfCount,
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 21h10a2 2 0 0 0 2-2V9.414a1 1 0 0 0-.293-.707l-5.414-5.414A1 1 0 0 0 12.586 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" />
                  <path d="M9 13h2a1.5 1.5 0 0 0 0-3H9v6" />
                </svg>
              ),
              bg: "#fef2f2",
            },
            {
              label: "Image Files",
              val: imgCount,
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              ),
              bg: "#fffbeb",
            },
            {
              label: "Storage Used",
              val: (totalSize / 1048576).toFixed(1) + " MB",
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
              ),
              bg: "#ecfdf5",
            },
          ].map(s => (
            <div key={s.label} className="dp-stat">
              <div className="dp-stat-info">
                <div className="dp-stat-val">{loading ? "—" : s.val}</div>
                <div className="dp-stat-lbl">{s.label}</div>
              </div>
              <div className="dp-stat-icon-box" style={{ background: s.bg }}>
                {s.icon}
              </div>
            </div>
          ))}
        </div>

        {/* ── Lower Section: Filter Bar & Recycle Bin ── */}
        <div className="dp-filter-bar">
          <div className="dp-filter-tabs">
            <button
              type="button"
              className={`dp-filter-tab${activeCategory === "all" ? " active" : ""}`}
              style={activeCategory === "all" ? { background: "#0f172a", color: "#fff", borderColor: "#0f172a" } : {}}
              onClick={() => setActiveCategory("all")}
            >
              {vaultTab === "recycle_bin" ? `All Deleted (${recycledDocs.length})` : `All Files (${activeDocs.length})`}
            </button>
            {categoryItems.map(cat => {
              const count = currentTabDocs.filter(d => getCat(d.category).key === cat.key).length;
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  className={`dp-filter-tab${isActive ? " active" : ""}`}
                  style={isActive ? { background: cat.color, color: "#fff", borderColor: cat.color } : {}}
                  onClick={() => setActiveCategory(isActive ? "all" : cat.key)}
                >
                  <span className="dp-filter-tab-dot" style={{ background: isActive ? "rgba(255,255,255,0.7)" : cat.color }} />
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Recycle Bin Option at Lower Section */}
          <button
            type="button"
            className={`dp-recycle-tab-btn${vaultTab === "recycle_bin" ? " active" : ""}`}
            onClick={() => {
              setVaultTab(vaultTab === "active" ? "recycle_bin" : "active");
              setActiveCategory("all");
            }}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Recycle Bin</span>
            {recycledDocs.length > 0 && (
              <span className="dp-recycle-badge">{recycledDocs.length}</span>
            )}
          </button>
        </div>

        {/* Layout */}
        <div className="dp-layout">
          {/* Files panel */}
          <div className="dp-files">
            {/* Recycle Bin Alert Banner when viewing Recycle Bin */}
            {vaultTab === "recycle_bin" && (
              <div className="dp-recycle-banner">
                <div className="dp-recycle-banner-info">
                  <div className="dp-recycle-banner-icon">
                    <svg width="18" height="18" fill="none" stroke="#dc2626" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <div>
                    <div className="dp-recycle-banner-title">
                      Recycle Bin ({recycledDocs.length} {recycledDocs.length === 1 ? "document" : "documents"})
                    </div>
                    <div className="dp-recycle-banner-sub">
                      Documents are retained for 30 days before permanent deletion. You can restore or delete them forever.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setVaultTab("active"); setActiveCategory("all"); }}
                  className="dp-recycle-banner-close"
                >
                  ← Back to Active Files
                </button>
              </div>
            )}

            {/* Toolbar */}
            <div className="dp-files-header">
              <div className="dp-search-wrap">
                <span className="dp-search-icon">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  className="dp-search"
                  type="text"
                  placeholder={vaultTab === "recycle_bin" ? "Search deleted documents..." : "Search documents..."}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <span className="dp-files-title">
                {vaultTab === "recycle_bin"
                  ? `Recycle Bin · ${activeCategory === "all" ? "All Deleted" : getCat(activeCategory as DocCategory).label}`
                  : activeCategory === "all" ? "All Files" : getCat(activeCategory as DocCategory).label}
              </span>
              <div className="dp-view-toggle">
                <button className={`dp-view-btn${viewMode === "list" ? " active" : ""}`} onClick={() => setViewMode("list")}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button className={`dp-view-btn${viewMode === "grid" ? " active" : ""}`} onClick={() => setViewMode("grid")}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="dp-empty">
                <div className="dp-spinner" />
                <p style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>Loading documents…</p>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="dp-empty">
                <div className="dp-empty-icon-box">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p style={{ color: "#94a3b8", fontWeight: 700, fontSize: 14 }}>
                  {vaultTab === "recycle_bin" ? "Recycle Bin is empty" : "No documents found"}
                </p>
                {activeCategory !== "all" && (
                  <p style={{ color: "#cbd5e1", fontSize: 12, marginTop: 4 }}>
                    No files in <b>{getCat(activeCategory as DocCategory).label}</b> yet
                  </p>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div className="dp-grid">
                {filteredDocs.map(doc => {
                  const tc = getType(doc.file_type);
                  const cat = getCat(doc.category);
                  return (
                    <div key={doc.id} className="dp-card">
                      <div className="dp-card-top">
                        <div className="dp-card-type" style={{ background: tc.bg }}>
                          <FileTypeIcon type={doc.file_type} size={20} color={tc.color} />
                        </div>
                        <div className="dp-card-actions">
                          {vaultTab === "recycle_bin" ? (
                            <>
                              <button
                                type="button"
                                disabled={restoringDocId === doc.id}
                                onClick={() => restoreDoc(doc.id)}
                                className="dp-card-action"
                                title="Restore Document"
                                style={{ color: "#10b981", borderColor: "#a7f3d0", background: "#ecfdf5" }}
                              >
                                {restoringDocId === doc.id ? "…" : "↩"}
                              </button>
                              <button
                                type="button"
                                disabled={deletingDocId === doc.id}
                                onClick={() => permanentDeleteDoc(doc.id)}
                                className="dp-card-action del"
                                title="Delete Forever"
                              >
                                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="dp-card-action"
                                title="View in App"
                                onClick={() => setViewingDoc(doc)}
                              >
                                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <a
                                href={doc.file_url && doc.file_url.length > 5 ? doc.file_url : "#"}
                                download={doc.file_name}
                                title="Download"
                                className="dp-card-action"
                              >
                                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </a>
                              <button className="dp-card-action del" title="Move to Recycle Bin" onClick={() => deleteDoc(doc.id)}>
                                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="dp-card-name">{doc.name}</div>
                      <div className="dp-card-owner" style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                          {doc.client_name || "—"}
                        </span>
                        {doc.family_member_name ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "10px", background: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                            {doc.family_member_name}
                          </span>
                        ) : (
                          <span style={{ fontSize: "10px", background: "#f1f5f9", color: "#64748b", padding: "1px 5px", borderRadius: "4px", fontWeight: 600 }}>
                            Self
                          </span>
                        )}
                      </div>
                      {/* Category pill */}
                      <div style={{ marginBottom: 8 }}>
                        <span className="dp-cat-pill" style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.borderColor}` }}>
                          <CategoryIcon category={cat.key} size={11} color={cat.color} />
                          <span>{cat.label}</span>
                        </span>
                      </div>
                      <div className="dp-card-footer">
                        <span className="dp-card-meta">{formatSize(doc.file_size)}</span>
                        <span className="dp-card-meta">{formatDate(doc.created_at)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="dp-list">
                {filteredDocs.map(doc => {
                  const tc = getType(doc.file_type);
                  const cat = getCat(doc.category);
                  return (
                    <div key={doc.id} className="dp-list-row">
                      <div className="dp-list-type" style={{ background: tc.bg }}>
                        <FileTypeIcon type={doc.file_type} size={18} color={tc.color} />
                      </div>
                      <div className="dp-list-info">
                        <div className="dp-list-name">{doc.name}</div>
                        <div className="dp-list-meta">
                          <span>{doc.file_type} · {formatSize(doc.file_size)}</span>
                          {/* Category pill */}
                          <span className="dp-cat-pill" style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.borderColor}` }}>
                            <CategoryIcon category={cat.key} size={11} color={cat.color} />
                            <span>{cat.label}</span>
                          </span>
                        </div>
                      </div>
                      <div className="dp-list-col-owner">
                        <div style={{ fontWeight: 600, color: "#1e293b", display: "flex", alignItems: "center", gap: "4px" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                          {doc.client_name || "—"}
                        </div>
                        {doc.family_member_name ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "10px", background: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe", padding: "1px 6px", borderRadius: "4px", fontWeight: 700, marginTop: "2px" }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                            {doc.family_member_name}
                          </span>
                        ) : (
                          <span style={{ fontSize: "10px", color: "#94a3b8" }}>Self</span>
                        )}
                      </div>
                      <div className="dp-list-col-date">{formatDate(doc.created_at)}</div>
                      <div className="dp-list-col-size">{formatSize(doc.file_size)}</div>
                      <div className="dp-list-actions">
                        {vaultTab === "recycle_bin" ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <button
                              type="button"
                              disabled={restoringDocId === doc.id}
                              onClick={() => restoreDoc(doc.id)}
                              className="dp-list-action"
                              title="Restore Document"
                              style={{ width: "auto", padding: "0 10px", height: 28, fontSize: 11, fontWeight: 700, borderRadius: 8, background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" }}
                            >
                              {restoringDocId === doc.id ? "Restoring..." : "Restore"}
                            </button>
                            <button
                              type="button"
                              disabled={deletingDocId === doc.id}
                              onClick={() => permanentDeleteDoc(doc.id)}
                              className="dp-list-action del"
                              title="Delete Permanently"
                            >
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="dp-list-action"
                              title="View in App"
                              onClick={() => setViewingDoc(doc)}
                            >
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <a
                              href={doc.file_url && doc.file_url.length > 5 ? doc.file_url : "#"}
                              download={doc.file_name}
                              title="Download"
                              className="dp-list-action"
                            >
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </a>
                            <button className="dp-list-action del" title="Move to Recycle Bin" onClick={() => deleteDoc(doc.id)}>
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="dp-sidebar">
            <div className="dp-storage-card">
              <div className="dp-storage-title">Storage Usage</div>
              <div className="dp-storage-bar-bg">
                <div className="dp-storage-bar-fill" style={{ width: `${usedPct}%` }} />
              </div>
              <div className="dp-storage-nums">
                <div>
                  <div className="dp-storage-num">{(totalSize / 1048576).toFixed(1)} MB</div>
                  <div className="dp-storage-num-lbl">Used</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="dp-storage-num" style={{ color: "#cbd5e1" }}>2.0 GB</div>
                  <div className="dp-storage-num-lbl">Limit</div>
                </div>
              </div>

              {/* ── Category breakdown ── */}
              <div className="dp-storage-title" style={{ fontSize: 12, marginBottom: 12 }}>By Category</div>
              <div className="dp-cat-breakdown">
                {categoryItems.map(cat => {
                  const count = activeDocs.filter(d => getCat(d.category).key === cat.key).length;
                  const pct = activeDocs.length > 0 ? Math.round((count / activeDocs.length) * 100) : 0;
                  return (
                    <div key={cat.key}>
                      <div className="dp-cat-br-row">
                        <div className="dp-cat-br-left">
                          <div className="dp-cat-br-icon" style={{ background: cat.bg }}>
                            <CategoryIcon category={cat.key} size={14} color={cat.color} />
                          </div>
                          <span className="dp-cat-br-lbl">{cat.label}</span>
                        </div>
                        <span className="dp-cat-br-count">{count} files</span>
                      </div>
                      <div className="dp-cat-br-bar-bg">
                        <div className="dp-cat-br-bar" style={{ width: `${pct}%`, background: cat.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="dp-modal-bg" onClick={e => { if (e.target === e.currentTarget) setShowUploadModal(false); }}>
          <div className="dp-modal">
            <div className="dp-modal-handle" />
            <div className="dp-modal-header">
              <span className="dp-modal-title">Upload Document</span>
              <button className="dp-modal-close" onClick={() => setShowUploadModal(false)}>✕</button>
            </div>

            {/* ── Category picker ── */}
            <div className="dp-field">
              <label className="dp-field-label">Document Category</label>
              <div className="dp-cat-picker">
                {categoryItems.map(cat => {
                  const isActive = uploadForm.category === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      className={`dp-cat-pick-btn${isActive ? " active" : ""}`}
                      style={isActive ? { borderColor: cat.color, background: cat.bg, color: cat.color } : {}}
                      onClick={() => setUploadForm({ ...uploadForm, category: cat.key })}
                    >
                      <div className="dp-cat-pick-icon" style={{ background: cat.bg }}>
                        <CategoryIcon category={cat.key} size={16} color={cat.color} />
                      </div>
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="dp-field">
              <label className="dp-field-label">Client *</label>
              <select
                className="dp-field-select"
                value={uploadForm.client_id}
                onChange={e => handleClientSelect(e.target.value)}
              >
                <option value="">Select a Client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {uploadForm.client_id && (
              <div className="dp-field">
                <label className="dp-field-label">Document Belongs To (Separate Upload)</label>
                <select
                  className="dp-field-select"
                  style={{ borderColor: "#bfdbfe", background: "#f8fafc", fontWeight: 600, color: "#1e3a8a" }}
                  value={uploadForm.family_member_id}
                  onChange={e => setUploadForm({ ...uploadForm, family_member_id: e.target.value })}
                >
                  <option value="">Client (Self / Primary)</option>
                  {clientFamily.map(f => (
                    <option key={f.id} value={f.id}>
                      Family Member: {f.name} ({f.relationship})
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                  Upload document separately for the primary client or select a specific family member
                </p>
              </div>
            )}

            <div className="dp-field">
              <label className="dp-field-label">Document Name</label>
              <input
                className="dp-field-input"
                type="text"
                placeholder="e.g. Health Insurance Policy 2024"
                value={uploadForm.name}
                onChange={e => setUploadForm({ ...uploadForm, name: e.target.value })}
              />
            </div>

            <div className="dp-field">
              <label className="dp-field-label">Attach File</label>
              <input
                className="dp-field-file"
                type="file"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                    setUploadForm({ ...uploadForm, file_name: file.name, file_size: file.size });
                  }
                }}
              />
              {uploadForm.file_name && (
                <p className="dp-file-hint">✓ {uploadForm.file_name} ({(uploadForm.file_size / 1024).toFixed(1)} KB)</p>
              )}
            </div>

            <div className="dp-modal-actions">
              <button className="dp-btn-cancel" onClick={() => setShowUploadModal(false)}>Cancel</button>
              <button
                className="dp-btn-upload"
                onClick={handleUpload}
                disabled={uploading || !uploadForm.name || !selectedFile || !uploadForm.client_id || !uploadForm.category}
              >
                {uploading ? "Uploading…" : "Upload File"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── In-App Document Viewer Modal (Item 9) ── */}
      {viewingDoc && (
        <div
          className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: "rgba(15,23,42,0.7)", backdropFilter: "blur(8px)" }}
          onClick={e => { if (e.target === e.currentTarget) setViewingDoc(null); }}
        >
          <div className="relative bg-white w-full sm:max-w-2xl rounded-t-[28px] sm:rounded-[22px] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-[16px] font-bold text-[#1F2937] truncate max-w-sm">
                  {viewingDoc.name}
                </h2>
                <p className="text-xs text-[#6B7280]">
                  {viewingDoc.file_name} · {formatSize(viewingDoc.file_size)} · {viewingDoc.client_name || "Client"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {viewingDoc.file_url && (
                  <a
                    href={viewingDoc.file_url}
                    download={viewingDoc.file_name}
                    className="p-2 rounded-xl bg-[#eff6ff] text-[#3b82f6] hover:bg-[#3b82f6] hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
                    title="Download"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                )}
                <button
                  onClick={() => setViewingDoc(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors text-sm font-bold"
                >
                  ✕
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
                <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 max-w-md shadow-sm">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto mb-3 bg-blue-50 text-blue-600">
                    <FileTypeIcon type={viewingDoc.file_type} size={28} color="#2563eb" />
                  </div>
                  <h3 className="font-bold text-[#1F2937] text-base mb-1">{viewingDoc.name}</h3>
                  <p className="text-xs text-[#6B7280] mb-4">
                    Category: {viewingDoc.category || "General Document"}
                  </p>
                  <p className="text-xs text-slate-500 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    Secure in-app preview for {viewingDoc.file_name}. You can view the document contents or download directly.
                  </p>
                  {viewingDoc.file_url && (
                    <a
                      href={viewingDoc.file_url}
                      download={viewingDoc.file_name}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3b82f6] text-white text-xs font-bold hover:bg-[#2563eb] transition-all shadow-md"
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
    </>
  );
}