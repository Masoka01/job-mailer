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
    className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  },
  sent: {
    label: "Terkirim",
    className:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  },
  failed: {
    label: "Gagal",
    className: "bg-red-500/10 text-red-400 border border-red-500/20",
  },
};

function StatusBadge({ status }: { status: Job["status"] }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md ${config.className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === "pending"
            ? "bg-amber-400"
            : status === "sent"
              ? "bg-emerald-400"
              : "bg-red-400"
        }`}
      />
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
      } else toast.error(json.error ?? "Gagal mengirim email");
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
      } else toast.error(json.error ?? "Gagal menghapus");
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={`bg-[#111] border rounded-xl p-4 transition-colors hover:border-[#2a2a2a] ${
        job.status === "sent" ? "border-[#1a3a22]" : "border-[#1e1e1e]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <StatusBadge status={job.status} />
            {job.pdfName && (
              <span className="text-[11px] text-[#444] border border-[#222] px-2 py-0.5 rounded-md">
                📎 {job.pdfName}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-[#e0e0e0] text-sm truncate">
            {job.company}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[#555]">
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
            <p className="text-[11px] text-[#333] mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              Dikirim {new Date(job.sentAt).toLocaleString("id-ID")}
            </p>
          )}
          {job.notes && (
            <p className="text-[11px] text-[#444] mt-1 italic truncate">
              {job.notes}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-8 h-8 flex items-center justify-center text-[#333] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40"
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
              className="flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
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

  const filtered =
    filter === "all" ? jobs : jobs.filter((j) => j.status === filter);
  const pendingJobs = jobs.filter((j) => j.status === "pending");

  const handleBlast = async () => {
    if (!activeTemplateId) {
      toast.error("Pilih template terlebih dahulu");
      return;
    }
    if (!confirm(`Kirim email ke semua ${pendingJobs.length} loker pending?`))
      return;
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
            className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 animate-pulse"
          >
            <div className="h-3 bg-[#1e1e1e] rounded w-16 mb-3" />
            <div className="h-4 bg-[#1e1e1e] rounded w-1/2 mb-2" />
            <div className="h-3 bg-[#1e1e1e] rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Building2 className="w-10 h-10 text-[#222] mb-3" />
        <p className="text-[#444] text-sm">Belum ada loker ditambahkan</p>
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
      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-[#111] border border-[#1e1e1e] rounded-xl w-fit text-xs overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === f.id
                ? "bg-[#1a2a4a] text-blue-400"
                : "text-[#444] hover:text-[#888]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Job cards */}
      {filtered.length === 0 ? (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-8 text-center">
          <p className="text-[#444] text-sm">
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
            />
          ))}
        </div>
      )}

      {/* Blast button */}
      {pendingJobs.length > 0 && (
        <button
          onClick={handleBlast}
          disabled={blasting}
          className="w-full flex items-center justify-center gap-2 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-600/25 text-blue-400 text-sm font-medium py-3 rounded-xl transition-colors disabled:opacity-40 mt-2"
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
    </div>
  );
}
