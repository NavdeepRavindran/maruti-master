import { NextResponse } from "next/server";
import { supabase } from "../../../../../../lib/supabaseClient";


// PUT /api/clients/[id]/family/[fid] — Update family member
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; fid: string }> }
) {
  const { id, fid } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  if (!supabase) {
    return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
  }

  try {
    const { data, error } = await supabase
      .from("family_members")
      .update(body)
      .eq("id", fid)
      .eq("client_id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ family_member: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/clients/[id]/family/[fid] — Delete family member
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; fid: string }> }
) {
  const { id, fid } = await params;

  if (!supabase) {
    return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
  }

  try {
    await supabase.from("documents").delete().eq("family_member_id", fid);
    const { error } = await supabase.from("family_members").delete().eq("id", fid).eq("client_id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
