"use client";

import { useEffect, useState } from "react";

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user dismissed it during this session
    const dismissed = sessionStorage.getItem("pwa_install_dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowInstall(false);
    }
    setDeferredPrompt(null);
  };

  const dismissPrompt = () => {
    sessionStorage.setItem("pwa_install_dismissed", "true");
    setIsDismissed(true);
  };

  if (!showInstall || isDismissed) return null;

  return (
    <>
      <style>{`
        /* Symmetrical slide-up animation maintaining the centered transform offset */
        @keyframes slideUpCenter {
          from {
            opacity: 0;
            transform: translate(-50%, 15px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }

        .pwa-installer-pill {
          position: fixed !important;
          bottom: 96px !important; /* Suspended exactly above the bottom navigation dock */
          left: 50% !important;
          transform: translateX(-50%) !important;
          z-index: 9998 !important;
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          background: rgba(255, 255, 255, 0.9) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(229, 231, 235, 0.8) !important;
          padding: 6px 14px 6px 10px !important;
          border-radius: 100px !important;
          box-shadow: 
            0 10px 25px -5px rgba(0, 90, 135, 0.1), 
            0 4px 10px -2px rgba(0, 90, 135, 0.03) !important;
          width: max-content;
          max-width: 90vw;
          animation: slideUpCenter 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .pwa-btn {
          background-color: #005A87;
          color: #ffffff;
          transition: all 0.2s ease;
        }

        .pwa-btn:hover {
          background-color: #00476b;
        }

        @media (max-width: 640px) {
          .pwa-installer-pill {
            bottom: 74px !important; /* Aligned symmetrically closer for mobile viewports */
            padding: 5px 12px 5px 8px !important;
            gap: 8px !important;
          }
          .pwa-text {
            font-size: 11px !important;
          }
          .pwa-btn {
            padding: 4px 10px !important;
            font-size: 11px !important;
          }
        }
      `}</style>

      <div className="pwa-installer-pill">
        {/* Minimal Icon */}
        <div className="w-6 h-6 rounded-full bg-[#005A87]/10 flex items-center justify-center text-[#005A87] shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </div>

        {/* Clean Description */}
        <span className="pwa-text text-[12px] font-bold text-slate-700 whitespace-nowrap">
          Install app for offline access
        </span>

        {/* Install Action Button */}
        <button
          onClick={installApp}
          className="pwa-btn px-3.5 py-1.5 text-[11px] font-extrabold rounded-full transition-all active:scale-[0.95] shrink-0"
        >
          Install
        </button>

        {/* Vertical Divider */}
        <div className="w-[1px] h-4 bg-slate-200 shrink-0" />

        {/* Quick Close Button */}
        <button
          onClick={dismissPrompt}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100 shrink-0"
          aria-label="Dismiss"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </>
  );
}