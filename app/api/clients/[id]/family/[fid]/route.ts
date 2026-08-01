import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabaseClient";

// PUT /api/clients/[id]/family/[fid]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; fid: string }> }
) {
  const { id, fid } = await params;
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { error: "Invalid body" },
      { status: 400 }
    );
  }

  const admin = supabaseAdmin;

  if (!admin) {
    return NextResponse.json(
      { error: "Supabase Admin client not initialized" },
      { status: 500 }
    );
  }

  try {
    const { data, error } = await admin
      .from("family_members")
      .update(body)
      .eq("id", fid)
      .eq("client_id", id)
      .select()
      .single();

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      family_member: data,
    });

  } catch (err: unknown) {
    console.error(err);

    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id]/family/[fid]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; fid: string }> }
) {
  const { id, fid } = await params;

  const admin = supabaseAdmin;

  if (!admin) {
    return NextResponse.json(
      { error: "Supabase Admin client not initialized" },
      { status: 500 }
    );
  }

  try {
    // Delete all documents belonging to this family member
    const { error: docsError } = await admin
      .from("documents")
      .delete()
      .eq("family_member_id", fid);

    if (docsError) {
      console.error("Document Delete Error:", docsError);

      return NextResponse.json(
        { error: docsError.message },
        { status: 500 }
      );
    }

    // Delete family member
    const { error: familyError } = await admin
      .from("family_members")
      .delete()
      .eq("id", fid)
      .eq("client_id", id);

    if (familyError) {
      console.error("Family Delete Error:", familyError);

      return NextResponse.json(
        { error: familyError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });

  } catch (err: unknown) {
    console.error(err);

    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}