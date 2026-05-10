import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";


// GET /api/clients/[id] — Get single client with family & docs
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!supabase) {
    return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
  }

  try {
    const { data: client, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const { data: family } = await supabase
      .from("family_members")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: true });

    const { data: docs } = await supabase
      .from("documents")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      client: { ...client, family_count: family?.length || 0, document_count: docs?.length || 0 },
      family_members: family || [],
      documents: docs || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/clients/[id] — Update client
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  if (!supabase) {
    return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
  }

  try {
    const { data, error } = await supabase
      .from("clients")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ client: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/clients/[id] — Delete client and all associated data
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!supabase) {
    return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
  }

  try {
    // Delete documents, family members, then client (cascade should handle this with FK)
    await supabase.from("documents").delete().eq("client_id", id);
    await supabase.from("family_members").delete().eq("client_id", id);
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
