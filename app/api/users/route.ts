import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin not configured" }, { status: 500 });
  }

  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) {
      console.error("GET /api/users auth error:", authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const { data: profiles, error: profError } = await supabaseAdmin.from("profiles").select("*");
    if (profError) {
      console.warn("GET /api/users profiles warning:", profError);
    }

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

    const users = (authData?.users || []).map((u) => {
      const prof = profileMap.get(u.id);
      const role = u.user_metadata?.role || prof?.role || "Agent";
      const fullName = u.user_metadata?.full_name || u.user_metadata?.name || prof?.full_name || u.email?.split("@")[0] || "User";
      const phone = u.user_metadata?.phone || prof?.phone || null;

      // Status calculation
      const isConfirmed = Boolean(u.email_confirmed_at);
      const isBanned = Boolean(u.banned_until && new Date(u.banned_until) > new Date());
      const status = isBanned ? "Suspended" : isConfirmed ? "Active" : "Pending";

      return {
        id: u.id,
        email: u.email,
        full_name: fullName,
        role: role,
        phone: phone,
        status: status,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
      };
    });

    return NextResponse.json({ users });
  } catch (err: any) {
    console.error("GET /api/users exception:", err);
    return NextResponse.json({ error: err.message || "Failed to list users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();
    const fullName = body.full_name?.trim() || body.name?.trim() || "";
    const requestedRole = body.role === "Admin" ? "Admin" : "Agent";
    const phone = body.phone?.trim() || null;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Step 1: Create user with role: 'Agent' initially to satisfy public.profiles check constraint (handle_new_user trigger)
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        name: fullName,
        role: "Agent",
        phone,
      },
    });

    if (createError) {
      console.error("POST /api/users create error:", createError);
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    const newUser = createData.user;
    if (!newUser) {
      return NextResponse.json({ error: "Failed to create user in auth" }, { status: 500 });
    }

    // Step 2: If requestedRole is Admin, update user_metadata to 'Admin'
    if (requestedRole === "Admin") {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(newUser.id, {
        user_metadata: {
          full_name: fullName,
          name: fullName,
          role: "Admin",
          phone,
        },
      });
      if (updateError) {
        console.warn("POST /api/users role upgrade warning:", updateError.message);
      }
    }

    // Step 3: Update profile row
    try {
      await supabaseAdmin.from("profiles").upsert({
        id: newUser.id,
        email,
        full_name: fullName,
        phone,
      });
    } catch (profErr) {
      console.warn("Profile upsert non-critical warning:", profErr);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email,
        full_name: fullName,
        role: requestedRole,
        phone,
        password, // Returned once so caller can display note to copy
        created_at: newUser.created_at,
        status: "Active",
      },
    });
  } catch (err: any) {
    console.error("POST /api/users exception:", err);
    return NextResponse.json({ error: err.message || "Failed to create user" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin not configured" }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body?.id;
    }

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Delete user from auth (cascades to profiles)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) {
      console.error("DELETE /api/users error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Ensure profiles row is also cleaned up
    try {
      await supabaseAdmin.from("profiles").delete().eq("id", id);
    } catch {
      // profiles row may already be deleted via foreign key cascade
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error("DELETE /api/users exception:", err);
    return NextResponse.json({ error: err.message || "Failed to delete user" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { id, role, password, full_name, phone } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const updatePayload: any = {};
    const metadataUpdates: any = {};

    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      }
      updatePayload.password = password;
    }

    if (role) metadataUpdates.role = role === "Admin" ? "Admin" : "Agent";
    if (full_name) {
      metadataUpdates.full_name = full_name;
      metadataUpdates.name = full_name;
    }
    if (phone !== undefined) metadataUpdates.phone = phone;

    if (Object.keys(metadataUpdates).length > 0) {
      updatePayload.user_metadata = metadataUpdates;
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, updatePayload);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Keep profiles updated
    if (full_name || phone) {
      try {
        await supabaseAdmin.from("profiles").update({
          ...(full_name ? { full_name } : {}),
          ...(phone !== undefined ? { phone } : {}),
        }).eq("id", id);
      } catch {
        // non-critical profile sync error
      }
    }

    return NextResponse.json({ success: true, user: data.user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update user" }, { status: 500 });
  }
}
