// billingService.js - Telkomsel Carrier Billing, Quota Metering, and Cost Accounting

class BillingService {
  constructor() {
    // Default user account state with Telkomsel carrier data
    this.account = {
      msisdn: '+6281298765432', // Sample Telkomsel number
      planName: 'Telkomsel Enterprise AI Prime',
      pulsaBalanceIdr: 175000, // Pulsa Rp 175.000
      tokenQuotaRemaining: 4850000, // 4.85 Million Token Quota
      totalTokensConsumed: 150000,
      totalCostSpentIdr: 12500,
      totalMoneySavedIdr: 48700 // Compared to calling full commercial API without router
    };

    // Rates in Indonesian Rupiah (IDR)
    this.rates = {
      // Sovereign Telkomsel cluster: minimal compute / internal bandwidth cost
      'deepseek-v3-telkomsel': { inputPer1k: 1.5, outputPer1k: 2.5, isTelkomselOss: true },
      'deepseek-r1-telkomsel': { inputPer1k: 2.0, outputPer1k: 4.0, isTelkomselOss: true },
      'glm-4-telkomsel': { inputPer1k: 1.5, outputPer1k: 2.5, isTelkomselOss: true },
      'qwen-2.5-telkomsel': { inputPer1k: 1.5, outputPer1k: 2.5, isTelkomselOss: true },

      // Commercial APIs (Wholesale pass-through + Telkomsel billing gateway)
      'gemini-3.8-flash': { inputPer1k: 8.0, outputPer1k: 25.0, isTelkomselOss: false },
      'gemini-3.8-pro-multimodal': { inputPer1k: 20.0, outputPer1k: 60.0, isTelkomselOss: false },
      'gemini-3.8-nanobanana': { inputPer1k: 15.0, outputPer1k: 40.0, fixedCostPerImage: 250, isTelkomselOss: false },
      'gpt-6.0-omni': { inputPer1k: 35.0, outputPer1k: 95.0, isTelkomselOss: false },
      'claude-3.7-sonnet': { inputPer1k: 40.0, outputPer1k: 110.0, isTelkomselOss: false }
    };

    // Available Telkomsel Quota & Pulsa Packages
    this.packages = [
      {
        id: 'pkg-student',
        name: 'Paket AI Mahasiswa / Edukasi',
        tokenQuota: 1000000,
        priceIdr: 25000,
        badge: 'Hemat',
        description: '1 Juta Token Mesin Telkomsel + Bonus 100K Token Gemini Flash'
      },
      {
        id: 'pkg-pro',
        name: 'Paket Telkomsel AI Developer Pro',
        tokenQuota: 10000000,
        priceIdr: 150000,
        badge: 'Terpopuler',
        description: '10 Juta Token Mesin Telkomsel OSS + Bebas Routing Gemini & DeepSeek-R1'
      },
      {
        id: 'pkg-corp',
        name: 'Paket Telkomsel Enterprise Sovereign',
        tokenQuota: 50000000,
        priceIdr: 650000,
        badge: 'Enterprise',
        description: '50 Juta Token Dedicated GPU Telkomsel + Prioritas Jalur Cepat & API Multimodal'
      }
    ];

    // Transaction history log
    this.transactions = [
      {
        id: 'TX-TS-9841',
        timestamp: Date.now() - 3600000 * 2,
        model: 'deepseek-v3-telkomsel',
        type: 'Telkomsel OSS',
        inputTokens: 320,
        outputTokens: 580,
        totalTokens: 900,
        costIdr: 1.93,
        tokensSaved: 420,
        status: 'SUCCESS',
        note: 'Optimasi token prompt (-57%) via Mesin Telkomsel'
      },
      {
        id: 'TX-TS-9842',
        timestamp: Date.now() - 3600000 * 1,
        model: 'gemini-3.8-nanobanana',
        type: 'Commercial Gemini',
        inputTokens: 180,
        outputTokens: 410,
        totalTokens: 590,
        costIdr: 265, // Includes image generation
        tokensSaved: 110,
        status: 'SUCCESS',
        note: 'Generasi visual NanoBanana (Potong Pulsa Telkomsel)'
      }
    ];
  }

  // Calculate cost and savings for a query
  calculateCost({ modelId, inputTokens, outputTokens, isCacheHit = false, imagesGenerated = 0 }) {
    if (isCacheHit) {
      // 100% saved! Cost is 0
      const standardCost = ((inputTokens * 25.0) + (outputTokens * 70.0)) / 1000;
      return {
        actualCostIdr: 0,
        benchmarkCommercialCostIdr: Math.round(standardCost),
        moneySavedIdr: Math.round(standardCost),
        chargeMethod: 'Semantic Cache (Gratis)',
        isFree: true
      };
    }

    const rate = this.rates[modelId] || { inputPer1k: 2.0, outputPer1k: 4.0, isTelkomselOss: true };
    const inputCost = (inputTokens / 1000) * rate.inputPer1k;
    const outputCost = (outputTokens / 1000) * rate.outputPer1k;
    let imageCost = 0;
    if (imagesGenerated > 0 && rate.fixedCostPerImage) {
      imageCost = imagesGenerated * rate.fixedCostPerImage;
    }

    const actualCost = Math.max(0.1, inputCost + outputCost + imageCost);

    // Benchmark standard cost if run purely on expensive commercial model (e.g. GPT-6 / Claude @ Rp 95/1K)
    const benchmarkCommercial = ((inputTokens * 35.0) + (outputTokens * 95.0)) / 1000 + (imagesGenerated * 400);
    const moneySaved = Math.max(0, benchmarkCommercial - actualCost);

    return {
      actualCostIdr: Number(actualCost.toFixed(2)),
      benchmarkCommercialCostIdr: Number(benchmarkCommercial.toFixed(2)),
      moneySavedIdr: Number(moneySaved.toFixed(2)),
      chargeMethod: rate.isTelkomselOss ? 'Kuota Token Telkomsel' : 'Potong Pulsa Telkomsel',
      isFree: false
    };
  }

  // Deduct tokens and charge billing
  recordUsage({ modelId, inputTokens, outputTokens, isCacheHit = false, tokensSaved = 0, imagesGenerated = 0, promptSnippet = '' }) {
    const costCalc = this.calculateCost({ modelId, inputTokens, outputTokens, isCacheHit, imagesGenerated });
    const totalTokens = inputTokens + outputTokens;

    if (!isCacheHit) {
      const rate = this.rates[modelId] || { isTelkomselOss: true };

      if (rate.isTelkomselOss) {
        // Deduct from Token Quota first
        if (this.account.tokenQuotaRemaining >= totalTokens) {
          this.account.tokenQuotaRemaining -= totalTokens;
        } else {
          // If token quota exhausted, deduct remaining in Pulsa
          const remainingTokens = totalTokens - this.account.tokenQuotaRemaining;
          this.account.tokenQuotaRemaining = 0;
          this.account.pulsaBalanceIdr = Math.max(0, this.account.pulsaBalanceIdr - costCalc.actualCostIdr);
        }
      } else {
        // Commercial model: deduct Pulsa Telkomsel
        this.account.pulsaBalanceIdr = Math.max(0, this.account.pulsaBalanceIdr - costCalc.actualCostIdr);
      }

      this.account.totalTokensConsumed += totalTokens;
      this.account.totalCostSpentIdr += costCalc.actualCostIdr;
    }

    this.account.totalMoneySavedIdr += costCalc.moneySavedIdr;

    // Record in transaction log
    const tx = {
      id: `TX-TS-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: Date.now(),
      model: modelId,
      type: (this.rates[modelId] && this.rates[modelId].isTelkomselOss) ? 'Mesin Telkomsel' : 'Commercial API',
      inputTokens,
      outputTokens,
      totalTokens,
      costIdr: costCalc.actualCostIdr,
      tokensSaved,
      status: 'SUCCESS',
      isCacheHit,
      chargeMethod: costCalc.chargeMethod,
      note: isCacheHit ? 'Hit Semantic Cache (Biaya Rp 0)' : `${promptSnippet.slice(0, 35)}...`
    };

    this.transactions.unshift(tx);
    // Keep last 40 transactions
    if (this.transactions.length > 40) {
      this.transactions.pop();
    }

    return {
      costCalc,
      account: this.getAccountSummary(),
      transaction: tx
    };
  }

  // Top up quota or pulsa
  topUpPackage(packageId, paymentMethod = 'PULSA_TELKOMSEL') {
    const pkg = this.packages.find(p => p.id === packageId);
    if (!pkg) throw new Error('Paket tidak ditemukan');

    this.account.tokenQuotaRemaining += pkg.tokenQuota;

    const tx = {
      id: `TOPUP-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: Date.now(),
      model: 'TOP-UP',
      type: 'Pembelian Paket Quota',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: pkg.tokenQuota,
      costIdr: pkg.priceIdr,
      tokensSaved: 0,
      status: 'SUCCESS',
      chargeMethod: paymentMethod,
      note: `Aktivasi ${pkg.name}`
    };

    this.transactions.unshift(tx);
    return {
      success: true,
      package: pkg,
      account: this.getAccountSummary()
    };
  }

  // Top up pulsa Telkomsel directly
  topUpPulsa(nominalIdr) {
    this.account.pulsaBalanceIdr += nominalIdr;
    return this.getAccountSummary();
  }

  // Get full billing summary
  getAccountSummary() {
    return {
      ...this.account,
      formattedPulsa: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(this.account.pulsaBalanceIdr),
      formattedQuota: new Intl.NumberFormat('id-ID').format(this.account.tokenQuotaRemaining) + ' Token',
      formattedSavedMoney: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(this.account.totalMoneySavedIdr),
      rates: this.rates,
      packages: this.packages
    };
  }

  getTransactions() {
    return this.transactions;
  }
}

export default new BillingService();
