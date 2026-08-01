import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseClient";

// DELETE /api/documents/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const admin = supabaseAdmin;

  if (!admin) {
    return NextResponse.json(
      { error: "Supabase Admin client not initialized" },
      { status: 500 }
    );
  }

  try {
    // Fetch document
    const { data: doc, error: fetchError } = await admin
      .from("documents")
      .select("file_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Fetch Error:", fetchError);

      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    // Delete file from storage
    if (doc?.file_url) {
      console.log("Stored URL:", doc.file_url);

      let storagePath = "";

      if (doc.file_url.includes("/documents/")) {
        storagePath = doc.file_url.split("/documents/")[1];
      } else {
        storagePath = doc.file_url;
      }

      console.log("Storage Path:", storagePath);

      if (storagePath) {
        const { error: storageError } = await admin.storage
          .from("documents")
          .remove([storagePath]);

        if (storageError) {
          console.error("Storage Delete Error:", storageError);
          // Continue deleting database row even if storage deletion fails
        }
      }
    }

    // Delete database record
    const { error: deleteError } = await admin
      .from("documents")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Database Delete Error:", deleteError);

      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });

  } catch (err: unknown) {
    console.error("Unexpected Error:", err);

    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}