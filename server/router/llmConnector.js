// llmConnector.js - In-House Native LLM-Connector Engine
// Smart Token Pruning, Semantic Cache, Energy Optimization, and Tiered Multi-LLM Gateway
// 100% Native In-House implementation (Zero dependency on third-party SaaS proxy)

class LLMConnector {
  constructor() {
    // In-memory semantic cache with TTL & hit counting
    this.cache = new Map();
    // Cache & energy stats
    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      tokensPrunedTotal: 0,
      originalTokensTotal: 0,
      actualTokensUsedTotal: 0,
      totalCostSavedIdr: 0,
      totalEnergySavedWh: 0 // Estimated Watt-hours saved
    };

    // Polite / redundant prefixes & fillers commonly found in user queries
    this.redundantPrefixes = [
      /^halo\s*(bot|ai|admin|connector)?\s*[,.-]?\s*/i,
      /^permisi\s*(bot|kak|mas|mbak)?\s*[,.-]?\s*/i,
      /^tolong\s*(bantu|jelaskan|buatkan|tuliskan|berikan)?\s*/i,
      /^bisa\s*(tolong|kah|bantu)?\s*/i,
      /^mohon\s*(bantuannya|jelaskan|buatkan)?\s*/i,
      /^selamat\s*(pagi|siang|sore|malam)\s*[,.-]?\s*/i,
      /^hi\s*(there|assistant|bot)?\s*[,.-]?\s*/i,
      /^please\s*(help\s*me|assist\s*me|explain|write|generate)?\s*/i,
      /^can\s*you\s*(please)?\s*(help|explain|tell|write)?\s*/i,
      /^saya\s*ingin\s*(tahu|bertanya|meminta|membuat)?\s*/i,
      /^aku\s*mau\s*(tanya|minta)?\s*/i,
      /^apakah\s*anda\s*bisa\s*/i
    ];

    this.redundantSuffixes = [
      /\s*terima\s*kasih\s*(banyak|ya|sebelumnya)?\s*[.!]*$/i,
      /\s*makasih\s*(banyak|ya)?\s*[.!]*$/i,
      /\s*thanks\s*(a\s*lot|in\s*advance)?\s*[.!]*$/i,
      /\s*thank\s*you\s*(very\s*much)?\s*[.!]*$/i,
      /\s*mohon\s*dijawab\s*secepatnya\s*[.!]*$/i
    ];
  }

  // Simple token estimator (~3.8 to 4 chars per token for multilingual text)
  estimateTokens(text) {
    if (!text) return 0;
    const words = text.trim().split(/\s+/).length;
    const chars = text.length;
    return Math.max(1, Math.round((chars * 0.28) + (words * 0.72)));
  }

  // Token Pruning Engine: strips conversational fillers, repetitive spaces, and normalizes
  prunePrompt(prompt) {
    if (!prompt || typeof prompt !== 'string') {
      return {
        originalPrompt: prompt || '',
        prunedPrompt: prompt || '',
        originalTokens: 0,
        prunedTokens: 0,
        tokensSaved: 0,
        reductionPercent: 0,
        energySavedWh: 0
      };
    }

    const originalTokens = this.estimateTokens(prompt);
    let cleaned = prompt.trim();

    // 1. Remove conversational prefixes
    for (const pattern of this.redundantPrefixes) {
      if (pattern.test(cleaned)) {
        cleaned = cleaned.replace(pattern, '').trim();
      }
    }

    // 2. Remove conversational suffixes
    for (const pattern of this.redundantSuffixes) {
      if (pattern.test(cleaned)) {
        cleaned = cleaned.replace(pattern, '').trim();
      }
    }

    // 3. Compress repetitive newlines & spaces
    cleaned = cleaned.replace(/[ \t]+/g, ' ');
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // If pruning resulted in empty string, fallback to original
    if (!cleaned) {
      cleaned = prompt.trim();
    }

    const prunedTokens = this.estimateTokens(cleaned);
    const tokensSaved = Math.max(0, originalTokens - prunedTokens);
    const reductionPercent = originalTokens > 0 ? Math.round((tokensSaved / originalTokens) * 100) : 0;
    // Estimated ~0.0004 Wh per token compute saved on cloud GPU cluster
    const energySavedWh = Number((tokensSaved * 0.0004).toFixed(4));

    this.stats.tokensPrunedTotal += tokensSaved;
    this.stats.totalEnergySavedWh += energySavedWh;

    return {
      originalPrompt: prompt,
      prunedPrompt: cleaned,
      originalTokens,
      prunedTokens,
      tokensSaved,
      reductionPercent,
      energySavedWh
    };
  }

  // Normalized key for cache lookup
  normalizeForCache(text) {
    return text.toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Check semantic cache
  checkCache(prompt) {
    const key = this.normalizeForCache(prompt);
    if (!key) return null;

    // Exact or near-exact match in cache
    if (this.cache.has(key)) {
      const entry = this.cache.get(key);
      // Check TTL (24 hours)
      if (Date.now() - entry.timestamp < 24 * 60 * 60 * 1000) {
        entry.hits++;
        this.stats.cacheHits++;
        return {
          hit: true,
          response: entry.response,
          model: entry.model,
          metadata: entry.metadata,
          tokensSaved: entry.tokensUsed,
          cachedAt: entry.timestamp,
          hits: entry.hits,
          energySavedWh: Number((entry.tokensUsed * 0.0004).toFixed(4))
        };
      } else {
        this.cache.delete(key);
      }
    }

    // Fuzzy check for high similarity (> 92%)
    for (const [cachedKey, entry] of this.cache.entries()) {
      if (Date.now() - entry.timestamp > 24 * 60 * 60 * 1000) continue;
      const sim = this.calculateSimilarity(key, cachedKey);
      if (sim >= 0.92) {
        entry.hits++;
        this.stats.cacheHits++;
        return {
          hit: true,
          response: entry.response,
          model: entry.model,
          metadata: entry.metadata,
          tokensSaved: entry.tokensUsed,
          similarity: Math.round(sim * 100),
          cachedAt: entry.timestamp,
          hits: entry.hits,
          energySavedWh: Number((entry.tokensUsed * 0.0004).toFixed(4))
        };
      }
    }

    return null;
  }

  // Jaccard word-level similarity
  calculateSimilarity(str1, str2) {
    const set1 = new Set(str1.split(' '));
    const set2 = new Set(str2.split(' '));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  // Save successful response to cache
  saveToCache(prompt, response, model, metadata = {}, tokensUsed = 0) {
    const key = this.normalizeForCache(prompt);
    if (!key || key.length < 5) return;
    this.cache.set(key, {
      response,
      model,
      metadata,
      tokensUsed,
      timestamp: Date.now(),
      hits: 0
    });
  }

  // Smart Routing Engine: classify query to determine the most cost-effective and optimal LLM
  determineRoute(prompt, requestedModel = 'auto', hasMedia = false, mediaType = null) {
    const normalized = prompt.toLowerCase();

    // 1. If user explicitly requested a specific model (other than 'auto')
    if (requestedModel && requestedModel !== 'auto') {
      const isCommercial = requestedModel.startsWith('gemini') || requestedModel.startsWith('gpt') || requestedModel.startsWith('claude');
      return {
        modelId: requestedModel,
        provider: isCommercial ? 'commercial' : 'telkomsel_oss',
        reason: 'User manual override',
        isAutoRouted: false
      };
    }

    // 2. NanoBanana / Image Generation intent
    const isImageGenIntent =
      normalized.startsWith('/imagine') ||
      normalized.startsWith('/gambar') ||
      /\b(buatkan\s*gambar|generate\s*image|draw|lukiskan|ciptakan\s*visual|nanobanana)\b/i.test(normalized);

    if (isImageGenIntent) {
      return {
        modelId: 'gemini-3.8-nanobanana',
        provider: 'commercial',
        capability: 'nanobanana_image_generation',
        reason: 'Permintaan pembuatan visual dialihkan ke Gemini NanoBanana Engine via LLM-Connector',
        isAutoRouted: true
      };
    }

    // 3. Multimodal video or complex image inspection
    if (hasMedia) {
      if (mediaType === 'video' || /\b(video|rekaman|mp4)\b/i.test(normalized)) {
        return {
          modelId: 'gemini-3.8-pro-multimodal',
          provider: 'commercial',
          capability: 'video_understanding',
          reason: 'Analisis video kompleks dialihkan ke Gemini 3.8 Multimodal via LLM-Connector',
          isAutoRouted: true
        };
      }
      return {
        modelId: 'gemini-3.8-flash',
        provider: 'commercial',
        capability: 'multimodal_vision',
        reason: 'Input visual dialihkan ke Gemini 3.8 Flash Vision (cepat & hemat energi)',
        isAutoRouted: true
      };
    }

    // 4. Deep Reasoning / Complex Math / Algorithmic logic
    const isDeepReasoning =
      /\b(bukti(kan)?|matematika|rumus|derivat|algoritma|kompleksitas|step-by-step\s*reasoning|analisis\s*mendalam|theorem)\b/i.test(normalized) ||
      prompt.length > 800;

    if (isDeepReasoning) {
      // Prioritize Sovereign Telkomsel DeepSeek-R1 (Zero Cloud Cost & Zero Foreign Leakage)
      return {
        modelId: 'deepseek-r1-telkomsel',
        provider: 'telkomsel_oss',
        capability: 'deep_reasoning',
        reason: 'Dialihkan ke DeepSeek-R1 (Mesin Telkomsel) untuk penalaran mendalam tanpa biaya API luar',
        isAutoRouted: true
      };
    }

    // 5. Code generation or technical Indonesian queries -> GLM-4 / DeepSeek-V3
    const isCodingOrTech =
      /\b(function|def |class |import |html|css|javascript|python|sql|database|api|endpoint|debug|error)\b/i.test(normalized);

    if (isCodingOrTech) {
      return {
        modelId: 'glm-4-telkomsel',
        provider: 'telkomsel_oss',
        capability: 'coding_tech',
        reason: 'Dialihkan ke GLM-4 (Mesin Telkomsel) untuk performa koding dan bilingual akurat',
        isAutoRouted: true
      };
    }

    // 6. Fast General Inquiries -> Qwen 2.5 / DeepSeek-V3 Telkomsel (default smart route)
    return {
      modelId: 'deepseek-v3-telkomsel',
      provider: 'telkomsel_oss',
      capability: 'general_chat',
      reason: 'Dialihkan ke DeepSeek-V3 (Mesin Telkomsel) untuk kecepatan maksimal & efisiensi token lokal',
      isAutoRouted: true
    };
  }
}

export default new LLMConnector();
