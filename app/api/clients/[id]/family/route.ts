import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabaseClient";
import { formatFamilyName, validateDateRange } from "@/lib/formatUtils";

// GET /api/clients/[id]/family — List family members for a client
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  try {
    if (!supabaseAdmin) throw new Error("Supabase client not initialized");

    const { data, error } = await supabaseAdmin
      .from("family_members")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const isFamilyDeleted = (m: any) => {
      if (m.is_deleted === true || m.is_deleted === "true") return true;
      if (typeof m.name === "string" && m.name.startsWith("[RECYCLE_BIN]")) return true;
      return false;
    };

    const getFamilyOccupation = (m: any) => {
      if (m.occupation) return m.occupation;
      if (typeof m.name === "string") {
        const match = m.name.match(/\[OCC:\s*(.*?)\]/);
        if (match) return match[1].trim();
      }
      return "";
    };

    const cleanFamilyName = (m: any) => {
      const raw = typeof m.name === "string" ? m.name : "";
      return formatFamilyName(raw.replace(/^\[RECYCLE_BIN\]\s*/, "").replace(/\[OCC:\s*.*?\]/g, "").trim());
    };

    const activeMembers = (data || [])
      .filter((m: any) => !isFamilyDeleted(m))
      .map((m: any) => ({
        ...m,
        name: cleanFamilyName(m),
        occupation: getFamilyOccupation(m),
        is_deleted: false,
      }));

    const recycledMembers = (data || [])
      .filter((m: any) => isFamilyDeleted(m))
      .map((m: any) => ({
        ...m,
        name: cleanFamilyName(m),
        occupation: getFamilyOccupation(m),
        is_deleted: true,
      }));

    if (status === "recycle_bin") {
      return NextResponse.json({
        family_members: recycledMembers,
        recycled_family_members: recycledMembers,
      });
    }

    return NextResponse.json({
      family_members: activeMembers,
      recycled_family_members: recycledMembers,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch family members" }, { status: 500 });
  }
}

// POST /api/clients/[id]/family — Add a family member
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || !body.name || !body.date_of_birth || !body.relationship) {
    return NextResponse.json({ error: "Name, date of birth, and relationship are required." }, { status: 400 });
  }

  const dobVal = validateDateRange(body.date_of_birth, "Date of birth");
  if (!dobVal.isValid) {
    return NextResponse.json({ error: dobVal.error }, { status: 400 });
  }

  const cleanName = formatFamilyName(body.name);
  const rawOccupation = (body.occupation || "").trim();
  const storedName = rawOccupation ? `${cleanName} [OCC: ${rawOccupation}]` : cleanName;

  try {
    if (!supabaseAdmin) throw new Error("Supabase client not initialized");

    const insertPayload: Record<string, any> = {
      client_id: id,
      name: storedName,
      date_of_birth: body.date_of_birth,
      relationship: body.relationship,
    };
    if (body.phone) insertPayload.phone = body.phone;
    if (rawOccupation) insertPayload.occupation = rawOccupation;
    if (body.photo_url) insertPayload.photo_url = body.photo_url;

    let res = await supabaseAdmin
      .from("family_members")
      .insert(insertPayload)
      .select()
      .single();

    if (res.error) {
      // Schema resilience: retry removing unknown column (like occupation or photo_url if column does not exist)
      let cur = { ...insertPayload };
      let lastErr: any = res.error;
      while (lastErr) {
        const msg = lastErr.message || "";
        const colMatch =
          msg.match(/column "(.*?)" of relation "family_members" does not exist/i) ||
          msg.match(/Could not find the '(.*?)' column/i);
        if (colMatch && colMatch[1] && cur[colMatch[1]] !== undefined) {
          delete cur[colMatch[1]];
          const retry = await supabaseAdmin
            .from("family_members")
            .insert(cur)
            .select()
            .single();
          if (!retry.error) {
            res = retry;
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

    const savedData = {
      ...res.data,
      name: cleanName,
      occupation: rawOccupation,
      photo_url: res.data?.photo_url || body.photo_url || null,
    };

    return NextResponse.json({ family_member: savedData }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to add family member" }, { status: 500 });
  }
}