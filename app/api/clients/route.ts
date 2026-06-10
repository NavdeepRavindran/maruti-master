import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseClient";
import bcrypt from "bcryptjs";
import { z } from "zod";

const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  surname: z.string().min(1, "Surname is required"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  alternateMobile: z.string().optional(),
  email: z.string().email("Invalid email format"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  anniversaryDate: z.string().optional(),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),
  occupation: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pinCode: z.string().regex(/^\d{6}$/, "PIN Code must be 6 digits"),
  notes: z.string().optional(),
  agent_id: z.string().optional(),
  profilePic: z.string().optional(), // ← ADDED: base64 data URL from frontend
});

// GET /api/clients
export async function GET(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server misconfigured: missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  try {
    let query = supabaseAdmin
      .from("clients")
      .select(`
        id, name, surname, phone, alternate_mobile, email,
        date_of_birth, anniversary_date, address, city, state, pin_code,
        gender, marital_status, occupation, notes,
        status, clientloginid, profile_pic, created_at,
        family_members(count),
        documents(count)
      `)
      // ↑ CHANGED: photo_url → profile_pic (matches the new DB column name)
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("GET /api/clients Supabase error:", error);
      throw error;
    }

    const clients = (data || []).map((c: any) => ({
      id: c.id,
      name: `${c.name || ""}${c.surname ? " " + c.surname : ""}`.trim(),
      phone: c.phone,
      email: c.email,
      date_of_birth: c.date_of_birth,
      address: [c.address, c.city, c.state, c.pin_code].filter(Boolean).join(", "),
      status: c.status,
      clientLoginId: c.clientloginid,
      profile_pic: c.profile_pic || null, // ← CHANGED: photo_url → profile_pic
      created_at: c.created_at,
      family_count: c.family_members?.[0]?.count ?? 0,
      document_count: c.documents?.[0]?.count ?? 0,
    }));

    return NextResponse.json({ clients, total: clients.length });
  } catch (err: any) {
    console.error("GET /api/clients error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/clients
export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server misconfigured: missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }

  try {
    const rawBody = await request.json();
    const validatedData = clientSchema.parse(rawBody);

    const { data: seqData, error: seqError } = await supabaseAdmin.rpc("get_next_client_id");
    if (seqError) throw new Error("Failed to generate Client ID: " + seqError.message);

    const temporaryPassword = crypto.randomUUID().replace(/-/g, "").substring(0, 8).toUpperCase();
    const hashedPassword = bcrypt.hashSync(temporaryPassword, 10);

    const { data, error } = await supabaseAdmin
      .from("clients")
      .insert({
        name: validatedData.name,
        surname: validatedData.surname,
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
        profile_pic: validatedData.profilePic || null, // ← ADDED: saves photo on create
        status: "Active",
        agent_id: validatedData.agent_id || null,
        clientloginid: seqData,
        temporarypassword: hashedPassword,
      })
      .select()
      .single();

    if (error) {
      console.error("POST /api/clients Supabase error:", error);
      throw error;
    }

    return NextResponse.json(
      {
        client: {
          ...data,
          clientLoginId: seqData,
          temporaryPassword,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: err.flatten() }, { status: 400 });
    }
    console.error("POST /api/clients error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}