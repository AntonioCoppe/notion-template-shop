import { getSupabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ids = searchParams.get("ids")?.split(',');

  if (!ids || ids.length === 0) {
    return NextResponse.json({ error: "Missing template IDs" }, { status: 400 });
  }

  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from("templates")
      .select("id, title")
      .in("id", ids);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { error: `Failed to fetch templates: ${errorMessage}` },
      { status: 500 }
    );
  }
} 