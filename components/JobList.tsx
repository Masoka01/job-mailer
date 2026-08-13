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
    className: "bg-[#EAB308]/10 text-[#EAB308] border border-[#EAB308]/25",
    dot: "bg-[#EAB308]",
  },
  sent: {
    label: "Terkirim",
    className: "bg-[#22C55E]/10 text-[#4ADE80] border border-[#22C55E]/25",
    dot: "bg-[#22C55E]",
  },
  failed: {
    label: "Gagal",
    className: "bg-[#EF4444]/10 text-[#F87171] border border-[#EF4444]/25",
    dot: "bg-[#EF4444]",
  },
};

function StatusBadge({ status }: { status: Job["status"] }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded uppercase tracking-wider ${config.className}`}
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
      className={`bg-health-surface border rounded-lg p-4 transition-colors duration-200 ${
        job.status === "sent"
          ? "border-health-success/30"
          : "border-health-border hover:border-[#334155]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <StatusBadge status={job.status} />
            {job.pdfName && (
              <span className="text-[11px] text-health-muted border border-health-border px-2 py-0.5 rounded">
                {job.pdfName}
              </span>
            )}
          </div>
          <h3 className="font-sans font-semibold text-health-text text-sm truncate">
            {job.company}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-health-slate">
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
            <p className="text-[11px] text-[#4ADE80]/70 mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
              Dikirim {new Date(job.sentAt).toLocaleString("id-ID")}
            </p>
          )}
          {job.notes && (
            <p className="text-[11px] text-health-slate/80 mt-1 italic truncate">
              {job.notes}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onDeleteRequest(job)}
            disabled={deleting}
            className="w-8 h-8 flex items-center justify-center text-health-slate/60 hover:text-[#F87171] hover:bg-[#EF4444]/10 rounded-lg transition-colors disabled:opacity-40"
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
              className="flex items-center gap-1.5 bg-health-sage/15 hover:bg-health-sage/25 border border-health-sage/30 text-[#10B981] text-xs font-medium px-3 py-1.5 rounded-lg transition-colors duration-200 disabled:opacity-40"
            >
              {sending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <SendHorizonal className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
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
            className="bg-health-surface border border-health-border rounded-lg p-4 animate-pulse"
          >
            <div className="h-3 bg-health-border rounded w-16 mb-3" />
            <div className="h-4 bg-health-border rounded w-1/2 mb-2" />
            <div className="h-3 bg-health-border rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Building2 className="w-10 h-10 text-health-slate mb-3" />
        <p className="text-health-slate/60 text-sm">
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
      <div className="flex gap-1 p-1 bg-health-surface border border-health-border rounded-lg w-fit text-xs overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors duration-200 ${
              filter === f.id
                ? "bg-health-sage/15 text-[#10B981]"
                : "text-health-slate hover:text-health-text"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-health-surface border border-health-border rounded-lg p-8 text-center">
          <p className="text-health-slate/60 text-sm">
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
          className="w-full flex items-center justify-center gap-2 bg-health-sage hover:bg-[#047857] text-white text-sm font-medium py-3 rounded-lg transition-colors duration-200 disabled:opacity-40 mt-2"
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
