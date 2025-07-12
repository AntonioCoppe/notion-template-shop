import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  // Read the body *once*
  const { role, email } = await req.json();

  if (role !== "buyer" && role !== "vendor") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }
  
  const supabase = getSupabase();
  
  // Get the current user from the request cookies (Supabase session)
  const accessToken = req.cookies.get("sb-access-token")?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  
  // Verify the user and get their info
  const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }
  
  // Verify the email matches
  if (user.email !== email) {
    return NextResponse.json({ error: "Email mismatch" }, { status: 403 });
  }
  
  // Update user metadata
  const { error: metaError } = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, role },
  });
  if (metaError) {
    return NextResponse.json({ error: metaError.message }, { status: 500 });
  }
  
  // Create buyer or vendor record
  if (role === "buyer") {
    await supabase.from("buyers").insert({ user_id: user.id });
  } else if (role === "vendor") {
    await supabase.from("vendors").insert({ user_id: user.id, country: "US" }); // Default country, can be updated later
  }
  
  return NextResponse.json({ success: true }, { status: 200 });
} 