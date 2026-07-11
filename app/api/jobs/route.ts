import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import type { Job, ApiResponse } from "@/types";
import { FieldValue } from "firebase-admin/firestore";

// GET /api/jobs - list all jobs
export async function GET(): Promise<NextResponse> {
  try {
    const snapshot = await db
      .collection("jobs")
      .orderBy("createdAt", "desc")
      .get();

    const jobs: Job[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Job, "id">),
    }));

    return NextResponse.json<ApiResponse<Job[]>>({ success: true, data: jobs });
  } catch (error) {
    console.error("GET /api/jobs error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Gagal memuat daftar loker" },
      { status: 500 }
    );
  }
}

// POST /api/jobs - create job (supports multipart for PDF upload)
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();

    const company = formData.get("company") as string;
    const position = formData.get("position") as string;
    const hrEmail = formData.get("hrEmail") as string;
    const notes = (formData.get("notes") as string) ?? "";
    const pdfFile = formData.get("pdf") as File | null;

    if (!company || !position || !hrEmail) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Field company, position, hrEmail wajib diisi" },
        { status: 400 }
      );
    }

    let pdfBase64: string | undefined;
    let pdfName: string | undefined;

    if (pdfFile && pdfFile.size > 0) {
      const buffer = Buffer.from(await pdfFile.arrayBuffer());
      pdfBase64 = buffer.toString("base64");
      pdfName = pdfFile.name;
    }

    const jobData = {
      company,
      position,
      hrEmail,
      notes,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
      ...(pdfBase64 && { pdfBase64, pdfName }),
    };

    const ref = await db.collection("jobs").add(jobData);

    return NextResponse.json<ApiResponse<{ id: string }>>(
      { success: true, data: { id: ref.id }, message: "Loker berhasil ditambahkan" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/jobs error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Gagal menambahkan loker" },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs?id=xxx - delete a job
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ID loker diperlukan" },
        { status: 400 }
      );
    }

    await db.collection("jobs").doc(id).delete();

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Loker berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE /api/jobs error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Gagal menghapus loker" },
      { status: 500 }
    );
  }
}

// PATCH /api/jobs - update status or template
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ID loker diperlukan" },
        { status: 400 }
      );
    }

    await db
      .collection("jobs")
      .doc(id)
      .update({ ...updates, updatedAt: FieldValue.serverTimestamp() });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Loker berhasil diperbarui",
    });
  } catch (error) {
    console.error("PATCH /api/jobs error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Gagal memperbarui loker" },
      { status: 500 }
    );
  }
}
