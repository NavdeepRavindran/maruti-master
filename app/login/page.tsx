"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      console.log("Attempting login for:", email);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Login failed:", data.error);
        setMessage(data.error || "Login failed. Please check your credentials.");
        setIsLoading(false);
        return;
      }

      console.log("Login successful, saving session...");
      if (data.session) {
        window.localStorage.setItem("supabase_session", JSON.stringify(data.session));
      }
      if (data.user) {
        window.localStorage.setItem("supabase_user", JSON.stringify(data.user));
      }

      setMessage(`Welcome back, ${data.user?.name || data.user?.email || "user"}! Redirecting...`);
      
      // Clear message and redirect
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage("Connection error. The server might be offline or the API route is missing.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden font-sans">
      {/* Left Side: Illustration & Branding */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-navy relative items-center justify-center p-12 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/4 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-light/5 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4"></div>
        
        <div className="relative z-10 max-w-xl text-center">
          <div className="inline-flex items-center gap-3 mb-12">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <span className="text-3xl font-black text-white tracking-tight italic">Maruthi <span className="text-primary-light font-bold">Insure</span></span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
            Secure Your Future with <span className="text-primary-light">Intelligence</span>
          </h2>
          <p className="text-lg text-slate-300 mb-12 leading-relaxed">
            Manage your policies, track claims, and stay updated with the most comprehensive insurance management platform.
          </p>
          
          {/* Dashboard Preview / Illustration Placeholder */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm">
             <div className="aspect-[16/10] bg-gradient-to-br from-primary/20 to-navy rounded-2xl flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full opacity-80 group">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1454165833767-027ffb2a48eb?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/20 to-transparent"></div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-12 lg:p-20 bg-slate-50 relative">
        {/* Mobile Header */}
        <div className="md:hidden absolute top-8 left-8">
            <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                </div>
                <span className="text-xl font-bold text-navy">Maruthi</span>
            </Link>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl lg:text-4xl font-black text-navy mb-3">Sign In</h1>
            <p className="text-subtext font-medium">Welcome back! Please enter your details.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-4 text-navy outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Password</label>
                <a href="#" className="text-xs font-bold text-primary hover:text-primary-dark transition-colors">Forgot Password?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-4 text-navy outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 ml-1">
                <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                <label htmlFor="remember" className="text-sm font-medium text-slate-600">Remember me</label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-navy text-white rounded-2xl font-bold text-lg hover:bg-primary transition-all duration-300 shadow-xl shadow-navy/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Authenticating...
                    </>
                ) : "Sign In to Portal"}
              </span>
            </button>
          </form>

          {message && (
            <div className={`mt-6 p-4 rounded-2xl text-sm font-bold text-center animate-in fade-in slide-in-from-top-2 duration-300 ${message.includes('Welcome') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
              {message}
            </div>
          )}


          <p className="text-center mt-12 text-sm text-slate-500 font-medium">
            New to Maruthi? <a href="#" className="text-primary font-bold hover:underline">Request access from admin</a>
          </p>
        </div>
        
        {/* Footer info */}
        <div className="absolute bottom-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            © 2026 Maruthi Insure Care • All Rights Reserved
        </div>
      </div>
    </div>
  );
}
