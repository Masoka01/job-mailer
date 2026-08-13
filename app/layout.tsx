import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans, Fira_Code } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
});

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
    <html
      lang="id"
      className={`${plusJakarta.variable} ${dmSans.variable} ${firaCode.variable}`}
    >
      <body className="bg-health-bg text-health-text antialiased font-body">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontSize: "0.875rem",
              borderRadius: "0.5rem",
              background: "#0F172A",
              color: "#E2E8F0",
              border: "1px solid #1E293B",
              fontFamily:
                "var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
