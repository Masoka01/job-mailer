export type JobStatus = "pending" | "sent" | "failed";

export interface Job {
  id: string;
  company: string;
  position: string;
  hrEmail: string;
  pdfUrl?: string;
  pdfName?: string;
  pdfBase64?: string;
  status: JobStatus;
  sentAt?: string;
  createdAt: string;
  notes?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  updatedAt: string;
}

export interface SendEmailPayload {
  jobIds: string[];
  templateId: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
