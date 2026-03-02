# 📊 Flow Diagram — Sistem Arsip Bapekom

> Dokumen ini berisi visualisasi alur kerja (flow diagram) dari seluruh fitur aplikasi **Arsip Bapekom** menggunakan diagram Mermaid.

---

## Daftar Isi

1. [Arsitektur Sistem (Overview)](#1-arsitektur-sistem-overview)
2. [Flow Login & Autentikasi](#2-flow-login--autentikasi)
3. [Flow Middleware & Proteksi Route](#3-flow-middleware--proteksi-route)
4. [Flow Dashboard](#4-flow-dashboard)
5. [Flow CRUD Arsip](#5-flow-crud-arsip)
   - 5.1 [Tambah Arsip Baru](#51-tambah-arsip-baru)
   - 5.2 [Lihat Daftar Arsip](#52-lihat-daftar-arsip)
   - 5.3 [Detail & Edit Arsip](#53-detail--edit-arsip)
   - 5.4 [Hapus Arsip](#54-hapus-arsip)
6. [Flow Upload File ke Cloud](#6-flow-upload-file-ke-cloud)
7. [Flow Struktur Folder Cloud](#7-flow-struktur-folder-cloud)
8. [Flow Browse Arsip (Folder View)](#8-flow-browse-arsip-folder-view)
9. [Flow Filter & Pencarian](#9-flow-filter--pencarian)
10. [Flow Export Arsip](#10-flow-export-arsip)
11. [Flow Notifikasi](#11-flow-notifikasi)
12. [Flow Manajemen User](#12-flow-manajemen-user)
13. [Flow Profil Pengguna](#13-flow-profil-pengguna)
14. [Flow Koneksi Storage](#14-flow-koneksi-storage)
15. [Flow RBAC (Hak Akses)](#15-flow-rbac-hak-akses)
16. [Flow Rate Limiting](#16-flow-rate-limiting)
17. [Ringkasan Seluruh API](#17-ringkasan-seluruh-api)

---

## 1. Arsitektur Sistem (Overview)

```mermaid
graph TB
    subgraph CLIENT["🖥️ Browser / Client"]
        A[Pengguna]
    end

    subgraph NEXTJS["⚡ Next.js App (Frontend + Backend)"]
        B["Halaman Web<br/>(React + Tailwind CSS)"]
        C["API Routes<br/>(/api/...)"]
        D["Middleware<br/>(Proteksi Route)"]
        E["NextAuth.js<br/>(Autentikasi JWT)"]
    end

    subgraph DATABASE["🗄️ Database"]
        F["PostgreSQL<br/>(Prisma ORM)"]
    end

    subgraph CLOUD["☁️ Cloud Storage"]
        G["Google Drive API"]
        H["OneDrive Graph API"]
    end

    A -->|Akses Web| B
    B -->|Request Data| C
    A -->|Setiap Request| D
    D -->|Cek Session| E
    C -->|Query/Simpan| F
    C -->|Upload File| G
    C -->|Upload File| H
    E -->|Validasi User| F

    style CLIENT fill:#e3f2fd,stroke:#1565c0,color:#000
    style NEXTJS fill:#fff3e0,stroke:#e65100,color:#000
    style DATABASE fill:#e8f5e9,stroke:#2e7d32,color:#000
    style CLOUD fill:#f3e5f5,stroke:#6a1b9a,color:#000
```

---

## 2. Flow Login & Autentikasi

```mermaid
flowchart TD
    A([🧑 Pengguna buka<br/>halaman Login]) --> B[Isi Email & Password]
    B --> C{Sudah punya<br/>session/cookie?}
    C -->|Ya| D[↗️ Redirect ke Dashboard]
    C -->|Tidak| E["Klik tombol 'Masuk'"]
    E --> F["POST /api/auth/[...nextauth]"]
    F --> G{Rate Limit<br/>5x / 60 detik}
    G -->|Melebihi batas| H[❌ Tampilkan error<br/>'Terlalu banyak percobaan']
    G -->|OK| I[Cari user di Database<br/>berdasarkan email]
    I --> J{User ditemukan?}
    J -->|Tidak| K[❌ Error:<br/>'Email/password salah']
    J -->|Ya| L["Bandingkan password<br/>(bcrypt.compare)"]
    L --> M{Password cocok?}
    M -->|Tidak| K
    M -->|Ya| N["✅ Buat JWT Token<br/>berisi: id, name, email,<br/>role, division"]
    N --> O["Set Cookie Session<br/>(HTTP-only)"]
    O --> D

    style A fill:#e3f2fd,stroke:#1565c0,color:#000
    style D fill:#c8e6c9,stroke:#2e7d32,color:#000
    style H fill:#ffcdd2,stroke:#c62828,color:#000
    style K fill:#ffcdd2,stroke:#c62828,color:#000
    style N fill:#c8e6c9,stroke:#2e7d32,color:#000
```

### Data di Dalam JWT Token

```mermaid
graph LR
    subgraph JWT["🔑 JWT Token (Session)"]
        A["id: uuid"]
        B["name: 'Staff Keuangan'"]
        C["email: 'keuangan@bapekom.go.id'"]
        D["role: USER"]
        E["division: KEUANGAN"]
    end

    style JWT fill:#fff9c4,stroke:#f9a825,color:#000
```

---

## 3. Flow Middleware & Proteksi Route

```mermaid
flowchart TD
    A([📨 Request masuk<br/>ke halaman apapun]) --> B{Halaman apa?}
    
    B -->|"/login"| C{Sudah login?}
    C -->|Ya| D[↗️ Redirect ke /dashboard]
    C -->|Tidak| E[✅ Tampilkan halaman login]

    B -->|"/" root| F[↗️ Redirect ke /dashboard]

    B -->|"/dashboard, /archives,<br/>/profile, dll"| G{Sudah login?}
    G -->|Tidak| H["↗️ Redirect ke /login<br/>(simpan URL tujuan)"]
    G -->|Ya| I{Cek role<br/>untuk halaman ini}
    
    I -->|"/admin/*"| J{Role = SUPER_ADMIN<br/>atau ADMIN?}
    J -->|Tidak| K[↗️ Redirect ke /dashboard<br/>⚠️ Tidak punya akses]
    J -->|Ya| L[✅ Lanjutkan]

    I -->|Halaman umum| L

    B -->|"/api/*"| M[✅ Lewatkan<br/>API handle sendiri]

    style A fill:#e3f2fd,stroke:#1565c0,color:#000
    style D fill:#fff9c4,stroke:#f9a825,color:#000
    style E fill:#c8e6c9,stroke:#2e7d32,color:#000
    style F fill:#fff9c4,stroke:#f9a825,color:#000
    style H fill:#ffcdd2,stroke:#c62828,color:#000
    style K fill:#ffcdd2,stroke:#c62828,color:#000
    style L fill:#c8e6c9,stroke:#2e7d32,color:#000
    style M fill:#c8e6c9,stroke:#2e7d32,color:#000
```

### Tabel Proteksi Route

```mermaid
graph TD
    subgraph ROUTES["🗺️ Peta Proteksi Halaman"]
        direction LR
        subgraph PUBLIC["🌍 Publik"]
            R1["/login"]
        end
        subgraph AUTH["🔒 Perlu Login"]
            R2["/dashboard"]
            R3["/archives"]
            R4["/archives/create"]
            R5["/archives/browse"]
            R6["/profile"]
            R7["/analytics"]
        end
        subgraph ADMIN["🛡️ Admin & Super Admin"]
            R8["/admin/users"]
            R9["/admin/storage"]
            R10["/admin/roles"]
            R11["/admin/activity"]
        end
    end

    style PUBLIC fill:#e8f5e9,stroke:#2e7d32,color:#000
    style AUTH fill:#fff3e0,stroke:#e65100,color:#000
    style ADMIN fill:#fce4ec,stroke:#c62828,color:#000
```

---

## 4. Flow Dashboard

```mermaid
flowchart TD
    A([👤 User buka Dashboard]) --> B["Muat 8 query data<br/>secara PARALEL"]
    
    B --> C1["📊 Total Arsip"]
    B --> C2["📗 Arsip Aktif"]
    B --> C3["📕 Arsip Inaktif"]
    B --> C4["📅 Arsip Bulan Ini"]
    B --> C5["📁 Per Divisi:<br/>Keuangan"]
    B --> C6["📁 Per Divisi:<br/>Penyelenggara"]
    B --> C7["📁 Per Divisi:<br/>Tata Usaha"]
    B --> C8["📁 Per Divisi:<br/>Umum"]

    C1 & C2 & C3 & C4 & C5 & C6 & C7 & C8 --> D{Role user?}

    D -->|USER| E["Filter: hanya data<br/>divisi sendiri"]
    D -->|ADMIN / SUPER_ADMIN| F["Tampilkan: semua<br/>data divisi"]

    E --> G["🎯 Tampilkan Dashboard<br/>Cards + Grafik"]
    F --> G

    style A fill:#e3f2fd,stroke:#1565c0,color:#000
    style G fill:#c8e6c9,stroke:#2e7d32,color:#000
```

---

## 5. Flow CRUD Arsip

### 5.1 Tambah Arsip Baru

```mermaid
flowchart TD
    A([📝 User buka<br/>/archives/create]) --> B["Isi form arsip:<br/>Nomor, Judul, No. Surat,<br/>Tanggal, Divisi, Status,<br/>Deskripsi"]
    B --> C{Lampirkan file?}
    
    C -->|Ya| D["Pilih file<br/>(max 10MB)"]
    D --> E["Upload ke Cloud<br/>(Google Drive / OneDrive)"]
    E --> F["Dapatkan fileId<br/>& fileUrl"]
    
    C -->|Tidak| G["fileUrl & fileId<br/>= kosong"]
    
    F --> H["POST /api/archives"]
    G --> H

    H --> I{Validasi server}
    I -->|Gagal| J["❌ Tampilkan error"]
    I -->|Berhasil| K["💾 Simpan ke Database"]
    
    K --> L["📨 Kirim Notifikasi ke:<br/>1. User pembuat<br/>2. Semua Admin & Super Admin"]
    L --> M["✅ Redirect ke<br/>/archives<br/>+ Toast sukses"]

    style A fill:#e3f2fd,stroke:#1565c0,color:#000
    style J fill:#ffcdd2,stroke:#c62828,color:#000
    style M fill:#c8e6c9,stroke:#2e7d32,color:#000
```

### 5.2 Lihat Daftar Arsip

```mermaid
flowchart TD
    A([📋 User buka /archives]) --> B["GET /api/archives<br/>+ query params"]
    B --> C{Role user?}
    
    C -->|USER| D["Filter: hanya arsip<br/>divisi sendiri"]
    C -->|ADMIN / SUPER_ADMIN| E["Tampilkan: semua arsip"]

    D --> F["Return data arsip<br/>+ info pagination"]
    E --> F

    F --> G["Tampilkan tabel arsip<br/>dengan kolom:"]
    
    G --> H["No | Nomor Arsip | Judul<br/>No. Surat | Tanggal | Divisi<br/>Status | Pembuat | Aksi"]

    H --> I["🔍 Fitur filter & search<br/>(lihat Flow #9)"]

    style A fill:#e3f2fd,stroke:#1565c0,color:#000
    style G fill:#c8e6c9,stroke:#2e7d32,color:#000
```

### 5.3 Detail & Edit Arsip

```mermaid
flowchart TD
    A([👁️ Klik detail arsip]) --> B["GET /api/archives/:id"]
    B --> C{Arsip ditemukan?}
    C -->|Tidak| D["❌ 404 Not Found"]
    C -->|Ya| E[Tampilkan detail arsip]
    
    E --> F{User klik Edit?}
    F -->|Tidak| G[Selesai melihat]
    F -->|Ya| H{Cek hak akses}
    
    H -->|USER| I["❌ Tidak bisa edit<br/>(hanya ADMIN+)"]
    H -->|ADMIN / SUPER_ADMIN| J["Buka form edit<br/>/archives/:id/edit"]
    
    J --> K["Ubah field yang diinginkan"]
    K --> L["PUT /api/archives/:id"]
    L --> M{Validasi server}
    M -->|Gagal| N["❌ Tampilkan error"]
    M -->|Berhasil| O["💾 Update Database"]
    O --> P["📨 Notifikasi ke Admin<br/>(kecuali diri sendiri)"]
    P --> Q["✅ Redirect + Toast sukses"]

    style A fill:#e3f2fd,stroke:#1565c0,color:#000
    style D fill:#ffcdd2,stroke:#c62828,color:#000
    style I fill:#ffcdd2,stroke:#c62828,color:#000
    style N fill:#ffcdd2,stroke:#c62828,color:#000
    style Q fill:#c8e6c9,stroke:#2e7d32,color:#000
```

### 5.4 Hapus Arsip

```mermaid
flowchart TD
    A([🗑️ Klik tombol Hapus]) --> B{Role user?}
    B -->|USER| C["❌ Tidak bisa hapus<br/>(tombol tidak muncul)"]
    B -->|ADMIN / SUPER_ADMIN| D["Muncul dialog konfirmasi:<br/>'Yakin ingin menghapus?'"]
    
    D --> E{Konfirmasi?}
    E -->|Batal| F[Kembali]
    E -->|Ya, Hapus| G["DELETE /api/archives/:id"]
    
    G --> H["🗑️ Hapus dari Database"]
    H --> I["📨 Notifikasi ke Admin<br/>(kecuali diri sendiri)"]
    I --> J["✅ Refresh tabel<br/>+ Toast sukses"]

    style A fill:#e3f2fd,stroke:#1565c0,color:#000
    style C fill:#ffcdd2,stroke:#c62828,color:#000
    style J fill:#c8e6c9,stroke:#2e7d32,color:#000
```

---

## 6. Flow Upload File ke Cloud

```mermaid
flowchart TD
    A([📎 User pilih file<br/>di form arsip]) --> B["POST /api/upload<br/>FormData: file, division, year"]
    
    B --> V1{1. Autentikasi?}
    V1 -->|Tidak| X1["❌ 401 Unauthorized"]
    V1 -->|Ya| V2{2. Rate limit OK?<br/>max 10x / 60 detik}
    V2 -->|Melebihi| X2["❌ 429 Too Many Requests"]
    V2 -->|OK| V3{3. File ada?}
    V3 -->|Tidak| X3["❌ 400 Bad Request"]
    V3 -->|Ya| V4{"4. Ukuran ≤ 10MB?"}
    V4 -->|Tidak| X4["❌ 400 File terlalu besar"]
    V4 -->|Ya| V5{5. Tipe file valid?}
    V5 -->|Tidak| X5["❌ 400 Tipe tidak didukung"]
    V5 -->|Ya| V6["6. Sanitasi nama file<br/>(cegah path traversal)"]
    
    V6 --> S{Deteksi storage aktif<br/>dari StorageConfig}
    
    S -->|Google Drive| G["uploadToDrive()"]
    S -->|OneDrive| O["uploadToOneDrive()"]
    S -->|Tidak ada| X6["❌ Belum ada storage<br/>yang terhubung"]

    G --> R["✅ Return:<br/>{ fileId, fileUrl }"]
    O --> R

    style A fill:#e3f2fd,stroke:#1565c0,color:#000
    style X1 fill:#ffcdd2,stroke:#c62828,color:#000
    style X2 fill:#ffcdd2,stroke:#c62828,color:#000
    style X3 fill:#ffcdd2,stroke:#c62828,color:#000
    style X4 fill:#ffcdd2,stroke:#c62828,color:#000
    style X5 fill:#ffcdd2,stroke:#c62828,color:#000
    style X6 fill:#ffcdd2,stroke:#c62828,color:#000
    style R fill:#c8e6c9,stroke:#2e7d32,color:#000
```

### Tipe File yang Didukung

```mermaid
graph LR
    subgraph FILETYPES["📁 Format File yang Diterima"]
        direction TB
        F1["📄 PDF"]
        F2["📝 Word<br/>.doc / .docx"]
        F3["📊 Excel<br/>.xls / .xlsx"]
        F4["📽️ PowerPoint<br/>.ppt / .pptx"]
        F5["🖼️ Gambar<br/>.jpg / .png / .webp"]
    end

    style FILETYPES fill:#e8eaf6,stroke:#283593,color:#000
```

---

## 7. Flow Struktur Folder Cloud

```mermaid
graph TD
    subgraph GDRIVE["☁️ Google Drive / OneDrive"]
        ROOT["📁 Root Arsip"]
        ROOT --> D1["📁 Divisi Keuangan"]
        ROOT --> D2["📁 Divisi Penyelenggara"]
        ROOT --> D3["📁 Divisi Tata Usaha"]
        ROOT --> D4["📁 Divisi Umum"]
        
        D1 --> Y1["📁 2024"]
        D1 --> Y2["📁 2025"]
        D1 --> Y3["📁 2026"]
        
        Y3 --> F1["📄 surat_keputusan.pdf"]
        Y3 --> F2["📄 laporan_keuangan.xlsx"]
        Y2 --> F3["📄 rekapitulasi.docx"]
        
        D2 --> Y4["📁 2026"]
        Y4 --> F4["📄 laporan_kegiatan.pdf"]
        
        D3 --> Y5["📁 2026"]
        Y5 --> F5["📄 memo_internal.pdf"]
        
        D4 --> Y6["📁 2026"]
        Y6 --> F6["📄 pengumuman.docx"]
    end

    style GDRIVE fill:#e8f5e9,stroke:#2e7d32,color:#000
    style ROOT fill:#fff9c4,stroke:#f9a825,color:#000
```

### Proses Pembuatan Folder Otomatis

```mermaid
flowchart TD
    A([📎 Upload file]) --> B["getOrCreateRootFolder<br/>('Root Arsip')"]
    B --> C{Folder root<br/>sudah ada?}
    C -->|Ya| D[Gunakan folder yang ada]
    C -->|Tidak| E["Buat folder baru<br/>'Root Arsip'"]
    
    D & E --> F["getOrCreateDivisionFolder<br/>('Divisi Keuangan')"]
    F --> G{Folder divisi<br/>sudah ada?}
    G -->|Ya| H[Gunakan yang ada]
    G -->|Tidak| I[Buat folder divisi baru]
    
    H & I --> J["getOrCreateYearFolder<br/>('2026')"]
    J --> K{Folder tahun<br/>sudah ada?}
    K -->|Ya| L[Gunakan yang ada]
    K -->|Tidak| M[Buat folder tahun baru]
    
    L & M --> N["📤 Upload file ke<br/>folder tahun"]
    N --> O["🔗 Set permission:<br/>anyone with link = view"]
    O --> P["✅ Return { fileId, fileUrl }"]

    style A fill:#e3f2fd,stroke:#1565c0,color:#000
    style P fill:#c8e6c9,stroke:#2e7d32,color:#000
```

---

## 8. Flow Browse Arsip (Folder View)

```mermaid
flowchart TD
    A([📂 User buka<br/>/archives/browse]) --> B["GET /api/archives<br/>(limit=500)"]
    B --> C["Tampilkan Level 1:<br/>STATUS FOLDER"]
    
    C --> D["📂 Active Archives<br/>(N arsip)"]
    C --> E["📂 Inactive Archives<br/>(N arsip)"]
    
    D & E -->|Klik| F["Tampilkan Level 2:<br/>FOLDER DIVISI"]
    
    F --> G1["📂 Keuangan (N)"]
    F --> G2["📂 Penyelenggara (N)"]
    F --> G3["📂 Tata Usaha (N)"]
    F --> G4["📂 Umum (N)"]
    
    G1 & G2 & G3 & G4 -->|Klik| H["Tampilkan Level 3:<br/>FOLDER TAHUN"]
    
    H --> I1["📂 2026 (N)"]
    H --> I2["📂 2025 (N)"]
    H --> I3["📂 2024 (N)"]
    
    I1 & I2 & I3 -->|Klik| J["Tampilkan Level 4:<br/>DAFTAR ARSIP"]
    
    J --> K1["📄 Surat Keputusan - ARK-001"]
    J --> K2["📄 Laporan Keuangan - ARK-002"]
    J --> K3["📄 ... (view, edit, download)"]

    style A fill:#e3f2fd,stroke:#1565c0,color:#000
    style C fill:#fff3e0,stroke:#e65100,color:#000
    style F fill:#e8f5e9,stroke:#2e7d32,color:#000
    style H fill:#e8eaf6,stroke:#283593,color:#000
    style J fill:#fce4ec,stroke:#c62828,color:#000
```

### Navigasi Breadcrumb

```mermaid
graph LR
    B1["🏠 Archives"] -->|>| B2["Active"]
    B2 -->|>| B3["Keuangan"]
    B3 -->|>| B4["2026"]

    style B1 fill:#e3f2fd,stroke:#1565c0,color:#000
    style B2 fill:#e8f5e9,stroke:#2e7d32,color:#000
    style B3 fill:#fff3e0,stroke:#e65100,color:#000
    style B4 fill:#fce4ec,stroke:#c62828,color:#000
```

---

## 9. Flow Filter & Pencarian

```mermaid
flowchart TD
    A([🔍 User di halaman /archives]) --> B["Toolbar Filter"]
    
    B --> C1["🔍 Search Box<br/>(cari di semua kolom)"]
    B --> C2["📁 Dropdown Divisi<br/>Keuangan / Penyelenggara /<br/>Tata Usaha / Umum"]
    B --> C3["📊 Dropdown Status<br/>Aktif / Inaktif"]
    B --> C4["📅 Dropdown Tahun<br/>(auto-detect dari data)"]
    B --> C5["📆 Date Range<br/>Dari tanggal __ s/d __"]
    
    C1 & C2 & C3 & C4 & C5 --> D["Filter diterapkan<br/>(client-side)"]
    D --> E["Tabel diperbarui<br/>secara real-time"]
    
    E --> F["Tab Status:"]
    F --> F1["All (semua arsip)"]
    F --> F2["Active (badge count)"]
    F --> F3["Inactive (badge count)"]
    
    B --> G["🔄 Reset All<br/>(hapus semua filter)"]

    style A fill:#e3f2fd,stroke:#1565c0,color:#000
    style E fill:#c8e6c9,stroke:#2e7d32,color:#000
```

---

## 10. Flow Export Arsip

```mermaid
flowchart TD
    A([📥 User klik Export]) --> B{Pilih format}
    
    B -->|CSV| C["GET /api/archives/export<br/>?format=csv"]
    B -->|JSON| D["GET /api/archives/export<br/>?format=json"]
    
    C & D --> E{Cek autentikasi}
    E -->|Tidak login| F["❌ 401 Unauthorized"]
    E -->|Login| G{Cek role}
    
    G -->|USER| H["Filter: hanya arsip<br/>divisi sendiri"]
    G -->|ADMIN / SUPER_ADMIN| I["Ambil: semua arsip<br/>(+ filter opsional)"]
    
    H & I --> J["Format data"]
    J --> K["📥 Download otomatis:<br/>arsip-bapekom-YYYY-MM-DD.csv<br/>atau .json"]

    style A fill:#e3f2fd,stroke:#1565c0,color:#000
    style F fill:#ffcdd2,stroke:#c62828,color:#000
    style K fill:#c8e6c9,stroke:#2e7d32,color:#000
```

### Kolom CSV Export

```mermaid
graph LR
    subgraph CSV["📊 Kolom File CSV"]
        direction TB
        K1["No"]
        K2["Nomor Arsip"]
        K3["Judul"]
        K4["Nomor Surat"]
        K5["Tanggal"]
        K6["Divisi"]
        K7["Status"]
        K8["Deskripsi"]
        K9["Dibuat Oleh"]
        K10["Tanggal Input"]
    end

    style CSV fill:#e8eaf6,stroke:#283593,color:#000
```

---

## 11. Flow Notifikasi

```mermaid
flowchart TD
    subgraph TRIGGER["⚡ Event Pemicu"]
        T1["Arsip Baru Dibuat<br/>(ARCHIVE_CREATED)"]
        T2["Arsip Diperbarui<br/>(ARCHIVE_UPDATED)"]
        T3["Arsip Dihapus<br/>(ARCHIVE_DELETED)"]
    end

    T1 --> R1["📨 Kirim ke:<br/>• User pembuat<br/>• Semua Admin & Super Admin"]
    T2 --> R2["📨 Kirim ke:<br/>• Semua Admin & Super Admin<br/>(kecuali yang mengupdate)"]
    T3 --> R3["📨 Kirim ke:<br/>• Semua Admin & Super Admin<br/>(kecuali yang menghapus)"]
    
    R1 & R2 & R3 --> DB["💾 Simpan ke tabel<br/>Notification di Database"]
    
    DB --> UI["🔔 Muncul di dropdown<br/>notifikasi (lonceng)"]
    
    UI --> ACT{Aksi user}
    ACT --> A1["Tandai 1 dibaca<br/>(PATCH notificationId)"]
    ACT --> A2["Tandai semua dibaca<br/>(PATCH markAllRead)"]
    ACT --> A3["Klik notifikasi<br/>→ buka link terkait"]

    style TRIGGER fill:#fff3e0,stroke:#e65100,color:#000
    style DB fill:#e8f5e9,stroke:#2e7d32,color:#000
    style UI fill:#e3f2fd,stroke:#1565c0,color:#000
```

---

## 12. Flow Manajemen User

> Hanya **SUPER_ADMIN** yang bisa mengelola user.

```mermaid
flowchart TD
    A([🛡️ Super Admin buka<br/>/admin/users]) --> B{Role = SUPER_ADMIN?}
    B -->|Tidak| C["❌ Redirect ke Dashboard<br/>Tidak punya akses"]
    B -->|Ya| D["GET /api/users<br/>Tampilkan daftar user"]
    
    D --> E{Aksi yang dipilih}
    
    E -->|Tambah User| F["Isi form:<br/>Nama, Email, Password,<br/>Role, Divisi"]
    F --> G["POST /api/users"]
    G --> H{Validasi}
    H -->|Email sudah ada| I["❌ Error: Email duplikat"]
    H -->|OK| J["✅ User baru dibuat"]
    
    E -->|Edit User| K["Ubah field yang diinginkan"]
    K --> L["PUT /api/users/:id"]
    L --> M["✅ User diperbarui"]
    
    E -->|Hapus User| N{Validasi hapus}
    N -->|Hapus diri sendiri| O["❌ Tidak bisa<br/>hapus diri sendiri"]
    N -->|Masih punya arsip| P["❌ Tidak bisa hapus<br/>user yang punya arsip"]
    N -->|OK| Q["DELETE /api/users/:id"]
    Q --> R["✅ User dihapus"]

    style A fill:#e3f2fd,stroke:#1565c0,color:#000
    style C fill:#ffcdd2,stroke:#c62828,color:#000
    style I fill:#ffcdd2,stroke:#c62828,color:#000
    style J fill:#c8e6c9,stroke:#2e7d32,color:#000
    style M fill:#c8e6c9,stroke:#2e7d32,color:#000
    style O fill:#ffcdd2,stroke:#c62828,color:#000
    style P fill:#ffcdd2,stroke:#c62828,color:#000
    style R fill:#c8e6c9,stroke:#2e7d32,color:#000
```

---

## 13. Flow Profil Pengguna

```mermaid
flowchart TD
    A([👤 User buka /profile]) --> B["GET /api/profile"]
    B --> C["Tampilkan profil:<br/>Nama, Email, Role, Divisi,<br/>Foto, Jumlah Arsip, Tanggal Daftar"]
    
    C --> D{User ingin update?}
    D -->|Tidak| E[Selesai]
    D -->|Ya| F["Ubah field:<br/>Nama / Email / Divisi /<br/>Foto Profil / Password"]
    
    F --> G{Ganti password?}
    G -->|Ya| H["Wajib isi:<br/>Password lama + Password baru<br/>(min 6 karakter)"]
    G -->|Tidak| I[Lanjut]
    
    H & I --> J["PATCH /api/profile"]
    J --> K{Validasi}
    K -->|Password lama salah| L["❌ Error"]
    K -->|Email sudah dipakai| M["❌ Error: Email duplikat"]
    K -->|OK| N["✅ Profil diperbarui"]

    style A fill:#e3f2fd,stroke:#1565c0,color:#000
    style L fill:#ffcdd2,stroke:#c62828,color:#000
    style M fill:#ffcdd2,stroke:#c62828,color:#000
    style N fill:#c8e6c9,stroke:#2e7d32,color:#000
```

---

## 14. Flow Koneksi Storage

### 14.1 Koneksi Google Drive

```mermaid
flowchart TD
    A([🔗 Admin klik<br/>'Connect Google Drive']) --> B["GET /api/storage/connect-google"]
    B --> C["Server buat URL OAuth Google"]
    C --> D["↗️ Redirect ke<br/>accounts.google.com"]
    D --> E["👤 User login & izinkan<br/>akses ke Google Drive"]
    E --> F["Google redirect balik<br/>dengan AUTH_CODE"]
    F --> G["GET /api/storage/connect-google<br/>?code=AUTH_CODE"]
    G --> H["Exchange code → tokens<br/>(accessToken + refreshToken)"]
    H --> I["Nonaktifkan config<br/>Google Drive lama"]
    I --> J["💾 Simpan token baru<br/>isActive = true"]
    J --> K["↗️ Redirect ke<br/>/admin/storage?connected=google"]
    K --> L["✅ Google Drive terhubung!"]

    style A fill:#e3f2fd,stroke:#1565c0,color:#000
    style D fill:#fff9c4,stroke:#f9a825,color:#000
    style L fill:#c8e6c9,stroke:#2e7d32,color:#000
```

### 14.2 Koneksi OneDrive

```mermaid
flowchart TD
    A([🔗 Admin klik<br/>'Connect OneDrive']) --> B["GET /api/storage/connect-onedrive"]
    B --> C["Server buat URL OAuth Microsoft"]
    C --> D["↗️ Redirect ke<br/>login.microsoftonline.com"]
    D --> E["👤 User login & izinkan<br/>akses ke OneDrive"]
    E --> F["Microsoft return<br/>AUTH_CODE"]
    F --> G["POST /api/storage/connect-onedrive<br/>Body: { code: AUTH_CODE }"]
    G --> H["Exchange code → tokens"]
    H --> I["Nonaktifkan config<br/>OneDrive lama"]
    I --> J["💾 Simpan token baru<br/>isActive = true"]
    J --> K["✅ OneDrive terhubung!"]

    style A fill:#e3f2fd,stroke:#1565c0,color:#000
    style D fill:#fff9c4,stroke:#f9a825,color:#000
    style K fill:#c8e6c9,stroke:#2e7d32,color:#000
```

---

## 15. Flow RBAC (Hak Akses)

### Matriks Hak Akses per Role

```mermaid
graph TD
    subgraph ROLES["👥 Tiga Level Pengguna"]
        direction LR
        
        subgraph SA["🔴 SUPER ADMIN<br/>(Pimpinan)"]
            SA1["✅ Semua fitur"]
            SA2["✅ Kelola user"]
            SA3["✅ Kelola storage"]
            SA4["✅ Semua divisi"]
        end
        
        subgraph AD["🟡 ADMIN<br/>(Pengelola)"]
            AD1["✅ CRUD arsip semua divisi"]
            AD2["❌ Tidak bisa kelola user"]
            AD3["✅ Kelola storage"]
            AD4["✅ Terima notifikasi admin"]
        end
        
        subgraph US["🟢 USER<br/>(Staff)"]
            US1["✅ Buat arsip"]
            US2["❌ Tidak bisa edit/hapus"]
            US3["👁️ Hanya divisi sendiri"]
            US4["✅ Export divisi sendiri"]
        end
    end

    style SA fill:#ffcdd2,stroke:#c62828,color:#000
    style AD fill:#fff9c4,stroke:#f9a825,color:#000
    style US fill:#c8e6c9,stroke:#2e7d32,color:#000
```

### Detail Akses per Fitur

```mermaid
flowchart LR
    subgraph FITUR["Fitur"]
        F1["Buat Arsip"]
        F2["Lihat Semua Divisi"]
        F3["Lihat Divisi Sendiri"]
        F4["Edit Arsip"]
        F5["Hapus Arsip"]
        F6["Export"]
        F7["Kelola User"]
        F8["Kelola Storage"]
        F9["Dashboard"]
        F10["Edit Profil"]
    end
    
    subgraph ACCESS["Akses"]
        A1["Semua Role ✅"]
        A2["ADMIN + SUPER_ADMIN"]
        A3["Semua Role ✅"]
        A4["ADMIN + SUPER_ADMIN"]
        A5["ADMIN + SUPER_ADMIN"]
        A6["Semua (USER=divisi sendiri)"]
        A7["SUPER_ADMIN saja"]
        A8["ADMIN + SUPER_ADMIN"]
        A9["Semua Role ✅"]
        A10["Semua Role ✅"]
    end
    
    F1 --- A1
    F2 --- A2
    F3 --- A3
    F4 --- A4
    F5 --- A5
    F6 --- A6
    F7 --- A7
    F8 --- A8
    F9 --- A9
    F10 --- A10
```

---

## 16. Flow Rate Limiting

```mermaid
flowchart TD
    A([📨 Request masuk]) --> B["checkRateLimit<br/>(identifier, maxRequests,<br/>windowSeconds)"]
    B --> C{Entry ada<br/>di memory?}
    
    C -->|Tidak / Baru| D["Buat entry baru<br/>count = 1"]
    C -->|Sudah ada| E{Window waktu<br/>sudah expired?}
    
    E -->|Ya, expired| F["Reset count = 1<br/>Window baru dimulai"]
    E -->|Belum expired| G["count = count + 1"]
    
    G --> H{count > maxRequests?}
    H -->|Tidak| I["✅ Request diizinkan<br/>remaining = max - count"]
    H -->|Ya, melebihi| J["❌ 429 Too Many Requests<br/>remaining = 0"]
    
    D --> I
    F --> I

    style A fill:#e3f2fd,stroke:#1565c0,color:#000
    style I fill:#c8e6c9,stroke:#2e7d32,color:#000
    style J fill:#ffcdd2,stroke:#c62828,color:#000
```

### Endpoint yang Dilindungi Rate Limit

```mermaid
graph LR
    subgraph RL["🛡️ Rate Limit"]
        direction TB
        subgraph LOGIN["Login"]
            L1["Identifier: login:email"]
            L2["Limit: 5 request"]
            L3["Window: 60 detik"]
        end
        subgraph UPLOAD["Upload File"]
            U1["Identifier: upload:userId"]
            U2["Limit: 10 request"]
            U3["Window: 60 detik"]
        end
    end

    style LOGIN fill:#fff3e0,stroke:#e65100,color:#000
    style UPLOAD fill:#e8eaf6,stroke:#283593,color:#000
```

---

## 17. Ringkasan Seluruh API

```mermaid
graph TD
    subgraph API["🌐 API Endpoints"]
        direction TB
        
        subgraph AUTH_API["🔐 Autentikasi"]
            E1["POST /api/auth/[...nextauth]<br/>Login & Session"]
        end
        
        subgraph ARCHIVE_API["📁 Arsip"]
            E2["GET /api/archives → Daftar arsip"]
            E3["POST /api/archives → Buat arsip baru"]
            E4["GET /api/archives/:id → Detail arsip"]
            E5["PUT /api/archives/:id → Update arsip"]
            E6["DELETE /api/archives/:id → Hapus arsip"]
            E7["GET /api/archives/export → Export CSV/JSON"]
        end
        
        subgraph UPLOAD_API["📤 Upload"]
            E8["POST /api/upload → Upload file ke cloud"]
        end
        
        subgraph USER_API["👥 User (Super Admin)"]
            E9["GET /api/users → Daftar user"]
            E10["POST /api/users → Buat user"]
            E11["PUT /api/users/:id → Update user"]
            E12["DELETE /api/users/:id → Hapus user"]
        end
        
        subgraph PROFILE_API["👤 Profil"]
            E13["GET /api/profile → Lihat profil"]
            E14["PATCH /api/profile → Update profil"]
        end
        
        subgraph NOTIF_API["🔔 Notifikasi"]
            E15["GET /api/notifications → Daftar notifikasi"]
            E16["PATCH /api/notifications → Tandai dibaca"]
        end
        
        subgraph STORAGE_API["☁️ Storage"]
            E17["GET /api/storage/info → Info storage"]
            E18["GET /api/storage/connect-google → OAuth Google"]
            E19["GET+POST /api/storage/connect-onedrive → OAuth OneDrive"]
        end
    end

    style AUTH_API fill:#ffcdd2,stroke:#c62828,color:#000
    style ARCHIVE_API fill:#c8e6c9,stroke:#2e7d32,color:#000
    style UPLOAD_API fill:#fff9c4,stroke:#f9a825,color:#000
    style USER_API fill:#e8eaf6,stroke:#283593,color:#000
    style PROFILE_API fill:#e3f2fd,stroke:#1565c0,color:#000
    style NOTIF_API fill:#fff3e0,stroke:#e65100,color:#000
    style STORAGE_API fill:#f3e5f5,stroke:#6a1b9a,color:#000
```

---

## 🔄 Flow Keseluruhan Sistem (End-to-End)

```mermaid
flowchart TD
    START([🧑 Pengguna]) --> LOGIN["1. Login<br/>(Email + Password)"]
    LOGIN --> MW["2. Middleware<br/>Cek akses"]
    MW --> DASH["3. Dashboard<br/>Lihat statistik"]
    
    DASH --> MENU{Menu utama}
    
    MENU --> ARS["📁 Kelola Arsip"]
    MENU --> BRW["📂 Browse Folder"]
    MENU --> EXP["📥 Export Data"]
    MENU --> PRF["👤 Profil"]
    MENU --> ADM["🛡️ Admin Panel"]
    
    ARS --> ARS_CREATE["Buat Arsip Baru<br/>+ Upload File"]
    ARS --> ARS_LIST["Lihat & Filter<br/>Daftar Arsip"]
    ARS --> ARS_EDIT["Edit Arsip<br/>(Admin+)"]
    ARS --> ARS_DEL["Hapus Arsip<br/>(Admin+)"]
    
    ARS_CREATE --> UPLOAD["☁️ Upload ke<br/>Google Drive / OneDrive"]
    ARS_CREATE --> NOTIF["🔔 Notifikasi<br/>ke Admin"]
    
    BRW --> FOLDER["Navigasi:<br/>Status → Divisi → Tahun → File"]
    
    EXP --> EXPORT["Download CSV / JSON"]
    
    PRF --> PROFILE["Edit nama, email,<br/>foto, password"]
    
    ADM --> USR["Kelola User<br/>(Super Admin)"]
    ADM --> STR["Koneksi Storage<br/>(Admin+)"]

    style START fill:#e3f2fd,stroke:#1565c0,color:#000
    style LOGIN fill:#fff9c4,stroke:#f9a825,color:#000
    style DASH fill:#c8e6c9,stroke:#2e7d32,color:#000
    style UPLOAD fill:#f3e5f5,stroke:#6a1b9a,color:#000
    style NOTIF fill:#fff3e0,stroke:#e65100,color:#000
```

---

> **Catatan:** Diagram di atas menggunakan format [Mermaid](https://mermaid.js.org/) yang dapat di-render otomatis di GitHub, GitLab, dan berbagai markdown viewer modern.
