"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Save, Settings } from "lucide-react";

export default function SettingsPanel() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gmailAppPassword, setGmailAppPassword] = useState("");
  const [waNumber, setWaNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    fetch("/api/sender")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setName(json.data.name ?? "");
          setEmail(json.data.email ?? "");
          setWaNumber(json.data.waNumber ?? "");
        }
      })
      .catch(() => toast.error("Gagal memuat identitas pengirim"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/sender", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          gmailAppPassword: gmailAppPassword.replace(/\s/g, ""),
          waNumber,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Identitas pengirim berhasil disimpan");
        setGmailAppPassword("");
        setPasswordSaved(true);
      } else {
        toast.error(json.error ?? "Gagal menyimpan");
      }
    } catch {
      toast.error("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg space-y-4">
        <div className="card p-6 space-y-5">
          <div className="h-16 bg-health-bg rounded-lg animate-pulse border border-health-border" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-4">
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-health-sage-bright" />
          <h2 className="font-sans text-base font-semibold text-health-text">
            Identitas Pengirim
          </h2>
        </div>

        <div>
          <label className="label">Nama Pengirim</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="Nama lengkap"
          />
        </div>

        <div>
          <label className="label">Email Gmail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="email@gmail.com"
          />
        </div>

        <div>
          <label className="label">App Password Gmail</label>
          <input
            type="password"
            value={gmailAppPassword}
            onChange={(e) => {
              setGmailAppPassword(e.target.value);
              setPasswordSaved(false);
            }}
            className="input"
            placeholder="Kosongkan jika tidak diubah"
          />
          {passwordSaved ? (
            <p className="text-xs text-health-success-bright mt-1.5">
              App Password tersimpan
            </p>
          ) : (
            <p className="text-xs text-health-slate mt-1.5">
              App Password tidak ditampilkan setelah disimpan
            </p>
          )}
        </div>

        <div>
          <label className="label">Nomor WA Pengirim</label>
          <input
            type="text"
            value={waNumber}
            onChange={(e) => setWaNumber(e.target.value)}
            className="input"
            placeholder="cth. 081234567890"
          />
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save className="w-4 h-4" />
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
