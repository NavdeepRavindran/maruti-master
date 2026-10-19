import { NextResponse } from "next/server";
import { supabaseAdmin, supabaseAuth } from "../../../lib/supabaseClient";

// ── Auth helper ────────────────────────────────────────────────────────────
async function getAuthUser(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

// GET /api/documents
export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("client_id") || undefined;
  const familyMemberId = searchParams.get("family_member_id");
  const search = searchParams.get("search")?.toLowerCase() || "";

  try {
    if (!supabaseAdmin) throw new Error("No supabaseAdmin");

    let query = supabaseAdmin
      .from("documents")
      .select("*, clients(name)")
      .order("created_at", { ascending: false });

    if (clientId) query = query.eq("client_id", clientId);
    if (familyMemberId) query = query.eq("family_member_id", familyMemberId);
    if (search) query = query.or(`name.ilike.%${search}%,file_name.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    const isDocDeleted = (d: any) => {
      if (d.is_deleted === true || d.is_deleted === "true") return true;
      if (typeof d.name === "string" && d.name.startsWith("[RECYCLE_BIN]")) return true;
      return false;
    };

    const cleanDocName = (d: any) => {
      const raw = typeof d.name === "string" ? d.name : "";
      return raw.replace(/^\[RECYCLE_BIN\]\s*/, "").trim();
    };

    const documents = (data || []).map((d: any) => ({
      ...d,
      raw_name: d.name,
      name: cleanDocName(d),
      is_deleted: isDocDeleted(d),
      client_name: d.clients?.name || "Unknown",
    }));

    return NextResponse.json({ documents, total: documents.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch documents" }, { status: 500 });
  }
}

// POST /api/documents
export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let formData: FormData | null = null;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File;
  const client_id = formData.get("client_id") as string;
  const family_member_id = formData.get("family_member_id") as string | null;
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;

  if (!file || !client_id || !name || !category) {
    return NextResponse.json({ error: "Client ID, name, category, and file are required." }, { status: 400 });
  }

  try {
    if (!supabaseAdmin) throw new Error("No supabaseAdmin");

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${client_id}/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("documents")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: signedData, error: signError } = await supabaseAdmin.storage
      .from("documents")
      .createSignedUrl(filePath, 315360000);

    if (signError) throw signError;
    const finalUrl = signedData?.signedUrl || "";

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

    // Automatically mark client Active upon KYC upload
    const isKyc = (
      category === "KYC / Identity" ||
      category === "KYC" ||
      /ckyc|kyc|aadhaar|pan/i.test(name) ||
      /ckyc|kyc|aadhaar|pan/i.test(file.name)
    );
    if (isKyc) {
      await supabaseAdmin
        .from("clients")
        .update({ status: "Active" })
        .eq("id", client_id);
    }

    return NextResponse.json({ document: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to upload document" }, { status: 500 });
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