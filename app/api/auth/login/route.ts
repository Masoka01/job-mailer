import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { password, remember } = await req.json();

    if (!password) {
      return NextResponse.json({ success: false, error: "Password diperlukan" }, { status: 400 });
    }

    const expected = process.env.APP_PASSWORD;
    if (!expected) {
      return NextResponse.json({ success: false, error: "Server belum dikonfigurasi" }, { status: 500 });
    }

    // Constant-time compare
    const a = Buffer.from(password);
    const b = Buffer.from(expected);
    const valid = a.length === b.length && crypto.timingSafeEqual(a, b);

    if (!valid) {
      return NextResponse.json({ success: false, error: "Password salah" }, { status: 401 });
    }

    // Set auth cookie
    const maxAge = remember ? 60 * 60 * 24 * 30 : undefined; // 30 days if remember, else session
    const res = NextResponse.json({ success: true });
    res.cookies.set("auth_token", "authenticated", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      ...(maxAge ? { maxAge } : {}),
    });
    return res;
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan" }, { status: 500 });
  }
}
