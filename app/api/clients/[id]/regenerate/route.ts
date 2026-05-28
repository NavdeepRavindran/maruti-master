import { NextResponse } from "next/server";
import { supabase } from "../../../../../lib/supabaseClient";

// POST /api/clients/[id]/regenerate — Regenerate a temporary password
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!supabase) {
    return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
  }

  try {
    // Generate secure 8-character temporary password
    const temporaryPassword = crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase();

    const { data, error } = await supabase
      .from("clients")
      .update({ temporaryPassword, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("temporaryPassword")
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    return NextResponse.json({ client: data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
