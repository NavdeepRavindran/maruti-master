import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseClient";

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server misconfigured: missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const email = body?.email?.trim();
    const password = body?.password;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("SUPABASE LOGIN ERROR:", error);
      return NextResponse.json({ error: error.message, code: error.code }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: data.user, session: data.session }, { status: 200 });
  } catch (err: any) {
    console.error("LOGIN ROUTE ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}