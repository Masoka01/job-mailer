import nodemailer from "nodemailer";
import type { Job, EmailTemplate } from "@/types";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Replace template variables:
 * {{company}}, {{position}}, {{hrEmail}}, {{senderName}}, {{senderEmail}}
 */
function interpolate(text: string, job: Job): string {
  const senderName =
    process.env.GMAIL_USER?.split("@")[0]?.replace(/[._]/g, " ") ?? "Pelamar";
  return text
    .replace(/\{\{company\}\}/g, job.company)
    .replace(/\{\{position\}\}/g, job.position)
    .replace(/\{\{hrEmail\}\}/g, job.hrEmail)
    .replace(/\{\{senderName\}\}/g, senderName)
    .replace(/\{\{senderEmail\}\}/g, process.env.GMAIL_USER ?? "");
}

export async function sendApplicationEmail(
  job: Job,
  template: EmailTemplate,
  pdfBuffer?: Buffer,
  pdfName?: string,
  cvBuffer?: Buffer,
  cvName?: string
): Promise<void> {
  const subject = interpolate(template.subject, job);
  const htmlBody = interpolate(template.body, job).replace(/\n/g, "<br>");

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
    from: `"${process.env.GMAIL_USER?.split("@")[0]}" <${process.env.GMAIL_USER}>`,
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
    await transporter.verify();
    return true;
  } catch {
    return false;
  }
}
