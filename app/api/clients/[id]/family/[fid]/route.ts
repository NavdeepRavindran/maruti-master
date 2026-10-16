import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabaseClient";
import { formatFamilyName, validateDateRange } from "@/lib/formatUtils";

// PUT /api/clients/[id]/family/[fid]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; fid: string }> }
) {
  const { id, fid } = await params;
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (body.date_of_birth) {
    const dobVal = validateDateRange(body.date_of_birth, "Date of birth");
    if (!dobVal.isValid) {
      return NextResponse.json({ error: dobVal.error }, { status: 400 });
    }
  }

  try {
    if (!supabaseAdmin) throw new Error("Supabase Admin client not initialized");

    const updatePayload: Record<string, any> = {};
    if (body.name !== undefined) updatePayload.name = formatFamilyName(body.name);
    if (body.relationship !== undefined) updatePayload.relationship = body.relationship;
    if (body.date_of_birth !== undefined) updatePayload.date_of_birth = body.date_of_birth;
    if (body.phone !== undefined) updatePayload.phone = body.phone;
    if (body.occupation !== undefined) updatePayload.occupation = body.occupation;
    if (body.notes !== undefined) updatePayload.notes = body.notes;

    let updateRes = await supabaseAdmin
      .from("family_members")
      .update(updatePayload)
      .eq("id", fid)
      .eq("client_id", id)
      .select()
      .maybeSingle();

    if (updateRes.error) {
      // Schema resilience: retry removing unknown column
      let cur = { ...updatePayload };
      let lastErr: any = updateRes.error;
      while (Object.keys(cur).length > 0 && lastErr) {
        const msg = lastErr.message || "";
        const colMatch = msg.match(/column "(.*?)" of relation "family_members" does not exist/i) ||
                         msg.match(/Could not find the '(.*?)' column/i);
        if (colMatch && colMatch[1] && cur[colMatch[1]] !== undefined) {
          delete cur[colMatch[1]];
          const retry = await supabaseAdmin
            .from("family_members")
            .update(cur)
            .eq("id", fid)
            .eq("client_id", id)
            .select()
            .maybeSingle();
          if (!retry.error) {
            updateRes = retry;
            lastErr = null;
            break;
          }
          lastErr = retry.error;
        } else {
          break;
        }
      }
      if (lastErr) throw lastErr;
    }

    return NextResponse.json({ family_member: updateRes.data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update family member" }, { status: 500 });
  }
}

// DELETE /api/clients/[id]/family/[fid]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; fid: string }> }
) {
  const { id, fid } = await params;
  const { searchParams } = new URL(request.url);
  const permanent = searchParams.get("permanent") === "true";

  try {
    if (!supabaseAdmin) throw new Error("Supabase Admin client not initialized");

    if (permanent) {
      await supabaseAdmin.from("documents").delete().eq("family_member_id", fid);
      const { error: familyError } = await supabaseAdmin
        .from("family_members")
        .delete()
        .eq("id", fid)
        .eq("client_id", id);

      if (familyError) throw familyError;
      return NextResponse.json({ success: true, message: "Family member permanently deleted" });
    } else {
      // Soft-delete to this client's family recycle bin
      let updateRes = await supabaseAdmin
        .from("family_members")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", fid)
        .eq("client_id", id);

      if (updateRes.error) {
        updateRes = await supabaseAdmin
          .from("family_members")
          .update({ is_deleted: true })
          .eq("id", fid)
          .eq("client_id", id);
      }

      if (updateRes.error) {
        // Tag name fallback if column is_deleted does not exist
        const { data: fm } = await supabaseAdmin
          .from("family_members")
          .select("name")
          .eq("id", fid)
          .maybeSingle();
        const baseName = (fm?.name || "").replace(/^\[RECYCLE_BIN\]\s*/, "").trim();
        const taggedName = `[RECYCLE_BIN] ${baseName}`;
        const tagRes = await supabaseAdmin
          .from("family_members")
          .update({ name: taggedName })
          .eq("id", fid)
          .eq("client_id", id);
        if (tagRes.error) {
          throw updateRes.error;
        }
      }

      return NextResponse.json({ success: true, message: "Family member moved to Recycle Bin" });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete family member" }, { status: 500 });
  }
}