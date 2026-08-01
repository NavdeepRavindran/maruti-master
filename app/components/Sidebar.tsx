"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Clients",
    href: "/dashboard/clients",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "Documents",
    href: "/dashboard/documents",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Birthdays",
    href: "/dashboard/birthdays",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 16v2m3-6v6m3-8v8m7-11.105V19a2 2 0 01-2 2H4a2 2 0 01-2-2V4.895A2 2 0 013.99 2.952C5.77 4.057 7.87 4.5 10 4.5s4.23-.443 6.01-1.548A2 2 0 0120.01 4.895z" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

interface SidebarProps {
  role: string;
  userName?: string;
  userEmail?: string;
  onSignOut?: () => void;
}

export default function Sidebar({ role, userName, userEmail, onSignOut }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sync state with localstorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("b_nav_collapsed");
      if (savedState === "true") {
        setIsCollapsed(true);
      }
    }
  }, []);

  const handleCollapseToggle = (collapsedValue: boolean) => {
    setIsCollapsed(collapsedValue);
    if (typeof window !== "undefined") {
      localStorage.setItem("b_nav_collapsed", collapsedValue.toString());
    }
  };

  return (
    <>
      <style>{`
        /* ── Page Layout Adjustments ── */
        body {
          padding-bottom: 160px !important;
        }

        /* ── Expand Sibling Dashboard Containers to 100% Width ── */
        .sidebar + *,
        .sidebar ~ main,
        .sidebar ~ div,
        .sidebar ~ section {
          margin-left: 0 !important;
          padding-left: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          padding-bottom: 160px !important;
        }

        /* ── Edge-to-Edge Invisible Container Wrapper ── */
        .sidebar {
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          width: 100% !important;
          height: auto !important;
          min-height: unset !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          z-index: 9999 !important;
          display: flex !important;
          justify-content: center !important;
          align-items: flex-end !important;
          pointer-events: none !important;
          overflow: visible !important;
          padding: 0 !important;
          margin: 0 !important;
          border-right: none !important;
        }

        /* ── Centered Glassmorphism Dock ── */
        .b-nav-dock {
          display: flex !important;
          align-items: center !important;
          background: rgba(255, 255, 255, 0.85) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(229, 231, 235, 0.8) !important;
          padding: 8px 16px !important;
          border-radius: 24px !important;
          box-shadow: 
            0 10px 30px -5px rgba(0, 90, 135, 0.12), 
            0 4px 12px -2px rgba(0, 90, 135, 0.04) !important;
          pointer-events: auto !important;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
          width: max-content;
          max-width: 95vw;
          margin-bottom: 36px !important;
          height: 52px !important; /* Fixed height locks geometry during collapse transition */
          box-sizing: border-box !important;
          overflow: hidden !important;
        }

        /* ── Morphing Collapsed Dock Circle ── */
        .b-nav-dock.collapsed {
          width: 52px !important;
          height: 52px !important;
          padding: 0 !important;
          border-radius: 52px !important;
          justify-content: center !important;
        }

        /* ── Floating Action Menu Toggle ── */
        .b-nav-hamburger {
          display: none !important;
          align-items: center !important;
          justify-content: center !important;
          width: 52px !important;
          height: 52px !important;
          border-radius: 50% !important;
          border: none !important;
          background: transparent !important;
          color: #64748B !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          padding: 0 !important;
          outline: none !important;
          pointer-events: auto !important;
        }

        .b-nav-hamburger:hover {
          color: #0E7AC7 !important;
          background: rgba(14, 122, 199, 0.08) !important;
        }

        .b-nav-dock.collapsed .b-nav-hamburger {
          display: flex !important;
        }

        /* ── Navigation Content Container ── */
        .b-content-wrapper {
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          transition: opacity 0.22s ease, transform 0.22s ease, visibility 0.22s ease;
          opacity: 1;
          visibility: visible;
        }

        .b-nav-dock.collapsed .b-content-wrapper {
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          transform: scale(0.9) translateY(10px) !important;
          width: 0 !important;
          height: 0 !important;
          overflow: hidden !important;
        }

        /* ── Brand Logo Styling ── */
        .b-nav-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }
        
        .b-nav-brand:hover {
          transform: scale(1.05);
        }

        .b-nav-items {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .b-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          padding: 8px 16px;
          border-radius: 16px;
          color: #64748B;
          text-decoration: none;
          transition: all 0.2s ease;
          position: relative;
        }

        .b-nav-item:hover {
          color: #0E7AC7;
          background: rgba(14, 122, 199, 0.05);
        }

        .b-nav-item.active {
          color: #005A87;
          background: rgba(0, 90, 135, 0.08);
          font-weight: 750;
        }

        .b-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }

        .b-nav-item.active .b-nav-icon {
          transform: scale(1.08);
        }

        .b-nav-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: -0.1px;
        }

        /* ── Divider ── */
        .b-nav-divider {
          width: 1px;
          height: 24px;
          background: #E5E7EB;
          margin: 0 4px;
          flex-shrink: 0;
        }

        .b-nav-divider-mini {
          width: 1px;
          height: 16px;
          background: #E5E7EB;
          margin: 0 2px;
          flex-shrink: 0;
        }

        /* ── Profile and Actions ── */
        .b-nav-profile {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .b-nav-avatar {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: linear-gradient(135deg, #0E7AC7, #005A87);
          color: #ffffff;
          font-size: 12px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 90, 135, 0.2);
          cursor: default;
          user-select: none;
        }

        .b-nav-signout {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #64748B;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .b-nav-signout:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #EF4444;
        }

        /* ── Collapse Trigger Button ── */
        .b-nav-toggle-btn {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #64748B;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .b-nav-toggle-btn:hover {
          background: rgba(14, 122, 199, 0.08);
          color: #0E7AC7;
        }

        /* ── Responsive Styling ── */
        @media (max-width: 640px) {
          .b-nav-dock {
            margin-bottom: 24px !important;
            padding: 6px 12px !important;
            border-radius: 20px !important;
            height: 44px !important; /* Scaled down height for mobile */
          }
          .b-nav-dock.collapsed {
            width: 44px !important;
            height: 44px !important;
            border-radius: 44px !important;
            padding: 0 !important;
          }
          .b-nav-hamburger {
            width: 44px !important;
            height: 44px !important;
          }
          .b-nav-items {
            gap: 2px !important;
          }
          .b-nav-item {
            padding: 8px 10px !important;
            gap: 0px;
            border-radius: 12px !important;
          }
          .b-nav-label {
            display: none !important;
          }
          .b-nav-avatar {
            width: 28px !important;
            height: 28px !important;
            font-size: 10px !important;
            border-radius: 8px !important;
          }
          .b-nav-signout {
            width: 28px !important;
            height: 28px !important;
            border-radius: 8px !important;
          }
          .b-nav-toggle-btn {
            width: 28px !important;
            height: 28px !important;
            border-radius: 8px !important;
          }
          .b-nav-divider {
            height: 18px !important;
          }
        }
      `}</style>

      <aside className="sidebar">
        <div className={`b-nav-dock ${isCollapsed ? "collapsed" : ""}`}>
          {/* Hamburger Menu (Only active when collapsed) */}
          <button
            onClick={() => handleCollapseToggle(false)}
            className="b-nav-hamburger"
            title="Show Menu"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* Full Content Wrapper (Transitions smoothly) */}
          <div className="b-content-wrapper">
            {/* Brand Logo */}
            <Link href="/dashboard" className="b-nav-brand" title="Maruthi Insure Care">
              <img
                src="/images/logo-mic.png"
                alt="Maruthi Logo"
                width={28}
                height={28}
              />
            </Link>

            <div className="b-nav-divider" />

            {/* Navigation Tabs */}
            <nav className="b-nav-items">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`b-nav-item${isActive ? " active" : ""}`}
                  >
                    <span className="b-nav-icon">{item.icon}</span>
                    <span className="b-nav-label">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="b-nav-divider" />

            {/* Profile Avatar, Sign-Out & Collapse Buttons */}
            <div className="b-nav-profile">
              <div 
                className="b-nav-avatar" 
                title={`${userName || "User"} (${role || "Agent"})`}
              >
                {userName?.[0]?.toUpperCase() || role?.[0]?.toUpperCase() || "U"}
              </div>
              
              <button
                onClick={onSignOut}
                className="b-nav-signout"
                title="Sign Out"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>

              <div className="b-nav-divider-mini" />

              <button
                onClick={() => handleCollapseToggle(true)}
                className="b-nav-toggle-btn"
                title="Collapse Menu"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}