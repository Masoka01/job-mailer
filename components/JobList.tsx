"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  Building2,
  Briefcase,
  Mail,
  Trash2,
  SendHorizonal,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
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
    className: "bg-amber-50 text-amber-700 border-amber-100",
    dot: "bg-amber-400",
  },
  sent: {
    label: "Terkirim",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-400",
  },
  failed: {
    label: "Gagal",
    icon: AlertCircle,
    className: "bg-red-50 text-red-700 border-red-100",
    dot: "bg-red-400",
  },
};

function StatusBadge({ status }: { status: Job["status"] }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
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
  const [expanded, setExpanded] = useState(false);

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
    <div className="card overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={job.status} />
              {job.pdfName && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                  <FileText className="w-3 h-3" />
                  PDF
                </span>
              )}
            </div>

            <h3 className="font-semibold text-gray-900 truncate">
              {job.company}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {job.position}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {job.hrEmail}
              </span>
            </div>
            {job.sentAt && (
              <p className="text-xs text-gray-400 mt-1">
                Dikirim: {new Date(job.sentAt).toLocaleString("id-ID")}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn-danger !px-2.5 !py-2"
              title="Hapus"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {job.status !== "sent" && (
              <button
                onClick={handleSend}
                disabled={sending}
                className="btn-primary !px-3"
                title="Kirim Sekarang"
              >
                {sending ? (
                  <span className="animate-spin text-sm">⟳</span>
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

        {job.notes && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
            Catatan
          </button>
        )}
        {expanded && job.notes && (
          <p className="mt-2 text-sm text-gray-600 bg-surface-50 rounded-lg p-3">
            {job.notes}
          </p>
        )}
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
            <div className="h-4 bg-surface-100 rounded w-1/4 mb-2" />
            <div className="h-5 bg-surface-100 rounded w-1/2 mb-1" />
            <div className="h-4 bg-surface-100 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="card p-12 text-center">
        <Building2 className="w-10 h-10 text-surface-200 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Belum ada loker. Tambahkan loker pertama!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-1 p-1 bg-surface-100 rounded-xl w-fit text-sm">
        {(["all", "pending", "sent", "failed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === f
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
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
          <p className="text-gray-400 text-sm">Tidak ada loker dengan status ini</p>
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
