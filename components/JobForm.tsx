"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface JobFormProps {
  onSuccess: () => void;
}

export default function JobForm({ onSuccess }: JobFormProps) {
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [hrEmail, setHrEmail] = useState("");
  const [loading, setLoading] = useState(false);

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
            Nama Perusahaan <span className="text-[#FF006E]">*</span>
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
            Posisi yang Dilamar <span className="text-[#FF006E]">*</span>
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
          Email HRD <span className="text-[#FF006E]">*</span>
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

      <div className="flex justify-end pt-1">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Menyimpan..." : "Simpan Loker"}
        </button>
      </div>
    </form>
  );
}
