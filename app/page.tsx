"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

const slides = [
  {
    title: "Protecting what\nmatters most.",
    subtitle: "Welcome to Maruthi Insure Care",
    description: "A promise of security for your family's future. Our digital portal ensures your peace of mind is always reachable.",
    image: "https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&q=80&w=1200",
    accent: "#C9A84C",
  },
  {
    title: "Health is your\ngreatest wealth.",
    subtitle: "Complete Health Protection",
    description: "Stay prepared for the unexpected with comprehensive health coverage for you and your loved ones.",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200",
    accent: "#4CAF82",
  },
  {
    title: "Claims made\nsimple & fast.",
    subtitle: "Hassle-Free Support",
    description: "We are with you when it counts. Our digital-first approach ensures quick settlements and constant support.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1200",
    accent: "#4C7EC9",
  }
];

const stats = [
  { label: "Satisfied Clients", value: "2,000+", icon: "◈" },
  { label: "Claims Settled", value: "₹15Cr+", icon: "◈" },
  { label: "Documents Saved", value: "10,000+", icon: "◈" },
  { label: "Cities Reached", value: "25+", icon: "◈" },
];

const services = [
  { title: "Health Insurance", icon: "⊕", desc: "Comprehensive coverage for every stage of life" },
  { title: "Life Insurance", icon: "⊕", desc: "Secure your family's financial tomorrow" },
  { title: "Vehicle Insurance", icon: "⊕", desc: "Protection on every road you travel" },
  { title: "Wealth Creation", icon: "⊕", desc: "Build a legacy worth inheriting" },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouse);
    return () => {
      clearInterval(timer);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        
        :root {
          --gold: #C9A84C;
          --dark: #0A0A0A;
          --surface: #141414;
          --surface2: #1C1C1C;
          --border: rgba(255,255,255,0.08);
          --text-muted: rgba(255,255,255,0.45);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .playfair { font-family: 'Playfair Display', serif; }

        .nav-link {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          transition: color 0.3s;
          text-decoration: none;
        }
        .nav-link:hover { color: white; }

        .slide-enter { animation: slideIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .slide-exit { animation: slideOut 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(1.08); } to { transform: scale(1); }
        }

        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .stat-card:hover {
          border-color: var(--gold);
          transform: translateY(-4px);
          background: var(--surface2);
        }

        .service-item {
          border-bottom: 1px solid var(--border);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .service-item:hover { background: var(--surface); }
        .service-item:hover .service-arrow { transform: translateX(6px) rotate(-45deg); }

        .service-arrow { transition: transform 0.3s ease; }

        .portal-card {
          background: var(--surface);
          border: 1px solid var(--border);
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          position: relative;
          overflow: hidden;
        }
        .portal-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 60%, rgba(201,168,76,0.05) 100%);
          opacity: 0;
          transition: opacity 0.4s;
        }
        .portal-card:hover::before { opacity: 1; }
        .portal-card:hover { border-color: rgba(201,168,76,0.3); transform: translateY(-6px); }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 32px;
          background: var(--gold);
          color: #0A0A0A;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .btn-primary:hover { background: #DDB95C; transform: translateY(-2px); }

        .btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 32px;
          background: transparent;
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .btn-outline:hover { border-color: white; background: rgba(255,255,255,0.05); }

        .noise-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9999;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 128px;
        }

        .cursor-glow {
          position: fixed;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%);
          pointer-events: none;
          z-index: 1;
          transform: translate(-50%, -50%);
          transition: left 0.6s ease, top 0.6s ease;
        }

        .section-label {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: var(--gold);
        }

        .divider { border: none; border-top: 1px solid var(--border); }

        .quick-action {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 2px;
          padding: 28px;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .quick-action:hover { border-color: var(--gold); background: var(--surface2); }

        .image-reveal {
          animation: scaleIn 8s ease forwards;
        }

        .text-reveal {
          animation: slideIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .footer-link {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-link:hover { color: var(--gold); }
      `}</style>

      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Cursor glow */}
      <div className="cursor-glow" style={{
        left: `${mousePos.x * 100}vw`,
        top: `${mousePos.y * 100}vh`,
      }} />

      {/* ─── NAVIGATION ─── */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 100,
        background: isScrolled ? 'rgba(10,10,10,0.95)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.4s ease',
        padding: '0 40px',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 40, height: 40,
              border: '1px solid rgba(201,168,76,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#C9A84C" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="playfair" style={{ fontSize: 18, fontWeight: 700, color: 'white', lineHeight: 1.1 }}>Maruthi Insure</div>
              <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.3em', color: 'rgba(201,168,76,0.7)', textTransform: 'uppercase' }}>Care & Protection</div>
            </div>
          </div>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 48 }} className="hidden md:flex">
            <a href="#about" className="nav-link">Our Story</a>
            <a href="#services" className="nav-link">Services</a>
            <a href="#why-us" className="nav-link">Why Us</a>
            <Link href="/client-login" className="btn-primary" style={{ padding: '12px 24px', fontSize: 10 }}>
              Client Login
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* Mobile menu btn */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 8 }} className="md:hidden">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div style={{ background: '#141414', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 40px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <a href="#about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Our Story</a>
            <a href="#services" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Services</a>
            <a href="#why-us" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Why Us</a>
            <Link href="/client-login" className="btn-primary" style={{ marginTop: 8, justifyContent: 'center' }} onClick={() => setMobileMenuOpen(false)}>Client Login</Link>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section ref={heroRef} style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'flex-end', overflow: 'hidden', background: '#060606' }}>
        {/* Background image */}
        {slides.map((s, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            opacity: i === currentSlide ? 1 : 0,
            transition: 'opacity 1.2s ease',
          }}>
            <Image src={s.image} alt={s.title} fill className="object-cover image-reveal" style={{ opacity: 0.35 }} priority={i === 0} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0A0A0A 20%, rgba(10,10,10,0.5) 60%, transparent)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,10,0.8) 30%, transparent)' }} />
          </div>
        ))}

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 1400, margin: '0 auto', padding: '0 40px 100px', width: '100%' }}>
          <div style={{ maxWidth: 780 }}>
            <div key={`label-${currentSlide}`} className="text-reveal" style={{ marginBottom: 24 }}>
              <span className="section-label">{slide.subtitle}</span>
            </div>

            <h1 key={`title-${currentSlide}`} className="playfair text-reveal" style={{
              fontSize: 'clamp(52px, 8vw, 110px)',
              fontWeight: 400,
              lineHeight: 1.0,
              color: 'white',
              marginBottom: 32,
              whiteSpace: 'pre-line',
            }}>
              {slide.title}
            </h1>

            <p key={`desc-${currentSlide}`} className="text-reveal" style={{
              fontSize: 17,
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.7,
              maxWidth: 520,
              marginBottom: 48,
              fontWeight: 300,
            }}>
              {slide.description}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link href="/client-login" className="btn-primary">
                Get Started
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <button className="btn-outline">View Products</button>
            </div>
          </div>

          {/* Slide indicators */}
          <div style={{ position: 'absolute', bottom: 100, right: 40, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 10, color: i === currentSlide ? 'rgba(255,255,255,0.5)' : 'transparent', fontWeight: 700, letterSpacing: '0.2em' }}>0{i + 1}</span>
                <div style={{
                  height: 1,
                  width: i === currentSlide ? 48 : 16,
                  background: i === currentSlide ? '#C9A84C' : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.4s ease',
                }} />
              </button>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 10 }}>
          <div style={{ width: 1, height: 48, background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3))', animation: 'fadeIn 2s ease infinite alternate' }} />
          <span style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: 700 }}>Scroll</span>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section style={{ padding: '80px 40px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          {stats.map((stat, i) => (
            <div key={i} className="stat-card" style={{ padding: '40px 32px' }}>
              <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.3em', marginBottom: 16, fontWeight: 800, textTransform: 'uppercase' }}>{stat.icon} {stat.label}</div>
              <div className="playfair" style={{ fontSize: 48, fontWeight: 700, color: 'white', lineHeight: 1 }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── QUICK ACTIONS ─── */}
      <section style={{ padding: '0 40px 100px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 2 }}>
          {[
            { title: "Policy Download", icon: "↓", desc: "Access your digital copies instantly" },
            { title: "Instant Renewal", icon: "↻", desc: "Renew your policy in under 2 minutes" },
            { title: "Claims Status", icon: "◎", desc: "Track your settlement in real time" },
            { title: "Expert Help", icon: "⟶", desc: "Talk directly to Sampath Kumar" },
          ].map((action, i) => (
            <div key={i} className="quick-action">
              <div style={{ fontSize: 28, color: '#C9A84C', marginBottom: 20, fontWeight: 300 }}>{action.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 8, letterSpacing: '0.05em' }}>{action.title}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{action.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section id="services" style={{ padding: '100px 40px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }} className="lg:grid-cols-2 grid-cols-1">
          <div>
            <div className="section-label" style={{ marginBottom: 20 }}>What We Offer</div>
            <h2 className="playfair" style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 400, color: 'white', lineHeight: 1.1, marginBottom: 24 }}>
              Everything you<br />need, just a<br /><em>click away.</em>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, fontWeight: 300 }}>
              Comprehensive insurance solutions tailored to protect what you value most — your health, your family, and your future.
            </p>
          </div>
          <div>
            {services.map((s, i) => (
              <div key={i} className="service-item" style={{ padding: '28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.3em', marginBottom: 6, fontWeight: 800, textTransform: 'uppercase' }}>{String(i + 1).padStart(2, '0')}</div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: 'white', marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{s.desc}</div>
                </div>
                <div className="service-arrow" style={{ fontSize: 20, color: 'rgba(255,255,255,0.2)', flexShrink: 0, marginLeft: 24 }}>↗</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PORTALS ─── */}
      <section style={{ padding: '100px 40px', background: '#0D0D0D' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="section-label" style={{ marginBottom: 16 }}>Dedicated Gateways</div>
            <h2 className="playfair" style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 400, color: 'white' }}>Two portals. One mission.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 2 }}>
            {/* Agent Portal */}
            <div className="portal-card" style={{ padding: '56px 48px' }}>
              <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.35em', marginBottom: 32, fontWeight: 800, textTransform: 'uppercase' }}>Sampath Kumar's Hub</div>
              <h3 className="playfair" style={{ fontSize: 42, fontWeight: 700, color: 'white', marginBottom: 20, lineHeight: 1.1 }}>Agent<br />Workspace</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, marginBottom: 40 }}>
                Full administrative access to manage client profiles, family trees, and automated document storage workflows.
              </p>
              <Link href="/login?role=agent" className="btn-primary">
                Enter Hub
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <div style={{ position: 'absolute', bottom: 32, right: 32, opacity: 0.04, fontSize: 120 }}>⊞</div>
            </div>

            {/* Client Portal */}
            <div className="portal-card" style={{ padding: '56px 48px', background: 'linear-gradient(135deg, #141414 0%, #1a1508 100%)' }}>
              <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.35em', marginBottom: 32, fontWeight: 800, textTransform: 'uppercase' }}>Customer Portal</div>
              <h3 className="playfair" style={{ fontSize: 42, fontWeight: 700, color: 'white', marginBottom: 20, lineHeight: 1.1 }}>Client<br />Secure View</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, marginBottom: 40 }}>
                Read-only access for policy holders to safely view profiles and download their personal documents anytime.
              </p>
              <Link href="/client-login" className="btn-primary">
                Client Access
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <div style={{ position: 'absolute', bottom: 32, right: 32, opacity: 0.04, fontSize: 120 }}>⊙</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHY US ─── */}
      <section id="why-us" style={{ padding: '120px 40px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 100, alignItems: 'center' }} className="lg:grid-cols-2 grid-cols-1">
          <div style={{ position: 'relative' }}>
            <div style={{ aspectRatio: '4/5', position: 'relative', overflow: 'hidden' }}>
              <Image src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1000" alt="Our Team" fill className="object-cover" />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.6) 0%, transparent 50%)' }} />
            </div>
            <div style={{
              position: 'absolute', bottom: -24, right: -24,
              background: '#C9A84C', padding: '32px 36px',
            }}>
              <div className="playfair" style={{ fontSize: 52, fontWeight: 700, color: '#0A0A0A', lineHeight: 1 }}>15+</div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(10,10,10,0.6)', marginTop: 6 }}>Years of Service</div>
            </div>
          </div>

          <div>
            <div className="section-label" style={{ marginBottom: 20 }}>Why Maruthi Insure</div>
            <h2 className="playfair" style={{ fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 400, color: 'white', lineHeight: 1.1, marginBottom: 48 }}>
              Heritage of trust,<br /><em>powered by technology.</em>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              {[
                { title: "Personalized Care", desc: "You are not just a policy number. We know our clients by name." },
                { title: "Rapid Settlement", desc: "Our claims process is optimized for speed and transparency." },
                { title: "Digital-First", desc: "Manage everything from your phone. No more paper piles." },
                { title: "Expert Advice", desc: "Decades of experience to guide your family's future." },
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ width: 24, height: 1, background: '#C9A84C', marginBottom: 16 }} />
                  <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'white', marginBottom: 8 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOUNDER ─── */}
      <section id="about" style={{ padding: '120px 40px', background: '#0D0D0D' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 100, alignItems: 'center' }} className="lg:grid-cols-2 grid-cols-1">
            <div>
              <div className="section-label" style={{ marginBottom: 32 }}>A Personal Message</div>
              <blockquote className="playfair" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontStyle: 'italic', fontWeight: 400, color: 'white', lineHeight: 1.3, marginBottom: 40 }}>
                "Your family's peace of mind is my only priority."
              </blockquote>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.9, fontWeight: 300, marginBottom: 48 }}>
                Over 15 years ago, I started Maruthi Insure Care with a simple mission: to be the most trusted name in insurance for my neighborhood. Today, technology helps us scale that promise, but the core value remains — real care for real people.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{
                  width: 56, height: 56,
                  background: '#C9A84C',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: '#0A0A0A',
                }}>SK</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'white', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sampath Kumar R</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 2 }}>Principal Consultant & Founder</div>
                </div>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ aspectRatio: '1/1', borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(201,168,76,0.2)', position: 'relative' }}>
                <Image src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800" alt="Sampath Kumar" fill className="object-cover" />
              </div>
              <div style={{ position: 'absolute', top: '10%', right: '-5%', width: '40%', aspectRatio: '1/1', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '50%', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '20%', right: '5%', width: '20%', aspectRatio: '1/1', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '50%', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: '#060606', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '80px 40px 48px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 64, paddingBottom: 64, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 40 }} className="lg:grid-cols-3 grid-cols-1">
            <div>
              <div className="playfair" style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 16 }}>Maruthi Insure Care</div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.8, maxWidth: 320, marginBottom: 32 }}>
                Dedicated to providing comprehensive insurance solutions with a personal touch. Securing your future, one policy at a time.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                {['◈', '◉', '◎', '◍'].map((icon, i) => (
                  <div key={i} style={{
                    width: 40, height: 40, border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 16,
                    transition: 'all 0.2s',
                  }}>{icon}</div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 28 }}>Services</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {["Health Insurance", "Life Insurance", "Vehicle Insurance", "Wealth Creation"].map(s => (
                  <a key={s} href="#" className="footer-link">{s}</a>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 28 }}>Contact</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>Bengaluru, Karnataka<br />India</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>+91 98XXX XXXXX</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>sampath@maruthiinsure.care</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>© 2026 Maruthi Insure Care. All rights reserved.</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Designed by <a href="https://auxacode.com" style={{ color: '#C9A84C', textDecoration: 'none' }}>Auxacode Technologies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}