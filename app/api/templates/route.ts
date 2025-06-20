import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    let query = supabase
      .from("templates")
      .select(`
        id,
        title,
        price,
        notion_url,
        created_at,
        vendors!inner(
          stripe_account_id
        )
      `)
      .not('vendors.stripe_account_id', 'is', null) // Only show templates from vendors with Stripe connected
      .order("created_at", { ascending: false });

    if (id) {
      query = query.eq("id", id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching templates:", error);
      return NextResponse.json(
        { error: "Failed to fetch templates" },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const templates = data?.map((template) => ({
      id: template.id,
      title: template.title,
      price: template.price,
      img: "/freelancer.jpg", // Default image - you might want to add an image field to the database
      description: `${template.title} - A Notion template for your needs.`,
      notionUrl: template.notion_url,
    })) || [];

    return NextResponse.json(id ? (templates[0] || null) : templates);
  } catch (error) {
    console.error("Error in templates API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 