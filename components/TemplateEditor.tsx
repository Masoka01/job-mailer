"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Save, Plus, Info, FileText, Trash2, Lock } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { EmailTemplate } from "@/types";

interface TemplateEditorProps {
  templates: EmailTemplate[];
  activeTemplate: EmailTemplate | null;
  onSelect: (t: EmailTemplate) => void;
  onSaved: (t: EmailTemplate) => void;
  onDelete: (id: string) => void;
}

const VARIABLES = [
  { var: "{{company}}", desc: "Nama perusahaan" },
  { var: "{{position}}", desc: "Posisi yang dilamar" },
  { var: "{{hrEmail}}", desc: "Email HRD tujuan" },
  { var: "{{senderName}}", desc: "Nama pengirim" },
  { var: "{{senderEmail}}", desc: "Email pengirim" },
];

export default function TemplateEditor({
  templates,
  activeTemplate,
  onSelect,
  onSaved,
  onDelete,
}: TemplateEditorProps) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EmailTemplate | null>(null);

  const isReadOnly = activeTemplate?.isDefault && !isNew;

  useEffect(() => {
    if (activeTemplate && !isNew) {
      setName(activeTemplate.name);
      setSubject(activeTemplate.subject);
      setBody(activeTemplate.body);
    }
  }, [activeTemplate, isNew]);

  const handleSave = async () => {
    if (!subject || !body) {
      toast.error("Subject dan isi surat wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/send", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: isNew ? undefined : activeTemplate?.id,
          name: name || "Template",
          subject,
          body,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Template berhasil disimpan!");
        setIsNew(false);
        onSaved({
          id: json.data?.id ?? activeTemplate?.id ?? "",
          name: name || "Template",
          subject,
          body,
          updatedAt: new Date().toISOString(),
        });
      } else toast.error(json.error ?? "Gagal menyimpan template");
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const handleNew = () => {
    setIsNew(true);
    setName("Template Baru");
    setSubject("Lamaran Kerja - {{position}} di {{company}}");
    setBody("");
    onSelect({
      id: "",
      name: "Template Baru",
      subject: "",
      body: "",
      updatedAt: "",
    });
  };

  const handleDelete = async (t: EmailTemplate) => {
    try {
      const res = await fetch(`/api/send?id=${t.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Template berhasil dihapus");
        onDelete(t.id);
      } else toast.error(json.error ?? "Gagal menghapus template");
    } catch {
      toast.error("Terjadi kesalahan");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <span className="label mb-0">Template</span>
          <button
            onClick={handleNew}
            className="btn-secondary !px-2.5 !py-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Baru
          </button>
        </div>
        {templates.map((t) => (
          <div
            key={t.id}
            className={`group w-full text-left px-3.5 py-3 rounded-lg border text-sm transition-colors duration-200 cursor-pointer ${
              activeTemplate?.id === t.id && !isNew
                ? "bg-health-sage/10 border-health-sage/40 text-health-sage-bright"
                : "bg-health-surface border-health-border text-health-muted hover:border-health-border-strong hover:text-health-text"
            }`}
            onClick={() => {
              setIsNew(false);
              onSelect(t);
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                <p className="font-medium truncate">{t.name}</p>
                {t.isDefault && <Lock className="w-3 h-3 text-health-slate shrink-0" />}
              </div>
              {!t.isDefault && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(t);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-health-slate/60 hover:text-health-error-bright transition-colors"
                  title="Hapus template"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-xs text-health-slate/60 truncate pl-5 mt-1">{t.subject}</p>
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className="lg:col-span-3 space-y-4">
        {/* Variable hint */}
        <div className="bg-health-sage/5 border border-health-sage/20 rounded-lg p-4">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-health-sage-bright mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-health-sage-bright mb-2.5 uppercase tracking-wider">
                Variabel tersedia — diganti otomatis saat kirim:
              </p>
              <div className="flex flex-wrap gap-2">
                {VARIABLES.map((v) => (
                  <span
                    key={v.var}
                    className="text-xs flex items-center gap-1.5"
                  >
                    <code className="bg-health-bg border border-health-sage/30 text-health-sage-bright px-1.5 py-0.5 rounded-md font-mono text-[11px]">
                      {v.var}
                    </code>
                    <span className="text-health-muted">{v.desc}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isReadOnly && (
          <div className="flex items-center gap-2 bg-white/5 border border-health-border rounded-lg px-4 py-2.5 text-sm text-health-muted">
            <Lock className="w-4 h-4" />
            Template default — hanya bisa dilihat, tidak bisa diedit. Buat template baru untuk kustomisasi.
          </div>
        )}

        <div>
          <label className="label">Nama Template</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="cth. Template Formal"
            disabled={isReadOnly}
          />
        </div>
        <div>
          <label className="label">Subject Email</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="input"
            placeholder="Lamaran Kerja - {{position}} di {{company}}"
            disabled={isReadOnly}
          />
        </div>
        <div>
          <label className="label">Isi Surat Lamaran</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={16}
            className="input resize-y leading-relaxed"
            disabled={isReadOnly}
          />
        </div>
        {!isReadOnly && (
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              <Save className="w-4 h-4" />
              {saving ? "Menyimpan..." : "Simpan Template"}
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus template"
        message={`Hapus template "${deleteTarget?.name}"? Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
