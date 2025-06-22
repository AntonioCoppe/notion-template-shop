import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get("buyerId");

    if (!buyerId) {
      return NextResponse.json(
        { error: "buyerId parameter is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        amount,
        status,
        created_at,
        templates!inner(
          id,
          title,
          notion_url,
          img
        )
      `)
      .eq("buyer_id", buyerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    // Transform the data to a cleaner format
    const orders = data?.map((order) => ({
      id: order.id,
      amount: order.amount,
      status: order.status,
      createdAt: order.created_at,
      template: {
        id: order.templates[0]?.id,
        title: order.templates[0]?.title,
        notionUrl: order.templates[0]?.notion_url,
        img: order.templates[0]?.img,
      },
    })) || [];

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error in orders API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 