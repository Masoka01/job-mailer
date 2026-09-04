import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import type { ApiResponse } from "@/types";

const SEED_WA_BODY = `{{greeting}} 🙏

Saya Dimas Mayoni, ingin melamar posisi {{position}} di {{company}}.

Saya freelance web developer dengan pengalaman 1+ tahun, sekarang juga aktif sebagai guru les komputer. Terbiasa bekerja mandiri maupun dalam tim.

Portfolio: https://mayoni-porto.vercel.app

CV dan dokumen bisa saya kirimkan jika dibutuhkan. Terima kasih 🙏`;

interface WaTemplate {
  id: string;
  name: string;
  body: string;
  updatedAt: string;
  isDefault?: boolean;
}

// GET /api/wa-templates - list all WA templates (seed default if empty)
export async function GET(): Promise<NextResponse> {
  try {
    const snapshot = await db.collection("wa_templates").orderBy("updatedAt", "desc").get();

    if (snapshot.empty) {
      const defaultTemplate: Omit<WaTemplate, "id"> = {
        name: "Template WA Default",
        body: SEED_WA_BODY,
        isDefault: true,
        updatedAt: new Date().toISOString(),
      };
      const ref = await db.collection("wa_templates").add(defaultTemplate);
      const templates: WaTemplate[] = [{ id: ref.id, ...defaultTemplate }];
      return NextResponse.json<ApiResponse<WaTemplate[]>>({ success: true, data: templates });
    }

    const templates: WaTemplate[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<WaTemplate, "id">),
    }));
    return NextResponse.json<ApiResponse<WaTemplate[]>>({ success: true, data: templates });
  } catch (error) {
    console.error("GET /api/wa-templates error:", error);
    return NextResponse.json<ApiResponse>({ success: false, error: "Gagal memuat template WA" }, { status: 500 });
  }
}

// PUT /api/wa-templates - save or update WA template
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { id, name, body: templateBody } = body;

    const data = {
      name: name ?? "Template WA",
      body: templateBody,
      updatedAt: new Date().toISOString(),
    };

    if (id) {
      await db.collection("wa_templates").doc(id).set(data, { merge: true });
      return NextResponse.json<ApiResponse>({ success: true, message: "Template WA berhasil diperbarui", data: { id } });
    } else {
      const ref = await db.collection("wa_templates").add(data);
      return NextResponse.json<ApiResponse>({ success: true, message: "Template WA berhasil disimpan", data: { id: ref.id } }, { status: 201 });
    }
  } catch (error) {
    console.error("PUT /api/wa-templates error:", error);
    return NextResponse.json<ApiResponse>({ success: false, error: "Gagal menyimpan template WA" }, { status: 500 });
  }
}

// DELETE /api/wa-templates?id=xxx
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json<ApiResponse>({ success: false, error: "Parameter id wajib diisi" }, { status: 400 });
    }
    const doc = await db.collection("wa_templates").doc(id).get();
    if (!doc.exists) {
      return NextResponse.json<ApiResponse>({ success: false, error: "Template WA tidak ditemukan" }, { status: 404 });
    }
    const data = doc.data();
    if (data?.isDefault) {
      return NextResponse.json<ApiResponse>({ success: false, error: "Template WA default tidak bisa dihapus" }, { status: 403 });
    }
    await db.collection("wa_templates").doc(id).delete();
    return NextResponse.json<ApiResponse>({ success: true, message: "Template WA berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/wa-templates error:", error);
    return NextResponse.json<ApiResponse>({ success: false, error: "Gagal menghapus template WA" }, { status: 500 });
  }
}
