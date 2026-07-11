"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

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
    <div className="card p-6 space-y-4 max-w-lg">
      <h2 className="text-base font-semibold text-gray-900">CV Saya</h2>

      {loading ? (
        <p className="text-sm text-gray-400">Memuat...</p>
      ) : cvInfo ? (
        <div className="flex items-center justify-between p-3 bg-surface-50 rounded-lg border border-surface-200">
          <div>
            <p className="text-sm font-medium text-gray-800">{cvInfo.name}</p>
            <p className="text-xs text-gray-400">
              {formatSize(cvInfo.size)} · Diupload{" "}
              {new Date(cvInfo.uploadedAt).toLocaleDateString("id-ID")}
            </p>
          </div>
          <button
            onClick={handleDelete}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Hapus
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Belum ada CV yang diupload.</p>
      )}

      <div>
        <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
          {uploading ? "Mengupload..." : cvInfo ? "Ganti CV" : "Upload CV"}
          <input
            type="file"
            accept="application/pdf"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
        <p className="text-xs text-gray-400 mt-1.5">PDF, maksimal 2 MB</p>
      </div>
    </div>
  );
}
