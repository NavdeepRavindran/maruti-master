import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-maruthi-key-must-change");

export async function POST(request: Request) {
  try {
    const { loginId, password } = await request.json();

    if (!loginId || !password) {
      return NextResponse.json({ error: "Missing login ID or password" }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    // 1. Query the clients table for the loginId
    const { data, error } = await supabase
      .from("clients")
      .select("id, temporaryPassword")
      .eq("clientLoginId", loginId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 2. Cryptographic Password Verification
    // Support legacy plaintext passwords (if any exist before security patch) or hashes
    let passwordMatches = false;
    if (data.temporaryPassword.startsWith("$2a$") || data.temporaryPassword.startsWith("$2b$")) {
      passwordMatches = bcrypt.compareSync(password, data.temporaryPassword);
    } else {
      // Legacy fallback
      passwordMatches = data.temporaryPassword === password;
    }

    if (!passwordMatches) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 3. Generate JWT Token
    const token = await new SignJWT({ clientId: data.id, role: "client" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    // 4. Set HTTP-Only Secure Cookie
    const cookieStore = await cookies();
    cookieStore.set("client_portal_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return NextResponse.json({ success: true, clientId: data.id }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
