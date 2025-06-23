import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { access_token, refresh_token } = await req.json();
  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
  }
  const res = NextResponse.json({ success: true });
  const secure = process.env.NODE_ENV === "production";
  const url = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  const domain = "." + new URL(url).hostname.replace(/^www\./, "");
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    domain,
  };
  res.cookies.set("sb-access-token", access_token, cookieOptions);
  res.cookies.set("sb-refresh-token", refresh_token, cookieOptions);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  const url = process.env.NEXT_PUBLIC_SITE_URL || "";
  const domain = url ? "." + new URL(url).hostname.replace(/^www\./, "") : undefined;
  const options = { maxAge: 0, path: "/", domain } as const;
  res.cookies.set("sb-access-token", "", options);
  res.cookies.set("sb-refresh-token", "", options);
  return res;
}
