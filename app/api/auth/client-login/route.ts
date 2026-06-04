import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseClient";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-maruthi-key-must-change"
);

export async function POST(request: Request) {
  try {
    const { loginId, password } = await request.json();

    if (!loginId || !password) {
      return NextResponse.json({ error: "Missing login ID or password" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from("clients")
      .select("id, temporarypassword")
      .eq("clientloginid", loginId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    let passwordMatches = false;
    const storedPassword = data.temporarypassword;

    if (
      storedPassword.startsWith("$2a$") ||
      storedPassword.startsWith("$2b$")
    ) {
      passwordMatches = bcrypt.compareSync(password, storedPassword);
    } else {
      passwordMatches = storedPassword === password;
    }

    if (!passwordMatches) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await new SignJWT({ clientId: data.id, role: "client" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    const cookieStore = await cookies();
    cookieStore.set("client_portal_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return NextResponse.json({ success: true, clientId: data.id }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}