import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Zod Schema for robust server-side validation
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
  agent_id: z.string().optional()
});

// GET /api/clients — List all clients
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase() || "";
  const status = searchParams.get("status") || "";

  if (!supabase) return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });

  try {
    let query = supabase
      .from("clients")
      .select("*, family_members(count), documents(count)")
      .order("created_at", { ascending: false });

    if (search) query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    if (status && status !== "all") query = query.eq("status", status);

    const { data, error, count } = await query;
    if (error) throw error;

    const clients = (data || []).map((c: any) => ({
      ...c,
      family_count: c.family_members?.[0]?.count || 0,
      document_count: c.documents?.[0]?.count || 0,
    }));

    return NextResponse.json({ clients, total: clients.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/clients — Create a new client securely
export async function POST(request: Request) {
  if (!supabase) return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });

  try {
    const rawBody = await request.json();
    
    // 1. Strict Validation
    const validatedData = clientSchema.parse(rawBody);

    // 2. Atomic ID Generation (via Postgres RPC)
    const { data: seqData, error: seqError } = await supabase.rpc('get_next_client_id');
    if (seqError) throw new Error("Failed to generate Client ID: " + seqError.message);
    const clientLoginId = seqData;

    // 3. Cryptographic Password Generation & Hashing
    const temporaryPassword = crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase();
    const hashedPassword = bcrypt.hashSync(temporaryPassword, 10);

    // 4. Secure Database Insertion
    const { data, error } = await supabase
      .from("clients")
      .insert({
        name: validatedData.name,
        surname: validatedData.surname,
        phone: validatedData.phone,
        alternateMobile: validatedData.alternateMobile || null,
        email: validatedData.email,
        date_of_birth: validatedData.date_of_birth,
        anniversary_date: validatedData.anniversaryDate || null,
        address: validatedData.address || null,
        pinCode: validatedData.pinCode,
        status: "Active",
        agent_id: validatedData.agent_id || null,
        clientLoginId: clientLoginId,
        temporaryPassword: hashedPassword, // STORE ONLY THE HASH
      })
      .select()
      .single();

    if (error) throw error;
    
    // Return the plaintext password *once* so the UI can show it to the agent
    return NextResponse.json({ 
      client: {
        ...data,
        temporaryPassword: temporaryPassword // Plaintext sent to UI
      } 
    }, { status: 201 });

  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
