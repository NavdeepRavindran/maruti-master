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
    const body = await request.json().catch(() => ({}));
    const id = (body.loginId || "").trim();
    const pwd = (body.password || "").trim();

    if (!id || !pwd) {
      return NextResponse.json({ error: "Missing login ID or password" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Database configuration error" }, { status: 500 });
    }

    const { data: client, error } = await supabaseAdmin
      .from("clients")
      .select("*")
      .or(`clientloginid.eq.${id},phone.eq.${id}`)
      .maybeSingle();

    if (error || !client || client.is_deleted === true || client.status === "Inactive") {
      return NextResponse.json({ error: "Invalid login credentials." }, { status: 401 });
    }

    // Check password against plain_password or temporarypassword (plain or hashed)
    const plainPwd = client.plain_password || client.plainPassword;
    const tempPwd = client.temporarypassword || client.temporaryPassword;

    let isMatch = false;
    if (plainPwd && plainPwd === pwd) {
      isMatch = true;
    } else if (tempPwd) {
      if (tempPwd === pwd) {
        isMatch = true;
      } else {
        try {
          isMatch = await bcrypt.compare(pwd, tempPwd);
        } catch {}
      }
    }

    if (!isMatch) {
      return NextResponse.json({ error: "Invalid login credentials." }, { status: 401 });
    }

    const token = await new SignJWT({ clientId: client.id, role: "client" })
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

    return NextResponse.json({ success: true, clientId: client.id }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Authentication failed" }, { status: 500 });
  }
}