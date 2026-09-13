import nodemailer from "nodemailer";
import { db } from "@/lib/firebase";
import type { Job, EmailTemplate } from "@/types";

async function getSenderSettings(): Promise<{
  name: string;
  email: string;
  gmailAppPassword: string;
}> {
  let data: Record<string, unknown> = {};
  try {
    const doc = await db.doc("settings/sender").get();
    if (doc.exists) {
      data = (doc.data() as Record<string, unknown>) ?? {};
    }
  } catch {
    // fallback to env if Firestore read fails
  }
  const name =
    (data.name as string) ??
    process.env.GMAIL_NAME ??
    process.env.GMAIL_USER?.split("@")[0]?.replace(/[._]/g, " ") ??
    "Pelamar";
  const email = (data.email as string) ?? process.env.GMAIL_USER ?? "";
  const gmailAppPassword =
    (data.gmailAppPassword as string) ?? process.env.GMAIL_APP_PASSWORD ?? "";
  return { name, email, gmailAppPassword };
}

/**
 * Replace template variables:
 * {{company}}, {{position}}, {{hrEmail}}, {{senderName}}, {{senderEmail}}
 */
function interpolate(
  text: string,
  job: Job,
  sender: { name: string; email: string },
): string {
  return text
    .replace(/\{\{company\}\}/g, job.company)
    .replace(/\{\{position\}\}/g, job.position)
    .replace(/\{\{hrEmail\}\}/g, job.hrEmail)
    .replace(/\{\{senderName\}\}/g, sender.name)
    .replace(/\{\{senderEmail\}\}/g, sender.email);
}

export async function sendApplicationEmail(
  job: Job,
  template: EmailTemplate,
  pdfBuffer?: Buffer,
  pdfName?: string,
  cvBuffer?: Buffer,
  cvName?: string,
): Promise<void> {
  const sender = await getSenderSettings();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: sender.email,
      pass: sender.gmailAppPassword,
    },
  });

  const subject = interpolate(template.subject, job, sender);
  const htmlBody = interpolate(template.body, job, sender).replace(
    /\n/g,
    "<br>",
  );

  const attachments: nodemailer.SendMailOptions["attachments"] = [];

  // Global CV (listed first)
  if (cvBuffer) {
    attachments.push({
      filename: cvName ?? "cv.pdf",
      content: cvBuffer,
      contentType: "application/pdf",
    });
  }

  // Per-job PDF (info loker / portfolio)
  if (pdfBuffer) {
    attachments.push({
      filename: pdfName ?? "lamaran.pdf",
      content: pdfBuffer,
      contentType: "application/pdf",
    });
  }

  const mailOptions: nodemailer.SendMailOptions = {
    from: `"${sender.name}" <${sender.email}>`,
    to: job.hrEmail,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        ${htmlBody}
      </div>
    `,
    attachments,
  };

  await transporter.sendMail(mailOptions);
}

export async function verifyTransporter(): Promise<boolean> {
  try {
    const sender = await getSenderSettings();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: sender.email,
        pass: sender.gmailAppPassword,
      },
    });
    await transporter.verify();
    return true;
  } catch {
    return false;
  }
}
