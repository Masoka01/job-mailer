"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useLocalStorage } from "@/lib/use-local-storage";
import {
  Mail,
  BriefcaseIcon,
  RefreshCw,
  FileText,
  CreditCard,
  Plus,
  Globe,
} from "lucide-react";
import JobForm from "@/components/JobForm";
import JobList from "@/components/JobList";
import TemplateEditor from "@/components/TemplateEditor";
import CVUploader from "@/components/CVUploader";
import type { Job, EmailTemplate } from "@/types";

type Tab = "jobs" | "template" | "cv";

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "jobs",
    label: "Daftar loker",
    icon: <BriefcaseIcon className="w-4 h-4" />,
  },
  {
    id: "template",
    label: "Template surat",
    icon: <FileText className="w-4 h-4" />,
  },
  { id: "cv", label: "CV saya", icon: <CreditCard className="w-4 h-4" /> },
];

function StatCard({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: number;
  valueClass?: string;
}) {
  return (
    <div className="bg-health-surface rounded-lg px-2.5 py-2 text-center border border-health-border">
      <p className={`text-sm font-semibold font-mono ${valueClass ?? "text-health-text"}`}>
        {value}
      </p>
      <p className="text-[11px] text-health-slate mt-0.5 uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}

export default function ClientPage() {
  const [tab, setTabState] = useLocalStorage<Tab>("jobmailer-tab", "jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useLocalStorage<EmailTemplate | null>("jobmailer-template", null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [showForm, setShowForm] = useLocalStorage("jobmailer-show-form", false);
  const [cvUploaded, setCvUploaded] = useState(false);

  const setTab = (value: Tab) => setTabState(value);

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
        json.data[0] ? setActiveTemplate(json.data[0]) : void 0;
      }
    } catch {
      toast.error("Gagal memuat template");
    }
  }, []);

  const fetchCvStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/cv");
      const json = await res.json();
      setCvUploaded(!!json.data);
    } catch {}
  }, []);

  const handleDeleteTemplate = useCallback(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    fetchJobs();
    fetchTemplates();
    fetchCvStatus();
  }, [fetchJobs, fetchTemplates, fetchCvStatus]);

  const pendingCount = jobs.filter((j) => j.status === "pending").length;
  const sentCount = jobs.filter((j) => j.status === "sent").length;
  const failedCount = jobs.filter((j) => j.status === "failed").length;

  const PAGE_TITLES: Record<Tab, string> = {
    jobs: "Daftar loker",
    template: "Template surat",
    cv: "CV saya",
  };

  return (
    <div className="min-h-screen bg-health-bg flex">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-60 shrink-0 bg-health-bg border-r border-health-border sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-4 pt-5 pb-4 border-b border-health-border">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 bg-health-sage rounded-lg flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="font-sans font-semibold text-white text-sm">
              JobMailer
            </span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-1.5">
            <StatCard label="Total" value={jobs.length} />
            <StatCard label="Terkirim" value={sentCount} valueClass="text-health-success-bright" />
            <StatCard label="Pending" value={pendingCount} valueClass="text-health-warning" />
            <StatCard label="Gagal" value={failedCount} valueClass="text-health-error-bright" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
                tab === item.id
                  ? "bg-health-sage/15 text-health-sage-bright"
                  : "text-health-slate hover:text-health-text hover:bg-white/5"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-2 pb-4 space-y-1.5 border-t border-health-border pt-3">
          {cvUploaded && (
            <div className="flex items-center gap-2 px-3 py-2 bg-health-success/10 border border-health-success/25 rounded-lg">
              <span className="w-1.5 h-1.5 bg-health-success rounded-full shrink-0" />
              <span className="text-[11px] text-health-success-bright">CV terpasang</span>
            </div>
          )}
          <button
            onClick={fetchJobs}
            className="w-full flex items-center gap-2 px-3 py-2 text-health-slate hover:text-health-sage-bright hover:bg-white/5 rounded-lg text-xs transition-colors duration-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh data
          </button>
          <a
            href="https://mayoni-porto.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-2 px-3 py-2 text-health-slate hover:text-health-sage-bright hover:bg-white/5 rounded-lg text-xs transition-colors duration-200"
          >
            <Globe className="w-3.5 h-3.5" />
            Portfolio
          </a>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-health-bg/90 backdrop-blur border-b border-health-border">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-health-sage rounded-lg flex items-center justify-center">
                <Mail className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-sans font-semibold text-white text-sm">JobMailer</span>
            </div>
            {tab === "jobs" && (
              <button
                onClick={() => setShowForm(true)}
                className="w-9 h-9 flex items-center justify-center text-health-slate hover:text-health-sage-bright hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Tambah loker"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={fetchJobs}
              className="w-9 h-9 flex items-center justify-center text-health-slate hover:text-health-sage-bright hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="hidden lg:flex items-center justify-between px-6 xl:px-8 pt-6 pb-0">
          <h1 className="font-sans text-lg font-semibold text-health-text">
            {PAGE_TITLES[tab]}
          </h1>
          {tab === "jobs" && (
            <button onClick={() => setShowForm(true)} className="btn-primary text-xs px-4 py-2">
              <Plus className="w-4 h-4" />
              Tambah loker
            </button>
          )}
        </div>

        <main className="flex-1 px-4 lg:px-6 xl:px-8 py-5 lg:py-6 pb-20 lg:pb-8">
          {tab === "cv" && <CVUploader />}

          {tab === "jobs" && (
            <div className="space-y-4">
              {/* Mobile stats strip */}
              <div className="lg:hidden grid grid-cols-4 gap-2">
                <StatCard label="Total" value={jobs.length} />
                <StatCard label="Terkirim" value={sentCount} valueClass="text-health-success-bright" />
                <StatCard label="Pending" value={pendingCount} valueClass="text-health-warning" />
                <StatCard label="Gagal" value={failedCount} valueClass="text-health-error-bright" />
              </div>

              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="lg:hidden flex items-center gap-2 w-full justify-center bg-health-sage hover:bg-health-sage-dark text-white text-sm font-medium px-4 py-3 rounded-lg transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Tambah loker baru
                </button>
              )}

              {showForm && (
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-sans text-sm font-semibold text-health-text">
                      Tambah loker baru
                    </h2>
                    <button
                      onClick={() => setShowForm(false)}
                      className="text-health-slate hover:text-health-text text-xs transition-colors"
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
                activeTemplate={activeTemplate}
                onRefresh={fetchJobs}
                onAddJob={() => setShowForm(true)}
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
              onDelete={handleDeleteTemplate}
            />
          )}
        </main>
      </div>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-health-bg/95 backdrop-blur border-t border-health-border">
        <div className="flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`relative flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] transition-colors duration-200 ${
                tab === item.id ? "text-health-sage-bright" : "text-health-slate"
              }`}
            >
              {item.id === tab && (
                <span className="absolute top-0 w-8 h-0.5 bg-health-sage rounded-full" />
              )}
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
