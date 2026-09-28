// server/index.js - SavingToken LLM-Connector & Telkomsel Gateway Express Server
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import llmConnector from './router/llmConnector.js';
import billingService from './router/billingService.js';
import telkomselCluster from './router/telkomselCluster.js';
import commercialProvider from './router/commercialProvider.js';
import mockStreamer from './mock/mockStreamer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Global runtime settings
const runtimeConfig = {
  telkomselGpuUrl: process.env.TELKOMSEL_GPU_URL || 'http://127.0.0.1:8000/v1',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  mode: 'hybrid' // 'hybrid' | 'real_only'
};

// 1. Get Models Catalog & Health Status
app.get('/api/status', async (req, res) => {
  const clusterHealth = await telkomselCluster.checkHealth();
  res.json({
    appName: 'SavingToken LLM-Connector AI',
    version: '0.0.1',
    mode: runtimeConfig.mode,
    geminiConfigured: commercialProvider.hasGeminiKey(),
    telkomselCluster: {
      url: runtimeConfig.telkomselGpuUrl,
      online: clusterHealth.online,
      error: clusterHealth.error
    },
    models: [
      {
        id: 'auto',
        name: '⚡ Smart LLM-Connector (Auto)',
        category: 'In-House Multi-LLM Gateway',
        description: 'Gateway mandiri hemat energi & biaya ke berbagai LLM berbayar',
        badge: 'In-House Engine',
        isDefault: true
      },
      // Open Source Mesin Telkomsel
      {
        id: 'deepseek-r1-telkomsel',
        name: 'DeepSeek-R1 (Mesin Telkomsel)',
        category: 'Mesin Telkomsel (Open Source)',
        description: 'Penalaran mendalam & matematika dengan stream pemikiran',
        badge: 'Super Hemat',
        provider: 'telkomsel_oss'
      },
      {
        id: 'deepseek-v3-telkomsel',
        name: 'DeepSeek-V3 (Mesin Telkomsel)',
        category: 'Mesin Telkomsel (Open Source)',
        description: 'Model serbaguna cepat untuk kebutuhan harian',
        badge: 'Kedaulatan Data',
        provider: 'telkomsel_oss'
      },
      {
        id: 'glm-4-telkomsel',
        name: 'GLM-4 / GLM-Edge (Mesin Telkomsel)',
        category: 'Mesin Telkomsel (Open Source)',
        description: 'Dioptimasi untuk coding & bilingual Indonesia-Inggris',
        badge: 'Coding Specialist',
        provider: 'telkomsel_oss'
      },
      {
        id: 'qwen-2.5-telkomsel',
        name: 'Qwen 2.5 72B (Mesin Telkomsel)',
        category: 'Mesin Telkomsel (Open Source)',
        description: 'Model open source kapasitas tinggi kecepatan tinggi',
        badge: 'Cepat & Ringan',
        provider: 'telkomsel_oss'
      },
      // Commercial APIs
      {
        id: 'gemini-3.8-flash',
        name: 'Gemini 3.8 Flash (Multimodal)',
        category: 'Commercial (Berbayar)',
        description: 'Cepat, vision, dokumen, audio, dan groundings web',
        badge: 'Multimodal',
        provider: 'commercial'
      },
      {
        id: 'gemini-3.8-nanobanana',
        name: 'Gemini 3.8 NanoBanana (Image Gen)',
        category: 'Commercial (Berbayar)',
        description: 'Studio generasi visual & render gambar resolusi tinggi',
        badge: 'NanoBanana Studio',
        provider: 'commercial'
      },
      {
        id: 'gemini-3.8-pro-multimodal',
        name: 'Gemini 3.8 Pro (Video & Canvas)',
        category: 'Commercial (Berbayar)',
        description: 'Analisis video frame-by-frame dan konteks besar',
        badge: 'Video Engine',
        provider: 'commercial'
      },
      {
        id: 'gpt-6.0-omni',
        name: 'GPT-6.0 Omni Preview',
        category: 'Commercial (Berbayar)',
        description: 'Model komersial tier teratas dengan penalaran mutakhir',
        badge: 'Premium API',
        provider: 'commercial'
      }
    ]
  });
});

// 2. Chat Stream Endpoint (Server-Sent Events)
app.post('/api/chat', async (req, res) => {
  const { prompt, model = 'auto', media = null, enableCompression = true } = req.body;

  if (!prompt && !media) {
    return res.status(400).json({ error: 'Prompt atau media diperlukan' });
  }

  // Setup SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    // STEP 1: Check Semantic Cache
    const cacheHit = llmConnector.checkCache(prompt);
    if (cacheHit && !media) {
      // 100% token saved!
      sendEvent('cache_hit', {
        similarity: cacheHit.similarity || 100,
        tokensSaved: cacheHit.tokensSaved || llmConnector.estimateTokens(prompt) * 2,
        cachedAt: cacheHit.cachedAt
      });

      sendEvent('chunk', { type: 'content', content: cacheHit.response });

      // Record zero cost billing
      const billingResult = billingService.recordUsage({
        modelId: cacheHit.model || 'cache',
        inputTokens: llmConnector.estimateTokens(prompt),
        outputTokens: llmConnector.estimateTokens(cacheHit.response),
        isCacheHit: true,
        tokensSaved: cacheHit.tokensSaved || llmConnector.estimateTokens(prompt) * 2,
        promptSnippet: prompt
      });

      sendEvent('stats', {
        isCacheHit: true,
        modelUsed: cacheHit.model || 'Semantic Cache',
        tokensSaved: cacheHit.tokensSaved,
        costIdr: 0,
        billing: billingResult.account
      });

      sendEvent('done', {});
      return res.end();
    }

    // STEP 2: Token Pruning & Compression
    let effectivePrompt = prompt;
    let pruneStats = { originalTokens: 0, prunedTokens: 0, tokensSaved: 0, reductionPercent: 0 };

    if (enableCompression && prompt) {
      pruneStats = llmConnector.prunePrompt(prompt);
      effectivePrompt = pruneStats.prunedPrompt;
      sendEvent('prune_stats', pruneStats);
    } else {
      const tokens = llmConnector.estimateTokens(prompt);
      pruneStats = { originalTokens: tokens, prunedTokens: tokens, tokensSaved: 0, reductionPercent: 0 };
    }

    // STEP 3: Smart Tiered Routing
    const routeDecision = llmConnector.determineRoute(
      effectivePrompt,
      model,
      Boolean(media),
      media?.type
    );

    sendEvent('route_decision', routeDecision);

    // STEP 4: Check if NanoBanana Image Generation is requested
    let generatedImage = null;
    if (routeDecision.modelId.includes('nanobanana') || effectivePrompt.toLowerCase().startsWith('/imagine')) {
      sendEvent('status_update', { message: '🎨 Menjalankan Gemini NanoBanana Image Engine...' });
      const imgResult = await commercialProvider.generateNanoBananaImage({ prompt: effectivePrompt });
      if (imgResult.success) {
        generatedImage = imgResult.imageUrl;
        sendEvent('image_ready', {
          imageUrl: generatedImage,
          engine: imgResult.engine,
          prompt: imgResult.prompt
        });
      }
    }

    // STEP 5: Dispatch to Model (Real or Simulator)
    let fullResponseText = '';
    let fullReasoningText = '';

    const handleChunk = (chunk) => {
      sendEvent('chunk', chunk);
    };

    const handleComplete = (result) => {
      fullResponseText = result.text || '';
      fullReasoningText = result.reasoning || '';
    };

    // Attempt real connection if requested & configured
    let dispatchedSuccessfully = false;

    if (routeDecision.provider === 'commercial' && commercialProvider.hasGeminiKey()) {
      try {
        await commercialProvider.streamGemini({
          model: routeDecision.modelId,
          prompt: effectivePrompt,
          media,
          onChunk: handleChunk,
          onComplete: handleComplete,
          onError: (e) => { throw e; }
        });
        dispatchedSuccessfully = true;
      } catch (err) {
        sendEvent('fallback_notice', {
          message: `Koneksi API Cloud bermasalah (${err.message}). Mengalihkan ke Sovereign Cluster Telkomsel & Simulator.`
        });
      }
    }

    // If not handled by real API, run through high-fidelity hybrid streamer
    if (!dispatchedSuccessfully) {
      await mockStreamer.streamResponse({
        modelId: routeDecision.modelId,
        prompt: effectivePrompt,
        media,
        onChunk: handleChunk,
        onComplete: handleComplete
      });
    }

    // STEP 6: Save to Semantic Cache for future queries
    const outputTokens = llmConnector.estimateTokens(fullResponseText);
    llmConnector.saveToCache(
      prompt,
      fullResponseText,
      routeDecision.modelId,
      { reasoning: fullReasoningText },
      pruneStats.prunedTokens + outputTokens
    );

    // STEP 7: Billing deduction & transaction recording
    const billingResult = billingService.recordUsage({
      modelId: routeDecision.modelId,
      inputTokens: pruneStats.prunedTokens,
      outputTokens,
      isCacheHit: false,
      tokensSaved: pruneStats.tokensSaved,
      imagesGenerated: generatedImage ? 1 : 0,
      promptSnippet: prompt
    });

    sendEvent('stats', {
      isCacheHit: false,
      modelUsed: routeDecision.modelId,
      provider: routeDecision.provider,
      inputTokens: pruneStats.prunedTokens,
      outputTokens,
      totalTokens: pruneStats.prunedTokens + outputTokens,
      originalTokens: pruneStats.originalTokens,
      tokensSaved: pruneStats.tokensSaved,
      reductionPercent: pruneStats.reductionPercent,
      costCalc: billingResult.costCalc,
      billing: billingResult.account
    });

    sendEvent('done', {});
    res.end();
  } catch (error) {
    sendEvent('error', { message: error.message });
    res.end();
  }
});

// 3. Billing & Account Management Endpoints
app.get('/api/billing', (req, res) => {
  res.json({
    summary: billingService.getAccountSummary(),
    transactions: billingService.getTransactions()
  });
});

app.post('/api/billing/topup', (req, res) => {
  const { packageId, nominalIdr, method = 'PULSA_TELKOMSEL' } = req.body;
  try {
    if (packageId) {
      const result = billingService.topUpPackage(packageId, method);
      return res.json(result);
    } else if (nominalIdr) {
      const summary = billingService.topUpPulsa(Number(nominalIdr));
      return res.json({ success: true, account: summary });
    }
    res.status(400).json({ error: 'packageId atau nominalIdr diperlukan' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Cache & Router Analytics Endpoint
app.get('/api/cache/stats', (req, res) => {
  res.json({
    cacheSize: llmConnector.cache.size,
    stats: llmConnector.stats
  });
});

app.post('/api/cache/clear', (req, res) => {
  llmConnector.cache.clear();
  res.json({ success: true, message: 'Semantic Cache berhasil dibersihkan' });
});

// 5. Update Runtime Configuration (Settings)
app.post('/api/settings', (req, res) => {
  const { telkomselGpuUrl, geminiApiKey, openAiApiKey } = req.body;
  if (telkomselGpuUrl !== undefined) {
    runtimeConfig.telkomselGpuUrl = telkomselGpuUrl;
    telkomselCluster.baseUrl = telkomselGpuUrl;
  }
  if (geminiApiKey !== undefined) {
    runtimeConfig.geminiApiKey = geminiApiKey;
    commercialProvider.setKeys({ geminiApiKey });
  }
  if (openAiApiKey !== undefined) {
    runtimeConfig.openAiApiKey = openAiApiKey;
    commercialProvider.setKeys({ openAiApiKey });
  }

  res.json({
    success: true,
    message: 'Pengaturan berhasil disimpan',
    config: {
      telkomselGpuUrl: runtimeConfig.telkomselGpuUrl,
      geminiConfigured: commercialProvider.hasGeminiKey()
    }
  });
});

// Static assets from public, src, and dist
app.use(express.static(path.join(rootDir, 'public')));
app.use(express.static(path.join(rootDir, 'src')));
app.use(express.static(path.join(rootDir, 'dist')));

// For direct development: serve frontend index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(rootDir, 'src', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 SavingToken LLM-Connector AI Engine Running on Port ${PORT}`);
  console.log(`📡 Sovereign Telkomsel GPU Cluster URL: ${runtimeConfig.telkomselGpuUrl}`);
  console.log(`💎 Gemini 3.8 / NanoBanana Status: ${commercialProvider.hasGeminiKey() ? 'Online (Real API)' : 'Hybrid Simulation Mode'}`);
  console.log(`⚡ Open in browser: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
