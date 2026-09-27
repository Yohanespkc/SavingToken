// mockStreamer.js - Realistic High-Fidelity Streaming Engine for Hybrid Simulation Mode

export class MockStreamer {
  constructor() {}

  // Generate realistic response based on model and prompt
  async streamResponse({ modelId, prompt, media, onChunk, onComplete }) {
    const isR1 = modelId.includes('r1');
    const isGlm = modelId.includes('glm');
    const isGemini = modelId.includes('gemini');
    const isNanoBanana = modelId.includes('nanobanana') || prompt.toLowerCase().includes('/imagine');

    let reasoningText = '';
    let responseText = '';

    if (isNanoBanana) {
      responseText = `✨ **Gemini 3.8 NanoBanana Studio** telah memproses prompt visual Anda:\n\n> **"${prompt.replace(/\/imagine|\/gambar/gi, '').trim()}"**\n\n- **Engine**: Gemini Imagen 3.0 / NanoBanana Ultra Engine\n- **Resolusi**: 2048 x 2048 High Dynamic Range\n- **Warna & Komposisi**: Optimal contrast, cinematic lighting, and fine detail rendering.\n\nGambar visual di bawah siap diunduh atau digunakan untuk kebutuhan Anda:`;
    } else if (isR1) {
      reasoningText = `Menganalisis permintaan: "${prompt.slice(0, 80)}..."\n1. Mengidentifikasi kata kunci dan kebutuhan inti pengguna.\n2. Mengevaluasi pendekatan paling efisien dan meminimalkan redundansi komputasi.\n3. Menyusun formula jawaban terstruktur dengan akurasi tinggi dan bahasa Indonesia formal yang jelas.\n4. Memverifikasi fakta dan logika komparasi sebelum merender output akhir.`;

      responseText = `### 🧠 Solusi Cerdas (DeepSeek-R1 Sovereign Telkomsel)\n\nTerima kasih! Pertanyaan Anda telah dioptimasi melalui **SavingToken OmniRouter** dan diproses langsung pada infrastruktur GPU Sovereign Telkomsel tanpa biaya gateway luar.\n\n#### Inti Analisis:\n- **Efisiensi Token**: Prompt Anda berhasil dipadatkan tanpa menghilangkan konteks esensial.\n- **Kedaulatan Data**: Data transaksi dan inferensi tetap berada dalam batas jaringan nasional Telkomsel.\n- **Rekomendasi Utama**:\n  1. Menggunakan **Semantic Caching** untuk kueri berulang menghemat 100% token.\n  2. Routing otomatis ke **DeepSeek-R1** memberikan penalaran kompleks setara model komersial tier-1.\n  3. Penggunaan kuota flat Telkomsel menjamin kepastian biaya operasional.\n\nApakah ada studi kasus atau implementasi lanjutan yang ingin Anda eksplorasi bersama?`;
    } else if (isGlm) {
      responseText = `### ⚡ Respon GLM-4 Telkomsel Engine\n\nKode dan implementasi teknis untuk kueri Anda siap digunakan:\n\n\`\`\`javascript\n// Contoh Integrasi Endpoint SavingToken Telkomsel\nasync function dispatchQuery(prompt) {\n  const response = await fetch('/api/chat', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({\n      prompt: prompt,\n      model: 'auto', // Smart OmniRouter\n      compression: true\n    })\n  });\n  return await response.json();\n}\n\`\`\`\n\nGLM-4 dioptimasi khusus untuk eksekusi logika pemrograman bilingual (Indonesia - Inggris) dengan latensi ultra-rendah di jaringan Telkomsel.`;
    } else if (isGemini) {
      responseText = `### 🌐 Respon Gemini 3.8 Flash Multimodal Gateway\n\nKueri Anda berhasil diproses melalui **Gemini 3.8 Enterprise API** terintegrasi dengan Telkomsel Billing.\n\n- **Fitur Multimodal Aktif**: Analisis Vision, NanoBanana generator, dan grounding informasi terkini.\n- **Efisiensi Pemakaian**: Token input telah dipadatkan sebesar ~40% sebelum dikirimkan ke endpoint Gemini, meminimalkan pemotongan pulsa Telkomsel Anda.\n\nSemua kapabilitas native Gemini (pemahaman dokumen, ekstraksi video frame, dan generasi konten) berjalan lancar melalui satu pintu antarmuka SavingToken.`;
    } else {
      responseText = `Permintaan Anda berhasil dieksekusi dengan model **${modelId}**.\n\nMelalui arsitektur **SavingToken OmniRouter**, setiap teks yang Anda kirimkan disaring dari kata-kata mubazir, dicocokkan dengan basis memori semantik, dan diarahkan ke model yang paling hemat biaya namun memberikan hasil maksimal.`;
    }

    // Stream reasoning if any (for R1)
    if (reasoningText) {
      const reasoningChunks = reasoningText.split(' ');
      for (const word of reasoningChunks) {
        onChunk({ type: 'reasoning', content: word + ' ' });
        await new Promise(r => setTimeout(r, 15));
      }
    }

    // Stream main response
    const words = responseText.split(' ');
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      onChunk({ type: 'content', content: word + (i < words.length - 1 ? ' ' : '') });
      // Variable typing delay for organic feel
      await new Promise(r => setTimeout(r, 12 + Math.random() * 10));
    }

    onComplete({ text: responseText, reasoning: reasoningText });
  }
}

export default new MockStreamer();
