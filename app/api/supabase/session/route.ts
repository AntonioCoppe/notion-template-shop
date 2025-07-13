import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { access_token, refresh_token } = await req.json();
  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
  }
  const res = NextResponse.json({ success: true });
  const secure = process.env.NODE_ENV === "production";
  const host = req.nextUrl.hostname;
  
  // Fix: Use exact host instead of domain-wide scope to prevent duplicate cookies
  const domain = secure
    ? process.env.ROOT_DOMAIN
      ? process.env.ROOT_DOMAIN // Use exact domain, not .domain
      : undefined
    : host === "localhost"
      ? undefined
      : host; // Use exact host, not .host
  
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    ...(domain && { domain }),
  };
  res.cookies.set("sb-access-token", access_token, cookieOptions);
  res.cookies.set("sb-refresh-token", refresh_token, cookieOptions);
  return res;
}

export async function DELETE(req: NextRequest) {
  const res = NextResponse.json({ success: true });
  const host = req.nextUrl.hostname;
  
  // Fix: Use exact host instead of domain-wide scope to prevent duplicate cookies
  const domain = process.env.NODE_ENV === "production"
    ? process.env.ROOT_DOMAIN
      ? `.${process.env.ROOT_DOMAIN}` // Use leading dot for all subdomains
      : undefined
    : host === "localhost"
      ? undefined
      : host; // Use exact host, not .host

  const options = {
    maxAge: 0,
    expires: new Date(0),
    path: "/",
    ...(domain && { domain }),
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  } as const;
  res.cookies.set("sb-access-token", "", options);
  res.cookies.set("sb-refresh-token", "", options);
  // Also clear any sb-uthbp* cookies (Supabase may set these for multi-tab/session support)
  for (const cookie of req.cookies.getAll()) {
    if (cookie.name.startsWith("sb-uthbp")) {
      res.cookies.set(cookie.name, "", options);
    }
  }
  return res;
} 