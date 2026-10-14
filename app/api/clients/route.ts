import { NextResponse } from "next/server";
import { supabaseAdmin, supabaseAuth } from "../../../lib/supabaseClient";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { isValidEmail, getEmailError } from "@/lib/emailValidator";
import { validateDateRange } from "@/lib/formatUtils";

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
  anniversaryDate: z.string().optional().superRefine((val, ctx) => {
    if (!val) return;
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
    if (!data.anniversaryDate) return true;
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

    // Auto-purge soft-deleted clients older than 3 months (90 days) permanently
    try {
      const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      await supabaseAdmin
        .from("clients")
        .delete()
        .eq("is_deleted", true)
        .lt("deleted_at", threeMonthsAgo);
    } catch {}

    let query = supabaseAdmin
      .from("clients")
      .select(`
        id, name, surname, phone, alternate_mobile, email,
        date_of_birth, anniversary_date, address, city, state, pin_code,
        gender, marital_status, occupation, notes,
        status, clientloginid, profile_pic, created_at, is_deleted, deleted_at,
        family_members(count),
        documents(count)
      `)
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (status === "recycle_bin" || status === "deleted") {
      query = query.eq("is_deleted", true);
    } else {
      query = query.or("is_deleted.is.null,is_deleted.eq.false");
      if (status && status !== "all") {
        query = query.eq("status", status);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const clients = (data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      surname: (c.surname || "").toUpperCase(),
      fullName: `${c.name || ""}${c.surname ? " " + c.surname.toUpperCase() : ""}`.trim(),
      phone: c.phone,
      alternate_mobile: c.alternate_mobile || "",
      alternateMobile: c.alternate_mobile || "",
      email: c.email || "",
      date_of_birth: c.date_of_birth,
      anniversary_date: c.anniversary_date || "",
      anniversaryDate: c.anniversary_date || "",
      address: c.address || "",
      city: c.city || "",
      state: c.state || "",
      pin_code: c.pin_code || "",
      pinCode: c.pin_code || "",
      gender: c.gender || "",
      marital_status: c.marital_status || "",
      maritalStatus: c.marital_status || "",
      occupation: c.occupation || "",
      notes: c.notes || "",
      status: c.status,
      clientLoginId: c.clientloginid,
      profile_pic: c.profile_pic || null,
      created_at: c.created_at,
      is_deleted: Boolean(c.is_deleted),
      deleted_at: c.deleted_at || null,
      family_count: c.family_members?.[0]?.count ?? 0,
      document_count: c.documents?.[0]?.count ?? 0,
    }));

    return NextResponse.json({ clients, total: clients.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch clients" }, { status: 500 });
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
        status: "Active",
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