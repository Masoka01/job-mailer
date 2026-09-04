"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { ScanLine, Loader2 } from "lucide-react";

interface JobFormProps {
  onSuccess: () => void;
}

export default function JobForm({ onSuccess }: JobFormProps) {
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [hrEmail, setHrEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Format tidak didukung. Gunakan JPG, PNG, atau WebP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setScanLoading(true);
    setScanSuccess(false);

    // preview
    const previewUrl = URL.createObjectURL(file);
    setScanPreview(previewUrl);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // strip data:... prefix
          const commaIdx = result.indexOf(",");
          resolve(commaIdx !== -1 ? result.slice(commaIdx + 1) : result);
        };
        reader.onerror = () => reject(new Error("Gagal membaca file"));
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/extract-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });
      const json = await res.json();

      if (json.success && json.data) {
        setCompany(json.data.company || "");
        setPosition(json.data.position || "");
        setHrEmail(json.data.email || "");
        setWhatsapp(json.data.whatsapp || "");
        setScanSuccess(true);
        toast.success("Data berhasil diekstrak");
      } else {
        toast.error(json.error ?? "Gagal mengekstrak data");
        setScanPreview(null);
      }
    } catch {
      toast.error("Gagal mengekstrak data dari screenshot");
      setScanPreview(null);
    } finally {
      setScanLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !position) {
      toast.error("Mohon isi nama perusahaan dan posisi");
      return;
    }
    if (!hrEmail && !whatsapp) {
      toast.error("Isi email HRD atau nomor WhatsApp minimal satu");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("company", company);
      formData.append("position", position);
      formData.append("hrEmail", hrEmail);
      formData.append("whatsapp", whatsapp);

      const res = await fetch("/api/jobs", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        onSuccess();
        setCompany("");
        setPosition("");
        setHrEmail("");
        setWhatsapp("");
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
      {/* Screenshot Scan upload zone */}
      <div
        onClick={() => !scanLoading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-4 text-center cursor-pointer transition-colors min-h-[100px] ${
          dragOver
            ? "bg-health-surface border-health-sage bg-health-sage/5"
            : "bg-health-surface border-health-border-strong hover:border-health-sage hover:bg-health-sage/5"
        } ${scanLoading ? "pointer-events-none opacity-80" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {scanLoading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-health-sage" />
            <p className="text-sm font-medium text-health-sage">Mengekstrak data...</p>
          </>
        ) : scanSuccess && scanPreview ? (
          <>
            <div className="flex items-center gap-3">
              <img
                src={scanPreview}
                alt="preview"
                className="h-12 w-12 rounded object-cover border border-health-border-strong"
              />
              <p className="text-sm font-medium text-green-600">Berhasil diekstrak!</p>
            </div>
            <p className="text-xs text-health-text-muted">Klik atau seret gambar lain untuk mengganti</p>
          </>
        ) : (
          <>
            <ScanLine className="h-6 w-6 text-health-sage" />
            <p className="text-sm font-medium text-health-text-muted">Upload screenshot lowongan</p>
            <p className="text-xs text-health-text-muted">Klik atau seret gambar ke sini (JPG, PNG, WebP, maks 5MB)</p>
            {scanPreview && !scanSuccess && (
              <img
                src={scanPreview}
                alt="preview"
                className="mt-1 h-12 w-12 rounded object-cover border border-health-border-strong"
              />
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">
            Nama Perusahaan <span className="text-health-error-bright">*</span>
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
            Posisi yang Dilamar <span className="text-health-error-bright">*</span>
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
          Email HRD <span className="text-health-text-muted">(opsional jika ada WA)</span>
        </label>
        <input
          type="email"
          value={hrEmail}
          onChange={(e) => setHrEmail(e.target.value)}
          placeholder="hrd@perusahaan.com"
          className="input"
        />
      </div>

      <div>
        <label className="label">Nomor WhatsApp (opsional)</label>
        <input
          type="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="cth. 089688290484"
          className="input"
        />
      </div>

      <div className="flex justify-end pt-1">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Menyimpan..." : "Simpan Loker"}
        </button>
      </div>
    </form>
  );
}
