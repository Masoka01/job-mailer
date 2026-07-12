"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FileText, Trash2, Upload } from "lucide-react";

interface CvInfo {
  name: string;
  size: number;
  uploadedAt: string;
}

export default function CVUploader() {
  const [cvInfo, setCvInfo] = useState<CvInfo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cv")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setCvInfo(j.data);
      })
      .catch(() => toast.error("Gagal memuat info CV"))
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("cv", file);
    try {
      const res = await fetch("/api/cv", { method: "POST", body: fd });
      const json = await res.json();
      if (json.success) {
        toast.success("CV berhasil diupload!");
        setCvInfo(json.data);
      } else {
        toast.error(json.error ?? "Gagal upload CV");
      }
    } catch {
      toast.error("Gagal upload CV");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch("/api/cv", { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setCvInfo(null);
        toast.success("CV berhasil dihapus");
      } else {
        toast.error(json.error ?? "Gagal menghapus CV");
      }
    } catch {
      toast.error("Gagal menghapus CV");
    }
  };

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="card p-6 space-y-5 max-w-lg">
      <h2 className="text-base font-semibold text-gray-100">CV Saya</h2>

      {loading ? (
        <p className="text-sm text-gray-500">Memuat...</p>
      ) : cvInfo ? (
        <div className="flex items-center justify-between p-4 bg-surface-900 rounded-xl border border-surface-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-500/20 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-brand-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-100">{cvInfo.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatSize(cvInfo.size)} · Diupload{" "}
                {new Date(cvInfo.uploadedAt).toLocaleDateString("id-ID")}
              </p>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
            title="Hapus CV"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="p-4 bg-surface-900 rounded-xl border border-dashed border-surface-800 text-center">
          <Upload className="w-6 h-6 text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Belum ada CV yang diupload.</p>
        </div>
      )}

      <div>
        <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
          <Upload className="w-4 h-4" />
          {uploading ? "Mengupload..." : cvInfo ? "Ganti CV" : "Upload CV"}
          <input
            type="file"
            accept="application/pdf"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
        <p className="text-xs text-gray-600 mt-2">
          PDF, maksimal 2 MB (disarankan di bawah 500 KB)
        </p>
      </div>
    </div>
  );
}
