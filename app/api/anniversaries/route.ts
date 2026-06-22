import { NextResponse } from "next/server";
import { supabaseAdmin, supabaseAuth } from "../../../lib/supabaseClient";

function daysUntilAnniversary(dateStr: string): number {
  if (!dateStr) return -1;
  const anniv = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const thisYear = new Date(now.getFullYear(), anniv.getMonth(), anniv.getDate());
  thisYear.setHours(0, 0, 0, 0);
  const next = thisYear >= now ? thisYear : new Date(now.getFullYear() + 1, anniv.getMonth(), anniv.getDate());
  next.setHours(0, 0, 0, 0);
  return Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

interface AnniversaryEntry {
  name: string;
  date_of_birth: string;
  relationship: string;
  phone?: string;
  client_name?: string;
  client_id: string;
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
    const { data: clients, error } = await supabaseAdmin
      .from("clients")
      .select("id, name, anniversary_date, phone")
      .not("anniversary_date", "is", null)
      .order("name");

    if (error) throw error;

    const entries: AnniversaryEntry[] = [];

    for (const client of clients || []) {
      if (client.anniversary_date) {
        entries.push({
          name: client.name,
          date_of_birth: client.anniversary_date,
          relationship: "Client",
          phone: client.phone,
          client_id: client.id,
          type: "client",
        });
      }
    }

    entries.sort((a, b) => daysUntilAnniversary(a.date_of_birth) - daysUntilAnniversary(b.date_of_birth));
    const filtered = filterByRange(entries, range);

    return NextResponse.json({ anniversaries: filtered, stats: getStats(entries) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function filterByRange(entries: AnniversaryEntry[], range: string) {
  return entries.filter(e => {
    const days = daysUntilAnniversary(e.date_of_birth);
    if (days === -1) return false;
    if (range === "today") return days === 0;
    if (range === "week") return days <= 7;
    if (range === "month") return days <= 30;
    return true;
  });
}

function getStats(entries: AnniversaryEntry[]) {
  const valid = entries.filter(e => daysUntilAnniversary(e.date_of_birth) !== -1);
  return {
    today: valid.filter(e => daysUntilAnniversary(e.date_of_birth) === 0).length,
    thisWeek: valid.filter(e => daysUntilAnniversary(e.date_of_birth) <= 7).length,
    thisMonth: valid.filter(e => daysUntilAnniversary(e.date_of_birth) <= 30).length,
    total: valid.length,
  };
}