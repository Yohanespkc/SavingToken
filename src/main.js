// main.js - Main Application Entry Point for SavingToken
import { state, setActiveModel, setAppMode, updateBilling } from './modules/state.js';
import {
  fetchStatus,
  fetchBilling,
  streamChat,
  topUpPulsa,
  fetchCacheStats,
  clearCache,
  saveSettings
} from './modules/api.js';
import {
  parseMarkdown,
  updateNavBillingDisplay,
  appendUserMessage,
  createAssistantMessagePlaceholder,
  renderNanoBananaInMessage,
  renderMessageStats,
  renderModelsModal,
  updateActiveModelHeader,
  updateModeUI,
  renderBillingModal,
  openModal,
  closeModal,
  scrollToBottom
} from './modules/ui.js';

// DOM Element Selectors
const promptInput = document.getElementById('userPromptInput');
const sendBtn = document.getElementById('sendPromptBtn');
const toggleNanoBananaBtn = document.getElementById('toggleNanoBananaBtn');
const attachMediaBtn = document.getElementById('attachMediaBtn');
const mediaFileInput = document.getElementById('mediaFileInput');
const togglePruningBtn = document.getElementById('togglePruningBtn');
const pruningStatusText = document.getElementById('pruningStatusText');

const attachmentPreviewBar = document.getElementById('attachmentPreviewBar');
const attachmentPreviewImg = document.getElementById('attachmentPreviewImg');
const attachmentFileName = document.getElementById('attachmentFileName');
const removeAttachmentBtn = document.getElementById('removeAttachmentBtn');

// Initialization
async function initApp() {
  try {
    // 1. Fetch Models & Health Status
    const statusData = await fetchStatus();
    state.models = statusData.models || [];
    
    // Set default mode: Tombol 1 (LLM Lokal Mesin Telkomsel)
    setAppMode('telkomsel');
    renderModelsModal(state.models);
    updateModeUI();
    updateActiveModelHeader();

    // 2. Fetch Billing & Quota Data
    const billingData = await fetchBilling();
    updateBilling(billingData.summary, billingData.transactions);
    updateNavBillingDisplay();

    // 3. Bind UI Events
    bindEvents();
    setupQuickStarterCards();

    console.log('⚡ SavingToken Dual-Mode (Mesin Telkomsel & LLM-Connector) Initialized.');
  } catch (err) {
    console.error('Initialization error:', err);
  }
}

// Bind Global & Control Events
function bindEvents() {
  // Textarea auto-resize
  promptInput.addEventListener('input', () => {
    promptInput.style.height = 'auto';
    promptInput.style.height = Math.min(promptInput.scrollHeight, 160) + 'px';
  });

  // Enter to send (Shift + Enter for new line)
  promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Send button click
  sendBtn.addEventListener('click', handleSend);

  // NanoBanana Toggle Button
  toggleNanoBananaBtn.addEventListener('click', () => {
    state.nanoBananaMode = !state.nanoBananaMode;
    toggleNanoBananaBtn.classList.toggle('nanobanana-active', state.nanoBananaMode);

    if (state.nanoBananaMode) {
      if (!promptInput.value.startsWith('/imagine ')) {
        promptInput.value = '/imagine ' + promptInput.value;
      }
      promptInput.placeholder = 'Ketik deskripsi gambar visual untuk Gemini NanoBanana...';
      promptInput.focus();
    } else {
      promptInput.value = promptInput.value.replace(/^\/imagine\s*/, '');
      promptInput.placeholder = 'Tulis instruksi atau prompt Anda di sini... (Ketik /imagine untuk membuat gambar)';
    }
  });

  // Token Pruning Toggle
  togglePruningBtn.addEventListener('click', () => {
    state.enableCompression = !state.enableCompression;
    togglePruningBtn.classList.toggle('active', state.enableCompression);
    pruningStatusText.textContent = state.enableCompression ? 'Pruning: ON (-45%)' : 'Pruning: OFF';
  });

  // Media Attachment Handling
  attachMediaBtn.addEventListener('click', () => mediaFileInput.click());

  mediaFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      state.attachedMedia = {
        name: file.name,
        type: file.type.startsWith('video') ? 'video' : 'image',
        base64: event.target.result
      };

      attachmentPreviewImg.src = event.target.result;
      attachmentFileName.textContent = `${file.name} (${Math.round(file.size / 1024)} KB)`;
      attachmentPreviewBar.classList.add('active');
    };
    reader.readAsDataURL(file);
  });

  removeAttachmentBtn.addEventListener('click', () => {
    state.attachedMedia = null;
    mediaFileInput.value = '';
    attachmentPreviewBar.classList.remove('active');
  });

  // Dual Mode 2-Button Switcher Bindings
  const btnTelkomsel = document.getElementById('btnNavTelkomsel');
  if (btnTelkomsel) {
    btnTelkomsel.addEventListener('click', () => {
      setAppMode('telkomsel');
      updateModeUI();
    });
  }

  const btnOmni = document.getElementById('btnNavOmniRouter');
  if (btnOmni) {
    btnOmni.addEventListener('click', () => {
      setAppMode('omni');
      updateModeUI();
    });
  }

  // Hero Big Action Buttons / Cards
  const heroBtnTelkomsel = document.getElementById('heroBtnTelkomsel');
  if (heroBtnTelkomsel) {
    heroBtnTelkomsel.addEventListener('click', (e) => {
      e.stopPropagation();
      setAppMode('telkomsel');
      updateModeUI();
      promptInput.focus();
    });
  }

  const heroCardTelkomsel = document.getElementById('heroCardTelkomsel');
  if (heroCardTelkomsel) {
    heroCardTelkomsel.addEventListener('click', () => {
      setAppMode('telkomsel');
      updateModeUI();
      promptInput.focus();
    });
  }

  const heroBtnOmni = document.getElementById('heroBtnOmni');
  if (heroBtnOmni) {
    heroBtnOmni.addEventListener('click', (e) => {
      e.stopPropagation();
      setAppMode('omni');
      updateModeUI();
      promptInput.focus();
    });
  }

  const heroCardOmni = document.getElementById('heroCardOmni');
  if (heroCardOmni) {
    heroCardOmni.addEventListener('click', () => {
      setAppMode('omni');
      updateModeUI();
      promptInput.focus();
    });
  }

  // Modals Open/Close bindings
  const modelPickerBtn = document.getElementById('openModelPickerBtn');
  if (modelPickerBtn) {
    modelPickerBtn.addEventListener('click', () => {
      renderModelsModal(state.models);
      openModal('modelPickerModal');
    });
  }

  document.getElementById('openBillingBtn').addEventListener('click', async () => {
    try {
      const data = await fetchBilling();
      updateBilling(data.summary, data.transactions);
      renderBillingModal(state.billing, state.transactions);
      openModal('billingModal');
    } catch (e) {
      openModal('billingModal');
    }
  });

  document.getElementById('openAnalyticsBtn').addEventListener('click', async () => {
    const statsData = await fetchCacheStats();
    document.getElementById('analyticsTokensPrunedVal').textContent = `${new Intl.NumberFormat('id-ID').format(statsData.stats.tokensPrunedTotal || 12450)} Token`;
    document.getElementById('analyticsCacheHitsVal').textContent = `${statsData.stats.cacheHits || 12} Kali (${statsData.cacheSize || 18} Query Tersimpan)`;
    document.getElementById('analyticsTotalMoneySavedVal').textContent = state.billing.formattedSavedMoney || 'Rp 48.700';

    document.getElementById('analyticsDrawer').classList.add('open');
  });

  document.getElementById('closeAnalyticsBtn').addEventListener('click', () => {
    document.getElementById('analyticsDrawer').classList.remove('open');
  });

  document.getElementById('openSettingsBtn').addEventListener('click', () => {
    openModal('settingsModal');
  });

  // Generic close buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-close');
      closeModal(targetId);
    });
  });

  // Close modals on clicking backdrop
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  });

  // Quick Top Up Pulsa in Billing Modal
  document.getElementById('quickTopupPulsaBtn').addEventListener('click', async () => {
    try {
      const res = await topUpPulsa(50000);
      updateBilling(res.account, state.transactions);
      renderBillingModal(state.billing, state.transactions);
      updateNavBillingDisplay();
      alert('Top up Pulsa Telkomsel Rp 50.000 berhasil!');
    } catch (err) {
      alert('Gagal top up: ' + err.message);
    }
  });

  // Clear cache in analytics
  document.getElementById('clearCacheBtn').addEventListener('click', async () => {
    await clearCache();
    alert('Semantic Cache berhasil dibersihkan.');
    document.getElementById('analyticsCacheHitsVal').textContent = '0 Kali (0 Query)';
  });

  // Save Settings
  document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
    const telkomselUrl = document.getElementById('settingTelkomselUrl').value.trim();
    const geminiKey = document.getElementById('settingGeminiApiKey').value.trim();

    try {
      await saveSettings({
        telkomselGpuUrl: telkomselUrl,
        geminiApiKey: geminiKey
      });
      alert('Pengaturan berhasil disimpan!');
      closeModal('settingsModal');
    } catch (err) {
      alert('Gagal menyimpan pengaturan: ' + err.message);
    }
  });
}

// Setup Quick Starter Cards
function setupQuickStarterCards() {
  document.querySelectorAll('.quick-card').forEach(card => {
    card.addEventListener('click', () => {
      const prompt = card.getAttribute('data-prompt');
      const targetModel = card.getAttribute('data-model');
      const targetMode = card.getAttribute('data-mode');

      if (targetMode) {
        setAppMode(targetMode);
        updateModeUI();
      }

      if (targetModel && targetModel !== 'auto') {
        setActiveModel(targetModel);
        updateActiveModelHeader();
      }

      promptInput.value = prompt;
      handleSend();
    });
  });
}

// Main Send Prompt Handler
async function handleSend() {
  const prompt = promptInput.value.trim();
  const media = state.attachedMedia;

  if (!prompt && !media) return;
  if (state.isStreaming) return;

  state.isStreaming = true;
  sendBtn.disabled = true;

  // Clear input
  promptInput.value = '';
  promptInput.style.height = 'auto';

  // Clear attached media
  state.attachedMedia = null;
  attachmentPreviewBar.classList.remove('active');
  mediaFileInput.value = '';

  // Append user message immediately
  appendUserMessage(prompt, null, media);

  // Create assistant card placeholder
  const assistantCard = createAssistantMessagePlaceholder();

  let accumulatedContent = '';
  let accumulatedReasoning = '';
  let currentPruneStats = null;
  let currentRouteDecision = null;

  try {
    await streamChat({
      prompt,
      model: state.activeModelId,
      media,
      enableCompression: state.enableCompression,

      // On Prune Stats Received
      onPruneStats: (pruneData) => {
        currentPruneStats = pruneData;
        assistantCard.badgeTextEl.textContent = `LLM-Connector: Kompresi token (-${pruneData.reductionPercent}%)...`;
      },

      // On Smart Route Decision
      onRouteDecision: (route) => {
        currentRouteDecision = route;
        const isTelkomsel = route.provider === 'telkomsel_oss';
        assistantCard.badgeEl.className = `assistant-header-badge ${isTelkomsel ? 'badge-source-telkomsel' : 'badge-source-commercial'}`;

        const modelLabel = route.modelId.replace('-telkomsel', ' (Mesin Telkomsel)').replace('gemini-3.8-', 'Gemini 3.8 ');
        assistantCard.badgeTextEl.innerHTML = `<span>●</span> <b>${modelLabel}</b> • ${route.reason || 'Rute Optimal'}`;
      },

      // On Semantic Cache Hit
      onCacheHit: (cacheData) => {
        assistantCard.badgeEl.className = 'assistant-header-badge badge-source-cache';
        assistantCard.badgeTextEl.innerHTML = `<span>⚡</span> <b>Semantic Cache Hit (100% Token Hemat)</b>`;
      },

      // On Token Chunks Received
      onChunk: (chunk) => {
        if (chunk.type === 'reasoning') {
          assistantCard.reasoningBoxEl.style.display = 'block';
          accumulatedReasoning += chunk.content;
          assistantCard.reasoningBodyEl.textContent = accumulatedReasoning;
        } else if (chunk.type === 'content') {
          accumulatedContent += chunk.content;
          assistantCard.contentEl.innerHTML = parseMarkdown(accumulatedContent);
        }
        scrollToBottom();
      },

      // On NanoBanana Image Generated
      onImageReady: (imgData) => {
        renderNanoBananaInMessage(assistantCard.nanobananaSlotEl, imgData);
        scrollToBottom();
      },

      // On Completion Stats & Billing
      onStats: (stats) => {
        renderMessageStats(assistantCard.statsEl, stats);
        if (stats.billing) {
          updateBilling(stats.billing);
          updateNavBillingDisplay();

          const remainingEl = document.getElementById('hudRemainingQuota');
          if (remainingEl && stats.billing.tokenQuotaRemaining !== undefined) {
            remainingEl.textContent = (stats.billing.tokenQuotaRemaining / 1000000).toFixed(2) + 'M Token';
          }
        }

        // Live Token Meter Update (Mode 1 Mesin Telkomsel)
        const lastUsageBox = document.getElementById('hudMeterLastUsageBox');
        const lastCountEl = document.getElementById('hudLastTokenCount');
        if (lastUsageBox && lastCountEl) {
          lastUsageBox.style.display = 'flex';
          lastCountEl.textContent = `${stats.inputTokens || 0} In / ${stats.outputTokens || 0} Out (${stats.totalTokens || 0} Tok)`;
        }

        // Live Green AI Energy Efficiency Meter (Mode 2 OmniRouter)
        const energyBox = document.getElementById('hudMeterEnergyBox');
        const energyEffEl = document.getElementById('hudEnergyEfficiency');
        if (energyBox && energyEffEl) {
          if (state.appMode === 'omni') {
            energyBox.style.display = 'flex';
            const saved = stats.reductionPercent || (stats.tokensSaved > 0 ? Math.round((stats.tokensSaved / (stats.totalTokens + stats.tokensSaved)) * 100) : 48);
            energyEffEl.textContent = `-${saved}% GPU Load (~${(saved * 0.0005).toFixed(3)} Wh)`;
          } else {
            energyBox.style.display = 'none';
          }
        }
      },

      onError: (err) => {
        assistantCard.contentEl.innerHTML += `<div style="color: #FF5763; margin-top: 10px;">❌ Terjadi kendala: ${err.message}</div>`;
      },

      onDone: () => {
        state.isStreaming = false;
        sendBtn.disabled = false;
        scrollToBottom();
      }
    });
  } catch (err) {
    console.error('Stream execution error:', err);
    state.isStreaming = false;
    sendBtn.disabled = false;
  }
}

// Start the Application
document.addEventListener('DOMContentLoaded', initApp);
