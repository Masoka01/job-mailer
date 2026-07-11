import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { sendApplicationEmail } from "@/lib/mailer";
import type { Job, EmailTemplate, ApiResponse } from "@/types";

interface SendResult {
  jobId: string;
  company: string;
  success: boolean;
  error?: string;
}

// POST /api/send
// Body: { jobIds: string[], templateId: string }
// If jobIds is empty, sends to all pending jobs
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { jobIds = [], templateId } = body as {
      jobIds?: string[];
      templateId: string;
    };

    if (!templateId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "templateId wajib diisi" },
        { status: 400 }
      );
    }

    // Fetch template
    const templateDoc = await db.collection("templates").doc(templateId).get();
    if (!templateDoc.exists) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Template tidak ditemukan" },
        { status: 404 }
      );
    }
    const template = { id: templateDoc.id, ...templateDoc.data() } as EmailTemplate;

    // Fetch jobs
    let jobDocs;
    if (jobIds.length > 0) {
      const refs = jobIds.map((id) => db.collection("jobs").doc(id));
      const snapshots = await db.getAll(...refs);
      jobDocs = snapshots.filter((s) => s.exists);
    } else {
      // blast all pending
      const snapshot = await db
        .collection("jobs")
        .where("status", "==", "pending")
        .get();
      jobDocs = snapshot.docs;
    }

    if (jobDocs.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Tidak ada loker yang dipilih atau belum ada yang pending" },
        { status: 400 }
      );
    }

    // Fetch global CV once for all jobs
    let globalCvBuffer: Buffer | undefined;
    let globalCvName: string | undefined;
    try {
      const cvDoc = await db.doc("settings/cv").get();
      if (cvDoc.exists) {
        const cvData = cvDoc.data();
        if (cvData?.base64) {
          globalCvBuffer = Buffer.from(cvData.base64, "base64");
          globalCvName = cvData.name ?? "cv.pdf";
        }
      }
    } catch (err) {
      console.warn("Could not load global CV:", err);
    }

    const results: SendResult[] = [];

    for (const doc of jobDocs) {
      const job = { id: doc.id, ...(doc.data() as Omit<Job, "id">) };

      try {
        // Per-job PDF
        let pdfBuffer: Buffer | undefined;
        let pdfName: string | undefined;
        if (job.pdfBase64) {
          pdfBuffer = Buffer.from(job.pdfBase64, "base64");
          pdfName = job.pdfName ?? "lamaran.pdf";
        }

        await sendApplicationEmail(
          job,
          template,
          pdfBuffer,
          pdfName,
          globalCvBuffer,
          globalCvName
        );

        // Update status to sent
        await db.collection("jobs").doc(job.id).update({
          status: "sent",
          sentAt: new Date().toISOString(),
        });

        results.push({ jobId: job.id, company: job.company, success: true });
      } catch (err) {
        console.error(`Failed to send to ${job.hrEmail}:`, err);

        await db.collection("jobs").doc(job.id).update({ status: "failed" });

        results.push({
          jobId: job.id,
          company: job.company,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json<ApiResponse<SendResult[]>>({
      success: true,
      data: results,
      message: `${successCount} email terkirim, ${failCount} gagal`,
    });
  } catch (error) {
    console.error("POST /api/send error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Terjadi kesalahan saat pengiriman" },
      { status: 500 }
    );
  }
}

// GET /api/send/templates - list all templates
export async function GET(): Promise<NextResponse> {
  try {
    const snapshot = await db
      .collection("templates")
      .orderBy("updatedAt", "desc")
      .get();

    if (snapshot.empty) {
      // Seed default template
      const defaultTemplate: Omit<EmailTemplate, "id"> = {
        name: "Template Default",
        subject: "Lamaran Kerja - {{position}} di {{company}}",
        body: `Yth. HRD {{company}},

Dengan hormat,

Saya bermaksud mengajukan lamaran untuk posisi **{{position}}** di perusahaan {{company}}.

Saya yakin pengalaman dan kemampuan saya sesuai dengan kebutuhan perusahaan. Terlampir saya sertakan CV dan dokumen pendukung lainnya untuk pertimbangan Bapak/Ibu.

Saya sangat berharap dapat berkontribusi dan berkembang bersama tim {{company}}. Atas perhatian dan kesempatan yang diberikan, saya ucapkan terima kasih.

Hormat saya,
{{senderName}}
{{senderEmail}}`,
        updatedAt: new Date().toISOString(),
      };

      const ref = await db.collection("templates").add(defaultTemplate);
      const templates: EmailTemplate[] = [{ id: ref.id, ...defaultTemplate }];

      return NextResponse.json<ApiResponse<EmailTemplate[]>>({
        success: true,
        data: templates,
      });
    }

    const templates: EmailTemplate[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<EmailTemplate, "id">),
    }));

    return NextResponse.json<ApiResponse<EmailTemplate[]>>({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("GET /api/send error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Gagal memuat template" },
      { status: 500 }
    );
  }
}

// PUT /api/send - save or update template
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { id, name, subject, body: templateBody } = body;

    const data = {
      name: name ?? "Template",
      subject,
      body: templateBody,
      updatedAt: new Date().toISOString(),
    };

    if (id) {
      await db.collection("templates").doc(id).set(data, { merge: true });
      return NextResponse.json<ApiResponse>({
        success: true,
        message: "Template berhasil diperbarui",
        data: { id },
      });
    } else {
      const ref = await db.collection("templates").add(data);
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          message: "Template berhasil disimpan",
          data: { id: ref.id },
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("PUT /api/send error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Gagal menyimpan template" },
      { status: 500 }
    );
  }
}
