import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

// DELETE /api/clients/[id]/family/recycle-bin -> Empties the family Recycle Bin for this client
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    if (!supabaseAdmin) throw new Error("Supabase Admin client not initialized");

    const { data: allMembers } = await supabaseAdmin
      .from("family_members")
      .select("id, name, is_deleted")
      .eq("client_id", id);

    const recycledIds = (allMembers || [])
      .filter(
        (m: any) =>
          m.is_deleted === true ||
          m.is_deleted === "true" ||
          (typeof m.name === "string" && m.name.startsWith("[RECYCLE_BIN]"))
      )
      .map((m: any) => m.id);

    if (recycledIds.length > 0) {
      await supabaseAdmin.from("documents").delete().in("family_member_id", recycledIds);
      await supabaseAdmin.from("family_members").delete().in("id", recycledIds);
    }

    return NextResponse.json({
      success: true,
      count: recycledIds.length,
      message: "Client's family Recycle Bin emptied successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to empty family Recycle Bin" }, { status: 500 });
  }
}
