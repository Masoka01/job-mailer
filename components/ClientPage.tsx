"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Mail,
  BriefcaseIcon,
  RefreshCw,
  Menu,
  X,
  FileText,
  CreditCard,
  Plus,
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

export default function ClientPage() {
  const [tab, setTab] = useState<Tab>("jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<EmailTemplate | null>(
    null,
  );
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cvUploaded, setCvUploaded] = useState(false);

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

  const fetchCvStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/cv");
      const json = await res.json();
      setCvUploaded(!!json.data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchTemplates();
    fetchCvStatus();
  }, [fetchJobs, fetchTemplates, fetchCvStatus]);

  // Close drawer on outside click (handled via overlay)
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const pendingCount = jobs.filter((j) => j.status === "pending").length;
  const sentCount = jobs.filter((j) => j.status === "sent").length;
  const failedCount = jobs.filter((j) => j.status === "failed").length;

  const handleTabChange = (t: Tab) => {
    setTab(t);
    setDrawerOpen(false);
  };

  const PAGE_TITLES: Record<Tab, string> = {
    jobs: "Daftar loker",
    template: "Template surat",
    cv: "CV saya",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-60 shrink-0 bg-[#0d0d0d] border-r border-[#1e1e1e] sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-4 pt-5 pb-4 border-b border-[#1e1e1e]">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-[#f0f0f0] text-sm tracking-tight">
              JobMailer
            </span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-[#161616] rounded-lg px-3 py-2 text-center">
              <p className="text-base font-semibold text-[#f0f0f0]">
                {jobs.length}
              </p>
              <p className="text-[10px] text-[#444] mt-0.5">Total</p>
            </div>
            <div className="bg-[#161616] rounded-lg px-3 py-2 text-center">
              <p className="text-base font-semibold text-emerald-400">
                {sentCount}
              </p>
              <p className="text-[10px] text-[#444] mt-0.5">Terkirim</p>
            </div>
            <div className="bg-[#161616] rounded-lg px-3 py-2 text-center">
              <p className="text-base font-semibold text-amber-400">
                {pendingCount}
              </p>
              <p className="text-[10px] text-[#444] mt-0.5">Pending</p>
            </div>
            <div className="bg-[#161616] rounded-lg px-3 py-2 text-center">
              <p className="text-base font-semibold text-red-400">
                {failedCount}
              </p>
              <p className="text-[10px] text-[#444] mt-0.5">Gagal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                tab === item.id
                  ? "bg-[#1a2a4a] text-blue-400"
                  : "text-[#444] hover:text-[#999] hover:bg-[#161616]"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-2 pb-4 space-y-1.5 border-t border-[#1e1e1e] pt-3">
          {cvUploaded && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-950/50 border border-emerald-900/50 rounded-lg">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0" />
              <span className="text-[11px] text-emerald-400">CV terpasang</span>
            </div>
          )}
          <button
            onClick={fetchJobs}
            className="w-full flex items-center gap-2 px-3 py-2 text-[#444] hover:text-[#888] hover:bg-[#161616] rounded-lg text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh data
          </button>
        </div>
      </aside>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── MOBILE DRAWER (dari kanan) ── */}
      <div
        className={`lg:hidden fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-[#0d0d0d] border-l border-[#1e1e1e] z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="px-4 pt-5 pb-4 border-b border-[#1e1e1e]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-[#f0f0f0] text-sm">
                JobMailer
              </span>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-8 h-8 flex items-center justify-center text-[#444] hover:text-[#888] rounded-lg hover:bg-[#161616] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#161616] rounded-xl px-3 py-2.5 text-center">
              <p className="text-lg font-semibold text-[#f0f0f0]">
                {jobs.length}
              </p>
              <p className="text-[11px] text-[#444] mt-0.5">Total</p>
            </div>
            <div className="bg-[#161616] rounded-xl px-3 py-2.5 text-center">
              <p className="text-lg font-semibold text-emerald-400">
                {sentCount}
              </p>
              <p className="text-[11px] text-[#444] mt-0.5">Terkirim</p>
            </div>
            <div className="bg-[#161616] rounded-xl px-3 py-2.5 text-center">
              <p className="text-lg font-semibold text-amber-400">
                {pendingCount}
              </p>
              <p className="text-[11px] text-[#444] mt-0.5">Pending</p>
            </div>
            <div className="bg-[#161616] rounded-xl px-3 py-2.5 text-center">
              <p className="text-lg font-semibold text-red-400">
                {failedCount}
              </p>
              <p className="text-[11px] text-[#444] mt-0.5">Gagal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                tab === item.id
                  ? "bg-[#1a2a4a] text-blue-400"
                  : "text-[#555] hover:text-[#999] hover:bg-[#161616]"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Drawer footer */}
        <div className="px-3 pb-6 pt-3 border-t border-[#1e1e1e]">
          {cvUploaded && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-950/50 border border-emerald-900/50 rounded-xl">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              <span className="text-xs text-emerald-400">CV terpasang</span>
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-30 bg-[#0a0a0a]/90 backdrop-blur border-b border-[#1e1e1e]">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <Mail className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-[#f0f0f0] text-sm">
                JobMailer
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchJobs}
                className="w-9 h-9 flex items-center justify-center text-[#555] hover:text-[#888] rounded-lg hover:bg-[#161616] transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDrawerOpen(true)}
                className="w-9 h-9 flex items-center justify-center text-[#555] hover:text-[#888] rounded-lg hover:bg-[#161616] transition-colors"
                aria-label="Buka menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Desktop page header */}
        <div className="hidden lg:flex items-center justify-between px-6 xl:px-8 pt-6 pb-0">
          <h1 className="text-base font-semibold text-[#e0e0e0]">
            {PAGE_TITLES[tab]}
          </h1>
          {tab === "jobs" && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah loker
            </button>
          )}
        </div>

        {/* Page content */}
        <main className="flex-1 px-4 lg:px-6 xl:px-8 py-5 lg:py-6 pb-24 lg:pb-8">
          {tab === "cv" && <CVUploader />}

          {tab === "jobs" && (
            <div className="space-y-4">
              {/* Mobile add button */}
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="lg:hidden flex items-center gap-2 w-full justify-center bg-[#161616] hover:bg-[#1e1e1e] border border-[#2a2a2a] hover:border-[#333] text-[#888] hover:text-[#bbb] text-sm font-medium px-4 py-3 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Tambah loker baru
                </button>
              )}

              {/* Form */}
              {showForm && (
                <div className="bg-[#111] border border-[#222] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-[#e0e0e0]">
                      Tambah loker baru
                    </h2>
                    <button
                      onClick={() => setShowForm(false)}
                      className="text-[#444] hover:text-[#888] text-xs transition-colors"
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
    </div>
  );
}
