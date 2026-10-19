import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabaseClient";

// POST /api/documents/[id]/restore -> Restores a document from Recycle Bin
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = supabaseAdmin;

  try {
    if (!admin) throw new Error("No supabaseAdmin");

    // Fast restore by stripping [RECYCLE_BIN] prefix from name
    const { data: doc } = await admin
      .from("documents")
      .select("name")
      .eq("id", id)
      .maybeSingle();

    if (doc?.name && doc.name.startsWith("[RECYCLE_BIN]")) {
      const cleanName = doc.name.replace(/^\[RECYCLE_BIN\]\s*/, "").trim();
      await admin
        .from("documents")
        .update({ name: cleanName })
        .eq("id", id);
    }

    return NextResponse.json({
      success: true,
      document: { id },
      message: "Document restored successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to restore document" }, { status: 500 });
  }
}
