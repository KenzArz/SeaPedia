# SEAPEDIA — Frontend

Dokumentasi teknis untuk komponen frontend aplikasi SEAPEDIA. Frontend dibangun menggunakan **React 19** dengan **TypeScript** dan **Vite** sebagai build tool, serta menggunakan CSS custom properties untuk sistem desain yang konsisten.

---

## Teknologi yang Digunakan

| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| React | ^19.2.7 | Library antarmuka pengguna |
| TypeScript | ~6.0.2 | Superset JavaScript dengan type safety |
| Vite | ^8.1.0 | Build tool dan development server |
| React Router DOM | ^7.18.0 | Routing sisi klien |
| Axios | ^1.18.1 | HTTP client untuk komunikasi API |
| Lucide React | ^0.469.0 | Library ikon |

---

## Persyaratan

- Node.js versi 18 atau lebih baru
- pnpm (disarankan) atau npm
- Backend SEAPEDIA berjalan pada `http://localhost:5000`

---

## Instalasi dan Menjalankan

### 1. Masuk ke direktori Frontend

```bash
cd FrontEnd
```

### 2. Instalasi dependensi

```bash
pnpm install
```

### 3. Menjalankan development server

```bash
pnpm dev
```

Aplikasi akan berjalan pada `http://localhost:5173`.

### 4. Build untuk production

```bash
pnpm build
```

Output akan tersimpan di direktori `dist/`.

### 5. Preview build production

```bash
pnpm preview
```

---

## Struktur Direktori

```
src/
├── components/
│   ├── landing/              Komponen section halaman landing
│   │   ├── HeroSection.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── FeaturedProducts.tsx
│   │   └── FooterCTA.tsx
│   ├── seller/
│   │   ├── ProductManager.tsx   Manajemen CRUD produk Penjual
│   │   └── StoreManager.tsx     Manajemen profil toko Penjual
│   ├── AccountOverview.tsx   Dasbor terpadu pengguna
│   ├── AvatarFallback.tsx    Komponen avatar dengan inisial atau foto
│   ├── BecomeDriverModal.tsx Modal pendaftaran peran Pengemudi
│   ├── BecomeSellerModal.tsx Modal pendaftaran peran Penjual
│   ├── Button.tsx            Komponen tombol reusable
│   ├── ComingSoonSlot.tsx    Placeholder visual untuk fitur mendatang
│   ├── Navbar.tsx            Navigasi global
│   ├── RoleModal.tsx         Modal pemilihan peran aktif
│   └── Toast.tsx             Komponen notifikasi toast
├── context/
│   └── AuthContext.tsx       State manajemen autentikasi global
├── layouts/
│   ├── BuyerLayout.tsx       Layout dasbor Pembeli
│   ├── SellerLayout.tsx      Layout dasbor Penjual
│   └── DriverLayout.tsx      Layout dasbor Pengemudi
├── pages/
│   ├── AccountPage.tsx       Halaman hub peran (/account)
│   ├── BuyerDashboard.tsx    Dasbor khusus Pembeli
│   ├── DriverDashboard.tsx   Dasbor khusus Pengemudi
│   ├── Login.tsx             Halaman masuk
│   ├── PersonalProfile.tsx   Halaman profil personal Pembeli
│   ├── ProductDetail.tsx     Halaman detail produk publik
│   ├── ProductList.tsx       Halaman katalog produk publik
│   ├── Register.tsx          Halaman pendaftaran akun
│   ├── ReviewPage.tsx        Halaman ulasan platform
│   └── SellerDashboard.tsx   Dasbor khusus Penjual
├── services/
│   ├── api.ts                Instansi Axios dan interceptor token
│   ├── productService.ts     Layanan API produk
│   ├── storeService.ts       Layanan API toko
│   └── userService.ts        Layanan API profil pengguna
├── styles/                   File CSS per halaman dan komponen
└── utils/
    ├── dateHelper.ts         Utilitas format tanggal
    └── imageHelper.ts        Utilitas gambar produk dengan fallback
```

---

## Routing

| Path | Halaman | Akses |
|------|---------|-------|
| `/` | Halaman Landing | Publik |
| `/products` | Katalog Produk | Publik |
| `/products/:id` | Detail Produk | Publik |
| `/reviews` | Ulasan Platform | Publik |
| `/login` | Masuk | Publik |
| `/register` | Daftar Akun | Publik |
| `/account` | Hub Peran | Harus masuk |
| `/dashboard/buyer` | Dasbor Pembeli | Peran Buyer |
| `/dashboard/buyer/profile` | Profil Personal | Peran Buyer |
| `/dashboard/seller` | Dasbor Penjual | Peran Seller |
| `/dashboard/seller/store` | Manajemen Toko | Peran Seller |
| `/dashboard/seller/products` | Manajemen Produk | Peran Seller |
| `/dashboard/driver` | Dasbor Pengemudi | Peran Driver |

---

## Sistem Multi-Peran

SEAPEDIA mendukung empat peran akun: **Admin**, **Penjual** (Seller), **Pembeli** (Buyer), dan **Pengemudi** (Driver). Untuk akun non-admin, satu pengguna dapat memiliki lebih dari satu peran secara bersamaan.

Alur pemilihan peran setelah masuk:

```
Masuk
  -> Jika 1 peran    -> Langsung ke dasbor sesuai peran
  -> Jika > 1 peran  -> Halaman /account -> Pilih peran aktif -> Dasbor
```

Otorisasi dilakukan berdasarkan `activeRole`, bukan seluruh daftar peran yang dimiliki. Proteksi rute dilakukan di sisi frontend melalui `AuthGuard` dan `RoleGuard`, serta dikonfirmasi ulang di sisi backend melalui middleware.

---

## Arsitektur Autentikasi

Token JWT disimpan di `localStorage` dengan kunci `seapedia_token`. Pada saat aplikasi dimuat ulang (*reload*), payload JWT di-decode secara sinkron untuk mengisi state pengguna secara instan tanpa harus menunggu respons jaringan. Hal ini mencegah *redirect* yang tidak perlu ke halaman login saat halaman di-refresh.

Setelah render awal, profil lengkap diambil dari endpoint `/api/auth/profile` secara diam-diam di latar belakang untuk memperbarui field tambahan seperti `createdAt` dan data profil personal.

---

## Aturan Single-Store Checkout

Karena SEAPEDIA adalah platform multi-penjual, satu sesi keranjang hanya dapat memuat produk dari **satu toko**. Aturan ini akan diimplementasikan secara penuh pada Level 3. Pada Level 2, validasi ini diterapkan sebagai berikut:

- Backend memvalidasi kepemilikan toko saat produk dibuat
- Frontend menampilkan informasi toko pada setiap halaman produk
- Antarmuka pengguna tidak mengizinkan aksi checkout sampai Level 3 diimplementasikan

---

## Kalkulasi Checkout (Level 3 — Belum Diimplementasikan)

Rumus yang akan diterapkan pada Level 3:

```
Subtotal  = jumlah x harga per item
Diskon    = dari Voucher atau Promo (jika ada)
Ongkir    = berdasarkan metode pengiriman yang dipilih
PPN       = 12% dari (Subtotal - Diskon)
Total     = Subtotal - Diskon + Ongkir + PPN
```

Posisi diskon dihitung sebelum PPN. Ketentuan ini bersifat konsisten di seluruh sistem dan akan didokumentasikan secara lengkap pada implementasi Level 3.

---

## Catatan Keamanan

| Aspek | Implementasi |
|-------|-------------|
| Penyimpanan token | localStorage dengan kunci `seapedia_token` |
| Masa berlaku token | 7 hari |
| Proteksi rute frontend | AuthGuard + RoleGuard di App.tsx |
| Proteksi rute backend | Middleware `authMiddleware` + `requireRole` |
| XSS | React secara default melakukan escaping terhadap semua string yang dirender |
| Validasi input | Dilakukan di sisi frontend (sebelum submit) dan backend (sebelum disimpan ke database) |
| Foto profil/toko | Diterima dalam format URL HTTPS atau data URI base64, maksimum 5 MB |

---

## Fitur yang Tersedia (Level 1 dan Level 2)

### Level 1 — Public Marketplace, Autentikasi, dan Ulasan

- Halaman landing dengan penjelasan platform dan navigasi publik
- Katalog produk publik yang dapat diakses tanpa masuk
- Halaman detail produk (mode baca saja untuk tamu)
- Pendaftaran dan masuk akun dengan penyimpanan kata sandi menggunakan hash bcrypt
- Sistem multi-peran: satu akun dapat memiliki peran Pembeli, Penjual, dan Pengemudi
- Pemilihan peran aktif setelah masuk melalui halaman `/account`
- Profil personal Pembeli dengan dukungan unggah foto, nama lengkap, tanggal lahir, gender, dan nomor telepon
- Ulasan platform yang dapat dikirim oleh tamu maupun pengguna terdaftar tanpa memerlukan riwayat transaksi
- Komponen reusable: Button, Input, Card, Navbar, AvatarFallback, Toast, ComingSoonSlot
- Struktur routing yang mendukung halaman publik dan halaman dasbor privat

### Level 2 — Pengalaman Penjual

- Manajemen toko Penjual: buat toko, edit nama, deskripsi, jenis usaha, dan foto toko
- Manajemen produk Penjual: tambah, ubah, dan hapus produk dengan validasi kepemilikan
- Setiap produk memiliki nama, deskripsi, harga, stok, dan gambar
- Penjual hanya dapat mengelola produk miliknya sendiri
- Stok produk disimpan untuk persiapan fitur checkout pada Level 3
- Katalog produk publik menggunakan data dari backend (bukan data dummy)
- Informasi toko ditampilkan pada halaman daftar produk dan detail produk
- Dasbor Penjual menampilkan ringkasan toko dan pratinjau 5 produk terakhir

---

## Fitur Mendatang

Fitur berikut belum diimplementasikan dan ditampilkan sebagai placeholder visual di antarmuka pengguna:

| Fitur | Level |
|-------|-------|
| Wallet Pembeli dan top-up | Level 3 |
| Keranjang belanja | Level 3 |
| Checkout dan pembuatan pesanan | Level 3 |
| Riwayat pesanan Pembeli | Level 3 |
| Daftar pesanan masuk Penjual | Level 3 |
| Voucher dan Promo | Level 4 |
| Pemrosesan pesanan oleh Penjual | Level 4 |
| Laporan pendapatan Penjual | Level 4 |
| Alur pengiriman dan dasbor Pengemudi | Level 5 |
| Monitoring Admin | Level 6 |
| Penanganan pesanan melewati SLA | Level 6 |
| Penguatan keamanan dan dokumentasi final | Level 7 |
