import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

// POST /api/clients/[id]/restore -> Restores a client from Recycle Bin
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    if (!supabaseAdmin) throw new Error("No supabaseAdmin");
    
    let restoreRes = await supabaseAdmin
      .from("clients")
      .update({ is_deleted: false, deleted_at: null })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (restoreRes.error) {
      restoreRes = await supabaseAdmin
        .from("clients")
        .update({ is_deleted: false })
        .eq("id", id)
        .select()
        .maybeSingle();
    }

    // Also clean up [RECYCLE_BIN:...] from notes if present
    const { data: clientData } = await supabaseAdmin
      .from("clients")
      .select("notes")
      .eq("id", id)
      .maybeSingle();

    if (clientData?.notes && clientData.notes.includes("[RECYCLE_BIN:")) {
      const cleanedNotes = clientData.notes.replace(/\n?\[RECYCLE_BIN:[^\]]*\]/g, "").trim();
      await supabaseAdmin.from("clients").update({ notes: cleanedNotes }).eq("id", id);
    }

    return NextResponse.json({
      success: true,
      client: restoreRes.data || { id, is_deleted: false },
      message: "Client restored successfully from Recycle Bin",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to restore client" }, { status: 500 });
  }
}
