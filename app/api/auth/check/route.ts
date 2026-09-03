import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = req.cookies.get("auth_token")?.value;
  return NextResponse.json({ authenticated: token === "authenticated" });
}
