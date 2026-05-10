import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
    return NextResponse.json({ error: "Invalid login payload." }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ error: "Database configuration error." }, { status: 500 });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ user: data.user, session: data.session });
  } catch (err) {
    console.error("Supabase login error:", err);
    return NextResponse.json({ error: "Internal server error during login." }, { status: 500 });
  }
}
