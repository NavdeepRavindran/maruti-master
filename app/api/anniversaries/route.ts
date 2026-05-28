import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";
import { AnniversaryEntry } from "../../../lib/types";

function daysUntilAnniversary(dateStr: string): number {
  if (!dateStr) return -1;
  const anniv = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const thisYear = new Date(now.getFullYear(), anniv.getMonth(), anniv.getDate());
  thisYear.setHours(0, 0, 0, 0);
  const next = thisYear >= now ? thisYear : new Date(now.getFullYear() + 1, anniv.getMonth(), anniv.getDate());
  next.setHours(0, 0, 0, 0);
  const diffTime = next.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// GET /api/anniversaries — Get upcoming anniversaries
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "month"; // "today", "week", "month", "all"

  if (!supabase) {
    return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
  }

  try {
    // Get all clients with an anniversaryDate
    // Using a raw query to bypass typing if 'anniversaryDate' is recently added
    const { data: clients, error } = await supabase
      .from("clients")
      .select("id, name, anniversaryDate, phone")
      .not("anniversaryDate", "is", null)
      .order("name");
      
    if (error) throw error;

    const entries: AnniversaryEntry[] = [];

    for (const client of clients || []) {
      if (client.anniversaryDate) {
        entries.push({
          name: client.name,
          anniversaryDate: client.anniversaryDate,
          relationship: "Client",
          phone: client.phone,
          client_id: client.id,
          type: "client",
        });
      }
    }

    // Sort by next anniversary
    entries.sort((a, b) => daysUntilAnniversary(a.anniversaryDate) - daysUntilAnniversary(b.anniversaryDate));

    const filtered = filterByRange(entries, range);

    return NextResponse.json({
      anniversaries: filtered,
      stats: getStats(entries),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function filterByRange(entries: AnniversaryEntry[], range: string): AnniversaryEntry[] {
  return entries.filter((e) => {
    const days = daysUntilAnniversary(e.anniversaryDate);
    if (days === -1) return false;
    switch (range) {
      case "today": return days === 0;
      case "week": return days <= 7;
      case "month": return days <= 30;
      default: return true;
    }
  });
}

function getStats(entries: AnniversaryEntry[]) {
  const validEntries = entries.filter((e) => daysUntilAnniversary(e.anniversaryDate) !== -1);
  const today = validEntries.filter((e) => daysUntilAnniversary(e.anniversaryDate) === 0).length;
  const thisWeek = validEntries.filter((e) => daysUntilAnniversary(e.anniversaryDate) <= 7).length;
  const thisMonth = validEntries.filter((e) => daysUntilAnniversary(e.anniversaryDate) <= 30).length;
  return { today, thisWeek, thisMonth, total: validEntries.length };
}
