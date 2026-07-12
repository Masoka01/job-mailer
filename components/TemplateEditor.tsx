"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Save, Plus, Info, FileText } from "lucide-react";
import type { EmailTemplate } from "@/types";

interface TemplateEditorProps {
  templates: EmailTemplate[];
  activeTemplate: EmailTemplate | null;
  onSelect: (t: EmailTemplate) => void;
  onSaved: (t: EmailTemplate) => void;
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
}: TemplateEditorProps) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);

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
          <button
            key={t.id}
            onClick={() => {
              setIsNew(false);
              onSelect(t);
            }}
            className={`w-full text-left px-3.5 py-3 rounded-xl border text-sm transition-all ${
              activeTemplate?.id === t.id && !isNew
                ? "bg-brand-500/10 border-brand-500/30 text-brand-400"
                : "bg-[#161b22] border-[#30363d] text-gray-400 hover:border-[#484f58] hover:text-gray-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <FileText className="w-3.5 h-3.5 flex-shrink-0" />
              <p className="font-medium truncate">{t.name}</p>
            </div>
            <p className="text-xs text-gray-600 truncate pl-5">{t.subject}</p>
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="lg:col-span-3 space-y-4">
        {/* Variable hint */}
        <div className="bg-brand-500/5 border border-brand-500/15 rounded-xl p-4">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-brand-400 mb-2.5">
                Variabel tersedia — diganti otomatis saat kirim:
              </p>
              <div className="flex flex-wrap gap-2">
                {VARIABLES.map((v) => (
                  <span
                    key={v.var}
                    className="text-xs flex items-center gap-1.5"
                  >
                    <code className="bg-[#0d1117] border border-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded-md font-mono text-[11px]">
                      {v.var}
                    </code>
                    <span className="text-gray-600">{v.desc}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

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
            className="input font-mono text-sm resize-y leading-relaxed"
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
    </div>
  );
}
