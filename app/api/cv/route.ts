import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import type { ApiResponse } from "@/types";

const CV_DOC = "settings/cv";

export async function GET(): Promise<NextResponse> {
  try {
    const doc = await db.doc(CV_DOC).get();
    if (!doc.exists) {
      return NextResponse.json<ApiResponse>({ success: true, data: null });
    }
    const data = doc.data();
    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        name: data?.name,
        size: data?.size,
        uploadedAt: data?.uploadedAt,
      },
    });
  } catch (error) {
    console.error("GET /api/cv error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Gagal memuat info CV" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const file = formData.get("cv") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "File CV tidak ditemukan" },
        { status: 400 },
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Hanya file PDF yang didukung" },
        { status: 400 },
      );
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Ukuran file maksimal 2 MB" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    await db.doc(CV_DOC).set({
      name: file.name,
      size: file.size,
      base64,
      uploadedAt: new Date().toISOString(),
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "CV berhasil disimpan",
      data: { name: file.name, size: file.size },
    });
  } catch (error) {
    console.error("POST /api/cv error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Gagal menyimpan CV" },
      { status: 500 },
    );
  }
}

export async function DELETE(): Promise<NextResponse> {
  try {
    await db.doc(CV_DOC).delete();
    return NextResponse.json<ApiResponse>({
      success: true,
      message: "CV berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE /api/cv error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Gagal menghapus CV" },
      { status: 500 },
    );
  }
}
