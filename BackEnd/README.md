# SEAPEDIA — Backend API

Dokumentasi teknis untuk komponen backend aplikasi SEAPEDIA. Backend dibangun menggunakan **Express.js** dengan arsitektur REST API dan mendukung dua mode penyimpanan data: **MongoDB** (produksi) dan **JSON file lokal** (fallback tanpa konfigurasi).

---

## Teknologi yang Digunakan

| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| Node.js | >= 18 | Runtime JavaScript |
| Express.js | ^4.21.2 | Framework HTTP |
| Mongoose | ^8.12.0 | ODM untuk MongoDB |
| bcryptjs | ^3.0.2 | Hashing kata sandi |
| jsonwebtoken | ^9.0.2 | Autentikasi berbasis JWT |
| dotenv | ^16.4.7 | Manajemen variabel lingkungan |
| cors | ^2.8.5 | Cross-Origin Resource Sharing |

---

## Persyaratan

- Node.js versi 18 atau lebih baru
- pnpm atau npm
- MongoDB (opsional)

---

## Instalasi dan Menjalankan

### 1. Masuk ke direktori Backend

```bash
cd BackEnd
```

### 2. Konfigurasi variabel lingkungan (opsional)

Buat file `.env` di dalam direktori `BackEnd/`. Jika tidak disediakan, sistem menggunakan nilai default berikut:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/seapedia
JWT_SECRET=seapedia_secret_key_123
```

### 3. Instalasi dependensi

```bash
pnpm install
```

### 4. Menjalankan server

```bash
pnpm dev
```

Server akan berjalan pada `http://localhost:5000`.

### Mode Fallback JSON

Jika MongoDB tidak tersedia, server secara otomatis beralih ke penyimpanan berbasis file JSON (`local_db.json`). Mode ini dirancang agar proyek dapat dijalankan di mesin mana pun tanpa konfigurasi database.

---

## Basis URL

```
http://localhost:5000/api
```

---

## Dokumentasi Endpoint

### Autentikasi — `/api/auth`

#### POST /api/auth/register

Mendaftarkan akun baru. Setiap akun baru secara otomatis mendapatkan peran Pembeli.

**Request Body:**
```json
{
  "username": "nama_pengguna",
  "password": "kata_sandi"
}
```

**Response 201:**
```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": "abc123",
    "username": "nama_pengguna",
    "roles": ["Buyer"],
    "activeRole": "Buyer"
  }
}
```

---

#### POST /api/auth/login

Masuk dengan nama pengguna dan kata sandi.

**Request Body:**
```json
{
  "username": "nama_pengguna",
  "password": "kata_sandi"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": "abc123",
    "username": "nama_pengguna",
    "roles": ["Buyer", "Seller"],
    "activeRole": "Buyer"
  }
}
```

---

#### GET /api/auth/profile

Mengambil profil singkat pengguna yang sedang masuk. Memerlukan token.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "id": "abc123",
  "username": "nama_pengguna",
  "roles": ["Buyer", "Seller"],
  "activeRole": "Buyer",
  "createdAt": "2026-01-15T08:00:00.000Z"
}
```

---

#### POST /api/auth/role

Mengubah peran aktif untuk sesi saat ini. Peran yang diminta harus sudah dimiliki oleh pengguna.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{ "activeRole": "Seller" }
```

**Response 200:** Token baru beserta data pengguna yang telah diperbarui.

---

#### POST /api/auth/add-role/seller

Menambahkan peran Penjual ke akun pengguna dan membuat toko baru secara bersamaan.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{ "storeName": "Nama Toko" }
```

**Validasi:** Nama toko wajib diisi dan harus unik di seluruh platform.

---

#### POST /api/auth/add-role/driver

Menambahkan peran Pengemudi ke akun pengguna.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "fullName": "Nama Lengkap",
  "vehicleNumber": "B 1234 ABC"
}
```

---

### Profil Pengguna — `/api/users`

#### GET /api/users/me

Mengambil profil lengkap pengguna yang sedang masuk, termasuk foto, data diri, dan kontak.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "username": "nama_pengguna",
    "roles": ["Buyer"],
    "activeRole": "Buyer",
    "profilePhoto": "",
    "fullName": "",
    "dateOfBirth": null,
    "gender": "Prefer not to say",
    "phoneNumber": "",
    "isEmailVerified": false
  }
}
```

---

#### GET /api/users/me/roles

Mengambil daftar peran dan peran aktif pengguna.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "roles": ["Buyer", "Seller"],
    "activeRole": "Buyer"
  }
}
```

---

#### PUT /api/users/me

Memperbarui data diri pengguna. Field yang diizinkan: `fullName`, `dateOfBirth`, `gender`, `phoneNumber`. Field `username`, `password`, `roles`, dan `activeRole` tidak dapat diubah melalui endpoint ini.

**Headers:** `Authorization: Bearer <token>`

**Request Body (semua field bersifat opsional):**
```json
{
  "fullName": "Nama Lengkap",
  "dateOfBirth": "1990-01-15",
  "gender": "Male",
  "phoneNumber": "081234567890"
}
```

---

#### PUT /api/users/me/photo

Memperbarui foto profil pengguna. Menerima URL publik HTTPS atau data URI base64.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{ "photoUrl": "https://example.com/foto.jpg" }
```

Batas ukuran: 5 MB gambar (sekitar 7 MB string base64).

---

### Ulasan Platform — `/api/reviews`

#### POST /api/reviews

Mengirimkan ulasan tentang platform SEAPEDIA. Tidak memerlukan autentikasi.

**Request Body:**
```json
{
  "reviewerName": "Nama Pengulas",
  "rating": 5,
  "comment": "Isi ulasan"
}
```

---

#### GET /api/reviews

Mengambil semua ulasan platform, diurutkan dari yang terbaru.

---

### Toko — `/api/stores`

#### POST /api/stores

Membuat toko baru. Hanya dapat dilakukan oleh pengguna dengan `activeRole` **Seller**.

**Headers:** `Authorization: Bearer <token>` (activeRole harus Seller)

**Request Body:**
```json
{
  "name": "Nama Toko",
  "description": "Deskripsi toko",
  "businessType": "Fashion & Pakaian",
  "storePhoto": "https://example.com/foto.jpg"
}
```

**Catatan:** Satu akun hanya dapat memiliki satu toko. Nama toko harus unik.

---

#### GET /api/stores/my-store

Mengambil data toko milik Penjual yang sedang masuk, termasuk jumlah produk aktif.

**Headers:** `Authorization: Bearer <token>` (activeRole harus Seller)

---

#### PUT /api/stores/my-store

Memperbarui profil toko. Validasi nama toko hanya dilakukan jika nama berubah.

**Headers:** `Authorization: Bearer <token>` (activeRole harus Seller)

**Request Body:**
```json
{
  "name": "Nama Toko Baru",
  "description": "Deskripsi baru",
  "businessType": "Elektronik & Gadget",
  "storePhoto": "data:image/jpeg;base64,..."
}
```

---

#### GET /api/stores/:id

Mengambil data toko berdasarkan ID. Dapat diakses tanpa autentikasi.

---

### Produk — `/api/products`

#### POST /api/products

Menambahkan produk baru ke toko Penjual.

**Headers:** `Authorization: Bearer <token>` (activeRole harus Seller)

**Request Body:**
```json
{
  "name": "Nama Produk",
  "description": "Deskripsi produk",
  "price": 50000,
  "stock": 100,
  "image": "https://example.com/gambar.jpg"
}
```

**Validasi:** name (2–200 karakter), description (wajib), price (>= 0), stock (>= 0).

---

#### GET /api/products/my-products

Mengambil semua produk aktif milik Penjual yang sedang masuk.

**Headers:** `Authorization: Bearer <token>` (activeRole harus Seller)

---

#### PUT /api/products/:id

Memperbarui produk. Hanya dapat dilakukan oleh Penjual pemilik produk tersebut.

**Headers:** `Authorization: Bearer <token>` (activeRole harus Seller)

---

#### DELETE /api/products/:id

Menghapus produk secara soft delete (`isActive: false`). Hanya dapat dilakukan oleh Penjual pemilik produk.

**Headers:** `Authorization: Bearer <token>` (activeRole harus Seller)

---

#### GET /api/products

Mengambil katalog produk publik dengan dukungan pagination dan pencarian. Dapat diakses tanpa autentikasi.

**Query Parameters:**

| Parameter | Tipe | Default | Keterangan |
|-----------|------|---------|------------|
| `search` | string | — | Filter berdasarkan nama produk |
| `page` | number | 1 | Halaman saat ini |
| `limit` | number | 20 | Jumlah produk per halaman |

**Response 200:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 42,
    "page": 1,
    "totalPages": 3,
    "limit": 20
  }
}
```

---

#### GET /api/products/:id

Mengambil detail produk berdasarkan ID. Dapat diakses tanpa autentikasi.

---

## Aturan Bisnis Backend

- **Keunikan nama toko**: Dikonfirmasi melalui constraint database dan validasi pada lapisan route.
- **Kepemilikan produk**: Penjual hanya dapat mengubah atau menghapus produk miliknya sendiri, diverifikasi melalui middleware `ownershipCheck`.
- **Otorisasi berbasis peran aktif**: Middleware `requireRole` memvalidasi `activeRole` dari payload JWT, bukan seluruh daftar peran.
- **Keamanan kata sandi**: Kata sandi di-hash menggunakan bcrypt dengan salt rounds 10. Kata sandi tidak pernah dikembalikan dalam respons API mana pun.
- **Ukuran request**: Batas ukuran body JSON ditetapkan pada 8 MB untuk mengakomodasi unggahan foto berbasis base64.
- **JWT**: Token berlaku selama 7 hari dan memuat `id`, `username`, `roles`, serta `activeRole`.

---

## Membuat Akun Admin

Akun Admin tidak dapat dibuat melalui endpoint registrasi publik. Untuk membuat akun Admin, tambahkan entri secara langsung ke koleksi `users` di MongoDB atau ke file `local_db.json` dengan struktur berikut:

```json
{
  "_id": "admin001",
  "username": "admin",
  "password": "<bcrypt_hash>",
  "roles": ["Admin"],
  "activeRole": "Admin",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

Kata sandi harus di-hash terlebih dahulu menggunakan bcrypt sebelum disimpan.
