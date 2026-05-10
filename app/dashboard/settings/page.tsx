"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({ full_name: "", email: "", phone: "", language: "English (US)" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState("System Default");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem("supabase_user");
    if (raw) {
      const u = JSON.parse(raw);
      setUser(u);
      setFormData({ full_name: u.name || "", email: u.email || "", phone: u.phone || "", language: "English (US)" });
    }
    const savedTheme = window.localStorage.getItem("theme");
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "Dark Mode") {
      root.style.setProperty('--background', '#0f172a');
      root.style.setProperty('--foreground', '#f8fafc');
      root.style.setProperty('--card-bg', 'rgba(30, 41, 59, 0.9)');
      root.style.setProperty('--section-bg', '#1e293b');
      root.classList.add("dark");
    } else {
      root.style.removeProperty('--background');
      root.style.removeProperty('--foreground');
      root.style.removeProperty('--card-bg');
      root.style.removeProperty('--section-bg');
      root.classList.remove("dark");
    }
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const handlePasswordChange = async () => {
    if (!newPassword) return;
    setPassLoading(true);
    const { error } = await supabase?.auth?.updateUser({ password: newPassword }) || { error: { message: "Supabase not connected." } };
    setPassLoading(false);
    if (error) alert("Error updating password: " + error.message);
    else {
      alert("Password updated successfully!");
      setPassword("");
      setNewPassword("");
    }
  };

  const handleSave = async () => {
    if (activeTab === "security" && newPassword) {
      handlePasswordChange();
      return;
    }
    setSaving(true);
    try {
        if (user && user.id && supabase) {
        // Update in Supabase
        const { error } = await supabase
          .from("profiles")
          .update({ 
            full_name: formData.full_name,
            phone: formData.phone || null
          })
          .eq("id", user.id);

        if (error) {
          console.error("Supabase update error:", error);
          throw error;
        }

        // Update local state
        const updated = { ...user, name: formData.full_name, email: formData.email, phone: formData.phone };
        window.localStorage.setItem("supabase_user", JSON.stringify(updated));
        setUser(updated);
        
        // Notify other components (like Sidebar) to refresh
        window.dispatchEvent(new Event("user_updated"));
        
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err: any) {
      alert("Error saving profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile Info", icon: "👤" },
    { id: "security", label: "Security", icon: "🔒" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "portal", label: "Portal Config", icon: "⚙️" },
  ];

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-left-4 duration-500">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-navy mb-2">Portal <span className="text-primary">Settings</span></h1>
          <p className="text-slate-500 font-medium italic">Configure your account preferences and portal experience.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="px-8 py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50">
          {saving ? "Saving..." : saved ? "✓ Saved!" : "Save All Changes"}
        </button>
      </header>

      <div className="grid lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
        <aside className="lg:col-span-1 space-y-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === tab.id ? "bg-white text-primary shadow-sm border border-slate-100" : "text-slate-400 hover:text-navy hover:bg-white/50"}`}>
              <span className="text-xl">{tab.icon}</span>{tab.label}
            </button>
          ))}
        </aside>

        <div className="lg:col-span-3 space-y-8">
          <div className="bg-slate-50/40 rounded-[2.5rem] border border-slate-200 shadow-sm p-8 md:p-12">
            {activeTab === "profile" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center gap-8 pb-8 border-b border-slate-50">
                  <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-3xl font-black shadow-lg">{user?.name?.[0] || "U"}</div>
                  <div>
                    <h3 className="text-2xl font-black text-navy mb-1">{user?.name || "Maruthi User"}</h3>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{user?.role || "Agent"} Account</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-bold text-navy" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-bold text-navy" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 00000 00000" className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-bold text-navy" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Language</label>
                    <select value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-bold text-navy appearance-none">
                      <option>English (US)</option><option>Hindi</option><option>Telugu</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "security" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                  <h3 className="text-2xl font-black text-navy mb-1">Security Settings</h3>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Manage your password and access</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-bold text-navy" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-bold text-navy" />
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-navy">Two-Factor Authentication</h4>
                    <p className="text-xs text-slate-400 font-medium">Add an extra layer of security</p>
                  </div>
                  <button className="px-6 py-2 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all">Enable 2FA</button>
                </div>
              </div>
            )}
            {activeTab === "notifications" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                  <h3 className="text-2xl font-black text-navy mb-1">Notification Preferences</h3>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Control how you receive alerts</p>
                </div>
                <div className="space-y-4">
                  {[
                    { title: "Email Notifications", desc: "Receive updates about clients and policies via email" },
                    { title: "WhatsApp Alerts", desc: "Get instant WhatsApp messages for important events" },
                    { title: "Marketing Updates", desc: "News and feature updates from Maruthi Insure" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-primary/30 transition-all">
                      <div>
                        <h4 className="font-bold text-navy">{item.title}</h4>
                        <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                      </div>
                      <input type="checkbox" defaultChecked={i < 2} className="w-5 h-5 rounded-md accent-primary" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "portal" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                  <h3 className="text-2xl font-black text-navy mb-1">Portal Configuration</h3>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Customize your workspace</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Theme</label>
                    <select value={theme} onChange={e => setTheme(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-bold text-navy appearance-none">
                      <option>System Default</option><option>Light Mode</option><option>Dark Mode</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Timezone</label>
                    <select className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-bold text-navy appearance-none">
                      <option>Asia/Kolkata (IST)</option><option>UTC</option><option>America/New_York</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
