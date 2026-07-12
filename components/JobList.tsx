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
  Clock,
  AlertCircle,
} from "lucide-react";
import type { Job } from "@/types";

interface JobListProps {
  jobs: Job[];
  loading: boolean;
  activeTemplateId?: string;
  onRefresh: () => void;
}

const STATUS_CONFIG = {
  pending: {
    label: "Belum Kirim",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
  },
  sent: {
    label: "Terkirim",
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  failed: {
    label: "Gagal",
    icon: AlertCircle,
    className: "bg-red-500/10 text-red-400 border-red-500/20",
    dot: "bg-red-400",
  },
};

function StatusBadge({ status }: { status: Job["status"] }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border ${config.className}`}
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
}: {
  job: Job;
  activeTemplateId?: string;
  onRefresh: () => void;
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
      } else {
        toast.error(json.error ?? "Gagal mengirim email");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Hapus loker ${job.company} - ${job.position}?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/jobs?id=${job.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Loker dihapus");
        onRefresh();
      } else {
        toast.error(json.error ?? "Gagal menghapus");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={`card overflow-hidden transition-all ${job.status === "sent" ? "border-l-4 border-l-emerald-500" : ""}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              <StatusBadge status={job.status} />
            </div>
            <h3 className="font-semibold text-gray-100 truncate">
              {job.company}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                {job.position}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {job.hrEmail}
              </span>
            </div>
            {job.sentAt && (
              <p className="text-xs text-gray-600 mt-1.5">
                Dikirim: {new Date(job.sentAt).toLocaleString("id-ID")}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
              title="Hapus"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {job.status !== "sent" && (
              <button
                onClick={handleSend}
                disabled={sending}
                className="btn-primary !px-3"
              >
                {sending ? (
                  <span className="animate-spin">⟳</span>
                ) : (
                  <SendHorizonal className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {sending ? "Mengirim..." : "Kirim"}
                </span>
              </button>
            )}
          </div>
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

  const filtered =
    filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-4 animate-pulse">
            <div className="h-4 bg-surface-800 rounded w-1/4 mb-2" />
            <div className="h-5 bg-surface-800 rounded w-1/2 mb-1" />
            <div className="h-4 bg-surface-800 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="card p-12 text-center">
        <Building2 className="w-10 h-10 text-surface-800 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">
          Belum ada loker. Tambahkan loker pertama!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 p-1 bg-surface-800 rounded-xl w-fit text-sm">
        {(["all", "pending", "sent", "failed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === f
                ? "bg-surface-900 text-gray-100 shadow-sm"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {f === "all"
              ? `Semua (${jobs.length})`
              : f === "pending"
                ? `Pending (${jobs.filter((j) => j.status === "pending").length})`
                : f === "sent"
                  ? `Terkirim (${jobs.filter((j) => j.status === "sent").length})`
                  : `Gagal (${jobs.filter((j) => j.status === "failed").length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500 text-sm">
            Tidak ada loker dengan status ini
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              activeTemplateId={activeTemplateId}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}
