# Seapedia

Selamat datang di repositori **Seapedia**! Seapedia adalah platform digital/marketplace yang memfasilitasi pencarian dan transaksi produk hasil laut langsung dari nelayan atau penjual lokal.

Proyek ini dibangun dengan arsitektur monorepo sederhana yang terbagi menjadi dua bagian utama: **FrontEnd** dan **BackEnd**.

---

## 📁 Struktur Proyek

Repositori ini terbagi menjadi folder-folder berikut:

1.  **[FrontEnd](./FrontEnd)**: Aplikasi antarmuka pengguna (web client) yang dibangun menggunakan React, TypeScript, dan bundler Vite.
    *   *Dokumentasi lengkap:* Silakan baca [FrontEnd README](./FrontEnd/README.md).
2.  **[BackEnd](./BackEnd)**: Layanan API server berbasis Express.js yang bertugas menangani autentikasi JWT, manajemen peran (roles), dan data ulasan.
    *   *Mekanisme Cerdas:* Dilengkapi fitur *Automatic Database Fallback* ke local JSON file jika MongoDB tidak terdeteksi, sehingga dapat langsung dijalankan tanpa setup database yang rumit.
    *   *Dokumentasi lengkap:* Silakan baca [BackEnd README](./BackEnd/README.md).

---

## 🚀 Panduan Memulai Cepat (Quick Start)

Ikuti langkah di bawah ini untuk menjalankan aplikasi secara lokal di komputer Anda. Pastikan Anda telah menginstal [Node.js](https://nodejs.org/) dan package manager [pnpm](https://pnpm.io/) (atau `npm`).

### 1. Menjalankan BackEnd API

Buka terminal baru di root folder proyek:

```bash
cd BackEnd
pnpm install
pnpm dev
```

*   Server BackEnd secara default akan berjalan di **http://localhost:5000**.
*   Database lokal `local_db.json` akan otomatis dibuat jika koneksi ke MongoDB gagal/tidak diaktifkan.

### 2. Menjalankan FrontEnd Client

Buka terminal baru lainnya di root folder proyek:

```bash
cd FrontEnd
pnpm install
pnpm dev
```

*   Aplikasi FrontEnd akan berjalan di **http://localhost:5173**.
*   Buka peramban (browser) Anda dan akses alamat tersebut untuk berinteraksi dengan Seapedia.

---

## 🛠️ Ringkasan Teknologi

| Layer | Komponen / Library Utama |
|---|---|
| **FrontEnd** | React.js, TypeScript, Vite, React Router DOM, Vanilla CSS / Tailwind |
| **BackEnd** | Express.js, Mongoose & MongoDB, JSON Web Token (JWT), bcryptjs, local-json-db fallback |

---
