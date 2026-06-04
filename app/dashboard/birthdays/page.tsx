"use client";

import { useEffect, useState } from "react";

interface CelebrationItem {
  name: string;
  date_of_birth: string;
  relationship: string;
  phone?: string;
  client_name?: string;
  client_id: string;
  type: string;
}

interface Stats { today: number; thisWeek: number; thisMonth: number; total: number; }

// ─────────────────────────────────────────────
// 20 BIRTHDAY TEMPLATES
// ─────────────────────────────────────────────
const BIRTHDAY_TEMPLATES = [
  // ── HINDU (8) ──
  { id: "kanchi_gold",    faith: "hindu",    name: "Kanchipuram Gold",   emoji: "🪔", kolam: "✦ ◈ ✦",
    tamilWish: "இனிய பிறந்தநாள் வாழ்த்துக்கள்!",
    tamilSub:  "இறைவன் அருளால் உங்கள் வாழ்க்கை மலர்ந்து வளர்க!",
    bg1:"#3d1a00",bg2:"#7a3500",bg3:"#3d1a00", accent:"#f5c842",accentLight:"#ffe87a",borderGold:"#c8971a",textMain:"#fff8e7",textSub:"rgba(245,200,66,0.82)",previewBg:"linear-gradient(160deg,#3d1a00 0%,#7a3500 50%,#3d1a00 100%)",previewAccent:"#f5c842" },
  { id: "murugan_red",    faith: "hindu",    name: "Murugan Crimson",    emoji: "🌺", kolam: "❋ ✿ ❋",
    tamilWish: "பிறந்தநாள் நல் வாழ்த்துக்கள்!",
    tamilSub:  "முருகனின் அருள் என்றும் உங்களுக்கு துணையாக இருக்கட்டும்.",
    bg1:"#4a0000",bg2:"#8b0000",bg3:"#4a0000", accent:"#ffd700",accentLight:"#ffe97a",borderGold:"#cc8800",textMain:"#fff5f5",textSub:"rgba(255,215,0,0.85)",previewBg:"linear-gradient(160deg,#4a0000 0%,#8b0000 50%,#4a0000 100%)",previewAccent:"#ffd700" },
  { id: "thirumal_blue",  faith: "hindu",    name: "Thirumal Sapphire",  emoji: "🦚", kolam: "☸ ✦ ☸",
    tamilWish: "மகிழ்ச்சியான பிறந்த நாள்!",
    tamilSub:  "திருமாலின் ஆசியுடன் உங்கள் ஆண்டு சிறப்பாக அமையட்டும்.",
    bg1:"#0a1628",bg2:"#1a3a6b",bg3:"#0a1628", accent:"#4fc3f7",accentLight:"#b3e5fc",borderGold:"#0288d1",textMain:"#e8f4fd",textSub:"rgba(79,195,247,0.85)",previewBg:"linear-gradient(160deg,#0a1628 0%,#1a3a6b 50%,#0a1628 100%)",previewAccent:"#4fc3f7" },
  { id: "ambal_rose",     faith: "hindu",    name: "Ambal Rose",         emoji: "🌸", kolam: "✾ ❀ ✾",
    tamilWish: "இனிய பிறந்தநாள் வாழ்த்துக்கள்!",
    tamilSub:  "அன்னையின் அருளால் உங்கள் வாழ்வு ஆனந்தமாக இருக்கட்டும்.",
    bg1:"#3b0020",bg2:"#6b0035",bg3:"#3b0020", accent:"#ff9fc8",accentLight:"#ffcce0",borderGold:"#e07090",textMain:"#fff0f5",textSub:"rgba(255,159,200,0.85)",previewBg:"linear-gradient(160deg,#3b0020 0%,#6b0035 50%,#3b0020 100%)",previewAccent:"#ff9fc8" },
  { id: "ganesha_green",  faith: "hindu",    name: "Ganesha Emerald",    emoji: "🐘", kolam: "ॐ ✦ ॐ",
    tamilWish: "பிறந்தநாள் வாழ்த்துக்கள்!",
    tamilSub:  "விநாயகரின் அருளால் உங்கள் வாழ்வில் வளம் பெருகட்டும்.",
    bg1:"#0a2e1a",bg2:"#1a5c35",bg3:"#0a2e1a", accent:"#a5d6a7",accentLight:"#c8e6c9",borderGold:"#4caf50",textMain:"#f0fff4",textSub:"rgba(165,214,167,0.85)",previewBg:"linear-gradient(160deg,#0a2e1a 0%,#1a5c35 50%,#0a2e1a 100%)",previewAccent:"#a5d6a7" },
  { id: "shiva_silver",   faith: "hindu",    name: "Shiva Silver",       emoji: "🔱", kolam: "☽ ✦ ☾",
    tamilWish: "மகிழ்வான பிறந்தநாள்!",
    tamilSub:  "சிவபெருமான் அருளால் உங்கள் வாழ்க்கை வளமாக திகழட்டும்.",
    bg1:"#1a1a2e",bg2:"#2d2d4e",bg3:"#1a1a2e", accent:"#e0e0e0",accentLight:"#f5f5f5",borderGold:"#9e9e9e",textMain:"#f5f5f5",textSub:"rgba(224,224,224,0.85)",previewBg:"linear-gradient(160deg,#1a1a2e 0%,#2d2d4e 50%,#1a1a2e 100%)",previewAccent:"#e0e0e0" },
  { id: "surya_orange",   faith: "hindu",    name: "Surya Sunrise",      emoji: "🌅", kolam: "☀ ✦ ☀",
    tamilWish: "இனிய பிறந்தநாள்!",
    tamilSub:  "சூரியனைப் போல் உங்கள் வாழ்வு என்றும் ஒளிர்ந்து வளரட்டும்.",
    bg1:"#2c0a00",bg2:"#7a2800",bg3:"#1a0a00", accent:"#ff9800",accentLight:"#ffcc02",borderGold:"#e65100",textMain:"#fff8e1",textSub:"rgba(255,152,0,0.9)",previewBg:"linear-gradient(160deg,#2c0a00 0%,#7a2800 60%,#1a0a00 100%)",previewAccent:"#ff9800" },
  { id: "lotus_ivory",    faith: "hindu",    name: "Lotus Ivory",        emoji: "🪷", kolam: "❁ ✦ ❁",
    tamilWish: "பிறந்தநாள் இனிய வாழ்த்துக்கள்!",
    tamilSub:  "தாமரை மலரைப் போல் உங்கள் வாழ்க்கை மலர்ந்திட வாழ்த்துகிறோம்.",
    bg1:"#2a1a08",bg2:"#4e3010",bg3:"#2a1a08", accent:"#f5deb3",accentLight:"#fffacd",borderGold:"#c8a96e",textMain:"#fffdf7",textSub:"rgba(245,222,179,0.85)",previewBg:"linear-gradient(160deg,#2a1a08 0%,#4e3010 50%,#2a1a08 100%)",previewAccent:"#f5deb3" },
  // ── MUSLIM (6) ──
  { id: "crescent_teal",  faith: "muslim",   name: "Crescent Teal",      emoji: "🌙", kolam: "☪ ✦ ☪",
    tamilWish: "இனிய பிறந்தநாள் வாழ்த்துக்கள்!",
    tamilSub:  "அல்லாஹ்வின் அருளால் உங்கள் வாழ்க்கை செழிக்கட்டும்.",
    bg1:"#003333",bg2:"#005555",bg3:"#001a1a", accent:"#4dd0c4",accentLight:"#b2dfdb",borderGold:"#00897b",textMain:"#e0f7f4",textSub:"rgba(77,208,196,0.85)",previewBg:"linear-gradient(160deg,#003333 0%,#005555 50%,#001a1a 100%)",previewAccent:"#4dd0c4" },
  { id: "mosque_emerald", faith: "muslim",   name: "Mosque Emerald",     emoji: "🕌", kolam: "✦ ☪ ✦",
    tamilWish: "மகிழ்ச்சியான பிறந்தநாள்!",
    tamilSub:  "இறைவன் உங்களுக்கு நீண்ட ஆயுளும் நலமும் அருள்வாராக.",
    bg1:"#001a00",bg2:"#004d00",bg3:"#001a00", accent:"#80cbc4",accentLight:"#b2dfdb",borderGold:"#26a69a",textMain:"#e8f5e9",textSub:"rgba(128,203,196,0.85)",previewBg:"linear-gradient(160deg,#001a00 0%,#004d00 50%,#001a00 100%)",previewAccent:"#80cbc4" },
  { id: "star_gold",      faith: "muslim",   name: "Star & Gold",        emoji: "⭐", kolam: "✦ ⭐ ✦",
    tamilWish: "இனிய பிறந்தநாள் வாழ்த்துக்கள்!",
    tamilSub:  "அல்லாஹ்வின் ரஹ்மத்து உங்களுக்கு என்றும் துணையாக இருக்கட்டும்.",
    bg1:"#1a1200",bg2:"#3d2b00",bg3:"#1a1200", accent:"#ffd54f",accentLight:"#ffecb3",borderGold:"#ffb300",textMain:"#fff8e1",textSub:"rgba(255,213,79,0.85)",previewBg:"linear-gradient(160deg,#1a1200 0%,#3d2b00 50%,#1a1200 100%)",previewAccent:"#ffd54f" },
  { id: "sabr_blue",      faith: "muslim",   name: "Sabr Blue",          emoji: "📿", kolam: "☪ ◈ ☪",
    tamilWish: "பிறந்தநாள் வாழ்த்துக்கள்!",
    tamilSub:  "அல்லாஹ் உங்களுக்கு சுகம், செழிப்பு மற்றும் பாதுகாப்பு அருள்வாராக.",
    bg1:"#001428",bg2:"#002855",bg3:"#001428", accent:"#81d4fa",accentLight:"#b3e5fc",borderGold:"#0288d1",textMain:"#e1f5fe",textSub:"rgba(129,212,250,0.85)",previewBg:"linear-gradient(160deg,#001428 0%,#002855 50%,#001428 100%)",previewAccent:"#81d4fa" },
  { id: "maghrib_rose",   faith: "muslim",   name: "Maghrib Rose",       emoji: "🌹", kolam: "✾ ☪ ✾",
    tamilWish: "இனிய பிறந்தநாள்!",
    tamilSub:  "உங்கள் வாழ்க்கை ரோஜாவைப் போல் மலர்ந்திட இறைவன் அருள்வாராக.",
    bg1:"#1a0010",bg2:"#3d0025",bg3:"#1a0010", accent:"#f48fb1",accentLight:"#fce4ec",borderGold:"#c2185b",textMain:"#fce4ec",textSub:"rgba(244,143,177,0.85)",previewBg:"linear-gradient(160deg,#1a0010 0%,#3d0025 50%,#1a0010 100%)",previewAccent:"#f48fb1" },
  { id: "noor_pearl",     faith: "muslim",   name: "Noor Pearl",         emoji: "🤍", kolam: "◈ ☪ ◈",
    tamilWish: "பிறந்தநாள் நல் வாழ்த்துக்கள்!",
    tamilSub:  "இறைவனின் நூர் உங்கள் வாழ்வை ஒளிர்விக்கட்டும்.",
    bg1:"#1a1a1a",bg2:"#333333",bg3:"#1a1a1a", accent:"#f5f5f5",accentLight:"#ffffff",borderGold:"#bdbdbd",textMain:"#fafafa",textSub:"rgba(245,245,245,0.85)",previewBg:"linear-gradient(160deg,#1a1a1a 0%,#333333 50%,#1a1a1a 100%)",previewAccent:"#f5f5f5" },
  // ── CHRISTIAN (6) ──
  { id: "cross_purple",   faith: "christian",name: "Grace Purple",       emoji: "✝️", kolam: "✝ ✦ ✝",
    tamilWish: "இனிய பிறந்தநாள் வாழ்த்துக்கள்!",
    tamilSub:  "இயேசுவின் அருளால் உங்கள் வாழ்க்கை ஆசீர்வதிக்கப்படட்டும்.",
    bg1:"#1a0028",bg2:"#3d005a",bg3:"#1a0028", accent:"#ce93d8",accentLight:"#f3e5f5",borderGold:"#8e24aa",textMain:"#f3e5f5",textSub:"rgba(206,147,216,0.85)",previewBg:"linear-gradient(160deg,#1a0028 0%,#3d005a 50%,#1a0028 100%)",previewAccent:"#ce93d8" },
  { id: "holy_gold",      faith: "christian",name: "Holy Gold",          emoji: "🙏", kolam: "✝ ◈ ✝",
    tamilWish: "பிறந்தநாள் வாழ்த்துக்கள்!",
    tamilSub:  "தேவனுடைய கிருபை உங்களுக்கு என்றும் துணையாக இருக்கட்டும்.",
    bg1:"#1a1400",bg2:"#3d3000",bg3:"#1a1400", accent:"#ffe082",accentLight:"#fff8e1",borderGold:"#ffa000",textMain:"#fff8e1",textSub:"rgba(255,224,130,0.85)",previewBg:"linear-gradient(160deg,#1a1400 0%,#3d3000 50%,#1a1400 100%)",previewAccent:"#ffe082" },
  { id: "dove_white",     faith: "christian",name: "Dove of Peace",      emoji: "🕊️", kolam: "✦ 🕊 ✦",
    tamilWish: "இனிய பிறந்தநாள்!",
    tamilSub:  "இறைவனின் சமாதானம் உங்கள் இதயத்தில் நிலைத்திருக்கட்டும்.",
    bg1:"#001428",bg2:"#003366",bg3:"#001428", accent:"#e3f2fd",accentLight:"#ffffff",borderGold:"#90caf9",textMain:"#e3f2fd",textSub:"rgba(227,242,253,0.85)",previewBg:"linear-gradient(160deg,#001428 0%,#003366 50%,#001428 100%)",previewAccent:"#bbdefb" },
  { id: "advent_red",     faith: "christian",name: "Advent Crimson",     emoji: "🕯️", kolam: "✝ ❋ ✝",
    tamilWish: "மகிழ்ச்சியான பிறந்தநாள் வாழ்த்துக்கள்!",
    tamilSub:  "ஆண்டவரின் அன்பும் அருளும் உங்களுக்கு எப்போதும் நிறைந்திருக்கட்டும்.",
    bg1:"#1a0000",bg2:"#4a0000",bg3:"#1a0000", accent:"#ef9a9a",accentLight:"#ffcdd2",borderGold:"#c62828",textMain:"#fff3f3",textSub:"rgba(239,154,154,0.85)",previewBg:"linear-gradient(160deg,#1a0000 0%,#4a0000 50%,#1a0000 100%)",previewAccent:"#ef9a9a" },
  { id: "trinity_green",  faith: "christian",name: "Trinity Green",      emoji: "🌿", kolam: "✦ ✝ ✦",
    tamilWish: "பிறந்தநாள் இனிய வாழ்த்துக்கள்!",
    tamilSub:  "தேவனுடைய ஆசீர்வாதம் உங்கள் வாழ்க்கையை நிரப்பட்டும்.",
    bg1:"#001a08",bg2:"#003314",bg3:"#001a08", accent:"#a5d6a7",accentLight:"#c8e6c9",borderGold:"#388e3c",textMain:"#e8f5e9",textSub:"rgba(165,214,167,0.85)",previewBg:"linear-gradient(160deg,#001a08 0%,#003314 50%,#001a08 100%)",previewAccent:"#a5d6a7" },
  { id: "heaven_blue",    faith: "christian",name: "Heaven Blue",        emoji: "💙", kolam: "✝ ☁ ✝",
    tamilWish: "இனிய பிறந்தநாள் வாழ்த்துக்கள்!",
    tamilSub:  "வான்மீதி தேவனின் ஆசீர்வாதம் உங்களுக்கு மழையாய் பொழியட்டும்.",
    bg1:"#001833",bg2:"#003060",bg3:"#001833", accent:"#90caf9",accentLight:"#e3f2fd",borderGold:"#1565c0",textMain:"#e3f2fd",textSub:"rgba(144,202,249,0.85)",previewBg:"linear-gradient(160deg,#001833 0%,#003060 50%,#001833 100%)",previewAccent:"#90caf9" },
];

// ─────────────────────────────────────────────
// 20 ANNIVERSARY TEMPLATES
// ─────────────────────────────────────────────
const ANNIVERSARY_TEMPLATES = [
  // ── HINDU (8) ──
  { id: "ann_kanchi",     faith: "hindu",    name: "Kanchipuram Gold",   emoji: "🪔", kolam: "✦ ◈ ✦",
    tamilWish: "இனிய திருமண நாள் வாழ்த்துக்கள்!",
    tamilSub:  "இறைவன் அருளால் உங்கள் இல்லறம் என்றும் இனிதே சிறக்கட்டும்.",
    bg1:"#3d1a00",bg2:"#7a3500",bg3:"#3d1a00", accent:"#f5c842",accentLight:"#ffe87a",borderGold:"#c8971a",textMain:"#fff8e7",textSub:"rgba(245,200,66,0.82)",previewBg:"linear-gradient(160deg,#3d1a00 0%,#7a3500 50%,#3d1a00 100%)",previewAccent:"#f5c842" },
  { id: "ann_murugan",    faith: "hindu",    name: "Murugan Crimson",    emoji: "🌺", kolam: "❋ ✿ ❋",
    tamilWish: "திருமண நாள் வாழ்த்துக்கள்!",
    tamilSub:  "முருகனின் ஆசியுடன் உங்கள் இல்லறம் பொன்னாய் விளங்கட்டும்.",
    bg1:"#4a0000",bg2:"#8b0000",bg3:"#4a0000", accent:"#ffd700",accentLight:"#ffe97a",borderGold:"#cc8800",textMain:"#fff5f5",textSub:"rgba(255,215,0,0.85)",previewBg:"linear-gradient(160deg,#4a0000 0%,#8b0000 50%,#4a0000 100%)",previewAccent:"#ffd700" },
  { id: "ann_thirumal",   faith: "hindu",    name: "Thirumal Sapphire",  emoji: "🦚", kolam: "☸ ✦ ☸",
    tamilWish: "இனிய திருமண நாள் வாழ்த்துக்கள்!",
    tamilSub:  "திருமாலின் அருளால் உங்கள் தாம்பத்யம் நீடித்திருக்கட்டும்.",
    bg1:"#0a1628",bg2:"#1a3a6b",bg3:"#0a1628", accent:"#4fc3f7",accentLight:"#b3e5fc",borderGold:"#0288d1",textMain:"#e8f4fd",textSub:"rgba(79,195,247,0.85)",previewBg:"linear-gradient(160deg,#0a1628 0%,#1a3a6b 50%,#0a1628 100%)",previewAccent:"#4fc3f7" },
  { id: "ann_ambal",      faith: "hindu",    name: "Ambal Rose",         emoji: "🌸", kolam: "✾ ❀ ✾",
    tamilWish: "திருமண நாள் இனிய வாழ்த்துக்கள்!",
    tamilSub:  "அன்னையின் அருளால் உங்கள் அன்பு வாழ்வு மலர்ந்திருக்கட்டும்.",
    bg1:"#3b0020",bg2:"#6b0035",bg3:"#3b0020", accent:"#ff9fc8",accentLight:"#ffcce0",borderGold:"#e07090",textMain:"#fff0f5",textSub:"rgba(255,159,200,0.85)",previewBg:"linear-gradient(160deg,#3b0020 0%,#6b0035 50%,#3b0020 100%)",previewAccent:"#ff9fc8" },
  { id: "ann_ganesha",    faith: "hindu",    name: "Ganesha Emerald",    emoji: "🐘", kolam: "ॐ ✦ ॐ",
    tamilWish: "திருமண நாள் வாழ்த்துக்கள்!",
    tamilSub:  "விநாயகர் ஆசியுடன் உங்கள் இல்லறம் வளம் பெருகட்டும்.",
    bg1:"#0a2e1a",bg2:"#1a5c35",bg3:"#0a2e1a", accent:"#a5d6a7",accentLight:"#c8e6c9",borderGold:"#4caf50",textMain:"#f0fff4",textSub:"rgba(165,214,167,0.85)",previewBg:"linear-gradient(160deg,#0a2e1a 0%,#1a5c35 50%,#0a2e1a 100%)",previewAccent:"#a5d6a7" },
  { id: "ann_shiva",      faith: "hindu",    name: "Shiva Silver",       emoji: "🔱", kolam: "☽ ✦ ☾",
    tamilWish: "இனிய திருமண நாள்!",
    tamilSub:  "சிவபார்வதியின் அருளால் உங்கள் அன்பு என்றும் நிலைக்கட்டும்.",
    bg1:"#1a1a2e",bg2:"#2d2d4e",bg3:"#1a1a2e", accent:"#e0e0e0",accentLight:"#f5f5f5",borderGold:"#9e9e9e",textMain:"#f5f5f5",textSub:"rgba(224,224,224,0.85)",previewBg:"linear-gradient(160deg,#1a1a2e 0%,#2d2d4e 50%,#1a1a2e 100%)",previewAccent:"#e0e0e0" },
  { id: "ann_surya",      faith: "hindu",    name: "Surya Sunrise",      emoji: "🌅", kolam: "☀ ✦ ☀",
    tamilWish: "திருமண நாள் வாழ்த்துக்கள்!",
    tamilSub:  "சூரியனைப் போல் உங்கள் அன்பு என்றும் ஒளிர்ந்திருக்கட்டும்.",
    bg1:"#2c0a00",bg2:"#7a2800",bg3:"#1a0a00", accent:"#ff9800",accentLight:"#ffcc02",borderGold:"#e65100",textMain:"#fff8e1",textSub:"rgba(255,152,0,0.9)",previewBg:"linear-gradient(160deg,#2c0a00 0%,#7a2800 60%,#1a0a00 100%)",previewAccent:"#ff9800" },
  { id: "ann_lotus",      faith: "hindu",    name: "Lotus Ivory",        emoji: "🪷", kolam: "❁ ✦ ❁",
    tamilWish: "திருமண நாள் இனிய வாழ்த்துக்கள்!",
    tamilSub:  "தாமரையைப் போல் உங்கள் இல்லறம் மலர்ந்திருக்கட்டும்.",
    bg1:"#2a1a08",bg2:"#4e3010",bg3:"#2a1a08", accent:"#f5deb3",accentLight:"#fffacd",borderGold:"#c8a96e",textMain:"#fffdf7",textSub:"rgba(245,222,179,0.85)",previewBg:"linear-gradient(160deg,#2a1a08 0%,#4e3010 50%,#2a1a08 100%)",previewAccent:"#f5deb3" },
  // ── MUSLIM (6) ──
  { id: "ann_crescent",   faith: "muslim",   name: "Crescent Teal",      emoji: "🌙", kolam: "☪ ✦ ☪",
    tamilWish: "திருமண நாள் வாழ்த்துக்கள்!",
    tamilSub:  "அல்லாஹ் உங்கள் இல்லறத்தை இன்னும் வலிமையாக்கட்டும்.",
    bg1:"#003333",bg2:"#005555",bg3:"#001a1a", accent:"#4dd0c4",accentLight:"#b2dfdb",borderGold:"#00897b",textMain:"#e0f7f4",textSub:"rgba(77,208,196,0.85)",previewBg:"linear-gradient(160deg,#003333 0%,#005555 50%,#001a1a 100%)",previewAccent:"#4dd0c4" },
  { id: "ann_mosque",     faith: "muslim",   name: "Mosque Emerald",     emoji: "🕌", kolam: "✦ ☪ ✦",
    tamilWish: "திருமண நாள் மகிழ்வான வாழ்த்துக்கள்!",
    tamilSub:  "அல்லாஹ்வின் ரஹ்மத்தில் உங்கள் அன்பு நிலைத்திருக்கட்டும்.",
    bg1:"#001a00",bg2:"#004d00",bg3:"#001a00", accent:"#80cbc4",accentLight:"#b2dfdb",borderGold:"#26a69a",textMain:"#e8f5e9",textSub:"rgba(128,203,196,0.85)",previewBg:"linear-gradient(160deg,#001a00 0%,#004d00 50%,#001a00 100%)",previewAccent:"#80cbc4" },
  { id: "ann_star_gold",  faith: "muslim",   name: "Star & Gold",        emoji: "⭐", kolam: "✦ ⭐ ✦",
    tamilWish: "திருமண நாள் வாழ்த்துக்கள்!",
    tamilSub:  "அல்லாஹ் உங்கள் கூட்டு வாழ்வை ஆசீர்வதிக்கட்டும்.",
    bg1:"#1a1200",bg2:"#3d2b00",bg3:"#1a1200", accent:"#ffd54f",accentLight:"#ffecb3",borderGold:"#ffb300",textMain:"#fff8e1",textSub:"rgba(255,213,79,0.85)",previewBg:"linear-gradient(160deg,#1a1200 0%,#3d2b00 50%,#1a1200 100%)",previewAccent:"#ffd54f" },
  { id: "ann_sabr",       faith: "muslim",   name: "Sabr Blue",          emoji: "📿", kolam: "☪ ◈ ☪",
    tamilWish: "திருமண நாள் வாழ்த்துக்கள்!",
    tamilSub:  "அல்லாஹ் உங்கள் தாம்பத்யத்தை பாதுகாத்து ஆசீர்வதிக்கட்டும்.",
    bg1:"#001428",bg2:"#002855",bg3:"#001428", accent:"#81d4fa",accentLight:"#b3e5fc",borderGold:"#0288d1",textMain:"#e1f5fe",textSub:"rgba(129,212,250,0.85)",previewBg:"linear-gradient(160deg,#001428 0%,#002855 50%,#001428 100%)",previewAccent:"#81d4fa" },
  { id: "ann_maghrib",    faith: "muslim",   name: "Maghrib Rose",       emoji: "🌹", kolam: "✾ ☪ ✾",
    tamilWish: "திருமண நாள் இனிய வாழ்த்துக்கள்!",
    tamilSub:  "ரோஜாவைப் போல் உங்கள் அன்பு என்றும் மலர்ந்திருக்கட்டும்.",
    bg1:"#1a0010",bg2:"#3d0025",bg3:"#1a0010", accent:"#f48fb1",accentLight:"#fce4ec",borderGold:"#c2185b",textMain:"#fce4ec",textSub:"rgba(244,143,177,0.85)",previewBg:"linear-gradient(160deg,#1a0010 0%,#3d0025 50%,#1a0010 100%)",previewAccent:"#f48fb1" },
  { id: "ann_noor",       faith: "muslim",   name: "Noor Pearl",         emoji: "🤍", kolam: "◈ ☪ ◈",
    tamilWish: "திருமண நாள் வாழ்த்துக்கள்!",
    tamilSub:  "இறைவனின் நூர் உங்கள் இல்லறத்தை என்றும் ஒளிர்விக்கட்டும்.",
    bg1:"#1a1a1a",bg2:"#333333",bg3:"#1a1a1a", accent:"#f5f5f5",accentLight:"#ffffff",borderGold:"#bdbdbd",textMain:"#fafafa",textSub:"rgba(245,245,245,0.85)",previewBg:"linear-gradient(160deg,#1a1a1a 0%,#333333 50%,#1a1a1a 100%)",previewAccent:"#f5f5f5" },
  // ── CHRISTIAN (6) ──
  { id: "ann_cross",      faith: "christian",name: "Grace Purple",       emoji: "✝️", kolam: "✝ ✦ ✝",
    tamilWish: "திருமண நாள் வாழ்த்துக்கள்!",
    tamilSub:  "இயேசுவின் அன்பால் உங்கள் இல்லறம் ஆசீர்வதிக்கப்படட்டும்.",
    bg1:"#1a0028",bg2:"#3d005a",bg3:"#1a0028", accent:"#ce93d8",accentLight:"#f3e5f5",borderGold:"#8e24aa",textMain:"#f3e5f5",textSub:"rgba(206,147,216,0.85)",previewBg:"linear-gradient(160deg,#1a0028 0%,#3d005a 50%,#1a0028 100%)",previewAccent:"#ce93d8" },
  { id: "ann_holy_gold",  faith: "christian",name: "Holy Gold",          emoji: "🙏", kolam: "✝ ◈ ✝",
    tamilWish: "திருமண நாள் வாழ்த்துக்கள்!",
    tamilSub:  "தேவன் உங்கள் அன்பு வாழ்வை என்றும் காத்தருள்வாராக.",
    bg1:"#1a1400",bg2:"#3d3000",bg3:"#1a1400", accent:"#ffe082",accentLight:"#fff8e1",borderGold:"#ffa000",textMain:"#fff8e1",textSub:"rgba(255,224,130,0.85)",previewBg:"linear-gradient(160deg,#1a1400 0%,#3d3000 50%,#1a1400 100%)",previewAccent:"#ffe082" },
  { id: "ann_dove",       faith: "christian",name: "Dove of Peace",      emoji: "🕊️", kolam: "✦ 🕊 ✦",
    tamilWish: "திருமண நாள் இனிய வாழ்த்துக்கள்!",
    tamilSub:  "இறைவனின் சமாதானம் உங்கள் இல்லத்தில் நிறைந்திருக்கட்டும்.",
    bg1:"#001428",bg2:"#003366",bg3:"#001428", accent:"#e3f2fd",accentLight:"#ffffff",borderGold:"#90caf9",textMain:"#e3f2fd",textSub:"rgba(227,242,253,0.85)",previewBg:"linear-gradient(160deg,#001428 0%,#003366 50%,#001428 100%)",previewAccent:"#bbdefb" },
  { id: "ann_advent",     faith: "christian",name: "Advent Crimson",     emoji: "🕯️", kolam: "✝ ❋ ✝",
    tamilWish: "திருமண நாள் வாழ்த்துக்கள்!",
    tamilSub:  "ஆண்டவரின் அன்பு உங்கள் இல்லறத்தை என்றும் வெளிச்சமாக்கட்டும்.",
    bg1:"#1a0000",bg2:"#4a0000",bg3:"#1a0000", accent:"#ef9a9a",accentLight:"#ffcdd2",borderGold:"#c62828",textMain:"#fff3f3",textSub:"rgba(239,154,154,0.85)",previewBg:"linear-gradient(160deg,#1a0000 0%,#4a0000 50%,#1a0000 100%)",previewAccent:"#ef9a9a" },
  { id: "ann_trinity",    faith: "christian",name: "Trinity Green",      emoji: "🌿", kolam: "✦ ✝ ✦",
    tamilWish: "திருமண நாள் வாழ்த்துக்கள்!",
    tamilSub:  "தேவனுடைய ஆசீர்வாதம் உங்கள் தாம்பத்யத்தை நிரப்பட்டும்.",
    bg1:"#001a08",bg2:"#003314",bg3:"#001a08", accent:"#a5d6a7",accentLight:"#c8e6c9",borderGold:"#388e3c",textMain:"#e8f5e9",textSub:"rgba(165,214,167,0.85)",previewBg:"linear-gradient(160deg,#001a08 0%,#003314 50%,#001a08 100%)",previewAccent:"#a5d6a7" },
  { id: "ann_heaven",     faith: "christian",name: "Heaven Blue",        emoji: "💙", kolam: "✝ ☁ ✝",
    tamilWish: "திருமண நாள் வாழ்த்துக்கள்!",
    tamilSub:  "வான்மீதி தேவனின் ஆசீர்வாதம் உங்கள் இல்லத்தில் மழையாய் பொழியட்டும்.",
    bg1:"#001833",bg2:"#003060",bg3:"#001833", accent:"#90caf9",accentLight:"#e3f2fd",borderGold:"#1565c0",textMain:"#e3f2fd",textSub:"rgba(144,202,249,0.85)",previewBg:"linear-gradient(160deg,#001833 0%,#003060 50%,#001833 100%)",previewAccent:"#90caf9" },
];

const BIRTHDAY_MESSAGES = [
  "May the divine blessings shower upon you today and always. Wishing you health, prosperity, and eternal happiness on your special day.",
  "On this auspicious occasion of your birthday, may God's grace illuminate your path and fill your life with endless joy and success.",
  "May this birthday mark the beginning of a magnificent year filled with love, laughter, and all the blessings you truly deserve.",
  "With heartfelt wishes, we pray that the Almighty grants you good health, great wisdom, and boundless happiness in all your endeavours.",
  "May every dream you hold dear come true this year. Wishing you a birthday as wonderful and radiant as your beautiful soul.",
];

const ANNIVERSARY_MESSAGES = [
  "May the divine blessings shower upon your beautiful bond today and always. Wishing you a lifetime of joy and togetherness on your anniversary.",
  "On this auspicious occasion of your anniversary, may God's grace illuminate your journey together with endless love and prosperity.",
  "May this anniversary mark the beginning of another magnificent year filled with shared laughter, deep love, and boundless blessings.",
  "Your love story is an inspiration to all. May the Almighty continue to bless and strengthen your beautiful bond through every season of life.",
  "Many years of love, trust, and togetherness — may every year ahead be even more beautiful. Wishing you a blessed anniversary.",
];

const WhatsAppIcon = () => (
  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const FAITH_FILTERS = [
  { id: "all", label: "All", icon: "✨" },
  { id: "hindu", label: "Hindu", icon: "🪔" },
  { id: "muslim", label: "Muslim", icon: "🌙" },
  { id: "christian", label: "Christian", icon: "✝️" },
];

export default function BirthdaysPage() {
  const [activeTab, setActiveTab] = useState<"birthdays" | "anniversaries">("birthdays");
  const [birthdays, setBirthdays] = useState<CelebrationItem[]>([]);
  const [anniversaries, setAnniversaries] = useState<CelebrationItem[]>([]);
  const [stats, setStats] = useState<Stats>({ today: 0, thisWeek: 0, thisMonth: 0, total: 0 });
  const [annStats, setAnnStats] = useState<Stats>({ today: 0, thisWeek: 0, thisMonth: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("month");
  const [selectedPerson, setSelectedPerson] = useState<CelebrationItem | null>(null);
  const [faithFilter, setFaithFilter] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState(BIRTHDAY_TEMPLATES[0]);
  const [message, setMessage] = useState(BIRTHDAY_MESSAGES[0]);
  const [senderName, setSenderName] = useState("Sampath Kumar");
  const [generating, setGenerating] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "success" | "error">("idle");

  const templates = activeTab === "birthdays" ? BIRTHDAY_TEMPLATES : ANNIVERSARY_TEMPLATES;
  const messages = activeTab === "birthdays" ? BIRTHDAY_MESSAGES : ANNIVERSARY_MESSAGES;
  const filteredTemplates = faithFilter === "all" ? templates : templates.filter(t => t.faith === faithFilter);

  useEffect(() => {
    fetchBirthdays();
    fetchAnniversaries();
  }, [range]);

  async function fetchBirthdays() {
    setLoading(true);
    try {
      const res = await fetch(`/api/birthdays?range=${range}`);
      const data = await res.json();
      setBirthdays(data.birthdays || []);
      if (data.stats) setStats(data.stats);
    } catch { } finally { setLoading(false); }
  }

  async function fetchAnniversaries() {
    try {
      const res = await fetch(`/api/anniversaries?range=${range}`);
      const data = await res.json();
      setAnniversaries(data.anniversaries || []);
      if (data.stats) setAnnStats(data.stats);
    } catch { }
  }

  const getNextDate = (dob: string) => {
    const b = new Date(dob), n = new Date();
    const t = new Date(n.getFullYear(), b.getMonth(), b.getDate());
    const next = t >= n ? t : new Date(n.getFullYear() + 1, b.getMonth(), b.getDate());
    return next.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const getYears = (dob: string) => {
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

  const openGreeting = (person: CelebrationItem) => {
    setSelectedPerson(person);
    setSelectedTemplate(activeTab === "birthdays" ? BIRTHDAY_TEMPLATES[0] : ANNIVERSARY_TEMPLATES[0]);
    setMessage(activeTab === "birthdays" ? BIRTHDAY_MESSAGES[0] : ANNIVERSARY_MESSAGES[0]);
    setFaithFilter("all");
    setShareStatus("idle");
  };

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
    ctx.strokeStyle = color + "55"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx - hw, y); ctx.lineTo(cx - 60, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 60, y); ctx.lineTo(cx + hw, y); ctx.stroke();
    ctx.font = "28px serif"; ctx.fillStyle = color; ctx.textAlign = "center"; ctx.fillText("✦", cx, y + 9);
  }

  const generateCardBlob = (): Promise<Blob> => new Promise((resolve, reject) => {
    if (!selectedPerson) return reject("No person");
    const tpl = selectedTemplate;
    const years = getYears(selectedPerson.date_of_birth);
    const W = 1080, H = 1440;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, tpl.bg1); bg.addColorStop(0.5, tpl.bg2); bg.addColorStop(1, tpl.bg3);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Glows
    const g1 = ctx.createRadialGradient(W*.15, H*.1, 0, W*.15, H*.1, 340);
    g1.addColorStop(0, tpl.accent + "28"); g1.addColorStop(1, "transparent");
    ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
    const g2 = ctx.createRadialGradient(W*.85, H*.88, 0, W*.85, H*.88, 280);
    g2.addColorStop(0, tpl.accent + "1a"); g2.addColorStop(1, "transparent");
    ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);

    // Border
    const M = 36;
    ctx.strokeStyle = tpl.accent; ctx.lineWidth = 3;
    ctx.strokeRect(M, M, W-M*2, H-M*2);
    ctx.strokeStyle = tpl.accent + "44"; ctx.lineWidth = 1;
    ctx.strokeRect(M+14, M+14, W-(M+14)*2, H-(M+14)*2);

    // Corner flowers
    const drawFlower = (cx: number, cy: number) => {
      for (let i = 0; i < 8; i++) {
        const a = (i/8)*Math.PI*2;
        ctx.beginPath();
        ctx.ellipse(cx+Math.cos(a)*17, cy+Math.sin(a)*17, 7, 4, a, 0, Math.PI*2);
        ctx.fillStyle = tpl.accent; ctx.fill();
      }
      ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI*2);
      ctx.fillStyle = tpl.accentLight; ctx.fill();
    };
    const CO = M+4;
    drawFlower(CO+16, CO+16); drawFlower(W-CO-16, CO+16);
    drawFlower(CO+16, H-CO-16); drawFlower(W-CO-16, H-CO-16);

    // Top band
    const bY = M+30;
    ctx.fillStyle = tpl.accent + "1a"; ctx.fillRect(M+16, bY, W-(M+16)*2, 78);
    ctx.strokeStyle = tpl.accent+"55"; ctx.lineWidth=1;
    ctx.strokeRect(M+16, bY, W-(M+16)*2, 78);
    ctx.font = "bold 36px serif"; ctx.fillStyle = tpl.accent; ctx.textAlign = "center";
    ctx.fillText(tpl.kolam, W/2, bY+50);

    // Emoji
    ctx.font = "140px serif"; ctx.textAlign = "center";
    ctx.fillText(tpl.emoji, W/2, 270);

    // Tamil wish
    ctx.font = "bold 58px 'Noto Sans Tamil', serif";
    ctx.fillStyle = tpl.accent; ctx.textAlign = "center";
    ctx.fillText(tpl.tamilWish, W/2, 352);

    ctx.font = "34px 'Noto Sans Tamil', serif";
    ctx.fillStyle = tpl.textSub;
    wrapText(ctx, tpl.tamilSub, W/2, 400, W-180, 46);

    drawDivider(ctx, W/2, 476, 400, tpl.accent);

    ctx.font = "italic 36px Georgia, serif";
    ctx.fillStyle = tpl.textSub; ctx.textAlign = "center";
    const topLine = activeTab === "birthdays" ? "✦  Heartfelt Birthday Wishes to  ✦" : "✦  Heartfelt Anniversary Wishes to  ✦";
    ctx.fillText(topLine, W/2, 548);

    // Name
    const nameSize = selectedPerson.name.length > 18 ? 72 : 94;
    ctx.font = `bold ${nameSize}px Georgia, serif`;
    ctx.fillStyle = tpl.textMain; ctx.textAlign = "center";
    ctx.shadowColor = tpl.accent; ctx.shadowBlur = 24;
    ctx.fillText(selectedPerson.name, W/2, 658);
    ctx.shadowBlur = 0;

    // Age/years pill
    const pW = 320, pH = 54, pX = W/2-pW/2, pY = 680;
    ctx.fillStyle = tpl.accent + "22";
    roundRect(ctx, pX, pY, pW, pH, 27); ctx.fill();
    ctx.strokeStyle = tpl.accent + "44"; ctx.lineWidth = 1;
    roundRect(ctx, pX, pY, pW, pH, 27); ctx.stroke();
    ctx.font = "500 28px Georgia, serif"; ctx.fillStyle = tpl.accent; ctx.textAlign = "center";
    const pillText = activeTab === "birthdays" ? `Turning ${years} Years of Grace` : `Celebrating ${years} Years of Togetherness`;
    ctx.fillText(pillText, W/2, pY+34);

    drawDivider(ctx, W/2, 764, 360, tpl.accent);

    // Message box
    const mX=80, mY=796, mW=W-160, mH=210;
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    roundRect(ctx, mX, mY, mW, mH, 20); ctx.fill();
    ctx.strokeStyle = tpl.borderGold+"55"; ctx.lineWidth=1.5;
    roundRect(ctx, mX, mY, mW, mH, 20); ctx.stroke();
    ctx.font = "italic 35px Georgia, serif"; ctx.fillStyle = tpl.textMain; ctx.textAlign = "center";
    wrapText(ctx, `"${message}"`, W/2, mY+58, mW-80, 50);

    drawDivider(ctx, W/2, 1050, 340, tpl.accent);

    // Sender
    ctx.font = "bold 46px Georgia, serif"; ctx.fillStyle = tpl.accent; ctx.textAlign = "center";
    ctx.fillText(senderName, W/2, 1118);
    ctx.font = "400 32px Georgia, serif"; ctx.fillStyle = tpl.textSub;
    ctx.fillText("Maruthi Insure Care", W/2, 1162);

    // Bottom band
    const bbY = H-M-30-78;
    ctx.fillStyle = tpl.accent+"1a"; ctx.fillRect(M+16, bbY, W-(M+16)*2, 78);
    ctx.strokeStyle = tpl.accent+"55"; ctx.lineWidth=1;
    ctx.strokeRect(M+16, bbY, W-(M+16)*2, 78);
    ctx.font = "300 26px Georgia, serif"; ctx.fillStyle = tpl.accent+"aa"; ctx.textAlign = "center";
    ctx.fillText("❁  Heritage of Trust Since 2011  ❁", W/2, bbY+50);

    canvas.toBlob(b => b ? resolve(b) : reject("Blob null"), "image/png", 0.96);
  });

  const handleShare = async () => {
    if (!selectedPerson) return;
    setGenerating(true); setShareStatus("idle");
    try {
      const blob = await generateCardBlob();
      const prefix = activeTab === "birthdays" ? "birthday" : "anniversary";
      const file = new File([blob], `${prefix}-${selectedPerson.name.replace(/\s+/g,"-")}.png`, { type: "image/png" });
      const whatsappText = `${selectedTemplate.tamilWish}\n\n${message}\n\n— ${senderName}\nMaruthi Insure Care`;

      // Always get the client's phone number
      const rawPhone = selectedPerson.phone?.replace(/\D/g, "") || "";
      // Add India country code if not already present
      const phone = rawPhone.startsWith("91") ? rawPhone : rawPhone ? `91${rawPhone}` : "";

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: whatsappText, title: `Wishes for ${selectedPerson.name}` });
        setShareStatus("success");
      } else {
        // Download image first
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = file.name; a.click();
        URL.revokeObjectURL(url);
        // Then open WhatsApp with client's number
        await new Promise(r => setTimeout(r, 600));
        const waUrl = phone
          ? `https://wa.me/${phone}?text=${encodeURIComponent(whatsappText)}`
          : `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
        window.open(waUrl, "_blank");
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
      const prefix = activeTab === "birthdays" ? "birthday" : "anniversary";
      const a = document.createElement("a"); a.href = url;
      a.download = `${prefix}-${selectedPerson.name.replace(/\s+/g,"-")}.png`; a.click();
      URL.revokeObjectURL(url);
    } finally { setGenerating(false); }
  };

  const currentStats = activeTab === "birthdays" ? stats : annStats;
  const currentList = activeTab === "birthdays" ? birthdays : anniversaries;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Noto+Sans+Tamil:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pg { font-family: 'DM Sans', sans-serif; background: #f0f6ff; min-height: 100vh; padding: 24px 16px; color: #03071e; }
        @media(min-width:768px){ .pg { padding: 32px 32px; } }
        @media(min-width:1024px){ .pg { padding: 32px 40px; } }

        .hdr { margin-bottom: 28px; }
        .hdr-tag { display:inline-flex; align-items:center; gap:6px; background:#dbeafe; border:1px solid #bfdbfe; border-radius:999px; padding:4px 12px; font-size:10px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#1338be; margin-bottom:10px; }
        .hdr-dot { width:6px; height:6px; border-radius:50%; background:#3b82f6; animation:blink 2s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.4} }
        .hdr-title { font-family:'Playfair Display',serif; font-size:clamp(28px,6vw,50px); font-weight:900; color:#051650; letter-spacing:-1px; line-height:1.05; }
        .hdr-title em { color:#1e50d4; font-style:italic; }
        .hdr-sub { font-size:13px; color:#6b8cff; font-weight:500; margin-top:4px; }

        .main-tabs { display:flex; gap:8px; margin-bottom:24px; }
        .mtab { padding:10px 22px; border-radius:12px; border:2px solid #e2e8f0; cursor:pointer; font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:.07em; background:#fff; color:#94a3b8; font-family:inherit; transition:all .2s; box-shadow:0 2px 8px rgba(0,0,0,.06); }
        .mtab.on { border-color:#3b82f6; color:#051650; box-shadow:0 4px 16px rgba(59,130,246,.18); }

        .stats { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; margin-bottom:20px; }
        @media(min-width:640px){ .stats { grid-template-columns:repeat(4,1fr); } }
        .stat { background:#fff; border:1px solid rgba(59,130,246,.1); border-radius:16px; padding:18px 14px; box-shadow:0 2px 10px rgba(59,130,246,.06); transition:transform .2s; }
        .stat:hover { transform:translateY(-2px); }
        .stat.hl { background:linear-gradient(135deg,#1338be,#1e50d4); border-color:transparent; box-shadow:0 8px 24px rgba(19,56,190,.3); }
        .stat-icon { font-size:20px; margin-bottom:10px; }
        .stat-val { font-size:clamp(24px,5vw,36px); font-weight:900; color:#051650; line-height:1; }
        .stat.hl .stat-val { color:#fff; }
        .stat-lbl { font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:.18em; color:#94a3b8; margin-top:5px; }
        .stat.hl .stat-lbl { color:rgba(255,255,255,.55); }

        .fbar { display:flex; gap:3px; background:#fff; border:1px solid rgba(59,130,246,.12); border-radius:12px; padding:4px; margin-bottom:18px; width:fit-content; box-shadow:0 2px 8px rgba(59,130,246,.06); }
        .fbtn { padding:7px 20px; border-radius:9px; border:none; cursor:pointer; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.1em; background:transparent; color:#94a3b8; font-family:inherit; transition:all .18s; }
        .fbtn.on { background:linear-gradient(135deg,#1338be,#1e50d4); color:#fff; box-shadow:0 3px 10px rgba(19,56,190,.28); }

        .lcard { background:#fff; border-radius:20px; border:1px solid rgba(59,130,246,.1); overflow:hidden; box-shadow:0 4px 20px rgba(59,130,246,.08); }
        .lhdr { padding:14px 20px; border-bottom:1px solid rgba(59,130,246,.08); display:flex; align-items:center; justify-content:space-between; background:linear-gradient(135deg,#eff6ff,#fff); }
        .lhdr-t { font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.16em; color:#0a2380; }
        .live { display:flex; align-items:center; gap:6px; }
        .live-dot { width:7px; height:7px; border-radius:50%; background:#22c55e; animation:blink 2s infinite; }
        .live-txt { font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:.14em; color:#94a3b8; }

        .row { padding:14px 20px; display:flex; align-items:center; gap:14px; border-bottom:1px solid rgba(59,130,246,.07); transition:background .12s; cursor:pointer; }
        .row:last-child { border-bottom:none; }
        .row:hover { background:#eff6ff; }

        .dbadge { min-width:50px; height:58px; border-radius:12px; background:#eff6ff; border:1px solid rgba(59,130,246,.2); display:flex; flex-direction:column; align-items:center; overflow:hidden; flex-shrink:0; }
        .dbadge-m { width:100%; background:linear-gradient(135deg,#1338be,#1e50d4); color:#fff; font-size:8px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; text-align:center; padding:4px 0; }
        .dbadge-d { flex:1; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:900; color:#0a2380; }

        .rinfo { flex:1; min-width:0; }
        .rname { font-size:14px; font-weight:700; color:#051650; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:2px; }
        .rmeta { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:#6b8cff; margin-bottom:2px; }
        .rcnt { font-size:11px; font-weight:700; color:#1e50d4; }
        .rcnt.today { color:#f59e0b; animation:blink 1.2s infinite; }
        .phone-tag { font-size:10px; color:#94a3b8; font-weight:500; }

        .wbtn { display:flex; align-items:center; gap:6px; padding:9px 14px; border-radius:12px; background:#25d366; color:#fff; border:none; cursor:pointer; font-size:11px; font-weight:800; white-space:nowrap; font-family:inherit; flex-shrink:0; box-shadow:0 3px 10px rgba(37,211,102,.28); transition:all .15s; }
        .wbtn:hover { background:#1db954; transform:scale(1.03); }

        .empty { padding:60px 20px; text-align:center; }
        .spin { width:28px; height:28px; border:3px solid rgba(59,130,246,.2); border-top-color:#3b82f6; border-radius:50%; animation:rot .7s linear infinite; margin:0 auto 12px; }
        @keyframes rot { to { transform:rotate(360deg) } }

        /* ── MODAL ── */
        .overlay { position:fixed; inset:0; z-index:300; display:flex; align-items:flex-end; }
        @media(min-width:768px){ .overlay { align-items:center; justify-content:center; padding:20px; } }
        .obg { position:absolute; inset:0; background:rgba(3,7,30,.8); backdrop-filter:blur(16px); }

        .msheet { position:relative; z-index:10; background:#fff; width:100%; border-radius:24px 24px 0 0; max-height:96vh; overflow-y:auto; display:flex; flex-direction:column; animation:slideUp .3s cubic-bezier(.34,1.56,.64,1); }
        @media(min-width:768px){ .msheet { max-width:1020px; border-radius:20px; max-height:92vh; flex-direction:row; overflow:hidden; animation:zoomIn .22s ease-out; } }
        @keyframes slideUp { from{transform:translateY(100%);opacity:0} to{transform:none;opacity:1} }
        @keyframes zoomIn { from{transform:scale(.95);opacity:0} to{transform:none;opacity:1} }

        .mhandle { width:38px; height:4px; border-radius:2px; background:#e2e8f0; margin:14px auto 0; flex-shrink:0; }
        @media(min-width:768px){ .mhandle { display:none; } }

        .mleft { padding:20px 18px; border-bottom:1px solid #f1f5f9; flex-shrink:0; display:flex; flex-direction:column; gap:12px; overflow-y:auto; }
        @media(min-width:768px){ .mleft { width:380px; border-bottom:none; border-right:1px solid #f1f5f9; background:#f8faff; border-radius:20px 0 0 20px; padding:24px 22px; } }

        .mt { font-family:'Playfair Display',serif; font-size:20px; font-weight:900; color:#051650; }
        .mt em { color:#1e50d4; font-style:italic; }

        .mperson { display:flex; align-items:center; gap:12px; padding:12px; background:#fff; border-radius:12px; border:1px solid rgba(59,130,246,.15); box-shadow:0 2px 8px rgba(59,130,246,.07); }
        .mav { width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,#1338be,#3b82f6); display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
        .mpname { font-size:14px; font-weight:800; color:#051650; }
        .mpmeta { font-size:11px; color:#6b8cff; font-weight:500; }
        .mpphone { font-size:11px; color:#22c55e; font-weight:600; margin-top:2px; }

        .flbl { font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:.18em; color:#94a3b8; display:block; }

        /* Faith filter pills */
        .faith-pills { display:flex; gap:6px; flex-wrap:wrap; }
        .faith-pill { padding:5px 12px; border-radius:99px; border:1.5px solid #e2e8f0; background:#fff; font-size:11px; font-weight:700; color:#64748b; cursor:pointer; font-family:inherit; transition:all .15s; }
        .faith-pill.on { border-color:#3b82f6; background:#eff6ff; color:#1338be; }

        /* Tamil preview chip */
        .tamil-chip { border-radius:12px; padding:10px 14px; border:1px solid; }
        .tamil-wish { font-family:'Noto Sans Tamil',sans-serif; font-size:14px; font-weight:700; line-height:1.4; margin-bottom:3px; }
        .tamil-sub { font-family:'Noto Sans Tamil',sans-serif; font-size:10px; opacity:.8; line-height:1.5; }

        /* Template grid */
        .tgrid { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; max-height:200px; overflow-y:auto; scrollbar-width:thin; }
        @media(max-width:767px){ .tgrid { grid-template-columns:repeat(4,1fr); max-height:none; display:flex; overflow-x:auto; overflow-y:hidden; } }
        .tbtn { padding:8px 6px; border-radius:10px; border:1.5px solid #e2e8f0; background:#fff; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px; font-family:inherit; transition:all .12s; min-width:72px; }
        .tbtn.on { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.12); }
        .tswatch { width:28px; height:28px; border-radius:7px; flex-shrink:0; }
        .tname { font-size:8px; font-weight:700; color:#334155; text-align:center; line-height:1.3; }
        .tfaith { font-size:8px; color:#94a3b8; font-weight:500; }

        .msel, .mtarea, .minput { width:100%; padding:10px 12px; border-radius:12px; border:1.5px solid rgba(59,130,246,.2); font-size:12px; font-family:inherit; color:#03071e; background:#fff; outline:none; appearance:none; transition:border-color .15s; }
        .msel:focus, .mtarea:focus, .minput:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.1); }
        .mtarea { min-height:72px; resize:vertical; }

        .btn-wa { width:100%; padding:13px; border-radius:12px; border:none; background:#25d366; color:#fff; font-size:13px; font-weight:800; font-family:inherit; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 5px 16px rgba(37,211,102,.28); transition:all .15s; }
        .btn-wa:hover:not(:disabled) { background:#1db954; transform:translateY(-1px); }
        .btn-wa:disabled { opacity:.6; cursor:not-allowed; }
        .btn-dl { width:100%; padding:10px; border-radius:12px; border:1.5px solid rgba(59,130,246,.2); background:#fff; color:#0a2380; font-size:12px; font-weight:800; font-family:inherit; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; transition:background .12s; }
        .btn-dl:hover:not(:disabled) { background:#eff6ff; }
        .btn-dl:disabled { opacity:.6; cursor:not-allowed; }

        .st-ok { font-size:12px; font-weight:700; color:#16a34a; text-align:center; }
        .st-err { font-size:12px; font-weight:700; color:#dc2626; text-align:center; }
        .note { font-size:10px; color:#94a3b8; text-align:center; line-height:1.7; font-weight:500; }
        .note b { color:#1e50d4; }

        /* Right side preview */
        .mright { background:linear-gradient(160deg,#03071e 0%,#051650 100%); padding:22px 18px; display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1; border-radius:0 20px 20px 0; position:relative; overflow:hidden; }
        .pvlbl { font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:.2em; color:rgba(255,255,255,.2); margin-bottom:14px; position:relative; z-index:1; }
        .cpreview { width:100%; max-width:252px; aspect-ratio:3/4; border-radius:18px; position:relative; overflow:hidden; box-shadow:0 28px 60px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.08); display:flex; flex-direction:column; z-index:1; }
        .cp-corner { position:absolute; width:18px; height:18px; z-index:3; }
        .cp-corner.tl { top:6px;left:6px; border-top:1.5px solid; border-left:1.5px solid; border-radius:3px 0 0 0; }
        .cp-corner.tr { top:6px;right:6px; border-top:1.5px solid; border-right:1.5px solid; border-radius:0 3px 0 0; }
        .cp-corner.bl { bottom:6px;left:6px; border-bottom:1.5px solid; border-left:1.5px solid; border-radius:0 0 0 3px; }
        .cp-corner.br { bottom:6px;right:6px; border-bottom:1.5px solid; border-right:1.5px solid; border-radius:0 0 3px 0; }
        .cpinner { position:absolute; inset:10px; display:flex; flex-direction:column; align-items:center; text-align:center; padding:10px 8px; z-index:2; }
        .cp-band { width:calc(100% + 16px); margin:-10px -8px 6px; padding:5px; text-align:center; }
        .cp-kolam { font-size:9px; letter-spacing:.1em; opacity:.65; }
        .cp-emoji { font-size:28px; margin-bottom:3px; animation:float 3s ease-in-out infinite; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        .cp-tamil { font-family:'Noto Sans Tamil',sans-serif; font-size:10px; font-weight:700; line-height:1.4; }
        .cp-tamilsub { font-family:'Noto Sans Tamil',sans-serif; font-size:8px; opacity:.75; line-height:1.4; margin-bottom:5px; }
        .cp-div { height:.5px; width:50%; opacity:.3; margin:0 auto 4px; }
        .cp-to { font-size:8px; font-style:italic; opacity:.6; margin-bottom:2px; }
        .cp-name { font-family:'Playfair Display',serif; font-size:17px; font-weight:700; line-height:1.1; }
        .cp-years { font-size:7px; letter-spacing:.12em; text-transform:uppercase; opacity:.5; margin-bottom:5px; }
        .cp-msg { font-size:7.5px; font-style:italic; opacity:.8; line-height:1.5; flex:1; display:flex; align-items:center; }
        .cp-footer { margin-top:auto; padding-top:5px; border-top:.5px solid rgba(255,255,255,.1); width:100%; }
        .cp-sender { font-size:10px; font-weight:700; letter-spacing:.03em; }
        .cp-co { font-size:7px; opacity:.4; margin-top:1px; }

        .dots { display:flex; gap:5px; margin-top:14px; position:relative; z-index:1; flex-wrap:wrap; justify-content:center; max-width:252px; }
        .dot { height:5px; border-radius:3px; border:none; cursor:pointer; transition:all .2s; padding:0; }

        .xbtn { position:absolute; top:12px; right:12px; z-index:50; width:30px; height:30px; border-radius:50%; background:#f1f5f9; border:1px solid #e2e8f0; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:13px; color:#64748b; transition:background .12s; line-height:1; }
        .xbtn:hover { background:#e2e8f0; }
      `}</style>

      <div className="pg">
        <header className="hdr">
          <div className="hdr-tag"><span className="hdr-dot"/>Maruthi Insure Care</div>
          <h1 className="hdr-title">Outreach & <em>Engagement</em></h1>
          <p className="hdr-sub">🪔 Bilingual greetings · Hindu · Muslim · Christian · 20 templates each</p>
        </header>

        {/* Main tabs */}
        <div className="main-tabs">
          <button className={`mtab${activeTab==="birthdays"?" on":""}`} onClick={()=>setActiveTab("birthdays")}>🎂 Birthdays</button>
          <button className={`mtab${activeTab==="anniversaries"?" on":""}`} onClick={()=>setActiveTab("anniversaries")}>💍 Anniversaries</button>
        </div>

        {/* Stats */}
        <div className="stats">
          {[
            {label:"Today",     value:currentStats.today,    icon:"📆", hl:false},
            {label:"This Week", value:currentStats.thisWeek,  icon:"✨", hl:true},
            {label:"This Month",value:currentStats.thisMonth, icon:activeTab==="birthdays"?"🍰":"💍", hl:false},
            {label:"All",       value:currentStats.total,     icon:"🎈", hl:false},
          ].map(s=>(
            <div key={s.label} className={`stat${s.hl?" hl":""}`}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-val">{loading?"—":s.value}</div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Range filter */}
        <div className="fbar">
          {([["week","Week"],["month","Month"],["all","All"]] as const).map(([id,label])=>(
            <button key={id} className={`fbtn${range===id?" on":""}`} onClick={()=>setRange(id)}>{label}</button>
          ))}
        </div>

        {/* List */}
        <div className="lcard">
          <div className="lhdr">
            <span className="lhdr-t">Celebration List — {activeTab === "birthdays" ? "Birthdays" : "Anniversaries"}</span>
            <div className="live"><div className="live-dot"/><span className="live-txt">Live</span></div>
          </div>

          {loading ? (
            <div className="empty"><div className="spin"/><p style={{color:"#94a3b8",fontSize:13,fontWeight:600}}>Syncing…</p></div>
          ) : currentList.length === 0 ? (
            <div className="empty">
              <div style={{fontSize:36}}>{activeTab==="birthdays"?"🎂":"💍"}</div>
              <p style={{color:"#94a3b8",fontWeight:700,marginTop:10,fontSize:14}}>No {activeTab} in this range</p>
              {activeTab==="anniversaries" && <p style={{color:"#cbd5e1",fontSize:12,marginTop:6}}>Make sure clients have anniversary_date saved in their profile</p>}
            </div>
          ) : currentList.map((p,i)=>{
            const days = daysUntil(p.date_of_birth);
            const parts = getNextDate(p.date_of_birth).split(" ");
            return (
              <div key={p.name+i} className="row" onClick={()=>openGreeting(p)}>
                <div className="dbadge">
                  <div className="dbadge-m">{parts[1]}</div>
                  <div className="dbadge-d">{parts[0]}</div>
                </div>
                <div className="rinfo">
                  <div className="rname">{p.name}</div>
                  <div className="rmeta">{p.relationship} · {activeTab==="birthdays"?`Age ${getYears(p.date_of_birth)}`:`${getYears(p.date_of_birth)} yrs`}</div>
                  <div className={`rcnt${days===0?" today":""}`}>
                    {days===0?(activeTab==="birthdays"?"🎂 TODAY!":"💍 TODAY!"):days===1?"Tomorrow":`In ${days} days`}
                  </div>
                  {p.phone && <div className="phone-tag">📞 {p.phone}</div>}
                </div>
                <button className="wbtn" onClick={e=>{e.stopPropagation();openGreeting(p);}}>
                  <WhatsAppIcon/> Wish
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MODAL ── */}
      {selectedPerson && (
        <div className="overlay">
          <div className="obg" onClick={()=>setSelectedPerson(null)}/>
          <div className="msheet">
            <button className="xbtn" onClick={()=>setSelectedPerson(null)}>✕</button>
            <div className="mhandle"/>

            {/* Left panel */}
            <div className="mleft">
              <h3 className="mt">Greeting <em>Designer</em></h3>

              {/* Person info */}
              <div className="mperson">
                <div className="mav">{activeTab==="birthdays"?"🎂":"💍"}</div>
                <div>
                  <div className="mpname">{selectedPerson.name}</div>
                  <div className="mpmeta">{selectedPerson.relationship} · {activeTab==="birthdays"?`Turning ${getYears(selectedPerson.date_of_birth)}`:`${getYears(selectedPerson.date_of_birth)} yrs together`}</div>
                  {selectedPerson.phone && <div className="mpphone">📞 {selectedPerson.phone} · Will open WhatsApp directly</div>}
                </div>
              </div>

              {/* Tamil preview */}
              <div className="tamil-chip" style={{background:`linear-gradient(135deg,${selectedTemplate.bg1},${selectedTemplate.bg2})`,borderColor:selectedTemplate.accent+"44"}}>
                <div className="tamil-wish" style={{color:selectedTemplate.accent}}>{selectedTemplate.tamilWish}</div>
                <div className="tamil-sub" style={{color:selectedTemplate.textSub}}>{selectedTemplate.tamilSub}</div>
              </div>

              {/* Faith filter */}
              <div>
                <label className="flbl" style={{marginBottom:6}}>Filter by Faith</label>
                <div className="faith-pills">
                  {FAITH_FILTERS.map(f=>(
                    <button key={f.id} className={`faith-pill${faithFilter===f.id?" on":""}`} onClick={()=>setFaithFilter(f.id)}>
                      {f.icon} {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template grid */}
              <div>
                <label className="flbl" style={{marginBottom:6}}>Temple Theme ({filteredTemplates.length})</label>
                <div className="tgrid">
                  {filteredTemplates.map(t=>(
                    <button key={t.id} className={`tbtn${selectedTemplate.id===t.id?" on":""}`} onClick={()=>setSelectedTemplate(t)}>
                      <div className="tswatch" style={{background:`linear-gradient(135deg,${t.bg1},${t.bg2})`,border:`1.5px solid ${t.accent}44`}}/>
                      <span className="tname">{t.emoji} {t.name}</span>
                      <span className="tfaith">{t.faith}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="flbl" style={{marginBottom:6}}>English Blessing</label>
                <select className="msel" value={message} onChange={e=>setMessage(e.target.value)}>
                  {messages.map((m,i)=><option key={i} value={m}>{m.slice(0,55)}…</option>)}
                </select>
                <textarea className="mtarea" value={message} onChange={e=>setMessage(e.target.value)} rows={3} style={{marginTop:6}}/>
              </div>

              {/* Sender name */}
              <div>
                <label className="flbl" style={{marginBottom:6}}>Your Name</label>
                <input className="minput" value={senderName} onChange={e=>setSenderName(e.target.value)} placeholder="Sender name…"/>
              </div>

              {/* Actions */}
              <button className="btn-wa" onClick={handleShare} disabled={generating}>
                {generating
                  ? <><div style={{width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"rot .7s linear infinite"}}/> Generating…</>
                  : <><WhatsAppIcon/> {selectedPerson.phone ? `Send to ${selectedPerson.phone}` : "Share via WhatsApp"}</>
                }
              </button>

              <button className="btn-dl" onClick={handleDownload} disabled={generating}>
                ⬇ Download card (PNG)
              </button>

              {shareStatus==="success" && <p className="st-ok">✓ Card sent / downloaded successfully!</p>}
              {shareStatus==="error"   && <p className="st-err">⚠ Failed. Download and share manually.</p>}

              <p className="note">
                <b>Mobile:</b> native share sheet opens — pick WhatsApp.<br/>
                <b>Desktop:</b> image downloads + WhatsApp opens to <b>{selectedPerson.phone || "contact"}</b>.
              </p>
            </div>

            {/* Right: live preview */}
            <div className="mright">
              <p className="pvlbl">Live Preview</p>
              <div className="cpreview" style={{background:selectedTemplate.previewBg}}>
                {(["tl","tr","bl","br"] as const).map(pos=>(
                  <div key={pos} className={`cp-corner ${pos}`} style={{borderColor:selectedTemplate.previewAccent+"55"}}/>
                ))}
                <div className="cpinner" style={{color:selectedTemplate.textMain}}>
                  <div className="cp-band" style={{background:selectedTemplate.accent+"18",borderBottom:`1px solid ${selectedTemplate.accent}28`}}>
                    <div className="cp-kolam" style={{color:selectedTemplate.previewAccent}}>{selectedTemplate.kolam}</div>
                  </div>
                  <div className="cp-emoji">{selectedTemplate.emoji}</div>
                  <div className="cp-tamil" style={{color:selectedTemplate.previewAccent}}>{selectedTemplate.tamilWish}</div>
                  <div className="cp-tamilsub" style={{color:selectedTemplate.textSub}}>{selectedTemplate.tamilSub}</div>
                  <div className="cp-div" style={{background:selectedTemplate.previewAccent}}/>
                  <div className="cp-to" style={{color:selectedTemplate.textSub}}>✦ {activeTab==="birthdays"?"Birthday":"Anniversary"} Wishes to ✦</div>
                  <div className="cp-name">{selectedPerson.name}</div>
                  <div className="cp-years" style={{color:selectedTemplate.textSub}}>
                    {activeTab==="birthdays"?`Turning ${getYears(selectedPerson.date_of_birth)} Years`:`${getYears(selectedPerson.date_of_birth)} Years Together`}
                  </div>
                  <div className="cp-div" style={{background:selectedTemplate.previewAccent}}/>
                  <p className="cp-msg" style={{color:selectedTemplate.textSub}}>
                    "{message.length>85?message.slice(0,85)+"…":message}"
                  </p>
                  <div className="cp-footer">
                    <div className="cp-sender" style={{color:selectedTemplate.previewAccent}}>{senderName||"Your Name"}</div>
                    <div className="cp-co" style={{color:selectedTemplate.textSub}}>Maruthi Insure Care</div>
                  </div>
                </div>
              </div>

              {/* Template dots */}
              <div className="dots">
                {filteredTemplates.map(t=>(
                  <button key={t.id} className="dot" onClick={()=>setSelectedTemplate(t)} title={t.name}
                    style={{width:selectedTemplate.id===t.id?16:5, background:selectedTemplate.id===t.id?t.previewAccent:"rgba(255,255,255,.2)"}}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}