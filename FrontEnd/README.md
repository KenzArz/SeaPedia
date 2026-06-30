# SEAPEDIA — FrontEnd

React + TypeScript frontend untuk platform marketplace SEAPEDIA. Dibangun dengan Vite, menggunakan CSS custom properties untuk theming dan Lucide React untuk ikon.

---

## Cara Menjalankan

### 1. Masuk ke folder FrontEnd

```bash
cd FrontEnd
```

### 2. Install dependensi

```bash
pnpm install
# atau: npm install
```

### 3. Pastikan BackEnd berjalan

Frontend memerlukan BackEnd API di `http://localhost:5000`. Jalankan BackEnd terlebih dahulu (lihat `BackEnd/README.md`).

### 4. Jalankan development server

```bash
pnpm dev
# atau: npm run dev
```

Aplikasi berjalan di **http://localhost:5173**.

### 5. Build untuk production

```bash
pnpm build
```

Output di folder `dist/`.

---

## Routing

| Path | Halaman | Akses |
|------|---------|-------|
| `/` | `LandingPage` | Publik |
| `/products` | `ProductList` | Publik |
| `/products/:id` | `ProductDetail` | Publik |
| `/reviews` | `ReviewPage` | Publik |
| `/login` | `Login` | Guest only |
| `/register` | `Register` | Guest only |
| `/dashboard` | `Dashboard` | Login required |
| `/seller-dashboard` | → redirect `/dashboard` | — |
| `/driver-dashboard` | → redirect `/dashboard` | — |
| `/admin-dashboard`  | → redirect `/dashboard` | — |

---

## Struktur Komponen

```
src/
├── components/
│   ├── AccountOverview.tsx     # Dasbor terpadu Buyer (role cards, produk terbaru)
│   ├── AvatarFallback.tsx      # Avatar foto/inisial reusable
│   ├── BecomeDriverModal.tsx   # Modal daftar jadi pengemudi
│   ├── BecomeSellerModal.tsx   # Modal buka toko
│   ├── Button.tsx              # Tombol reusable
│   ├── Card.tsx                # Card reusable
│   ├── Input.tsx               # Input reusable
│   ├── Navbar.tsx              # Navigasi global
│   ├── RoleModal.tsx           # Modal pilih role aktif
│   ├── Toast.tsx               # Notifikasi toast
│   ├── WaveBg.tsx              # Background gelombang
│   ├── landing/                # Komponen section landing page
│   └── seller/
│       ├── ProductManager.tsx  # CRUD produk Seller
│       └── StoreManager.tsx    # Manajemen toko Seller
├── context/
│   └── AuthContext.tsx         # State login, token, switchRole, addRole
├── pages/
│   ├── Dashboard.tsx           # Dashboard terpadu semua role
│   ├── PersonalProfile.tsx     # Halaman profil personal
│   ├── ProductDetail.tsx
│   ├── ProductList.tsx
│   ├── ReviewPage.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   └── LandingPage.tsx
├── services/
│   ├── api.ts                  # Axios instance + token interceptor
│   ├── productService.ts
│   ├── storeService.ts
│   └── userService.ts          # getMe, updateProfile, updatePhoto
├── styles/                     # CSS per halaman/komponen
└── utils/
    ├── dateHelper.ts
    └── imageHelper.ts
```

---

## Sistem Role

SEAPEDIA mendukung empat role: **Buyer**, **Seller**, **Driver**, **Admin**.

- Satu username bisa memiliki lebih dari satu role non-admin secara bersamaan.
- Setelah login, user dengan lebih dari satu role memilih **role aktif** untuk sesi tersebut.
- Otorisasi frontend dan backend sama-sama didasarkan pada `activeRole`, bukan seluruh daftar role.
- Role aktif bisa diganti kapan saja dari dashboard tanpa logout.
- Route `/dashboard` menampilkan konten yang berbeda tergantung `activeRole`.

### Alur Login Multi-role

```
Login → Jika 1 role → Dashboard langsung
      → Jika >1 role → Pilih role aktif (RoleModal) → Dashboard
```

---

## Aturan Bisnis Penting

### Single-Store Checkout *(Level 3+)*

Karena SEAPEDIA adalah platform multi-penjual, satu sesi cart hanya boleh berisi produk dari **satu toko**. Jika pembeli mencoba menambahkan produk dari toko berbeda, sistem akan meminta konfirmasi untuk mengosongkan cart terlebih dahulu.

Aturan ini:
- Diimplementasikan di backend (validasi saat checkout)
- Ditampilkan dengan notifikasi yang jelas di frontend
- Didokumentasikan di endpoint checkout

### Kalkulasi Checkout *(Level 3+)*

Total pembayaran dihitung sebagai:

```
Subtotal  = jumlah × harga per item
Diskon    = dari Voucher atau Promo (jika ada)
Ongkir    = tergantung metode pengiriman (Instant / Next Day / Regular)
PPN       = 12% dari (Subtotal - Diskon)
Total     = Subtotal - Diskon + Ongkir + PPN
```

Posisi diskon sebelum PPN — konsisten di seluruh sistem.

### Metode Pengiriman *(Level 3+)*

| Metode | Ongkos | SLA |
|--------|--------|-----|
| Instant | Tertinggi | Hari yang sama |
| Next Day | Menengah | 1 hari kerja |
| Regular | Terendah | 2–3 hari kerja |

### Driver Earning *(Level 5+)*

Driver mendapatkan persentase dari ongkos kirim. Persentase dan perhitungan didokumentasikan saat Level 5 diimplementasikan.

### Overdue SLA *(Level 6+)*

Order yang tidak diselesaikan dalam batas SLA pengiriman akan otomatis di-refund ke wallet Buyer. Stok produk dikembalikan. Pendapatan Seller di-reverse jika sudah dicatat.

---

## Keamanan

| Aspek | Implementasi |
|-------|-------------|
| Token | JWT, disimpan di localStorage (`seapedia_token`) |
| Expiry | 7 hari |
| Role check | Frontend route guard + backend middleware |
| XSS | React escapes semua string by default; komentar ulasan tidak di-dangerouslySetInnerHTML |
| SQL Injection | Tidak berlaku (MongoDB/JSON) — query menggunakan ORM/object comparison |
| Input validation | Frontend (sebelum submit) + backend (sebelum simpan ke DB) |

---

## Akun Demo (untuk evaluasi)

Buat akun baru melalui halaman `/register`. Setiap akun baru otomatis mendapat role **Buyer**.

Untuk mendapatkan role **Seller**: klik "Buka Toko" dari dashboard, isi nama toko.
Untuk mendapatkan role **Driver**: klik "Daftar Jadi Pengemudi" dari dashboard.

> Admin harus dibuat manual via script seed atau langsung di database. Lihat `BackEnd/README.md` untuk detail.
