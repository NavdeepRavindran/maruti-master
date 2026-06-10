"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import InstallButton from "../app/components/InstallButton";

// ── Icons ─────────────────────────────────────────────────────────────────────

function ArrowRightIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M8 21v-4a4 4 0 018 0v4M8 10h.01M12 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  );
}

function UserCircleIcon() {
  return (
    <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Portal = "agent" | "client" | null;

// ── Main Component ─────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [hovered, setHovered] = useState<Portal>(null);

  // Respect prefers-reduced-motion
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    
    <div
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "#0B1F3A",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
    <InstallButton />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Lora:ital,wght@0,600;1,600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, sans-serif; }

        .mic-serif {
          font-family: 'Lora', Georgia, serif;
          font-style: italic;
          font-weight: 600;
        }

        /* Grid background */
        .mic-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        /* Glow */
        .mic-glow {
          position: absolute;
          top: -120px;
          right: -120px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 65%);
          pointer-events: none;
        }
        .mic-glow-left {
          position: absolute;
          bottom: -60px;
          left: -60px;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 65%);
          pointer-events: none;
        }

        /* Login card */
        .mic-portal-card {
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 32px 28px;
          cursor: pointer;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 16px;
          text-decoration: none;
          transition: background 0.22s ease, border-color 0.22s ease, transform 0.22s ease;
          flex: 1;
        }
        .mic-portal-card:hover {
          transform: translateY(-3px);
        }
        .mic-portal-card.agent:hover {
          background: rgba(37,99,235,0.14);
          border-color: rgba(37,99,235,0.55);
        }
        .mic-portal-card.client:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.22);
        }
        @media (prefers-reduced-motion: reduce) {
          .mic-portal-card { transition: none; }
          .mic-portal-card:hover { transform: none; }
        }

        /* Footer link */
        .mic-footer-link {
          color: rgba(255,255,255,0.22);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-decoration: none;
          transition: color 0.2s;
        }
        .mic-footer-link:hover { color: rgba(255,255,255,0.5); }

        /* Responsive */
        @media (max-width: 600px) {
          .mic-portal-cards { flex-direction: column !important; }
          .mic-nav { padding: 16px 20px !important; }
          .mic-main { padding: 40px 20px 36px !important; }
          .mic-footer { padding: 18px 20px !important; flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .mic-stats { gap: 20px !important; }
          .mic-headline { font-size: 38px !important; }
        }
      `}</style>

      

      {/* Decorative layers */}
      <div className="mic-grid" aria-hidden="true" />
      <div className="mic-glow" aria-hidden="true" />
      <div className="mic-glow-left" aria-hidden="true" />

      {/* ── Nav ─────────────────────────────────────────── */}
      <nav
        className="mic-nav"
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 48px",
          borderBottom: "0.5px solid rgba(255,255,255,0.07)",
        }}
      >
        
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: "#2563EB",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: -0.3,
              flexShrink: 0,
            }}
          >
            MIC
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: -0.2, lineHeight: 1.2 }}>
              Maruthi Insure Care
            </div>
            <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Care &amp; Protection
            </div>
          </div>
        </div>

        <div
          style={{
            background: "rgba(37,99,235,0.15)",
            border: "0.5px solid rgba(37,99,235,0.3)",
            color: "#93C5FD",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            padding: "5px 14px",
            borderRadius: 20,
          }}
        >
          Secure Portal
        </div>
      </nav>

      {/* ── Main ─────────────────────────────────────────── */}
      <main
        className="mic-main"
        style={{
          position: "relative",
          zIndex: 10,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "56px 24px 48px",
          textAlign: "center",
        }}
      >
        {/* Eyebrow */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, justifyContent: "center" }}>
          <div style={{ width: 20, height: 1.5, background: "#3B82F6", flexShrink: 0 }} />
          <span
            style={{
              color: "#3B82F6",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            Welcome back
          </span>
          <div style={{ width: 20, height: 1.5, background: "#3B82F6", flexShrink: 0 }} />
        </div>

        {/* Headline */}
        <h1
          className="mic-serif mic-headline"
          style={{
            fontSize: "clamp(38px, 5.5vw, 62px)",
            color: "#fff",
            lineHeight: 1.05,
            marginBottom: 14,
            letterSpacing: -0.5,
          }}
        >
          Your Policies,<br />One Place.
        </h1>

        {/* Sub */}
        <p
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.4)",
            lineHeight: 1.75,
            maxWidth: 380,
            marginBottom: 44,
          }}
        >
          Sign in to manage your insurance, download documents, and stay protected — from any device.
        </p>

        {/* Portal cards */}
        <div
          className="mic-portal-cards"
          style={{ display: "flex", gap: 14, width: "100%", maxWidth: 560, marginBottom: 52 }}
        >
          {/* Agent */}
          <Link
            href="/login"
            className="mic-portal-card agent"
            onMouseEnter={() => setHovered("agent")}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 11,
                background: "rgba(37,99,235,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#93C5FD",
                transition: "background 0.2s",
              }}
            >
              <BuildingIcon />
            </div>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#93C5FD",
                  marginBottom: 4,
                }}
              >
                Admin
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
                Agent Login
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.38)", lineHeight: 1.65 }}>
              Manage clients, upload documents, view family records, and track renewals.
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: hovered === "agent" ? "#60A5FA" : "#2563EB",
                transition: "color 0.2s",
                marginTop: 4,
              }}
            >
              Enter dashboard <ArrowRightIcon size={12} />
            </div>
          </Link>

          {/* Client */}
          <Link
            href="/client-login"
            className="mic-portal-card client"
            onMouseEnter={() => setHovered("client")}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 11,
                background: "rgba(255,255,255,0.07)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.5)",
                transition: "background 0.2s",
              }}
            >
              <UserCircleIcon />
            </div>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 4,
                }}
              >
                Policyholder
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
                Client Login
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.38)", lineHeight: 1.65 }}>
              View your policies, download documents, and check family member coverage anytime.
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: hovered === "client" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)",
                transition: "color 0.2s",
                marginTop: 4,
              }}
            >
              View my policies <ArrowRightIcon size={12} />
            </div>
          </Link>
        </div>

        {/* Stats */}
        <div
          className="mic-stats"
          style={{
            display: "flex",
            gap: 36,
            justifyContent: "center",
            flexWrap: "wrap",
            paddingTop: 28,
            borderTop: "0.5px solid rgba(255,255,255,0.07)",
            width: "100%",
            maxWidth: 560,
          }}
        >
          {[
            { n: "2,000+", l: "Families Protected" },
            { n: "₹15Cr+", l: "Claims Settled" },
            { n: "15+", l: "Years of Trust" },
          ].map((s) => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div
                className="mic-serif"
                style={{ fontSize: 26, color: "#fff", lineHeight: 1 }}
              >
                {s.n}
              </div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.25)",
                  marginTop: 5,
                }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer
        className="mic-footer"
        style={{
          position: "relative",
          zIndex: 10,
          background: "#060F1E",
          borderTop: "0.5px solid rgba(255,255,255,0.06)",
          padding: "20px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em" }}>
          © 2026 Maruthi Insure Care · Bengaluru, Karnataka
        </span>

        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em" }}>
          Built by{" "}
          <a
            href="https://auxacode.com"
            style={{ color: "rgba(37,99,235,0.55)", textDecoration: "none" }}
          >
            Auxacode Technologies
          </a>
        </span>
      </footer>
    </div>
  );
}