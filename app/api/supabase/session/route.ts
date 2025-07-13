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
  const isProd = process.env.NODE_ENV === "production";
  const domain = isProd && process.env.ROOT_DOMAIN
    ? `.${process.env.ROOT_DOMAIN}`
    : host === "localhost"
      ? undefined
      : `.${host}`;

  const cookieOptions = {
    path:   "/",
    domain,
    secure: isProd,
    sameSite: "lax" as const,
    httpOnly: true,
    expires: new Date(0),
    maxAge: 0,
  };

  // Remove Supabase cookies by setting them to empty with expiry
  res.cookies.set("sb-access-token", "", cookieOptions);
  res.cookies.set("sb-refresh-token", "", cookieOptions);
  for (const c of req.cookies.getAll()) {
    if (c.name.startsWith("sb-uthbp")) {
      res.cookies.set(c.name, "", cookieOptions);
    }
  }

  return res;
} 