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
    const { data, error } = await supabaseAdmin
      .from("clients")
      .update({ is_deleted: false, deleted_at: null })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({
      success: true,
      client: data,
      message: "Client restored successfully from Recycle Bin",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to restore client" }, { status: 500 });
  }
}
