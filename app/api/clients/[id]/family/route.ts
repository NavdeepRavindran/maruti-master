import { NextResponse } from "next/server";
import { supabase } from "../../../../../lib/supabaseClient";


// GET /api/clients/[id]/family — List family members for a client
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!supabase) {
    return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
  }

  try {
    const { data, error } = await supabase
      .from("family_members")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ family_members: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/clients/[id]/family — Add a family member
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || !body.name || !body.date_of_birth || !body.relationship) {
    return NextResponse.json({ error: "Name, date of birth, and relationship are required." }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
  }

  try {
    const { data, error } = await supabase
      .from("family_members")
      .insert({
        client_id: id,
        name: body.name,
        date_of_birth: body.date_of_birth,
        relationship: body.relationship,
        phone: body.phone || null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ family_member: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
