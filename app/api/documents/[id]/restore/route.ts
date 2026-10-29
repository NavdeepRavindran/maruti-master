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

    // Fast restore by stripping [RECYCLE_BIN] prefix from name and resetting is_deleted
    const { data: doc } = await admin
      .from("documents")
      .select("client_id, category, name, file_name")
      .eq("id", id)
      .maybeSingle();

    if (doc?.name) {
      const cleanName = doc.name.replace(/^\[RECYCLE_BIN\]\s*/, "").trim();
      await admin
        .from("documents")
        .update({ name: cleanName })
        .eq("id", id);

      const isKyc = (
        doc.category === "KYC / Identity" ||
        doc.category === "KYC" ||
        /ckyc|kyc|aadhaar|pan/i.test(cleanName) ||
        /ckyc|kyc|aadhaar|pan/i.test(doc.file_name || "")
      );

      if (isKyc && doc.client_id) {
        const { data: cl } = await admin
          .from("clients")
          .select("status")
          .eq("id", doc.client_id)
          .maybeSingle();
        if (cl && cl.status !== "Inactive") {
          await admin
            .from("clients")
            .update({ status: "Active" })
            .eq("id", doc.client_id);
        }
      }
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
