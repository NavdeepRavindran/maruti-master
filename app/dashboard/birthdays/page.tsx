"use client";

import { useEffect, useRef, useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────
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

// ─── Template System ─────────────────────────────────────────────────────────
interface Template {
  id: string; faith: "hindu" | "muslim" | "christian"; name: string;
  emoji: string; kolam: string; tamilWish: string; tamilSub: string;
  bg1: string; bg2: string; bg3: string;
  accent: string; accentLight: string; borderGold: string;
  textMain: string; textSub: string;
  previewBg: string; previewAccent: string;
}

const BIRTHDAY_TEMPLATES: Template[] = [
  { id:"kanchi_gold",   faith:"hindu",    name:"Kanchipuram Gold",  emoji:"🪔", kolam:"✦ ◈ ✦", tamilWish:"இனிய பிறந்தநாள் வாழ்த்துக்கள்!", tamilSub:"இறைவன் அருளால் உங்கள் வாழ்க்கை மலர்ந்து வளர்க!", bg1:"#3d1a00",bg2:"#7a3500",bg3:"#3d1a00",accent:"#f5c842",accentLight:"#ffe87a",borderGold:"#c8971a",textMain:"#fff8e7",textSub:"rgba(245,200,66,0.82)",previewBg:"linear-gradient(160deg,#3d1a00 0%,#7a3500 50%,#3d1a00 100%)",previewAccent:"#f5c842" },
  { id:"murugan_red",   faith:"hindu",    name:"Murugan Crimson",   emoji:"🌺", kolam:"❋ ✿ ❋", tamilWish:"பிறந்தநாள் நல் வாழ்த்துக்கள்!", tamilSub:"முருகனின் அருள் என்றும் உங்களுக்கு துணையாக இருக்கட்டும்.", bg1:"#4a0000",bg2:"#8b0000",bg3:"#4a0000",accent:"#ffd700",accentLight:"#ffe97a",borderGold:"#cc8800",textMain:"#fff5f5",textSub:"rgba(255,215,0,0.85)",previewBg:"linear-gradient(160deg,#4a0000 0%,#8b0000 50%,#4a0000 100%)",previewAccent:"#ffd700" },
  { id:"thirumal_blue", faith:"hindu",    name:"Thirumal Sapphire", emoji:"🦚", kolam:"☸ ✦ ☸", tamilWish:"மகிழ்ச்சியான பிறந்த நாள்!", tamilSub:"திருமாலின் ஆசியுடன் உங்கள் ஆண்டு சிறப்பாக அமையட்டும்.", bg1:"#0a1628",bg2:"#1a3a6b",bg3:"#0a1628",accent:"#4fc3f7",accentLight:"#b3e5fc",borderGold:"#0288d1",textMain:"#e8f4fd",textSub:"rgba(79,195,247,0.85)",previewBg:"linear-gradient(160deg,#0a1628 0%,#1a3a6b 50%,#0a1628 100%)",previewAccent:"#4fc3f7" },
  { id:"ambal_rose",    faith:"hindu",    name:"Ambal Rose",        emoji:"🌸", kolam:"✾ ❀ ✾", tamilWish:"இனிய பிறந்தநாள் வாழ்த்துக்கள்!", tamilSub:"அன்னையின் அருளால் உங்கள் வாழ்வு ஆனந்தமாக இருக்கட்டும்.", bg1:"#3b0020",bg2:"#6b0035",bg3:"#3b0020",accent:"#ff9fc8",accentLight:"#ffcce0",borderGold:"#e07090",textMain:"#fff0f5",textSub:"rgba(255,159,200,0.85)",previewBg:"linear-gradient(160deg,#3b0020 0%,#6b0035 50%,#3b0020 100%)",previewAccent:"#ff9fc8" },
  { id:"ganesha_green", faith:"hindu",    name:"Ganesha Emerald",   emoji:"🐘", kolam:"ॐ ✦ ॐ", tamilWish:"பிறந்தநாள் வாழ்த்துக்கள்!", tamilSub:"விநாயகரின் அருளால் உங்கள் வாழ்வில் வளம் பெருகட்டும்.", bg1:"#0a2e1a",bg2:"#1a5c35",bg3:"#0a2e1a",accent:"#a5d6a7",accentLight:"#c8e6c9",borderGold:"#4caf50",textMain:"#f0fff4",textSub:"rgba(165,214,167,0.85)",previewBg:"linear-gradient(160deg,#0a2e1a 0%,#1a5c35 50%,#0a2e1a 100%)",previewAccent:"#a5d6a7" },
  { id:"shiva_silver",  faith:"hindu",    name:"Shiva Silver",      emoji:"🔱", kolam:"☽ ✦ ☾", tamilWish:"மகிழ்வான பிறந்தநாள்!", tamilSub:"சிவபெருமான் அருளால் உங்கள் வாழ்க்கை வளமாக திகழட்டும்.", bg1:"#1a1a2e",bg2:"#2d2d4e",bg3:"#1a1a2e",accent:"#e0e0e0",accentLight:"#f5f5f5",borderGold:"#9e9e9e",textMain:"#f5f5f5",textSub:"rgba(224,224,224,0.85)",previewBg:"linear-gradient(160deg,#1a1a2e 0%,#2d2d4e 50%,#1a1a2e 100%)",previewAccent:"#e0e0e0" },
  { id:"surya_orange",  faith:"hindu",    name:"Surya Sunrise",     emoji:"🌅", kolam:"☀ ✦ ☀", tamilWish:"இனிய பிறந்தநாள்!", tamilSub:"சூரியனைப் போல் உங்கள் வாழ்வு என்றும் ஒளிர்ந்து வளரட்டும்.", bg1:"#2c0a00",bg2:"#7a2800",bg3:"#1a0a00",accent:"#ff9800",accentLight:"#ffcc02",borderGold:"#e65100",textMain:"#fff8e1",textSub:"rgba(255,152,0,0.9)",previewBg:"linear-gradient(160deg,#2c0a00 0%,#7a2800 60%,#1a0a00 100%)",previewAccent:"#ff9800" },
  { id:"lotus_ivory",   faith:"hindu",    name:"Lotus Ivory",       emoji:"🪷", kolam:"❁ ✦ ❁", tamilWish:"பிறந்தநாள் இனிய வாழ்த்துக்கள்!", tamilSub:"தாமரை மலரைப் போல் உங்கள் வாழ்க்கை மலர்ந்திட வாழ்த்துகிறோம்.", bg1:"#2a1a08",bg2:"#4e3010",bg3:"#2a1a08",accent:"#f5deb3",accentLight:"#fffacd",borderGold:"#c8a96e",textMain:"#fffdf7",textSub:"rgba(245,222,179,0.85)",previewBg:"linear-gradient(160deg,#2a1a08 0%,#4e3010 50%,#2a1a08 100%)",previewAccent:"#f5deb3" },
  { id:"crescent_teal", faith:"muslim",   name:"Crescent Teal",     emoji:"🌙", kolam:"☪ ✦ ☪", tamilWish:"இனிய பிறந்தநாள் வாழ்த்துக்கள்!", tamilSub:"அல்லாஹ்வின் அருளால் உங்கள் வாழ்க்கை செழிக்கட்டும்.", bg1:"#003333",bg2:"#005555",bg3:"#001a1a",accent:"#4dd0c4",accentLight:"#b2dfdb",borderGold:"#00897b",textMain:"#e0f7f4",textSub:"rgba(77,208,196,0.85)",previewBg:"linear-gradient(160deg,#003333 0%,#005555 50%,#001a1a 100%)",previewAccent:"#4dd0c4" },
  { id:"mosque_emerald",faith:"muslim",   name:"Mosque Emerald",    emoji:"🕌", kolam:"✦ ☪ ✦", tamilWish:"மகிழ்ச்சியான பிறந்தநாள்!", tamilSub:"இறைவன் உங்களுக்கு நீண்ட ஆயுளும் நலமும் அருள்வாராக.", bg1:"#001a00",bg2:"#004d00",bg3:"#001a00",accent:"#80cbc4",accentLight:"#b2dfdb",borderGold:"#26a69a",textMain:"#e8f5e9",textSub:"rgba(128,203,196,0.85)",previewBg:"linear-gradient(160deg,#001a00 0%,#004d00 50%,#001a00 100%)",previewAccent:"#80cbc4" },
  { id:"star_gold",     faith:"muslim",   name:"Star & Gold",       emoji:"⭐", kolam:"✦ ⭐ ✦", tamilWish:"இனிய பிறந்தநாள் வாழ்த்துக்கள்!", tamilSub:"அல்லாஹ்வின் ரஹ்மத்து உங்களுக்கு என்றும் துணையாக இருக்கட்டும்.", bg1:"#1a1200",bg2:"#3d2b00",bg3:"#1a1200",accent:"#ffd54f",accentLight:"#ffecb3",borderGold:"#ffb300",textMain:"#fff8e1",textSub:"rgba(255,213,79,0.85)",previewBg:"linear-gradient(160deg,#1a1200 0%,#3d2b00 50%,#1a1200 100%)",previewAccent:"#ffd54f" },
  { id:"sabr_blue",     faith:"muslim",   name:"Sabr Blue",         emoji:"📿", kolam:"☪ ◈ ☪", tamilWish:"பிறந்தநாள் வாழ்த்துக்கள்!", tamilSub:"அல்லாஹ் உங்களுக்கு சுகம், செழிப்பு மற்றும் பாதுகாப்பு அருள்வாராக.", bg1:"#001428",bg2:"#002855",bg3:"#001428",accent:"#81d4fa",accentLight:"#b3e5fc",borderGold:"#0288d1",textMain:"#e1f5fe",textSub:"rgba(129,212,250,0.85)",previewBg:"linear-gradient(160deg,#001428 0%,#002855 50%,#001428 100%)",previewAccent:"#81d4fa" },
  { id:"maghrib_rose",  faith:"muslim",   name:"Maghrib Rose",      emoji:"🌹", kolam:"✾ ☪ ✾", tamilWish:"இனிய பிறந்தநாள்!", tamilSub:"உங்கள் வாழ்க்கை ரோஜாவைப் போல் மலர்ந்திட இறைவன் அருள்வாராக.", bg1:"#1a0010",bg2:"#3d0025",bg3:"#1a0010",accent:"#f48fb1",accentLight:"#fce4ec",borderGold:"#c2185b",textMain:"#fce4ec",textSub:"rgba(244,143,177,0.85)",previewBg:"linear-gradient(160deg,#1a0010 0%,#3d0025 50%,#1a0010 100%)",previewAccent:"#f48fb1" },
  { id:"noor_pearl",    faith:"muslim",   name:"Noor Pearl",        emoji:"🤍", kolam:"◈ ☪ ◈", tamilWish:"பிறந்தநாள் நல் வாழ்த்துக்கள்!", tamilSub:"இறைவனின் நூர் உங்கள் வாழ்வை ஒளிர்விக்கட்டும்.", bg1:"#1a1a1a",bg2:"#333333",bg3:"#1a1a1a",accent:"#f5f5f5",accentLight:"#ffffff",borderGold:"#bdbdbd",textMain:"#fafafa",textSub:"rgba(245,245,245,0.85)",previewBg:"linear-gradient(160deg,#1a1a1a 0%,#333333 50%,#1a1a1a 100%)",previewAccent:"#f5f5f5" },
  { id:"cross_purple",  faith:"christian",name:"Grace Purple",      emoji:"✝️", kolam:"✝ ✦ ✝", tamilWish:"இனிய பிறந்தநாள் வாழ்த்துக்கள்!", tamilSub:"இயேசுவின் அருளால் உங்கள் வாழ்க்கை ஆசீர்வதிக்கப்படட்டும்.", bg1:"#1a0028",bg2:"#3d005a",bg3:"#1a0028",accent:"#ce93d8",accentLight:"#f3e5f5",borderGold:"#8e24aa",textMain:"#f3e5f5",textSub:"rgba(206,147,216,0.85)",previewBg:"linear-gradient(160deg,#1a0028 0%,#3d005a 50%,#1a0028 100%)",previewAccent:"#ce93d8" },
  { id:"holy_gold",     faith:"christian",name:"Holy Gold",         emoji:"🙏", kolam:"✝ ◈ ✝", tamilWish:"பிறந்தநாள் வாழ்த்துக்கள்!", tamilSub:"தேவனுடைய கிருபை உங்களுக்கு என்றும் துணையாக இருக்கட்டும்.", bg1:"#1a1400",bg2:"#3d3000",bg3:"#1a1400",accent:"#ffe082",accentLight:"#fff8e1",borderGold:"#ffa000",textMain:"#fff8e1",textSub:"rgba(255,224,130,0.85)",previewBg:"linear-gradient(160deg,#1a1400 0%,#3d3000 50%,#1a1400 100%)",previewAccent:"#ffe082" },
  { id:"dove_white",    faith:"christian",name:"Dove of Peace",     emoji:"🕊️", kolam:"✦ 🕊 ✦", tamilWish:"இனிய பிறந்தநாள்!", tamilSub:"இறைவனின் சமாதானம் உங்கள் இதயத்தில் நிலைத்திருக்கட்டும்.", bg1:"#001428",bg2:"#003366",bg3:"#001428",accent:"#e3f2fd",accentLight:"#ffffff",borderGold:"#90caf9",textMain:"#e3f2fd",textSub:"rgba(227,242,253,0.85)",previewBg:"linear-gradient(160deg,#001428 0%,#003366 50%,#001428 100%)",previewAccent:"#bbdefb" },
  { id:"advent_red",    faith:"christian",name:"Advent Crimson",    emoji:"🕯️", kolam:"✝ ❋ ✝", tamilWish:"மகிழ்ச்சியான பிறந்தநாள் வாழ்த்துக்கள்!", tamilSub:"ஆண்டவரின் அன்பும் அருளும் உங்களுக்கு எப்போதும் நிறைந்திருக்கட்டும்.", bg1:"#1a0000",bg2:"#4a0000",bg3:"#1a0000",accent:"#ef9a9a",accentLight:"#ffcdd2",borderGold:"#c62828",textMain:"#fff3f3",textSub:"rgba(239,154,154,0.85)",previewBg:"linear-gradient(160deg,#1a0000 0%,#4a0000 50%,#1a0000 100%)",previewAccent:"#ef9a9a" },
  { id:"trinity_green", faith:"christian",name:"Trinity Green",     emoji:"🌿", kolam:"✦ ✝ ✦", tamilWish:"பிறந்தநாள் இனிய வாழ்த்துக்கள்!", tamilSub:"தேவனுடைய ஆசீர்வாதம் உங்கள் வாழ்க்கையை நிரப்பட்டும்.", bg1:"#001a08",bg2:"#003314",bg3:"#001a08",accent:"#a5d6a7",accentLight:"#c8e6c9",borderGold:"#388e3c",textMain:"#e8f5e9",textSub:"rgba(165,214,167,0.85)",previewBg:"linear-gradient(160deg,#001a08 0%,#003314 50%,#001a08 100%)",previewAccent:"#a5d6a7" },
  { id:"heaven_blue",   faith:"christian",name:"Heaven Blue",       emoji:"💙", kolam:"✝ ☁ ✝", tamilWish:"இனிய பிறந்தநாள் வாழ்த்துக்கள்!", tamilSub:"வான்மீதி தேவனின் ஆசீர்வாதம் உங்களுக்கு மழையாய் பொழியட்டும்.", bg1:"#001833",bg2:"#003060",bg3:"#001833",accent:"#90caf9",accentLight:"#e3f2fd",borderGold:"#1565c0",textMain:"#e3f2fd",textSub:"rgba(144,202,249,0.85)",previewBg:"linear-gradient(160deg,#001833 0%,#003060 50%,#001833 100%)",previewAccent:"#90caf9" },
];

const ANNIVERSARY_TEMPLATES: Template[] = [
  { id:"ann_kanchi",    faith:"hindu",    name:"Kanchipuram Gold",  emoji:"🪔", kolam:"✦ ◈ ✦", tamilWish:"இனிய திருமண நாள் வாழ்த்துக்கள்!", tamilSub:"இறைவன் அருளால் உங்கள் இல்லறம் என்றும் இனிதே சிறக்கட்டும்.", bg1:"#3d1a00",bg2:"#7a3500",bg3:"#3d1a00",accent:"#f5c842",accentLight:"#ffe87a",borderGold:"#c8971a",textMain:"#fff8e7",textSub:"rgba(245,200,66,0.82)",previewBg:"linear-gradient(160deg,#3d1a00 0%,#7a3500 50%,#3d1a00 100%)",previewAccent:"#f5c842" },
  { id:"ann_murugan",   faith:"hindu",    name:"Murugan Crimson",   emoji:"🌺", kolam:"❋ ✿ ❋", tamilWish:"திருமண நாள் வாழ்த்துக்கள்!", tamilSub:"முருகனின் ஆசியுடன் உங்கள் இல்லறம் பொன்னாய் விளங்கட்டும்.", bg1:"#4a0000",bg2:"#8b0000",bg3:"#4a0000",accent:"#ffd700",accentLight:"#ffe97a",borderGold:"#cc8800",textMain:"#fff5f5",textSub:"rgba(255,215,0,0.85)",previewBg:"linear-gradient(160deg,#4a0000 0%,#8b0000 50%,#4a0000 100%)",previewAccent:"#ffd700" },
  { id:"ann_thirumal",  faith:"hindu",    name:"Thirumal Sapphire", emoji:"🦚", kolam:"☸ ✦ ☸", tamilWish:"இனிய திருமண நாள் வாழ்த்துக்கள்!", tamilSub:"திருமாலின் அருளால் உங்கள் தாம்பத்யம் நீடித்திருக்கட்டும்.", bg1:"#0a1628",bg2:"#1a3a6b",bg3:"#0a1628",accent:"#4fc3f7",accentLight:"#b3e5fc",borderGold:"#0288d1",textMain:"#e8f4fd",textSub:"rgba(79,195,247,0.85)",previewBg:"linear-gradient(160deg,#0a1628 0%,#1a3a6b 50%,#0a1628 100%)",previewAccent:"#4fc3f7" },
  { id:"ann_ambal",     faith:"hindu",    name:"Ambal Rose",        emoji:"🌸", kolam:"✾ ❀ ✾", tamilWish:"திருமண நாள் இனிய வாழ்த்துக்கள்!", tamilSub:"அன்னையின் அருளால் உங்கள் அன்பு வாழ்வு மலர்ந்திருக்கட்டும்.", bg1:"#3b0020",bg2:"#6b0035",bg3:"#3b0020",accent:"#ff9fc8",accentLight:"#ffcce0",borderGold:"#e07090",textMain:"#fff0f5",textSub:"rgba(255,159,200,0.85)",previewBg:"linear-gradient(160deg,#3b0020 0%,#6b0035 50%,#3b0020 100%)",previewAccent:"#ff9fc8" },
  { id:"ann_ganesha",   faith:"hindu",    name:"Ganesha Emerald",   emoji:"🐘", kolam:"ॐ ✦ ॐ", tamilWish:"திருமண நாள் வாழ்த்துக்கள்!", tamilSub:"விநாயகர் ஆசியுடன் உங்கள் இல்லறம் வளம் பெருகட்டும்.", bg1:"#0a2e1a",bg2:"#1a5c35",bg3:"#0a2e1a",accent:"#a5d6a7",accentLight:"#c8e6c9",borderGold:"#4caf50",textMain:"#f0fff4",textSub:"rgba(165,214,167,0.85)",previewBg:"linear-gradient(160deg,#0a2e1a 0%,#1a5c35 50%,#0a2e1a 100%)",previewAccent:"#a5d6a7" },
  { id:"ann_shiva",     faith:"hindu",    name:"Shiva Silver",      emoji:"🔱", kolam:"☽ ✦ ☾", tamilWish:"இனிய திருமண நாள்!", tamilSub:"சிவபார்வதியின் அருளால் உங்கள் அன்பு என்றும் நிலைக்கட்டும்.", bg1:"#1a1a2e",bg2:"#2d2d4e",bg3:"#1a1a2e",accent:"#e0e0e0",accentLight:"#f5f5f5",borderGold:"#9e9e9e",textMain:"#f5f5f5",textSub:"rgba(224,224,224,0.85)",previewBg:"linear-gradient(160deg,#1a1a2e 0%,#2d2d4e 50%,#1a1a2e 100%)",previewAccent:"#e0e0e0" },
  { id:"ann_surya",     faith:"hindu",    name:"Surya Sunrise",     emoji:"🌅", kolam:"☀ ✦ ☀", tamilWish:"திருமண நாள் வாழ்த்துக்கள்!", tamilSub:"சூரியனைப் போல் உங்கள் அன்பு என்றும் ஒளிர்ந்திருக்கட்டும்.", bg1:"#2c0a00",bg2:"#7a2800",bg3:"#1a0a00",accent:"#ff9800",accentLight:"#ffcc02",borderGold:"#e65100",textMain:"#fff8e1",textSub:"rgba(255,152,0,0.9)",previewBg:"linear-gradient(160deg,#2c0a00 0%,#7a2800 60%,#1a0a00 100%)",previewAccent:"#ff9800" },
  { id:"ann_lotus",     faith:"hindu",    name:"Lotus Ivory",       emoji:"🪷", kolam:"❁ ✦ ❁", tamilWish:"திருமண நாள் இனிய வாழ்த்துக்கள்!", tamilSub:"தாமரையைப் போல் உங்கள் இல்லறம் மலர்ந்திருக்கட்டும்.", bg1:"#2a1a08",bg2:"#4e3010",bg3:"#2a1a08",accent:"#f5deb3",accentLight:"#fffacd",borderGold:"#c8a96e",textMain:"#fffdf7",textSub:"rgba(245,222,179,0.85)",previewBg:"linear-gradient(160deg,#2a1a08 0%,#4e3010 50%,#2a1a08 100%)",previewAccent:"#f5deb3" },
  { id:"ann_crescent",  faith:"muslim",   name:"Crescent Teal",     emoji:"🌙", kolam:"☪ ✦ ☪", tamilWish:"திருமண நாள் வாழ்த்துக்கள்!", tamilSub:"அல்லாஹ் உங்கள் இல்லறத்தை இன்னும் வலிமையாக்கட்டும்.", bg1:"#003333",bg2:"#005555",bg3:"#001a1a",accent:"#4dd0c4",accentLight:"#b2dfdb",borderGold:"#00897b",textMain:"#e0f7f4",textSub:"rgba(77,208,196,0.85)",previewBg:"linear-gradient(160deg,#003333 0%,#005555 50%,#001a1a 100%)",previewAccent:"#4dd0c4" },
  { id:"ann_mosque",    faith:"muslim",   name:"Mosque Emerald",    emoji:"🕌", kolam:"✦ ☪ ✦", tamilWish:"திருமண நாள் மகிழ்வான வாழ்த்துக்கள்!", tamilSub:"அல்லாஹ்வின் ரஹ்மத்தில் உங்கள் அன்பு நிலைத்திருக்கட்டும்.", bg1:"#001a00",bg2:"#004d00",bg3:"#001a00",accent:"#80cbc4",accentLight:"#b2dfdb",borderGold:"#26a69a",textMain:"#e8f5e9",textSub:"rgba(128,203,196,0.85)",previewBg:"linear-gradient(160deg,#001a00 0%,#004d00 50%,#001a00 100%)",previewAccent:"#80cbc4" },
  { id:"ann_star_gold", faith:"muslim",   name:"Star & Gold",       emoji:"⭐", kolam:"✦ ⭐ ✦", tamilWish:"திருமண நாள் வாழ்த்துக்கள்!", tamilSub:"அல்லாஹ் உங்கள் கூட்டு வாழ்வை ஆசீர்வதிக்கட்டும்.", bg1:"#1a1200",bg2:"#3d2b00",bg3:"#1a1200",accent:"#ffd54f",accentLight:"#ffecb3",borderGold:"#ffb300",textMain:"#fff8e1",textSub:"rgba(255,213,79,0.85)",previewBg:"linear-gradient(160deg,#1a1200 0%,#3d2b00 50%,#1a1200 100%)",previewAccent:"#ffd54f" },
  { id:"ann_sabr",      faith:"muslim",   name:"Sabr Blue",         emoji:"📿", kolam:"☪ ◈ ☪", tamilWish:"திருமண நாள் வாழ்த்துக்கள்!", tamilSub:"அல்லாஹ் உங்கள் தாம்பத்யத்தை பாதுகாத்து ஆசீர்வதிக்கட்டும்.", bg1:"#001428",bg2:"#002855",bg3:"#001428",accent:"#81d4fa",accentLight:"#b3e5fc",borderGold:"#0288d1",textMain:"#e1f5fe",textSub:"rgba(129,212,250,0.85)",previewBg:"linear-gradient(160deg,#001428 0%,#002855 50%,#001428 100%)",previewAccent:"#81d4fa" },
  { id:"ann_maghrib",   faith:"muslim",   name:"Maghrib Rose",      emoji:"🌹", kolam:"✾ ☪ ✾", tamilWish:"திருமண நாள் இனிய வாழ்த்துக்கள்!", tamilSub:"ரோஜாவைப் போல் உங்கள் அன்பு என்றும் மலர்ந்திருக்கட்டும்.", bg1:"#1a0010",bg2:"#3d0025",bg3:"#1a0010",accent:"#f48fb1",accentLight:"#fce4ec",borderGold:"#c2185b",textMain:"#fce4ec",textSub:"rgba(244,143,177,0.85)",previewBg:"linear-gradient(160deg,#1a0010 0%,#3d0025 50%,#1a0010 100%)",previewAccent:"#f48fb1" },
  { id:"ann_noor",      faith:"muslim",   name:"Noor Pearl",        emoji:"🤍", kolam:"◈ ☪ ◈", tamilWish:"திருமண நாள் வாழ்த்துக்கள்!", tamilSub:"இறைவனின் நூர் உங்கள் இல்லறத்தை என்றும் ஒளிர்விக்கட்டும்.", bg1:"#1a1a1a",bg2:"#333333",bg3:"#1a1a1a",accent:"#f5f5f5",accentLight:"#ffffff",borderGold:"#bdbdbd",textMain:"#fafafa",textSub:"rgba(245,245,245,0.85)",previewBg:"linear-gradient(160deg,#1a1a1a 0%,#333333 50%,#1a1a1a 100%)",previewAccent:"#f5f5f5" },
  { id:"ann_cross",     faith:"christian",name:"Grace Purple",      emoji:"✝️", kolam:"✝ ✦ ✝", tamilWish:"திருமண நாள் வாழ்த்துக்கள்!", tamilSub:"இயேசுவின் அன்பால் உங்கள் இல்லறம் ஆசீர்வதிக்கப்படட்டும்.", bg1:"#1a0028",bg2:"#3d005a",bg3:"#1a0028",accent:"#ce93d8",accentLight:"#f3e5f5",borderGold:"#8e24aa",textMain:"#f3e5f5",textSub:"rgba(206,147,216,0.85)",previewBg:"linear-gradient(160deg,#1a0028 0%,#3d005a 50%,#1a0028 100%)",previewAccent:"#ce93d8" },
  { id:"ann_holy_gold", faith:"christian",name:"Holy Gold",         emoji:"🙏", kolam:"✝ ◈ ✝", tamilWish:"திருமண நாள் வாழ்த்துக்கள்!", tamilSub:"தேவன் உங்கள் அன்பு வாழ்வை என்றும் காத்தருள்வாராக.", bg1:"#1a1400",bg2:"#3d3000",bg3:"#1a1400",accent:"#ffe082",accentLight:"#fff8e1",borderGold:"#ffa000",textMain:"#fff8e1",textSub:"rgba(255,224,130,0.85)",previewBg:"linear-gradient(160deg,#1a1400 0%,#3d3000 50%,#1a1400 100%)",previewAccent:"#ffe082" },
  { id:"ann_dove",      faith:"christian",name:"Dove of Peace",     emoji:"🕊️", kolam:"✦ 🕊 ✦", tamilWish:"திருமண நாள் இனிய வாழ்த்துக்கள்!", tamilSub:"இறைவனின் சமாதானம் உங்கள் இல்லத்தில் நிறைந்திருக்கட்டும்.", bg1:"#001428",bg2:"#003366",bg3:"#001428",accent:"#e3f2fd",accentLight:"#ffffff",borderGold:"#90caf9",textMain:"#e3f2fd",textSub:"rgba(227,242,253,0.85)",previewBg:"linear-gradient(160deg,#001428 0%,#003366 50%,#001428 100%)",previewAccent:"#bbdefb" },
  { id:"ann_advent",    faith:"christian",name:"Advent Crimson",    emoji:"🕯️", kolam:"✝ ❋ ✝", tamilWish:"திருமண நாள் வாழ்த்துக்கள்!", tamilSub:"ஆண்டவரின் அன்பு உங்கள் இல்லறத்தை என்றும் வெளிச்சமாக்கட்டும்.", bg1:"#1a0000",bg2:"#4a0000",bg3:"#1a0000",accent:"#ef9a9a",accentLight:"#ffcdd2",borderGold:"#c62828",textMain:"#fff3f3",textSub:"rgba(239,154,154,0.85)",previewBg:"linear-gradient(160deg,#1a0000 0%,#4a0000 50%,#1a0000 100%)",previewAccent:"#ef9a9a" },
  { id:"ann_trinity",   faith:"christian",name:"Trinity Green",     emoji:"🌿", kolam:"✦ ✝ ✦", tamilWish:"திருமண நாள் வாழ்த்துக்கள்!", tamilSub:"தேவனுடைய ஆசீர்வாதம் உங்கள் தாம்பத்யத்தை நிரப்பட்டும்.", bg1:"#001a08",bg2:"#003314",bg3:"#001a08",accent:"#a5d6a7",accentLight:"#c8e6c9",borderGold:"#388e3c",textMain:"#e8f5e9",textSub:"rgba(165,214,167,0.85)",previewBg:"linear-gradient(160deg,#001a08 0%,#003314 50%,#001a08 100%)",previewAccent:"#a5d6a7" },
  { id:"ann_heaven",    faith:"christian",name:"Heaven Blue",       emoji:"💙", kolam:"✝ ☁ ✝", tamilWish:"திருமண நாள் வாழ்த்துக்கள்!", tamilSub:"வான்மீதி தேவனின் ஆசீர்வாதம் உங்கள் இல்லத்தில் மழையாய் பொழியட்டும்.", bg1:"#001833",bg2:"#003060",bg3:"#001833",accent:"#90caf9",accentLight:"#e3f2fd",borderGold:"#1565c0",textMain:"#e3f2fd",textSub:"rgba(144,202,249,0.85)",previewBg:"linear-gradient(160deg,#001833 0%,#003060 50%,#001833 100%)",previewAccent:"#90caf9" },
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

const FAITH_FILTERS = [
  { id:"all", label:"All", icon:"✨" },
  { id:"hindu", label:"Hindu", icon:"🪔" },
  { id:"muslim", label:"Muslim", icon:"🌙" },
  { id:"christian", label:"Christian", icon:"✝️" },
] as const;

// ─── WhatsApp Icon ────────────────────────────────────────────────────────────
const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

// ─── Canvas Helpers ───────────────────────────────────────────────────────────
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number, align: CanvasTextAlign = "center") {
  const words = text.split(" "); let line = "", curY = y;
  ctx.textAlign = align;
  for (const w of words) {
    const test = line + w + " ";
    if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line.trim(), x, curY); line = w+" "; curY+=lh; }
    else line = test;
  }
  ctx.fillText(line.trim(), x, curY);
}
function drawDivider(ctx: CanvasRenderingContext2D, cx: number, y: number, hw: number, color: string) {
  ctx.strokeStyle = color+"55"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx-hw,y); ctx.lineTo(cx-55,y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+55,y); ctx.lineTo(cx+hw,y); ctx.stroke();
  ctx.font = "26px serif"; ctx.fillStyle = color; ctx.textAlign = "center"; ctx.fillText("✦", cx, y+9);
}
function drawFlower(ctx: CanvasRenderingContext2D, cx: number, cy: number, accent: string, light: string) {
  for (let i=0; i<8; i++) {
    const a=(i/8)*Math.PI*2;
    ctx.beginPath(); ctx.ellipse(cx+Math.cos(a)*17, cy+Math.sin(a)*17, 7, 4, a, 0, Math.PI*2);
    ctx.fillStyle = accent; ctx.fill();
  }
  ctx.beginPath(); ctx.arc(cx,cy,9,0,Math.PI*2); ctx.fillStyle = light; ctx.fill();
}

// ─── Date Utilities ───────────────────────────────────────────────────────────
function getYears(dob: string) {
  const b=new Date(dob), n=new Date();
  let a=n.getFullYear()-b.getFullYear();
  if (n.getMonth()<b.getMonth()||(n.getMonth()===b.getMonth()&&n.getDate()<b.getDate())) a--;
  return a+1;
}
function getNextDate(dob: string) {
  const b=new Date(dob), n=new Date();
  const t=new Date(n.getFullYear(),b.getMonth(),b.getDate());
  return (t>=n?t:new Date(n.getFullYear()+1,b.getMonth(),b.getDate()))
    .toLocaleDateString("en-IN",{day:"numeric",month:"short"});
}
function daysUntil(dob: string) {
  const b=new Date(dob), n=new Date(); n.setHours(0,0,0,0);
  const t=new Date(n.getFullYear(),b.getMonth(),b.getDate());
  const next=t>=n?t:new Date(n.getFullYear()+1,b.getMonth(),b.getDate());
  return Math.ceil((next.getTime()-n.getTime())/86400000);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BirthdaysPage() {
  const [activeTab, setActiveTab] = useState<"birthdays"|"anniversaries">("birthdays");
  const [birthdays, setBirthdays] = useState<CelebrationItem[]>([]);
  const [anniversaries, setAnniversaries] = useState<CelebrationItem[]>([]);
  const [stats, setStats] = useState<Stats>({today:0,thisWeek:0,thisMonth:0,total:0});
  const [annStats, setAnnStats] = useState<Stats>({today:0,thisWeek:0,thisMonth:0,total:0});
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("month");
  const [selectedPerson, setSelectedPerson] = useState<CelebrationItem|null>(null);
  const [faithFilter, setFaithFilter] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(BIRTHDAY_TEMPLATES[0]);
  const [message, setMessage] = useState(BIRTHDAY_MESSAGES[0]);
  const [senderName, setSenderName] = useState("Sampath Kumar");
  const [generating, setGenerating] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle"|"success"|"error">("idle");
  const [clientPhoto, setClientPhoto] = useState<string|null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const templates = activeTab==="birthdays" ? BIRTHDAY_TEMPLATES : ANNIVERSARY_TEMPLATES;
  const messages  = activeTab==="birthdays" ? BIRTHDAY_MESSAGES  : ANNIVERSARY_MESSAGES;
  const filteredTemplates = faithFilter==="all" ? templates : templates.filter(t=>t.faith===faithFilter);

  useEffect(()=>{ fetchBirthdays(); fetchAnniversaries(); },[range]);

  async function fetchBirthdays() {
    setLoading(true);
    try { const r=await fetch(`/api/birthdays?range=${range}`); const d=await r.json(); setBirthdays(d.birthdays||[]); if(d.stats) setStats(d.stats); }
    catch{} finally { setLoading(false); }
  }
  async function fetchAnniversaries() {
    try { const r=await fetch(`/api/anniversaries?range=${range}`); const d=await r.json(); setAnniversaries(d.anniversaries||[]); if(d.stats) setAnnStats(d.stats); }
    catch{}
  }

  const openGreeting = (person: CelebrationItem) => {
    const tpls = activeTab==="birthdays" ? BIRTHDAY_TEMPLATES : ANNIVERSARY_TEMPLATES;
    setSelectedPerson(person);
    setSelectedTemplate(tpls[0]);
    setMessage(activeTab==="birthdays" ? BIRTHDAY_MESSAGES[0] : ANNIVERSARY_MESSAGES[0]);
    setFaithFilter("all");
    setShareStatus("idle");
    setClientPhoto(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setClientPhoto(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  // ── Canvas generation ────────────────────────────────────────────────────
 const generateCardBlob = (): Promise<Blob> => new Promise(async (resolve, reject) => {
  if (!selectedPerson) return reject("No person");
  const tpl = selectedTemplate;
  const years = getYears(selectedPerson.date_of_birth);
  const W = 1080, H = 1440;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const bg = ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,tpl.bg1); bg.addColorStop(0.5,tpl.bg2); bg.addColorStop(1,tpl.bg3);
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

  const g1=ctx.createRadialGradient(W*.15,H*.08,0,W*.15,H*.08,400);
  g1.addColorStop(0,tpl.accent+"1a"); g1.addColorStop(1,"transparent");
  ctx.fillStyle=g1; ctx.fillRect(0,0,W,H);

  const M=44;
  ctx.strokeStyle=tpl.accent; ctx.lineWidth=3; ctx.strokeRect(M,M,W-M*2,H-M*2);
  ctx.strokeStyle=tpl.accent+"44"; ctx.lineWidth=1; ctx.strokeRect(M+18,M+18,W-(M+18)*2,H-(M+18)*2);

  drawFlower(ctx,M+20,M+20,tpl.accent,tpl.accentLight);
  drawFlower(ctx,W-M-20,M+20,tpl.accent,tpl.accentLight);
  drawFlower(ctx,M+20,H-M-20,tpl.accent,tpl.accentLight);
  drawFlower(ctx,W-M-20,H-M-20,tpl.accent,tpl.accentLight);

  const bY=M+34;
  ctx.fillStyle=tpl.accent+"1a"; ctx.fillRect(M+20,bY,W-(M+20)*2,78);
  ctx.font="bold 34px serif"; ctx.fillStyle=tpl.accent; ctx.textAlign="center";
  ctx.fillText(tpl.kolam, W/2, bY+52);

  ctx.font="100px serif"; ctx.textAlign="center";
  ctx.fillText(tpl.emoji, W/2, bY+190);

  // ── Tamil wish — auto-scale to never overflow
  ctx.save();
  ctx.font="bold 48px 'Noto Sans Tamil',serif";
  ctx.fillStyle=tpl.accent; ctx.textAlign="center";
  const tamilW = ctx.measureText(tpl.tamilWish).width;
  if (tamilW > W-120) ctx.font=`bold ${Math.floor(48*(W-120)/tamilW)}px 'Noto Sans Tamil',serif`;
  ctx.fillText(tpl.tamilWish, W/2, bY+278);
  ctx.restore();

  ctx.font="28px 'Noto Sans Tamil',serif";
  ctx.fillStyle=tpl.textSub; ctx.textAlign="center";
  wrapText(ctx, tpl.tamilSub, W/2, bY+326, W-200, 42);

  drawDivider(ctx, W/2, bY+410, 360, tpl.accent);
  ctx.font="italic 30px Georgia,serif"; ctx.fillStyle=tpl.textSub; ctx.textAlign="center";
  ctx.fillText(
    activeTab==="birthdays"?"✦  Birthday Wishes to  ✦":"✦  Anniversary Wishes to  ✦",
    W/2, bY+452
  );

  // ── PROFILE ROW: photo LEFT, name+years RIGHT
  const rowTop = bY+490;
  const photoR = 110;
  const photoX = M+90+photoR;
  const photoY = rowTop+photoR+10;

  ctx.save();
  ctx.beginPath(); ctx.arc(photoX,photoY,photoR,0,Math.PI*2); ctx.clip();
  if (clientPhoto) {
    await new Promise<void>(res=>{
      const img=new Image();
      img.onload=()=>{ ctx.drawImage(img,photoX-photoR,photoY-photoR,photoR*2,photoR*2); res(); };
      img.onerror=()=>res();
      img.src=clientPhoto;
    });
  } else {
    const ig=ctx.createLinearGradient(photoX-photoR,photoY-photoR,photoX+photoR,photoY+photoR);
    ig.addColorStop(0,tpl.accent+"cc"); ig.addColorStop(1,tpl.bg2);
    ctx.fillStyle=ig; ctx.fillRect(photoX-photoR,photoY-photoR,photoR*2,photoR*2);
    ctx.font=`bold 90px Georgia,serif`; ctx.fillStyle=tpl.textMain; ctx.textAlign="center";
    ctx.fillText(selectedPerson.name.charAt(0).toUpperCase(), photoX, photoY+32);
  }
  ctx.restore();

  [photoR+20, photoR+10, photoR+3].forEach((r,i)=>{
    ctx.beginPath(); ctx.arc(photoX,photoY,r,0,Math.PI*2);
    ctx.strokeStyle=tpl.accent+(["18","44","cc"][i]); ctx.lineWidth=[1.5,2,5][i]; ctx.stroke();
  });

  const textX = photoX+photoR+60;
  const textMaxW = W-textX-M-40;
  const textCX = textX+textMaxW/2;

  const nameStr = selectedPerson.name;
  const nfs = nameStr.length>18?52:nameStr.length>12?64:76;
  ctx.font=`bold ${nfs}px Georgia,serif`;
  ctx.fillStyle=tpl.textMain; ctx.textAlign="center";
  ctx.shadowColor=tpl.accent; ctx.shadowBlur=16;
  if (ctx.measureText(nameStr).width <= textMaxW) {
    ctx.fillText(nameStr, textCX, photoY-20);
  } else {
    const words=nameStr.split(" "), mid=Math.ceil(words.length/2);
    ctx.fillText(words.slice(0,mid).join(" "), textCX, photoY-44);
    ctx.fillText(words.slice(mid).join(" "), textCX, photoY-44+nfs*1.2);
  }
  ctx.shadowBlur=0;

  const pillTxt = activeTab==="birthdays"?`🎂  Turning ${years} Years`:`💍  ${years} Years Together`;
  const pW=Math.min(textMaxW,360), pH=50, pX=textCX-pW/2, pY=photoY+28;
  ctx.fillStyle=tpl.accent+"20"; roundRect(ctx,pX,pY,pW,pH,25); ctx.fill();
  ctx.strokeStyle=tpl.accent+"55"; ctx.lineWidth=1.5; roundRect(ctx,pX,pY,pW,pH,25); ctx.stroke();
  ctx.font="500 24px Georgia,serif"; ctx.fillStyle=tpl.accent; ctx.textAlign="center";
  ctx.fillText(pillTxt, textCX, pY+32);

  const msgTopY = photoY+photoR+55;
  drawDivider(ctx, W/2, msgTopY, 340, tpl.accent);
  const mX=90, mY=msgTopY+28, mW=W-180, mH=190;
  ctx.fillStyle="rgba(255,255,255,0.03)"; roundRect(ctx,mX,mY,mW,mH,18); ctx.fill();
  ctx.strokeStyle=tpl.borderGold+"44"; ctx.lineWidth=1.5; roundRect(ctx,mX,mY,mW,mH,18); ctx.stroke();
  ctx.font="italic 30px Georgia,serif"; ctx.fillStyle=tpl.textMain; ctx.textAlign="center";
  wrapText(ctx,`"${message}"`,W/2,mY+48,mW-80,46);

  const sendY = mY+mH+55;
  drawDivider(ctx, W/2, sendY, 320, tpl.accent);
  ctx.font="bold 42px Georgia,serif"; ctx.fillStyle=tpl.accent; ctx.textAlign="center";
  ctx.fillText(senderName, W/2, sendY+66);
  ctx.font="400 26px Georgia,serif"; ctx.fillStyle=tpl.textSub;
  ctx.fillText("Maruthi Insure Care", W/2, sendY+104);

  const bbY=H-M-34-76;
  ctx.fillStyle=tpl.accent+"1a"; ctx.fillRect(M+20,bbY,W-(M+20)*2,76);
  ctx.font="300 20px Georgia,serif"; ctx.fillStyle=tpl.accent+"88"; ctx.textAlign="center";
  ctx.fillText("❁  Heritage of Trust Since 2011  ❁", W/2, bbY+47);

  canvas.toBlob(b=>b?resolve(b):reject("Blob null"),"image/png",0.97);
});

 const handleShare = async () => {
  if (!selectedPerson) return;
  setGenerating(true); setShareStatus("idle");
  try {
    const blob = await generateCardBlob();
    const prefix = activeTab==="birthdays"?"birthday":"anniversary";
    const fileName = `${prefix}-${selectedPerson.name.replace(/\s+/g,"-").toLowerCase()}.png`;

    const waText = [
      selectedTemplate.tamilWish,"",message,"",`— ${senderName}`,"Maruthi Insure Care"
    ].join("\n");

    const raw = (selectedPerson.phone||"").replace(/\D/g,"").replace(/^0+/,"");
    const waNumber = raw.length===10 ? `91${raw}` : raw;
    const waUrl = waNumber
      ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`
      : `https://wa.me/?text=${encodeURIComponent(waText)}`;

    // Download image
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href=objectUrl; a.download=fileName;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);

    // Open WhatsApp to the specific number
    setTimeout(()=>{
      window.open(waUrl,"_blank","noopener,noreferrer");
      URL.revokeObjectURL(objectUrl);
    }, 700);

    setShareStatus("success");
  } catch(err:any) {
    console.error("Share error:",err);
    setShareStatus("error");
  } finally {
    setGenerating(false);
  }
};

  const handleDownload = async () => {
    if (!selectedPerson) return;
    setGenerating(true);
    try {
      const blob=await generateCardBlob();
      const url=URL.createObjectURL(blob);
      const prefix=activeTab==="birthdays"?"birthday":"anniversary";
      const a=document.createElement("a"); a.href=url;
      a.download=`${prefix}-${selectedPerson.name.replace(/\s+/g,"-")}.png`; a.click();
      URL.revokeObjectURL(url);
    } finally { setGenerating(false); }
  };

  const currentStats = activeTab==="birthdays" ? stats : annStats;
  const currentList  = activeTab==="birthdays" ? birthdays : anniversaries;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Tamil:wght@400;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Page shell ── */
        .pg {
          font-family: 'Inter', sans-serif;
          background: #f5f6fa;
          min-height: 100vh;
          color: #0f172a;
        }

        /* ── Top nav bar ── */
        .topbar {
          background: #fff;
          border-bottom: 1px solid #e8eaf0;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .topbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .topbar-logo {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: linear-gradient(135deg, #1338be, #3b82f6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }
        .topbar-name {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.02em;
        }
        .topbar-sub {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 500;
        }
        .topbar-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 999px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          font-size: 11px;
          font-weight: 700;
          color: #16a34a;
          letter-spacing: .04em;
        }
        .live-pulse {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .5; transform: scale(.8); }
        }

        /* ── Content area ── */
        .content {
          max-width: 1100px;
          margin: 0 auto;
          padding: 28px 20px;
        }
        @media (min-width: 768px) { .content { padding: 32px 32px; } }

        /* ── Section header ── */
        .section-hdr {
          margin-bottom: 24px;
        }
        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(26px, 5vw, 42px);
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }
        .section-title em {
          color: #1e50d4;
          font-style: italic;
        }
        .section-sub {
          margin-top: 5px;
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }

        /* ── Tab switcher ── */
        .tab-bar {
          display: flex;
          background: #fff;
          border: 1px solid #e8eaf0;
          border-radius: 14px;
          padding: 5px;
          width: fit-content;
          margin-bottom: 24px;
          gap: 4px;
          box-shadow: 0 1px 4px rgba(0,0,0,.06);
        }
        .tab-btn {
          padding: 9px 20px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 13px;
          font-weight: 700;
          color: #94a3b8;
          background: transparent;
          transition: all .18s;
          letter-spacing: .01em;
        }
        .tab-btn.active {
          background: linear-gradient(135deg, #1338be, #2563eb);
          color: #fff;
          box-shadow: 0 4px 14px rgba(19,56,190,.22);
        }

        /* ── Stats grid ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        @media (min-width: 540px) { .stats-grid { grid-template-columns: repeat(4, 1fr); } }

        .stat-card {
          background: #fff;
          border: 1px solid #e8eaf0;
          border-radius: 16px;
          padding: 18px 16px;
          transition: transform .2s, box-shadow .2s;
          cursor: default;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.07); }
        .stat-card.primary {
          background: linear-gradient(135deg, #1338be, #2563eb);
          border-color: transparent;
          box-shadow: 0 8px 24px rgba(19,56,190,.28);
        }
        .stat-icon { font-size: 22px; margin-bottom: 10px; }
        .stat-value {
          font-size: clamp(28px, 5vw, 40px);
          font-weight: 800;
          color: #0f172a;
          line-height: 1;
          letter-spacing: -0.03em;
        }
        .stat-card.primary .stat-value { color: #fff; }
        .stat-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .15em;
          color: #94a3b8;
          margin-top: 5px;
        }
        .stat-card.primary .stat-label { color: rgba(255,255,255,.5); }

        /* ── Range filter ── */
        .range-filter {
          display: flex;
          gap: 2px;
          background: #fff;
          border: 1px solid #e8eaf0;
          border-radius: 10px;
          padding: 3px;
          width: fit-content;
          margin-bottom: 20px;
        }
        .range-btn {
          padding: 6px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .1em;
          color: #94a3b8;
          background: transparent;
          transition: all .15s;
        }
        .range-btn.active {
          background: linear-gradient(135deg, #1338be, #2563eb);
          color: #fff;
          box-shadow: 0 2px 8px rgba(19,56,190,.22);
        }

        /* ── List card ── */
        .list-card {
          background: #fff;
          border: 1px solid #e8eaf0;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 2px 16px rgba(0,0,0,.05);
        }
        .list-head {
          padding: 14px 20px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fafbff;
        }
        .list-head-title {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .16em;
          color: #1e3a8a;
        }
        .list-count {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
        }

        /* ── List row ── */
        .list-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 20px;
          border-bottom: 1px solid #f8fafc;
          cursor: pointer;
          transition: background .12s;
          position: relative;
        }
        .list-row:last-child { border-bottom: none; }
        .list-row:hover { background: #f8faff; }
        .list-row:hover .wish-btn { opacity: 1; transform: translateX(0); }

        .date-chip {
          min-width: 52px;
          height: 60px;
          border-radius: 13px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .date-chip-month {
          width: 100%;
          background: linear-gradient(135deg, #1338be, #2563eb);
          color: #fff;
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .1em;
          text-align: center;
          padding: 4px 0;
        }
        .date-chip-day {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 800;
          color: #1e3a8a;
          letter-spacing: -0.03em;
        }

        .row-info { flex: 1; min-width: 0; }
        .row-name {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 2px;
        }
        .row-meta {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .07em;
          color: #6366f1;
          margin-bottom: 3px;
        }
        .row-countdown {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          color: #2563eb;
        }
        .row-countdown.today {
          color: #d97706;
          animation: pulse 1.5s infinite;
        }
        .row-phone {
          font-size: 10px;
          color: #94a3b8;
          font-weight: 500;
          margin-top: 2px;
        }

        .wish-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 16px;
          border-radius: 12px;
          background: #25d366;
          color: #fff;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          flex-shrink: 0;
          box-shadow: 0 3px 12px rgba(37,211,102,.3);
          transition: all .15s;
          opacity: .85;
          transform: translateX(4px);
        }
        .wish-btn:hover { background: #1db954; transform: translateX(0) scale(1.02); opacity: 1; }

        .empty-state {
          padding: 64px 20px;
          text-align: center;
        }
        .empty-emoji { font-size: 40px; margin-bottom: 12px; }
        .empty-msg { font-size: 14px; font-weight: 600; color: #94a3b8; }
        .empty-hint { font-size: 12px; color: #cbd5e1; margin-top: 6px; font-weight: 400; }

        .spinner {
          width: 28px;
          height: 28px;
          border: 3px solid rgba(59,130,246,.15);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin .6s linear infinite;
          margin: 0 auto 12px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ═══════════════════════════════════════════════════════════════════
           MODAL
        ═══════════════════════════════════════════════════════════════════ */
        .overlay {
          position: fixed;
          inset: 0;
          z-index: 400;
          display: flex;
          align-items: flex-end;
        }
        @media (min-width: 768px) {
          .overlay { align-items: center; justify-content: center; padding: 20px; }
        }

        .overlay-bg {
          position: absolute;
          inset: 0;
          background: rgba(3, 7, 30, .75);
          backdrop-filter: blur(12px);
        }

        .modal {
          position: relative;
          z-index: 10;
          background: #fff;
          width: 100%;
          border-radius: 24px 24px 0 0;
          max-height: 96vh;
          overflow: auto;
          display: flex;
          flex-direction: column;
          animation: slideUp .28s cubic-bezier(.34,1.4,.64,1);
        }
        @media (min-width: 768px) {
          .modal {
            max-width: 1040px;
            border-radius: 20px;
            max-height: 90vh;
            flex-direction: row;
            animation: popIn .2s ease-out;
          }
        }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes popIn   { from { transform: scale(.96); opacity: 0; } to { transform: none; opacity: 1; } }

        .modal-handle {
          width: 36px;
          height: 4px;
          border-radius: 2px;
          background: #e2e8f0;
          margin: 12px auto 0;
          flex-shrink: 0;
        }
        @media (min-width: 768px) { .modal-handle { display: none; } }

        .modal-close {
          position: absolute;
          top: 12px;
          right: 14px;
          z-index: 20;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: #64748b;
          transition: background .12s, color .12s;
          line-height: 1;
        }
        .modal-close:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }

        /* ── Modal left panel ── */
        .modal-left {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #e2e8f0 transparent;
          flex-shrink: 0;
        }
        @media (min-width: 768px) {
          .modal-left {
            width: 400px;
            border-right: 1px solid #f1f5f9;
            background: #fafbff;
            border-radius: 20px 0 0 20px;
            overflow-y: auto;
          }
        }

        .modal-left-inner {
          padding: 20px 18px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        @media (min-width: 768px) { .modal-left-inner { padding: 24px 22px 28px; } }

        /* ── Modal section labels ── */
        .field-label {
          display: block;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .18em;
          color: #94a3b8;
          margin-bottom: 7px;
        }

        /* ── Person card inside modal ── */
        .person-card {
          background: #fff;
          border: 1px solid #e8eaf0;
          border-radius: 14px;
          padding: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 1px 6px rgba(0,0,0,.05);
        }
        .person-avatar {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: linear-gradient(135deg, #1338be, #3b82f6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }
        .person-name { font-size: 15px; font-weight: 800; color: #0f172a; line-height: 1.2; }
        .person-meta { font-size: 11px; color: #6366f1; font-weight: 600; margin-top: 1px; }
        .person-phone { font-size: 11px; color: #16a34a; font-weight: 600; margin-top: 3px; }

        /* ── Photo upload zone ── */
        .photo-zone {
          border: 1.5px dashed #bfdbfe;
          border-radius: 14px;
          background: #f8faff;
          cursor: pointer;
          transition: all .15s;
          overflow: hidden;
          display: block;
          width: 100%;
        }
        .photo-zone:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        .photo-zone-inner {
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .photo-thumb {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          object-fit: cover;
          border: 2.5px solid #3b82f6;
          flex-shrink: 0;
        }
        .photo-placeholder {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
          border: 2px dashed #93c5fd;
        }
        .photo-cta-title { font-size: 13px; font-weight: 700; color: #1338be; }
        .photo-cta-sub { font-size: 10px; color: #94a3b8; margin-top: 2px; font-weight: 500; }
        .photo-change-chip {
          margin-left: auto;
          padding: 4px 10px;
          border-radius: 999px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          font-size: 10px;
          font-weight: 700;
          color: #1338be;
          white-space: nowrap;
        }

        /* ── Tamil preview ── */
        .tamil-preview {
          border-radius: 14px;
          padding: 14px 16px;
          border: 1px solid transparent;
          transition: background .2s;
        }
        .tamil-wish-text {
          font-family: 'Noto Sans Tamil', sans-serif;
          font-size: 15px;
          font-weight: 700;
          line-height: 1.4;
          margin-bottom: 4px;
        }
        .tamil-sub-text {
          font-family: 'Noto Sans Tamil', sans-serif;
          font-size: 11px;
          line-height: 1.6;
          opacity: .8;
        }

        /* ── Faith pills ── */
        .faith-pills {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .faith-pill {
          padding: 6px 14px;
          border-radius: 999px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
          font-family: inherit;
          transition: all .15s;
        }
        .faith-pill:hover { border-color: #93c5fd; color: #1338be; }
        .faith-pill.active {
          border-color: #3b82f6;
          background: #eff6ff;
          color: #1338be;
        }

        /* ── Template grid ── */
        .template-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 7px;
          max-height: 220px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #e2e8f0 transparent;
          padding-right: 2px;
        }
       @media (max-width: 767px) {
  .template-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;

    max-height: 260px;
    overflow-y: auto;
    overflow-x: hidden;

    padding-right: 4px;
  }

  .template-btn {
    min-width: unset;
  }
}
        .template-btn {
          padding: 9px 7px;
          border-radius: 12px;
          border: 1.5px solid #e8eaf0;
          background: #fff;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          font-family: inherit;
          transition: all .12s;
          min-width: 80px;
        }
        .template-btn:hover { border-color: #93c5fd; transform: translateY(-1px); }
        .template-btn.active {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,.12);
          background: #f8fbff;
        }
        .template-swatch {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          flex-shrink: 0;
        }
        .template-name {
          font-size: 9px;
          font-weight: 700;
          color: #334155;
          text-align: center;
          line-height: 1.35;
        }
        .template-faith {
          font-size: 8px;
          color: #94a3b8;
          font-weight: 500;
          text-transform: capitalize;
        }

        /* ── Form elements ── */
        .form-select,
        .form-textarea,
        .form-input {
          width: 100%;
          padding: 10px 13px;
          border-radius: 11px;
          border: 1.5px solid #e2e8f0;
          font-size: 12px;
          font-family: inherit;
          color: #0f172a;
          background: #fff;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
          appearance: none;
        }
        .form-select:focus,
        .form-textarea:focus,
        .form-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,.1);
        }
        .form-textarea {
          min-height: 78px;
          resize: vertical;
          margin-top: 7px;
          line-height: 1.6;
        }

        /* ── Action buttons ── */
        .btn-whatsapp {
          width: 100%;
          padding: 14px;
          border-radius: 13px;
          border: none;
          background: #25d366;
          color: #fff;
          font-size: 14px;
          font-weight: 800;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          box-shadow: 0 5px 18px rgba(37,211,102,.28);
          transition: all .15s;
          letter-spacing: .01em;
        }
        .btn-whatsapp:hover:not(:disabled) { background: #1db954; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(37,211,102,.35); }
        .btn-whatsapp:active:not(:disabled) { transform: translateY(0); }
        .btn-whatsapp:disabled { opacity: .6; cursor: not-allowed; }

        .btn-download {
          width: 100%;
          padding: 11px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          color: #0f172a;
          font-size: 12px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: background .12s, border-color .12s;
        }
        .btn-download:hover:not(:disabled) { background: #f8faff; border-color: #bfdbfe; }
        .btn-download:disabled { opacity: .6; cursor: not-allowed; }

        .status-ok  { font-size: 12px; font-weight: 700; color: #16a34a; text-align: center; }
        .status-err { font-size: 12px; font-weight: 700; color: #dc2626; text-align: center; }

        .send-note {
          font-size: 10px;
          color: #94a3b8;
          text-align: center;
          line-height: 1.7;
          font-weight: 500;
        }
        .send-note b { color: #1e50d4; }

        /* ── Modal right — live preview ── */
        .modal-right {
          display: none;
        }
        @media (min-width: 768px) {
          .modal-right {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
            background: linear-gradient(160deg, #06091e 0%, #0a1650 100%);
            border-radius: 0 20px 20px 0;
            padding: 28px 24px;
            position: relative;
            overflow: hidden;
          }
        }

        /* Subtle background pattern for preview pane */
        .modal-right::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,.03) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
        }

        .preview-label {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .22em;
          color: rgba(255,255,255,.2);
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }

        /* ── Card preview ── */
        .card-preview {
          width: 100%;
          max-width: 258px;
          aspect-ratio: 3 / 4;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 32px 72px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.06), inset 0 1px 0 rgba(255,255,255,.06);
          z-index: 1;
          display: flex;
          flex-direction: column;
        }

        .card-corner {
          position: absolute;
          width: 18px;
          height: 18px;
          z-index: 3;
        }
        .card-corner.tl { top: 7px; left: 7px; border-top: 1.5px solid; border-left: 1.5px solid; border-radius: 3px 0 0 0; }
        .card-corner.tr { top: 7px; right: 7px; border-top: 1.5px solid; border-right: 1.5px solid; border-radius: 0 3px 0 0; }
        .card-corner.bl { bottom: 7px; left: 7px; border-bottom: 1.5px solid; border-left: 1.5px solid; border-radius: 0 0 0 3px; }
        .card-corner.br { bottom: 7px; right: 7px; border-bottom: 1.5px solid; border-right: 1.5px solid; border-radius: 0 0 3px 0; }

        .card-inner {
          position: absolute;
          inset: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 10px 9px;
          z-index: 2;
          gap: 3px;
        }

        .card-band {
          width: calc(100% + 18px);
          margin: -10px -9px 5px;
          padding: 5px;
          text-align: center;
        }
        .card-kolam { font-size: 9px; letter-spacing: .1em; opacity: .65; }
        .card-emoji {
          font-size: 30px;
          margin-bottom: 2px;
          animation: cardFloat 3.5s ease-in-out infinite;
        }
        @keyframes cardFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }
        .card-tamil-wish {
          font-family: 'Noto Sans Tamil', sans-serif;
          font-size: 10px;
          font-weight: 700;
          line-height: 1.45;
        }
        .card-tamil-sub {
          font-family: 'Noto Sans Tamil', sans-serif;
          font-size: 8px;
          line-height: 1.45;
          opacity: .75;
          margin-bottom: 3px;
        }
        .card-divider { height: .5px; width: 55%; margin: 1px auto 3px; opacity: .3; }
        .card-to-line { font-size: 8px; font-style: italic; opacity: .55; }

        /* Photo + name row in preview */
        .card-profile-row {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          margin: 4px 0 2px;
          text-align: left;
        }
        .card-photo {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }
        .card-initials {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .card-name-block { display: flex; flex-direction: column; min-width: 0; }
        .card-name {
          font-family: 'Playfair Display', serif;
          font-size: 15px;
          font-weight: 700;
          line-height: 1.1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .card-years {
          font-size: 7px;
          letter-spacing: .12em;
          text-transform: uppercase;
          opacity: .55;
          margin-top: 2px;
        }

        .card-message {
          font-size: 7.5px;
          font-style: italic;
          opacity: .8;
          line-height: 1.55;
          flex: 1;
          display: flex;
          align-items: center;
          text-align: center;
        }
        .card-footer {
          margin-top: auto;
          padding-top: 5px;
          border-top: .5px solid rgba(255,255,255,.12);
          width: 100%;
        }
        .card-sender { font-size: 10px; font-weight: 700; }
        .card-company { font-size: 7px; opacity: .4; margin-top: 1px; }

        /* ── Template dots ── */
        .preview-dots {
          display: flex;
          gap: 5px;
          margin-top: 16px;
          z-index: 1;
          flex-wrap: wrap;
          justify-content: center;
          max-width: 260px;
        }
        .preview-dot {
          height: 5px;
          border-radius: 3px;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all .2s;
        }
      `}</style>

      {/* ── Top nav ── */}
      <nav className="topbar">
        <div className="topbar-brand">
          <div className="topbar-logo">🛡️</div>
          <div>
            <div className="topbar-name">Maruthi Insure Care</div>
            <div className="topbar-sub">Client Engagement</div>
          </div>
        </div>
        <div className="topbar-badge">
          <div className="live-pulse"/>
          Live
        </div>
      </nav>

      {/* ── Main content ── */}
      <div className="content">

        {/* Header */}
        <div className="section-hdr">
          <h1 className="section-title">Outreach &amp; <em>Engagement</em></h1>
          <p className="section-sub">Bilingual greetings · Hindu · Muslim · Christian · 20 templates each</p>
        </div>

        {/* Tab switcher */}
        <div className="tab-bar">
          <button className={`tab-btn${activeTab==="birthdays"?" active":""}`} onClick={()=>setActiveTab("birthdays")}>🎂 Birthdays</button>
          <button className={`tab-btn${activeTab==="anniversaries"?" active":""}`} onClick={()=>setActiveTab("anniversaries")}>💍 Anniversaries</button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { label:"Today",      value:currentStats.today,     icon:"📆", primary:false },
            { label:"This Week",  value:currentStats.thisWeek,  icon:"✨", primary:true  },
            { label:"This Month", value:currentStats.thisMonth, icon:activeTab==="birthdays"?"🍰":"💍", primary:false },
            { label:"All Time",   value:currentStats.total,     icon:"🎈", primary:false },
          ].map(s=>(
            <div key={s.label} className={`stat-card${s.primary?" primary":""}`}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{loading?"–":s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Range filter */}
        <div className="range-filter">
          {(["week","month","all"] as const).map(r=>(
            <button key={r} className={`range-btn${range===r?" active":""}`} onClick={()=>setRange(r)}>
              {r==="all"?"All Time":r.charAt(0).toUpperCase()+r.slice(1)}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="list-card">
          <div className="list-head">
            <span className="list-head-title">
              {activeTab==="birthdays"?"Birthday":"Anniversary"} List
            </span>
            <span className="list-count">{currentList.length} {range==="all"?"total":range==="month"?"this month":"this week"}</span>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="spinner"/>
              <p className="empty-msg">Syncing records…</p>
            </div>
          ) : currentList.length===0 ? (
            <div className="empty-state">
              <div className="empty-emoji">{activeTab==="birthdays"?"🎂":"💍"}</div>
              <p className="empty-msg">No {activeTab} in this range</p>
              {activeTab==="anniversaries"&&<p className="empty-hint">Make sure clients have anniversary_date in their profile</p>}
            </div>
          ) : currentList.map((p,i)=>{
            const days  = daysUntil(p.date_of_birth);
            const parts = getNextDate(p.date_of_birth).split(" ");
            return (
              <div key={p.name+i} className="list-row" onClick={()=>openGreeting(p)}>
                <div className="date-chip">
                  <div className="date-chip-month">{parts[1]}</div>
                  <div className="date-chip-day">{parts[0]}</div>
                </div>
                <div className="row-info">
                  <div className="row-name">{p.name}</div>
                  <div className="row-meta">
                    {p.relationship} · {activeTab==="birthdays"?`Age ${getYears(p.date_of_birth)}`:`${getYears(p.date_of_birth)} yrs`}
                  </div>
                  <div className={`row-countdown${days===0?" today":""}`}>
                    {days===0?(activeTab==="birthdays"?"🎂 TODAY!":"💍 TODAY!"):days===1?"Tomorrow":`In ${days} days`}
                  </div>
                  {p.phone&&<div className="row-phone">📞 {p.phone}</div>}
                </div>
                <button className="wish-btn" onClick={e=>{e.stopPropagation();openGreeting(p);}}>
                  <WhatsAppIcon size={14}/> Wish
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {selectedPerson && (
        <div className="overlay">
          <div className="overlay-bg" onClick={()=>setSelectedPerson(null)}/>
          <div className="modal">
            <button className="modal-close" onClick={()=>setSelectedPerson(null)} aria-label="Close">✕</button>
            <div className="modal-handle"/>

            {/* ── Left panel ── */}
            <div className="modal-left">
              <div className="modal-left-inner">

                {/* Header */}
                <div>
                  <div style={{fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:".16em",color:"#94a3b8",marginBottom:4}}>
                    Greeting Designer
                  </div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:"#0f172a",lineHeight:1.15,letterSpacing:"-.02em"}}>
                    {activeTab==="birthdays"?"Birthday":"Anniversary"} <em style={{color:"#1e50d4",fontStyle:"italic"}}>Card</em>
                  </div>
                </div>

                {/* Person info */}
                <div className="person-card">
                  <div className="person-avatar">{activeTab==="birthdays"?"🎂":"💍"}</div>
                  <div>
                    <div className="person-name">{selectedPerson.name}</div>
                    <div className="person-meta">
                      {selectedPerson.relationship} · {activeTab==="birthdays"?`Turning ${getYears(selectedPerson.date_of_birth)}`:`${getYears(selectedPerson.date_of_birth)} yrs together`}
                    </div>
                    {selectedPerson.phone&&<div className="person-phone">📞 {selectedPerson.phone}</div>}
                  </div>
                </div>

                {/* ── Photo upload ── */}
                <div>
                  <label className="field-label">Client Photo</label>
                  <label className="photo-zone">
                    <div className="photo-zone-inner">
                      {clientPhoto
                        ? <img src={clientPhoto} alt="Client" className="photo-thumb"/>
                        : <div className="photo-placeholder">📷</div>
                      }
                      <div style={{flex:1,minWidth:0}}>
                        <div className="photo-cta-title">
                          {clientPhoto?"Photo added — looks great!":"Upload client photo"}
                        </div>
                        <div className="photo-cta-sub">
                          {clientPhoto?"Appears as circle on the card · tap to change":"Shown as a circular portrait on the card"}
                        </div>
                      </div>
                      {clientPhoto&&<span className="photo-change-chip">Change</span>}
                    </div>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      style={{display:"none"}}
                      onChange={handlePhotoChange}
                    />
                  </label>
                </div>

                {/* Tamil preview chip */}
                <div
                  className="tamil-preview"
                  style={{
                    background:`linear-gradient(135deg,${selectedTemplate.bg1},${selectedTemplate.bg2})`,
                    borderColor:selectedTemplate.accent+"55",
                  }}
                >
                  <div className="tamil-wish-text" style={{color:selectedTemplate.accent}}>{selectedTemplate.tamilWish}</div>
                  <div className="tamil-sub-text" style={{color:selectedTemplate.textSub}}>{selectedTemplate.tamilSub}</div>
                </div>

                {/* Faith filter */}
                <div>
                  <label className="field-label">Filter by Faith</label>
                  <div className="faith-pills">
                    {FAITH_FILTERS.map(f=>(
                      <button
                        key={f.id}
                        className={`faith-pill${faithFilter===f.id?" active":""}`}
                        onClick={()=>setFaithFilter(f.id)}
                      >
                        {f.icon} {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Template picker */}
                <div>
                  <label className="field-label">Theme — {filteredTemplates.length} templates</label>
                  <div className="template-grid">
                    {filteredTemplates.map(t=>(
                      <button
                        key={t.id}
                        className={`template-btn${selectedTemplate.id===t.id?" active":""}`}
                        onClick={()=>setSelectedTemplate(t)}
                        title={t.name}
                      >
                        <div
                          className="template-swatch"
                          style={{
                            background:`linear-gradient(135deg,${t.bg1},${t.bg2})`,
                            border:`2px solid ${t.accent}55`,
                          }}
                        />
                        <span className="template-name">{t.emoji} {t.name}</span>
                        <span className="template-faith">{t.faith}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="field-label">English Blessing</label>
                  <select
                    className="form-select"
                    value={message}
                    onChange={e=>setMessage(e.target.value)}
                  >
                    {messages.map((m,i)=><option key={i} value={m}>{m.slice(0,58)}…</option>)}
                  </select>
                  <textarea
                    className="form-textarea"
                    value={message}
                    onChange={e=>setMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Sender */}
                <div>
                  <label className="field-label">Your Name</label>
                  <input
                    className="form-input"
                    value={senderName}
                    onChange={e=>setSenderName(e.target.value)}
                    placeholder="Enter your name…"
                  />
                </div>

                {/* Actions */}
                <button className="btn-whatsapp" onClick={handleShare} disabled={generating}>
                  {generating ? (
                    <><div style={{width:15,height:15,border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .6s linear infinite"}}/> Generating…</>
                  ) : (
                    <><WhatsAppIcon size={16}/> {selectedPerson.phone?`Send to ${selectedPerson.phone}`:"Share via WhatsApp"}</>
                  )}
                </button>

                <button className="btn-download" onClick={handleDownload} disabled={generating}>
                  ⬇ Download PNG card
                </button>

                {shareStatus==="success"&&<p className="status-ok">✓ Card sent / downloaded successfully!</p>}
                {shareStatus==="error"  &&<p className="status-err">⚠ Failed. Try downloading and sharing manually.</p>}

                <p className="send-note">
                  <b>Mobile:</b> native share sheet → pick WhatsApp.<br/>
                  <b>Desktop:</b> image downloads + WhatsApp opens to <b>{selectedPerson.phone||"contact"}</b>.
                </p>

              </div>
            </div>

            {/* ── Right panel — live preview ── */}
            <div className="modal-right">
              <p className="preview-label">Live Preview</p>

              <div className="card-preview" style={{background:selectedTemplate.previewBg}}>
                {(["tl","tr","bl","br"] as const).map(pos=>(
                  <div
                    key={pos}
                    className={`card-corner ${pos}`}
                    style={{borderColor:selectedTemplate.previewAccent+"55"}}
                  />
                ))}

                <div className="card-inner" style={{color:selectedTemplate.textMain}}>
                  {/* Top band */}
                  <div
                    className="card-band"
                    style={{
                      background:selectedTemplate.accent+"1a",
                      borderBottom:`1px solid ${selectedTemplate.accent}28`,
                    }}
                  >
                    <div className="card-kolam" style={{color:selectedTemplate.previewAccent}}>
                      {selectedTemplate.kolam}
                    </div>
                  </div>

                  <div className="card-emoji">{selectedTemplate.emoji}</div>

                  <div className="card-tamil-wish" style={{color:selectedTemplate.previewAccent}}>
                    {selectedTemplate.tamilWish}
                  </div>
                  <div className="card-tamil-sub" style={{color:selectedTemplate.textSub}}>
                    {selectedTemplate.tamilSub}
                  </div>

                  <div className="card-divider" style={{background:selectedTemplate.previewAccent}}/>
                  <div className="card-to-line" style={{color:selectedTemplate.textSub}}>
                    ✦ {activeTab==="birthdays"?"Birthday":"Anniversary"} Wishes to ✦
                  </div>

                  {/* ── Photo LEFT + Name RIGHT ── */}
<div style={{display:"flex",alignItems:"center",gap:10,width:"100%",margin:"4px 0 2px"}}>
  {clientPhoto ? (
    <img
      src={clientPhoto}
      alt={selectedPerson.name}
      className="card-photo"
      style={{border:`2.5px solid ${selectedTemplate.accent}99`,flexShrink:0}}
    />
  ) : (
    <div
      className="card-initials"
      style={{
        background:`linear-gradient(135deg,${selectedTemplate.accent}88,${selectedTemplate.bg2})`,
        border:`2px solid ${selectedTemplate.accent}66`,
        color:selectedTemplate.textMain,
        flexShrink:0,
      }}
    >
      {selectedPerson.name.charAt(0).toUpperCase()}
    </div>
  )}
  <div style={{display:"flex",flexDirection:"column",minWidth:0,flex:1,textAlign:"left"}}>
    <div className="card-name" style={{color:selectedTemplate.textMain}}>
      {selectedPerson.name}
    </div>
    <div className="card-years" style={{color:selectedTemplate.textSub,marginTop:2}}>
      {activeTab==="birthdays"
        ?`Turning ${getYears(selectedPerson.date_of_birth)} years`
        :`${getYears(selectedPerson.date_of_birth)} years together`}
    </div>
    <div style={{
      marginTop:5,
      padding:"2px 8px",
      borderRadius:999,
      background:selectedTemplate.accent+"22",
      border:`1px solid ${selectedTemplate.accent}44`,
      fontSize:8,
      fontWeight:700,
      color:selectedTemplate.accent,
      width:"fit-content",
    }}>
      {activeTab==="birthdays"
        ?`🎂 Turning ${getYears(selectedPerson.date_of_birth)}`
        :`💍 ${getYears(selectedPerson.date_of_birth)} yrs`}
    </div>
  </div>
</div>

                  <div className="card-divider" style={{background:selectedTemplate.previewAccent}}/>

                  <p className="card-message" style={{color:selectedTemplate.textSub}}>
                    "{message.length>90?message.slice(0,90)+"…":message}"
                  </p>

                  <div className="card-footer">
                    <div className="card-sender" style={{color:selectedTemplate.previewAccent}}>
                      {senderName||"Your Name"}
                    </div>
                    <div className="card-company" style={{color:selectedTemplate.textSub}}>
                      Maruthi Insure Care
                    </div>
                  </div>
                </div>
              </div>

              {/* Template dot navigation */}
              <div className="preview-dots">
                {filteredTemplates.map(t=>(
                  <button
                    key={t.id}
                    className="preview-dot"
                    onClick={()=>setSelectedTemplate(t)}
                    title={t.name}
                    style={{
                      width: selectedTemplate.id===t.id ? 18 : 5,
                      background: selectedTemplate.id===t.id ? t.previewAccent : "rgba(255,255,255,.18)",
                    }}
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