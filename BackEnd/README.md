# SEAPEDIA — BackEnd API

Express.js REST API dengan dual-database fallback: MongoDB (production) dan JSON file lokal (`local_db.json`) untuk demo tanpa konfigurasi database.

---

## Cara Menjalankan

### 1. Masuk ke folder BackEnd

```bash
cd BackEnd
```

### 2. Konfigurasi Environment (opsional)

Buat file `.env` di dalam folder `BackEnd/`. Jika tidak ada, nilai default berikut digunakan:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/seapedia
JWT_SECRET=seapedia_secret_key_123
```

> **Mode "Works on Any Machine":** Jika MongoDB tidak tersedia, server otomatis beralih ke `local_db.json`. Tidak ada konfigurasi tambahan yang diperlukan.

### 3. Install dependensi

```bash
pnpm install
# atau: npm install
```

### 4. Jalankan server

```bash
pnpm dev
# atau: npm run dev
```

Server berjalan di **http://localhost:5000**.

---

## Catatan Keamanan

- Password di-hash menggunakan **bcryptjs** (salt rounds: 10) — tidak pernah disimpan plaintext.
- Semua private endpoint memerlukan header `Authorization: Bearer <token>`.
- JWT berisi `id`, `username`, `roles`, dan `activeRole` — kedaluwarsa dalam **7 hari**.
- Role authorization dilakukan di server (`requireRole` middleware) — frontend tidak bisa membypass.
- Endpoint profile update (`PUT /api/users/me`) secara eksplisit memblokir update field `roles`, `activeRole`, `password`, dan `username`.

---

## Basis URL

```
http://localhost:5000/api
```

---

## Dokumentasi Endpoint

### Auth — `/api/auth`

#### `POST /api/auth/register`
Daftarkan akun baru. Setiap akun baru otomatis mendapat role `Buyer`.

**Request Body:**
```json
{ "username": "aldi", "password": "password123" }
```

**Response `201`:**
```json
{
  "token": "eyJhbGciOi...",
  "user": { "id": "abc123", "username": "aldi", "roles": ["Buyer"], "activeRole": "Buyer" }
}
```

---

#### `POST /api/auth/login`
Login dengan username dan password.

**Request Body:**
```json
{ "username": "aldi", "password": "password123" }
```

**Response `200`:**
```json
{
  "token": "eyJhbGciOi...",
  "user": { "id": "abc123", "username": "aldi", "roles": ["Buyer"], "activeRole": "Buyer" }
}
```

---

#### `GET /api/auth/profile`
Ambil profil singkat user yang sedang login (roles + activeRole + createdAt).

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{
  "id": "abc123",
  "username": "aldi",
  "roles": ["Buyer", "Seller"],
  "activeRole": "Buyer",
  "createdAt": "2025-06-01T10:00:00.000Z"
}
```

> Untuk profil lengkap (fullName, foto, telepon, dll), gunakan `GET /api/users/me`.

---

#### `POST /api/auth/role`
Ganti role aktif untuk sesi saat ini. Role harus sudah dimiliki user.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{ "activeRole": "Seller" }
```

**Response `200`:** token baru + data user terbaru (format sama dengan login).

---

#### `POST /api/auth/add-role/seller`
Tambahkan role Seller ke akun user dan buat toko baru.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{ "storeName": "Toko Bahari Sejahtera" }
```

**Response `200`:** token baru + data user dengan `roles: ["Buyer", "Seller"]`.

**Error:** `400` jika nama toko sudah digunakan atau user sudah Seller.

---

#### `POST /api/auth/add-role/driver`
Tambahkan role Driver ke akun user.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{ "fullName": "Budi Santoso", "vehicleNumber": "B 1234 CDG" }
```

**Response `200`:** token baru + data user dengan `roles: ["Buyer", "Driver"]`.

---

### Profil User — `/api/users`

#### `GET /api/users/me`
Ambil profil lengkap user yang sedang login termasuk foto, biodata, dan kontak.

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "username": "aldi",
    "roles": ["Buyer", "Seller"],
    "activeRole": "Buyer",
    "profilePhoto": "",
    "fullName": "Aldi Pratama",
    "dateOfBirth": "2000-05-15T00:00:00.000Z",
    "gender": "Male",
    "phoneNumber": "081234567890",
    "isEmailVerified": false
  }
}
```

---

#### `GET /api/users/me/roles`
Ambil hanya daftar role dan role aktif user.

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{
  "success": true,
  "data": { "roles": ["Buyer", "Seller"], "activeRole": "Buyer" }
}
```

---

#### `PUT /api/users/me`
Update biodata profil. Field yang diizinkan: `fullName`, `dateOfBirth`, `gender`, `phoneNumber`.

**Headers:** `Authorization: Bearer <token>`

**Request Body (semua field opsional):**
```json
{
  "fullName": "Aldi Pratama",
  "dateOfBirth": "2000-05-15",
  "gender": "Male",
  "phoneNumber": "081234567890"
}
```

**Field yang TIDAK bisa diubah lewat endpoint ini:** `username`, `password`, `roles`, `activeRole`.

**Response `200`:** `{ "success": true, "data": { ...profil terbaru } }`

---

#### `PUT /api/users/me/photo`
Update foto profil. Menerima URL publik atau base64 data URI.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{ "photoUrl": "https://example.com/photo.jpg" }
```
atau base64:
```json
{ "photoUrl": "data:image/jpeg;base64,/9j/4AAQ..." }
```

> **Trade-off base64:** Tidak memerlukan storage eksternal, cocok untuk demo. Overhead ukuran ~33%. Untuk produksi, gunakan URL dari cloud storage (S3, Cloudinary, dll).

**Batas ukuran:** Maksimum 5 MB gambar (~7 MB string base64).

**Response `200`:** `{ "success": true, "data": { ...profil terbaru } }`

---

### Ulasan Platform — `/api/reviews`

#### `POST /api/reviews`
Kirim ulasan tentang aplikasi SEAPEDIA. Tidak memerlukan login.

**Request Body:**
```json
{ "reviewerName": "Budi", "rating": 5, "comment": "Sangat membantu!" }
```

**Response `201`:** data ulasan yang baru dibuat.

---

#### `GET /api/reviews`
Ambil semua ulasan, diurutkan dari terbaru.

**Response `200`:** array ulasan.

---

### Toko — `/api/stores`

#### `POST /api/stores`
Buat toko baru. Hanya bisa dilakukan oleh user dengan activeRole `Seller`.

**Headers:** `Authorization: Bearer <token>` (activeRole harus `Seller`)

**Request Body:**
```json
{ "name": "Toko Bahari", "description": "Jual ikan segar" }
```

**Response `201`:** data toko baru.

**Catatan:** Nama toko harus unik (case-sensitive). Satu akun hanya boleh memiliki satu toko.

---

#### `GET /api/stores/my-store`
Ambil data toko milik Seller yang sedang login, termasuk jumlah produk aktif.

**Headers:** `Authorization: Bearer <token>` (activeRole harus `Seller`)

**Response `200`:** `{ "success": true, "data": { ...toko, "productCount": 5 } }`

---

#### `PUT /api/stores/my-store`
Update nama atau deskripsi toko milik Seller yang sedang login.

**Headers:** `Authorization: Bearer <token>` (activeRole harus `Seller`)

**Request Body:**
```json
{ "name": "Nama Baru Toko", "description": "Deskripsi baru" }
```

---

#### `GET /api/stores/:id`
Ambil data toko publik berdasarkan ID (dapat diakses tanpa login).

---

### Produk — `/api/products`

#### `POST /api/products`
Tambah produk baru ke toko Seller.

**Headers:** `Authorization: Bearer <token>` (activeRole harus `Seller`)

**Request Body:**
```json
{
  "name": "Ikan Salmon Segar",
  "description": "Salmon Atlantic segar, berat 500g",
  "price": 85000,
  "stock": 50,
  "image": "https://example.com/salmon.jpg"
}
```

**Validasi:** `name` 2–200 karakter, `description` wajib, `price` ≥ 0, `stock` ≥ 0.

---

#### `GET /api/products/my-products`
Daftar semua produk aktif milik Seller yang sedang login.

**Headers:** `Authorization: Bearer <token>` (activeRole harus `Seller`)

---

#### `PUT /api/products/:id`
Update produk. Hanya bisa dilakukan oleh Seller pemilik produk.

**Headers:** `Authorization: Bearer <token>` (activeRole harus `Seller`)

**Request Body:** field yang sama dengan POST, semua opsional.

---

#### `DELETE /api/products/:id`
Soft-delete produk (set `isActive: false`). Hanya pemilik produk.

**Headers:** `Authorization: Bearer <token>` (activeRole harus `Seller`)

---

#### `GET /api/products`
Katalog produk publik dengan pagination dan pencarian. Dapat diakses tanpa login.

**Query Parameters:**
| Parameter | Type | Default | Keterangan |
|-----------|------|---------|------------|
| `search`  | string | — | Filter by nama produk |
| `page`    | number | 1 | Halaman saat ini |
| `limit`   | number | 20 | Jumlah produk per halaman |

**Response `200`:**
```json
{
  "success": true,
  "data": [...],
  "pagination": { "total": 42, "page": 1, "totalPages": 3, "limit": 20 }
}
```

---

#### `GET /api/products/:id`
Detail produk publik berdasarkan ID. Dapat diakses tanpa login.

---

## Aturan Bisnis yang Diimplementasikan

- **Multi-role:** Satu username bisa memiliki role Buyer, Seller, dan Driver secara bersamaan.
- **Active role:** Otorisasi didasarkan pada `activeRole` dalam JWT, bukan seluruh daftar role.
- **Store uniqueness:** Nama toko harus unik di seluruh platform. Satu Seller hanya boleh memiliki satu toko.
- **Product ownership:** Seller hanya bisa mengubah/menghapus produk milik mereka sendiri (diverifikasi via `ownershipCheck` middleware).
- **Password security:** Hash bcrypt, tidak pernah dikembalikan dalam response apapun.
