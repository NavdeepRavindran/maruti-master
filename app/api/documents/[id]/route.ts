import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseClient";

// DELETE /api/documents/[id]?permanent=true|false
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = supabaseAdmin;
  const { searchParams } = new URL(request.url);
  const permanent = searchParams.get("permanent") === "true";

  try {
    if (!admin) throw new Error("No supabaseAdmin");

    if (permanent) {
      // 1. Remove physical file from storage
      const { data: doc } = await admin
        .from("documents")
        .select("file_url")
        .eq("id", id)
        .maybeSingle();

      if (doc?.file_url) {
        const storagePath = doc.file_url.includes("/documents/")
          ? doc.file_url.split("/documents/")[1]
          : doc.file_url;

        if (storagePath) {
          await admin.storage.from("documents").remove([storagePath]).catch(() => {});
        }
      }

      // 2. Permanently delete DB record
      const { error: deleteError } = await admin
        .from("documents")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      return NextResponse.json({
        success: true,
        message: "Document permanently deleted",
      });
    } else {
      // Soft-delete to Document Recycle Bin by tagging name
      const { data: doc } = await admin
        .from("documents")
        .select("name")
        .eq("id", id)
        .maybeSingle();

      const baseName = (doc?.name || "").replace(/^\[RECYCLE_BIN\]\s*/, "").trim();
      const taggedName = `[RECYCLE_BIN] ${baseName}`;
      const { error: tagErr } = await admin
        .from("documents")
        .update({ name: taggedName })
        .eq("id", id);

      if (tagErr) throw tagErr;

      return NextResponse.json({
        success: true,
        message: "Document moved to Recycle Bin",
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete document" }, { status: 500 });
  }
}