import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { access_token, refresh_token } = await req.json();
  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
  }
  const res = NextResponse.json({ success: true });
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set("sb-access-token", access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
  });
  res.cookies.set("sb-refresh-token", refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("sb-access-token", "", { maxAge: 0, path: "/" });
  res.cookies.set("sb-refresh-token", "", { maxAge: 0, path: "/" });
  return res;
}
