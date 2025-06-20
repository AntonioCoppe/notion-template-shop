import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "No URL provided" }, { status: 400 });

  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    const ogImage = $('meta[property="og:image"]').attr("content");
    if (!ogImage) {
      return NextResponse.json({ error: "No OG image found" }, { status: 404 });
    }
    return NextResponse.json({ image: ogImage });
  } catch {
    return NextResponse.json({ error: "Failed to fetch or parse page" }, { status: 500 });
  }
} 