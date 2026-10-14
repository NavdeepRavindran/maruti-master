import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseClient";

// DELETE /api/documents/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = supabaseAdmin;

  try {
    if (!admin) throw new Error("No supabaseAdmin");

    const { data: doc } = await admin
      .from("documents")
      .select("file_url")
      .eq("id", id)
      .single();

    if (doc?.file_url) {
      const storagePath = doc.file_url.includes("/documents/")
        ? doc.file_url.split("/documents/")[1]
        : doc.file_url;

      if (storagePath) {
        await admin.storage.from("documents").remove([storagePath]).catch(() => {});
      }
    }

    const { error: deleteError } = await admin
      .from("documents")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete document" }, { status: 500 });
  }
}