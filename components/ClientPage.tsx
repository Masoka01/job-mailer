"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useLocalStorage } from "@/lib/use-local-storage";
import {
  Mail,
  BriefcaseIcon,
  RefreshCw,
  Menu,
  X,
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

export default function ClientPage() {
  const [tab, setTabState] = useLocalStorage<Tab>("jobmailer-tab", "jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useLocalStorage<EmailTemplate | null>("jobmailer-template", null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [showForm, setShowForm] = useLocalStorage("jobmailer-show-form", false);
  const [drawerOpen, setDrawerOpen] = useState(false);
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
    <div className="min-h-screen bg-[#0D0D1A] flex">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-60 shrink-0 bg-[#0D0D1A] border-r border-[#0080FF]/20 sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-4 pt-5 pb-4 border-b border-[#0080FF]/20">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 bg-[#FF006E] rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(255,0,110,0.3)]">
              <Mail className="w-4 h-4 text-black" />
            </div>
            <span className="font-semibold text-[#00FFFF] text-sm tracking-[0.1em] neon-text-cyan">
              JobMailer
            </span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-[#1A1A2E] rounded-lg px-3 py-2 text-center border border-[#0080FF]/10">
              <p className="text-base font-semibold text-[#C0C0C0]">
                {jobs.length}
              </p>
              <p className="text-[10px] text-[#5D34D0] mt-0.5 font-mono uppercase tracking-wider">Total</p>
            </div>
            <div className="bg-[#1A1A2E] rounded-lg px-3 py-2 text-center border border-[#0080FF]/10">
              <p className="text-base font-semibold text-[#00FFFF]">
                {sentCount}
              </p>
              <p className="text-[10px] text-[#5D34D0] mt-0.5 font-mono uppercase tracking-wider">Terkirim</p>
            </div>
            <div className="bg-[#1A1A2E] rounded-lg px-3 py-2 text-center border border-[#0080FF]/10">
              <p className="text-base font-semibold text-[#FFD700]">
                {pendingCount}
              </p>
              <p className="text-[10px] text-[#5D34D0] mt-0.5 font-mono uppercase tracking-wider">Pending</p>
            </div>
            <div className="bg-[#1A1A2E] rounded-lg px-3 py-2 text-center border border-[#0080FF]/10">
              <p className="text-base font-semibold text-[#FF006E]">
                {failedCount}
              </p>
              <p className="text-[10px] text-[#5D34D0] mt-0.5 font-mono uppercase tracking-wider">Gagal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                tab === item.id
                  ? "bg-[#0080FF]/15 text-[#0080FF] shadow-[0_0_8px_rgba(0,128,255,0.15)]"
                  : "text-[#5D34D0]/60 hover:text-[#C0C0C0] hover:bg-[#0080FF]/5"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-2 pb-4 space-y-1.5 border-t border-[#0080FF]/20 pt-3">
          {cvUploaded && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#00FFFF]/10 border border-[#00FFFF]/30 rounded-lg">
              <span className="w-1.5 h-1.5 bg-[#00FFFF] rounded-full shrink-0 shadow-[0_0_4px_rgba(0,255,255,0.6)]" />
              <span className="text-[11px] text-[#00FFFF] font-mono">CV terpasang</span>
            </div>
          )}
          <button
            onClick={fetchJobs}
            className="w-full flex items-center gap-2 px-3 py-2 text-[#5D34D0]/60 hover:text-[#00FFFF] hover:bg-[#0080FF]/5 rounded-lg text-xs transition-all duration-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh data
          </button>
          <a
            href="https://mayoni-porto.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-2 px-3 py-2 text-[#5D34D0]/60 hover:text-[#00FFFF] hover:bg-[#0080FF]/5 rounded-lg text-xs transition-all duration-200"
          >
            <Globe className="w-3.5 h-3.5" />
            Portfolio
          </a>
        </div>
      </aside>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── MOBILE DRAWER ── */}
      <div
        className={`lg:hidden fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-[#0D0D1A] border-l border-[#0080FF]/20 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="px-4 pt-5 pb-4 border-b border-[#0080FF]/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#FF006E] rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(255,0,110,0.3)]">
                <Mail className="w-4 h-4 text-black" />
              </div>
              <span className="font-semibold text-[#00FFFF] text-sm neon-text-cyan">
                JobMailer
              </span>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-8 h-8 flex items-center justify-center text-[#5D34D0]/60 hover:text-[#C0C0C0] rounded-lg hover:bg-[#0080FF]/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#1A1A2E] rounded-xl px-3 py-2.5 text-center border border-[#0080FF]/10">
              <p className="text-lg font-semibold text-[#C0C0C0]">{jobs.length}</p>
              <p className="text-[11px] text-[#5D34D0] mt-0.5 font-mono uppercase tracking-wider">Total</p>
            </div>
            <div className="bg-[#1A1A2E] rounded-xl px-3 py-2.5 text-center border border-[#0080FF]/10">
              <p className="text-lg font-semibold text-[#00FFFF]">{sentCount}</p>
              <p className="text-[11px] text-[#5D34D0] mt-0.5 font-mono uppercase tracking-wider">Terkirim</p>
            </div>
            <div className="bg-[#1A1A2E] rounded-xl px-3 py-2.5 text-center border border-[#0080FF]/10">
              <p className="text-lg font-semibold text-[#FFD700]">{pendingCount}</p>
              <p className="text-[11px] text-[#5D34D0] mt-0.5 font-mono uppercase tracking-wider">Pending</p>
            </div>
            <div className="bg-[#1A1A2E] rounded-xl px-3 py-2.5 text-center border border-[#0080FF]/10">
              <p className="text-lg font-semibold text-[#FF006E]">{failedCount}</p>
              <p className="text-[11px] text-[#5D34D0] mt-0.5 font-mono uppercase tracking-wider">Gagal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                tab === item.id
                  ? "bg-[#0080FF]/15 text-[#0080FF] shadow-[0_0_8px_rgba(0,128,255,0.15)]"
                  : "text-[#5D34D0]/60 hover:text-[#C0C0C0] hover:bg-[#0080FF]/5"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-20 pt-3 border-t border-[#0080FF]/20 space-y-1.5">
          {cvUploaded && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#00FFFF]/10 border border-[#00FFFF]/30 rounded-xl">
              <span className="w-1.5 h-1.5 bg-[#00FFFF] rounded-full shadow-[0_0_4px_rgba(0,255,255,0.6)]" />
              <span className="text-xs text-[#00FFFF] font-mono">CV terpasang</span>
            </div>
          )}
          <a
            href="https://mayoni-porto.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 text-[#5D34D0]/60 hover:text-[#00FFFF] rounded-xl text-xs transition-all duration-200 font-mono"
          >
            <Globe className="w-3.5 h-3.5" />
            Portfolio
          </a>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-[#0D0D1A]/90 backdrop-blur border-b border-[#0080FF]/20">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#FF006E] rounded-lg flex items-center justify-center shadow-[0_0_8px_rgba(255,0,110,0.3)]">
                <Mail className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="font-semibold text-[#00FFFF] text-sm neon-text-cyan">JobMailer</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchJobs} className="w-9 h-9 flex items-center justify-center text-[#5D34D0]/60 hover:text-[#00FFFF] rounded-lg hover:bg-[#0080FF]/5 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button onClick={() => setDrawerOpen(true)} className="w-9 h-9 flex items-center justify-center text-[#5D34D0]/60 hover:text-[#00FFFF] rounded-lg hover:bg-[#0080FF]/5 transition-colors" aria-label="Buka menu">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="hidden lg:flex items-center justify-between px-6 xl:px-8 pt-6 pb-0">
          <h1 className="text-base font-semibold text-[#FF006E] neon-text-pink uppercase tracking-wider">
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
              {!showForm && (
                <button onClick={() => setShowForm(true)} className="lg:hidden flex items-center gap-2 w-full justify-center bg-[#1A1A2E] hover:bg-[#1A1A2E]/80 border border-[#0080FF]/30 hover:border-[#0080FF]/50 text-[#0080FF] hover:text-[#00FFFF] text-sm font-medium px-4 py-3 rounded-lg transition-all duration-200">
                  <Plus className="w-4 h-4" />
                  Tambah loker baru
                </button>
              )}

              {showForm && (
                <div className="bg-[#1A1A2E] border border-[#FF006E]/30 rounded-xl p-5 shadow-[0_0_15px_rgba(255,0,110,0.1)]">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-[#FF006E] neon-text-pink uppercase tracking-wider">Tambah loker baru</h2>
                    <button onClick={() => setShowForm(false)} className="text-[#5D34D0]/60 hover:text-[#C0C0C0] text-xs transition-colors">Batal</button>
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
              onDelete={handleDeleteTemplate}
            />
          )}
        </main>
      </div>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0D0D1A]/95 backdrop-blur border-t border-[#0080FF]/20">
        <div className="flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-mono transition-all duration-200 ${
                tab === item.id
                  ? "text-[#0080FF]"
                  : "text-[#5D34D0]/60"
              }`}
            >
              {item.id === tab && (
                <span className="absolute top-0 w-8 h-0.5 bg-[#0080FF] rounded-full" />
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
