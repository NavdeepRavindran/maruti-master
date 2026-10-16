import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

// DELETE /api/clients/recycle-bin -> Empties the entire Recycle Bin
export async function DELETE() {
  try {
    if (!supabaseAdmin) throw new Error("No supabaseAdmin");
    // Get all deleted client IDs
    const { data: clients } = await supabaseAdmin
      .from("clients")
      .select("id, is_deleted, notes");

    const ids = (clients || [])
      .filter((c: any) => c.is_deleted === true || c.is_deleted === "true" || (typeof c.notes === "string" && c.notes.includes("[RECYCLE_BIN:")))
      .map((c: any) => c.id);

    if (ids.length > 0) {
      await supabaseAdmin.from("documents").delete().in("client_id", ids);
      await supabaseAdmin.from("family_members").delete().in("client_id", ids);
      await supabaseAdmin.from("clients").delete().in("id", ids);
    }
    return NextResponse.json({ success: true, message: "Recycle Bin emptied successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to empty Recycle Bin" }, { status: 500 });
  }
}
