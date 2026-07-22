"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  Building2,
  Briefcase,
  Mail,
  Trash2,
  SendHorizonal,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { Job } from "@/types";

interface JobListProps {
  jobs: Job[];
  loading: boolean;
  activeTemplateId?: string;
  onRefresh: () => void;
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    className: "bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20",
    dot: "bg-[#FFD700]",
  },
  sent: {
    label: "Terkirim",
    className: "bg-[#00FFFF]/10 text-[#00FFFF] border border-[#00FFFF]/20",
    dot: "bg-[#00FFFF]",
  },
  failed: {
    label: "Gagal",
    className: "bg-[#FF006E]/10 text-[#FF006E] border border-[#FF006E]/20",
    dot: "bg-[#FF006E]",
  },
};

function StatusBadge({ status }: { status: Job["status"] }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md font-mono ${config.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function JobCard({
  job,
  activeTemplateId,
  onRefresh,
  onDeleteRequest,
}: {
  job: Job;
  activeTemplateId?: string;
  onRefresh: () => void;
  onDeleteRequest: (job: Job) => void;
}) {
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSend = async () => {
    if (!activeTemplateId) {
      toast.error("Pilih template di tab 'Template Surat' terlebih dahulu");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobIds: [job.id],
          templateId: activeTemplateId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Email ke ${job.hrEmail} berhasil dikirim!`);
        onRefresh();
      } else toast.error(json.error ?? "Gagal mengirim email");
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/jobs?id=${job.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Loker dihapus");
        onRefresh();
      } else toast.error(json.error ?? "Gagal menghapus");
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={`bg-[#1A1A2E] border rounded-lg p-4 transition-all duration-200 hover:shadow-[0_0_10px_rgba(0,128,255,0.12)] ${
        job.status === "sent"
          ? "border-[#00FFFF]/30"
          : "border-[#0080FF]/15 hover:border-[#0080FF]/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <StatusBadge status={job.status} />
            {job.pdfName && (
              <span className="text-[11px] text-[#5D34D0] border border-[#5D34D0]/30 px-2 py-0.5 rounded-md font-mono">
                {job.pdfName}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-[#C0C0C0] text-sm truncate font-mono">
            {job.company}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[#5D34D0]">
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-3 h-3" />
              {job.position}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3 h-3" />
              {job.hrEmail}
            </span>
          </div>
          {job.sentAt && (
            <p className="text-[11px] text-[#00FFFF]/60 mt-1.5 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3 h-3 text-[#00FFFF]" />
              Dikirim {new Date(job.sentAt).toLocaleString("id-ID")}
            </p>
          )}
          {job.notes && (
            <p className="text-[11px] text-[#5D34D0]/80 mt-1 italic truncate font-mono">
              {job.notes}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onDeleteRequest(job)}
            disabled={deleting}
            className="w-8 h-8 flex items-center justify-center text-[#5D34D0]/60 hover:text-[#FF006E] hover:bg-[#FF006E]/10 rounded-lg transition-colors disabled:opacity-40"
            title="Hapus"
          >
            {deleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </button>
          {job.status !== "sent" && (
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex items-center gap-1.5 bg-[#0080FF]/15 hover:bg-[#0080FF]/25 border border-[#0080FF]/30 text-[#0080FF] text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-40"
            >
              {sending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <SendHorizonal className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline font-mono">
                {sending ? "Mengirim..." : "Kirim"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JobList({
  jobs,
  loading,
  activeTemplateId,
  onRefresh,
}: JobListProps) {
  const [filter, setFilter] = useState<"all" | Job["status"]>("all");
  const [blasting, setBlasting] = useState(false);
  const [deleteJob, setDeleteJob] = useState<Job | null>(null);
  const [confirmBlast, setConfirmBlast] = useState(false);

  const filtered =
    filter === "all" ? jobs : jobs.filter((j) => j.status === filter);
  const pendingJobs = jobs.filter((j) => j.status === "pending");

  const handleBlast = async () => {
    setConfirmBlast(false);
    if (!activeTemplateId) {
      toast.error("Pilih template terlebih dahulu");
      return;
    }
    setBlasting(true);
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobIds: [], templateId: activeTemplateId }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? "Email berhasil dikirim!");
        onRefresh();
      } else toast.error(json.error ?? "Gagal mengirim");
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setBlasting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-[#1A1A2E] border border-[#0080FF]/10 rounded-lg p-4 animate-pulse"
          >
            <div className="h-3 bg-[#0080FF]/10 rounded w-16 mb-3" />
            <div className="h-4 bg-[#0080FF]/10 rounded w-1/2 mb-2" />
            <div className="h-3 bg-[#0080FF]/10 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Building2 className="w-10 h-10 text-[#5D34D0] mb-3" />
        <p className="text-[#5D34D0]/60 text-sm font-mono">
          Belum ada loker ditambahkan
        </p>
      </div>
    );
  }

  const FILTERS: { id: "all" | Job["status"]; label: string }[] = [
    { id: "all", label: `Semua (${jobs.length})` },
    {
      id: "pending",
      label: `Pending (${jobs.filter((j) => j.status === "pending").length})`,
    },
    {
      id: "sent",
      label: `Terkirim (${jobs.filter((j) => j.status === "sent").length})`,
    },
    {
      id: "failed",
      label: `Gagal (${jobs.filter((j) => j.status === "failed").length})`,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-1 p-1 bg-[#1A1A2E] border border-[#0080FF]/15 rounded-lg w-fit text-xs overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all duration-200 font-mono ${
              filter === f.id
                ? "bg-[#0080FF]/15 text-[#0080FF] shadow-[0_0_6px_rgba(0,128,255,0.12)]"
                : "text-[#5D34D0]/60 hover:text-[#C0C0C0]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#1A1A2E] border border-[#0080FF]/10 rounded-lg p-8 text-center">
          <p className="text-[#5D34D0]/60 text-sm font-mono">
            Tidak ada loker dengan status ini
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              activeTemplateId={activeTemplateId}
              onRefresh={onRefresh}
              onDeleteRequest={setDeleteJob}
            />
          ))}
        </div>
      )}

      {pendingJobs.length > 0 && (
        <button
          onClick={() => setConfirmBlast(true)}
          disabled={blasting}
          className="w-full flex items-center justify-center gap-2 bg-[#FF006E]/15 hover:bg-[#FF006E]/25 border border-[#FF006E]/30 text-[#FF006E] text-sm font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-40 mt-2 font-mono"
        >
          {blasting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <SendHorizonal className="w-4 h-4" />
          )}
          {blasting
            ? "Mengirim..."
            : `Kirim semua yang pending (${pendingJobs.length})`}
        </button>
      )}

      <ConfirmDialog
        open={deleteJob !== null}
        title="Hapus loker"
        message={`Hapus loker "${deleteJob?.company}" - ${deleteJob?.position}?`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        onConfirm={() => {
          if (deleteJob) {
            const job = deleteJob;
            setDeleteJob(null);
            fetch(`/api/jobs?id=${job.id}`, { method: "DELETE" })
              .then((r) => r.json())
              .then((json) => {
                if (json.success) {
                  toast.success("Loker dihapus");
                  onRefresh();
                } else toast.error(json.error ?? "Gagal menghapus");
              })
              .catch(() => toast.error("Terjadi kesalahan"));
          }
        }}
        onCancel={() => setDeleteJob(null)}
      />

      <ConfirmDialog
        open={confirmBlast}
        title="Kirim semua pending"
        message={`Kirim email ke semua ${pendingJobs.length} loker pending?`}
        confirmLabel="Kirim"
        cancelLabel="Batal"
        onConfirm={handleBlast}
        onCancel={() => setConfirmBlast(false)}
      />
    </div>
  );
}
