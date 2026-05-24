"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Login failed. Please check your credentials.");
        setMessageType("error");
        setIsLoading(false);
        return;
      }

      if (data.session) {
        window.localStorage.setItem("supabase_session", JSON.stringify(data.session));
      }
      if (data.user) {
        window.localStorage.setItem("supabase_user", JSON.stringify(data.user));
      }

      setMessageType("success");
      setMessage(`Welcome back, ${data.user?.name || data.user?.email || "user"}! Redirecting...`);

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage("Connection error. The server might be offline or the API route is missing.");
      setMessageType("error");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
      <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-2xl border border-slate-200">

        {/* ── Left Panel ── */}
        <div className="hidden md:flex md:w-[52%] flex-col justify-between bg-[#0f1f3d] p-10 relative overflow-hidden">
          {/* Decorative circles */}
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

            {/* Stat cards */}
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

          {/* Trust badges */}
          <div className="relative z-10 flex flex-wrap gap-2">
            {[
              { icon: "lock", label: "256-bit SSL" },
              { icon: "certificate", label: "IRDAI licensed" },
              { icon: "shield", label: "ISO 27001" },
            ].map((b) => (
              <span
                key={b.label}
                className="inline-flex items-center gap-1.5 bg-white/[0.07] border border-white/10 rounded-full px-3 py-1.5 text-[11px] text-[#93a8cc]"
              >
                <svg className="w-3 h-3 text-[#4f8ef7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {b.icon === "lock" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />}
                  {b.icon === "certificate" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />}
                  {b.icon === "shield" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />}
                </svg>
                {b.label}
              </span>
            ))}
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
                Keep me signed in for 30 days
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

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">or continue with</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Google SSO */}
          <button
            type="button"
            className="w-full h-11 bg-slate-50 hover:bg-slate-100 active:scale-[0.99] border border-slate-200 rounded-lg text-sm font-medium text-slate-700 flex items-center justify-center gap-2.5 transition-all duration-200"
          >
            <svg className="w-4 h-4" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9L37.3 9.5C33.9 6.5 29.2 4.8 24 4.8 12.4 4.8 3 14.2 3 25.8s9.4 21 21 21c10.9 0 20.3-7.9 21.8-18.3.1-.8.2-1.6.2-2.5 0-2-.2-3.9-.4-5z"/>
              <path fill="#FF3D00" d="m6.3 14.7 7 5.1C15 16.1 19.2 13 24 13c3 0 5.7 1.1 7.8 2.9l5.5-5.4C33.9 7.5 29.2 5.8 24 5.8 16.1 5.8 9.3 9.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 46.8c5.1 0 9.8-1.7 13.3-4.4l-6.1-5.2C29.3 38.9 26.8 40 24 40c-5.2 0-9.6-3-11.3-7.1l-7 5.4C9.2 43.8 16 46.8 24 46.8z"/>
              <path fill="#1976D2" d="M43.6 22H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.5l6.1 5.2C40.9 37.4 44 31.7 44 25.8c0-1.3-.2-2.6-.4-3.8z"/>
            </svg>
            Sign in with Google SSO
          </button>

          {/* Footer */}
          <p className="text-center mt-6 text-sm text-slate-400">
            New to Maruthi Insure?{" "}
            <a href="#" className="text-[#4f8ef7] font-medium hover:underline">
              Request admin access
            </a>
          </p>

          <p className="text-center mt-6 text-[10px] text-slate-300 uppercase tracking-widest">
            © 2026 Maruthi Insure Care · All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
}