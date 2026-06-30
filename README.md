# SEAPEDIA

SEAPEDIA adalah platform e-commerce multi-peran yang menghubungkan Penjual, Pembeli, dan Pengemudi dalam satu ekosistem digital yang transparan. Proyek ini dikembangkan sebagai bagian dari Technical Challenge COMPFEST 18 Academy — Software Engineering Track.

Implementasi saat ini mencakup **Level 1** dan **Level 2** dari total 7 level yang didefinisikan pada spesifikasi tantangan.

---

## Tingkat Implementasi

| Level | Fitur | Status |
|-------|-------|--------|
| 1 | Public Marketplace, Autentikasi, Ulasan Aplikasi | Selesai |
| 2 | Pengalaman Penjual, Manajemen Produk, Katalog Publik | Selesai |
| 3 | Wallet Pembeli, Keranjang, dan Checkout | Belum diimplementasikan |
| 4 | Diskon dan Pemrosesan Pesanan Penjual | Belum diimplementasikan |
| 5 | Pengiriman dan Alur Kerja Pengemudi | Belum diimplementasikan |
| 6 | Monitoring Admin dan Penanganan Keterlambatan | Belum diimplementasikan |
| 7 | Penguatan Keamanan dan Finalisasi | Belum diimplementasikan |

---

## Struktur Repositori

```
Seapedia/
├── BackEnd/        Backend API berbasis Express.js
├── FrontEnd/       Frontend berbasis React + TypeScript + Vite
└── README.md       Dokumentasi ini
```

---

## Persyaratan Sistem

- Node.js versi 18 atau lebih baru
- pnpm (disarankan) atau npm
- MongoDB (opsional — sistem secara otomatis beralih ke JSON fallback jika tidak tersedia)

---

## Cara Menjalankan Aplikasi

### 1. Backend

```bash
cd BackEnd
pnpm install
pnpm dev
```

Server akan berjalan pada `http://localhost:5000`.

### 2. Frontend

```bash
cd FrontEnd
pnpm install
pnpm dev
```

Aplikasi akan berjalan pada `http://localhost:5173`.

### 3. Urutan Menjalankan

Backend harus dijalankan terlebih dahulu sebelum frontend. Jika MongoDB tidak tersedia, backend akan secara otomatis beralih ke mode penyimpanan JSON lokal (`local_db.json`) tanpa konfigurasi tambahan.

---

## Aturan Bisnis Utama

### Sistem Multi-Peran

SEAPEDIA mendukung empat peran akun: **Admin**, **Penjual**, **Pembeli**, dan **Pengemudi**. Untuk akun non-admin, satu nama pengguna dapat memiliki lebih dari satu peran secara bersamaan. Setelah masuk, pengguna yang memiliki lebih dari satu peran diwajibkan memilih peran aktif untuk sesi tersebut. Otorisasi sistem didasarkan pada peran aktif, bukan seluruh daftar peran yang dimiliki.

### Single-Store Checkout

Karena SEAPEDIA merupakan platform multi-penjual, satu sesi keranjang hanya dapat memuat produk dari **satu toko**. Jika pembeli mencoba menambahkan produk dari toko yang berbeda, sistem akan memberikan notifikasi dan meminta konfirmasi untuk mengosongkan keranjang terlebih dahulu. Aturan ini diimplementasikan di sisi backend dan ditampilkan secara eksplisit di antarmuka pengguna.

*Catatan: Fitur checkout belum diimplementasikan pada level ini. Aturan single-store checkout akan diterapkan secara penuh pada Level 3.*

### Keunikan Nama Toko

Setiap penjual diwajibkan memiliki nama toko yang unik di seluruh platform. Validasi dilakukan di sisi backend melalui constraint database dan validasi pada lapisan route.

---

## Akun Demo

Buat akun baru melalui halaman `/register`. Setiap akun baru secara otomatis mendapatkan peran **Pembeli**.

Untuk mendapatkan peran **Penjual**: buka halaman Akun Saya dan klik "Daftar Sebagai Penjual", kemudian masukkan nama toko.

Untuk mendapatkan peran **Pengemudi**: buka halaman Akun Saya dan klik "Daftar Sebagai Pengemudi", kemudian lengkapi formulir pendaftaran.

Akun **Admin** harus dibuat secara manual melalui skrip seed atau langsung pada database. Lihat dokumentasi Backend untuk detail lebih lanjut.

---

## Dokumentasi Tambahan

- [Dokumentasi Backend](./BackEnd/README.md) — Panduan instalasi, daftar endpoint API, dan aturan bisnis backend.
- [Dokumentasi Frontend](./FrontEnd/README.md) — Panduan instalasi, struktur komponen, dan catatan keamanan.
