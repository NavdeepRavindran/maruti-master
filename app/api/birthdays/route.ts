import { NextResponse } from "next/server";
import { supabaseAdmin, supabaseAuth } from "../../../lib/supabaseClient";

function daysUntilBirthday(dob: string): number {
  const birth = new Date(dob);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const thisYear = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  thisYear.setHours(0, 0, 0, 0);
  const next = thisYear >= now ? thisYear : new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate());
  next.setHours(0, 0, 0, 0);
  return Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

interface BirthdayEntry {
  name: string;
  date_of_birth: string;
  relationship: string;
  phone?: string;
  client_name?: string;
  client_id: string;
  family_member_id?: string;
  type: string;
}

// ── Auth helper ────────────────────────────────────────────────────────────
async function getAuthUser(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function GET(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
  }

  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "month";

  try {
    const { data: clients } = await supabaseAdmin
      .from("clients")
      .select("id, name, date_of_birth, phone")
      .not("date_of_birth", "is", null)
      .order("name");

    const { data: familyMembers } = await supabaseAdmin
      .from("family_members")
      .select("id, client_id, name, date_of_birth, relationship, phone, clients(name)")
      .not("date_of_birth", "is", null)
      .order("name");

    const entries: BirthdayEntry[] = [];

    for (const client of clients || []) {
      entries.push({
        name: client.name,
        date_of_birth: client.date_of_birth,
        relationship: "Client (Self)",
        phone: client.phone,
        client_id: client.id,
        type: "client",
      });
    }

    for (const fm of familyMembers || []) {
      entries.push({
        name: fm.name,
        date_of_birth: fm.date_of_birth,
        relationship: fm.relationship,
        phone: fm.phone,
        client_name: (fm as any).clients?.name,
        client_id: fm.client_id,
        family_member_id: fm.id,
        type: "family_member",
      });
    }

    entries.sort((a, b) => daysUntilBirthday(a.date_of_birth) - daysUntilBirthday(b.date_of_birth));
    const filtered = filterByRange(entries, range);

    return NextResponse.json({ birthdays: filtered, stats: getStats(entries) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function filterByRange(entries: BirthdayEntry[], range: string) {
  return entries.filter(e => {
    const days = daysUntilBirthday(e.date_of_birth);
    if (range === "today") return days === 0;
    if (range === "week") return days <= 7;
    if (range === "month") return days <= 30;
    return true;
  });
}

function getStats(entries: BirthdayEntry[]) {
  return {
    today: entries.filter(e => daysUntilBirthday(e.date_of_birth) === 0).length,
    thisWeek: entries.filter(e => daysUntilBirthday(e.date_of_birth) <= 7).length,
    thisMonth: entries.filter(e => daysUntilBirthday(e.date_of_birth) <= 30).length,
    total: entries.length,
  };
}