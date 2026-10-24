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

    // Get document details before deletion/tagging
    const { data: docInfo } = await admin
      .from("documents")
      .select("client_id, file_url, name")
      .eq("id", id)
      .maybeSingle();

    const clientId = docInfo?.client_id;

    if (permanent) {
      // 1. Remove physical file from storage
      if (docInfo?.file_url) {
        const storagePath = docInfo.file_url.includes("/documents/")
          ? docInfo.file_url.split("/documents/")[1]
          : docInfo.file_url;

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
    } else {
      // Soft-delete to Document Recycle Bin by tagging name
      const baseName = (docInfo?.name || "").replace(/^\[RECYCLE_BIN\]\s*/, "").trim();
      const taggedName = `[RECYCLE_BIN] ${baseName}`;
      const { error: tagErr } = await admin
        .from("documents")
        .update({ name: taggedName, is_deleted: true })
        .eq("id", id);

      if (tagErr) throw tagErr;
    }

    // Re-evaluate client's status if any KYC document was deleted
    if (clientId) {
      try {
        const { data: remDocs } = await admin
          .from("documents")
          .select("category, name, file_name, is_deleted")
          .eq("client_id", clientId);

        const hasRemainingKyc = (remDocs || []).some(
          (d: any) =>
            d.is_deleted !== true &&
            d.is_deleted !== "true" &&
            !(typeof d.name === "string" && d.name.startsWith("[RECYCLE_BIN]")) &&
            (
              d.category === "KYC / Identity" ||
              d.category === "KYC" ||
              /ckyc|kyc|aadhaar|pan/i.test(d.name || "") ||
              /ckyc|kyc|aadhaar|pan/i.test(d.file_name || "")
            )
        );

        if (!hasRemainingKyc) {
          const { data: cl } = await admin
            .from("clients")
            .select("status")
            .eq("id", clientId)
            .maybeSingle();
          if (cl && cl.status === "Active") {
            await admin
              .from("clients")
              .update({ status: "Pending" })
              .eq("id", clientId);
          }
        }
      } catch (checkErr) {
        console.warn("Failed to update client status after document deletion:", checkErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: permanent ? "Document permanently deleted" : "Document moved to Recycle Bin",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete document" }, { status: 500 });
  }
}