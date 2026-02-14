# Flow Aplikasi — Arsip Bapekom

Dokumen ini menjelaskan **seluruh alur (flow)** aplikasi Arsip Bapekom beserta **input** dan **output** di setiap proses.

---

## Daftar Isi

1. [Flow Autentikasi (Login)](#1-flow-autentikasi-login)
2. [Flow Middleware & Proteksi Route](#2-flow-middleware--proteksi-route)
3. [Flow Dashboard](#3-flow-dashboard)
4. [Flow Arsip — CRUD](#4-flow-arsip--crud)
   - [4.1 Membuat Arsip Baru](#41-membuat-arsip-baru)
   - [4.2 Melihat Daftar Arsip](#42-melihat-daftar-arsip)
   - [4.3 Melihat Detail Arsip](#43-melihat-detail-arsip)
   - [4.4 Mengedit Arsip](#44-mengedit-arsip)
   - [4.5 Menghapus Arsip](#45-menghapus-arsip)
5. [Flow Upload File ke Cloud Storage](#5-flow-upload-file-ke-cloud-storage)
6. [Flow Struktur Folder di Cloud](#6-flow-struktur-folder-di-cloud)
7. [Flow Browse Arsip (Folder View)](#7-flow-browse-arsip-folder-view)
8. [Flow Filter & Pencarian Arsip](#8-flow-filter--pencarian-arsip)
9. [Flow Export Arsip](#9-flow-export-arsip)
10. [Flow Notifikasi](#10-flow-notifikasi)
11. [Flow Manajemen User (Admin)](#11-flow-manajemen-user-admin)
12. [Flow Profil Pengguna](#12-flow-profil-pengguna)
13. [Flow Koneksi Storage (Google Drive / OneDrive)](#13-flow-koneksi-storage-google-drive--onedrive)
14. [Flow RBAC (Role-Based Access Control)](#14-flow-rbac-role-based-access-control)
15. [Flow Rate Limiting](#15-flow-rate-limiting)
16. [Ringkasan Semua API Endpoint](#16-ringkasan-semua-api-endpoint)

---

## 1. Flow Autentikasi (Login)

### Diagram Alur

```
Pengguna buka app (/)
       │
       ▼
 Cek session server-side
       │
  ┌────┴────┐
  │ Ada     │ Tidak ada
  │ session │ session
  ▼         ▼
Redirect   Redirect
/dashboard /login
             │
             ▼
     Halaman Login
     (intro 10 detik → form login)
             │
             ▼
     User isi email & password
             │
             ▼
   POST /api/auth/[...nextauth]
             │
      ┌──────┴──────┐
      │ Rate Limit  │
      │ Check       │
      │ (5x / 60s)  │
      ▼              ▼
   Lolos         Ditolak → Error:
      │          "Too many login attempts"
      ▼
  Cari user di DB by email
      │
  ┌───┴───┐
  │ Ada   │ Tidak ada → return null → Error
  ▼       │
  Compare password (bcrypt)
      │
  ┌───┴───┐
  │ Valid │ Invalid → return null → Error
  ▼       │
 Return user object
 (id, name, email, role, division)
      │
      ▼
  JWT Token dibuat
  (berisi id, role, division)
      │
      ▼
  Cookie: next-auth.session-token-v2
      │
      ▼
  Redirect → /dashboard
```

### Input Login

| Field      | Tipe   | Wajib | Validasi                    |
|------------|--------|-------|-----------------------------|
| `email`    | string | ✅    | Format email valid          |
| `password` | string | ✅    | Min 6 karakter              |

### Output Login

| Kondisi      | Output                                          |
|--------------|------------------------------------------------|
| Berhasil     | JWT cookie di-set, redirect ke `/dashboard`     |
| Gagal        | Pesan error "Invalid email or password"         |
| Rate Limited | Pesan error "Too many login attempts..."        |

### Session Object (JWT Token)

```json
{
  "id": "uuid",
  "name": "Nama User",
  "email": "user@bapekom.go.id",
  "role": "SUPER_ADMIN | ADMIN | USER",
  "division": "KEUANGAN | PENYELENGGARA | TATA_USAHA | UMUM"
}
```

---

## 2. Flow Middleware & Proteksi Route

### Diagram Alur

```
Request masuk
      │
      ▼
Cek cookie lama (next-auth.session-token)
      │
  ┌───┴───┐
  │ Ada   │ Tidak ada
  ▼       ▼
Redirect 1x       Cek path apakah terproteksi
hapus cookie       (/dashboard, /archives, /admin, /profile)
lama               │
                ┌──┴──┐
                │ Ya  │ Tidak → NextResponse.next()
                ▼     │
          Cek JWT Token
                │
          ┌─────┴─────┐
          │ Ada token │ Tidak ada → Redirect /login
          ▼           │
    Cek role-based:
    ┌─────────────────────────────────┐
    │ /admin/users → SUPER_ADMIN only │
    │ /admin/storage → ADMIN+         │
    │ Lainnya → semua role            │
    └─────────────────────────────────┘
          │
    ┌─────┴──────┐
    │ Punya akses│ Tidak → Redirect /dashboard
    ▼            │
  NextResponse.next()
```

### Route yang Terproteksi

| Path Pattern       | Role yang Boleh Akses        |
|--------------------|-----------------------------|
| `/dashboard`       | Semua role (authenticated)   |
| `/archives/*`      | Semua role (authenticated)   |
| `/admin/users`     | `SUPER_ADMIN` only           |
| `/admin/storage`   | `SUPER_ADMIN`, `ADMIN`       |
| `/admin/roles`     | `SUPER_ADMIN`, `ADMIN`       |
| `/admin/activity`  | `SUPER_ADMIN`, `ADMIN`       |
| `/profile`         | Semua role (authenticated)   |
| `/login`           | Publik (tidak terproteksi)   |

---

## 3. Flow Dashboard

### Diagram Alur

```
User akses /dashboard
       │
       ▼
 Server-side: getServerSession()
       │
       ▼
 Query database (parallel):
 ┌────────────────────────────┐
 │ • Total arsip (count)      │
 │ • Arsip aktif (count)      │
 │ • Arsip inaktif (count)    │
 │ • Per divisi (4x count)    │
 │ • Upload 7 hari terakhir   │
 └────────────────────────────┘
       │
       ▼
 Render Dashboard Cards
```

### Output Dashboard

| Card                    | Data             |
|------------------------|-----------------|
| Total Archives          | Jumlah semua arsip |
| Active Archives         | Arsip status AKTIF |
| Inactive Archives       | Arsip status INAKTIF |
| Keuangan               | Arsip divisi Keuangan |
| Penyelenggara          | Arsip divisi Penyelenggara |
| Tata Usaha             | Arsip divisi Tata Usaha |
| Umum                   | Arsip divisi Umum |
| Recent Uploads (7 days) | Arsip minggu terakhir |

---

## 4. Flow Arsip — CRUD

### 4.1 Membuat Arsip Baru

```
User klik "Add Archive" → /archives/create
       │
       ▼
 Tampilkan ArchiveForm
       │
       ▼
 User isi form + upload file
       │
       ▼
 ┌─── Step 1: Upload File ───┐
 │ POST /api/upload           │
 │ Input: file + division     │
 │        + year (auto)       │
 │ • Validasi tipe file       │
 │ • Validasi ukuran (≤10MB)  │
 │ • Sanitasi nama file       │
 │ • Upload ke cloud storage  │
 │ Output: { fileId, fileUrl }│
 └────────────┬───────────────┘
              │
              ▼
 ┌─── Step 2: Simpan Arsip ──┐
 │ POST /api/archives         │
 │ Input: form data + fileId  │
 │        + fileUrl           │
 │ • Validasi field wajib     │
 │ • Cek akses divisi (RBAC)  │
 │ • Simpan ke database       │
 │ Output: archive object     │
 └────────────┬───────────────┘
              │
              ▼
 ┌─── Step 3: Notifikasi ────┐
 │ • Notifikasi ke pembuat    │
 │ • Notifikasi ke semua      │
 │   admin & super admin      │
 └────────────┬───────────────┘
              │
              ▼
      Redirect → /archives
```

#### Input Form Arsip

| Field            | Tipe     | Wajib | Validasi / Keterangan                                   |
|------------------|----------|-------|----------------------------------------------------------|
| `archiveNumber`  | string   | ✅    | Nomor arsip                                              |
| `title`          | string   | ✅    | Judul arsip                                              |
| `letterNumber`   | string   | ✅    | Nomor surat                                              |
| `date`           | date     | ✅    | Tanggal surat                                            |
| `division`       | enum     | ✅    | `KEUANGAN`, `PENYELENGGARA`, `TATA_USAHA`, `UMUM`       |
| `status`         | enum     | ❌    | `AKTIF` (default) atau `INAKTIF`                         |
| `description`    | string   | ❌    | Deskripsi opsional                                       |
| `file`           | File     | ✅    | Tipe: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, WebP. Max 10MB |

#### Output API `POST /api/archives`

```json
{
  "id": "uuid",
  "archiveNumber": "ARK-001",
  "title": "Surat Keputusan",
  "letterNumber": "SK/001/2026",
  "date": "2026-02-14T00:00:00.000Z",
  "division": "KEUANGAN",
  "status": "AKTIF",
  "description": "Deskripsi surat",
  "fileUrl": "https://drive.google.com/file/d/.../view",
  "fileId": "google-drive-file-id",
  "createdBy": "user-uuid",
  "createdAt": "2026-02-14T10:00:00.000Z",
  "updatedAt": "2026-02-14T10:00:00.000Z"
}
```

---

### 4.2 Melihat Daftar Arsip

```
User akses /archives
       │
       ▼
 GET /api/archives?limit=200
       │
       ▼
 ┌─── Server ────────────────────────┐
 │ • Cek autentikasi                  │
 │ • RBAC: USER hanya divisi sendiri  │
 │ • Apply filter (division, status,  │
 │   search, page, limit, sort)       │
 │ • Query DB + count total           │
 └──────────────┬─────────────────────┘
                │
                ▼
 Output: { archives: [...], pagination: {...} }
                │
                ▼
 Client-side rendering:
 ├── Tab Status: All | Active | Inactive
 ├── ArchiveTable dengan filter:
 │   ├── Search (global)
 │   ├── Filter Divisi
 │   ├── Filter Status
 │   ├── Filter Tahun
 │   └── Filter Rentang Tanggal
 └── Pagination
```

#### Input Query `GET /api/archives`

| Parameter   | Tipe   | Default      | Keterangan                          |
|-------------|--------|-------------|--------------------------------------|
| `division`  | string | -           | Filter divisi                        |
| `status`    | string | -           | `AKTIF` atau `INAKTIF`              |
| `search`    | string | -           | Cari di title, archiveNumber, letterNumber, description |
| `page`      | number | `1`         | Halaman                              |
| `limit`     | number | `10`        | Jumlah per halaman                   |
| `sortBy`    | string | `createdAt` | Field sort (whitelist)               |
| `sortOrder` | string | `desc`      | `asc` atau `desc`                   |

#### Output

```json
{
  "archives": [
    {
      "id": "uuid",
      "archiveNumber": "ARK-001",
      "title": "...",
      "letterNumber": "...",
      "date": "2026-01-15T00:00:00.000Z",
      "division": "KEUANGAN",
      "status": "AKTIF",
      "description": "...",
      "fileUrl": "https://...",
      "fileId": "...",
      "createdBy": "user-uuid",
      "createdAt": "...",
      "updatedAt": "...",
      "user": { "name": "Staff Keuangan", "email": "keuangan@bapekom.go.id" }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

### 4.3 Melihat Detail Arsip

```
User klik arsip → /archives/[id]
       │
       ▼
 GET /api/archives/[id]
       │
       ▼
 ┌─── Server ─────────────────┐
 │ • Cek autentikasi           │
 │ • Query arsip by ID         │
 │ • Cek akses divisi (RBAC)   │
 └──────────┬──────────────────┘
            │
     ┌──────┴──────┐
     │ Found       │ Not Found → 404
     ▼             │
 Output: archive object + user info
```

#### Input

| Parameter | Tipe   | Sumber | Keterangan   |
|-----------|--------|--------|-------------|
| `id`      | string | URL    | UUID arsip   |

#### Output

```json
{
  "id": "uuid",
  "archiveNumber": "ARK-001",
  "title": "...",
  "letterNumber": "...",
  "date": "...",
  "division": "KEUANGAN",
  "status": "AKTIF",
  "description": "...",
  "fileUrl": "https://...",
  "fileId": "...",
  "createdBy": "user-uuid",
  "createdAt": "...",
  "updatedAt": "...",
  "user": { "name": "...", "email": "..." }
}
```

---

### 4.4 Mengedit Arsip

```
User klik Edit → /archives/[id]/edit
       │
       ▼
 Load data arsip (GET /api/archives/[id])
       │
       ▼
 Tampilkan form dengan data terpopulasi
       │
       ▼
 User ubah field → Submit
       │
       ▼
 PUT /api/archives/[id]
       │
       ▼
 ┌─── Server ─────────────────────────┐
 │ • Cek autentikasi                   │
 │ • Cek canEditArchive (ADMIN+)       │
 │ • Cek arsip exists                  │
 │ • Cek akses divisi                  │
 │ • Validasi division & status        │
 │ • Update database                   │
 │ • Kirim notifikasi ke admin lain    │
 └──────────────┬──────────────────────┘
                │
                ▼
       Output: updated archive object
```

#### Input `PUT /api/archives/[id]`

| Field           | Tipe   | Wajib | Keterangan               |
|-----------------|--------|-------|--------------------------|
| `archiveNumber` | string | ❌    | Update jika dikirim      |
| `title`         | string | ❌    | Update jika dikirim      |
| `letterNumber`  | string | ❌    | Update jika dikirim      |
| `date`          | date   | ❌    | Update jika dikirim      |
| `division`      | enum   | ❌    | Validasi enum            |
| `status`        | enum   | ❌    | `AKTIF` / `INAKTIF`      |
| `description`   | string | ❌    | Update jika dikirim      |

#### Hak Akses

| Role          | Boleh Edit |
|--------------|-----------|
| SUPER_ADMIN  | ✅         |
| ADMIN        | ✅         |
| USER         | ❌         |

---

### 4.5 Menghapus Arsip

```
User klik Delete → Modal Konfirmasi
       │
       ▼
 User klik "Yes, Delete"
       │
       ▼
 DELETE /api/archives/[id]
       │
       ▼
 ┌─── Server ──────────────────────────┐
 │ • Cek autentikasi                    │
 │ • Cek canDeleteArchive (ADMIN+)      │
 │ • Cek arsip exists → 404 jika tidak │
 │ • Cek akses divisi                   │
 │ • Hapus dari database                │
 │ • Kirim notifikasi ke admin lain     │
 └──────────────┬───────────────────────┘
                │
                ▼
       Output: { message: "Arsip berhasil dihapus" }
```

#### Hak Akses

| Role          | Boleh Hapus |
|--------------|------------|
| SUPER_ADMIN  | ✅          |
| ADMIN        | ✅          |
| USER         | ❌          |

---

## 5. Flow Upload File ke Cloud Storage

```
File dari ArchiveForm
       │
       ▼
 POST /api/upload
 FormData: { file, division, year }
       │
       ▼
 ┌─── Validasi ────────────────────────────────┐
 │ 1. Cek autentikasi                           │
 │ 2. Rate limit: 10 upload / 60 detik per user │
 │ 3. Cek file & division ada                   │
 │ 4. Validasi divisi (whitelist 4 divisi)      │
 │ 5. Validasi ukuran file ≤ 10MB               │
 │ 6. Validasi tipe file (whitelist)             │
 │ 7. Sanitasi nama file (path traversal)       │
 └──────────────┬──────────────────────────────┘
                │
                ▼
 Deteksi storage provider aktif
 (dari tabel StorageConfig)
                │
         ┌──────┴──────┐
         │ Google      │ OneDrive
         │ Drive       │
         ▼             ▼
 uploadToDrive()  uploadToOneDrive()
         │             │
         ▼             ▼
 Buat folder hierarchy:
 Root Arsip / Divisi X / [Tahun] / file
         │
         ▼
 Output: { fileId: "...", fileUrl: "https://..." }
```

### Tipe File yang Diterima

| Kategori    | MIME Types                                                 |
|-------------|-----------------------------------------------------------|
| PDF         | `application/pdf`                                          |
| Word        | `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| Excel       | `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| PowerPoint  | `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation` |
| Gambar      | `image/jpeg`, `image/png`, `image/webp`                   |

---

## 6. Flow Struktur Folder di Cloud

### Google Drive

```
Google Drive
 └── Root Arsip/
      ├── Divisi Keuangan/
      │    ├── 2025/
      │    │    ├── dokumen1.pdf
      │    │    └── dokumen2.docx
      │    └── 2026/
      │         └── surat_keputusan.pdf
      ├── Divisi Penyelenggara/
      │    └── 2026/
      │         └── laporan.xlsx
      ├── Divisi Tata Usaha/
      │    └── 2026/
      │         └── memo.pdf
      └── Divisi Umum/
           └── 2026/
                └── pengumuman.docx
```

### Proses Pembuatan Folder

```
Upload file
    │
    ▼
getOrCreateRootFolder("Root Arsip")
    │ → cari folder, buat jika belum ada
    ▼
getOrCreateDivisionFolder(division)
    │ → cari sub-folder divisi, buat jika belum ada
    ▼
getOrCreateYearFolder(division, year)
    │ → cari sub-folder tahun, buat jika belum ada
    ▼
Upload file ke folder tahun
    │
    ▼
Set permission: anyone with link can view
    │
    ▼
Return { fileId, fileUrl }
```

### Mapping Nama Folder Divisi

| Kode Divisi      | Nama Folder di Cloud      |
|-----------------|--------------------------|
| `KEUANGAN`      | Divisi Keuangan           |
| `PENYELENGGARA` | Divisi Penyelenggara      |
| `TATA_USAHA`    | Divisi Tata Usaha         |
| `UMUM`          | Divisi Umum               |

---

## 7. Flow Browse Arsip (Folder View)

```
User klik "Browse" → /archives/browse
       │
       ▼
 GET /api/archives?limit=500
       │
       ▼
 Client-side folder navigation:

 Level 1: STATUS FOLDERS
 ┌──────────────────────────────────┐
 │  📂 Active Archives (N arsip)    │
 │  📂 Inactive Archives (N arsip)  │
 └──────────────┬───────────────────┘
                │ klik
                ▼
 Level 2: DIVISION FOLDERS
 ┌──────────────────────────────────┐
 │  📂 Keuangan (N arsip)           │
 │  📂 Penyelenggara (N arsip)      │
 │  📂 Tata Usaha (N arsip)         │
 │  📂 Umum (N arsip)               │
 └──────────────┬───────────────────┘
                │ klik
                ▼
 Level 3: YEAR FOLDERS
 ┌──────────────────────────────────┐
 │  📂 2026 (N arsip)               │
 │  📂 2025 (N arsip)               │
 │  📂 2024 (N arsip)               │
 └──────────────┬───────────────────┘
                │ klik
                ▼
 Level 4: ARCHIVE LIST
 ┌──────────────────────────────────┐
 │  📄 Surat Keputusan - ARK-001   │
 │  📄 Laporan Keuangan - ARK-002  │
 │  ... (aksi: view, edit, download)│
 └──────────────────────────────────┘
```

### Navigasi

| Elemen       | Fungsi                                    |
|-------------|------------------------------------------|
| Breadcrumb  | Archives > Active > Keuangan > 2026       |
| Tombol Back | Kembali ke level sebelumnya               |
| Home icon   | Kembali ke root                           |

---

## 8. Flow Filter & Pencarian Arsip

### Filter di ArchiveTable

```
┌─────────────────────────────────────────────────────────┐
│  🔍 Search archives...  │ All Divisions ▼│ All Status ▼│
│                          │ All Years ▼   │ [Reset All] │
├─────────────────────────────────────────────────────────┤
│  📅 Date Filter: [From ____] to [To ____]  [Reset]     │
└─────────────────────────────────────────────────────────┘
```

| Filter          | Tipe      | Keterangan                                    |
|----------------|-----------|-----------------------------------------------|
| Search         | Text      | Global search di semua kolom (client-side)     |
| Division       | Dropdown  | `KEUANGAN`, `PENYELENGGARA`, `TATA_USAHA`, `UMUM` |
| Status         | Dropdown  | `AKTIF`, `INAKTIF`                            |
| Year           | Dropdown  | Tahun dari data (auto-detect, descending)      |
| Date From      | Date      | Filter tanggal mulai                           |
| Date To        | Date      | Filter tanggal sampai                          |
| Reset All      | Button    | Hapus semua filter sekaligus                   |

### Tab Status (di halaman /archives)

| Tab        | Filter                                    |
|-----------|------------------------------------------|
| All        | Tampilkan semua arsip                     |
| Active     | Filter `status === "AKTIF"` + badge count |
| Inactive   | Filter `status === "INAKTIF"` + badge count |

---

## 9. Flow Export Arsip

```
User klik "Export" → pilih format
       │
  ┌────┴────┐
  │ CSV     │ JSON
  ▼         ▼
GET /api/archives/export?format=csv
GET /api/archives/export?format=json
       │
       ▼
 ┌─── Server ──────────────────────┐
 │ • Cek autentikasi                │
 │ • RBAC: USER hanya divisi sendiri│
 │ • Apply filter (division, status)│
 │ • Query semua arsip              │
 │ • Format output                  │
 └──────────────┬───────────────────┘
                │
                ▼
       Download file otomatis
```

### Input Query Export

| Parameter  | Tipe   | Keterangan                    |
|-----------|--------|-------------------------------|
| `format`  | string | `csv` atau `json`             |
| `division`| string | Filter opsional               |
| `status`  | string | `AKTIF` atau `INAKTIF`        |

### Output CSV

| Kolom           | Keterangan          |
|----------------|---------------------|
| No             | Nomor urut           |
| Nomor Arsip    | archiveNumber        |
| Judul          | title                |
| Nomor Surat    | letterNumber         |
| Tanggal        | date (format id-ID)  |
| Divisi         | division (label)     |
| Status         | AKTIF / INAKTIF      |
| Deskripsi      | description          |
| Dibuat Oleh    | user.name            |
| Tanggal Input  | createdAt (id-ID)    |

Nama file: `arsip-bapekom-YYYY-MM-DD.csv` atau `.json`

---

## 10. Flow Notifikasi

### Kapan Notifikasi Dibuat

```
┌───────────────────────────┬─────────────────────────────────────────┐
│ Event                     │ Penerima                                │
├───────────────────────────┼─────────────────────────────────────────┤
│ Arsip baru dibuat         │ 1. User pembuat                         │
│ (ARCHIVE_CREATED)         │ 2. Semua ADMIN & SUPER_ADMIN            │
├───────────────────────────┼─────────────────────────────────────────┤
│ Arsip diperbarui          │ Semua ADMIN & SUPER_ADMIN               │
│ (ARCHIVE_UPDATED)         │ (kecuali user yang mengupdate)          │
├───────────────────────────┼─────────────────────────────────────────┤
│ Arsip dihapus             │ Semua ADMIN & SUPER_ADMIN               │
│ (ARCHIVE_DELETED)         │ (kecuali user yang menghapus)           │
└───────────────────────────┴─────────────────────────────────────────┘
```

### API Notifikasi

#### GET /api/notifications

**Input Query:**

| Parameter    | Tipe    | Default | Keterangan                 |
|-------------|---------|---------|----------------------------|
| `limit`     | number  | `20`    | Jumlah notifikasi          |
| `unreadOnly`| boolean | `false` | Hanya yang belum dibaca    |

**Output:**

```json
{
  "notifications": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "type": "ARCHIVE_CREATED",
      "title": "Arsip Baru Dibuat",
      "message": "Arsip 'Surat Keputusan' berhasil dibuat.",
      "isRead": false,
      "link": "/archives/uuid",
      "createdAt": "2026-02-14T10:00:00.000Z"
    }
  ],
  "unreadCount": 3
}
```

#### PATCH /api/notifications

**Input Body:**

| Field            | Tipe    | Keterangan                          |
|-----------------|---------|-------------------------------------|
| `notificationId`| string  | ID notifikasi untuk ditandai dibaca |
| `markAllRead`   | boolean | Tandai semua sebagai dibaca          |

**Output:** `{ "success": true }`

---

## 11. Flow Manajemen User (Admin)

> Hanya **SUPER_ADMIN** yang bisa mengelola user.

### 11.1 Melihat Daftar User

```
SUPER_ADMIN akses /admin/users
       │
       ▼
 GET /api/users
       │
       ▼
 Output: daftar user + jumlah arsip masing-masing
```

**Output per user:**

```json
{
  "id": "uuid",
  "name": "Staff Keuangan",
  "email": "keuangan@bapekom.go.id",
  "role": "USER",
  "division": "KEUANGAN",
  "createdAt": "...",
  "_count": { "archives": 12 }
}
```

### 11.2 Membuat User Baru

```
POST /api/users
```

**Input:**

| Field      | Tipe   | Wajib | Validasi                                |
|-----------|--------|-------|-----------------------------------------|
| `name`    | string | ✅    | Tidak kosong                            |
| `email`   | string | ✅    | Format email valid, unik                |
| `password`| string | ✅    | Min 6 karakter                          |
| `role`    | enum   | ✅    | `SUPER_ADMIN`, `ADMIN`, `USER`          |
| `division`| enum   | ✅    | `KEUANGAN`, `PENYELENGGARA`, `TATA_USAHA`, `UMUM` |

**Output:** User object (201 Created)

### 11.3 Update User

```
PUT /api/users/[id]
```

**Input:** Sama seperti create, semua field opsional. Password opsional (min 6 karakter jika dikirim).

**Output:** Updated user object

### 11.4 Hapus User

```
DELETE /api/users/[id]
```

**Validasi:**
- Tidak bisa hapus diri sendiri
- Tidak bisa hapus jika user masih punya arsip

**Output:** `{ "message": "User deleted successfully" }`

---

## 12. Flow Profil Pengguna

### Melihat Profil

```
GET /api/profile
```

**Output:**

```json
{
  "id": "uuid",
  "name": "Staff Keuangan",
  "email": "keuangan@bapekom.go.id",
  "role": "USER",
  "division": "KEUANGAN",
  "profileImage": "data:image/jpeg;base64,...",
  "createdAt": "...",
  "_count": { "archives": 12 }
}
```

### Update Profil

```
PATCH /api/profile
```

**Input:**

| Field             | Tipe   | Validasi                                |
|------------------|--------|-----------------------------------------|
| `name`           | string | Tidak kosong                            |
| `email`          | string | Format email valid, unik                |
| `division`       | enum   | Validasi whitelist                      |
| `profileImage`   | string | Data URI `data:image/...`, max ~2MB     |
| `currentPassword`| string | Wajib jika ganti password               |
| `newPassword`    | string | Min 6 karakter                          |

**Output:** Updated user object

---

## 13. Flow Koneksi Storage (Google Drive / OneDrive)

### Google Drive

```
ADMIN klik "Connect Google Drive"
       │
       ▼
 GET /api/storage/connect-google
 → Return { url: "https://accounts.google.com/o/oauth2/..." }
       │
       ▼
 Redirect user ke Google OAuth
       │
       ▼
 User authorize → Google redirect ke callback
       │
       ▼
 GET /api/storage/connect-google?code=AUTH_CODE
       │
       ▼
 ┌─── Server ───────────────────────────┐
 │ • Exchange code → tokens              │
 │ • Nonaktifkan config Google lama      │
 │ • Simpan accessToken, refreshToken    │
 │ • Set isActive = true                 │
 └──────────────┬────────────────────────┘
                │
                ▼
 Redirect → /admin/storage?connected=google
```

### OneDrive

```
ADMIN klik "Connect OneDrive"
       │
       ▼
 GET /api/storage/connect-onedrive
 → Return { url: "https://login.microsoftonline.com/..." }
       │
       ▼
 User authorize di Microsoft
       │
       ▼
 POST /api/storage/connect-onedrive
 Body: { code: "AUTH_CODE" }
       │
       ▼
 ┌─── Server ───────────────────────────┐
 │ • Exchange code → tokens              │
 │ • Nonaktifkan config OneDrive lama    │
 │ • Simpan accessToken, refreshToken    │
 │ • Set isActive = true                 │
 └──────────────┬────────────────────────┘
                │
                ▼
 Output: { success: true }
```

### Hak Akses Koneksi Storage

| Role          | Boleh Connect Storage |
|--------------|----------------------|
| SUPER_ADMIN  | ✅                    |
| ADMIN        | ✅                    |
| USER         | ❌                    |

---

## 14. Flow RBAC (Role-Based Access Control)

### Matriks Hak Akses

| Aksi                    | SUPER_ADMIN | ADMIN | USER |
|------------------------|-------------|-------|------|
| Buat arsip              | ✅          | ✅    | ✅   |
| Lihat arsip semua divisi| ✅          | ✅    | ❌   |
| Lihat arsip divisi sendiri| ✅       | ✅    | ✅   |
| Edit arsip              | ✅          | ✅    | ❌   |
| Hapus arsip             | ✅          | ✅    | ❌   |
| Export arsip             | ✅          | ✅    | ✅ (divisi sendiri) |
| Manage users            | ✅          | ❌    | ❌   |
| Manage storage          | ✅          | ✅    | ❌   |
| Lihat dashboard         | ✅          | ✅    | ✅   |
| Edit profil sendiri     | ✅          | ✅    | ✅   |
| Terima notifikasi admin | ✅          | ✅    | ❌   |

### Fungsi RBAC di Kode

| Fungsi                  | Parameter                           | Return  | Keterangan                              |
|------------------------|-------------------------------------|---------|-----------------------------------------|
| `getCurrentUser()`     | -                                   | User    | Ambil user dari session                 |
| `canAccessDivision()`  | role, userDivision, targetDivision  | boolean | ADMIN+ akses semua, USER hanya divisi sendiri |
| `canManageUsers()`     | role                                | boolean | `SUPER_ADMIN` only                      |
| `canManageStorage()`   | role                                | boolean | `SUPER_ADMIN` atau `ADMIN`              |
| `canCreateArchive()`   | role                                | boolean | Selalu `true` (semua role)              |
| `canDeleteArchive()`   | role                                | boolean | `SUPER_ADMIN` atau `ADMIN`              |
| `canEditArchive()`     | role                                | boolean | `SUPER_ADMIN` atau `ADMIN`              |

---

## 15. Flow Rate Limiting

```
Request masuk
     │
     ▼
checkRateLimit(identifier, { maxRequests, windowSeconds })
     │
     ▼
Cek di memory store
     │
  ┌──┴──┐
  │ Baru│ Sudah ada
  │     │ entry
  ▼     ▼
Buat    Cek window expired?
entry   │
count=1 ├── Ya → Reset count=1
        └── Tidak → count + 1
              │
           ┌──┴──┐
           │ ≤ max│ > max
           ▼      ▼
        success  success=false
        =true    remaining=0
```

### Endpoint yang Di-rate-limit

| Endpoint          | Identifier          | Limit           | Window    |
|------------------|--------------------|-----------------|-----------| 
| Login             | `login:{email}`    | 5 request       | 60 detik  |
| Upload file       | `upload:{userId}`  | 10 request      | 60 detik  |

---

## 16. Ringkasan Semua API Endpoint

| Method   | Endpoint                          | Akses          | Input                                  | Output                              |
|----------|-----------------------------------|----------------|----------------------------------------|-------------------------------------|
| `POST`   | `/api/auth/[...nextauth]`         | Publik         | `{ email, password }`                  | JWT session cookie                  |
| `GET`    | `/api/archives`                   | Authenticated  | Query: division, status, search, page, limit, sortBy, sortOrder | `{ archives, pagination }` |
| `POST`   | `/api/archives`                   | Authenticated  | Body: archiveNumber, title, letterNumber, date, division, status, description, fileUrl, fileId | Archive object |
| `GET`    | `/api/archives/[id]`              | Authenticated  | URL param: id                          | Archive object + user               |
| `PUT`    | `/api/archives/[id]`              | ADMIN+         | Body: field updates (partial)          | Updated archive object              |
| `DELETE` | `/api/archives/[id]`              | ADMIN+         | URL param: id                          | `{ message }` / error               |
| `GET`    | `/api/archives/export`            | Authenticated  | Query: format, division, status        | CSV/JSON file download              |
| `POST`   | `/api/upload`                     | Authenticated  | FormData: file, division, year         | `{ fileId, fileUrl }`               |
| `GET`    | `/api/users`                      | SUPER_ADMIN    | -                                      | Array of users                      |
| `POST`   | `/api/users`                      | SUPER_ADMIN    | Body: name, email, password, role, division | User object                    |
| `PUT`    | `/api/users/[id]`                 | SUPER_ADMIN    | Body: partial user fields              | Updated user object                 |
| `DELETE` | `/api/users/[id]`                 | SUPER_ADMIN    | URL param: id                          | `{ message }` / error               |
| `GET`    | `/api/profile`                    | Authenticated  | -                                      | User profile + archive count        |
| `PATCH`  | `/api/profile`                    | Authenticated  | Body: name, email, division, profileImage, currentPassword, newPassword | Updated profile |
| `GET`    | `/api/notifications`              | Authenticated  | Query: limit, unreadOnly               | `{ notifications, unreadCount }`    |
| `PATCH`  | `/api/notifications`              | Authenticated  | Body: notificationId or markAllRead    | `{ success: true }`                |
| `GET`    | `/api/storage/info`               | Authenticated  | -                                      | Storage config + archive stats      |
| `GET`    | `/api/storage/connect-google`     | ADMIN+         | Query: code (callback)                 | `{ url }` atau redirect             |
| `GET`    | `/api/storage/connect-onedrive`   | ADMIN+         | -                                      | `{ url }`                           |
| `POST`   | `/api/storage/connect-onedrive`   | ADMIN+         | Body: `{ code }`                       | `{ success: true }`                |

---

## Akun Seed (Default)

| Role          | Email                        | Password   | Divisi      |
|--------------|------------------------------|------------|-------------|
| SUPER_ADMIN  | admin@bapekom.go.id          | admin123   | UMUM        |
| ADMIN        | pengelola@bapekom.go.id      | admin123   | KEUANGAN    |
| USER         | keuangan@bapekom.go.id       | admin123   | KEUANGAN    |
| USER         | penyelenggara@bapekom.go.id  | admin123   | PENYELENGGARA |
| USER         | tatausaha@bapekom.go.id      | admin123   | TATA_USAHA  |
| USER         | umum@bapekom.go.id           | admin123   | UMUM        |

---

## Database Schema

### Model User

| Field         | Tipe     | Keterangan                              |
|--------------|----------|-----------------------------------------|
| `id`         | UUID     | Primary key, auto-generate              |
| `name`       | String   | Nama lengkap                            |
| `email`      | String   | Unik                                    |
| `password`   | String   | Hashed (bcrypt, 12 rounds)              |
| `role`       | Enum     | `SUPER_ADMIN`, `ADMIN`, `USER`          |
| `division`   | Enum     | `KEUANGAN`, `PENYELENGGARA`, `TATA_USAHA`, `UMUM` |
| `profileImage`| Text    | Base64 data URI (opsional)              |
| `createdAt`  | DateTime | Auto                                    |

### Model Archive

| Field           | Tipe     | Keterangan                              |
|-----------------|----------|-----------------------------------------|
| `id`            | UUID     | Primary key                             |
| `archiveNumber` | String   | Nomor arsip                             |
| `title`         | String   | Judul arsip                             |
| `letterNumber`  | String   | Nomor surat                             |
| `date`          | DateTime | Tanggal surat                           |
| `division`      | Enum     | Divisi                                  |
| `status`        | Enum     | `AKTIF` (default), `INAKTIF`            |
| `description`   | String?  | Opsional                                |
| `fileUrl`       | String   | URL file di cloud storage               |
| `fileId`        | String   | ID file di cloud storage                |
| `createdBy`     | String   | FK ke User.id                           |
| `createdAt`     | DateTime | Auto                                    |
| `updatedAt`     | DateTime | Auto-update                             |

### Model Notification

| Field      | Tipe     | Keterangan                                      |
|-----------|----------|-------------------------------------------------|
| `id`      | UUID     | Primary key                                     |
| `userId`  | String   | FK ke User.id                                   |
| `type`    | String   | `ARCHIVE_CREATED`, `ARCHIVE_UPDATED`, `ARCHIVE_DELETED`, `INFO` |
| `title`   | String   | Judul notifikasi                                |
| `message` | String   | Isi pesan                                        |
| `isRead`  | Boolean  | Default `false`                                 |
| `link`    | String?  | Link terkait (opsional)                          |
| `createdAt`| DateTime| Auto                                            |

### Model StorageConfig

| Field         | Tipe      | Keterangan                        |
|--------------|-----------|-----------------------------------|
| `id`         | UUID      | Primary key                       |
| `provider`   | String    | `google` atau `onedrive`          |
| `accessToken`| String    | OAuth access token                |
| `refreshToken`| String   | OAuth refresh token               |
| `expiresAt`  | DateTime? | Kapan token expired               |
| `isActive`   | Boolean   | Hanya 1 yang aktif per provider   |
| `createdAt`  | DateTime  | Auto                              |
| `updatedAt`  | DateTime  | Auto-update                       |

---

*Dokumen ini dibuat otomatis berdasarkan analisis kode sumber Arsip Bapekom.*
