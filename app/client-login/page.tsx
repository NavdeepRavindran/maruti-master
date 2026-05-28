"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClientLoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId || !password) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/client-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        router.push(`/client-portal/${data.clientId}`);
      } else {
        setError(data.error || "Invalid login credentials. Please try again.");
      }
    } catch (err: any) {
      setError("A network error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50/50 flex flex-col justify-center items-center p-6 relative font-['DM_Sans']">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-bl-full pointer-events-none -z-10 blur-3xl opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-tr-full pointer-events-none -z-10 blur-3xl opacity-40"></div>
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-blue-900/5 overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
        <div className="p-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-5">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">Client Portal</h1>
            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Secure Document Vault</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">Login ID</label>
              <input 
                type="text" 
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                placeholder="MC-XXXXXX"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700"
                required
              />
            </div>
            
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 tracking-widest"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || !loginId || !password}
              className="w-full py-4 mt-2 bg-[#03071e] hover:bg-blue-600 text-white rounded-2xl font-black text-sm transition-all disabled:opacity-50 disabled:hover:bg-[#03071e] shadow-lg shadow-[#03071e]/20 hover:shadow-blue-600/30 active:scale-[0.98]"
            >
              {loading ? "Authenticating..." : "Access Vault"}
            </button>
          </form>
        </div>
        
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400">Powered by Maruthi Insure Care</p>
        </div>
      </div>
    </div>
  );
}
