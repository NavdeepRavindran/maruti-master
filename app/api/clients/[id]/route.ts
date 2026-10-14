import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseClient";

import { validateEmail } from "@/lib/emailValidator";
import { validateDateRange } from "@/lib/formatUtils";

// GET /api/clients/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    if (!supabaseAdmin) throw new Error("No supabaseAdmin");

    const { data: client, error } = await supabaseAdmin
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !client) throw error || new Error("Client not found");

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
    return NextResponse.json({ error: err.message || "Client not found" }, { status: 404 });
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

  if (body.date_of_birth) {
    const dobVal = validateDateRange(body.date_of_birth, "Date of birth");
    if (!dobVal.isValid) {
      return NextResponse.json({ error: dobVal.error }, { status: 400 });
    }
  }

  const anniv = body.anniversary_date ?? body.anniversaryDate;
  if (anniv) {
    const annivVal = validateDateRange(anniv, "Anniversary date");
    if (!annivVal.isValid) {
      return NextResponse.json({ error: annivVal.error }, { status: 400 });
    }
    if (body.date_of_birth && anniv < body.date_of_birth) {
      return NextResponse.json(
        { error: "Anniversary date cannot be earlier than Date of Birth." },
        { status: 400 }
      );
    }
  }

  try {
    if (!supabaseAdmin) throw new Error("No supabaseAdmin");

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updatePayload.name = body.name;
    if (body.surname !== undefined) updatePayload.surname = typeof body.surname === "string" ? body.surname.trim().toUpperCase() : body.surname;
    if (body.phone !== undefined) updatePayload.phone = body.phone;
    if (body.alternate_mobile !== undefined || body.alternateMobile !== undefined) {
      updatePayload.alternate_mobile = body.alternate_mobile ?? body.alternateMobile;
    }
    if (body.email !== undefined) {
      const emailVal = validateEmail(body.email);
      if (!emailVal.isValid) {
        return NextResponse.json({ error: emailVal.error }, { status: 400 });
      }
      updatePayload.email = body.email.trim().toLowerCase();
    }
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

    if (error) throw error;
    return NextResponse.json({ client: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update client" }, { status: 500 });
  }
}

// DELETE /api/clients/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const permanent = searchParams.get("permanent") === "true";

  try {
    if (!supabaseAdmin) throw new Error("No supabaseAdmin");

    // Auto-purge soft-deleted clients older than 3 months (90 days) permanently
    try {
      const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      await supabaseAdmin
        .from("clients")
        .delete()
        .eq("is_deleted", true)
        .lt("deleted_at", threeMonthsAgo);
    } catch {}

    if (permanent) {
      await supabaseAdmin.from("documents").delete().eq("client_id", id);
      await supabaseAdmin.from("family_members").delete().eq("client_id", id);
      const { error } = await supabaseAdmin.from("clients").delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true, message: "Client permanently deleted" });
    } else {
      const { error } = await supabaseAdmin
        .from("clients")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true, message: "Client moved to Recycle Bin" });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete client" }, { status: 500 });
  }
}