# Seapedia — FrontEnd

Dokumentasi ini menjelaskan cara menjalankan bagian **FrontEnd** dari proyek Seapedia.

---

## Cara Menjalankan

Menginstal [pnpm](https://pnpm.io/installation) terlebih dahulu.

### 1. Masuk ke folder FrontEnd

```bash
cd FrontEnd
```

### 2. Install dependensi

```bash
pnpm install
```

### 3. Jalankan development server

```bash
pnpm dev
```

Aplikasi akan berjalan di **http://localhost:5173** secara default.

### 4. Build untuk production

```bash
pnpm build
```

Output akan tersimpan di folder `FrontEnd/dist/`.

### 5. Preview build production

```bash
pnpm preview
```

---

## 🗺️ Halaman & Routing

| Path | Halaman | Keterangan |
|------|---------|------------|
| `/` | `LandingPage` | Halaman utama publik |
| `/home` | `Home` | Halaman setelah login |
| `/login` | `Login` | Form masuk akun |
| `/register` | `Register` | Form daftar akun |
| `/dashboard` | `Dashboard` | Dashboard pengguna |
| `/products` | `ProductList` | Daftar produk laut |
| `/products/:id` | `ProductDetail` | Detail produk |
| `/review/:id` | `ReviewPage` | Halaman ulasan produk |

---

