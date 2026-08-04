# DAPURZY - Personal Business & Batch HPP Management System (PWA)
> **Blueprint v1.2 (Full Final Version)**

DAPURZY adalah Progressive Web App (PWA) pribadi yang dirancang khusus untuk mengelola usaha rumahan secara *end-to-end* dalam satu sistem terpadu—mulai dari pengelolaan modal, belanja bahan baku berbasis batch, kalkulasi HPP otomatis per produksi, stok multi-lokasi (gudang & mitra konsinyasi), pergerakan barang, penjualan, hingga laporan keuntungan dan *traceability* usaha.

---

## 🚀 Fitur Utama & Modul (Blueprint v1.2)

1. **Dashboard (Beranda)**
   - Financial Cards: Saldo Kas Operasional, Modal Aktif, Nilai Valuasi Stok, Omzet, Laba Bersih, & Total Belanja Hari Ini.
   - Pending Production Alert: Notifikasi otomatis Batch Belanja yang belum ditarik menjadi hasil produksi.
   - Quick Action Bar: Akses 1-Tap ke Belanja, Produksi, Pergerakan, dan Penjualan.
   - Master Produk & HPP Terkalkulasi + Log Aktivitas Terbaru.

2. **Belanja Bahan Baku & Batch Procurement**
   - Pembuatan Batch Belanja Baru (`BATCH-YYYY-XXX`).
   - Pencatatan deskripsi bahan baku campuran, total modal, dan supplier.
   - Otomatis mengurangi Saldo Kas Operasional dan masuk antrean produksi (`pending_production`).

3. **Produksi & Kalkulasi Auto-HPP**
   - Mengubah Batch Belanja Pending menjadi Produk Jadi.
   - Formula Auto-HPP Presisi:
     $$\text{HPP Presisi per Unit} = \frac{\text{Total Biaya Batch Belanja}}{\text{Jumlah Unit Hasil Produksi}}$$
   - Update HPP Master Produk & penambahan stok ke Gudang Utama.

4. **Pergerakan Barang (Consignment & Transfers)**
   - `GUDANG_TO_MITRA`: Penitipan barang ke Mitra/Warung/Kantin/Reseller.
   - `MITRA_TO_GUDANG`: Penarikan sisa barang dari Mitra kembali ke Gudang.
   - `RETUR`: Barang kembalian.
   - `RUSAK` / `HILANG`: Pencatatan penyusutan stok sebagai beban kerugian.

5. **Penjualan & Pengakuan Laba**
   - Penjualan Direct dari Gudang Utama & Penjualan dari Mitra Titipan.
   - Pengakuan Laba Bersih Otomatis:
     $$\text{Laba Bersih Transaksi} = \text{Total Penjualan} - (\text{Qty Terjual} \times \text{HPP Terkalkulasi})$$

6. **Stok Real-Time Multi-Lokasi**
   - Posisi stok Gudang Utama vs Breakdown stok Konsinyasi per Mitra.
   - *Strict Guard*: Mencegah transaksi jika stok di lokasi bernilai negatif.

7. **Traceability Batch & Audit Trail**
   - Matriks perjalanan: Batch Belanja $\rightarrow$ Hasil Produksi $\rightarrow$ HPP per Unit $\rightarrow$ Profitabilitas.
   - Ringkasan Keuangan (Omzet, Belanja, Laba Kotor, Laba Bersih) & Log Audit Transaksi.

8. **Master Data (Produk & Mitra)**
   - Master Produk (Kategori, Harga Jual Standar, Auto-HPP, Status).
   - Master Mitra Konsinyasi (Nama, Jenis, WhatsApp, Alamat, Status).

---

## 🛠️ Tech Stack & Arsitektur

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v4, Lucide Icons, PWA Support
- **Backend & Edge Infrastructure**: Cloudflare Workers / Pages runtime
- **Database**: Cloudflare D1 (Serverless Relational SQLite Database)
- **ORM**: Drizzle ORM
- **Deployment Target**: Cloudflare Pages / Workers

---

## 📁 Struktur Folder Project

```
dapurzy/
├── README.md                       # Dokumentasi Blueprint & Panduan Penggunaan
├── package.json                    # Dependensi & script aplikasi
├── tsconfig.json                   # Konfigurasi TypeScript
├── next.config.ts                  # Konfigurasi Next.js 15 & Header PWA
├── wrangler.jsonc                  # Bindings Database Cloudflare D1
├── drizzle.config.ts               # Migration setup Drizzle Kit
├── public/
│   ├── manifest.json               # Web App PWA Manifest
│   └── sw.js                       # Service Worker for Offline PWA
├── db/
│   ├── schema.ts                   # Drizzle ORM Schema (8 SQLite Tables)
│   └── index.ts                    # D1 Client Wrapper & Memory Engine
├── lib/
│   ├── types.ts                    # TypeScript Interfaces
│   └── utils.ts                    # Helper Format Rupiah & Date
├── app/
│   ├── layout.tsx                  # Root Layout + PWA Meta
│   ├── globals.css                 # Tailwind CSS v4
│   ├── page.tsx                    # Main App Shell & Dashboard Component
│   └── api/                        # Next.js Server Side REST Endpoints
└── components/                     # Modular Reusable React UI Components
```

---

## 💻 Panduan Jalankan Aplikasi

```bash
# 1. Install dependencies
npm install

# 2. Jalankan Server Dev
npm run dev

# 3. Build & Deploy ke Cloudflare Pages / D1
npm run build
npx wrangler d1 migrations apply dapurzy-production-db
```
