import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobMailer — Kirim Lamaran Kerja Otomatis",
  description:
    "Kelola dan kirim surat lamaran kerja ke banyak perusahaan sekaligus",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-[#0D0D1A] text-[#C0C0C0] antialiased font-mono">
        <div id="crt-overlay" />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontSize: "0.875rem",
              borderRadius: "0.5rem",
              background: "#1A1A2E",
              color: "#C0C0C0",
              border: "1px solid rgba(0,128,255,0.3)",
              boxShadow: "0 0 15px rgba(0,128,255,0.15)",
              fontFamily: "ui-monospace, SFMono-Regular, monospace",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
