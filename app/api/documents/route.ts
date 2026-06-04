import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseClient";

// GET /api/documents — List all documents (optionally filter by client_id)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("client_id");
  const familyMemberId = searchParams.get("family_member_id");
  const search = searchParams.get("search")?.toLowerCase() || "";

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
  }

  try {
    let query = supabaseAdmin
      .from("documents")
      .select("*, clients(name)")
      .order("created_at", { ascending: false });

    if (clientId) query = query.eq("client_id", clientId);
    if (familyMemberId) query = query.eq("family_member_id", familyMemberId);
    if (search) query = query.or(`name.ilike.%${search}%,file_name.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    const documents = (data || []).map((d: any) => ({
      ...d,
      client_name: d.clients?.name || "Unknown",
    }));

    return NextResponse.json({ documents, total: documents.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/documents — Upload a document via FormData to bypass RLS with Service Role
export async function POST(request: Request) {
  try {
    const formData = await request.formData().catch(() => null);
    if (!formData) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

    const file = formData.get("file") as File;
    const client_id = formData.get("client_id") as string;
    const family_member_id = formData.get("family_member_id") as string | null;
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;

    if (!file || !client_id || !name || !category) {
      return NextResponse.json({ error: "Client ID, name, category, and file are required." }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase admin not configured" }, { status: 500 });
    }

    // 1. Upload to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${client_id}/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: signedData, error: signError } = await supabaseAdmin.storage
      .from('documents')
      .createSignedUrl(filePath, 315360000);

    if (signError) throw signError;
    const finalUrl = signedData?.signedUrl || "";

    // 2. Insert into database
    const { data, error } = await supabaseAdmin
      .from("documents")
      .insert({
        client_id,
        family_member_id: family_member_id || null,
        name,
        category: category || "Others",
        file_name: file.name,
        file_url: finalUrl,
        file_type: getFileType(file.name),
        file_size: file.size || 0,
        uploaded_by: "agent",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ document: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function getFileType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (["pdf"].includes(ext)) return "PDF";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "IMG";
  if (["doc", "docx"].includes(ext)) return "DOC";
  if (["xls", "xlsx"].includes(ext)) return "XLS";
  return "FILE";
}