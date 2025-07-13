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
  const root = process.env.ROOT_DOMAIN; // e.g. "notiontemplateshop.com"
  const optionsBase = {
    maxAge: 0,
    expires: new Date(0),
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  } as const;

  // Clear host-only cookies (no domain)
  res.cookies.set("sb-access-token", "", optionsBase);
  res.cookies.set("sb-refresh-token", "", optionsBase);
  for (const c of req.cookies.getAll()) {
    if (c.name.startsWith("sb-uthbp")) {
      res.cookies.set(c.name, "", optionsBase);
    }
  }

  // If you ever set cookies at the apex domain, clear those too
  if (root) {
    const optionsRoot = { ...optionsBase, domain: root };
    res.cookies.set("sb-access-token", "", optionsRoot);
    res.cookies.set("sb-refresh-token", "", optionsRoot);
    for (const c of req.cookies.getAll()) {
      if (c.name.startsWith("sb-uthbp")) {
        res.cookies.set(c.name, "", optionsRoot);
      }
    }
  }

  return res;
} 