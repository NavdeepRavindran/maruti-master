"use client";

import { useEffect, useState } from "react";

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
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocData[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({ name: "", file_name: "", file_size: 0, file_url: "", client_id: "" });

  useEffect(() => {
    const t = setTimeout(fetchDocs, 300);
    fetchClients();
    return () => clearTimeout(t);
  }, [search]);

  async function fetchClients() {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(data.clients || []);
    } catch (e) { console.error(e); }
  }

  async function fetchDocs() {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/documents${params}`);
      const data = await res.json();
      setDocs(data.documents || []);
    } catch { } finally { setLoading(false); }
  }

  async function deleteDoc(id: string) {
    if (!confirm("Delete this document?")) return;
    try { await fetch(`/api/documents/${id}`, { method: "DELETE" }); fetchDocs(); } catch { }
  }

  async function handleUpload() {
    if (!uploadForm.name || !selectedFile || !uploadForm.client_id)
      return alert("Please fill all fields and select a file");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("client_id", uploadForm.client_id);
      formData.append("name", uploadForm.name);
      const res = await fetch("/api/documents", { method: "POST", body: formData });
      if (res.ok) {
        setShowUploadModal(false);
        setUploadForm({ name: "", file_name: "", file_size: 0, file_url: "", client_id: "" });
        setSelectedFile(null);
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

  const typeConfig: Record<string, { bg: string; color: string; icon: string }> = {
    PDF: { bg: "#fef2f2", color: "#ef4444", icon: "📄" },
    IMG: { bg: "#fffbeb", color: "#f59e0b", icon: "🖼️" },
    DOC: { bg: "#eff6ff", color: "#3b82f6", icon: "📝" },
  };
  const getType = (t: string) => typeConfig[t] || { bg: "#f0fdf4", color: "#22c55e", icon: "📎" };

  const totalSize = docs.reduce((a, d) => a + d.file_size, 0);
  const pdfCount = docs.filter(d => d.file_type === "PDF").length;
  const imgCount = docs.filter(d => d.file_type === "IMG").length;
  const otherCount = docs.filter(d => !["PDF", "IMG"].includes(d.file_type)).length;
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

        /* ── Stats row ── */
        .dp-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }
        @media (min-width: 640px) { .dp-stats { grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; } }

        .dp-stat {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px 16px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .dp-stat-val {
          font-family: 'Sora', sans-serif;
          font-size: clamp(20px, 4vw, 28px);
          font-weight: 800;
          color: #0f172a;
          line-height: 1;
          margin-bottom: 4px;
        }
        .dp-stat-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8; }

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
        .dp-card-owner { font-size: 10px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }
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
        .dp-list-meta { font-size: 11px; color: #94a3b8; font-weight: 500; }

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

        .dp-type-list { display: flex; flex-direction: column; gap: 10px; }
        .dp-type-row { display: flex; align-items: center; justify-content: space-between; }
        .dp-type-left { display: flex; align-items: center; gap: 8px; }
        .dp-type-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .dp-type-lbl { font-size: 12px; font-weight: 600; color: #334155; }
        .dp-type-count { font-size: 11px; font-weight: 700; color: #94a3b8; }

        /* ── Mobile storage row ── */
        .dp-stats-mobile {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        @media (min-width: 1024px) { .dp-stats-mobile { display: none; } }

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

        {/* Quick stats */}
        <div className="dp-stats">
          {[
            { label: "Total Files", val: docs.length },
            { label: "PDFs", val: pdfCount },
            { label: "Images", val: imgCount },
            { label: "Storage Used", val: (totalSize / 1048576).toFixed(1) + " MB" },
          ].map(s => (
            <div key={s.label} className="dp-stat">
              <div className="dp-stat-val">{loading ? "—" : s.val}</div>
              <div className="dp-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Layout */}
        <div className="dp-layout">
          {/* Files panel */}
          <div className="dp-files">
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
                  placeholder="Search documents..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <span className="dp-files-title">All Files</span>
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
            ) : docs.length === 0 ? (
              <div className="dp-empty">
                <div style={{ fontSize: 40, marginBottom: 10 }}>📂</div>
                <p style={{ color: "#94a3b8", fontWeight: 700, fontSize: 14 }}>No documents found</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="dp-grid">
                {docs.map(doc => {
                  const tc = getType(doc.file_type);
                  return (
                    <div key={doc.id} className="dp-card">
                      <div className="dp-card-top">
                        <div className="dp-card-type" style={{ background: tc.bg }}>{tc.icon}</div>
                        <div className="dp-card-actions">
                          <a
                            href={doc.file_url && doc.file_url.length > 5 ? doc.file_url : "#"}
                            download={doc.file_name}
                            target="_blank"
                            className="dp-card-action"
                          >
                            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </a>
                          <button className="dp-card-action del" onClick={() => deleteDoc(doc.id)}>
                            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="dp-card-name">{doc.name}</div>
                      <div className="dp-card-owner">👤 {doc.client_name || "—"}</div>
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
                {docs.map(doc => {
                  const tc = getType(doc.file_type);
                  return (
                    <div key={doc.id} className="dp-list-row">
                      <div className="dp-list-type" style={{ background: tc.bg }}>{tc.icon}</div>
                      <div className="dp-list-info">
                        <div className="dp-list-name">{doc.name}</div>
                        <div className="dp-list-meta">{doc.file_type} · {formatSize(doc.file_size)}</div>
                      </div>
                      <div className="dp-list-col-owner">{doc.client_name || "—"}</div>
                      <div className="dp-list-col-date">{formatDate(doc.created_at)}</div>
                      <div className="dp-list-col-size">{formatSize(doc.file_size)}</div>
                      <div className="dp-list-actions">
                        <a
                          href={doc.file_url && doc.file_url.length > 5 ? doc.file_url : "#"}
                          download={doc.file_name}
                          target="_blank"
                          className="dp-list-action"
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                        <button className="dp-list-action del" onClick={() => deleteDoc(doc.id)}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
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
              <div className="dp-type-list">
                {[
                  { label: "PDF Documents", count: pdfCount, color: "#ef4444" },
                  { label: "Images", count: imgCount, color: "#f59e0b" },
                  { label: "Other Formats", count: otherCount, color: "#3b82f6" },
                ].map(item => (
                  <div key={item.label} className="dp-type-row">
                    <div className="dp-type-left">
                      <div className="dp-type-dot" style={{ background: item.color }} />
                      <span className="dp-type-lbl">{item.label}</span>
                    </div>
                    <span className="dp-type-count">{item.count} Files</span>
                  </div>
                ))}
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

            <div className="dp-field">
              <label className="dp-field-label">Client</label>
              <select
                className="dp-field-select"
                value={uploadForm.client_id}
                onChange={e => setUploadForm({ ...uploadForm, client_id: e.target.value })}
              >
                <option value="">Select a Client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

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
                disabled={uploading || !uploadForm.name || !selectedFile || !uploadForm.client_id}
              >
                {uploading ? "Uploading…" : "Upload File"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}