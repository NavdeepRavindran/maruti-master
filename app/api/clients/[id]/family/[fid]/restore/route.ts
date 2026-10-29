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

    // Strip [RECYCLE_BIN] prefix from name to restore
    const { data: fm, error: fmErr } = await supabaseAdmin
      .from("family_members")
      .select("id, client_id, name")
      .eq("id", fid)
      .eq("client_id", id)
      .maybeSingle();

    if (fmErr) throw fmErr;

    let updatedFm = fm;
    if (fm?.name && fm.name.startsWith("[RECYCLE_BIN]")) {
      const cleanName = fm.name.replace(/^\[RECYCLE_BIN\]\s*/, "").trim();
      const { data: updated, error: updateErr } = await supabaseAdmin
        .from("family_members")
        .update({ name: cleanName })
        .eq("id", fid)
        .eq("client_id", id)
        .select()
        .maybeSingle();
      if (updateErr) throw updateErr;
      updatedFm = updated;
    }

    return NextResponse.json({
      success: true,
      family_member: updatedFm || { id: fid, client_id: id },
      message: "Family member restored successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to restore family member" }, { status: 500 });
  }
}
