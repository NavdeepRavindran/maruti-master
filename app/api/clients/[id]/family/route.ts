import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabaseClient";
import { formatFamilyName, validateDateRange } from "@/lib/formatUtils";

// GET /api/clients/[id]/family — List family members for a client
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    if (!supabaseAdmin) throw new Error("Supabase client not initialized");

    const { data, error } = await supabaseAdmin
      .from("family_members")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: true });

    if (error) throw error;
    const formatted = (data || []).map((m: any) => ({
      ...m,
      name: formatFamilyName(m.name),
    }));
    return NextResponse.json({ family_members: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch family members" }, { status: 500 });
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

  const dobVal = validateDateRange(body.date_of_birth, "Date of birth");
  if (!dobVal.isValid) {
    return NextResponse.json({ error: dobVal.error }, { status: 400 });
  }

  const cleanName = formatFamilyName(body.name);

  try {
    if (!supabaseAdmin) throw new Error("Supabase client not initialized");

    const { data, error } = await supabaseAdmin
      .from("family_members")
      .insert({
        client_id: id,
        name: cleanName,
        date_of_birth: body.date_of_birth,
        relationship: body.relationship,
        phone: body.phone || null,
        occupation: body.occupation || null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ family_member: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to add family member" }, { status: 500 });
  }
}