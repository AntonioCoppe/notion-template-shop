import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("perPage") || "12", 10);

    let query = supabase
      .from("templates")
      .select(`
        id,
        title,
        price,
        notion_url,
        img,
        created_at,
        vendors!inner(
          stripe_account_id
        )
      `, { count: "exact" })
      .not('vendors.stripe_account_id', 'is', null) // Only show templates from vendors with Stripe connected
      .order("created_at", { ascending: false });

    if (id) {
      query = query.eq("id", id);
    }
    if (search) {
      query = query.ilike("title", `%${search}%`);
    }
    if (minPrice) {
      query = query.gte("price", parseFloat(minPrice));
    }
    if (maxPrice) {
      query = query.lte("price", parseFloat(maxPrice));
    }

    if (!id) {
      query = query.range((page - 1) * perPage, page * perPage - 1);
    }

    const { data, error, count } = await query;

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
      img: template.img, // Use the actual image URL from the database
      description: `${template.title} - A Notion template for your needs.`,
      notionUrl: template.notion_url,
    })) || [];

    if (id) {
      return NextResponse.json(templates[0] || null);
    }

    return NextResponse.json({
      data: templates,
      total: count ?? templates.length,
      page,
      perPage
    });
  } catch (error) {
    console.error("Error in templates API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 