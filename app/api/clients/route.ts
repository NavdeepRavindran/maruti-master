import { NextResponse } from "next/server";
import { supabaseAdmin, supabaseAuth } from "../../../lib/supabaseClient";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { isValidEmail, getEmailError } from "@/lib/emailValidator";
import { validateDateRange, isValidDateYear } from "@/lib/formatUtils";

const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  surname: z.string().min(1, "Surname is required"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  alternateMobile: z.string().optional(),
  email: z.string().superRefine((val, ctx) => {
    const err = getEmailError(val);
    if (err) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: err,
      });
    }
  }),
  date_of_birth: z.string().min(1, "Date of birth is required").superRefine((val, ctx) => {
    const res = validateDateRange(val, "Date of birth");
    if (!res.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: res.error || "Invalid Date of birth",
      });
    }
  }),
  anniversaryDate: z.string().optional().nullable().superRefine((val, ctx) => {
    if (!val || val.trim() === "") return;
    const res = validateDateRange(val, "Anniversary date");
    if (!res.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: res.error || "Invalid Anniversary date",
      });
    }
  }),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),
  occupation: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pinCode: z.string().regex(/^\d{6}$/, "PIN Code must be 6 digits"),
  notes: z.string().optional(),
  agent_id: z.string().optional(),
  profile_pic: z.string().optional(),
}).refine(
  (data) => {
    if (!data.anniversaryDate || data.anniversaryDate.trim() === "") return true;
    const today = new Date().toISOString().split("T")[0];
    if (data.anniversaryDate > today) return false;
    if (data.date_of_birth && data.anniversaryDate < data.date_of_birth) return false;
    return true;
  },
  {
    message: "Anniversary date cannot be in the future or before Date of Birth",
    path: ["anniversaryDate"],
  }
);

// ── Auth helper ────────────────────────────────────────────────────────────
async function getAuthUser(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

// GET /api/clients
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    if (!supabaseAdmin) throw new Error("No supabaseAdmin");

    // Parallel queries to fetch clients, documents, and family members efficiently
    const [clientsRes, docsRes, famRes] = await Promise.all([
      supabaseAdmin.from("clients").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("documents").select("client_id, category, name, file_name, is_deleted"),
      supabaseAdmin.from("family_members").select("client_id, name"),
    ]);

    let data = clientsRes.data;
    if (clientsRes.error) {
      const fallback = await supabaseAdmin.from("clients").select("*");
      if (fallback.error) throw fallback.error;
      data = fallback.data;
    }

    // Safely collect document and family member counts
    let docCounts: Record<string, number> = {};
    let familyCounts: Record<string, number> = {};
    let hasKyc: Record<string, boolean> = {};

    if (docsRes.data) {
      for (const d of docsRes.data) {
        const isDeleted =
          d.is_deleted === true ||
          d.is_deleted === "true" ||
          (typeof d.name === "string" && d.name.startsWith("[RECYCLE_BIN]"));
        if (d.client_id && !isDeleted) {
          docCounts[d.client_id] = (docCounts[d.client_id] || 0) + 1;
          const isKyc = (
            d.category === "KYC / Identity" ||
            d.category === "KYC" ||
            /ckyc|kyc|aadhaar|pan/i.test(d.name || "") ||
            /ckyc|kyc|aadhaar|pan/i.test(d.file_name || "")
          );
          if (isKyc) {
            hasKyc[d.client_id] = true;
          }
        }
      }
    }

    if (famRes.data) {
      for (const f of famRes.data) {
        const isDeleted = typeof f.name === "string" && f.name.startsWith("[RECYCLE_BIN]");
        if (f.client_id && !isDeleted) {
          familyCounts[f.client_id] = (familyCounts[f.client_id] || 0) + 1;
        }
      }
    }

    // A client can ONLY be Active if they have an active KYC document uploaded
    const getComputedStatus = (c: any) => {
      if (c.status === "Inactive") return "Inactive";
      return hasKyc[c.id] ? "Active" : "Pending";
    };

    // Self-healing database sync in background: fix any clients with mismatched status in Supabase
    try {
      const activeWithoutKyc = (data || [])
        .filter((c: any) => c.status === "Active" && !hasKyc[c.id])
        .map((c: any) => c.id);
      if (activeWithoutKyc.length > 0) {
        await supabaseAdmin
          .from("clients")
          .update({ status: "Pending" })
          .in("id", activeWithoutKyc);
      }
      const pendingWithKyc = (data || [])
        .filter((c: any) => c.status === "Pending" && hasKyc[c.id])
        .map((c: any) => c.id);
      if (pendingWithKyc.length > 0) {
        await supabaseAdmin
          .from("clients")
          .update({ status: "Active" })
          .in("id", pendingWithKyc);
      }
    } catch {}

    const isClientDeleted = (c: any) => {
      if (c.is_deleted === true || c.is_deleted === "true") return true;
      if (typeof c.notes === "string" && c.notes.includes("[RECYCLE_BIN:")) return true;
      return false;
    };

    let filtered = data || [];

    // Filter soft deletion safely in JavaScript
    if (status === "recycle_bin" || status === "deleted") {
      filtered = filtered.filter((c: any) => isClientDeleted(c));
    } else {
      filtered = filtered.filter((c: any) => !isClientDeleted(c));
      if (status && status !== "all") {
        filtered = filtered.filter((c: any) => getComputedStatus(c).toLowerCase() === status.toLowerCase());
      }
    }

    // Filter search safely in JavaScript
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((c: any) => {
        const nameMatch = (c.name || "").toLowerCase().includes(s);
        const surnameMatch = (c.surname || c.fatherName || c.father_name || "").toLowerCase().includes(s);
        const phoneMatch = (c.phone || "").toLowerCase().includes(s);
        const emailMatch = (c.email || "").toLowerCase().includes(s);
        return nameMatch || surnameMatch || phoneMatch || emailMatch;
      });
    }

    const clients = filtered.map((c: any) => {
      const rawSurname = c.surname || c.fatherName || c.father_name || "";
      const surname = rawSurname ? rawSurname.toUpperCase() : "";
      const fullName = `${c.name || ""}${surname ? " " + surname : ""}`.trim();
      const phone = c.phone || "";
      const altMobile = c.alternate_mobile || c.alternateMobile || c.alt_phone || "";
      const email = c.email || "";
      const dob = c.date_of_birth || c.dob || "";
      const rawAnniv = c.anniversary_date || c.anniversaryDate || "";
      const anniv = isValidDateYear(rawAnniv) ? rawAnniv : "";
      const pin = c.pin_code || c.pinCode || c.pincode || "";

      let deletedAt = c.deleted_at || null;
      if (!deletedAt && typeof c.notes === "string") {
        const match = c.notes.match(/\[RECYCLE_BIN:([^\]]+)\]/);
        if (match) deletedAt = match[1];
      }

      return {
        id: c.id,
        name: c.name || "",
        surname,
        fullName,
        phone,
        alternate_mobile: altMobile,
        alternateMobile: altMobile,
        email,
        date_of_birth: dob,
        anniversary_date: anniv,
        anniversaryDate: anniv,
        address: c.address || "",
        city: c.city || "",
        state: c.state || "",
        pin_code: pin,
        pinCode: pin,
        gender: c.gender || "",
        marital_status: c.marital_status || c.maritalStatus || "",
        maritalStatus: c.marital_status || c.maritalStatus || "",
        occupation: c.occupation || "",
        notes: c.notes || "",
        status: getComputedStatus(c),
        has_kyc: Boolean(hasKyc[c.id]),
        hasKyc: Boolean(hasKyc[c.id]),
        clientLoginId: c.clientloginid || c.clientLoginId || phone,
        profile_pic: c.profile_pic || null,
        created_at: c.created_at || new Date().toISOString(),
        is_deleted: isClientDeleted(c),
        deleted_at: deletedAt,
        family_count: familyCounts[c.id] ?? (c.family_members?.[0]?.count ?? 0),
        document_count: docCounts[c.id] ?? (c.documents?.[0]?.count ?? 0),
      };
    });

    return NextResponse.json({ clients, total: clients.length });
  } catch (err: any) {
    console.error("GET /api/clients error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch clients", clients: [], total: 0 }, { status: 500 });
  }
}

// POST /api/clients
export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let rawBody: any;
  let validatedData: any;
  try {
    rawBody = await request.json();
    validatedData = clientSchema.parse(rawBody);
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: err.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }

  try {
    if (!supabaseAdmin) throw new Error("No supabaseAdmin");

    const { data: existingClient } = await supabaseAdmin
      .from("clients")
      .select("id, name, phone, notes")
      .eq("phone", validatedData.phone)
      .maybeSingle();

    if (existingClient) {
      const allotmentId = `ALT-${Math.floor(100000 + Math.random() * 900000)}`;
      const reminderDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN");
      const reminderNote = `[RE-ENTRY ALLOTMENT ${allotmentId}]: Follow-up reminder scheduled for ${reminderDate}`;
      const updatedNotes = existingClient.notes ? `${existingClient.notes}\n${reminderNote}` : reminderNote;

      await supabaseAdmin
        .from("clients")
        .update({ notes: updatedNotes, updated_at: new Date().toISOString() })
        .eq("id", existingClient.id);

      return NextResponse.json(
        {
          client: { ...existingClient, notes: updatedNotes, allotmentId, reminderDate },
          isDoubleEntry: true,
          allotmentId,
          reminderDate,
          message: `Double entry / Re-entry detected for ${existingClient.name}. Allotment ${allotmentId} generated automatically and reminder scheduled for ${reminderDate}.`,
        },
        { status: 200 }
      );
    }

    const temporaryPassword = crypto.randomUUID().replace(/-/g, "").substring(0, 8).toUpperCase();
    const hashedPassword = bcrypt.hashSync(temporaryPassword, 10);

    const { data, error } = await supabaseAdmin
      .from("clients")
      .insert({
        name: validatedData.name,
        surname: validatedData.surname.trim().toUpperCase(),
        phone: validatedData.phone,
        alternate_mobile: validatedData.alternateMobile || null,
        email: validatedData.email,
        date_of_birth: validatedData.date_of_birth,
        anniversary_date: validatedData.anniversaryDate || null,
        gender: validatedData.gender || null,
        marital_status: validatedData.maritalStatus || null,
        occupation: validatedData.occupation || null,
        address: validatedData.address || null,
        city: validatedData.city || null,
        state: validatedData.state || null,
        pin_code: validatedData.pinCode || null,
        notes: validatedData.notes || null,
        profile_pic: validatedData.profile_pic || rawBody.profile_pic || null,
        status: "Pending",
        agent_id: validatedData.agent_id || null,
        clientloginid: validatedData.phone,
        temporarypassword: hashedPassword,
        plain_password: temporaryPassword,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        client: {
          ...data,
          status: "Pending",
          has_kyc: false,
          hasKyc: false,
          clientLoginId: validatedData.phone,
          temporaryPassword,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create client" }, { status: 500 });
  }
}