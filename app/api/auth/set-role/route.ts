import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { role } = await req.json();
  if (role !== "buyer" && role !== "vendor") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  
  const supabase = getSupabase();
  
  // For now, let's use a simpler approach - get the user email from the request body
  // In a real implementation, you'd get this from the NextAuth session
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }
  
  // Find user by email
  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) {
    return NextResponse.json({ error: "Failed to find user" }, { status: 500 });
  }
  
  const user = users.find(u => u.email === email);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
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
  return NextResponse.json({ success: true });
} 