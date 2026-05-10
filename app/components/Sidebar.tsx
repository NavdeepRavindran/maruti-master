"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Clients",
    href: "/dashboard/clients",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "Documents",
    href: "/dashboard/documents",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Birthdays",
    href: "/dashboard/birthdays",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 16v2m3-6v6m3-8v8m7-11.105V19a2 2 0 01-2 2H4a2 2 0 01-2-2V4.895A2 2 0 013.99 2.952C5.77 4.057 7.87 4.5 10 4.5s4.23-.443 6.01-1.548A2 2 0 0120.01 4.895z" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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

  return (
    <>
      <style>{`
        .sidebar {
          width: 260px;
          min-width: 260px;
          background: #0f172a;
          height: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          overflow-x: hidden;
          border-right: 1px solid rgba(255,255,255,0.06);
        }

        /* ── Logo ── */
        .sb-logo {
          padding: 24px 20px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .sb-logo-link {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }
        .sb-logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(59,130,246,0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .sb-logo-link:hover .sb-logo-icon {
          transform: scale(1.06);
          box-shadow: 0 6px 18px rgba(59,130,246,0.5);
        }
        .sb-logo-text { display: flex; flex-direction: column; gap: 1px; }
        .sb-logo-name {
          font-size: 17px;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: -0.5px;
          font-style: italic;
          line-height: 1;
        }
        .sb-logo-sub {
          font-size: 9px;
          font-weight: 700;
          color: #60a5fa;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          line-height: 1;
        }

        /* ── Nav section label ── */
        .sb-section-label {
          padding: 20px 20px 8px;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: rgba(255,255,255,0.25);
        }

        /* ── Nav ── */
        .sb-nav {
          flex: 1;
          padding: 8px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sb-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          text-decoration: none;
          color: rgba(255,255,255,0.5);
          font-size: 14px;
          font-weight: 600;
          transition: all 0.15s;
          position: relative;
          letter-spacing: -0.1px;
        }
        .sb-item:hover {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.9);
        }
        .sb-item:hover .sb-icon { color: #60a5fa; }

        .sb-item.active {
          background: rgba(59,130,246,0.15);
          color: #ffffff;
        }
        .sb-item.active .sb-icon { color: #60a5fa; }
        .sb-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 18px;
          background: #3b82f6;
          border-radius: 0 3px 3px 0;
        }

        .sb-icon {
          color: rgba(255,255,255,0.3);
          flex-shrink: 0;
          transition: color 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
        }

        .sb-label { flex: 1; }

        /* ── Footer ── */
        .sb-footer {
          padding: 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .sb-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 10px;
          border-radius: 10px;
          transition: background 0.15s;
        }
        .sb-user:hover { background: rgba(255,255,255,0.05); }

        .sb-avatar {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 900;
          color: #fff;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(59,130,246,0.3);
        }

        .sb-user-info { flex: 1; min-width: 0; }
        .sb-user-name {
          font-size: 13px;
          font-weight: 700;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
        }
        .sb-user-role {
          font-size: 10px;
          color: rgba(255,255,255,0.35);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          line-height: 1.2;
          margin-top: 1px;
        }

        .sb-signout {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.3);
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .sb-signout:hover {
          background: rgba(239,68,68,0.12);
          color: #f87171;
        }

        /* ── Authenticated badge ── */
        .sb-auth-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 22px 14px;
        }
        .sb-auth-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #22c55e;
          flex-shrink: 0;
        }
        .sb-auth-txt {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: rgba(255,255,255,0.25);
        }
      `}</style>

      <aside className="sidebar">
        {/* Logo */}
        <div className="sb-logo">
          <Link href="/" className="sb-logo-link">
            <div className="sb-logo-icon">
              <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="sb-logo-text">
              <span className="sb-logo-name">Maruthi</span>
              <span className="sb-logo-sub">Insure Care</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <div className="sb-section-label">Main Menu</div>
        <nav className="sb-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sb-item${isActive ? " active" : ""}`}
              >
                <span className="sb-icon">{item.icon}</span>
                <span className="sb-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-avatar">
              {userName?.[0]?.toUpperCase() || role?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="sb-user-info">
              <div className="sb-user-name">{userName || "Maruthi User"}</div>
              <div className="sb-user-role">{role || "Agent"}</div>
            </div>
            <button
              onClick={onSignOut}
              className="sb-signout"
              title="Sign Out"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          <div className="sb-auth-badge">
            <div className="sb-auth-dot" />
            <span className="sb-auth-txt">Authenticated</span>
          </div>
        </div>
      </aside>
    </>
  );
}