"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X } from "lucide-react";
import toast from "react-hot-toast";

interface JobFormProps {
  onSuccess: () => void;
}

export default function JobForm({ onSuccess }: JobFormProps) {
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [hrEmail, setHrEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5 MB");
        return;
      }
      setPdfFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !position || !hrEmail) {
      toast.error("Mohon isi semua field yang wajib");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("company", company);
      formData.append("position", position);
      formData.append("hrEmail", hrEmail);
      formData.append("notes", notes);
      if (pdfFile) formData.append("pdf", pdfFile);

      const res = await fetch("/api/jobs", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        onSuccess();
        // Reset
        setCompany("");
        setPosition("");
        setHrEmail("");
        setNotes("");
        setPdfFile(null);
      } else {
        toast.error(json.error ?? "Gagal menambahkan loker");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">
            Nama Perusahaan <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="cth. PT Maju Jaya"
            className="input"
            required
          />
        </div>
        <div>
          <label className="label">
            Posisi yang Dilamar <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="cth. Frontend Developer"
            className="input"
            required
          />
        </div>
      </div>

      <div>
        <label className="label">
          Email HRD <span className="text-red-400">*</span>
        </label>
        <input
          type="email"
          value={hrEmail}
          onChange={(e) => setHrEmail(e.target.value)}
          placeholder="hrd@perusahaan.com"
          className="input"
          required
        />
      </div>

      <div>
        <label className="label">Catatan (opsional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Catatan tambahan, sumber informasi loker, dll."
          rows={2}
          className="input resize-none"
        />
      </div>

      {/* PDF Upload */}
      <div>
        <label className="label">Upload Info Loker / CV (PDF, maks 5 MB)</label>
        {pdfFile ? (
          <div className="flex items-center gap-3 px-4 py-3 bg-brand-50 border border-brand-100 rounded-xl">
            <FileText className="w-5 h-5 text-brand-500 flex-shrink-0" />
            <span className="text-sm text-brand-700 truncate flex-1">
              {pdfFile.name}
            </span>
            <button
              type="button"
              onClick={() => setPdfFile(null)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl px-4 py-6 text-center cursor-pointer transition-colors duration-150 ${
              isDragActive
                ? "border-brand-500 bg-brand-50"
                : "border-surface-200 hover:border-brand-300 hover:bg-surface-50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {isDragActive
                ? "Lepaskan file di sini..."
                : "Drag & drop PDF, atau klik untuk pilih file"}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-1">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Menyimpan..." : "Simpan Loker"}
        </button>
      </div>
    </form>
  );
}
