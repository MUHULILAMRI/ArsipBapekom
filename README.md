# Arsip Bapekom - Sistem Pengarsipan Digital

Sistem pengarsipan digital berbasis web untuk mengelola dokumen dan surat di lingkungan Bapekom.

## 🏗 Stack Teknologi

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Cloud Storage:** Google Drive API & Microsoft OneDrive (Graph API)
- **UI:** Tailwind CSS, Lucide Icons, TanStack Table
- **Language:** TypeScript

## 📁 Struktur Project

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── dashboard/        # Halaman dashboard
│   │   ├── archives/         # Daftar arsip
│   │   ├── archives/create/  # Form tambah arsip
│   │   ├── archives/[id]/    # Detail arsip
│   │   ├── admin/users/      # Kelola user (SUPER_ADMIN)
│   │   └── admin/storage/    # Konfigurasi storage
│   ├── api/
│   │   ├── auth/             # NextAuth handler
│   │   ├── archives/         # CRUD arsip
│   │   ├── upload/           # Upload file
│   │   ├── users/            # Kelola user
│   │   └── storage/          # Connect Google/OneDrive
│   └── login/                # Halaman login
├── components/
│   ├── ArchiveTable.tsx      # Tabel arsip (TanStack Table)
│   ├── ArchiveForm.tsx       # Form input arsip
│   ├── DashboardCard.tsx     # Card statistik
│   ├── Navbar.tsx            # Navigation bar
│   ├── Sidebar.tsx           # Sidebar menu
│   └── AuthProvider.tsx      # Session provider
├── lib/
│   ├── prisma.ts             # Prisma client
│   ├── auth.ts               # NextAuth config
│   ├── drive.ts              # Google Drive API
│   ├── onedrive.ts           # OneDrive API
│   └── rbac.ts               # Role-based access control
├── utils/
│   ├── folderHelper.ts       # Mapping divisi → folder
│   └── uploadHelper.ts       # Upload logic
├── types/
│   └── next-auth.d.ts        # NextAuth type declarations
└── middleware.ts              # Auth & RBAC middleware
```

## 🚀 Cara Menjalankan

### 1. Clone & Install

```bash
git clone https://github.com/MUHULILAMRI/ArsipBapekom.git
cd ArsipBapekom/arsip-bapekom
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env sesuai konfigurasi Anda
```

### 3. Setup Database

```bash
# Push schema ke database
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed data awal
npm run db:seed
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 👤 Akun Default (Setelah Seed)

| Role        | Email                      | Password  |
|-------------|----------------------------|-----------|
| SUPER_ADMIN | admin@bapekom.go.id        | admin123  |
| ADMIN       | pengelola@bapekom.go.id    | admin123  |
| USER        | keuangan@bapekom.go.id     | admin123  |
| USER        | penyelenggara@bapekom.go.id| admin123  |
| USER        | tatausaha@bapekom.go.id    | admin123  |
| USER        | umum@bapekom.go.id         | admin123  |

## 🔐 Hak Akses (RBAC)

| Role        | Akses                                   |
|-------------|-----------------------------------------|
| SUPER_ADMIN | Semua fitur, semua divisi, kelola user  |
| ADMIN       | Semua arsip, kelola storage             |
| USER        | Input & lihat arsip divisi sendiri      |

## ☁️ Cloud Storage

File arsip disimpan di Google Drive atau OneDrive dengan struktur folder:

```
Root Arsip/
├── Divisi Keuangan/
├── Divisi Penyelenggara/
├── Divisi Tata Usaha/
└── Divisi Umum/
```

### Konfigurasi Google Drive
1. Buat project di [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google Drive API
3. Buat OAuth 2.0 credentials
4. Set redirect URI ke `http://localhost:3000/api/storage/connect-google/callback`

### Konfigurasi OneDrive
1. Register app di [Azure Portal](https://portal.azure.com)
2. Set redirect URI ke `http://localhost:3000/api/storage/connect-onedrive/callback`
3. Add permission: `Files.ReadWrite.All`, `offline_access`

## 📊 Fitur

- ✅ Dashboard dengan statistik per divisi
- ✅ CRUD arsip dengan upload file
- ✅ Tabel spreadsheet (search, sort, filter, pagination)
- ✅ Role-Based Access Control (RBAC)
- ✅ Autentikasi dengan NextAuth.js
- ✅ Integrasi Google Drive & OneDrive
- ✅ Manajemen user (Super Admin)
- ✅ Responsive design
- ✅ Sistem notifikasi real-time (bell icon + dropdown)
- ✅ Pencarian arsip global di Navbar
- ✅ Halaman profil (avatar, ubah password, ubah email/divisi, 6 tab)
- ✅ Toast notification system
- ✅ Edit & hapus user (Super Admin)
- ✅ Ekspor arsip ke CSV / JSON
- ✅ Log aktivitas admin
- ✅ Animasi intro welcome screen (10 detik, gradient, partikel emas)
- ✅ Animasi transisi login (zoom-out & fade)
- ✅ Seluruh antarmuka dalam Bahasa Indonesia
