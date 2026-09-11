"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Save, Plus, Info, FileText, Trash2, MessageCircle } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { EmailTemplate } from "@/types";

interface WaTemplate {
  id: string;
  name: string;
  body: string;
  updatedAt: string;
  isDefault?: boolean;
}

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

  const [waMode, setWaMode] = useState<"email" | "wa">("email");
  const [waTemplates, setWaTemplates] = useState<WaTemplate[]>([]);
  const [activeWaTemplate, setActiveWaTemplate] = useState<WaTemplate | null>(null);
  const [waName, setWaName] = useState("");
  const [waBody, setWaBody] = useState("");
  const [waSaving, setWaSaving] = useState(false);
  const [waIsNew, setWaIsNew] = useState(false);
  const [waDeleteTarget, setWaDeleteTarget] = useState<WaTemplate | null>(null);

  const waIsDefault = activeWaTemplate?.isDefault && !waIsNew;

  const isDefaultTemplate = activeTemplate?.isDefault && !isNew;

  useEffect(() => {
    if (activeTemplate && !isNew) {
      setName(activeTemplate.name);
      setSubject(activeTemplate.subject);
      setBody(activeTemplate.body);
    }
  }, [activeTemplate, isNew]);

  useEffect(() => {
    fetch("/api/wa-templates")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.length > 0) {
          setWaTemplates(json.data);
          setActiveWaTemplate(json.data[0]);
          setWaName(json.data[0].name);
          setWaBody(json.data[0].body);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activeWaTemplate && !waIsNew) {
      setWaName(activeWaTemplate.name);
      setWaBody(activeWaTemplate.body);
    }
  }, [activeWaTemplate, waIsNew]);

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

  const handleWaSave = async () => {
    if (!waBody) {
      toast.error("Isi pesan WA wajib diisi");
      return;
    }
    setWaSaving(true);
    try {
      const res = await fetch("/api/wa-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: waIsNew ? undefined : activeWaTemplate?.id,
          name: waName || "Template WA",
          body: waBody,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Template WA berhasil disimpan!");
        setWaIsNew(false);
        const updated: WaTemplate = {
          id: json.data?.id ?? activeWaTemplate?.id ?? "",
          name: waName || "Template WA",
          body: waBody,
          updatedAt: new Date().toISOString(),
        };
        setActiveWaTemplate(updated);
        setWaTemplates((prev) => {
          const exists = prev.some((t) => t.id === updated.id);
          return exists ? prev.map((t) => (t.id === updated.id ? updated : t)) : [updated, ...prev];
        });
      } else toast.error(json.error ?? "Gagal menyimpan template WA");
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setWaSaving(false);
    }
  };

  const handleWaNew = () => {
    setWaIsNew(true);
    setWaName("Template WA Baru");
    setWaBody("");
    setActiveWaTemplate({ id: "", name: "Template WA Baru", body: "", updatedAt: "" });
  };

  const handleWaDelete = async (t: WaTemplate) => {
    try {
      const res = await fetch(`/api/wa-templates?id=${t.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Template WA berhasil dihapus");
        setWaTemplates((prev) => prev.filter((x) => x.id !== t.id));
        if (activeWaTemplate?.id === t.id) {
          setActiveWaTemplate(null);
          setWaName("");
          setWaBody("");
        }
      } else toast.error(json.error ?? "Gagal menghapus template WA");
    } catch {
      toast.error("Terjadi kesalahan");
    }
  };

  return (
    <div className="space-y-4">
      <div className="lg:col-span-4 flex gap-1 p-1 bg-health-surface border border-health-border rounded-lg w-fit text-xs">
        <button
          onClick={() => setWaMode("email")}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors duration-200 ${waMode === "email" ? "bg-health-sage/15 text-health-sage-bright" : "text-health-slate hover:text-health-text"}`}
        >
          Email
        </button>
        <button
          onClick={() => setWaMode("wa")}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors duration-200 ${waMode === "wa" ? "bg-health-sage/15 text-health-sage-bright" : "text-health-slate hover:text-health-text"}`}
        >
          WhatsApp
        </button>
      </div>

      {waMode === "email" && (
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
                {!t.isDefault && (
                  <p className="text-xs text-health-slate/60 truncate pl-5 mt-1">{t.subject}</p>
                )}
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

            {!isDefaultTemplate && (
              <div>
                <label className="label">Nama Template</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="cth. Template Formal"
                />
              </div>
            )}
            <div>
              <label className="label">Subject Email</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input"
                placeholder="Lamaran Kerja - {{position}} di {{company}}"
              />
            </div>
            <div>
              <label className="label">Isi Surat Lamaran</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={16}
                className="input resize-y leading-relaxed"
              />
            </div>
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
      )}

      {waMode === "wa" && (
        <div className="lg:col-span-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* WA sidebar */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="label mb-0">Template WA</span>
              <button onClick={handleWaNew} className="btn-secondary !px-2.5 !py-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" /> Baru
              </button>
            </div>
            {waTemplates.map((t) => (
              <div
                key={t.id}
                className={`group w-full text-left px-3.5 py-3 rounded-lg border text-sm transition-colors duration-200 cursor-pointer ${
                  activeWaTemplate?.id === t.id && !waIsNew
                    ? "bg-health-sage/10 border-health-sage/40 text-health-sage-bright"
                    : "bg-health-surface border-health-border text-health-muted hover:border-health-border-strong hover:text-health-text"
                }`}
                onClick={() => {
                  setWaIsNew(false);
                  setActiveWaTemplate(t);
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <p className="font-medium truncate">{t.name}</p>
                  </div>
                  {!t.isDefault && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setWaDeleteTarget(t); }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-health-slate/60 hover:text-health-error-bright transition-colors"
                      title="Hapus template WA"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* WA editor */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-health-sage/5 border border-health-sage/20 rounded-lg p-4">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-health-sage-bright mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-health-sage-bright mb-2.5 uppercase tracking-wider">
                    Variabel tersedia — diganti otomatis saat kirim:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {VARIABLES.filter((v) => v.var !== "{{hrEmail}}" && v.var !== "{{senderEmail}}").map((v) => (
                      <span key={v.var} className="text-xs flex items-center gap-1.5">
                        <code className="bg-health-bg border border-health-sage/30 text-health-sage-bright px-1.5 py-0.5 rounded-md font-mono text-[11px]">{v.var}</code>
                        <span className="text-health-muted">{v.desc}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {!waIsDefault && (
              <div>
                <label className="label">Nama Template</label>
                <input type="text" value={waName} onChange={(e) => setWaName(e.target.value)} className="input" placeholder="cth. Template WA Formal" />
              </div>
            )}
            <div>
              <label className="label">Isi Pesan WhatsApp</label>
              <textarea value={waBody} onChange={(e) => setWaBody(e.target.value)} rows={12} className="input resize-y leading-relaxed" />
            </div>
            <div className="flex justify-end">
              <button onClick={handleWaSave} disabled={waSaving} className="btn-primary">
                <Save className="w-4 h-4" />
                {waSaving ? "Menyimpan..." : "Simpan Template WA"}
              </button>
            </div>
          </div>

          <ConfirmDialog
            open={waDeleteTarget !== null}
            title="Hapus template WA"
            message={`Hapus template WA "${waDeleteTarget?.name}"? Tindakan ini tidak bisa dibatalkan.`}
            confirmLabel="Hapus"
            cancelLabel="Batal"
            onConfirm={() => { if (waDeleteTarget) handleWaDelete(waDeleteTarget); setWaDeleteTarget(null); }}
            onCancel={() => setWaDeleteTarget(null)}
          />
        </div>
      )}
    </div>
  );
}
