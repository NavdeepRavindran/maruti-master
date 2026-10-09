import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabaseClient";
import bcrypt from "bcryptjs";

// POST /api/clients/[id]/password — Change or set client password
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const newPassword = body.password?.trim() || crypto.randomUUID().replace(/-/g, "").substring(0, 8).toUpperCase();

  if (newPassword.length < 4) {
    return NextResponse.json({ error: "Password must be at least 4 characters long." }, { status: 400 });
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("clients")
      .update({
        plain_password: newPassword,
        temporarypassword: hashedPassword,
        temporaryPassword: newPassword,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, clientloginid")
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      password: newPassword,
      client: data,
      message: "Password updated successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
