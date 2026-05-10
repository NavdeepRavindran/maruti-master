import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";
function daysUntilBirthday(dob: string): number {
  const birth = new Date(dob);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const thisYear = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  thisYear.setHours(0, 0, 0, 0);
  const next = thisYear >= now ? thisYear : new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate());
  next.setHours(0, 0, 0, 0);
  const diffTime = next.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
import { BirthdayEntry } from "../../../lib/types";

// GET /api/birthdays — Get upcoming birthdays
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "month"; // "today", "week", "month", "all"

  if (!supabase) {
    return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
  }

  try {
    // Get all clients
    const { data: clients } = await supabase
      .from("clients")
      .select("id, name, date_of_birth, phone")
      .order("name");

    // Get all family members
    const { data: familyMembers } = await supabase
      .from("family_members")
      .select("id, client_id, name, date_of_birth, relationship, phone, clients(name)")
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

    // Sort by next birthday
    entries.sort((a, b) => daysUntilBirthday(a.date_of_birth) - daysUntilBirthday(b.date_of_birth));

    const filtered = filterByRange(entries, range);

    return NextResponse.json({
      birthdays: filtered,
      stats: getStats(entries),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function filterByRange(entries: BirthdayEntry[], range: string): BirthdayEntry[] {
  return entries.filter((e) => {
    const days = daysUntilBirthday(e.date_of_birth);
    switch (range) {
      case "today": return days === 0;
      case "week": return days <= 7;
      case "month": return days <= 30;
      default: return true;
    }
  });
}

function getStats(entries: BirthdayEntry[]) {
  const today = entries.filter((e) => daysUntilBirthday(e.date_of_birth) === 0).length;
  const thisWeek = entries.filter((e) => daysUntilBirthday(e.date_of_birth) <= 7).length;
  const thisMonth = entries.filter((e) => daysUntilBirthday(e.date_of_birth) <= 30).length;
  return { today, thisWeek, thisMonth, total: entries.length };
}
