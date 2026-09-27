// state.js - Reactive Client State Store for SavingToken

export const state = {
  models: [],
  activeModelId: 'auto',
  activeModelObj: null,
  billing: {
    msisdn: '+6281298765432',
    planName: 'Enterprise AI Prime',
    pulsaBalanceIdr: 175000,
    tokenQuotaRemaining: 4850000,
    totalMoneySavedIdr: 48700,
    formattedPulsa: 'Rp 175.000',
    formattedQuota: '4.850.000 Token',
    formattedSavedMoney: 'Rp 48.700',
    packages: []
  },
  transactions: [],
  cacheStats: {
    cacheSize: 0,
    stats: {
      cacheHits: 0,
      tokensPrunedTotal: 0,
      totalCostSavedIdr: 0
    }
  },
  appMode: 'telkomsel', // 'telkomsel' (Tombol 1) | 'omni' (Tombol 2)
  telkomselModel: 'deepseek-r1-telkomsel',
  enableCompression: true,
  nanoBananaMode: false,
  attachedMedia: null, // { name, type, base64 }
  isStreaming: false
};

export function setActiveModel(modelId) {
  state.activeModelId = modelId;
  state.activeModelObj = state.models.find(m => m.id === modelId) || null;
  if (modelId.includes('telkomsel')) {
    state.telkomselModel = modelId;
  }
}

export function setAppMode(mode) {
  state.appMode = mode;
  if (mode === 'telkomsel') {
    state.activeModelId = state.telkomselModel || 'deepseek-r1-telkomsel';
  } else {
    state.activeModelId = 'auto';
  }
  state.activeModelObj = state.models.find(m => m.id === state.activeModelId) || null;
}

export function updateBilling(billingData, transactions = []) {
  if (billingData) {
    state.billing = { ...state.billing, ...billingData };
  }
  if (transactions && transactions.length > 0) {
    state.transactions = transactions;
  }
}
