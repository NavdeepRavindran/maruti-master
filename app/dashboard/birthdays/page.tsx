"use client";

import { useEffect, useState } from "react";

interface BirthdayItem {
  name: string;
  date_of_birth: string;
  relationship: string;
  phone?: string;
  client_name?: string;
  client_id: string;
  type: string;
}

interface Stats { today: number; thisWeek: number; thisMonth: number; total: number; }

const TEMPLATES = [
  { id: "kanchi_gold", name: "Kanchipuram Gold", emoji: "🪔", tamilWish: "இனிய பிறந்தநாள் வாழ்த்துக்கள்!", tamilSub: "இறைவன் அருளால் உங்கள் வாழ்க்கை மலர்ந்து வளர்க!", bg1: "#3d1a00", bg2: "#7a3500", bg3: "#3d1a00", accent: "#f5c842", accentLight: "#ffe87a", borderGold: "#c8971a", textMain: "#fff8e7", textSub: "rgba(245,200,66,0.82)", previewBg: "linear-gradient(160deg,#3d1a00 0%,#7a3500 50%,#3d1a00 100%)", previewAccent: "#f5c842", kolam: "✦ ◈ ✦" },
  { id: "murugan_red", name: "Murugan Crimson", emoji: "🌺", tamilWish: "பிறந்தநாள் நல் வாழ்த்துக்கள்!", tamilSub: "முருகனின் அருள் என்றும் உங்களுக்கு துணையாக இருக்கட்டும்.", bg1: "#4a0000", bg2: "#8b0000", bg3: "#4a0000", accent: "#ffd700", accentLight: "#ffe97a", borderGold: "#cc8800", textMain: "#fff5f5", textSub: "rgba(255,215,0,0.85)", previewBg: "linear-gradient(160deg,#4a0000 0%,#8b0000 50%,#4a0000 100%)", previewAccent: "#ffd700", kolam: "❋ ✿ ❋" },
  { id: "thirumal_blue", name: "Thirumal Sapphire", emoji: "🦚", tamilWish: "மகிழ்ச்சியான பிறந்த நாள்!", tamilSub: "திருமாலின் ஆசியுடன் உங்கள் ஆண்டு சிறப்பாக அமையட்டும்.", bg1: "#0a1628", bg2: "#1a3a6b", bg3: "#0a1628", accent: "#4fc3f7", accentLight: "#b3e5fc", borderGold: "#0288d1", textMain: "#e8f4fd", textSub: "rgba(79,195,247,0.85)", previewBg: "linear-gradient(160deg,#0a1628 0%,#1a3a6b 50%,#0a1628 100%)", previewAccent: "#4fc3f7", kolam: "☸ ✦ ☸" },
  { id: "ambal_rose", name: "Ambal Rose", emoji: "🌸", tamilWish: "இனிய பிறந்தநாள் வாழ்த்துக்கள்!", tamilSub: "அன்னையின் அருளால் உங்கள் வாழ்வு ஆனந்தமாக இருக்கட்டும்.", bg1: "#3b0020", bg2: "#6b0035", bg3: "#3b0020", accent: "#ff9fc8", accentLight: "#ffcce0", borderGold: "#e07090", textMain: "#fff0f5", textSub: "rgba(255,159,200,0.85)", previewBg: "linear-gradient(160deg,#3b0020 0%,#6b0035 50%,#3b0020 100%)", previewAccent: "#ff9fc8", kolam: "✾ ❀ ✾" },
  { id: "ganesha_green", name: "Ganesha Emerald", emoji: "🐘", tamilWish: "பிறந்தநாள் வாழ்த்துக்கள்!", tamilSub: "விநாயகரின் அருளால் உங்கள் வாழ்வில் வளம் பெருகட்டும்.", bg1: "#0a2e1a", bg2: "#1a5c35", bg3: "#0a2e1a", accent: "#a5d6a7", accentLight: "#c8e6c9", borderGold: "#4caf50", textMain: "#f0fff4", textSub: "rgba(165,214,167,0.85)", previewBg: "linear-gradient(160deg,#0a2e1a 0%,#1a5c35 50%,#0a2e1a 100%)", previewAccent: "#a5d6a7", kolam: "ॐ ✦ ॐ" },
  { id: "shiva_silver", name: "Shiva Silver", emoji: "🔱", tamilWish: "மகிழ்வான பிறந்தநாள்!", tamilSub: "சிவபெருமான் அருளால் உங்கள் வாழ்க்கை வளமாக திகழட்டும்.", bg1: "#1a1a2e", bg2: "#2d2d4e", bg3: "#1a1a2e", accent: "#e0e0e0", accentLight: "#f5f5f5", borderGold: "#9e9e9e", textMain: "#f5f5f5", textSub: "rgba(224,224,224,0.85)", previewBg: "linear-gradient(160deg,#1a1a2e 0%,#2d2d4e 50%,#1a1a2e 100%)", previewAccent: "#e0e0e0", kolam: "☽ ✦ ☾" },
  { id: "surya_orange", name: "Surya Sunrise", emoji: "🌅", tamilWish: "இனிய பிறந்தநாள்!", tamilSub: "சூரியனைப் போல் உங்கள் வாழ்வு என்றும் ஒளிர்ந்து வளரட்டும்.", bg1: "#2c0a00", bg2: "#7a2800", bg3: "#1a0a00", accent: "#ff9800", accentLight: "#ffcc02", borderGold: "#e65100", textMain: "#fff8e1", textSub: "rgba(255,152,0,0.9)", previewBg: "linear-gradient(160deg,#2c0a00 0%,#7a2800 60%,#1a0a00 100%)", previewAccent: "#ff9800", kolam: "☀ ✦ ☀" },
  { id: "lotus_ivory", name: "Lotus Ivory", emoji: "🪷", tamilWish: "பிறந்தநாள் இனிய வாழ்த்துக்கள்!", tamilSub: "தாமரை மலரைப் போல் உங்கள் வாழ்க்கை மலர்ந்திட வாழ்த்துகிறோம்.", bg1: "#2a1a08", bg2: "#4e3010", bg3: "#2a1a08", accent: "#f5deb3", accentLight: "#fffacd", borderGold: "#c8a96e", textMain: "#fffdf7", textSub: "rgba(245,222,179,0.85)", previewBg: "linear-gradient(160deg,#2a1a08 0%,#4e3010 50%,#2a1a08 100%)", previewAccent: "#f5deb3", kolam: "❁ ✦ ❁" },
];

const ENGLISH_MESSAGES = [
  "May the divine blessings shower upon you today and always. Wishing you health, prosperity, and eternal happiness on your special day.",
  "On this auspicious occasion of your birthday, may God's grace illuminate your path and fill your life with endless joy and success.",
  "May this birthday mark the beginning of a magnificent year filled with love, laughter, and all the blessings you truly deserve.",
  "With heartfelt wishes, we pray that the Almighty grants you good health, great wisdom, and boundless happiness in all your endeavours.",
];

const WhatsAppIcon = () => (
  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export default function BirthdaysPage() {
  const [birthdays, setBirthdays] = useState<BirthdayItem[]>([]);
  const [stats, setStats] = useState<Stats>({ today: 0, thisWeek: 0, thisMonth: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("month");
  const [selectedPerson, setSelectedPerson] = useState<BirthdayItem | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [englishMsg, setEnglishMsg] = useState(ENGLISH_MESSAGES[0]);
  const [senderName, setSenderName] = useState("Sampath Kumar");
  const [generating, setGenerating] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => { fetchBirthdays(); }, [range]);

  async function fetchBirthdays() {
    setLoading(true);
    try {
      const res = await fetch(`/api/birthdays?range=${range}`);
      const data = await res.json();
      setBirthdays(data.birthdays || []);
      if (data.stats) setStats(data.stats);
    } catch { } finally { setLoading(false); }
  }

  const getNextBday = (dob: string) => {
    const b = new Date(dob), n = new Date();
    const t = new Date(n.getFullYear(), b.getMonth(), b.getDate());
    const next = t >= n ? t : new Date(n.getFullYear() + 1, b.getMonth(), b.getDate());
    return next.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const getAge = (dob: string) => {
    const b = new Date(dob), n = new Date();
    let a = n.getFullYear() - b.getFullYear();
    if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--;
    return a + 1;
  };

  const daysUntil = (dob: string) => {
    const b = new Date(dob), n = new Date();
    n.setHours(0, 0, 0, 0);
    const t = new Date(n.getFullYear(), b.getMonth(), b.getDate());
    const next = t >= n ? t : new Date(n.getFullYear() + 1, b.getMonth(), b.getDate());
    return Math.ceil((next.getTime() - n.getTime()) / 86400000);
  };

  const handleOpenGreeting = (person: BirthdayItem) => {
    setSelectedPerson(person);
    setSelectedTemplate(TEMPLATES[0]);
    setEnglishMsg(ENGLISH_MESSAGES[0]);
    setShareStatus("idle");
  };

  const generateCardBlob = (): Promise<Blob> => new Promise((resolve, reject) => {
    if (!selectedPerson) return reject("No person");
    const tpl = selectedTemplate;
    const age = getAge(selectedPerson.date_of_birth);
    const W = 1080, H = 1440;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, tpl.bg1); bg.addColorStop(0.5, tpl.bg2); bg.addColorStop(1, tpl.bg3);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    const g1 = ctx.createRadialGradient(W * .15, H * .1, 0, W * .15, H * .1, 320);
    g1.addColorStop(0, tpl.accent + "2a"); g1.addColorStop(1, "transparent");
    ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
    const g2 = ctx.createRadialGradient(W * .85, H * .9, 0, W * .85, H * .9, 260);
    g2.addColorStop(0, tpl.accent + "20"); g2.addColorStop(1, "transparent");
    ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);

    const M = 38;
    ctx.strokeStyle = tpl.accent; ctx.lineWidth = 3;
    ctx.strokeRect(M, M, W - M * 2, H - M * 2);
    ctx.strokeStyle = tpl.accent + "44"; ctx.lineWidth = 1;
    ctx.strokeRect(M + 12, M + 12, W - (M + 12) * 2, H - (M + 12) * 2);

    const drawFlower = (cx: number, cy: number) => {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16, 7, 4, a, 0, Math.PI * 2);
        ctx.fillStyle = tpl.accent; ctx.fill();
      }
      ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fillStyle = tpl.accentLight; ctx.fill();
    };
    const CO = M + 2;
    drawFlower(CO + 16, CO + 16); drawFlower(W - CO - 16, CO + 16);
    drawFlower(CO + 16, H - CO - 16); drawFlower(W - CO - 16, H - CO - 16);

    const bY = M + 28;
    ctx.fillStyle = tpl.accent + "1a"; ctx.fillRect(M + 14, bY, W - (M + 14) * 2, 80);
    ctx.strokeStyle = tpl.accent + "55"; ctx.lineWidth = 1;
    ctx.strokeRect(M + 14, bY, W - (M + 14) * 2, 80);
    ctx.font = "bold 34px serif"; ctx.fillStyle = tpl.accent; ctx.textAlign = "center";
    ctx.fillText(tpl.kolam, W / 2, bY + 52);

    ctx.font = "130px serif"; ctx.textAlign = "center";
    ctx.fillText(tpl.emoji, W / 2, 260);

    ctx.font = "bold 56px 'Noto Sans Tamil', serif";
    ctx.fillStyle = tpl.accent; ctx.textAlign = "center";
    ctx.fillText(tpl.tamilWish, W / 2, 340);

    ctx.font = "34px 'Noto Sans Tamil', serif";
    ctx.fillStyle = tpl.textSub;
    wrapText(ctx, tpl.tamilSub, W / 2, 395, W - 160, 46);

    drawDivider(ctx, W / 2, 470, 400, tpl.accent);

    ctx.font = "italic 36px Georgia, serif";
    ctx.fillStyle = tpl.textSub; ctx.textAlign = "center";
    ctx.fillText("✦  Heartfelt Birthday Wishes to  ✦", W / 2, 540);

    const nameSize = selectedPerson.name.length > 18 ? 74 : 92;
    ctx.font = `bold ${nameSize}px Georgia, serif`;
    ctx.fillStyle = tpl.textMain; ctx.textAlign = "center";
    ctx.shadowColor = tpl.accent; ctx.shadowBlur = 22;
    ctx.fillText(selectedPerson.name, W / 2, 650);
    ctx.shadowBlur = 0;

    const pW = 280, pH = 52, pX = W / 2 - pW / 2, pY = 675;
    ctx.fillStyle = tpl.accent + "22";
    roundRect(ctx, pX, pY, pW, pH, 26); ctx.fill();
    ctx.strokeStyle = tpl.accent + "44"; ctx.lineWidth = 1;
    roundRect(ctx, pX, pY, pW, pH, 26); ctx.stroke();
    ctx.font = "500 28px Georgia, serif"; ctx.fillStyle = tpl.accent; ctx.textAlign = "center";
    ctx.fillText(`Turning ${age} Years of Grace`, W / 2, pY + 33);

    drawDivider(ctx, W / 2, 758, 360, tpl.accent);

    const mX = 80, mY = 788, mW = W - 160, mH = 210;
    ctx.fillStyle = "rgba(255,255,255,0.045)";
    roundRect(ctx, mX, mY, mW, mH, 20); ctx.fill();
    ctx.strokeStyle = tpl.borderGold + "55"; ctx.lineWidth = 1.5;
    roundRect(ctx, mX, mY, mW, mH, 20); ctx.stroke();
    ctx.font = "italic 35px Georgia, serif"; ctx.fillStyle = tpl.textMain; ctx.textAlign = "center";
    wrapText(ctx, `"${englishMsg}"`, W / 2, mY + 58, mW - 80, 50);

    drawDivider(ctx, W / 2, 1040, 340, tpl.accent);

    ctx.font = "bold 44px Georgia, serif"; ctx.fillStyle = tpl.accent; ctx.textAlign = "center";
    ctx.fillText(senderName, W / 2, 1108);
    ctx.font = "400 32px Georgia, serif"; ctx.fillStyle = tpl.textSub;
    ctx.fillText("Maruthi Insure Care", W / 2, 1155);

    const bbY = H - M - 28 - 80;
    ctx.fillStyle = tpl.accent + "1a"; ctx.fillRect(M + 14, bbY, W - (M + 14) * 2, 80);
    ctx.strokeStyle = tpl.accent + "55"; ctx.lineWidth = 1;
    ctx.strokeRect(M + 14, bbY, W - (M + 14) * 2, 80);
    ctx.font = "300 26px Georgia, serif"; ctx.fillStyle = tpl.accent + "aa"; ctx.textAlign = "center";
    ctx.fillText("❁  Heritage of Trust Since 2011  ❁", W / 2, bbY + 50);

    canvas.toBlob(b => b ? resolve(b) : reject("Blob null"), "image/png", 0.96);
  });

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }

  function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
    const words = text.split(" "); let line = "", curY = y;
    for (const w of words) {
      const test = line + w + " ";
      if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line.trim(), x, curY); line = w + " "; curY += lh; }
      else line = test;
    }
    ctx.fillText(line.trim(), x, curY);
  }

  function drawDivider(ctx: CanvasRenderingContext2D, cx: number, y: number, hw: number, color: string) {
    ctx.strokeStyle = color + "44"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx - hw, y); ctx.lineTo(cx - 55, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 55, y); ctx.lineTo(cx + hw, y); ctx.stroke();
    ctx.font = "24px serif"; ctx.fillStyle = color; ctx.textAlign = "center"; ctx.fillText("✦", cx, y + 8);
  }

  const handleShare = async () => {
    if (!selectedPerson) return;
    setGenerating(true); setShareStatus("idle");
    try {
      const blob = await generateCardBlob();
      const file = new File([blob], `birthday-${selectedPerson.name.replace(/\s+/g, "-")}.png`, { type: "image/png" });
      const whatsappText = `${selectedTemplate.tamilWish}\n\n${englishMsg}\n\n— ${senderName}\nMaruthi Insure Care`;
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: whatsappText, title: `Happy Birthday ${selectedPerson.name}!` });
        setShareStatus("success");
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = file.name; a.click();
        URL.revokeObjectURL(url);
        await new Promise(r => setTimeout(r, 700));
        const phone = selectedPerson.phone?.replace(/\D/g, "") || "";
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(whatsappText)}`, "_blank");
        setShareStatus("success");
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") setShareStatus("error");
    } finally { setGenerating(false); }
  };

  const handleDownload = async () => {
    if (!selectedPerson) return;
    setGenerating(true);
    try {
      const blob = await generateCardBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `birthday-${selectedPerson.name.replace(/\s+/g, "-")}.png`; a.click();
      URL.revokeObjectURL(url);
    } finally { setGenerating(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Noto+Sans+Tamil:wght@400;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --blue-950: #03071e;
          --blue-900: #051650;
          --blue-800: #0a2380;
          --blue-700: #1338be;
          --blue-600: #1e50d4;
          --blue-500: #3b82f6;
          --blue-400: #60a5fa;
          --blue-300: #93c5fd;
          --blue-200: #bfdbfe;
          --blue-100: #dbeafe;
          --blue-50:  #eff6ff;
          --accent:   #38bdf8;
          --accent2:  #818cf8;
          --gold:     #fbbf24;
          --surface:  #ffffff;
          --surface-alt: #f0f6ff;
          --border:   rgba(59,130,246,0.12);
          --border-md: rgba(59,130,246,0.22);
          --text:     #03071e;
          --text-sub: #3b5bdb;
          --muted:    #6b8cff;
          --radius-sm: 8px;
          --radius-md: 12px;
          --radius-lg: 18px;
          --radius-xl: 24px;
        }

        .page {
          font-family: 'DM Sans', sans-serif;
          background: var(--blue-50);
          min-height: 100vh;
          padding: 28px 20px;
          color: var(--text);
          position: relative;
          overflow-x: hidden;
        }
        .page::before {
          content: '';
          position: fixed;
          top: -120px; right: -120px;
          width: 480px; height: 480px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .page::after {
          content: '';
          position: fixed;
          bottom: -100px; left: -80px;
          width: 360px; height: 360px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(129,140,248,0.14) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        @media (min-width: 768px) { .page { padding: 36px 40px; } }
        @media (min-width: 1024px) { .page { padding: 32px 36px; } }

        /* ── Header ── */
        .hdr { margin-bottom: 32px; position: relative; z-index: 1; }
        .hdr-eyebrow {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--blue-100); border: 1px solid var(--blue-200);
          border-radius: 999px; padding: 4px 12px;
          font-size: 10px; font-weight: 700; letter-spacing: .14em;
          text-transform: uppercase; color: var(--blue-700); margin-bottom: 10px;
        }
        .hdr-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--blue-500); animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
        .hdr-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 6vw, 54px);
          font-weight: 900; line-height: 1.05;
          color: var(--blue-900); letter-spacing: -1px; margin-bottom: 6px;
        }
        .hdr-title em { color: var(--blue-600); font-style: italic; }
        .hdr-sub { font-size: 13px; color: var(--muted); font-weight: 500; }

        /* ── Stats ── */
        .stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px; margin-bottom: 24px; position: relative; z-index: 1;
        }
        @media (min-width: 640px) { .stats { grid-template-columns: repeat(4, 1fr); } }

        .stat {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px 16px;
          position: relative; overflow: hidden;
          transition: transform .2s, box-shadow .2s;
          box-shadow: 0 2px 12px rgba(59,130,246,.06);
        }
        .stat::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--blue-500), var(--accent2));
          opacity: 0; transition: opacity .2s;
        }
        .stat:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(59,130,246,.14); }
        .stat:hover::before { opacity: 1; }
        .stat.hl {
          background: linear-gradient(135deg, var(--blue-700), var(--blue-600));
          border-color: transparent;
          box-shadow: 0 8px 28px rgba(19,56,190,.35);
        }
        .stat.hl::before { display: none; }
        .stat-icon { font-size: 22px; margin-bottom: 12px; }
        .stat-val { font-size: clamp(26px, 5vw, 38px); font-weight: 900; color: var(--blue-900); line-height: 1; }
        .stat.hl .stat-val { color: #fff; }
        .stat-lbl { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .18em; color: var(--muted); margin-top: 6px; }
        .stat.hl .stat-lbl { color: rgba(255,255,255,.6); }

        /* ── Filter bar ── */
        .fbar {
          display: flex; gap: 3px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 4px; margin-bottom: 16px;
          width: fit-content;
          box-shadow: 0 2px 8px rgba(59,130,246,.06);
          position: relative; z-index: 1;
        }
        .fbtn {
          padding: 7px 22px; border-radius: 9px; border: none; cursor: pointer;
          font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .1em;
          background: transparent; color: var(--muted); font-family: inherit; transition: all .18s;
        }
        .fbtn.on {
          background: linear-gradient(135deg, var(--blue-700), var(--blue-600));
          color: #fff;
          box-shadow: 0 3px 10px rgba(19,56,190,.3);
        }

        /* ── List card ── */
        .lcard {
          background: var(--surface);
          border-radius: var(--radius-xl);
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(59,130,246,.08);
          position: relative; z-index: 1;
        }
        .lhdr {
          padding: 14px 22px;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          background: linear-gradient(135deg, var(--blue-50), var(--surface));
        }
        .lhdr-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .16em; color: var(--blue-800); }
        .live-badge { display: flex; align-items: center; gap: 6px; }
        .live-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; animation: pulse 2s infinite; }
        .live-txt { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .16em; color: var(--muted); }

        /* ── Row ── */
        .row {
          padding: 15px 22px; display: flex; align-items: center; gap: 14px;
          border-bottom: 1px solid var(--border);
          transition: background .12s; cursor: pointer;
        }
        .row:last-child { border-bottom: none; }
        .row:hover { background: var(--blue-50); }

        .dbadge {
          min-width: 52px; height: 60px; border-radius: var(--radius-md);
          background: var(--blue-50);
          border: 1px solid var(--border-md);
          display: flex; flex-direction: column; align-items: center;
          overflow: hidden; flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(59,130,246,.1);
        }
        .dbadge-mon {
          width: 100%;
          background: linear-gradient(135deg, var(--blue-700), var(--blue-600));
          color: #fff;
          font-size: 8px; font-weight: 800; text-transform: uppercase;
          letter-spacing: .08em; text-align: center; padding: 4px 0;
        }
        .dbadge-day {
          flex: 1; display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-weight: 900; color: var(--blue-800);
        }

        .rinfo { flex: 1; min-width: 0; }
        .rname { font-size: 15px; font-weight: 700; color: var(--blue-900); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
        .rmeta { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); margin-bottom: 3px; }
        .rcnt { font-size: 11px; font-weight: 700; color: var(--blue-600); }
        .rcnt.today { color: #f59e0b; animation: pulse 1.2s infinite; }

        .wbtn {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 16px; border-radius: var(--radius-md);
          background: #25d366; color: #fff; border: none; cursor: pointer;
          font-size: 11px; font-weight: 800; white-space: nowrap;
          font-family: inherit; flex-shrink: 0;
          box-shadow: 0 3px 12px rgba(37,211,102,.3);
          transition: all .15s;
        }
        .wbtn:hover { background: #1db954; transform: scale(1.03); }
        .wbtn:active { transform: scale(.97); }

        .empty { padding: 64px 20px; text-align: center; }
        .spin {
          width: 30px; height: 30px;
          border: 3px solid var(--border-md);
          border-top-color: var(--blue-600);
          border-radius: 50%;
          animation: spin .7s linear infinite; margin: 0 auto 14px;
        }
        @keyframes spin { to { transform: rotate(360deg) } }

        /* ── Modal ── */
        .overlay {
          position: fixed; inset: 0; z-index: 300;
          display: flex; align-items: flex-end;
        }
        @media (min-width: 768px) { .overlay { align-items: center; justify-content: center; padding: 20px; } }

        .obg {
          position: absolute; inset: 0;
          background: rgba(3,7,30,.78);
          backdrop-filter: blur(20px);
        }
        .msheet {
          position: relative; z-index: 10;
          background: var(--surface);
          width: 100%; border-radius: var(--radius-xl) var(--radius-xl) 0 0;
          max-height: 96vh; overflow-y: auto;
          display: flex; flex-direction: column;
          animation: slideUp .3s cubic-bezier(.34,1.56,.64,1);
        }
        @media (min-width: 768px) {
          .msheet { max-width: 980px; border-radius: var(--radius-xl); max-height: 90vh; flex-direction: row; overflow: hidden; }
        }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0 } to { transform: none; opacity: 1 } }

        .mhandle { width: 40px; height: 4px; border-radius: 2px; background: var(--border-md); margin: 14px auto 0; flex-shrink: 0; }
        @media (min-width: 768px) { .mhandle { display: none; } }

        /* Modal left */
        .mleft {
          padding: 22px 20px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0; display: flex; flex-direction: column; gap: 14px;
        }
        @media (min-width: 768px) {
          .mleft {
            width: 360px; border-bottom: none;
            border-right: 1px solid var(--border);
            background: var(--blue-50);
            border-radius: var(--radius-xl) 0 0 var(--radius-xl);
            overflow-y: auto; padding: 28px 24px;
          }
        }

        .mtitle { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 900; color: var(--blue-900); }
        .mtitle em { color: var(--blue-600); font-style: italic; }

        .mperson {
          display: flex; align-items: center; gap: 12px;
          padding: 12px; background: var(--surface);
          border-radius: var(--radius-md); border: 1px solid var(--border-md);
          box-shadow: 0 2px 8px rgba(59,130,246,.07);
        }
        .mav {
          width: 44px; height: 44px; border-radius: var(--radius-md);
          background: linear-gradient(135deg, var(--blue-700), var(--blue-500));
          display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;
        }
        .mpname { font-size: 14px; font-weight: 800; color: var(--blue-900); margin-bottom: 2px; }
        .mpmeta { font-size: 11px; color: var(--muted); font-weight: 500; }

        .flbl { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .18em; color: var(--muted); display: block; }

        .tamil-chip { border-radius: var(--radius-md); padding: 12px 14px; border: 1px solid; }
        .tamil-wish { font-family: 'Noto Sans Tamil', sans-serif; font-size: 14px; font-weight: 700; line-height: 1.4; margin-bottom: 3px; }
        .tamil-sub { font-family: 'Noto Sans Tamil', sans-serif; font-size: 10px; opacity: .8; line-height: 1.5; }

        .tscroll { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        @media (max-width: 767px) {
          .tscroll { display: flex; overflow-x: auto; gap: 8px; padding-bottom: 4px; scrollbar-width: none; }
          .tscroll::-webkit-scrollbar { display: none; }
        }

        .tbtn {
          padding: 10px 8px; border-radius: var(--radius-md);
          border: 1.5px solid var(--border);
          background: var(--surface); cursor: pointer;
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          font-family: inherit; transition: all .12s; min-width: 80px;
        }
        @media (min-width: 768px) { .tbtn { min-width: unset; } }
        .tbtn.on { border-color: var(--blue-600); box-shadow: 0 0 0 3px rgba(59,130,246,.15); }
        .tswatch { width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0; }
        .tname { font-size: 8px; font-weight: 700; color: var(--blue-900); text-align: center; line-height: 1.3; }

        .mselect, .mtarea, .minput {
          width: 100%; padding: 10px 12px;
          border-radius: var(--radius-md);
          border: 1.5px solid var(--border-md);
          font-size: 12px; font-family: inherit;
          color: var(--text); background: var(--surface);
          outline: none; appearance: none;
          transition: border-color .15s;
        }
        .mselect:focus, .mtarea:focus, .minput:focus { border-color: var(--blue-500); box-shadow: 0 0 0 3px rgba(59,130,246,.12); }
        .mtarea { min-height: 76px; resize: vertical; }

        .btn-share {
          width: 100%; padding: 14px; border-radius: var(--radius-md);
          border: none; background: #25d366; color: #fff;
          font-size: 13px; font-weight: 800; font-family: inherit; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 5px 18px rgba(37,211,102,.3);
          transition: all .15s;
        }
        .btn-share:hover:not(:disabled) { background: #1db954; transform: translateY(-1px); }
        .btn-share:disabled { opacity: .6; cursor: not-allowed; }

        .btn-dl {
          width: 100%; padding: 11px; border-radius: var(--radius-md);
          border: 1.5px solid var(--border-md);
          background: var(--surface); color: var(--blue-800);
          font-size: 12px; font-weight: 800; font-family: inherit; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: background .12s;
        }
        .btn-dl:hover:not(:disabled) { background: var(--blue-50); }
        .btn-dl:disabled { opacity: .6; cursor: not-allowed; }

        .note { font-size: 10px; color: var(--muted); text-align: center; line-height: 1.65; font-weight: 500; }
        .note b { color: var(--blue-600); }
        .st-ok { font-size: 12px; font-weight: 700; color: #16a34a; text-align: center; margin-top: 4px; }
        .st-err { font-size: 12px; font-weight: 700; color: #dc2626; text-align: center; margin-top: 4px; }

        /* Modal right */
        .mright {
          background: linear-gradient(160deg, var(--blue-950) 0%, var(--blue-900) 100%);
          padding: 24px 20px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; flex: 1;
          border-radius: 0 var(--radius-xl) var(--radius-xl) 0;
          position: relative; overflow: hidden;
        }
        .mright::before {
          content: ''; position: absolute;
          top: -80px; right: -80px; width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,.25) 0%, transparent 70%);
        }
        .mright::after {
          content: ''; position: absolute;
          bottom: -60px; left: -60px; width: 240px; height: 240px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(129,140,248,.18) 0%, transparent 70%);
        }
        .pvlbl { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .2em; color: rgba(255,255,255,.2); margin-bottom: 16px; position: relative; z-index: 1; }

        .cpreview {
          width: 100%; max-width: 258px; aspect-ratio: 3/4;
          border-radius: 20px; position: relative; overflow: hidden;
          box-shadow: 0 28px 64px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.08);
          display: flex; flex-direction: column;
          position: relative; z-index: 1;
        }

        .cp-corner { position: absolute; width: 20px; height: 20px; z-index: 3; }
        .cp-corner.tl { top: 7px; left: 7px; border-top: 1.5px solid; border-left: 1.5px solid; border-radius: 3px 0 0 0; }
        .cp-corner.tr { top: 7px; right: 7px; border-top: 1.5px solid; border-right: 1.5px solid; border-radius: 0 3px 0 0; }
        .cp-corner.bl { bottom: 7px; left: 7px; border-bottom: 1.5px solid; border-left: 1.5px solid; border-radius: 0 0 0 3px; }
        .cp-corner.br { bottom: 7px; right: 7px; border-bottom: 1.5px solid; border-right: 1.5px solid; border-radius: 0 0 3px 0; }

        .cpinner {
          position: absolute; inset: 10px;
          display: flex; flex-direction: column;
          align-items: center; text-align: center;
          padding: 12px 10px; z-index: 2;
        }
        .cp-emoji { font-size: 30px; margin-bottom: 4px; animation: float 3s ease-in-out infinite; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        .cp-topband { width: calc(100% + 20px); margin: -12px -10px 7px; padding: 5px; text-align: center; }
        .cp-kolam { font-size: 9px; letter-spacing: .1em; opacity: .7; }
        .cp-tamil { font-family: 'Noto Sans Tamil', sans-serif; font-size: 10px; font-weight: 700; line-height: 1.4; margin-bottom: 2px; }
        .cp-tamilsub { font-family: 'Noto Sans Tamil', sans-serif; font-size: 8px; opacity: .75; line-height: 1.4; margin-bottom: 6px; }
        .cp-div { height: 0.5px; width: 50%; opacity: .3; margin: 0 auto 5px; }
        .cp-to { font-size: 8px; font-style: italic; opacity: .65; margin-bottom: 2px; }
        .cp-name { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; line-height: 1.1; margin-bottom: 1px; }
        .cp-age { font-size: 8px; letter-spacing: .12em; text-transform: uppercase; opacity: .5; margin-bottom: 5px; }
        .cp-msg { font-size: 8px; font-style: italic; opacity: .8; line-height: 1.5; flex: 1; display: flex; align-items: center; }
        .cp-footer { margin-top: auto; padding-top: 6px; border-top: 0.5px solid rgba(255,255,255,.1); width: 100%; }
        .cp-sender { font-size: 10px; font-weight: 700; letter-spacing: .03em; }
        .cp-co { font-size: 8px; opacity: .45; margin-top: 1px; }

        .dots { display: flex; gap: 6px; margin-top: 16px; position: relative; z-index: 1; }
        .dot { height: 5px; border-radius: 3px; border: none; cursor: pointer; transition: all .2s; padding: 0; }

        .xbtn {
          position: absolute; top: 14px; right: 14px; z-index: 50;
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--blue-50); border: 1px solid var(--border-md);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-size: 14px; color: var(--muted); transition: background .12s; line-height: 1;
        }
        .xbtn:hover { background: var(--blue-100); }
      `}</style>

      <div className="page">
        {/* Header */}
        <header className="hdr">
          <div className="hdr-eyebrow">
            <span className="hdr-eyebrow-dot" />
            Maruthi Insure Care
          </div>
          <h1 className="hdr-title">Birthday <em>Outreach</em></h1>
          <p className="hdr-sub">🪔 Tamil & English bilingual greetings · Traditional temple themes</p>
        </header>

        {/* Stats */}
        <div className="stats">
          {[
            { label: "Today", value: stats.today, icon: "📆", hl: false },
            { label: "This Week", value: stats.thisWeek, icon: "✨", hl: true },
            { label: "This Month", value: stats.thisMonth, icon: "🍰", hl: false },
            { label: "All People", value: stats.total, icon: "🎈", hl: false },
          ].map(s => (
            <div key={s.label} className={`stat${s.hl ? " hl" : ""}`}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-val">{loading ? "—" : s.value}</div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="fbar">
          {([["week", "Week"], ["month", "Month"], ["all", "All"]] as const).map(([id, label]) => (
            <button key={id} className={`fbtn${range === id ? " on" : ""}`} onClick={() => setRange(id)}>{label}</button>
          ))}
        </div>

        {/* List */}
        <div className="lcard">
          <div className="lhdr">
            <span className="lhdr-title">Celebration List</span>
            <div className="live-badge">
              <div className="live-dot" />
              <span className="live-txt">Live</span>
            </div>
          </div>

          {loading ? (
            <div className="empty">
              <div className="spin" />
              <p style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600 }}>Syncing calendars…</p>
            </div>
          ) : birthdays.length === 0 ? (
            <div className="empty">
              <div style={{ fontSize: 36 }}>🎂</div>
              <p style={{ color: "var(--muted)", fontWeight: 700, marginTop: 10, fontSize: 14 }}>No birthdays found</p>
            </div>
          ) : birthdays.map((p, i) => {
            const days = daysUntil(p.date_of_birth);
            const parts = getNextBday(p.date_of_birth).split(" ");
            return (
              <div key={p.name + i} className="row" onClick={() => handleOpenGreeting(p)}>
                <div className="dbadge">
                  <div className="dbadge-mon">{parts[1]}</div>
                  <div className="dbadge-day">{parts[0]}</div>
                </div>
                <div className="rinfo">
                  <div className="rname">{p.name}</div>
                  <div className="rmeta">{p.relationship} · Age {getAge(p.date_of_birth)}</div>
                  <div className={`rcnt${days === 0 ? " today" : ""}`}>
                    {days === 0 ? "🎂 TODAY!" : days === 1 ? "Tomorrow" : `In ${days} days`}
                  </div>
                </div>
                <button className="wbtn" onClick={e => { e.stopPropagation(); handleOpenGreeting(p); }}>
                  <WhatsAppIcon /> Wish
                </button>
              </div>
            );
          })}
        </div>

        {/* Modal */}
        {selectedPerson && (
          <div className="overlay">
            <div className="obg" onClick={() => setSelectedPerson(null)} />
            <div className="msheet">
              <button className="xbtn" onClick={() => setSelectedPerson(null)}>✕</button>
              <div className="mhandle" />

              {/* Left */}
              <div className="mleft">
                <h3 className="mtitle">Greeting <em>Designer</em></h3>

                <div className="mperson">
                  <div className="mav">🎂</div>
                  <div>
                    <div className="mpname">{selectedPerson.name}</div>
                    <div className="mpmeta">{selectedPerson.relationship} · Turning {getAge(selectedPerson.date_of_birth)}</div>
                  </div>
                </div>

                <div
                  className="tamil-chip"
                  style={{ background: `linear-gradient(135deg,${selectedTemplate.bg1},${selectedTemplate.bg2})`, borderColor: selectedTemplate.accent + "44" }}
                >
                  <div className="tamil-wish" style={{ color: selectedTemplate.accent }}>{selectedTemplate.tamilWish}</div>
                  <div className="tamil-sub" style={{ color: selectedTemplate.textSub }}>{selectedTemplate.tamilSub}</div>
                </div>

                <label className="flbl">Temple Theme</label>
                <div className="tscroll">
                  {TEMPLATES.map(t => (
                    <button key={t.id} className={`tbtn${selectedTemplate.id === t.id ? " on" : ""}`} onClick={() => setSelectedTemplate(t)}>
                      <div className="tswatch" style={{ background: `linear-gradient(135deg,${t.bg1},${t.bg2})`, border: `1.5px solid ${t.accent}44` }} />
                      <span className="tname">{t.emoji} {t.name}</span>
                    </button>
                  ))}
                </div>

                <label className="flbl">English Blessing</label>
                <select className="mselect" value={englishMsg} onChange={e => setEnglishMsg(e.target.value)}>
                  {ENGLISH_MESSAGES.map((m, i) => (
                    <option key={i} value={m}>{m.slice(0, 58)}…</option>
                  ))}
                </select>
                <textarea className="mtarea" value={englishMsg} onChange={e => setEnglishMsg(e.target.value)} rows={3} style={{ marginTop: 4 }} />

                <label className="flbl">Your Name</label>
                <input className="minput" value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="Sender name…" />

                <button className="btn-share" onClick={handleShare} disabled={generating}>
                  {generating ? (
                    <><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} /> Generating…</>
                  ) : (
                    <><WhatsAppIcon /> Share image via WhatsApp</>
                  )}
                </button>

                <button className="btn-dl" onClick={handleDownload} disabled={generating}>
                  ⬇ Download card (PNG)
                </button>

                {shareStatus === "success" && <p className="st-ok">✓ Shared successfully!</p>}
                {shareStatus === "error" && <p className="st-err">⚠ Sharing failed. Download and attach manually.</p>}

                <p className="note">
                  <b>Mobile:</b> opens native share sheet → pick WhatsApp.<br />
                  <b>Desktop:</b> image downloads + WhatsApp opens with pre-filled message.
                </p>
              </div>

              {/* Right: preview */}
              <div className="mright">
                <p className="pvlbl">Live Preview</p>
                <div className="cpreview" style={{ background: selectedTemplate.previewBg }}>
                  {(["tl", "tr", "bl", "br"] as const).map(pos => (
                    <div key={pos} className={`cp-corner ${pos}`} style={{ borderColor: selectedTemplate.previewAccent + "55" }} />
                  ))}
                  <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: selectedTemplate.previewAccent, opacity: .1, filter: "blur(28px)" }} />
                  <div style={{ position: "absolute", bottom: -20, left: -20, width: 90, height: 90, borderRadius: "50%", background: selectedTemplate.previewAccent, opacity: .08, filter: "blur(22px)" }} />

                  <div className="cpinner" style={{ color: selectedTemplate.textMain }}>
                    <div className="cp-topband" style={{ background: selectedTemplate.accent + "18", borderBottom: `1px solid ${selectedTemplate.accent}30` }}>
                      <div className="cp-kolam" style={{ color: selectedTemplate.previewAccent }}>{selectedTemplate.kolam}</div>
                    </div>
                    <div className="cp-emoji">{selectedTemplate.emoji}</div>
                    <div className="cp-tamil" style={{ color: selectedTemplate.previewAccent }}>{selectedTemplate.tamilWish}</div>
                    <div className="cp-tamilsub" style={{ color: selectedTemplate.textSub }}>{selectedTemplate.tamilSub}</div>
                    <div className="cp-div" style={{ background: selectedTemplate.previewAccent }} />
                    <div className="cp-to" style={{ color: selectedTemplate.textSub }}>✦ Heartfelt wishes to ✦</div>
                    <div className="cp-name">{selectedPerson.name}</div>
                    <div className="cp-age" style={{ color: selectedTemplate.textSub }}>Turning {getAge(selectedPerson.date_of_birth)} Years</div>
                    <div className="cp-div" style={{ background: selectedTemplate.previewAccent }} />
                    <p className="cp-msg" style={{ color: selectedTemplate.textSub }}>
                      "{englishMsg.length > 90 ? englishMsg.slice(0, 90) + "…" : englishMsg}"
                    </p>
                    <div className="cp-footer">
                      <div className="cp-sender" style={{ color: selectedTemplate.previewAccent }}>{senderName || "Your Name"}</div>
                      <div className="cp-co" style={{ color: selectedTemplate.textSub }}>Maruthi Insure Care</div>
                    </div>
                  </div>
                </div>

                <div className="dots">
                  {TEMPLATES.map(t => (
                    <button key={t.id} className="dot" onClick={() => setSelectedTemplate(t)} title={t.name}
                      style={{ width: selectedTemplate.id === t.id ? 18 : 5, background: selectedTemplate.id === t.id ? t.previewAccent : "rgba(255,255,255,.2)" }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}