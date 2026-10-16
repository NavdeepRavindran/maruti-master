import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

// POST /api/clients/[id]/family/[fid]/restore -> Restores a family member from client's Recycle Bin
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; fid: string }> }
) {
  const { id, fid } = await params;

  try {
    if (!supabaseAdmin) throw new Error("Supabase Admin client not initialized");

    let restoreRes = await supabaseAdmin
      .from("family_members")
      .update({ is_deleted: false, deleted_at: null })
      .eq("id", fid)
      .eq("client_id", id)
      .select()
      .maybeSingle();

    if (restoreRes.error) {
      restoreRes = await supabaseAdmin
        .from("family_members")
        .update({ is_deleted: false })
        .eq("id", fid)
        .eq("client_id", id)
        .select()
        .maybeSingle();
    }

    // Also strip [RECYCLE_BIN] prefix from name if present
    const { data: fm } = await supabaseAdmin
      .from("family_members")
      .select("name")
      .eq("id", fid)
      .eq("client_id", id)
      .maybeSingle();

    if (fm?.name && fm.name.startsWith("[RECYCLE_BIN]")) {
      const cleanName = fm.name.replace(/^\[RECYCLE_BIN\]\s*/, "").trim();
      await supabaseAdmin
        .from("family_members")
        .update({ name: cleanName })
        .eq("id", fid)
        .eq("client_id", id);
    }

    return NextResponse.json({
      success: true,
      family_member: restoreRes.data || { id: fid, client_id: id },
      message: "Family member restored successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to restore family member" }, { status: 500 });
  }
}
