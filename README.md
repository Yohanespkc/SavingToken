# ⚡ SavingToken LLM-Connector AI Gateway
> **Platform In-House Optimalisasi Token & Biaya LLM berbasis Sovereign Telkomsel GPU Cluster & Commercial Cloud (Gemini 3.8 / GPT-6)**

SavingToken adalah aplikasi gateway cerdas (**LLM-Connector**) yang dibangun sendiri dari nol (100% native in-house) untuk **memangkas pemakaian token hingga 70%**, menghemat energi komputasi cloud, dan menjaga kedaulatan data melalui integrasi langsung dengan **Mesin GPU Open-Source Telkomsel** serta **API Komersial Tier-1 (Gemini 3.8 Multimodal & NanoBanana Studio)** yang terhubung dengan **Sistem Billing Telkomsel (Pulsa & Kuota Token)**.

---

## 🌟 Fitur Utama

### 1. ⚡ In-House LLM-Connector Engine
* **Semantic Caching**: Memeriksa kesamaan makna (semantic similarity) prompt secara real-time. Jika ditemukan kueri serupa, sistem langsung memberikan jawaban instan **(0 token terpakai, 0 watt energi, biaya Rp 0, latensi < 40ms)**.
* **Token Pruner & Compressor**: Memangkas kata-kata basa-basi (*"halo tolong bantu saya...", "terima kasih banyak"*), menormalkan spasi, dan mempertahankan inti semantik, menghemat **30% - 65% token input**.
* **Smart Tiered Auto-Routing**:
  * Kueri penalaran mendalam / matematika -> dialihkan ke **DeepSeek-R1 (Mesin Telkomsel)** dengan live `<think>` reasoning stream.
  * Kueri coding & bilingual teknis -> dialihkan ke **GLM-4 / GLM-Edge (Mesin Telkomsel)**.
  * Kueri visual / pembuatan gambar -> dialihkan ke **Gemini 3.8 NanoBanana Studio**.
  * Kueri umum berkecepatan tinggi -> dialihkan ke **DeepSeek-V3 / Qwen 2.5 (Mesin Telkomsel)**.

### 2. 🤖 Ekosistem 2 Jenis Model LLM
* **Mesin Open-Source Sovereign di Jaringan Telkomsel**:
  * `DeepSeek-R1`: Model penalaran mendalam (reasoning) tanpa biaya API luar.
  * `DeepSeek-V3`: Model serbaguna berkapasitas tinggi.
  * `GLM-4 / GLM-Edge`: Model bilingual spesialis kode dan arsitektur sistem.
  * `Qwen 2.5 72B`: Model super cepat untuk otomasi tugas harian.
  * *Koneksi langsung ke server vLLM, Ollama, SGLang, atau TGI di jaringan internal Telkomsel (`POST /v1/chat/completions`).*
* **Model Komersial Terkini (Commercial APIs)**:
  * `Gemini 3.8 Flash`: Pemrosesan multimodal kilat (teks, gambar, dokumen).
  * `Gemini 3.8 NanoBanana Studio`: Generasi grafis dan visual resolusi tinggi (2048 x 2048 HDR) via perintah `/imagine`.
  * `Gemini 3.8 Pro Video`: Pemahaman konteks video frame-by-frame dan dokumen besar.
  * `GPT-6.0 Omni Preview`: Model komersial mutakhir untuk komparasi benchmark.

### 3. 💳 Sistem Pembayaran & Billing Telkomsel Terpadu
* **Saldo Pulsa & Kuota Token**:
  * Inferensi Mesin Telkomsel memotong **Kuota Token Flat Telkomsel** (sangat murah, estimasi Rp 1.5 - Rp 2.5 per 1.000 token).
  * Pemanggilan API komersial (Gemini / GPT) memotong **Pulsa Telkomsel** secara transparan dengan audit biaya per prompt.
* **Paket Kuota AI**:
  * *Paket AI Mahasiswa / Edukasi*: 1 Juta Token (Rp 25.000)
  * *Paket Telkomsel AI Developer Pro*: 10 Juta Token (Rp 150.000)
  * *Paket Telkomsel Enterprise Sovereign*: 50 Juta Token Dedicated GPU (Rp 650.000)
* **Buku Kas Transaksi Real-time (Ledger)**: Mencatat waktu, model yang digunakan, token terpakai, token yang dihemat, dan nominal Rupiah yang berhasil diselamatkan.

### 4. 🎨 Tampilan Bersih, Sederhana, & User-Friendly
* UI minimalis dan elegan dengan aksen khas Telkomsel Crimson & Emerald Green.
* Live HUD Token Saver di setiap gelembung pesan.
* Dock input serbaguna dengan tombol pintas NanoBanana, lampiran media (gambar/video), dan sakelar Token Pruning.
* Mode Simulasi Hybrid: Siap menghubungkan API riil sekaligus menyediakan data simulasi responsif jika server internal sedang offline.

---

## 🚀 Panduan Menjalankan Aplikasi

### Persyaratan Sistem
* Node.js v18+ (atau v20+)
* Browser modern (Chrome, Edge, Safari, Firefox)

### Menjalankan Server
```bash
# Di direktori proyek SavingToken
npm install

# Jalankan server
npm start
# atau
node server/index.js
```

Buka browser Anda di:
👉 **`http://localhost:3000`**

---

## ⚙️ Konfigurasi & Variabel Lingkungan (.env)

Buat file `.env` di root direktori jika ingin mengaktifkan endpoint riil:

```env
PORT=3000

# Endpoint Mesin Telkomsel (vLLM / Ollama OpenAI-compatible)
TELKOMSEL_GPU_URL=http://127.0.0.1:8000/v1
TELKOMSEL_GPU_KEY=telkomsel-internal-token

# API Key Google Gemini (untuk Gemini 3.8 & NanoBanana riil)
GEMINI_API_KEY=AIzaSy...

# Optional OpenAI Key
OPENAI_API_KEY=sk-...
```

*Catatan: Anda juga dapat mengatur endpoint URL dan Gemini API Key secara langsung melalui tombol **Pengaturan (Ikon Roda Gigi)** di antarmuka web tanpa perlu merestart server.*
