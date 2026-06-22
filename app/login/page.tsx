"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messageType, setMessageType] = useState<"success" | "error">("error");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      // ✅ FIX: Use Supabase native sign-in instead of a custom /api/auth/login fetch.
      // This automatically persists the session to localStorage (because persistSession: true
      // is now set in supabaseClient.ts), so the dashboard can read it immediately on mount.
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session) {
        setMessage(error?.message ?? "Login failed. Please check your credentials.");
        setMessageType("error");
        setIsLoading(false);
        return;
      }

      // ✅ FIX: No manual localStorage.setItem needed — Supabase handles that automatically.
      // ✅ FIX: No setTimeout needed — navigate immediately. The session is already written
      //         to localStorage before router.push fires, so the dashboard reads it on mount.
      setMessageType("success");
      setMessage(
        `Welcome back, ${
          data.user?.user_metadata?.name || data.user?.email || "user"
        }! Redirecting...`
      );

      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setMessage("Connection error. Please try again.");
      setMessageType("error");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
      <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-2xl border border-slate-200">

        {/* ── Left Panel ── */}
        <div className="hidden md:flex md:w-[52%] flex-col justify-between bg-[#0f1f3d] p-10 relative overflow-hidden">
          <div className="absolute w-80 h-80 rounded-full bg-[#1a3a6e] opacity-50 -top-20 -right-20 pointer-events-none" />
          <div className="absolute w-56 h-56 rounded-full bg-[#1a3a6e] opacity-40 -bottom-14 -left-10 pointer-events-none" />

          {/* Brand */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4f8ef7] rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">
              Maruthi <span className="text-[#93bbfd]">Insure</span>
            </span>
          </div>

          {/* Center content */}
          <div className="relative z-10 flex-1 flex flex-col justify-center py-10">
            <h2 className="text-3xl font-semibold text-white leading-snug mb-4 tracking-tight">
              Protect what{" "}
              <span className="text-[#93bbfd]">matters most</span>
              {" "}— smarter
            </h2>
            <p className="text-sm text-[#93a8cc] leading-relaxed mb-10 max-w-xs">
              Manage policies, track claims, and stay covered with our all-in-one intelligent insurance platform.
            </p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { num: "50K+", label: "Policyholders" },
                { num: "₹2B+", label: "Claims settled" },
                { num: "99.9%", label: "Uptime SLA" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/[0.06] border border-white/10 rounded-xl p-3 text-center"
                >
                  <div className="text-xl font-semibold text-[#93bbfd] mb-1">{stat.num}</div>
                  <div className="text-[11px] text-[#6a84a8] tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Panel: Form ── */}
        <div className="flex-1 flex flex-col justify-center bg-white px-10 py-12">
          {/* Mobile brand */}
          <div className="md:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#4f8ef7] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-[#0f1f3d]">Maruthi Insure</span>
          </div>

          {/* Header */}
          <div className="mb-7">
            <p className="text-xs font-semibold tracking-widest text-[#4f8ef7] uppercase mb-2">
              Agent &amp; Admin Portal
            </p>
            <h1 className="text-2xl font-semibold text-[#0f1f3d] tracking-tight mb-1">Welcome back</h1>
            <p className="text-sm text-slate-500">Sign in to manage your policies and clients.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-200 bg-slate-50 text-sm text-[#0f1f3d] placeholder-slate-400 outline-none transition focus:border-[#4f8ef7] focus:ring-2 focus:ring-[#4f8ef7]/15 focus:bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-500">Password</label>
                <a href="#" className="text-xs font-medium text-[#4f8ef7] hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-200 bg-slate-50 text-sm text-[#0f1f3d] placeholder-slate-400 outline-none transition focus:border-[#4f8ef7] focus:ring-2 focus:ring-[#4f8ef7]/15 focus:bg-white"
                />
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-slate-300 accent-[#4f8ef7]"
              />
              <label htmlFor="remember" className="text-sm text-slate-500">
                Remember me
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#0f1f3d] hover:bg-[#1a3a6e] active:scale-[0.99] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Sign in to portal
                </>
              )}
            </button>
          </form>

          {/* Feedback message */}
          {message && (
            <div
              className={`mt-4 px-4 py-3 rounded-lg text-sm font-medium text-center border ${
                messageType === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-rose-50 text-rose-700 border-rose-100"
              }`}
            >
              {message}
            </div>
          )}

          <p className="text-center mt-6 text-[10px] text-slate-300 uppercase tracking-widest">
            © 2026 Maruthi Insure Care · All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
}