import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import type { ApiResponse, SenderSettings } from "@/types";

const SENDER_DOC = "settings/sender";

export async function GET(): Promise<NextResponse> {
  try {
    const doc = await db.doc(SENDER_DOC).get();
    if (!doc.exists) {
      return NextResponse.json<ApiResponse>({ success: true, data: null });
    }
    const data = doc.data();
    return NextResponse.json<ApiResponse<SenderSettings>>({
      success: true,
      data: {
        name: data?.name,
        email: data?.email,
        waNumber: data?.waNumber,
        updatedAt: data?.updatedAt,
      },
    });
  } catch (error) {
    console.error("GET /api/sender error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Gagal memuat identitas pengirim" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { name, email, gmailAppPassword, waNumber } = body as {
      name?: string;
      email?: string;
      gmailAppPassword?: string;
      waNumber?: string;
    };

    if (!name || !email) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Nama dan email wajib diisi" },
        { status: 400 },
      );
    }

    await db.doc(SENDER_DOC).set({
      name,
      email,
      gmailAppPassword: gmailAppPassword?.replace(/\s/g, ""),
      waNumber,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Identitas pengirim berhasil disimpan",
    });
  } catch (error) {
    console.error("PUT /api/sender error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Gagal menyimpan identitas pengirim" },
      { status: 500 },
    );
  }
}
