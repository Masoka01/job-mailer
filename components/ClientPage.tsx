"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Mail,
  BriefcaseIcon,
  SendHorizonal,
  RefreshCw,
  Zap,
} from "lucide-react";
import JobForm from "@/components/JobForm";
import JobList from "@/components/JobList";
import TemplateEditor from "@/components/TemplateEditor";
import CVUploader from "@/components/CVUploader";
import type { Job, EmailTemplate } from "@/types";

type Tab = "jobs" | "template" | "cv";

export default function ClientPage() {
  const [tab, setTab] = useState<Tab>("jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<EmailTemplate | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [blasting, setBlasting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const res = await fetch("/api/jobs");
      const json = await res.json();
      if (json.success) setJobs(json.data);
    } catch {
      toast.error("Gagal memuat daftar loker");
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/send");
      const json = await res.json();
      if (json.success && json.data?.length > 0) {
        setTemplates(json.data);
        setActiveTemplate(json.data[0]);
      }
    } catch {
      toast.error("Gagal memuat template");
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchTemplates();
  }, [fetchJobs, fetchTemplates]);

  const handleBlastAll = async () => {
    if (!activeTemplate) {
      toast.error("Pilih template terlebih dahulu");
      return;
    }
    const pendingJobs = jobs.filter((j) => j.status === "pending");
    if (pendingJobs.length === 0) {
      toast("Semua loker sudah terkirim atau tidak ada yang pending", { icon: "ℹ️" });
      return;
    }

    setBlasting(true);
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobIds: [], templateId: activeTemplate.id }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? "Email berhasil dikirim!");
        fetchJobs();
      } else {
        toast.error(json.error ?? "Gagal mengirim email");
      }
    } catch {
      toast.error("Terjadi kesalahan saat pengiriman blast");
    } finally {
      setBlasting(false);
    }
  };

  const pendingCount = jobs.filter((j) => j.status === "pending").length;
  const sentCount = jobs.filter((j) => j.status === "sent").length;

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-white border-b border-surface-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 tracking-tight">JobMailer</span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={fetchJobs} className="btn-secondary !px-3" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleBlastAll}
              disabled={blasting || pendingCount === 0}
              className="btn-primary"
            >
              {blasting ? (
                <><RefreshCw className="w-4 h-4 animate-spin" />Mengirim...</>
              ) : (
                <><Zap className="w-4 h-4" />Blast Semua ({pendingCount})</>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-surface-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-6 text-sm">
          <span className="flex items-center gap-1.5 text-gray-500">
            <BriefcaseIcon className="w-4 h-4" />
            <strong className="text-gray-800">{jobs.length}</strong> total loker
          </span>
          <span className="flex items-center gap-1.5 text-amber-600">
            <span className="w-2 h-2 bg-amber-400 rounded-full" />
            <strong>{pendingCount}</strong> pending
          </span>
          <span className="flex items-center gap-1.5 text-emerald-600">
            <span className="w-2 h-2 bg-emerald-400 rounded-full" />
            <strong>{sentCount}</strong> terkirim
          </span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-1 p-1 bg-surface-100 rounded-xl w-fit mb-6">
          {(["jobs", "template", "cv"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                tab === t
                  ? "bg-white text-brand-500 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "jobs" ? "Daftar Loker" : t === "template" ? "Template Surat" : "CV Saya"}
            </button>
          ))}
        </div>

        {tab === "cv" && <CVUploader />}

        {tab === "jobs" && (
          <div className="space-y-6">
            {!showForm ? (
              <button onClick={() => setShowForm(true)} className="btn-primary">
                <BriefcaseIcon className="w-4 h-4" />
                Tambah Loker Baru
              </button>
            ) : (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-semibold text-gray-900">Tambah Loker Baru</h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                  >
                    Batal
                  </button>
                </div>
                <JobForm
                  onSuccess={() => {
                    setShowForm(false);
                    fetchJobs();
                    toast.success("Loker berhasil ditambahkan!");
                  }}
                />
              </div>
            )}

            <JobList
              jobs={jobs}
              loading={loadingJobs}
              activeTemplateId={activeTemplate?.id}
              onRefresh={fetchJobs}
            />
          </div>
        )}

        {tab === "template" && (
          <TemplateEditor
            templates={templates}
            activeTemplate={activeTemplate}
            onSelect={setActiveTemplate}
            onSaved={(updated) => {
              setActiveTemplate(updated);
              fetchTemplates();
            }}
          />
        )}
      </main>
    </div>
  );
}
