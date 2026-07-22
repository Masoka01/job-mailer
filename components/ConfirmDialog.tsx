"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-[#1A1A2E] border border-[#FF006E]/30 rounded-xl p-6 w-full max-w-sm mx-4 shadow-[0_0_30px_rgba(255,0,110,0.15)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#FF006E]/10 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-[#FF006E]" />
          </div>
          <h3 className="text-sm font-semibold text-[#C0C0C0] font-mono">{title}</h3>
        </div>
        <p className="text-sm text-[#5D34D0] mb-6 font-mono">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-secondary text-xs px-4 py-2">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className="btn-primary text-xs px-4 py-2 bg-[#FF006E] hover:bg-[#FF006E]/80">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
