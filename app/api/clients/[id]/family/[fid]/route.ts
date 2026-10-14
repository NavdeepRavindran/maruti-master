import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabaseClient";
import { formatFamilyName, validateDateRange } from "@/lib/formatUtils";

// PUT /api/clients/[id]/family/[fid]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; fid: string }> }
) {
  const { id, fid } = await params;
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (body.date_of_birth) {
    const dobVal = validateDateRange(body.date_of_birth, "Date of birth");
    if (!dobVal.isValid) {
      return NextResponse.json({ error: dobVal.error }, { status: 400 });
    }
  }

  try {
    if (!supabaseAdmin) throw new Error("Supabase Admin client not initialized");

    const updatePayload: Record<string, any> = {};
    if (body.name !== undefined) updatePayload.name = formatFamilyName(body.name);
    if (body.relationship !== undefined) updatePayload.relationship = body.relationship;
    if (body.date_of_birth !== undefined) updatePayload.date_of_birth = body.date_of_birth;
    if (body.phone !== undefined) updatePayload.phone = body.phone;
    if (body.occupation !== undefined) updatePayload.occupation = body.occupation;
    if (body.notes !== undefined) updatePayload.notes = body.notes;

    const { data, error } = await supabaseAdmin
      .from("family_members")
      .update(updatePayload)
      .eq("id", fid)
      .eq("client_id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ family_member: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update family member" }, { status: 500 });
  }
}

// DELETE /api/clients/[id]/family/[fid]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; fid: string }> }
) {
  const { id, fid } = await params;

  try {
    if (!supabaseAdmin) throw new Error("Supabase Admin client not initialized");

    await supabaseAdmin.from("documents").delete().eq("family_member_id", fid);
    const { error: familyError } = await supabaseAdmin
      .from("family_members")
      .delete()
      .eq("id", fid)
      .eq("client_id", id);

    if (familyError) throw familyError;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete family member" }, { status: 500 });
  }
}