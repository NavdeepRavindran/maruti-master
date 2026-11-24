import { NextResponse } from "next/server";
import { supabaseAdmin, supabaseAuth } from "../../../lib/supabaseClient";
import { getTodayDateParts, getDaysUntilAnnualEvent } from "@/lib/formatUtils";

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
  try {
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "month";
  const dateParam = searchParams.get("date");
  const todayRef = getTodayDateParts(dateParam);

  try {
    if (!supabaseAdmin) throw new Error("No supabaseAdmin");

    const { data: rawClients, error } = await supabaseAdmin
      .from("clients")
      .select("*")
      .not("anniversary_date", "is", null)
      .order("name");

    if (error) throw error;

    const clients = (rawClients || []).filter(
      (c: any) => !c.is_deleted || c.is_deleted === false || c.is_deleted === "false"
    );

    const entries: AnniversaryEntry[] = [];

    for (const client of clients || []) {
      const anniv = client.anniversary_date || client.anniversaryDate;
      if (anniv) {
        entries.push({
          name: client.name,
          date_of_birth: anniv,
          relationship: "Client",
          phone: client.phone,
          client_id: client.id,
          type: "client",
        });
      }
    }

    entries.sort((a, b) => getDaysUntilAnnualEvent(a.date_of_birth, todayRef) - getDaysUntilAnnualEvent(b.date_of_birth, todayRef));
    const filtered = filterByRange(entries, range, todayRef);

    return NextResponse.json({ anniversaries: filtered, stats: getStats(entries, todayRef) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch anniversaries" }, { status: 500 });
  }
}

function filterByRange(entries: AnniversaryEntry[], range: string, todayRef: { year: number; month: number; day: number }) {
  return entries.filter(e => {
    const days = getDaysUntilAnnualEvent(e.date_of_birth, todayRef);
    if (days === -1) return false;
    if (range === "today") return days === 0;
    if (range === "week") return days <= 7;
    if (range === "month") return days <= 30;
    return true;
  });
}

function getStats(entries: AnniversaryEntry[], todayRef: { year: number; month: number; day: number }) {
  const valid = entries.filter(e => getDaysUntilAnnualEvent(e.date_of_birth, todayRef) !== -1);
  return {
    today: valid.filter(e => getDaysUntilAnnualEvent(e.date_of_birth, todayRef) === 0).length,
    thisWeek: valid.filter(e => getDaysUntilAnnualEvent(e.date_of_birth, todayRef) <= 7).length,
    thisMonth: valid.filter(e => getDaysUntilAnnualEvent(e.date_of_birth, todayRef) <= 30).length,
    total: valid.length,
  };
}