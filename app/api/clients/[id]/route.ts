import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseClient";

import { validateEmail } from "@/lib/emailValidator";
import { validateDateRange, isValidDateYear, formatClientDisplayName } from "@/lib/formatUtils";

// GET /api/clients/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    if (!supabaseAdmin) throw new Error("No supabaseAdmin");

    // Fetch client, family members, and documents in parallel for high performance
    const [clientRes, famRes, docsRes] = await Promise.all([
      supabaseAdmin.from("clients").select("*").eq("id", id).single(),
      supabaseAdmin.from("family_members").select("*").eq("client_id", id),
      supabaseAdmin.from("documents").select("*").eq("client_id", id),
    ]);

    const client = clientRes.data;
    if (clientRes.error || !client) throw clientRes.error || new Error("Client not found");

    const family = famRes.data || [];

    const isFamilyDeleted = (fm: any) => {
      if (fm.is_deleted === true || fm.is_deleted === "true") return true;
      if (typeof fm.name === "string" && fm.name.startsWith("[RECYCLE_BIN]")) return true;
      return false;
    };

    const getFamilyOccupation = (fm: any) => {
      if (fm.occupation) return fm.occupation;
      if (typeof fm.name === "string") {
        const match = fm.name.match(/\[OCC:\s*(.*?)\]/);
        if (match) return match[1].trim();
      }
      return "";
    };

    const cleanFamilyName = (fm: any) => {
      const raw = typeof fm.name === "string" ? fm.name : "";
      return raw.replace(/^\[RECYCLE_BIN\]\s*/, "").replace(/\[OCC:\s*.*?\]/g, "").trim();
    };

    const activeFamily = family.filter((f) => !isFamilyDeleted(f)).map((f) => ({
      ...f,
      name: cleanFamilyName(f),
      occupation: getFamilyOccupation(f),
      is_deleted: false,
    }));

    const recycledFamily = family.filter((f) => isFamilyDeleted(f)).map((f) => ({
      ...f,
      name: cleanFamilyName(f),
      occupation: getFamilyOccupation(f),
      is_deleted: true,
    }));

    const rawDocs = docsRes.data || [];

    const isDocDeleted = (d: any) => {
      if (d.is_deleted === true || d.is_deleted === "true") return true;
      if (typeof d.name === "string" && d.name.startsWith("[RECYCLE_BIN]")) return true;
      return false;
    };

    const cleanDocName = (d: any) => {
      const raw = typeof d.name === "string" ? d.name : "";
      return raw.replace(/^\[RECYCLE_BIN\]\s*/, "").trim();
    };

    const activeDocs = rawDocs
      .filter((d) => !isDocDeleted(d))
      .map((d) => ({
        ...d,
        name: cleanDocName(d),
        is_deleted: false,
      }));

    const recycledDocs = rawDocs
      .filter((d) => isDocDeleted(d))
      .map((d) => ({
        ...d,
        name: cleanDocName(d),
        is_deleted: true,
      }));

    const rawSurname = client.surname || client.fatherName || client.father_name || "";
    const { firstName: clientFirstName, surname: clientSurname, fullName: clientFullName } =
      formatClientDisplayName(client.name, rawSurname);

    const isDeleted = Boolean(
      client.is_deleted === true ||
      client.is_deleted === "true" ||
      (typeof client.notes === "string" && client.notes.includes("[RECYCLE_BIN:"))
    );

    const hasKyc = activeDocs.some(
      (d: any) =>
        d.category === "KYC / Identity" ||
        d.category === "KYC" ||
        /ckyc|kyc|aadhaar|pan/i.test(d.name || "") ||
        /ckyc|kyc|aadhaar|pan/i.test(d.file_name || "")
    );

    const computedStatus = client.status === "Inactive"
      ? "Inactive"
      : (hasKyc ? "Active" : "Pending");

    // Self-heal DB status if it is mismatched
    if (client.status !== "Inactive" && client.status !== computedStatus) {
      try {
        await supabaseAdmin
          .from("clients")
          .update({ status: computedStatus })
          .eq("id", id);
      } catch {}
    }

    return NextResponse.json({
      client: {
        ...client,
        name: clientFirstName,
        surname: clientSurname,
        fullName: clientFullName,
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
        status: computedStatus,
        has_kyc: hasKyc,
        hasKyc: hasKyc,
        clientloginid: client.clientloginid || client.clientLoginId || client.phone || "",
        plain_password: client.plain_password || client.plainPassword || client.temporarypassword || "",
        is_deleted: isDeleted,
        family_count: activeFamily.length,
        document_count: activeDocs.length,
      },
      family_members: activeFamily,
      recycled_family_members: recycledFamily,
      documents: activeDocs,
      recycled_documents: recycledDocs,
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
    // Accurately check whether client has any active KYC documents
    let hasKyc = false;
    try {
      const { data: docs } = await supabaseAdmin
        .from("documents")
        .select("category, name, file_name, is_deleted")
        .eq("client_id", id);
      const nonDeletedDocs = (docs || []).filter(
        (d: any) =>
          d.is_deleted !== true &&
          d.is_deleted !== "true" &&
          !(typeof d.name === "string" && d.name.startsWith("[RECYCLE_BIN]"))
      );
      hasKyc = nonDeletedDocs.some(
        (d: any) =>
          d.category === "KYC / Identity" ||
          d.category === "KYC" ||
          /ckyc|kyc|aadhaar|pan/i.test(d.name || "") ||
          /ckyc|kyc|aadhaar|pan/i.test(d.file_name || "")
      );
    } catch {}

    if (body.status !== undefined) {
      if (body.status === "Inactive") {
        updatePayload.status = "Inactive";
      } else {
        // Can ONLY be Active if KYC document is uploaded!
        updatePayload.status = hasKyc ? "Active" : "Pending";
      }
    } else {
      // If status wasn't explicitly passed, ensure any non-inactive client status matches KYC presence
      const { data: curClient } = await supabaseAdmin
        .from("clients")
        .select("status")
        .eq("id", id)
        .maybeSingle();
      if (curClient && curClient.status !== "Inactive") {
        updatePayload.status = hasKyc ? "Active" : "Pending";
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

    const finalStatus = updateRes.data?.status ?? updatePayload.status ?? (hasKyc ? "Active" : "Pending");
    return NextResponse.json({
      client: {
        ...updateRes.data,
        status: finalStatus,
        has_kyc: hasKyc,
        hasKyc: hasKyc,
      },
    });
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

    if (permanent) {
      await supabaseAdmin.from("documents").delete().eq("client_id", id);
      await supabaseAdmin.from("family_members").delete().eq("client_id", id);
      const { error } = await supabaseAdmin.from("clients").delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true, message: "Client permanently deleted" });
    } else {
      // Direct, fast soft-delete via notes tagging
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

      if (notesRes.error) throw notesRes.error;
      return NextResponse.json({ success: true, message: "Client moved to Recycle Bin" });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete client" }, { status: 500 });
  }
}