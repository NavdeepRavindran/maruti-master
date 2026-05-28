"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("agency");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Mock states for the 7 panels
  const [agencyForm, setAgencyForm] = useState({ name: "Maruthi Insure Care", logoUrl: "https://example.com/logo.png", address: "123 Main St, City", regNo: "REG-987654321" });
  const [users, setUsers] = useState([{ id: 1, name: "Sampath Kumar", email: "sampath@maruthi.com", role: "Admin" }, { id: 2, name: "Agent 01", email: "agent1@maruthi.com", role: "Agent" }]);
  const [templates, setTemplates] = useState({ birthdayEnglish: "Happy Birthday!", birthdayTamil: "இனிய பிறந்தநாள் வாழ்த்துக்கள்!", anniversaryEnglish: "Happy Anniversary!", anniversaryTamil: "இனிய திருமண நாள் வாழ்த்துக்கள்!" });
  const [notifications, setNotifications] = useState({ emailAlerts: true, smsAlerts: false, marketing: false });
  const [categories, setCategories] = useState(["Policy Documents", "KYC / Identity", "Health Records", "Vehicle RC / Insurance", "Financial / Tax", "Others"]);
  const [portal, setPortal] = useState({ enableClientPortal: true, require2FA: false });
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });

  const handleSave = async () => {
    setSaving(true);
    // Mock save delay
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: "agency", label: "Agency Profile", icon: "🏢" },
    { id: "users", label: "User Management", icon: "👥" },
    { id: "templates", label: "WhatsApp Templates", icon: "💬" },
    { id: "notifications", label: "Notification Preferences", icon: "🔔" },
    { id: "categories", label: "Document Categories", icon: "📁" },
    { id: "portal", label: "Client Portal Settings", icon: "🌐" },
    { id: "security", label: "Change Password", icon: "🔒" },
  ];

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-left-4 duration-500">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-navy mb-2">System <span className="text-primary">Settings</span></h1>
          <p className="text-slate-500 font-medium italic">Configure agency preferences, users, and portal parameters.</p>
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
            
            {/* 1. Agency Profile */}
            {activeTab === "agency" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                  <h3 className="text-2xl font-black text-navy mb-1">Agency Profile</h3>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Manage your core business details</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Agency Name</label>
                    <input type="text" value={agencyForm.name} onChange={e => setAgencyForm({...agencyForm, name: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none font-bold text-navy" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registration No</label>
                    <input type="text" value={agencyForm.regNo} onChange={e => setAgencyForm({...agencyForm, regNo: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none font-bold text-navy" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registered Address</label>
                    <input type="text" value={agencyForm.address} onChange={e => setAgencyForm({...agencyForm, address: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none font-bold text-navy" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo URL</label>
                    <input type="text" value={agencyForm.logoUrl} onChange={e => setAgencyForm({...agencyForm, logoUrl: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none font-bold text-navy" />
                  </div>
                </div>
              </div>
            )}

            {/* 2. User Management */}
            {activeTab === "users" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-black text-navy mb-1">User Management</h3>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Manage staff access</p>
                  </div>
                  <button className="px-6 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100">Add User</button>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  {users.map((u, i) => (
                    <div key={u.id} className={`flex items-center justify-between p-4 ${i !== users.length -1 ? "border-b border-slate-100" : ""}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">{u.name[0]}</div>
                        <div>
                          <div className="font-bold text-navy">{u.name} <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded ml-2">{u.role}</span></div>
                          <div className="text-xs text-slate-400">{u.email}</div>
                        </div>
                      </div>
                      <button className="text-red-500 hover:text-red-600 text-sm font-bold">Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. WhatsApp Templates */}
            {activeTab === "templates" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                  <h3 className="text-2xl font-black text-navy mb-1">WhatsApp Templates</h3>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Customize default outreach text</p>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">Birthday Template (English)</label>
                    <textarea value={templates.birthdayEnglish} onChange={e => setTemplates({...templates, birthdayEnglish: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-primary outline-none font-bold text-navy min-h-[100px]"></textarea>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">Birthday Template (Tamil)</label>
                    <textarea value={templates.birthdayTamil} onChange={e => setTemplates({...templates, birthdayTamil: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-primary outline-none font-bold text-navy min-h-[100px] font-['Noto_Sans_Tamil']"></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Notification Preferences */}
            {activeTab === "notifications" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                  <h3 className="text-2xl font-black text-navy mb-1">Notification Preferences</h3>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Control how you receive alerts</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white">
                    <div><h4 className="font-bold text-navy">Email Alerts</h4><p className="text-xs text-slate-400 font-medium">Daily digests and important events</p></div>
                    <input type="checkbox" checked={notifications.emailAlerts} onChange={e => setNotifications({...notifications, emailAlerts: e.target.checked})} className="w-5 h-5 accent-primary" />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white">
                    <div><h4 className="font-bold text-navy">SMS Alerts</h4><p className="text-xs text-slate-400 font-medium">Urgent policy expirations</p></div>
                    <input type="checkbox" checked={notifications.smsAlerts} onChange={e => setNotifications({...notifications, smsAlerts: e.target.checked})} className="w-5 h-5 accent-primary" />
                  </div>
                </div>
              </div>
            )}

            {/* 5. Document Categories */}
            {activeTab === "categories" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-black text-navy mb-1">Document Categories</h3>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Manage tag options</p>
                  </div>
                  <button className="px-6 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100">Add New</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {categories.map((c, i) => (
                    <div key={i} className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-600 flex items-center gap-3">
                      {c} <button className="text-slate-400 hover:text-red-500">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Client Portal Settings */}
            {activeTab === "portal" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                  <h3 className="text-2xl font-black text-navy mb-1">Client Portal Settings</h3>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Global self-service access</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 rounded-2xl border-2 border-primary/20 bg-blue-50/50">
                    <div><h4 className="font-black text-navy text-lg">Enable Client Portal globally</h4><p className="text-xs text-slate-500 font-medium mt-1">If disabled, clients cannot log in even with credentials</p></div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={portal.enableClientPortal} onChange={e => setPortal({...portal, enableClientPortal: e.target.checked})} />
                      <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 7. Change Password */}
            {activeTab === "security" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                  <h3 className="text-2xl font-black text-navy mb-1">Change Password</h3>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Update your admin credentials</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                    <input type="password" value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none font-bold text-navy" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                    <input type="password" value={passwordForm.newPass} onChange={e => setPasswordForm({...passwordForm, newPass: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none font-bold text-navy" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                    <input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none font-bold text-navy" />
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
