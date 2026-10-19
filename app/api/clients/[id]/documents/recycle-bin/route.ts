import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

// DELETE /api/clients/[id]/documents/recycle-bin -> Empties the document Recycle Bin for this client
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = supabaseAdmin;

  try {
    if (!admin) throw new Error("Supabase Admin client not initialized");

    const { data: allDocs } = await admin
      .from("documents")
      .select("id, name, file_url, is_deleted")
      .eq("client_id", id);

    const recycledDocs = (allDocs || []).filter(
      (d: any) =>
        d.is_deleted === true ||
        d.is_deleted === "true" ||
        (typeof d.name === "string" && d.name.startsWith("[RECYCLE_BIN]"))
    );

    const recycledIds = recycledDocs.map((d: any) => d.id);

    if (recycledIds.length > 0) {
      // 1. Remove files from Supabase Storage
      const storagePaths = recycledDocs
        .map((d: any) => {
          if (!d.file_url) return null;
          return d.file_url.includes("/documents/")
            ? d.file_url.split("/documents/")[1]
            : d.file_url;
        })
        .filter(Boolean);

      if (storagePaths.length > 0) {
        await admin.storage.from("documents").remove(storagePaths).catch(() => {});
      }

      // 2. Permanently delete document rows
      await admin.from("documents").delete().in("id", recycledIds);
    }

    return NextResponse.json({
      success: true,
      count: recycledIds.length,
      message: "Client's document Recycle Bin emptied successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to empty document Recycle Bin" },
      { status: 500 }
    );
  }
}
