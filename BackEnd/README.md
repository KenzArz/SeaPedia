# Seapedia — BackEnd API

Dokumentasi ini menjelaskan cara instalasi, dan daftar endpoint API untuk bagian **BackEnd** dari proyek Seapedia.

---

## Cara Menjalankan

Pastikan Anda telah menginstal [Node.js](https://nodejs.org/) dan package manager [pnpm](https://pnpm.io/) (atau `npm`).

### 1. Masuk ke folder BackEnd

```bash
cd BackEnd
```

### 2. Konfigurasi Environment Variables (Opsional)

Buat file bernama `.env` di dalam folder `BackEnd/`. Jika tidak disediakan, sistem akan otomatis menggunakan nilai default di bawah:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/seapedia
JWT_SECRET=seapedia_secret_key_123
```

### 3. Install Dependensi

```bash
pnpm install
```

_(atau `npm install` jika menggunakan npm)_

### 4. Jalankan Server

Untuk mode development:

```bash
pnpm dev
```

_(atau `npm run dev`)_

Secara default, server akan berjalan di **http://localhost:5000**.

---

## Dokumentasi API

Seluruh endpoint API memiliki basis URL: `http://localhost:5000/api`

### 1. Autentikasi & Pengguna (`/api/auth`)

- **Endpoint**: `POST /api/auth/register`
- **Request Body**:
  ```json
  {
    "username": "aldi",
    "password": "password123",
    "roles": ["Buyer", "Seller"]
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "64a0f...",
      "username": "aldi",
      "roles": ["Buyer", "Seller"],
      "activeRole": "Buyer"
    }
  }
  ```

#### Login

- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "username": "aldi",
    "password": "password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "64a0f...",
      "username": "aldi",
      "roles": ["Buyer", "Seller"],
      "activeRole": "Buyer"
    }
  }
  ```

#### Dapatkan Profil Pengguna

- **Endpoint**: `GET /api/auth/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:

  ```json
  {
    "id": "64a0f...",
    "username": "aldi",
    "roles": ["Buyer", "Seller"],
    "activeRole": "Buyer"
  }
  ```

- **Endpoint**: `POST /api/auth/role`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "activeRole": "Seller"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "64a0f...",
      "username": "aldi",
      "roles": ["Buyer", "Seller"],
      "activeRole": "Seller"
    }
  }
  ```

### 2. Ulasan Platform (`/api/reviews`)

#### Kirim Ulasan

- **Endpoint**: `POST /api/reviews`
- **Request Body**:
  ```json
  {
    "reviewerName": "Budi Santoso",
    "rating": 5,
    "comment": "Sangat membantu untuk mencari produk nelayan lokal!"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "_id": "64b0a...",
    "reviewerName": "Budi Santoso",
    "rating": 5,
    "comment": "Sangat membantu untuk mencari produk nelayan lokal!",
    "createdAt": "2026-06-28T06:45:00.000Z"
  }
  ```

#### Ambil Semua Ulasan

- **Endpoint**: `GET /api/reviews`
- **Response (200 OK)**:
  ```json
  [
    {
      "_id": "64b0a...",
      "reviewerName": "Budi Santoso",
      "rating": 5,
      "comment": "Sangat membantu untuk mencari produk nelayan lokal!",
      "createdAt": "2026-06-28T06:45:00.000Z"
    }
  ]
  ```
