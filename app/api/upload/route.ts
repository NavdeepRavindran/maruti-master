import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseClient";

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string; // "clients" or "family"
    const id = formData.get("id") as string;

    if (!file || !folder || !id) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const ext = file.name.split(".").pop();
    const path = `${folder}/${id}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from("profile-photos")
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const { data } = supabaseAdmin.storage.from("profile-photos").getPublicUrl(path);
    const photoUrl = `${data.publicUrl}?t=${Date.now()}`;

    if (folder === "clients") {
      await supabaseAdmin.from("clients").update({ photo_url: photoUrl }).eq("id", id);
    } else if (folder === "family") {
      await supabaseAdmin.from("family_members").update({ photo_url: photoUrl }).eq("id", id);
    }

    return NextResponse.json({ photoUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}