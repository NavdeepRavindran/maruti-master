import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "clients"; // "clients" or "family"
    const id = formData.get("id") as string;

    if (!file || !folder || !id) {
      return NextResponse.json({ error: "Missing required fields (file, folder, id)" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server misconfiguration: missing Supabase credentials" }, { status: 500 });
    }

    // Ensure storage bucket exists
    try {
      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      const bucketExists = (buckets || []).some((b: any) => b.name === "profile-photos");
      if (!bucketExists) {
        await supabaseAdmin.storage.createBucket("profile-photos", { public: true });
      }
    } catch (bErr: any) {
      console.warn("Storage bucket check warning:", bErr?.message);
    }

    const rawExt = file.name.split(".").pop() || "jpg";
    const cleanExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${folder}/${id}.${cleanExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from("profile-photos")
      .upload(path, buffer, { contentType: file.type || "image/jpeg", upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabaseAdmin.storage.from("profile-photos").getPublicUrl(path);
    const photoUrl = `${data.publicUrl}?t=${Date.now()}`;

    if (folder === "clients") {
      const { error: updateErr } = await supabaseAdmin
        .from("clients")
        .update({ profile_pic: photoUrl })
        .eq("id", id);
      if (updateErr) {
        console.warn("Could not update clients.profile_pic:", updateErr.message);
      }
    } else if (folder === "family") {
      const { error: updateErr } = await supabaseAdmin
        .from("family_members")
        .update({ photo_url: photoUrl })
        .eq("id", id);
      if (updateErr) {
        console.warn("Could not update family_members.photo_url:", updateErr.message);
      }
    }

    return NextResponse.json({ photoUrl, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}