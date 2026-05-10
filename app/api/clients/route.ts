import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";


// GET /api/clients — List all clients (optionally filter by search query)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase() || "";
  const status = searchParams.get("status") || "";

  if (!supabase) {
    return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
  }

  try {
    let query = supabase
      .from("clients")
      .select("*, family_members(count), documents(count)")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const clients = (data || []).map((c: any) => ({
      ...c,
      family_count: c.family_members?.[0]?.count || 0,
      document_count: c.documents?.[0]?.count || 0,
    }));

    return NextResponse.json({ clients, total: clients.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/clients — Create a new client
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || !body.name || !body.phone || !body.date_of_birth) {
    return NextResponse.json({ error: "Name, phone, and date of birth are required." }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
  }

  try {
    const { data, error } = await supabase
      .from("clients")
      .insert({
        name: body.name,
        phone: body.phone,
        email: body.email || null,
        date_of_birth: body.date_of_birth,
        address: body.address || null,
        status: "Active",
        agent_id: body.agent_id || null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ client: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
