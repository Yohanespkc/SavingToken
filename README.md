# ⚡ SavingToken LLM-Connector AI Gateway
> **Platform In-House Optimalisasi Token & Biaya LLM berbasis Sovereign Telkomsel GPU Cluster & Commercial Cloud (Gemini 3.8 / GPT-6)**

[English](docs/en/README.md) | [Bahasa Indonesia](README.md)

[![GitHub Repo](https://img.shields.io/badge/GitHub-Yohanespkc%2FSavingToken-blue?logo=github)](https://github.com/Yohanespkc/SavingToken)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B%20%7C%20v20%2B-green?logo=node.js)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Engine](https://img.shields.io/badge/In--House-LLM--Connector%20Native-crimson)]()
[![Telkomsel AI](https://img.shields.io/badge/Telkomsel-Sovereign%20GPU%20Cluster-red?logo=telkomsel)]()

SavingToken adalah aplikasi gateway cerdas (**LLM-Connector**) yang dibangun secara mandiri dari nol (100% *native in-house*, tanpa ketergantungan pada SaaS proxy pihak ketiga) untuk **memangkas pemakaian token hingga 70%**, menghemat energi komputasi cloud, dan menjaga kedaulatan data nasional melalui integrasi langsung dengan **Mesin GPU Open-Source Telkomsel** serta **API Komersial Tier-1 (Gemini 3.8 Multimodal & NanoBanana Studio)** yang terhubung dengan **Sistem Billing Telkomsel (Pulsa & Kuota Token Flat)**.

---

## 📑 Daftar Isi
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Dua Mode Utama (Dual-Mode Interface)](#-dua-mode-utama-dual-mode-interface)
- [Fitur Unggulan In-House LLM-Connector](#-fitur-unggulan-in-house-llm-connector)
- [Katalog Model AI yang Didukung](#-katalog-model-ai-yang-didukung)
- [Sistem Billing & Kuota Telkomsel](#-sistem-billing--kuota-telkomsel)
- [Struktur Direktori Proyek](#-struktur-direktori-proyek)
- [Panduan Instalasi & Penggunaan](#-panduan-instalasi--penggunaan)
- [Konfigurasi Lingkungan (.env)](#-konfigurasi-lingkungan-env)
- [Spesifikasi API & Server-Sent Events (SSE)](#-spesifikasi-api--server-sent-events-sse)
- [Changelog](#-changelog)
- [Lisensi](#-lisensi)

---

## 🏛️ Arsitektur Sistem

```
                              ┌─────────────────────────────────────────┐
                              │            PENGGUNA / BROWSER           │
                              │    (Dual-Mode UI + Live HUD Token)      │
                              └───────────────────┬─────────────────────┘
                                                  │ POST /api/chat (SSE)
                                                  ▼
                              ┌─────────────────────────────────────────┐
                              │       EXPRESS BACKEND GATEWAY           │
                              │             (server/index.js)           │
                              └───────────────────┬─────────────────────┘
                                                  │
                 ┌────────────────────────────────┴──────────────────────────────┐
                 ▼                                                               ▼
  ┌─────────────────────────────┐                                ┌───────────────────────────────┐
  │   1. SEMANTIC CACHING       │                                │  2. TOKEN PRUNER & COMPRESS   │
  │   Kueri serupa terdeteksi?  │                                │  Pangkas basa-basi & spasi    │
  │   ↳ 0 Token, 0 Watt, <40ms  │                                │  ↳ Hemat 30% - 65% token in   │
  └──────────────┬──────────────┘                                └───────────────┬───────────────┘
                 │ (Cache Miss)                                                  │
                 └────────────────────────────────┬──────────────────────────────┘
                                                  ▼
                              ┌─────────────────────────────────────────┐
                              │     3. SMART TIERED AUTO-ROUTING        │
                              │     (Evaluasi Kompleksitas Kueri)       │
                              └───────┬─────────────────────────┬───────┘
                                      │                         │
                                      ▼                         ▼
         ┌──────────────────────────────────────┐     ┌─────────────────────────────────────────┐
         │     TOMBOL 1: MESIN TELKOMSEL        │     │       TOMBOL 2: LLM-CONNECTOR           │
         │   (Cluster GPU Sovereign Internal)   │     │        (Commercial Cloud APIs)          │
         │  ──────────────────────────────────  │     │  ─────────────────────────────────────  │
         │  • DeepSeek-R1 (Reasoning <think>)   │     │  • Gemini 3.8 Flash (Multimodal)        │
         │  • DeepSeek-V3 (Serbaguna Cepat)     │     │  • Gemini 3.8 NanoBanana (/imagine)     │
         │  • GLM-4 / GLM-Edge (Spesialis Kode) │     │  • Gemini 3.8 Pro (Video & Canvas)      │
         │  • Qwen 2.5 72B (Otomasi Cepat)      │     │  • GPT-6.0 Omni Preview                 │
         └──────────────────┬───────────────────┘     └───────────────────┬─────────────────────┘
                            │                                             │
                            └─────────────────────┬───────────────────────┘
                                                  │
                                                  ▼
                              ┌─────────────────────────────────────────┐
                              │       STREAMING RESPONSE ENGINE         │
                              │      (Live Chunks + Thinking Stream)    │
                              └───────────────────┬─────────────────────┘
                                                  │
                                                  ▼
                              ┌─────────────────────────────────────────┐
                              │      BILLING & TRANSACTION LEDGER       │
                              │  • Potong Kuota Token Flat (Telkomsel)  │
                              │  • Potong Pulsa Transparan (Commercial) │
                              │  • Audit Penghematan Rupiah Real-time   │
                              └─────────────────────────────────────────┘
```

---

## 🎛️ Dua Mode Utama (Dual-Mode Interface)

Antarmuka dirancang dengan **Dual-Mode Switcher** di bagian navigasi atas untuk kemudahan pengguna:

### 1. 🌐 Tombol 1: LLM Lokal Mesin Telkomsel
* **Tujuan**: Memanfaatkan infrastruktur server/cluster GPU lokal Telkomsel yang mengedepankan kedaulatan data nasional (*data sovereignty*).
* **Mekanisme Token**: Setiap token input dan output dihitung secara *real-time* via **Token Meter HUD**.
* **Tarif**: Memotong **Kuota Token Flat Telkomsel** (sangat murah, estimasi Rp 1,5 - Rp 2,5 per 1.000 token).
* **Fitur Khas**:
  * Penalaran mendalam pada **DeepSeek-R1** dilengkapi akordion streaming pemikiran `<think>` interaktif.
  * Tetap berfungsi penuh dengan sistem fallback *High-Fidelity Hybrid Simulation* jika cluster lokal sedang *offline*.

### 2. ⚡ Tombol 2: LLM-Connector (Multi-LLM)
* **Tujuan**: Menghubungkan pengguna ke berbagai model LLM komersial tier teratas (Google Gemini 3.8, NanoBanana, GPT-6) dengan proteksi penghemat biaya dan energi.
* **Mekanisme Hemat**: Prompt diproses terlebih dahulu oleh **Token Pruner** dan **Semantic Cache** sebelum dikirim ke API berbayar.
* **Tarif**: Memotong **Saldo Pulsa Telkomsel** secara transparan sesuai jumlah token riil setelah dikompresi.
* **Fitur Khas**:
  * Dukungan multimodal: input teks, unggah gambar/dokumen, dan perintah render visual `/imagine`.

---

## 💡 Fitur Unggulan In-House LLM-Connector

### 1. ⚡ Semantic Caching
* Menyimpan representasi konteks dan jawaban kueri sebelumnya dalam memori cepat.
* Ketika pengguna menanyakan hal serupa, jawaban disajikan seketika:
  * **0 Token** terpakai
  * **0 Watt** energi terbuang
  * **Biaya Rp 0**
  * **Latensi < 40ms**

### 2. ✂️ Token Pruning & Compression
* Secara otomatis mendeteksi dan memangkas basa-basi (*conversational fluff*) seperti *"Halo tolong bantu saya jelaskan..."*, *"Terima kasih banyak ya..."*, dan spasi ganda.
* Mempertahankan inti instruksi dan semantik kueri.
* Berhasil memangkas **30% hingga 65% token input**, mengurangi beban tagihan API komersial secara signifikan.

### 3. 🎯 Smart Tiered Auto-Routing
Ketika mode `auto` aktif, LLM-Connector mengklasifikasikan prompt secara cerdas:
* **Penalaran Kompleks / Matematika** $\rightarrow$ Dialihkan ke **DeepSeek-R1 (Mesin Telkomsel)**.
* **Coding, Refactoring, & Arsitektur** $\rightarrow$ Dialihkan ke **GLM-4 / GLM-Edge (Mesin Telkomsel)**.
* **Generasi Gambar Visual** $\rightarrow$ Dialihkan ke **Gemini 3.8 NanoBanana Studio**.
* **Analisis Media / Vision / Dokumen** $\rightarrow$ Dialihkan ke **Gemini 3.8 Flash**.
* **Pertanyaan Umum Cepat** $\rightarrow$ Dialihkan ke **DeepSeek-V3 / Qwen 2.5**.

---

## 🤖 Katalog Model AI yang Didukung

| Nama Model | Kategori | Provider | Spesialisasi & Fitur |
| :--- | :--- | :--- | :--- |
| **DeepSeek-R1** | Mesin Telkomsel | Open Source (vLLM/Ollama) | Penalaran mendalam, pembuktian logika, visualisasi blok `<think>` |
| **DeepSeek-V3** | Mesin Telkomsel | Open Source (vLLM/Ollama) | Model serbaguna berkapasitas besar, latensi rendah |
| **GLM-4 / GLM-Edge** | Mesin Telkomsel | Open Source (vLLM/Ollama) | Bilingual Indonesia-Inggris, refactoring kode & arsitektur |
| **Qwen 2.5 72B** | Mesin Telkomsel | Open Source (vLLM/Ollama) | Otomasi tugas harian, kecepatan respons kilat |
| **Gemini 3.8 Flash** | Commercial | Google Cloud API | Multimodal teks, gambar, audio, dan groundings web |
| **Gemini 3.8 NanoBanana** | Commercial | Google / In-House Studio | Render grafis resolusi tinggi (2048 x 2048 HDR) via `/imagine` |
| **Gemini 3.8 Pro Video** | Commercial | Google Cloud API | Pemahaman konteks video frame-by-frame dan dokumen panjang |
| **GPT-6.0 Omni Preview**| Commercial | OpenAI API | Komparasi benchmark model komersial tier teratas |

---

## 💳 Sistem Billing & Kuota Telkomsel

Platform dilengkapi modul billing operator terpadu:

1. **Saldo Pulsa Telkomsel**: Digunakan untuk membayar panggilan API komersial (Gemini / GPT) dengan transparansi audit per kueri.
2. **Saldo Kuota Token Telkomsel**: Digunakan untuk pemanggilan model di kluster GPU lokal (tarif flat hemat).
3. **Pilihan Paket Kuota AI**:
   * 🎓 **Paket AI Mahasiswa**: 1.000.000 Token — `Rp 25.000`
   * 💼 **Paket Telkomsel AI Developer Pro**: 10.000.000 Token — `Rp 150.000`
   * 🏢 **Paket Telkomsel Enterprise Sovereign**: 50.000.000 Token Dedicated — `Rp 650.000`
4. **Buku Kas Transaksi Real-time (Ledger)**:
   * Mencatat riwayat waktu, model yang digunakan, token masuk/keluar, token yang berhasil dihemat, dan penghematan biaya nominal dalam Rupiah (Rp).

---

## 📁 Struktur Direktori Proyek

```
SavingToken/
├── docs/                            # Direktori dokumentasi multilingual
│   ├── README.md                    # Indeks navigasi dokumentasi multilingual
│   ├── changelog/                   # Catatan rilis & riwayat versi (v0.0.0, v0.0.1)
│   ├── en/                          # Dokumentasi bahasa Inggris
│   │   └── README.md                # English documentation
│   └── id/                          # Dokumentasi bahasa Indonesia
│       └── README.md                # Dokumentasi bahasa Indonesia
├── public/
│   └── favicon.svg                  # Favicon grafis resmi SavingToken
├── server/
│   ├── index.js                     # Express server & endpoint SSE (/api/chat, /api/billing, dll.)
│   ├── mock/
│   │   └── mockStreamer.js          # Simulator respon & streaming fallback beresolusi tinggi
│   └── router/
│       ├── billingService.js        # Logika saldo pulsa, kuota token, dan ledger transaksi
│       ├── commercialProvider.js    # Konektor resmi Gemini 3.8, NanoBanana, & OpenAI
│       ├── llmConnector.js          # In-House Engine: Cache, Pruner, & Smart Tiered Router
│       ├── omniRouter.js            # Re-export transparan menuju llmConnector.js
│       └── telkomselCluster.js      # Konektor cluster GPU vLLM/Ollama internal Telkomsel
├── src/
│   ├── index.html                   # Halaman utama aplikasi (Dual-Mode UI)
│   ├── main.js                      # Entry point front-end & event listeners
│   ├── modules/
│   │   ├── api.js                   # Client SSE reader & API caller
│   │   ├── state.js                 # Reactive client store & persistent state
│   │   └── ui.js                    # Render HUD, gelembung chat, kartu token, modal
│   └── styles/
│       ├── chat.css                 # Gaya kartu pesan chat & HUD token footer
│       ├── hud.css                  # Gaya header navigasi, dual-mode switcher, & chip saldo
│       ├── main.css                 # Design token, variabel CSS, tema gelap & tipografi
│       └── modals.css               # Gaya popup modal (Billing, Analytics, Settings)
├── CHANGELOG.md                     # Catatan riwayat versi resmi proyek
├── package.json                     # Metadata proyek & skrip npm
├── README.md                        # Dokumentasi komprehensif proyek
└── .gitignore                       # Proteksi file environment & dependensi
```

---

## 🚀 Panduan Instalasi & Penggunaan

### Persyaratan Sistem
* **Node.js**: Versi `18.0.0` atau yang lebih baru (disarankan Node.js v20 LTS).
* **NPM**: Versi `9.0.0` atau yang lebih baru.
* **Browser**: Chrome, Microsoft Edge, Safari, atau Firefox versi terbaru.

### Langkah Menjalankan Aplikasi
1. **Clone repository**:
   ```bash
   git clone https://github.com/Yohanespkc/SavingToken.git
   cd SavingToken
   ```

2. **Pasang dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan server aplikasi**:
   ```bash
   npm start
   ```

4. **Akses antarmuka web**:
   Buka peramban web dan arahkan ke alamat:
   👉 **`http://localhost:3000`**

---

## ⚙️ Konfigurasi Lingkungan (.env)

Buat berkas `.env` pada direktori root proyek untuk mengonfigurasi koneksi riil:

```env
# Port Server Express
PORT=3000

# Endpoint Mesin Sovereign Telkomsel (vLLM / Ollama OpenAI-compatible API)
TELKOMSEL_GPU_URL=http://127.0.0.1:8000/v1
TELKOMSEL_GPU_KEY=telkomsel-internal-token

# Google Gemini API Key (untuk Gemini 3.8 Flash & NanoBanana riil)
GEMINI_API_KEY=AIzaSy...

# Optional OpenAI API Key (untuk GPT-6)
OPENAI_API_KEY=sk-...
```

> **Catatan**: Anda juga dapat mengatur `TELKOMSEL_GPU_URL` dan `GEMINI_API_KEY` secara langsung melalui antarmuka web dengan menekan tombol **Pengaturan (Ikon Roda Gigi)** tanpa harus me-restart server.

---

## 📡 Spesifikasi API & Server-Sent Events (SSE)

### `POST /api/chat`
Endpoint utama untuk obrolan streaming dengan dukungan Server-Sent Events (SSE).

**Request Body (JSON):**
```json
{
  "prompt": "Tolong jelaskan konsep Sovereign AI dan bagaimana cara menghemat token.",
  "model": "auto",
  "enableCompression": true,
  "media": null
}
```

**Aliran Event SSE yang Dikirimkan:**
* `cache_hit`: Dikirim jika prompt ditemukan dalam Semantic Cache (memuat persentase kesamaan & token dihemat).
* `prune_stats`: Statistik hasil pemangkasan basa-basi (`originalTokens`, `prunedTokens`, `tokensSaved`, `reductionPercent`).
* `route_decision`: Keputusan pemilihan model oleh router (`modelId`, `provider`, `rationale`).
* `image_ready`: Dikirim saat permintaan `/imagine` NanoBanana menghasilkan gambar.
* `chunk`: Potongan teks streaming (`{ type: "reasoning" | "content", content: "..." }`).
* `stats`: Rangkuman pemakaian token riil, penghitungan tarif, dan sisa saldo pulsa/kuota token.
* `done`: Penanda akhir streaming.

### Endpoint Lainnya:
* `GET /api/status`: Status kesehatan server dan katalog seluruh model AI.
* `GET /api/billing`: Informasi saldo pulsa, kuota token, dan daftar riwayat transaksi.
* `POST /api/billing/topup`: Pembelian paket kuota token atau pengisian pulsa.
* `GET /api/cache/stats`: Statistik pemakaian semantic cache & penghematan energi (Wh).
* `POST /api/cache/clear`: Membersihkan memori semantic cache.
* `POST /api/settings`: Memperbarui konfigurasi GPU URL dan API Key secara runtime.

---

## 📜 Changelog

Detail setiap perubahan versi dicatat secara lengkap pada berkas [CHANGELOG.md](CHANGELOG.md).

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah lisensi [MIT](https://opensource.org/licenses/MIT). Anda bebas menggunakan, memodifikasi, dan mengembangkan kode ini untuk keperluan internal maupun komersial.
