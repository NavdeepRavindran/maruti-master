import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseClient";

import { validateEmail } from "@/lib/emailValidator";
import { validateDateRange, isValidDateYear } from "@/lib/formatUtils";

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

    let family: any[] = [];
    try {
      const { data } = await supabaseAdmin
        .from("family_members")
        .select("*")
        .eq("client_id", id);
      if (data) family = data;
    } catch {}

    const isFamilyDeleted = (fm: any) => {
      if (fm.is_deleted === true || fm.is_deleted === "true") return true;
      if (typeof fm.name === "string" && fm.name.startsWith("[RECYCLE_BIN]")) return true;
      return false;
    };

    const cleanFamilyName = (fm: any) => {
      const raw = typeof fm.name === "string" ? fm.name : "";
      return raw.replace(/^\[RECYCLE_BIN\]\s*/, "").trim();
    };

    const activeFamily = family.filter((f) => !isFamilyDeleted(f)).map((f) => ({
      ...f,
      name: cleanFamilyName(f),
      is_deleted: false,
    }));

    const recycledFamily = family.filter((f) => isFamilyDeleted(f)).map((f) => ({
      ...f,
      name: cleanFamilyName(f),
      is_deleted: true,
    }));

    let docs: any[] = [];
    try {
      const { data } = await supabaseAdmin
        .from("documents")
        .select("*")
        .eq("client_id", id);
      if (data) docs = data;
    } catch {}

    const rawSurname = client.surname || client.fatherName || client.father_name || "";
    const surname = rawSurname ? rawSurname.toUpperCase() : "";

    const isDeleted = Boolean(
      client.is_deleted === true ||
      client.is_deleted === "true" ||
      (typeof client.notes === "string" && client.notes.includes("[RECYCLE_BIN:"))
    );

    return NextResponse.json({
      client: {
        ...client,
        surname,
        fullName: `${client.name || ""}${surname ? " " + surname : ""}`.trim(),
        alternate_mobile: client.alternate_mobile || client.alternateMobile || "",
        alternateMobile: client.alternate_mobile || client.alternateMobile || "",
        pin_code: client.pin_code || client.pinCode || "",
        pinCode: client.pin_code || client.pinCode || "",
        date_of_birth: client.date_of_birth || client.dob || "",
        anniversary_date: isValidDateYear(client.anniversary_date || client.anniversaryDate)
          ? (client.anniversary_date || client.anniversaryDate)
          : "",
        anniversaryDate: isValidDateYear(client.anniversary_date || client.anniversaryDate)
          ? (client.anniversary_date || client.anniversaryDate)
          : "",
        clientloginid: client.clientloginid || client.clientLoginId || client.phone || "",
        plain_password: client.plain_password || client.plainPassword || client.temporarypassword || "",
        is_deleted: isDeleted,
        family_count: activeFamily.length,
        document_count: docs.length,
      },
      family_members: activeFamily,
      recycled_family_members: recycledFamily,
      documents: docs,
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
  if (anniv && typeof anniv === "string" && anniv.trim() !== "") {
    const annivVal = validateDateRange(anniv.trim(), "Anniversary date");
    if (!annivVal.isValid) {
      return NextResponse.json({ error: annivVal.error }, { status: 400 });
    }
    if (body.date_of_birth && anniv.trim() < body.date_of_birth) {
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
    if (body.date_of_birth !== undefined) updatePayload.date_of_birth = body.date_of_birth || null;
    
    // Safely convert empty string anniversary date to null for postgres
    if (anniv && typeof anniv === "string" && anniv.trim() !== "") {
      updatePayload.anniversary_date = anniv.trim();
    } else if (body.anniversary_date !== undefined || body.anniversaryDate !== undefined) {
      updatePayload.anniversary_date = null;
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
    if (body.notes !== undefined) updatePayload.notes = body.notes ?? "";
    if (body.profile_pic !== undefined) updatePayload.profile_pic = body.profile_pic;
    if (body.status !== undefined) {
      if (body.status === "Active") {
        let hasKyc = false;
        try {
          const { data: docs } = await supabaseAdmin
            .from("documents")
            .select("category, name, file_name")
            .eq("client_id", id);
          hasKyc = (docs || []).some(
            (d: any) =>
              d.category === "KYC / Identity" ||
              d.category === "KYC" ||
              /ckyc|kyc|aadhaar|pan/i.test(d.name || "") ||
              /ckyc|kyc|aadhaar|pan/i.test(d.file_name || "")
          );
        } catch {}
        updatePayload.status = hasKyc ? "Active" : "Pending";
      } else {
        updatePayload.status = body.status;
      }
    }

    let updateRes = await supabaseAdmin
      .from("clients")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (updateRes.error) {
      // Schema resilience fallback: retry by removing column if not present in DB
      let curPayload = { ...updatePayload };
      let lastErr: any = updateRes.error;
      while (Object.keys(curPayload).length > 0 && lastErr) {
        const msg = lastErr.message || "";
        const colMatch = msg.match(/column "(.*?)" of relation "clients" does not exist/i) ||
                         msg.match(/Could not find the '(.*?)' column/i);
        if (colMatch && colMatch[1] && curPayload[colMatch[1]] !== undefined) {
          delete curPayload[colMatch[1]];
          const retryRes = await supabaseAdmin
            .from("clients")
            .update(curPayload)
            .eq("id", id)
            .select()
            .maybeSingle();
          if (!retryRes.error) {
            updateRes = retryRes;
            lastErr = null;
            break;
          }
          lastErr = retryRes.error;
        } else {
          break;
        }
      }
      if (lastErr) throw lastErr;
    }

    return NextResponse.json({ client: updateRes.data });
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
      let updateRes = await supabaseAdmin
        .from("clients")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (updateRes.error) {
        updateRes = await supabaseAdmin
          .from("clients")
          .update({ is_deleted: true })
          .eq("id", id);
      }
      if (updateRes.error) {
        // Fallback: If is_deleted column does not exist in DB, tag notes
        const { data: clientData } = await supabaseAdmin
          .from("clients")
          .select("notes")
          .eq("id", id)
          .maybeSingle();
        const existingNotes = clientData?.notes || "";
        const tag = `[RECYCLE_BIN:${new Date().toISOString()}]`;
        const updatedNotes = existingNotes ? `${existingNotes}\n${tag}` : tag;
        const notesRes = await supabaseAdmin
          .from("clients")
          .update({ notes: updatedNotes })
          .eq("id", id);
        if (notesRes.error) {
          throw updateRes.error;
        }
      }
      return NextResponse.json({ success: true, message: "Client moved to Recycle Bin" });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete client" }, { status: 500 });
  }
}