import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";

// DELETE /api/documents/[id] — Delete a document
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!supabase) {
    return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
  }

  try {
    // First get the document to find the storage path
    const { data: doc } = await supabase.from("documents").select("file_url").eq("id", id).single();
    
    // Delete from storage if file_url exists
    if (doc?.file_url) {
      const path = doc.file_url.split("/").slice(-2).join("/");
      await supabase.storage.from("documents").remove([path]);
    }

    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
