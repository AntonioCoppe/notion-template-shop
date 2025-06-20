// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabase } from "@/lib/supabase";

// Non-null assert your API key at startup
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase(); // your service-role client

    // 1) Create user (skip Supabase built-in confirmation)
    const { data: userData, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: { role },
      });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }
    if (!userData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // 2) Generate our own signup link
    const { data: tokenData, error: tokenError } =
      await supabase.auth.admin.generateLink({
        type: "signup",
        email,
        password,
      });

    if (tokenError || !tokenData.properties?.action_link) {
      return NextResponse.json(
        { error: "Failed to generate confirmation link" },
        { status: 500 }
      );
    }

    // 3) Dispatch via Resend
    await resend.emails.send({
      from: "Notion Template Shop <noreply@notiontemplateshop.com>",
      to: email,
      subject: "Confirm your Notion Template Shop account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Notion Template Shop!</h2>
          <p>Thanks for signing up—please confirm your email to get started.</p>
          <p style="text-align:center;">
            <a href="${tokenData.properties.action_link}"
               style="background-color:#000; color:#fff; padding:12px 24px; text-decoration:none; border-radius:4px;">
              Confirm Email Address
            </a>
          </p>
          <p>If that doesn’t work, copy & paste this link into your browser:</p>
          <p style="word-break:break-all; color:#666;">${tokenData.properties.action_link}</p>
          <p>This link expires in 24 hours.</p>
          <p>— The Notion Template Shop Team</p>
        </div>
      `,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created! Please check your email to confirm your account.",
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
