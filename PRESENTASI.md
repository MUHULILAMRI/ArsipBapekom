<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Presentasi - Sistem Arsip Digital BAPEKOM</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #0f172a;
    color: #e2e8f0;
    line-height: 1.7;
  }

  /* ===== SECTIONS ===== */
  .slide {
    min-height: 100vh;
    padding: 80px 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    border-bottom: 1px solid rgba(99,102,241,0.15);
  }

  .slide::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.08) 0%, transparent 60%);
    pointer-events: none;
  }

  /* ===== COVER SLIDE ===== */
  .cover {
    text-align: center;
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
  }
  .cover .badge {
    display: inline-block;
    background: rgba(99,102,241,0.15);
    border: 1px solid rgba(99,102,241,0.3);
    color: #818cf8;
    padding: 8px 24px;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 32px;
  }
  .cover h1 {
    font-size: 64px;
    font-weight: 900;
    background: linear-gradient(135deg, #fff 0%, #818cf8 50%, #6366f1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 16px;
    line-height: 1.1;
  }
  .cover .subtitle {
    font-size: 22px;
    color: #94a3b8;
    font-weight: 400;
    margin-bottom: 48px;
  }
  .cover .author {
    font-size: 16px;
    color: #64748b;
  }
  .cover .author strong {
    color: #cbd5e1;
    font-weight: 600;
  }

  /* ===== SECTION HEADERS ===== */
  .slide h2 {
    font-size: 42px;
    font-weight: 800;
    margin-bottom: 12px;
    background: linear-gradient(135deg, #e2e8f0, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    position: relative;
  }
  .slide h2::after {
    content: '';
    display: block;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #6366f1, #818cf8);
    border-radius: 4px;
    margin-top: 16px;
  }
  .slide h3 {
    font-size: 24px;
    font-weight: 700;
    color: #c7d2fe;
    margin: 32px 0 16px;
  }
  .slide-desc {
    font-size: 17px;
    color: #94a3b8;
    margin-bottom: 40px;
    max-width: 700px;
  }

  /* ===== CARDS GRID ===== */
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    margin: 24px 0;
  }
  .card {
    background: rgba(30, 41, 59, 0.7);
    border: 1px solid rgba(99,102,241,0.15);
    border-radius: 16px;
    padding: 28px;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }
  .card:hover {
    border-color: rgba(99,102,241,0.4);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(99,102,241,0.1);
  }
  .card .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    font-size: 24px;
    margin-bottom: 16px;
  }
  .card h4 {
    font-size: 18px;
    font-weight: 700;
    color: #e2e8f0;
    margin-bottom: 8px;
  }
  .card p {
    font-size: 14px;
    color: #94a3b8;
    line-height: 1.6;
  }
  .card .tag {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 6px;
    margin-top: 12px;
  }

  /* Icon backgrounds */
  .icon-blue    { background: rgba(59,130,246,0.15); }
  .icon-green   { background: rgba(16,185,129,0.15); }
  .icon-purple  { background: rgba(139,92,246,0.15); }
  .icon-amber   { background: rgba(245,158,11,0.15); }
  .icon-red     { background: rgba(239,68,68,0.15); }
  .icon-cyan    { background: rgba(6,182,212,0.15); }
  .icon-rose    { background: rgba(244,63,94,0.15); }

  /* Tag colors */
  .tag-blue   { background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.25); }
  .tag-green  { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
  .tag-purple { background: rgba(139,92,246,0.15); color: #a78bfa; border: 1px solid rgba(139,92,246,0.25); }
  .tag-amber  { background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.25); }

  /* ===== TECH STACK ===== */
  .tech-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
    margin: 24px 0;
  }
  .tech-item {
    background: rgba(30, 41, 59, 0.7);
    border: 1px solid rgba(99,102,241,0.12);
    border-radius: 14px;
    padding: 24px;
    text-align: center;
    transition: all 0.3s;
  }
  .tech-item:hover {
    border-color: rgba(99,102,241,0.35);
    transform: translateY(-3px);
  }
  .tech-item .tech-icon {
    font-size: 40px;
    margin-bottom: 12px;
  }
  .tech-item .tech-name {
    font-size: 16px;
    font-weight: 700;
    color: #e2e8f0;
    margin-bottom: 4px;
  }
  .tech-item .tech-role {
    font-size: 13px;
    color: #64748b;
  }

  /* ===== FLOW DIAGRAM ===== */
  .flow-container {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin: 32px 0;
    max-width: 800px;
  }
  .flow-step {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    position: relative;
    padding-bottom: 32px;
  }
  .flow-step:last-child { padding-bottom: 0; }
  .flow-step::before {
    content: '';
    position: absolute;
    left: 23px;
    top: 48px;
    bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, rgba(99,102,241,0.4), rgba(99,102,241,0.05));
  }
  .flow-step:last-child::before { display: none; }
  .flow-number {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 800;
    background: linear-gradient(135deg, #6366f1, #818cf8);
    color: #fff;
    box-shadow: 0 4px 16px rgba(99,102,241,0.3);
  }
  .flow-content {
    flex: 1;
    padding-top: 4px;
  }
  .flow-content h4 {
    font-size: 17px;
    font-weight: 700;
    color: #e2e8f0;
    margin-bottom: 4px;
  }
  .flow-content p {
    font-size: 14px;
    color: #94a3b8;
    line-height: 1.6;
  }

  /* ===== ARCHITECTURE DIAGRAM ===== */
  .arch-diagram {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin: 32px auto;
    max-width: 800px;
  }
  .arch-layer {
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(99,102,241,0.15);
    border-radius: 16px;
    padding: 24px 28px;
    position: relative;
  }
  .arch-layer .layer-label {
    position: absolute;
    top: -11px;
    left: 20px;
    background: #1e1b4b;
    padding: 2px 14px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #818cf8;
    border: 1px solid rgba(99,102,241,0.3);
  }
  .arch-items {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 4px;
  }
  .arch-chip {
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.2);
    color: #c7d2fe;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
  }
  .arch-arrow {
    text-align: center;
    font-size: 24px;
    color: #6366f1;
    opacity: 0.5;
  }

  /* ===== FOLDER STRUCTURE ===== */
  .folder-tree {
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(99,102,241,0.12);
    border-radius: 16px;
    padding: 28px 32px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 14px;
    color: #94a3b8;
    line-height: 2;
    overflow-x: auto;
    margin: 24px 0;
  }
  .folder-tree .folder { color: #818cf8; font-weight: 600; }
  .folder-tree .file { color: #94a3b8; }
  .folder-tree .comment { color: #475569; font-style: italic; }

  /* ===== TABLE ===== */
  .role-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin: 24px 0;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid rgba(99,102,241,0.15);
  }
  .role-table th {
    background: rgba(99,102,241,0.1);
    padding: 14px 18px;
    text-align: left;
    font-size: 13px;
    font-weight: 700;
    color: #c7d2fe;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .role-table td {
    padding: 12px 18px;
    font-size: 14px;
    color: #94a3b8;
    border-top: 1px solid rgba(99,102,241,0.08);
  }
  .role-table tr:hover td {
    background: rgba(99,102,241,0.04);
  }
  .check { color: #34d399; font-weight: 700; }
  .cross { color: #f87171; }

  /* ===== DIVIDER ===== */
  .divider {
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent);
    margin: 48px 0;
  }

  /* ===== SECTION NUMBER ===== */
  .section-num {
    display: inline-block;
    background: linear-gradient(135deg, #6366f1, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  /* ===== STATS ROW ===== */
  .stats-row {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    margin: 24px 0;
  }
  .stat-box {
    flex: 1;
    min-width: 160px;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(99,102,241,0.12);
    border-radius: 14px;
    padding: 24px;
    text-align: center;
  }
  .stat-box .stat-value {
    font-size: 36px;
    font-weight: 900;
    background: linear-gradient(135deg, #6366f1, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .stat-box .stat-label {
    font-size: 13px;
    color: #64748b;
    margin-top: 4px;
  }

  /* ===== LIST ===== */
  .feature-list {
    list-style: none;
    padding: 0;
  }
  .feature-list li {
    padding: 8px 0;
    padding-left: 28px;
    position: relative;
    font-size: 15px;
    color: #94a3b8;
  }
  .feature-list li::before {
    content: '▸';
    position: absolute;
    left: 0;
    color: #6366f1;
    font-weight: 700;
  }

  /* ===== ANALOGY BOX ===== */
  .analogy-box {
    background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08));
    border: 1px solid rgba(99,102,241,0.25);
    border-left: 4px solid #6366f1;
    border-radius: 12px;
    padding: 24px 28px;
    margin: 24px 0;
    font-size: 15px;
    color: #c7d2fe;
    line-height: 1.8;
  }
  .analogy-box strong {
    color: #818cf8;
  }
  .analogy-box .analogy-title {
    font-size: 16px;
    font-weight: 700;
    color: #e2e8f0;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* ===== COMPARISON ===== */
  .compare-grid {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 24px;
    align-items: stretch;
    margin: 24px 0;
  }
  .compare-box {
    background: rgba(30, 41, 59, 0.7);
    border-radius: 16px;
    padding: 28px;
    border: 1px solid rgba(99,102,241,0.15);
  }
  .compare-box h4 {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 16px;
    color: #e2e8f0;
  }
  .compare-vs {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 900;
    color: #6366f1;
  }
  .red-text { color: #f87171; }
  .green-text { color: #34d399; }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 768px) {
    .slide { padding: 40px 24px; }
    .cover h1 { font-size: 36px; }
    .slide h2 { font-size: 28px; }
    .cards { grid-template-columns: 1fr; }
    .tech-grid { grid-template-columns: repeat(2, 1fr); }
    .stats-row { flex-direction: column; }
    .compare-grid { grid-template-columns: 1fr; }
    .compare-vs { padding: 12px 0; }
  }

  @media print {
    .slide { page-break-after: always; min-height: auto; padding: 40px; }
    body { background: #fff; color: #1e293b; }
    .slide h2 { -webkit-text-fill-color: #1e293b; }
    .card, .tech-item, .arch-layer, .folder-tree, .stat-box {
      background: #f8fafc;
      border-color: #e2e8f0;
    }
  }
</style>
</head>
<body>

<!-- ============================================================ -->
<!-- SLIDE 1: COVER -->
<!-- ============================================================ -->
<div class="slide cover">
  <div>
    <div class="badge">📋 Presentasi Tugas Akhir</div>
    <h1>Sistem Arsip Digital<br>BAPEKOM</h1>
    <p class="subtitle">Mengelola Arsip Surat Kantor Secara Digital<br>— Aman, Cepat, dan Tersimpan di Cloud</p>
    <div class="divider"></div>
    <p class="author">
      Dibuat oleh: <strong>MUH. ULIL AMRI, S.Kom. MTCNA</strong><br>
      <span style="font-size:14px; color:#475569;">NIM: 105841106221 — Universitas Muhammadiyah Makassar</span>
    </p>
  </div>
</div>

<!-- ============================================================ -->
<!-- SLIDE 2: MASALAH -->
<!-- ============================================================ -->
<div class="slide">
  <div class="section-num">01 — Latar Belakang</div>
  <h2>Masalah yang Kita Hadapi</h2>
  <p class="slide-desc">
    Saat ini pengelolaan arsip surat di BAPEKOM masih dilakukan secara manual menggunakan buku catatan, map, dan lemari arsip. Hal ini menimbulkan berbagai masalah sehari-hari:
  </p>

  <div class="cards">
    <div class="card">
      <div class="icon icon-red">🔍</div>
      <h4>Susah Cari Surat</h4>
      <p>Perlu waktu lama membongkar tumpukan map dan lemari hanya untuk menemukan satu surat. Kadang surat yang dicari tidak ketemu sama sekali.</p>
    </div>
    <div class="card">
      <div class="icon icon-amber">📦</div>
      <h4>Surat Bisa Hilang / Rusak</h4>
      <p>Kertas bisa sobek, terkena air, dimakan rayap, atau terselip di tempat yang salah. Sekali hilang, tidak ada cadangannya.</p>
    </div>
    <div class="card">
      <div class="icon icon-purple">🚫</div>
      <h4>Siapa Saja Bisa Akses</h4>
      <p>Tidak ada pembatasan siapa yang boleh melihat arsip divisi mana. Surat rahasia keuangan bisa dilihat oleh siapa saja yang membuka lemari.</p>
    </div>
    <div class="card">
      <div class="icon icon-blue">📊</div>
      <h4>Tidak Ada Laporan</h4>
      <p>Sulit mengetahui berapa jumlah arsip per divisi, arsip mana yang aktif/tidak aktif, atau siapa yang terakhir menambah arsip.</p>
    </div>
  </div>

  <div class="analogy-box">
    <div class="analogy-title">💡 Bayangkan Seperti Ini:</div>
    Bayangkan Anda punya <strong>perpustakaan tanpa katalog</strong> — buku-buku ditumpuk tanpa label, tanpa rak yang teratur. Setiap kali mau cari buku, harus bongkar semua tumpukan. Aplikasi ini ibarat <strong>memberikan katalog digital + rak teratur + penjaga perpustakaan</strong> untuk arsip surat kantor.
  </div>
</div>

<!-- ============================================================ -->
<!-- SLIDE 3: SOLUSI (SEBELUM vs SESUDAH) -->
<!-- ============================================================ -->
<div class="slide">
  <div class="section-num">02 — Solusi</div>
  <h2>Sebelum vs Sesudah Menggunakan Aplikasi</h2>
  <p class="slide-desc">
    Dengan aplikasi ini, semua masalah di atas bisa diselesaikan. Berikut perbandingan cara kerja lama vs cara kerja baru:
  </p>

  <div class="compare-grid">
    <div class="compare-box" style="border-color: rgba(248,113,113,0.3);">
      <h4 class="red-text">❌ Cara Lama (Manual)</h4>
      <ul class="feature-list">
        <li>Arsip dicatat di buku tulis</li>
        <li>Surat disimpan di map & lemari</li>
        <li>Cari surat = bongkar tumpukan</li>
        <li>Siapa saja bisa buka lemari</li>
        <li>Tidak ada cadangan / backup</li>
        <li>Laporan dihitung manual</li>
        <li>Rawan hilang, rusak, terselip</li>
      </ul>
    </div>
    <div class="compare-vs">VS</div>
    <div class="compare-box" style="border-color: rgba(52,211,153,0.3);">
      <h4 class="green-text">✅ Cara Baru (Aplikasi Ini)</h4>
      <ul class="feature-list">
        <li>Arsip diinput lewat aplikasi web</li>
        <li>File surat tersimpan di Google Drive</li>
        <li>Cari surat = ketik & langsung ketemu</li>
        <li>Ada hak akses per jabatan & divisi</li>
        <li>Otomatis tersimpan di cloud (aman)</li>
        <li>Laporan & statistik otomatis</li>
        <li>Data aman, bisa diakses kapan saja</li>
      </ul>
    </div>
  </div>

  <div class="analogy-box">
    <div class="analogy-title">💡 Ibarat:</div>
    Seperti beralih dari <strong>mencatat nomor telepon di buku tulis</strong> ke <strong>menyimpan kontak di HP</strong> — lebih cepat dicari, tidak bisa hilang, dan tersinkronisasi di cloud sehingga kalau HP hilang pun data tetap ada.
  </div>
</div>

<!-- ============================================================ -->
<!-- SLIDE 4: APA YANG BISA DILAKUKAN APLIKASI INI -->
<!-- ============================================================ -->
<div class="slide">
  <div class="section-num">03 — Kemampuan Aplikasi</div>
  <h2>Apa Saja yang Bisa Dilakukan?</h2>
  <p class="slide-desc">
    Aplikasi ini punya 12 fitur utama. Berikut penjelasannya dalam bahasa yang mudah dipahami:
  </p>

  <div class="cards">
    <div class="card">
      <div class="icon icon-blue">🔐</div>
      <h4>1. Login yang Aman</h4>
      <p>Setiap pengguna punya akun sendiri (email & password). Password disimpan dalam bentuk sandi yang tidak bisa dibaca — jadi sangat aman. Jika salah password 5 kali, akun terkunci sementara.</p>
      <span class="tag tag-blue">Keamanan</span>
    </div>

    <div class="card">
      <div class="icon icon-purple">🛡️</div>
      <h4>2. Hak Akses Bertingkat</h4>
      <p>Ada 3 tingkatan pengguna: <strong>Pimpinan</strong> (akses penuh), <strong>Admin</strong> (kelola arsip semua divisi), dan <strong>Staf</strong> (hanya bisa input & lihat arsip divisinya sendiri). Ibarat kunci kantor — tidak semua orang pegang kunci semua ruangan.</p>
      <span class="tag tag-purple">Keamanan</span>
    </div>

    <div class="card">
      <div class="icon icon-green">📋</div>
      <h4>3. Kelola Arsip Surat</h4>
      <p>Tambah arsip baru, lihat detail, edit data, atau hapus arsip. Ada 2 jenis arsip: <strong>Aktif</strong> (masih digunakan) dan <strong>Inaktif</strong> (sudah selesai/tidak aktif) — masing-masing punya formulir yang berbeda sesuai standar kearsipan.</p>
      <span class="tag tag-green">Fitur Utama</span>
    </div>

    <div class="card">
      <div class="icon icon-cyan">📁</div>
      <h4>4. Simpan File di Cloud</h4>
      <p>File surat (PDF, Word, Excel, gambar) bisa dilampirkan dan otomatis tersimpan di Google Drive atau OneDrive. Ibarat <strong>menyimpan foto di Google Photos</strong> — file aman di internet, bisa diakses dari mana saja.</p>
      <span class="tag tag-green">Fitur Utama</span>
    </div>

    <div class="card">
      <div class="icon icon-amber">📂</div>
      <h4>5. Jelajahi Arsip (Folder View)</h4>
      <p>Lihat arsip seperti membuka folder di komputer: pilih Status → Divisi → Tahun → Dokumen. Navigasi yang intuitif dengan penunjuk lokasi (breadcrumb) agar tidak tersesat.</p>
      <span class="tag tag-green">Fitur Utama</span>
    </div>

    <div class="card">
      <div class="icon icon-rose">📊</div>
      <h4>6. Dashboard & Statistik</h4>
      <p>Halaman utama menampilkan ringkasan: total arsip, jumlah per divisi, arsip minggu ini, dan grafik tren. Ibarat <strong>papan informasi digital</strong> yang selalu menampilkan kondisi terkini.</p>
      <span class="tag tag-amber">Pemantauan</span>
    </div>

    <div class="card">
      <div class="icon icon-red">🔔</div>
      <h4>7. Notifikasi Otomatis</h4>
      <p>Setiap kali ada arsip baru, diedit, atau dihapus — admin langsung dapat pemberitahuan. Ada ikon lonceng di pojok kanan atas dengan angka penanda pesan baru, mirip notifikasi di WhatsApp.</p>
      <span class="tag tag-amber">Pemantauan</span>
    </div>

    <div class="card">
      <div class="icon icon-blue">👥</div>
      <h4>8. Kelola Pengguna</h4>
      <p>Pimpinan bisa: membuat akun baru, mengubah jabatan/divisi seseorang, menghapus akun, dan mereset password. Semua pengguna terdaftar dan terkontrol.</p>
      <span class="tag tag-purple">Khusus Pimpinan</span>
    </div>

    <div class="card">
      <div class="icon icon-green">☁️</div>
      <h4>9. Pengaturan Penyimpanan Cloud</h4>
      <p>Admin bisa menghubungkan Google Drive atau OneDrive sebagai tempat penyimpanan file. Cukup klik "Hubungkan" → login ke akun Google/Microsoft → selesai. Koneksi tetap aktif otomatis.</p>
      <span class="tag tag-purple">Khusus Admin</span>
    </div>

    <div class="card">
      <div class="icon icon-purple">📥</div>
      <h4>10. Ekspor / Unduh Data</h4>
      <p>Semua data arsip bisa diunduh dalam bentuk file spreadsheet (CSV — bisa dibuka di Excel) atau file data (JSON). Bisa difilter berdasarkan status dan divisi.</p>
      <span class="tag tag-green">Fitur Utama</span>
    </div>

    <div class="card">
      <div class="icon icon-amber">👤</div>
      <h4>11. Profil Pengguna</h4>
      <p>Setiap pengguna bisa mengubah nama, email, foto profil, dan mengganti password sendiri. Juga bisa melihat berapa total arsip yang sudah diinput.</p>
      <span class="tag tag-blue">Pengguna</span>
    </div>

    <div class="card">
      <div class="icon icon-cyan">📜</div>
      <h4>12. Riwayat Aktivitas</h4>
      <p>Catatan lengkap siapa melakukan apa dan kapan: siapa yang menambah arsip, dari divisi mana, tanggal berapa. Ibarat <strong>buku tamu</strong> yang mencatat setiap orang yang masuk dan apa yang dilakukannya.</p>
      <span class="tag tag-amber">Pemantauan</span>
    </div>
  </div>
</div>

<!-- ============================================================ -->
<!-- SLIDE 5: SIAPA PENGGUNA APLIKASI INI -->
<!-- ============================================================ -->
<div class="slide">
  <div class="section-num">04 — Pengguna</div>
  <h2>Siapa Saja yang Menggunakan?</h2>
  <p class="slide-desc">
    Aplikasi ini dirancang untuk 3 jenis pengguna dengan hak akses yang berbeda,
    ibarat <strong>penjaga gedung yang memberikan kunci berbeda untuk setiap lantai</strong>:
  </p>

  <div class="cards" style="grid-template-columns: repeat(3, 1fr);">
    <div class="card" style="border-color: rgba(244,63,94,0.3); text-align:center;">
      <div style="font-size:48px; margin-bottom:12px;">👑</div>
      <h4 style="color:#fb7185;">Pimpinan (Super Admin)</h4>
      <p style="margin-bottom:12px;">Memiliki akses penuh ke seluruh sistem</p>
      <ul class="feature-list" style="text-align:left;">
        <li>Melihat & mengelola semua arsip</li>
        <li>Membuat & menghapus akun pengguna</li>
        <li>Mengatur jabatan & divisi pengguna</li>
        <li>Mengatur koneksi penyimpanan cloud</li>
        <li>Melihat semua riwayat aktivitas</li>
        <li>Mengunduh semua data arsip</li>
      </ul>
    </div>
    <div class="card" style="border-color: rgba(99,102,241,0.3); text-align:center;">
      <div style="font-size:48px; margin-bottom:12px;">⚙️</div>
      <h4 style="color:#818cf8;">Admin</h4>
      <p style="margin-bottom:12px;">Mengelola arsip semua divisi</p>
      <ul class="feature-list" style="text-align:left;">
        <li>Melihat & mengelola arsip semua divisi</li>
        <li>Menambah, mengedit, menghapus arsip</li>
        <li>Mengatur koneksi penyimpanan cloud</li>
        <li>Melihat riwayat aktivitas</li>
        <li>Mengunduh semua data arsip</li>
        <li><em style="color:#f87171;">Tidak bisa kelola akun pengguna</em></li>
      </ul>
    </div>
    <div class="card" style="border-color: rgba(16,185,129,0.3); text-align:center;">
      <div style="font-size:48px; margin-bottom:12px;">👤</div>
      <h4 style="color:#34d399;">Staf</h4>
      <p style="margin-bottom:12px;">Input arsip untuk divisinya sendiri</p>
      <ul class="feature-list" style="text-align:left;">
        <li>Menambah arsip (divisi sendiri)</li>
        <li>Melihat arsip divisi sendiri saja</li>
        <li>Mengunduh data arsip divisinya</li>
        <li>Mengelola profil sendiri</li>
        <li><em style="color:#f87171;">Tidak bisa edit/hapus arsip</em></li>
        <li><em style="color:#f87171;">Tidak bisa lihat arsip divisi lain</em></li>
      </ul>
    </div>
  </div>

  <h3>Tabel Ringkasan Hak Akses</h3>
  <table class="role-table">
    <thead>
      <tr>
        <th>Yang Bisa Dilakukan</th>
        <th>👑 Pimpinan</th>
        <th>⚙️ Admin</th>
        <th>👤 Staf</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Lihat arsip semua divisi</td>
        <td class="check">✔ Bisa</td>
        <td class="check">✔ Bisa</td>
        <td class="cross">✘ Divisi sendiri saja</td>
      </tr>
      <tr>
        <td>Tambah arsip baru</td>
        <td class="check">✔ Bisa</td>
        <td class="check">✔ Bisa</td>
        <td class="check">✔ Bisa</td>
      </tr>
      <tr>
        <td>Edit & hapus arsip</td>
        <td class="check">✔ Bisa</td>
        <td class="check">✔ Bisa</td>
        <td class="cross">✘ Tidak bisa</td>
      </tr>
      <tr>
        <td>Kelola akun pengguna</td>
        <td class="check">✔ Bisa</td>
        <td class="cross">✘ Tidak bisa</td>
        <td class="cross">✘ Tidak bisa</td>
      </tr>
      <tr>
        <td>Atur penyimpanan cloud</td>
        <td class="check">✔ Bisa</td>
        <td class="check">✔ Bisa</td>
        <td class="cross">✘ Tidak bisa</td>
      </tr>
      <tr>
        <td>Lihat riwayat aktivitas</td>
        <td class="check">✔ Bisa</td>
        <td class="check">✔ Bisa</td>
        <td class="cross">✘ Tidak bisa</td>
      </tr>
      <tr>
        <td>Unduh data arsip (ekspor)</td>
        <td class="check">✔ Semua</td>
        <td class="check">✔ Semua</td>
        <td class="check">✔ Divisi sendiri</td>
      </tr>
      <tr>
        <td>Lihat statistik & analitik</td>
        <td class="check">✔ Semua</td>
        <td class="check">✔ Semua</td>
        <td class="check">✔ Divisi sendiri</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- ============================================================ -->
<!-- SLIDE 6: DIVISI -->
<!-- ============================================================ -->
<div class="slide">
  <div class="section-num">05 — Divisi</div>
  <h2>4 Divisi yang Terlayani</h2>
  <p class="slide-desc">
    Aplikasi ini melayani 4 divisi di BAPEKOM. Setiap divisi memiliki "ruang arsip digital" sendiri yang terpisah:
  </p>

  <div class="cards" style="grid-template-columns: repeat(2, 1fr);">
    <div class="card" style="text-align:center;">
      <div style="font-size:48px; margin-bottom:12px;">💰</div>
      <h4>Divisi Keuangan</h4>
      <p>Mengelola arsip surat yang berkaitan dengan keuangan: anggaran, laporan keuangan, pembayaran, dan sebagainya.</p>
    </div>
    <div class="card" style="text-align:center;">
      <div style="font-size:48px; margin-bottom:12px;">📡</div>
      <h4>Divisi Penyelenggara</h4>
      <p>Mengelola arsip yang berkaitan dengan kegiatan penyelenggaraan dan operasional BAPEKOM.</p>
    </div>
    <div class="card" style="text-align:center;">
      <div style="font-size:48px; margin-bottom:12px;">✉️</div>
      <h4>Divisi Tata Usaha</h4>
      <p>Mengelola arsip surat menyurat, administrasi umum, dan korespondensi kantor.</p>
    </div>
    <div class="card" style="text-align:center;">
      <div style="font-size:48px; margin-bottom:12px;">🏢</div>
      <h4>Divisi Umum</h4>
      <p>Mengelola arsip terkait urusan umum, keperluan kantor, dan dokumen pendukung lainnya.</p>
    </div>
  </div>

  <div class="analogy-box">
    <div class="analogy-title">💡 Cara Kerjanya:</div>
    Ibarat <strong>4 lemari arsip yang terkunci</strong>, masing-masing bertuliskan nama divisi. Staf Keuangan hanya bisa membuka lemari Keuangan, sedangkan Admin dan Pimpinan bisa membuka semua lemari. Setiap lemari otomatis dirapikan per tahun.
  </div>
</div>

<!-- ============================================================ -->
<!-- SLIDE 7: CARA KERJA APLIKASI -->
<!-- ============================================================ -->
<div class="slide">
  <div class="section-num">06 — Cara Kerja</div>
  <h2>Bagaimana Aplikasi Ini Bekerja?</h2>

  <h3>A. Cara Login</h3>
  <div class="flow-container">
    <div class="flow-step">
      <div class="flow-number">1</div>
      <div class="flow-content">
        <h4>Buka Aplikasi di Browser</h4>
        <p>Ketik alamat web aplikasi di Google Chrome, Firefox, atau browser lainnya. Tampil halaman login.</p>
      </div>
    </div>
    <div class="flow-step">
      <div class="flow-number">2</div>
      <div class="flow-content">
        <h4>Masukkan Email & Password</h4>
        <p>Isi email dan password yang sudah diberikan admin. Jika salah 5 kali, harus tunggu 1 menit sebelum coba lagi (untuk keamanan).</p>
      </div>
    </div>
    <div class="flow-step">
      <div class="flow-number">3</div>
      <div class="flow-content">
        <h4>Sistem Memverifikasi</h4>
        <p>Aplikasi memeriksa apakah email terdaftar dan password cocok. Jika cocok, langsung masuk.</p>
      </div>
    </div>
    <div class="flow-step">
      <div class="flow-number">4</div>
      <div class="flow-content">
        <h4>Masuk ke Dashboard</h4>
        <p>Setelah berhasil login, tampil halaman utama (Dashboard) dengan ringkasan statistik arsip. Menu di sebelah kiri sesuai hak akses Anda.</p>
      </div>
    </div>
  </div>

  <div class="divider"></div>

  <h3>B. Cara Menambah Arsip Baru</h3>
  <div class="flow-container">
    <div class="flow-step">
      <div class="flow-number">1</div>
      <div class="flow-content">
        <h4>Klik "Tambah Arsip"</h4>
        <p>Di halaman Arsip, klik tombol "Tambah Arsip". Pilih jenis: Arsip Aktif atau Arsip Inaktif.</p>
      </div>
    </div>
    <div class="flow-step">
      <div class="flow-number">2</div>
      <div class="flow-content">
        <h4>Isi Formulir</h4>
        <p>Isi data surat: nomor arsip, judul, nomor surat, tanggal, divisi, dan keterangan lainnya. Seperti mengisi buku agenda surat — tapi di layar komputer.</p>
      </div>
    </div>
    <div class="flow-step">
      <div class="flow-number">3</div>
      <div class="flow-content">
        <h4>Lampirkan File (Opsional)</h4>
        <p>Bisa upload file scan surat (PDF, Word, Excel, gambar). Maksimal 10 MB per file. File otomatis tersimpan di Google Drive / OneDrive.</p>
      </div>
    </div>
    <div class="flow-step">
      <div class="flow-number">4</div>
      <div class="flow-content">
        <h4>Klik Simpan</h4>
        <p>Data tersimpan di sistem. File tersimpan di cloud. Admin langsung dapat notifikasi bahwa ada arsip baru.</p>
      </div>
    </div>
  </div>

  <div class="divider"></div>

  <h3>C. Cara Menghubungkan Google Drive</h3>
  <div class="flow-container">
    <div class="flow-step">
      <div class="flow-number">1</div>
      <div class="flow-content">
        <h4>Buka Menu "Penyimpanan"</h4>
        <p>Admin masuk ke menu Pengaturan Penyimpanan cloud dari sidebar. Tampil pilihan Google Drive dan OneDrive.</p>
      </div>
    </div>
    <div class="flow-step">
      <div class="flow-number">2</div>
      <div class="flow-content">
        <h4>Klik "Hubungkan Google Drive"</h4>
        <p>Akan muncul halaman login Google. Pilih akun Google yang ingin digunakan untuk menyimpan file.</p>
      </div>
    </div>
    <div class="flow-step">
      <div class="flow-number">3</div>
      <div class="flow-content">
        <h4>Izinkan Akses</h4>
        <p>Google akan meminta izin untuk menyimpan file. Klik "Izinkan". Ibarat memberikan <strong>kunci brankas Google Drive</strong> ke aplikasi ini.</p>
      </div>
    </div>
    <div class="flow-step">
      <div class="flow-number">4</div>
      <div class="flow-content">
        <h4>Selesai — Sudah Terhubung!</h4>
        <p>Koneksi aktif. Semua file yang diupload akan otomatis masuk ke Google Drive. Koneksi tetap aktif tanpa perlu login ulang.</p>
      </div>
    </div>
  </div>
</div>

<!-- ============================================================ -->
<!-- SLIDE 8: PENYIMPANAN FILE -->
<!-- ============================================================ -->
<div class="slide">
  <div class="section-num">07 — Penyimpanan</div>
  <h2>Di Mana Data Disimpan?</h2>
  <p class="slide-desc">
    Aplikasi ini menyimpan 2 jenis data di 2 tempat berbeda — ibarat <strong>buku catatan</strong> dan <strong>lemari arsip</strong>:
  </p>

  <div class="cards" style="grid-template-columns: 1fr 1fr;">
    <div class="card">
      <div class="icon icon-blue">📒</div>
      <h4>Data Tercatat (Database)</h4>
      <p>Semua informasi arsip (nomor surat, judul, tanggal, divisi, siapa yang input) tersimpan di database — ibarat <strong>buku induk</strong> yang mencatat semua arsip.</p>
      <ul class="feature-list" style="margin-top:12px;">
        <li>Tidak bisa hilang karena sudah digital</li>
        <li>Bisa dicari dalam hitungan detik</li>
        <li>Mencatat 4 jenis data: Pengguna, Arsip, Notifikasi, dan Pengaturan</li>
      </ul>
    </div>
    <div class="card">
      <div class="icon icon-green">☁️</div>
      <h4>File Dokumen (Cloud)</h4>
      <p>File-file scan surat yang dilampirkan (PDF, Word, gambar) tersimpan di Google Drive atau OneDrive — ibarat <strong>brankas digital di internet</strong>.</p>
      <ul class="feature-list" style="margin-top:12px;">
        <li>Aman di server Google / Microsoft</li>
        <li>Bisa diakses dari mana saja</li>
        <li>Otomatis dirapikan dalam folder: Divisi → Tahun</li>
      </ul>
    </div>
  </div>

  <h3>📁 Cara File Dirapikan di Cloud</h3>
  <p class="slide-desc">File otomatis dimasukkan ke folder yang benar berdasarkan divisi dan tahun, seperti ini:</p>
  <div class="folder-tree">
    <span class="folder">📁 Arsip BAPEKOM/</span><br>
    &nbsp;&nbsp;&nbsp;&nbsp;<span class="folder">📁 Divisi Keuangan/</span><br>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="folder">📁 2025/</span><br>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="file">📄 Laporan_Keuangan_Q1.pdf</span><br>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="file">📄 SK_Anggaran_2025.docx</span><br>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="folder">📁 2026/</span><br>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="file">📄 Rencana_Anggaran_2026.xlsx</span><br>
    &nbsp;&nbsp;&nbsp;&nbsp;<span class="folder">📁 Divisi Penyelenggara/</span><br>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="folder">📁 2026/</span><br>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="file">📄 BA_Rapat_Koordinasi.pdf</span><br>
    &nbsp;&nbsp;&nbsp;&nbsp;<span class="folder">📁 Divisi Tata Usaha/</span><br>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="comment">... (rapi per tahun)</span><br>
    &nbsp;&nbsp;&nbsp;&nbsp;<span class="folder">📁 Divisi Umum/</span><br>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="comment">... (rapi per tahun)</span>
  </div>

  <div class="analogy-box">
    <div class="analogy-title">💡 Jenis File yang Bisa Diupload:</div>
    <strong>PDF</strong> (scan surat), <strong>Word</strong> (dokumen teks), <strong>Excel</strong> (spreadsheet/tabel), <strong>PowerPoint</strong> (presentasi), dan <strong>Gambar</strong> (JPG, PNG). Maksimal <strong>10 MB</strong> per file — cukup untuk hampir semua dokumen kantor.
  </div>
</div>

<!-- ============================================================ -->
<!-- SLIDE 9: CARA KERJA DI BALIK LAYAR (SEDERHANA) -->
<!-- ============================================================ -->
<div class="slide">
  <div class="section-num">08 — Di Balik Layar</div>
  <h2>Bagaimana Sistem Ini Bekerja di Balik Layar?</h2>
  <p class="slide-desc">
    Untuk yang penasaran, berikut penjelasan sederhana tentang bagaimana sistem ini bekerja — tanpa istilah teknis yang membingungkan:
  </p>

  <div class="arch-diagram">
    <div class="arch-layer">
      <div class="layer-label">👤 Pengguna</div>
      <div class="arch-items">
        <div class="arch-chip">Membuka aplikasi di browser (Chrome, Firefox, dll)</div>
        <div class="arch-chip">Melihat tampilan yang cantik & mudah digunakan</div>
      </div>
    </div>

    <div class="arch-arrow">⬇ Pengguna mengklik tombol / mengisi form ⬇</div>

    <div class="arch-layer">
      <div class="layer-label">🚪 Penjaga Pintu</div>
      <div class="arch-items">
        <div class="arch-chip">Memeriksa: sudah login belum?</div>
        <div class="arch-chip">Memeriksa: punya hak akses tidak?</div>
        <div class="arch-chip">Jika tidak berhak → ditolak</div>
      </div>
    </div>

    <div class="arch-arrow">⬇ Jika lolos pemeriksaan ⬇</div>

    <div class="arch-layer">
      <div class="layer-label">🧠 Otak Sistem</div>
      <div class="arch-items">
        <div class="arch-chip">Memproses permintaan (tambah/edit/hapus/cari arsip)</div>
        <div class="arch-chip">Mengirim notifikasi ke admin</div>
        <div class="arch-chip">Mengupload file ke cloud</div>
        <div class="arch-chip">Menghitung statistik</div>
      </div>
    </div>

    <div class="arch-arrow">⬇ Menyimpan & mengambil data ⬇</div>

    <div style="display: flex; gap: 20px;">
      <div class="arch-layer" style="flex:1;">
        <div class="layer-label">📒 Buku Induk (Database)</div>
        <div class="arch-items">
          <div class="arch-chip">Data pengguna</div>
          <div class="arch-chip">Data arsip surat</div>
          <div class="arch-chip">Notifikasi</div>
          <div class="arch-chip">Pengaturan</div>
        </div>
      </div>
      <div class="arch-layer" style="flex:1;">
        <div class="layer-label">☁️ Brankas Cloud</div>
        <div class="arch-items">
          <div class="arch-chip">Google Drive</div>
          <div class="arch-chip">OneDrive</div>
          <div class="arch-chip">File scan surat</div>
        </div>
      </div>
    </div>
  </div>

  <div class="analogy-box">
    <div class="analogy-title">💡 Analoginya:</div>
    Bayangkan sebuah <strong>kantor modern</strong>: ada <strong>resepsionis</strong> (penjaga pintu) yang memeriksa tanda pengenal setiap tamu. Jika lolos, tamu diantar ke <strong>petugas</strong> (otak sistem) yang memproses permintaan. Petugas kemudian mencatat di <strong>buku besar</strong> (database) dan menyimpan dokumen ke <strong>brankas</strong> (cloud).
  </div>
</div>

<!-- ============================================================ -->
<!-- SLIDE 10: KEAMANAN -->
<!-- ============================================================ -->
<div class="slide">
  <div class="section-num">09 — Keamanan</div>
  <h2>Seberapa Aman Aplikasi Ini?</h2>
  <p class="slide-desc">
    Keamanan data adalah prioritas utama. Berikut cara aplikasi ini menjaga keamanan:
  </p>

  <div class="cards">
    <div class="card">
      <div class="icon icon-red">🔒</div>
      <h4>Password Terenkripsi</h4>
      <p>Password tidak pernah disimpan langsung. Diacak menjadi kode rahasia yang tidak bisa dibalik. Ibarat <strong>menulis pesan dengan tinta tak terlihat</strong> — bahkan admin pun tidak bisa melihat password Anda.</p>
    </div>
    <div class="card">
      <div class="icon icon-amber">⏱️</div>
      <h4>Batas Percobaan Login</h4>
      <p>Jika seseorang mencoba login dan salah password 5 kali berturut-turut, akun terkunci selama 1 menit. Mencegah orang jahat yang mencoba-coba menebak password.</p>
    </div>
    <div class="card">
      <div class="icon icon-purple">🎫</div>
      <h4>Kartu Identitas Digital</h4>
      <p>Setelah login, Anda mendapat "kartu identitas digital" yang tersimpan aman. Setiap kali buka halaman baru, sistem memeriksa kartu ini — memastikan Anda adalah orang yang benar.</p>
    </div>
    <div class="card">
      <div class="icon icon-blue">🛡️</div>
      <h4>Penjaga di Setiap Pintu</h4>
      <p>Setiap halaman aplikasi dijaga oleh sistem keamanan otomatis. Jika Anda tidak berhak mengakses halaman tertentu, langsung diarahkan kembali. Staf tidak bisa "mengintip" data divisi lain.</p>
    </div>
    <div class="card">
      <div class="icon icon-green">📁</div>
      <h4>File Divalidasi</h4>
      <p>Setiap file yang diupload diperiksa: apakah formatnya boleh? Apakah ukurannya tidak terlalu besar? Nama file juga dibersihkan dari karakter berbahaya. Hanya file yang aman yang diterima.</p>
    </div>
    <div class="card">
      <div class="icon icon-cyan">🔑</div>
      <h4>Koneksi Cloud yang Aman</h4>
      <p>Koneksi ke Google Drive menggunakan protokol keamanan standar Google (sama seperti saat Anda login ke Gmail). Token akses diperbarui otomatis tanpa perlu login ulang.</p>
    </div>
  </div>
</div>

<!-- ============================================================ -->
<!-- SLIDE 11: TEKNOLOGI (RINGKAS) -->
<!-- ============================================================ -->
<div class="slide">
  <div class="section-num">10 — Teknologi</div>
  <h2>Dibangun dengan Teknologi Modern</h2>
  <p class="slide-desc">
    Untuk yang ingin mengetahui, berikut teknologi yang digunakan untuk membangun aplikasi ini — semuanya adalah teknologi terkini dan terpercaya:
  </p>

  <h3>🖥️ Tampilan Aplikasi (yang pengguna lihat)</h3>
  <div class="tech-grid">
    <div class="tech-item">
      <div class="tech-icon">⚛️</div>
      <div class="tech-name">Next.js 16</div>
      <div class="tech-role">Kerangka kerja utama — ibarat "mesin" yang menjalankan aplikasi</div>
    </div>
    <div class="tech-item">
      <div class="tech-icon">🟦</div>
      <div class="tech-name">TypeScript</div>
      <div class="tech-role">Bahasa pemrograman — ibarat "bahasa" yang dimengerti komputer</div>
    </div>
    <div class="tech-item">
      <div class="tech-icon">🎨</div>
      <div class="tech-name">Tailwind CSS</div>
      <div class="tech-role">Perkakas desain — membuat tampilan cantik & responsif</div>
    </div>
  </div>

  <h3>⚙️ Mesin di Balik Layar</h3>
  <div class="tech-grid">
    <div class="tech-item">
      <div class="tech-icon">🐘</div>
      <div class="tech-name">PostgreSQL</div>
      <div class="tech-role">Tempat penyimpanan data — ibarat "lemari arsip digital"</div>
    </div>
    <div class="tech-item">
      <div class="tech-icon">🔺</div>
      <div class="tech-name">Prisma</div>
      <div class="tech-role">Penerjemah — menghubungkan aplikasi dengan database</div>
    </div>
    <div class="tech-item">
      <div class="tech-icon">🔐</div>
      <div class="tech-name">NextAuth.js</div>
      <div class="tech-role">Sistem login — memastikan hanya pengguna terdaftar yang masuk</div>
    </div>
  </div>

  <h3>☁️ Penyimpanan File</h3>
  <div class="tech-grid">
    <div class="tech-item">
      <div class="tech-icon">📁</div>
      <div class="tech-name">Google Drive</div>
      <div class="tech-role">Penyimpanan file utama — tempat file surat disimpan</div>
    </div>
    <div class="tech-item">
      <div class="tech-icon">☁️</div>
      <div class="tech-name">Microsoft OneDrive</div>
      <div class="tech-role">Pilihan alternatif — jika ingin gunakan penyimpanan Microsoft</div>
    </div>
  </div>
</div>

<!-- ============================================================ -->
<!-- SLIDE 11: RANGKUMAN -->
<!-- ============================================================ -->
<div class="slide">
  <div class="section-num">11 — Rangkuman</div>
  <h2>Rangkuman Keunggulan Aplikasi</h2>
  <p class="slide-desc">
    Berikut ringkasan mengapa aplikasi ini layak digunakan:
  </p>

  <div class="stats-row">
    <div class="stat-box">
      <div class="stat-value">12</div>
      <div class="stat-label">Fitur Lengkap</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">4</div>
      <div class="stat-label">Divisi Terlayani</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">3</div>
      <div class="stat-label">Tingkat Hak Akses</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">2</div>
      <div class="stat-label">Pilihan Cloud Storage</div>
    </div>
  </div>

  <div class="cards" style="grid-template-columns: repeat(3, 1fr); margin-top: 32px;">
    <div class="card" style="text-align:center;">
      <div style="font-size:48px; margin-bottom:12px;">⚡</div>
      <h4>Cepat</h4>
      <p>Cari arsip dalam hitungan detik, bukan menit atau jam. Semua data terindeks dan bisa difilter.</p>
    </div>
    <div class="card" style="text-align:center;">
      <div style="font-size:48px; margin-bottom:12px;">🔒</div>
      <h4>Aman</h4>
      <p>Password terenkripsi, hak akses bertingkat, dan file tersimpan di cloud yang terpercaya (Google/Microsoft).</p>
    </div>
    <div class="card" style="text-align:center;">
      <div style="font-size:48px; margin-bottom:12px;">🌐</div>
      <h4>Bisa Diakses Dimana Saja</h4>
      <p>Cukup buka browser dan internet — bisa diakses dari komputer, laptop, bahkan HP. Tidak perlu install apapun.</p>
    </div>
    <div class="card" style="text-align:center;">
      <div style="font-size:48px; margin-bottom:12px;">📊</div>
      <h4>Ada Laporan Otomatis</h4>
      <p>Dashboard menampilkan statistik lengkap secara real-time. Tidak perlu menghitung manual.</p>
    </div>
    <div class="card" style="text-align:center;">
      <div style="font-size:48px; margin-bottom:12px;">☁️</div>
      <h4>Backup Cloud</h4>
      <p>File tersimpan di Google Drive / OneDrive. Meskipun komputer rusak, data tetap aman.</p>
    </div>
    <div class="card" style="text-align:center;">
      <div style="font-size:48px; margin-bottom:12px;">🔔</div>
      <h4>Notifikasi Real-time</h4>
      <p>Admin langsung tahu jika ada perubahan. Tidak ada aktivitas yang terlewat.</p>
    </div>
  </div>
</div>

<!-- ============================================================ -->
<!-- SLIDE 12: PENUTUP -->
<!-- ============================================================ -->
<div class="slide cover" style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);">
  <div>
    <div class="badge">🎓 Penutup</div>
    <h1 style="font-size:48px;">Terima Kasih</h1>
    <p class="subtitle">
      Sistem Arsip Digital BAPEKOM hadir sebagai solusi modern untuk mengelola arsip surat kantor<br>
      — dari cara manual yang rawan hilang, menjadi sistem digital yang aman, cepat, dan terintegrasi cloud.
    </p>
    <div class="divider"></div>

    <div class="stats-row" style="justify-content:center; max-width:700px; margin:32px auto;">
      <div class="stat-box">
        <div class="stat-value">12</div>
        <div class="stat-label">Fitur Lengkap</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">4</div>
        <div class="stat-label">Divisi Terlayani</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">2</div>
        <div class="stat-label">Jenis Arsip</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">∞</div>
        <div class="stat-label">Bisa Diakses Kapan Saja</div>
      </div>
    </div>

    <p class="author" style="margin-top:32px;">
      <strong>MUH. ULIL AMRI, S.Kom. MTCNA</strong><br>
      <span style="font-size:14px; color:#475569;">NIM: 105841106221</span><br>
      <span style="font-size:13px; color:#475569;">Universitas Muhammadiyah Makassar</span>
    </p>

    <div style="margin-top:40px;">
      <p style="font-size:18px; color:#818cf8; font-weight:600;">Sesi Tanya Jawab 💬</p>
      <p style="font-size:14px; color:#64748b;">Silakan bertanya jika ada yang ingin didiskusikan</p>
    </div>
  </div>
</div>

</body>
</html>
