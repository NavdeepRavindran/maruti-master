import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const settingsFilePath = path.join(process.cwd(), "data", "settings.json");

const defaultSettings = {
  agency: {
    name: "Maruthi Insure Care",
    logoUrl: "https://example.com/logo.png",
    address: "123 Main St, City",
    regNo: "REG-987654321",
    phone: "+91 98765 43210",
    email: "contact@maruthiinsure.com",
  },
  categories: [
    "Policy Documents",
    "KYC / Identity",
    "Health Records",
    "Vehicle RC / Insurance",
    "Financial / Tax",
    "Others",
  ],
  templates: {
    birthdayEnglish: "Wishing you a very Happy Birthday! 🎉 May your year ahead be filled with happiness, health, and prosperity. Best wishes from Maruthi Insure Care.",
    birthdayTamil: "இனிய பிறந்தநாள் நல்வாழ்த்துகள்! 🎂 உங்கள் வாழ்வில் எல்லா வளங்களும் நலன்களும் பெற்று ஆரோக்கியத்துடனும் அமைதியுடனும் வாழ வாழ்த்துகிறோம். — மருதி இன்சூர் கேர்.",
    anniversaryEnglish: "Happy Wedding Anniversary! 💐 Wishing you many more years of love, togetherness, and wonderful milestones. Warm regards from Maruthi Insure Care.",
    anniversaryTamil: "இனிய திருமண நாள் நல்வாழ்த்துகள்! 💐 அன்பு, மகிழ்ச்சி, வளமையுடன் கூடிய நீடித்த இல்லற வாழ்விற்கு இதயங்கனிந்த வாழ்த்துகள். — மருதி இன்சூர் கேர்.",
  },
  notifications: {
    emailAlerts: true,
    smsAlerts: false,
    marketing: false,
  },
  portal: {
    enableClientPortal: true,
    require2FA: false,
  },
};

function readSettings() {
  try {
    if (!fs.existsSync(settingsFilePath)) {
      const dir = path.dirname(settingsFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(settingsFilePath, JSON.stringify(defaultSettings, null, 2), "utf-8");
      return defaultSettings;
    }
    const data = fs.readFileSync(settingsFilePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading settings.json:", err);
    return defaultSettings;
  }
}

function writeSettings(data: any) {
  try {
    const dir = path.dirname(settingsFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(settingsFilePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing settings.json:", err);
    return false;
  }
}

export async function GET() {
  const settings = readSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const current = readSettings();

    const updated = {
      ...current,
      ...body,
      agency: { ...current.agency, ...(body.agency || {}) },
      templates: { ...current.templates, ...(body.templates || {}) },
      notifications: { ...current.notifications, ...(body.notifications || {}) },
      portal: { ...current.portal, ...(body.portal || {}) },
      categories: Array.isArray(body.categories) ? body.categories : current.categories,
    };

    const success = writeSettings(updated);
    if (!success) {
      return NextResponse.json({ error: "Failed to persist settings file" }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    console.error("PUT /api/settings error:", err);
    return NextResponse.json({ error: err.message || "Failed to update settings" }, { status: 500 });
  }
}
