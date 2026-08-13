"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-health-surface border border-health-border-strong rounded-xl p-6 w-full max-w-sm mx-4 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-health-error/10 rounded-lg flex items-center justify-center">
            <AlertTriangle className={`w-5 h-5 ${variant === "danger" ? "text-health-error-bright" : "text-health-sage-bright"}`} />
          </div>
          <h3 className="font-sans text-sm font-semibold text-health-text">{title}</h3>
        </div>
        <p className="text-sm text-health-muted mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-secondary text-xs px-4 py-2">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`btn-primary text-xs px-4 py-2 ${
              variant === "danger"
                ? "!bg-health-error hover:!bg-health-error-dark"
                : "!bg-health-sage hover:!bg-health-sage-dark"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
