import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseClient";

// GET /api/clients/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server misconfigured: missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }

  try {
    const { data: client, error } = await supabaseAdmin
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("GET /api/clients/[id] error:", error);
      throw error;
    }
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const { data: family } = await supabaseAdmin
      .from("family_members")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: true });

    const { data: docs } = await supabaseAdmin
      .from("documents")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      client: {
        ...client,
        family_count: family?.length || 0,
        document_count: docs?.length || 0,
      },
      family_members: family || [],
      documents: docs || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/clients/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server misconfigured: missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }

  try {
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updatePayload.name = body.name;
    if (body.surname !== undefined) updatePayload.surname = body.surname;
    if (body.phone !== undefined) updatePayload.phone = body.phone;
    if (body.alternate_mobile !== undefined || body.alternateMobile !== undefined) {
      updatePayload.alternate_mobile = body.alternate_mobile ?? body.alternateMobile;
    }
    if (body.email !== undefined) updatePayload.email = body.email;
    if (body.date_of_birth !== undefined) updatePayload.date_of_birth = body.date_of_birth;
    if (body.anniversary_date !== undefined || body.anniversaryDate !== undefined) {
      updatePayload.anniversary_date = body.anniversary_date ?? body.anniversaryDate;
    }
    if (body.gender !== undefined) updatePayload.gender = body.gender;
    if (body.marital_status !== undefined || body.maritalStatus !== undefined) {
      updatePayload.marital_status = body.marital_status ?? body.maritalStatus;
    }
    if (body.occupation !== undefined) updatePayload.occupation = body.occupation;
    if (body.address !== undefined) updatePayload.address = body.address;
    if (body.city !== undefined) updatePayload.city = body.city;
    if (body.state !== undefined) updatePayload.state = body.state;
    if (body.pin_code !== undefined || body.pinCode !== undefined) {
      updatePayload.pin_code = body.pin_code ?? body.pinCode;
    }
    if (body.notes !== undefined) updatePayload.notes = body.notes;
    if (body.profile_pic !== undefined) updatePayload.profile_pic = body.profile_pic;
    if (body.status !== undefined) updatePayload.status = body.status;

    const { data, error } = await supabaseAdmin
      .from("clients")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("PUT /api/clients/[id] error:", error);
      throw error;
    }
    return NextResponse.json({ client: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/clients/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server misconfigured: missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }

  try {
    await supabaseAdmin.from("documents").delete().eq("client_id", id);
    await supabaseAdmin.from("family_members").delete().eq("client_id", id);
    const { error } = await supabaseAdmin.from("clients").delete().eq("id", id);
    if (error) {
      console.error("DELETE /api/clients/[id] error:", error);
      throw error;
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}