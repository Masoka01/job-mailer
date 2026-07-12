import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
    <html lang="id" className={`${inter.variable} dark`}>
      <body className="bg-[#0d1117] text-gray-100 antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "var(--font-inter)",
              fontSize: "0.875rem",
              borderRadius: "0.75rem",
              background: "#161b22",
              color: "#e6edf3",
              border: "1px solid #30363d",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
