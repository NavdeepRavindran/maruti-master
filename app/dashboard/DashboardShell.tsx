"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "../components/Sidebar";
import { createClient } from "@/lib/supabase/client";

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

interface UserData {
  name?: string;
  email?: string;
  role?: string;
  persona?: string;
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  // Load user from real Supabase session
  const loadUser = useCallback(async () => {
    const { data: { user: authUser }, error } = await supabase.auth.getUser();

    if (error || !authUser) {
      router.push("/login");
      setLoading(false);
      return;
    }

    setUser({
      name: authUser.user_metadata?.name,
      email: authUser.email,
      role: authUser.user_metadata?.role || "Agent",
      persona: authUser.user_metadata?.persona,
    });
    setLoading(false);
  }, [router, supabase]);

  useEffect(() => {
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUser, supabase, router]);

  // Auto-logout on inactivity (FR-02)
  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      await supabase.auth.signOut();
      router.push("/login");
    }, INACTIVITY_TIMEOUT);
  }, [router, supabase]);

  useEffect(() => {
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, resetTimer));
    resetTimer();
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resetTimer]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fbff]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#005A87] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8fbff] text-navy flex flex-col relative">
      <main className="flex-1 flex flex-col min-h-screen w-full overflow-hidden">
        {/* Top brand header (Visible on all screens) */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#005A87] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <span className="text-lg font-black tracking-tighter text-slate-900 italic">Maruthi</span>
          </div>
          <div className="text-xs text-slate-400 font-bold hidden sm:block">Agent Portal</div>
        </div>

        {/* Scrollable Main Content Container */}
        {/* Generous bottom padding added to prevent overlap with the floating nav bar */}
        <div className="flex-1 p-4 md:p-6 lg:p-10 xl:p-14 overflow-y-auto pb-[130px]">
          {children}
        </div>
      </main>

      {/* Floating Bottom Navigation Bar */}
      <Sidebar role={user.role || "Agent"} userName={user.name} userEmail={user.email} onSignOut={handleSignOut} />
    </div>
  );
}