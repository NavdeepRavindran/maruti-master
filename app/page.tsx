"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const slides = [
  {
    title: "Protecting what matters most.",
    subtitle: "Welcome to Maruthi Insure Care",
    description: "A promise of security for your family's future. Our digital portal ensures your peace of mind is always reachable.",
    image: "https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&q=80&w=1200",
    gradient: "from-navy/90 via-navy/50 to-transparent",
    accent: "!text-secondary",
  },
  {
    title: "Health is your greatest wealth.",
    subtitle: "Complete Health Protection",
    description: "Stay prepared for the unexpected with comprehensive health coverage for you and your loved ones.",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200",
    gradient: "from-emerald-900/90 via-emerald-900/50 to-transparent",
    accent: "!text-emerald-400",
  },
  {
    title: "Claims made simple & fast.",
    subtitle: "Hassle-Free Support",
    description: "We are with you when it counts. Our digital-first approach ensures quick settlements and constant support.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1200",
    gradient: "from-primary-dark/90 via-primary-dark/50 to-transparent",
    accent: "!text-primary-light",
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      clearInterval(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-primary-dark shadow-xl py-0' : 'bg-transparent py-2'}`}>
        <div className="container mx-auto px-6 h-20 md:h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/20">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span className="block text-lg md:text-xl font-bold tracking-tight text-white font-cormorant leading-none">Maruthi Insure</span>
              <span className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold">Care & Protection</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <a href="#about" className="text-xs font-bold text-white/70 hover:text-white transition-colors uppercase tracking-[0.2em]">Our Story</a>
            <a href="#services" className="text-xs font-bold text-white/70 hover:text-white transition-colors uppercase tracking-[0.2em]">Portals</a>
            <a href="#why-us" className="text-xs font-bold text-white/70 hover:text-white transition-colors uppercase tracking-[0.2em]">Why Choose Us</a>
            <Link href="/login" className="px-8 py-3 bg-white text-primary-dark rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-secondary transition-all shadow-xl shadow-black/20">
              Client Login
            </Link>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-primary-dark border-t border-white/10 px-6 py-4 flex flex-col gap-4 shadow-xl">
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-xs font-bold text-white/70 hover:text-white transition-colors uppercase tracking-[0.2em] py-2">Our Story</a>
            <a href="#services" onClick={() => setMobileMenuOpen(false)} className="text-xs font-bold text-white/70 hover:text-white transition-colors uppercase tracking-[0.2em] py-2">Portals</a>
            <a href="#why-us" onClick={() => setMobileMenuOpen(false)} className="text-xs font-bold text-white/70 hover:text-white transition-colors uppercase tracking-[0.2em] py-2">Why Choose Us</a>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="px-6 py-3 bg-white text-primary-dark rounded-xl text-center text-xs font-bold uppercase tracking-[0.2em] mt-2">
              Client Login
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Slider */}
      <section className="relative pt-24 min-h-[100vh] lg:min-h-[85vh] flex items-center overflow-hidden bg-slate-900">
        {slides.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${index === currentSlide ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-105 translate-x-full'}`}
          >
            <Image 
              src={slide.image} 
              alt={slide.title} 
              fill 
              className="object-cover opacity-60"
              priority={index === 0}
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} sm:bg-gradient-to-r`}></div>
            <div className={`absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent sm:hidden`}></div>
            
            <div className="container mx-auto px-6 relative h-full flex flex-col justify-center py-20 lg:py-24">
              <div className="max-w-2xl space-y-6 md:space-y-8">
                <div className="space-y-3 md:space-y-4">
                  <h2 className={`font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-sm ${slide.accent}`}>{slide.subtitle}</h2>
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-medium !text-white font-cormorant leading-[1.1]">
                    {slide.title.split('.').map((part, i) => (
                      <span key={i} className="block">{part}{i === 0 ? '.' : ''}</span>
                    ))}
                  </h1>
                </div>
                <p className="text-lg md:text-xl text-white/80 leading-relaxed font-light max-w-lg">
                  {slide.description}
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                  <Link href="/login" className="text-center px-6 py-4 md:px-8 md:py-4 bg-secondary text-primary-dark rounded-full font-bold text-xs md:text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-secondary/20">
                    Get Started
                  </Link>
                  <button className="px-6 py-4 md:px-8 md:py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full font-bold text-xs md:text-sm uppercase tracking-widest hover:bg-white/20 transition-all">
                    View Products
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Slider Controls */}
        <div className="absolute bottom-12 left-12 flex gap-4 z-20">
          {slides.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 transition-all duration-500 rounded-full ${i === currentSlide ? 'w-12 bg-secondary' : 'w-6 bg-white/30'}`}
            />
          ))}
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section className="relative z-20 -mt-12 md:-mt-16 pb-16 md:pb-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {[
              { title: "Policy Download", icon: "📁", desc: "Access your digital copies" },
              { title: "Instant Renewal", icon: "🔄", desc: "Renew in 2 minutes" },
              { title: "Claims Status", icon: "🛡️", desc: "Track your settlement" },
              { title: "Expert Help", icon: "📞", desc: "Talk to Sampath Kumar" },
            ].map((action, i) => (
              <div key={i} className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-50 hover:-translate-y-2 transition-all cursor-pointer group">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-section-bg rounded-2xl flex items-center justify-center text-2xl md:text-3xl mb-4 md:mb-6 group-hover:bg-primary-dark group-hover:text-white transition-all">
                  {action.icon}
                </div>
                <h4 className="text-sm md:text-lg font-bold text-primary-dark mb-1 md:mb-2 leading-tight">{action.title}</h4>
                <p className="text-xs md:text-sm text-subtext leading-relaxed">{action.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-us" className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="flex-1 space-y-12">
              <div className="space-y-4">
                <h2 className="text-secondary font-bold uppercase tracking-[0.3em] text-sm">Why Maruthi Insure</h2>
                <h3 className="text-5xl lg:text-6xl font-cormorant text-primary-dark leading-tight">Heritage of trust, <br/>powered by technology.</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-10">
                {[
                  { title: "Personalized Care", desc: "You are not just a policy number. We know our clients by name." },
                  { title: "Rapid Settlement", desc: "Our claims process is optimized for speed and transparency." },
                  { title: "Digital-First", desc: "Manage everything from your phone. No more paper piles." },
                  { title: "Expert Advice", desc: "Decades of experience to guide your family's future." },
                ].map((item, i) => (
                  <div key={i} className="space-y-3">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <h5 className="font-bold text-primary-dark uppercase tracking-widest text-sm">{item.title}</h5>
                    <p className="text-subtext text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 relative w-full aspect-square max-w-lg">
              <div className="absolute inset-0 bg-primary-dark rounded-[5rem] rotate-6 scale-95 opacity-10"></div>
              <div className="relative rounded-[5rem] overflow-hidden shadow-3xl h-full border-8 border-white">
                <Image 
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1000" 
                  alt="Our Team" 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-secondary p-10 rounded-4xl shadow-2xl text-primary-dark">
                <div className="text-5xl font-cormorant font-bold">15+</div>
                <div className="text-xs font-black uppercase tracking-widest mt-1">Years of Service</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Reach Section (Stats) */}
      <section className="py-24 bg-primary-dark text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[150px] opacity-20 -translate-y-1/2"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-4 gap-12 text-center">
            {[
              { label: "Satisfied Clients", value: "2,000+" },
              { label: "Claims Settled", value: "₹15Cr+" },
              { label: "Documents Saved", value: "10,000+" },
              { label: "Cities Reached", value: "25+" },
            ].map((stat, i) => (
              <div key={i} className="space-y-4 border-r border-white/10 last:border-0">
                <div className="text-4xl lg:text-6xl font-cormorant font-bold text-secondary">{stat.value}</div>
                <div className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Portals Section */}
      <section id="services" className="py-32 bg-section-bg">
        <div className="container mx-auto px-6 text-center mb-20">
          <h2 className="text-primary font-bold uppercase tracking-[0.3em] text-sm mb-4">Dedicated Gateways</h2>
          <h3 className="text-5xl font-cormorant text-primary-dark">Everything you need, <br/>just a click away.</h3>
        </div>
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-white p-12 lg:p-20 rounded-[4rem] shadow-xl border border-slate-100 hover:shadow-primary-dark/10 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-12 text-slate-50 group-hover:text-primary/5 transition-colors">
                <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <div className="relative z-10 space-y-8">
                <div className="text-xs font-black uppercase tracking-[0.3em] text-secondary">Sampath Kumar's Hub</div>
                <h4 className="text-4xl font-cormorant font-bold text-primary-dark">Agent Workspace</h4>
                <p className="text-lg text-subtext leading-relaxed">Full administrative access to manage client profiles, family trees, and automated document storage workflows.</p>
                <Link href="/login?role=agent" className="inline-flex items-center gap-4 px-10 py-5 bg-primary-dark text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-primary-dark/20">
                  Enter Hub
                </Link>
              </div>
            </div>
            <div className="bg-white p-12 lg:p-20 rounded-[4rem] shadow-xl border border-slate-100 hover:shadow-primary-dark/10 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-12 text-slate-50 group-hover:text-primary/5 transition-colors">
                <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div className="relative z-10 space-y-8">
                <div className="text-xs font-black uppercase tracking-[0.3em] text-secondary">Customer Portal</div>
                <h4 className="text-4xl font-cormorant font-bold text-primary-dark">Client Secure View</h4>
                <p className="text-lg text-subtext leading-relaxed">Read-only access for policy holders to safely view profiles and download their personal documents anytime.</p>
                <Link href="/login?role=client" className="inline-flex items-center gap-4 px-10 py-5 bg-primary text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-primary-dark transition-all shadow-xl shadow-primary/20">
                  Client Access
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder's Personal Touch */}
      <section id="about" className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 space-y-8 order-2 lg:order-1">
              <div className="text-secondary text-5xl font-cormorant italic">"Your family's peace of mind is my only priority."</div>
              <p className="text-xl text-subtext leading-relaxed font-light italic">
                Over 15 years ago, I started Maruthi Insure Care with a simple mission: to be the most trusted name in insurance for my neighborhood. 
                Today, technology helps us scale that promise, but the core value remains the same—real care for real people.
              </p>
              <div className="pt-6 flex items-center gap-6">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-primary-dark text-3xl font-cormorant font-bold shadow-2xl">SK</div>
                <div>
                  <div className="text-primary-dark font-bold text-xl uppercase tracking-widest">Sampath Kumar R</div>
                  <div className="text-subtext text-xs font-bold uppercase tracking-[0.2em]">Principal Consultant & Founder</div>
                </div>
              </div>
            </div>
            <div className="flex-1 relative w-full aspect-square max-w-md order-1 lg:order-2">
               <div className="absolute inset-0 bg-secondary/10 rounded-full translate-x-10 translate-y-10"></div>
               <div className="relative h-full rounded-full overflow-hidden border-[12px] border-section-bg shadow-3xl">
                  <Image 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800" 
                    alt="Sampath Kumar" 
                    fill 
                    className="object-cover"
                  />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-dark text-white py-24 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-full h-1 bg-secondary"></div>
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-4 gap-16 mb-16 border-b border-white/10 pb-16">
            <div className="col-span-1 lg:col-span-2 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary-dark shadow-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-3xl font-bold tracking-tight font-cormorant">Maruthi Insure Care</span>
              </div>
              <p className="text-lg text-white/60 max-w-md leading-relaxed">
                Dedicated to providing comprehensive insurance solutions with a personal touch. 
                Securing your future, one policy at a time.
              </p>
              <div className="flex gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-secondary hover:text-primary-dark transition-all cursor-pointer">
                    <div className="w-5 h-5 bg-current rounded-sm opacity-40"></div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-8">
              <h5 className="text-xs font-black uppercase tracking-[0.3em] text-secondary">Services</h5>
              <ul className="space-y-4 text-white/60 text-sm font-medium uppercase tracking-widest">
                <li><a href="#" className="hover:text-white transition-colors">Health Insurance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Life Insurance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Vehicle Insurance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Wealth Creation</a></li>
              </ul>
            </div>
            
            <div className="space-y-8">
              <h5 className="text-xs font-black uppercase tracking-[0.3em] text-secondary">Contact</h5>
              <div className="space-y-4 text-white/60 text-sm font-medium">
                <p className="leading-relaxed uppercase tracking-widest">Bengaluru, Karnataka, India</p>
                <p className="uppercase tracking-widest">+91 98XXX XXXXX</p>
                <p className="lowercase tracking-widest">sampath@maruthiinsure.care</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">
            <p>© 2026 Maruthi Insure Care. All rights reserved.</p>
            <p>Designed with care by <a href="https://auxacode.com" className="text-white hover:text-secondary">Auxacode Technologies</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
