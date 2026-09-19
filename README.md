# Frontend UKK RPL 2026/2027 — Coworking Space Management System

Frontend React + Vite untuk sistem manajemen coworking space, dibangun sesuai
spesifikasi API, DTO, dan aturan role yang diberikan.

## Menjalankan Secara Lokal

Karena sandbox pembuatan proyek ini tidak memiliki akses internet untuk
`npm install`, jalankan langkah berikut di komputer Anda sendiri:

```bash
npm install
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`.

## Environment Variable

File `.env` sudah berisi:

```env
VITE_API_URL=https://learn.smktelkom-mlg.sch.id/coworking/
```

## Alur Pertama Kali

1. Buka `/setup-app-key` untuk membuat App Key (multi-tenancy) melalui
   `POST /api/maker/register`, atau tempelkan App Key yang sudah Anda miliki.
2. Daftar akun Member atau Admin Space di `/register`.
3. Login di `/login`.

## Struktur Project

Mengikuti struktur modular yang diminta: `src/api`, `src/components`,
`src/layouts`, `src/pages`, `src/context`, `src/routes`, `src/utils`.

## Catatan Penting — Bagian API yang Belum Sepenuhnya Diketahui

Sesuai aturan "jangan membuat asumsi", bagian berikut dibuat fleksibel dan
perlu disesuaikan begitu response asli backend dikonfirmasi:

- **Response `POST /api/auth/login`**: kode mengasumsikan `data.access_token`
  dan `data.user` (atau `data.profile`, atau `data` itu sendiri berisi
  profil+role). Sesuaikan di `src/context/AuthContext.jsx` fungsi `login()`.
- **Response `GET /api/spaces/availability`**: diasumsikan mengandung field
  `tersedia` (boolean). Sesuaikan di `src/pages/member/SpaceDetail.jsx`.
- **Response `POST /api/diskon/check`**: diasumsikan mengandung
  `potongan_diskon` atau `nominal_potongan`. Sesuaikan di
  `src/pages/member/SpaceDetail.jsx`.
- **Response `POST /api/upload/*`**: bentuk data belum diketahui; helper di
  `src/api/upload.js` mengirim `multipart/form-data` dan mengembalikan
  response mentah untuk diproses sesuai kebutuhan.
- **Endpoint update profile Member**: belum ada di spesifikasi API, sehingga
  `src/pages/member/Profile.jsx` menampilkan form namun belum terhubung ke
  endpoint submit sungguhan (ditandai dengan komentar `TODO`).
- **Response `GET /api/admin/reports/monthly` & `/income`**: struktur data
  belum pasti; kode di `src/pages/admin/Reports.jsx` mencoba beberapa nama
  field umum (`pendapatan_estimasi`/`estimasi`, dst.) dan dapat disesuaikan.
- **Endpoint list untuk `GET /api/admin/members`, `GET /api/admin/diskon`
  beserta versi `by id`-nya**: tidak eksplisit disebutkan di spesifikasi asli
  selain endpoint create/update/delete, sehingga ditambahkan mengikuti pola
  REST yang konsisten dengan endpoint lain — sesuaikan path-nya jika berbeda
  di backend asli.

Semua nama field DTO/entity lainnya mengikuti spesifikasi persis seperti yang
diberikan, tanpa perubahan nama.
