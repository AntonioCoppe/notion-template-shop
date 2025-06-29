import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { access_token, refresh_token } = await req.json();
  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
  }
  const res = NextResponse.json({ success: true });
  const secure = process.env.NODE_ENV === "production";
  const host = req.nextUrl.hostname;
  const domain = secure
    ? process.env.ROOT_DOMAIN
      ? `.${process.env.ROOT_DOMAIN}`
      : undefined
    : host === "localhost"
      ? undefined
      : "." + host.replace(/^www\./, "");
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
  const domain = process.env.NODE_ENV === "production"
    ? process.env.ROOT_DOMAIN
      ? `.${process.env.ROOT_DOMAIN}`
      : undefined
    : host === "localhost"
      ? undefined
      : "." + host.replace(/^www\./, "");
  const options = { maxAge: 0, path: "/", ...(domain && { domain }) } as const;
  res.cookies.set("sb-access-token", "", options);
  res.cookies.set("sb-refresh-token", "", options);
  return res;
}
