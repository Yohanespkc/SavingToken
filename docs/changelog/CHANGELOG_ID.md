# 📜 Catatan Perubahan (Changelog) SavingToken

Semua perubahan penting pada proyek **SavingToken LLM-Connector AI** dicatat dalam direktori ini.

Format berkas ini mengacu pada [Keep a Changelog](https://keepachangelog.com/id/1.0.0/) dan mematuhi [Semantic Versioning](https://semver.org/lang/id/).

---

## 📑 Riwayat Versi

| Versi | Tanggal Rilis | Ringkasan | Berkas Rilis |
| :--- | :--- | :--- | :--- |
| **[v0.0.1](#001---2026-09-28)** | 28 September 2026 | Struktur Dokumentasi Multilingual & Changelog | [v0.0.1.md](v0.0.1.md) |
| **[v0.0.0](#000---2026-09-27)** | 27 September 2026 | Rilis Perdana — Native LLM-Connector & Billing Telkomsel | [v0.0.0.md](v0.0.0.md) |

---

## [0.0.1] - 2026-09-28

### Added
- **Struktur Dokumentasi Multilingual (`docs/`)**:
  - Implementasi struktur direktori dokumentasi internasional di bawah `docs/`.
  - Berkas [`docs/en/README.md`](../en/README.md) yang menyajikan terjemahan bahasa Inggris lengkap untuk arsitektur sistem, UI dual-mode, mesin optimasi token in-house, katalog model, dan spesifikasi API.
  - Berkas [`docs/id/README.md`](../id/README.md) yang mengorganisasikan dokumentasi bahasa Indonesia kanonikal dengan path relatif yang rapi.
  - Berkas [`docs/README.md`](../README.md) sebagai portal navigasi dokumentasi lintas bahasa.
- **Direktori Khusus Changelog (`docs/changelog/`)**:
  - Membangun direktori `docs/changelog/` untuk arsip riwayat versi dan catatan rilis komprehensif.
  - Catatan rilis mendalam untuk [`v0.0.0.md`](v0.0.0.md) dan [`v0.0.1.md`](v0.0.1.md).
- **Navigasi Bahasa Global**:
  - Penambahan tautan pemilihan bahasa (`[English] | [Bahasa Indonesia]`) pada README utama dan sub-dokumentasi.

### Changed
- Pembaruan diagram pohon direktori proyek pada [`README.md`](../../README.md) untuk mencerminkan struktur `docs/` dan `docs/changelog/`.
- Perbaikan tautan path absolut lokal menjadi path repositori relatif yang portabel.

---

## [0.0.0] - 2026-09-27

### Added
- **In-House Native LLM-Connector Engine (`server/router/llmConnector.js`)**:
  - Mesin gateway multi-LLM mandiri yang dibangun 100% *in-house* tanpa ketergantungan pada proxy SaaS pihak ketiga.
  - **Semantic Caching**: Deteksi kueri berulang secara cerdas untuk respon instan (0 token, 0 biaya, 0 watt energi, latensi < 40ms).
  - **Token Pruning & Compressor**: Pembersihan kata-kata basa-basi, salam berulang, dan normalisasi spasi tanpa mengubah konteks semantik prompt (menghemat 30% hingga 65% token input).
  - **Smart Tiered Auto-Routing**: Analisis jenis kueri untuk mengarahkan prompt secara otomatis ke model yang paling efisien (penalaran ke DeepSeek-R1, coding ke GLM-4, grafis ke NanoBanana, umum ke DeepSeek-V3/Qwen).
- **Dual-Mode UI Navigation**:
  - **Tombol 1 - LLM Lokal Mesin Telkomsel**: Inferensi di Cluster GPU berdaulat internal Telkomsel dengan penghitungan token real-time dan tarif flat kuota token.
  - **Tombol 2 - LLM-Connector (Multi-LLM)**: Gateway penghemat energi dan biaya untuk mengakses model-model komersial berbayar (Gemini 3.8 / GPT-6).
- **Katalog Model Terpadu**:
  - *Sovereign Telkomsel GPU Cluster*: DeepSeek-R1 (dengan streaming blok `<think>` penalaran mendalam interaktif), DeepSeek-V3, GLM-4 / GLM-Edge, dan Qwen 2.5 72B.
  - *Commercial APIs*: Google Gemini 3.8 Flash (Multimodal), Gemini 3.8 NanoBanana Studio (Image Generator via prompt `/imagine`), Gemini 3.8 Pro Video, dan GPT-6.0 Omni Preview.
- **Sistem Billing Telkomsel Terintegrasi (`server/router/billingService.js`)**:
  - Dukungan pemotongan ganda: Saldo Pulsa Telkomsel (untuk model komersial) dan Kuota Token Telkomsel (untuk kluster lokal).
  - Paket kuota AI prabayar: Paket Mahasiswa (1 Juta Token), Developer Pro (10 Juta Token), dan Enterprise Sovereign (50 Juta Token).
  - Buku kas audit transaksi real-time (*Ledger*) dengan catatan model, jumlah token input/output, token yang dihemat, dan penghematan Rupiah.
- **HUD Token Saver & Real-time Metrics**:
  - Live HUD pill di setiap pesan asisten yang memperlihatkan statistik pemangkasan token, latensi, dan estimasi biaya.
  - Modal Analytics untuk memantau akumulasi token terpangkas, watt-hour energi yang dihemat, dan rasio cache hit.
  - Modal Pengaturan untuk mengubah endpoint Telkomsel GPU dan API Key komersial secara *live* tanpa restart server.
- **High-Fidelity Hybrid Simulation Streamer (`server/mock/mockStreamer.js`)**:
  - Menjamin aplikasi tetap responsif dan dapat didemokan secara penuh sekalipun server kluster internal atau koneksi internet sedang offline.
- **Infrastruktur Repository & Keamanan**:
  - Konfigurasi `.gitignore` untuk melindungi berkas `.env`, direktori `node_modules/`, dan artefak build lokal.
  - Publikasi repository resmi di GitHub ([Yohanespkc/SavingToken](https://github.com/Yohanespkc/SavingToken)).

### Changed
- Merefaktor arsitektur gateway dari pendekatan proxy pihak ketiga (*OmniRouter*) menjadi modul mandiri *in-house* **LLM-Connector**.
- Mempertahankan berkas `server/router/omniRouter.js` sebagai re-export transparan menuju `llmConnector.js` guna menjamin kompatibilitas ke belakang (*backward compatibility*).

### Security
- Menjamin sanitasi API Key dan endpoint internal agar tidak terekspos di sisi klien publik.
- Mengisolasi konfigurasi kredensial melalui variabel lingkungan server (`.env`).
