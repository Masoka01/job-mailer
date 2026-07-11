# JobMailer 📧

Aplikasi web untuk mengelola dan mengirim surat lamaran kerja secara otomatis ke banyak perusahaan.

## Fitur

- ✅ Tambah & kelola daftar loker (perusahaan, posisi, email HRD)
- ✅ Upload PDF info loker / dokumen per lamaran
- ✅ Upload CV global yang otomatis dilampirkan ke semua email
- ✅ Template surat lamaran yang bisa diedit & disimpan
- ✅ Variabel dinamis (`{{company}}`, `{{position}}`, dll.)
- ✅ Kirim per loker atau blast semua sekaligus
- ✅ Track status: Belum Kirim / Terkirim / Gagal
- ✅ Data tersimpan di Firebase Firestore

## Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore (Admin SDK)
- **Email**: Nodemailer + Gmail SMTP

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Konfigurasi environment variables

Salin `.env.example` ke `.env.local`:

```bash
cp .env.example .env.local
```

Isi nilai berikut:

| Variable | Cara mendapatkan |
|---|---|
| `GMAIL_USER` | Email Gmail kamu |
| `GMAIL_APP_PASSWORD` | [Buat App Password](https://myaccount.google.com/apppasswords) (aktifkan 2FA dulu) |
| `FIREBASE_PROJECT_ID` | Firebase Console → Project Settings |
| `FIREBASE_CLIENT_EMAIL` | Firebase Console → Project Settings → Service Accounts → Generate key |
| `FIREBASE_PRIVATE_KEY` | Dari file JSON Service Account (salin nilai `private_key`) |

### 3. Setup Firebase

1. Buka [Firebase Console](https://console.firebase.google.com)
2. Buat project baru atau gunakan yang ada
3. Aktifkan **Firestore Database** (mode Production)
4. Buka **Project Settings → Service Accounts**
5. Klik "Generate new private key" → download JSON
6. Salin nilai `project_id`, `client_email`, dan `private_key` ke `.env.local`

**Firestore Security Rules** (untuk production):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false; // Hanya akses dari server
    }
  }
}
```

### 4. Jalankan development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## Deploy ke Vercel

1. Push project ke GitHub
2. Import di [vercel.com](https://vercel.com)
3. Tambahkan semua environment variables di Vercel Dashboard
4. Deploy!

> **Catatan**: `FIREBASE_PRIVATE_KEY` di Vercel harus di-escape newline-nya. Vercel otomatis menangani ini jika kamu paste value langsung.

---

## Struktur Koleksi Firestore

### `jobs`
```json
{
  "company": "PT Contoh",
  "position": "Frontend Developer",
  "hrEmail": "hrd@contoh.com",
  "status": "pending | sent | failed",
  "notes": "Catatan opsional",
  "pdfBase64": "...",
  "pdfName": "lamaran.pdf",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "sentAt": "2024-01-01T01:00:00.000Z"
}
```

### `templates`
```json
{
  "name": "Template Default",
  "subject": "Lamaran Kerja - {{position}} di {{company}}",
  "body": "Yth. HRD {{company}}...",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### `settings/cv`
```json
{
  "name": "CV_Nama.pdf",
  "size": 204800,
  "base64": "...",
  "uploadedAt": "2024-01-01T00:00:00.000Z"
}
```

> **Catatan**: CV disimpan sebagai base64 di Firestore. Pastikan ukuran file PDF di bawah **500 KB** sebelum diupload (gunakan tools seperti ilovepdf.com untuk mengompres).

---

## Variabel Template

| Variabel | Nilai |
|---|---|
| `{{company}}` | Nama perusahaan |
| `{{position}}` | Posisi yang dilamar |
| `{{hrEmail}}` | Email HRD tujuan |
| `{{senderName}}` | Nama pengirim (dari Gmail username) |
| `{{senderEmail}}` | Email pengirim |

---

## Lampiran Email

Setiap email lamaran yang dikirim akan menyertakan:

1. **CV Global** — diupload sekali di tab "CV Saya", otomatis dilampirkan ke semua email
2. **PDF per Loker** *(opsional)* — dokumen spesifik per lamaran (portofolio, surat lamaran khusus, dll.)