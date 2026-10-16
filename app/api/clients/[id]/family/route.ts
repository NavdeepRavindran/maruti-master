import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabaseClient";
import { formatFamilyName, validateDateRange } from "@/lib/formatUtils";

// GET /api/clients/[id]/family — List family members for a client
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  try {
    if (!supabaseAdmin) throw new Error("Supabase client not initialized");

    const { data, error } = await supabaseAdmin
      .from("family_members")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const isFamilyDeleted = (m: any) => {
      if (m.is_deleted === true || m.is_deleted === "true") return true;
      if (typeof m.name === "string" && m.name.startsWith("[RECYCLE_BIN]")) return true;
      return false;
    };

    const cleanFamilyName = (m: any) => {
      const raw = typeof m.name === "string" ? m.name : "";
      return formatFamilyName(raw.replace(/^\[RECYCLE_BIN\]\s*/, ""));
    };

    const activeMembers = (data || [])
      .filter((m: any) => !isFamilyDeleted(m))
      .map((m: any) => ({
        ...m,
        name: cleanFamilyName(m),
        is_deleted: false,
      }));

    const recycledMembers = (data || [])
      .filter((m: any) => isFamilyDeleted(m))
      .map((m: any) => ({
        ...m,
        name: cleanFamilyName(m),
        is_deleted: true,
      }));

    if (status === "recycle_bin") {
      return NextResponse.json({
        family_members: recycledMembers,
        recycled_family_members: recycledMembers,
      });
    }

    return NextResponse.json({
      family_members: activeMembers,
      recycled_family_members: recycledMembers,
    });
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