"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FileText, Trash2, Upload, CheckCircle2 } from "lucide-react";

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
      } else toast.error(json.error ?? "Gagal upload CV");
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
      } else toast.error(json.error ?? "Gagal menghapus CV");
    } catch {
      toast.error("Gagal menghapus CV");
    }
  };

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="max-w-lg space-y-4">
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-health-sage-bright" />
          <h2 className="font-sans text-base font-semibold text-health-text">
            CV Saya
          </h2>
        </div>

        {loading ? (
          <div className="h-16 bg-health-bg rounded-lg animate-pulse border border-health-border" />
        ) : cvInfo ? (
          <div className="flex items-center justify-between p-4 bg-health-bg rounded-lg border border-health-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-health-sage/10 border border-health-sage/30 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-health-sage-bright" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-health-text truncate max-w-[180px]">
                    {cvInfo.name}
                  </p>
                  <CheckCircle2 className="w-3.5 h-3.5 text-health-success shrink-0" />
                </div>
                <p className="text-xs text-health-slate mt-0.5">
                  {formatSize(cvInfo.size)} ·{" "}
                  {new Date(cvInfo.uploadedAt).toLocaleDateString("id-ID")}
                </p>
              </div>
            </div>
            <button
              onClick={handleDelete}
              className="p-2 text-health-error-bright/60 hover:text-health-error-bright hover:bg-health-error/10 rounded-lg transition-colors"
              title="Hapus CV"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-8 bg-health-bg rounded-lg border border-dashed border-health-border-strong text-center">
            <Upload className="w-8 h-8 text-health-slate mx-auto mb-2" />
            <p className="text-sm text-health-slate">
              Belum ada CV yang diupload
            </p>
          </div>
        )}

        <div className="flex items-center gap-4">
          <label className="btn-secondary cursor-pointer">
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
          <p className="text-xs text-health-slate">PDF, maks. 500 KB</p>
        </div>
      </div>
    </div>
  );
}
