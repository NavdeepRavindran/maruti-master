"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ─── Data ────────────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    num: "01",
    icon: "🏥",
    name: "Health Insurance",
    desc: "Cashless hospitalisation, critical illness cover, and annual health check-ups for the whole family.",
    badge: "Most Popular",
  },
  {
    num: "02",
    icon: "🛡️",
    name: "Life Insurance",
    desc: "Term plans and wealth-building policies that secure your family's financial future for generations.",
    badge: "",
  },
  {
    num: "03",
    icon: "🚗",
    name: "Vehicle Insurance",
    desc: "Comprehensive and third-party cover for cars and two-wheelers, renewed in minutes.",
    badge: "",
  },
  {
    num: "04",
    icon: "📈",
    name: "Wealth Creation",
    desc: "ULIPs and endowment plans that grow your money while protecting your life.",
    badge: "High Returns",
  },
  {
    num: "05",
    icon: "🏠",
    name: "Home Insurance",
    desc: "Protect your home against fire, theft, natural calamities, and everything in between.",
    badge: "",
  },
  {
    num: "06",
    icon: "✈️",
    name: "Travel Insurance",
    desc: "Worry-free journeys with medical, baggage, and trip cancellation cover worldwide.",
    badge: "",
  },
];

const WHY_ITEMS = [
  {
    icon: "🤝",
    title: "Personalized Care",
    body: "You are not just a policy number. Sampath Kumar personally knows every client by name.",
  },
  {
    icon: "⚡",
    title: "Rapid Settlement",
    body: "Our digital claims process is built for speed — most claims settled within 7 working days.",
  },
  {
    icon: "📱",
    title: "Digital-First",
    body: "Manage everything from your phone. No queues, no paperwork, no stress. Ever.",
  },
  {
    icon: "🧠",
    title: "Expert Guidance",
    body: "15+ years of expertise guiding families toward the right coverage at the right price.",
  },
];

const AGENT_FEATURES = ["Client Management", "Document Upload", "Family Records", "Reports & Analytics"];
const CLIENT_FEATURES = ["View Policies", "Download Docs", "Family Info", "Renewal Dates"];

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="w-6 h-[1.5px] bg-blue-600 shrink-0" />
      <span className="text-[11px] font-bold tracking-[.2em] uppercase text-blue-600">
        {children}
      </span>
    </div>
  );
}

function ArrowIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function ChevronIcon({ size = 10, rotated = false }: { size?: number; rotated?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
      style={{ transform: rotated ? "rotate(180deg)" : undefined, transition: "transform 0.2s" }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [hoveredWhy, setHoveredWhy] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close login dropdown on outside click
  useEffect(() => {
    if (!loginOpen) return;
    const close = () => setLoginOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [loginOpen]);

  return (
    <div
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
      className="bg-slate-50 text-slate-900 overflow-x-hidden"
    >
      {/* ── Global font import ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400;1,600&display=swap');
        body { font-family: 'Inter', -apple-system, sans-serif; }
        .serif { font-family: 'Lora', Georgia, serif; font-style: italic; }
        .product-card-line::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: #2563EB;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
          border-radius: 0;
        }
        .product-card-line:hover::after { transform: scaleX(1); }
        .why-card-hover { transition: background 0.3s, color 0.3s; }
        .why-card-hover:hover { background: #0B1F3A !important; }
        .why-card-hover:hover .why-title { color: #fff !important; }
        .why-card-hover:hover .why-body { color: rgba(255,255,255,0.45) !important; }
        .why-card-hover:hover .why-icon { background: rgba(255,255,255,0.07) !important; color: #93C5FD !important; }
        .portal-hover { transition: transform 0.3s ease; }
        .portal-hover:hover { transform: translateY(-4px); }
        .nav-a-link { color: rgba(255,255,255,0.45); font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; transition: color 0.2s; }
        .nav-a-link:hover { color: #fff; }
        .footer-link { display: block; font-size: 13px; color: rgba(255,255,255,0.3); margin-bottom: 14px; text-decoration: none; transition: color 0.2s; }
        .footer-link:hover { color: rgba(255,255,255,0.7); }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .drop-in { animation: dropIn 0.18s ease both; }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-fade { animation: heroFadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .hero-fade-1 { animation-delay: 0s; }
        .hero-fade-2 { animation-delay: 0.12s; }
        .hero-fade-3 { animation-delay: 0.22s; }
        .hero-fade-4 { animation-delay: 0.35s; }
      `}</style>

      {/* ════════════════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════════════════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-[#0B1F3A]/97 shadow-lg shadow-black/20" : "bg-[#0B1F3A]"
        }`}
        style={{ height: 72, display: "flex", alignItems: "center" }}
      >
        <div className="w-full max-w-[1280px] mx-auto px-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div
              className="w-[42px] h-[42px] bg-blue-600 rounded-[10px] flex items-center justify-center text-white font-black text-[13px] shrink-0"
              style={{ letterSpacing: -0.5 }}
            >
              MIC
            </div>
            <div>
              <div className="text-[15px] font-bold text-white leading-tight" style={{ letterSpacing: -0.3 }}>
                Maruthi Insure Care
              </div>
              <div className="text-[9px] font-bold text-white/35 tracking-[.22em] uppercase">
                Care &amp; Protection
              </div>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-9">
            {[
              ["#products", "Products"],
              ["#why-us", "Why Us"],
              ["#about", "Our Story"],
              ["#contact", "Contact"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="nav-a-link">
                {label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            {/* Login dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setLoginOpen((o) => !o)}
                className="flex items-center gap-2 px-5 py-[9px] border border-white/15 rounded-lg text-white/70 text-[11px] font-bold tracking-[.1em] uppercase bg-transparent hover:border-white/35 hover:text-white transition-all"
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Login
                <ChevronIcon rotated={loginOpen} />
              </button>

              {loginOpen && (
                <div className="drop-in absolute top-[calc(100%+8px)] right-0 bg-white rounded-xl shadow-2xl shadow-black/15 border border-slate-200 overflow-hidden min-w-[200px]">
                  <Link
                    href="/login"
                    className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors no-underline"
                    onClick={() => setLoginOpen(false)}
                  >
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-base shrink-0">🏢</div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-900">Agent Login</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Admin dashboard access</div>
                    </div>
                  </Link>
                  <Link
                    href="/client-login"
                    className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors no-underline"
                    onClick={() => setLoginOpen(false)}
                  >
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-base shrink-0">👤</div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-900">Client Login</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">View your documents</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/client-login"
              className="flex items-center gap-2 px-[22px] py-[9px] bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold tracking-[.1em] uppercase rounded-lg transition-colors no-underline"
            >
              Get Started <ArrowIcon size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════ */}
      <section
        className="relative flex flex-col justify-center overflow-hidden"
        style={{ background: "#0B1F3A", minHeight: "92vh", paddingTop: 120, paddingBottom: 100 }}
      >
        {/* Grid bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        {/* Glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: -200,
            right: -100,
            width: 600,
            height: 600,
            background: "radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-[1280px] mx-auto w-full px-16">
          {/* Eyebrow */}
          <div className="hero-fade hero-fade-1 flex items-center gap-3 mb-7">
            <span className="w-7 h-[1.5px] bg-blue-500 shrink-0" />
            <span className="text-[11px] font-bold tracking-[.25em] uppercase text-blue-500">
              Family Protection
            </span>
          </div>

          {/* Headline */}
          <h1
            className="serif hero-fade hero-fade-2 text-white"
            style={{
              fontSize: "clamp(52px, 6.5vw, 96px)",
              fontWeight: 600,
              lineHeight: 1.0,
              letterSpacing: -0.5,
              maxWidth: 800,
              marginBottom: 28,
            }}
          >
            Security That<br />Never Sleeps.
          </h1>

          {/* Sub */}
          <p
            className="hero-fade hero-fade-3"
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.8,
              maxWidth: 520,
              marginBottom: 52,
              fontWeight: 400,
            }}
          >
            Comprehensive insurance built around real Indian families — not just policies, but a promise.
          </p>

          {/* CTAs */}
          <div className="hero-fade hero-fade-4 flex items-center gap-4 flex-wrap mb-20">
            <Link
              href="/client-login"
              className="inline-flex items-center gap-3 text-white bg-blue-600 hover:bg-blue-700 rounded-[9px] no-underline transition-all hover:-translate-y-px"
              style={{ padding: "18px 36px", fontSize: 13, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase" }}
            >
              Access Portal <ArrowIcon size={14} />
            </Link>
            <a
              href="#products"
              className="inline-flex items-center gap-3 rounded-[9px] no-underline transition-all"
              style={{
                padding: "17px 32px",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.65)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.35)";
                (e.currentTarget as HTMLElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)";
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)";
              }}
            >
              Explore Products
            </a>
          </div>

          {/* Stats row */}
          <div
            className="flex gap-16 flex-wrap pt-[52px]"
            style={{ borderTop: "0.5px solid rgba(255,255,255,0.07)" }}
          >
            {[
              { n: "2,000+", l: "Families Protected" },
              { n: "₹15Cr+", l: "Claims Settled" },
              { n: "15+", l: "Years of Trust" },
              { n: "10K+", l: "Documents Secured" },
            ].map((s) => (
              <div key={s.l}>
                <div
                  className="serif text-white"
                  style={{ fontSize: 36, fontWeight: 700, lineHeight: 1, marginBottom: 5 }}
                >
                  {s.n}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: ".18em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.3)",
                  }}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          PRODUCTS
      ════════════════════════════════════════════════════ */}
      <section id="products" className="max-w-[1280px] mx-auto px-16 py-28">
        <SectionTag>Our Products</SectionTag>
        <div className="flex justify-between items-end gap-8 flex-wrap mb-16">
          <h2 className="serif" style={{ fontSize: "clamp(36px, 4.5vw, 62px)", fontWeight: 600, color: "#0F172A", lineHeight: 1.05 }}>
            Protection for every<br />
            <em style={{ color: "#2563EB" }}>chapter of life.</em>
          </h2>
          <p style={{ fontSize: 16, color: "#64748B", lineHeight: 1.8, maxWidth: 380 }}>
            Six carefully curated insurance products, each designed to give complete peace of mind at every stage.
          </p>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          style={{ border: "0.5px solid #E2E8F0", borderRadius: 20, overflow: "hidden" }}
        >
          {PRODUCTS.map((p, i) => (
            <div
              key={p.num}
              className="product-card-line relative bg-white"
              style={{
                padding: "48px 40px",
                borderRight: (i + 1) % 3 === 0 ? "none" : "0.5px solid #E2E8F0",
                borderBottom: i < 3 ? "0.5px solid #E2E8F0" : "none",
                transition: "background 0.25s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#FAFCFF";
                setHoveredProduct(i);
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#fff";
                setHoveredProduct(null);
              }}
            >
              {p.badge && (
                <div
                  className="absolute top-5 right-5 bg-blue-600 text-white text-[9px] font-black tracking-[.1em] uppercase px-[10px] py-[4px] rounded-full"
                >
                  {p.badge}
                </div>
              )}

              <div
                className="flex items-center justify-center rounded-[14px] mb-7 transition-colors"
                style={{
                  width: 56,
                  height: 56,
                  fontSize: 24,
                  background: hoveredProduct === i ? "#DBEAFE" : "#EFF6FF",
                }}
              >
                {p.icon}
              </div>

              <div
                style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: "#2563EB", marginBottom: 10 }}
              >
                {p.num}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", marginBottom: 12 }}>
                {p.name}
              </h3>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.75 }}>{p.desc}</p>

              <div
                className="flex items-center gap-2 mt-7"
                style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#2563EB" }}
              >
                Learn More <ArrowIcon size={12} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          PORTALS
      ════════════════════════════════════════════════════ */}
      <section className="max-w-[1280px] mx-auto px-16 pb-28">
        <SectionTag>Dedicated Portals</SectionTag>
        <h2
          className="serif mb-16"
          style={{ fontSize: "clamp(36px, 4.5vw, 62px)", fontWeight: 600, color: "#0F172A", lineHeight: 1.05 }}
        >
          Two gateways.<br />
          <em style={{ color: "#2563EB" }}>One mission.</em>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent portal */}
          <div
            className="portal-hover rounded-[20px] relative overflow-hidden"
            style={{ background: "#0B1F3A", padding: "72px 60px" }}
          >
            <div
              className="absolute pointer-events-none"
              style={{ top: -80, right: -80, width: 300, height: 300, border: "1px solid rgba(37,99,235,0.1)", borderRadius: "50%" }}
            />
            <div
              className="absolute pointer-events-none"
              style={{ bottom: -40, left: -40, width: 200, height: 200, border: "0.5px solid rgba(255,255,255,0.03)", borderRadius: "50%" }}
            />

            <div
              className="inline-block rounded-lg mb-7"
              style={{ background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.25)", padding: "6px 14px", fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "#93C5FD" }}
            >
              Agent Hub
            </div>

            <h3
              className="serif"
              style={{ fontSize: 46, fontWeight: 600, color: "#fff", lineHeight: 1.05, marginBottom: 20 }}
            >
              Agent<br />Workspace
            </h3>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, marginBottom: 40 }}>
              Full admin access to manage clients, upload documents, view family trees, send birthday and anniversary reminders, and track all activity in one powerful place.
            </p>

            <div className="flex gap-2.5 flex-wrap mb-11">
              {AGENT_FEATURES.map((f) => (
                <span
                  key={f}
                  style={{ fontSize: 11, fontWeight: 600, padding: "6px 14px", background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 20, color: "rgba(255,255,255,0.4)", letterSpacing: ".05em" }}
                >
                  {f}
                </span>
              ))}
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg no-underline transition-colors"
              style={{ padding: "14px 28px", fontSize: 12, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase" }}
            >
              Enter Hub <ArrowIcon size={14} />
            </Link>
          </div>

          {/* Client portal */}
          <div
            className="portal-hover rounded-[20px]"
            style={{ background: "#fff", border: "0.5px solid #E2E8F0", padding: "72px 60px" }}
          >
            <div
              className="inline-block rounded-lg mb-7"
              style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", padding: "6px 14px", fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "#1D4ED8" }}
            >
              Client Portal
            </div>

            <h3
              className="serif"
              style={{ fontSize: 46, fontWeight: 600, color: "#0F172A", lineHeight: 1.05, marginBottom: 20 }}
            >
              Client<br />Secure View
            </h3>
            <p style={{ fontSize: 15, color: "#64748B", lineHeight: 1.8, marginBottom: 40 }}>
              Read-only access to view your complete insurance profile, download policy documents, and check family member records — anytime, from any device.
            </p>

            <div className="flex gap-2.5 flex-wrap mb-11">
              {CLIENT_FEATURES.map((f) => (
                <span
                  key={f}
                  style={{ fontSize: 11, fontWeight: 600, padding: "6px 14px", background: "#EFF6FF", border: "0.5px solid #BFDBFE", borderRadius: 20, color: "#1D4ED8", letterSpacing: ".05em" }}
                >
                  {f}
                </span>
              ))}
            </div>

            <Link
              href="/client-login"
              className="inline-flex items-center gap-2 text-white rounded-lg no-underline transition-colors"
              style={{ padding: "14px 28px", fontSize: 12, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", background: "#0B1F3A" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#162d52")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#0B1F3A")}
            >
              Client Login <ArrowIcon size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          WHY US
      ════════════════════════════════════════════════════ */}
      <div
        id="why-us"
        style={{ background: "#fff", borderTop: "0.5px solid #E2E8F0", borderBottom: "0.5px solid #E2E8F0" }}
      >
        <div className="max-w-[1280px] mx-auto px-16 pt-20 pb-12">
          <SectionTag>Why Choose Us</SectionTag>
          <h2
            className="serif"
            style={{ fontSize: "clamp(36px, 4.5vw, 62px)", fontWeight: 600, color: "#0F172A", lineHeight: 1.05 }}
          >
            Heritage of trust,<br />
            <em style={{ color: "#2563EB" }}>powered by technology.</em>
          </h2>
        </div>

        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {WHY_ITEMS.map((w, i) => (
            <div
              key={w.title}
              className="why-card-hover"
              style={{
                padding: "72px 48px",
                borderRight: i < WHY_ITEMS.length - 1 ? "0.5px solid #E2E8F0" : "none",
                background: hoveredWhy === i ? "#0B1F3A" : "#fff",
                cursor: "default",
              }}
              onMouseEnter={() => setHoveredWhy(i)}
              onMouseLeave={() => setHoveredWhy(null)}
            >
              <div
                className="why-icon flex items-center justify-center rounded-[14px] mb-6 transition-all"
                style={{ width: 52, height: 52, fontSize: 24, background: "#EFF6FF" }}
              >
                {w.icon}
              </div>
              <div
                className="why-title transition-colors"
                style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".06em" }}
              >
                {w.title}
              </div>
              <div
                className="why-body transition-colors"
                style={{ fontSize: 14, color: "#64748B", lineHeight: 1.75 }}
              >
                {w.body}
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: 72 }} />
      </div>

      {/* ════════════════════════════════════════════════════
          FOUNDER
      ════════════════════════════════════════════════════ */}
      <section
        id="about"
        className="max-w-[1280px] mx-auto px-16 py-28 grid grid-cols-1 lg:grid-cols-2 gap-24 lg:gap-32 items-center"
      >
        {/* Image placeholder */}
        <div
          className="relative overflow-hidden flex items-center justify-center rounded-[6px]"
          style={{ aspectRatio: "4/5", background: "#0B1F3A" }}
        >
          <span className="serif" style={{ fontSize: 120, fontWeight: 600, color: "rgba(255,255,255,0.07)" }}>
            SK
          </span>
          {/* Badge */}
          <div
            className="absolute rounded-[4px]"
            style={{ bottom: 32, left: -16, background: "#2563EB", padding: "18px 24px", color: "#fff" }}
          >
            <div className="serif" style={{ fontSize: 36, fontWeight: 700, lineHeight: 1 }}>15+</div>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginTop: 4 }}>
              Years of Service
            </div>
          </div>
        </div>

        {/* Text */}
        <div>
          <SectionTag>Our Founder</SectionTag>
          <div style={{ width: 40, height: 2, background: "#2563EB", marginBottom: 36 }} />

          <blockquote
            className="serif"
            style={{ fontSize: "clamp(24px, 3vw, 40px)", color: "#0F172A", lineHeight: 1.35, marginBottom: 28 }}
          >
            "Your family's peace of mind is my only priority."
          </blockquote>

          <p style={{ fontSize: 16, color: "#64748B", lineHeight: 1.9, marginBottom: 48 }}>
            Over 15 years ago, I started Maruthi Insure Care with a simple mission — to be the most trusted insurance advisor in the community. Today, our digital platform scales that promise, but the core belief remains unchanged: every family deserves real, personal care.
          </p>

          <div
            className="flex items-center gap-5 pt-8"
            style={{ borderTop: "0.5px solid #E2E8F0" }}
          >
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{ width: 52, height: 52, background: "#0B1F3A" }}
            >
              <span className="serif" style={{ fontSize: 18, color: "rgba(255,255,255,0.6)" }}>SK</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", textTransform: "uppercase", letterSpacing: ".07em" }}>
                Sampath Kumar R
              </div>
              <div style={{ fontSize: 11, color: "#64748B", letterSpacing: ".12em", textTransform: "uppercase", marginTop: 3 }}>
                Principal Consultant &amp; Founder
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          TESTIMONIAL
      ════════════════════════════════════════════════════ */}
      <section className="max-w-[1280px] mx-auto px-16 pb-28">
        <div
          className="relative overflow-hidden rounded-[20px]"
          style={{ background: "#fff", border: "0.5px solid #E2E8F0", padding: "80px 72px" }}
        >
          {/* Big quote mark */}
          <div
            className="serif absolute pointer-events-none select-none"
            style={{ top: 10, left: 48, fontSize: 220, color: "#F1F5F9", lineHeight: 1 }}
          >
            "
          </div>

          <div style={{ position: "relative" }}>
            <SectionTag>Client Story</SectionTag>
            <blockquote
              className="serif"
              style={{ fontSize: "clamp(22px, 2.8vw, 36px)", color: "#0F172A", lineHeight: 1.5, marginBottom: 40, maxWidth: 700 }}
            >
              When my father was hospitalised, Sampath sir personally followed up with the hospital and the insurance company. The entire claim was settled in 5 days. I never felt alone.
            </blockquote>

            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center rounded-full shrink-0 text-white font-bold text-[17px]"
                style={{ width: 48, height: 48, background: "#0B1F3A" }}
              >
                R
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Rajesh Sharma</div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Client since 2019 · Health Insurance</div>
              </div>
              <div className="ml-auto flex gap-1" style={{ color: "#2563EB", fontSize: 18 }}>
                {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          CONTACT
      ════════════════════════════════════════════════════ */}
      <section id="contact" className="max-w-[1280px] mx-auto px-16 pb-28">
        <div
          className="relative overflow-hidden rounded-[24px] flex justify-between items-center flex-wrap gap-10"
          style={{ background: "#0B1F3A", padding: "80px 72px" }}
        >
          <div
            className="absolute pointer-events-none"
            style={{ top: -120, right: -80, width: 400, height: 400, background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)" }}
          />

          <div style={{ position: "relative" }}>
            <SectionTag>Get In Touch</SectionTag>
            <h2
              className="serif"
              style={{ fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 600, color: "#fff", lineHeight: 1.1 }}
            >
              Have a question?<br />
              <em>Let's talk.</em>
            </h2>
          </div>

          <div className="flex gap-4 flex-wrap" style={{ position: "relative" }}>
            <a
              href="tel:+919800000000"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg no-underline transition-all hover:-translate-y-px"
              style={{ padding: "16px 30px", fontSize: 12, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase" }}
            >
              📞 Call Now
            </a>
            <a
              href="https://wa.me/919800000000"
              className="inline-flex items-center gap-2 text-white/65 rounded-lg no-underline transition-all"
              style={{ padding: "15px 28px", fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", border: "1px solid rgba(255,255,255,0.15)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.4)";
                (e.currentTarget as HTMLElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)";
              }}
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════ */}
      <footer style={{ background: "#060F1E", padding: "80px 64px 40px" }}>
        <div className="max-w-[1280px] mx-auto">
          <div
            className="grid gap-16 mb-16"
            style={{ gridTemplateColumns: "2.5fr 1fr 1fr 1fr" }}
          >
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-blue-600 rounded-[8px] flex items-center justify-center text-white font-black text-[12px]">
                  MIC
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Maruthi Insure Care</span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.8, maxWidth: 280, marginBottom: 28 }}>
                Comprehensive insurance with a personal touch — securing your future, one family at a time.
              </p>
              <div className="flex gap-3 flex-wrap">
                {[{ icon: "▶", label: "Google Play" }, { icon: "🍎", label: "App Store" }].map((a) => (
                  <a
                    key={a.label}
                    href="#"
                    style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 14px", background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 8, color: "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 600, textDecoration: "none", transition: "color .2s" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)")}
                  >
                    {a.icon} {a.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Products */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".25em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 22 }}>
                Products
              </div>
              {["Health Insurance", "Life Insurance", "Vehicle Insurance", "Wealth Creation", "Home & Travel"].map((l) => (
                <a key={l} href="#products" className="footer-link">{l}</a>
              ))}
            </div>

            {/* Portals */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".25em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 22 }}>
                Portals
              </div>
              {[["Agent Login", "/login"], ["Client Login", "/client-login"], ["Document Vault", "/client-login"], ["Claims Tracker", "#"], ["Renewal Portal", "#"]].map(([l, h]) => (
                <Link key={l} href={h} className="footer-link">{l}</Link>
              ))}
            </div>

            {/* Contact */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".25em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 22 }}>
                Contact
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 2.1 }}>
                <div>Bengaluru, Karnataka</div>
                <div>India — 560001</div>
                <div style={{ marginTop: 8 }}>+91 98XXX XXXXX</div>
                <div>sampath@maruthiinsure.care</div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="flex justify-between items-center flex-wrap gap-3 pt-7"
            style={{ borderTop: "0.5px solid rgba(255,255,255,0.05)" }}
          >
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: ".08em", textTransform: "uppercase" }}>
              © 2026 Maruthi Insure Care. All rights reserved.
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: ".08em", textTransform: "uppercase" }}>
              Built by{" "}
              <a href="https://auxacode.com" style={{ color: "rgba(37,99,235,0.6)", textDecoration: "none" }}>
                Auxacode Technologies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}   