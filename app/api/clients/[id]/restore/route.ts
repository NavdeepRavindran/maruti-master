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
    
    // Clean up [RECYCLE_BIN:...] tag from notes directly and fast
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
      client: { id, is_deleted: false },
      message: "Client restored successfully from Recycle Bin",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to restore client" }, { status: 500 });
  }
}
