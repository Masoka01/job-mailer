import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "JobMailer — Kirim Lamaran Kerja Otomatis",
  description: "Kelola dan kirim surat lamaran kerja ke banyak perusahaan sekaligus",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="bg-surface-50 text-gray-800 antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "var(--font-inter)",
              fontSize: "0.875rem",
              borderRadius: "0.75rem",
              boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
