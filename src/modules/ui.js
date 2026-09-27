// ui.js - Dynamic UI Renderer, Markdown Formatter, and Modals Controller
import { state, setActiveModel } from './state.js';
import { topUpPackage, topUpPulsa, fetchBilling } from './api.js';

// Simple lightweight markdown parser with code highlighting support
export function parseMarkdown(text) {
  if (!text) return '';

  let html = text
    // Escape HTML characters
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks with syntax copy
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || 'code';
    return `
      <div class="code-block-wrapper">
        <div class="code-header">
          <span>${language.toUpperCase()}</span>
          <button class="copy-btn" onclick="navigator.clipboard.writeText(\`${code.replace(/`/g, '\\`').replace(/\\/g, '\\\\')}\`); this.textContent = 'Tersalin!'; setTimeout(() => this.textContent = 'Salin Kode', 2000)">Salin Kode</button>
        </div>
        <pre><code>${code.trim()}</code></pre>
      </div>
    `;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code style="background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.85em; color: #38BDF8;">$1</code>');

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 1.1rem; font-weight: 700; margin: 12px 0 6px; color: #F1F5F9;">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 1.25rem; font-weight: 800; margin: 16px 0 8px; color: #FFFFFF;">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 style="font-size: 1.4rem; font-weight: 800; margin: 18px 0 10px; color: #FFFFFF;">$1</h1>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote style="border-left: 3px solid var(--saver-green); padding-left: 12px; margin: 8px 0; color: #94A3B8; font-style: italic;">$1</blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Unordered list items
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li style="margin-left: 18px; margin-bottom: 4px;">$1</li>');

  // Line breaks
  html = html.replace(/\n\n/g, '<p style="margin-bottom: 8px;"></p>');
  html = html.replace(/\n/g, '<br>');

  return html;
}

// Update Top Navbar Billing Displays
export function updateNavBillingDisplay() {
  const pulsaEl = document.getElementById('navPulsaDisplay');
  const quotaEl = document.getElementById('navQuotaDisplay');
  const savingsTextEl = document.getElementById('navSavingsText');

  if (pulsaEl && state.billing.formattedPulsa) {
    pulsaEl.textContent = state.billing.formattedPulsa;
  }
  if (quotaEl && state.billing.tokenQuotaRemaining !== undefined) {
    const formattedTokenM = (state.billing.tokenQuotaRemaining / 1000000).toFixed(2) + 'M';
    quotaEl.textContent = formattedTokenM;
  }
  if (savingsTextEl && state.billing.totalMoneySavedIdr) {
    savingsTextEl.textContent = `Hemat ${state.billing.formattedSavedMoney || 'Rp 48.700'}`;
  }
}

// Render User Message in Chat
export function appendUserMessage(prompt, pruneStats = null, media = null) {
  const messagesList = document.getElementById('messagesList');
  const hero = document.getElementById('welcomeHero');
  if (hero) hero.style.display = 'none';

  const item = document.createElement('div');
  item.className = 'message-item message-user';

  let mediaHtml = '';
  if (media && media.base64) {
    mediaHtml = `<img src="${media.base64}" class="user-attachment-thumb" alt="attached media">`;
  }

  let prunePillHtml = '';
  if (pruneStats && pruneStats.tokensSaved > 0) {
    prunePillHtml = `
      <div class="user-prune-pill">
        <span>⚡ Terpotong ${pruneStats.tokensSaved} token mubazir (-${pruneStats.reductionPercent}%)</span>
      </div>
    `;
  }

  item.innerHTML = `
    ${mediaHtml}
    <div class="user-bubble">
      ${prompt.replace(/\n/g, '<br>')}
    </div>
    ${prunePillHtml}
  `;

  messagesList.appendChild(item);
  scrollToBottom();
}

// Create Assistant Message Card Placeholder
export function createAssistantMessagePlaceholder() {
  const messagesList = document.getElementById('messagesList');
  const hero = document.getElementById('welcomeHero');
  if (hero) hero.style.display = 'none';

  const item = document.createElement('div');
  item.className = 'message-item message-assistant';

  const msgId = `msg-assistant-${Date.now()}`;
  item.id = msgId;

  item.innerHTML = `
    <div class="assistant-header-badge badge-source-telkomsel" id="${msgId}-badge">
      <span class="pulse-indicator">●</span>
      <span id="${msgId}-badge-text">Memproses kueri via LLM-Connector...</span>
    </div>

    <!-- Collapsible Reasoning Box (DeepSeek-R1) -->
    <div class="reasoning-box" id="${msgId}-reasoning-box" style="display: none;">
      <div class="reasoning-header" id="${msgId}-reasoning-toggle">
        <div class="reasoning-title">
          <div class="reasoning-pulse-dot"></div>
          <span>🧠 Proses Berpikir (DeepSeek-R1 Mesin Telkomsel)</span>
        </div>
        <span id="${msgId}-reasoning-arrow" style="font-size: 0.75rem;">▲ Lipat</span>
      </div>
      <div class="reasoning-body" id="${msgId}-reasoning-body"></div>
    </div>

    <!-- NanoBanana Visual Studio Container -->
    <div id="${msgId}-nanobanana-slot"></div>

    <!-- Main Text Content Card -->
    <div class="assistant-content-card">
      <div class="markdown-body" id="${msgId}-content">
        <span style="color: #64748B;">⚡ Menghubungkan ke jalur komputasi cerdas...</span>
      </div>
    </div>

    <!-- Message Bottom Stats Footer Pill -->
    <div class="message-stats-pill" id="${msgId}-stats" style="display: none;"></div>
  `;

  messagesList.appendChild(item);
  scrollToBottom();

  // Setup toggle for reasoning
  const toggleBtn = document.getElementById(`${msgId}-reasoning-toggle`);
  const bodyEl = document.getElementById(`${msgId}-reasoning-body`);
  const arrowEl = document.getElementById(`${msgId}-reasoning-arrow`);
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isCollapsed = bodyEl.classList.toggle('collapsed');
      arrowEl.textContent = isCollapsed ? '▼ Buka' : '▲ Lipat';
    });
  }

  return {
    id: msgId,
    itemEl: item,
    badgeEl: document.getElementById(`${msgId}-badge`),
    badgeTextEl: document.getElementById(`${msgId}-badge-text`),
    reasoningBoxEl: document.getElementById(`${msgId}-reasoning-box`),
    reasoningBodyEl: document.getElementById(`${msgId}-reasoning-body`),
    nanobananaSlotEl: document.getElementById(`${msgId}-nanobanana-slot`),
    contentEl: document.getElementById(`${msgId}-content`),
    statsEl: document.getElementById(`${msgId}-stats`)
  };
}

// Render NanoBanana Visual Graphic
export function renderNanoBananaInMessage(slotEl, imgData) {
  if (!slotEl) return;
  slotEl.innerHTML = `
    <div class="nanobanana-canvas-card">
      <div class="nanobanana-header">
        <div class="nanobanana-badge">
          <span>🍌 GEMINI NANOBANANA STUDIO</span>
          <span style="font-size: 0.68rem; padding: 2px 6px; background: rgba(245, 158, 11, 0.2); border-radius: 4px;">2048 x 2048 HDR</span>
        </div>
        <span style="font-size: 0.72rem; color: #94A3B8;">Imagen 3.0 Engine</span>
      </div>
      <div class="nanobanana-img-wrapper">
        <img src="${imgData.imageUrl}" alt="${imgData.prompt || 'Generated visual'}">
      </div>
      <div class="nanobanana-actions-bar">
        <div class="nanobanana-prompt-preview" title="${imgData.prompt}">
          "${imgData.prompt}"
        </div>
        <div>
          <a href="${imgData.imageUrl}" download="nanobanana-visual.jpg" class="btn btn-saver" style="padding: 4px 10px; font-size: 0.72rem; text-decoration: none;">
            ⬇ Unduh Gambar
          </a>
        </div>
      </div>
    </div>
  `;
}

// Render Stats Pill for message
export function renderMessageStats(statsEl, stats) {
  if (!statsEl) return;
  statsEl.style.display = 'flex';

  if (stats.isCacheHit) {
    statsEl.innerHTML = `
      <div class="stats-left">
        <span class="stats-highlight">⚡ 100% Token & Energi Hemat (Semantic Cache)</span>
        <span class="stats-cost">Beban GPU: <b>0 Watt</b></span>
        <span class="stats-cost">Biaya: <b>Rp 0 (Gratis)</b></span>
      </div>
      <span class="stats-savings-tag">Latensi &lt; 40ms • Rp ${stats.tokensSaved ? Math.round(stats.tokensSaved * 0.08) : 25} Dihemat</span>
    `;
    return;
  }

  const isTelkomsel = stats.modelUsed && stats.modelUsed.includes('telkomsel');
  const savedPercent = stats.reductionPercent || (stats.tokensSaved > 0 ? Math.round((stats.tokensSaved / (stats.totalTokens + stats.tokensSaved)) * 100) : 45);
  const costIdr = stats.costCalc?.actualCostIdr ? `Rp ${stats.costCalc.actualCostIdr}` : 'Rp 2.4';
  const savedMoney = stats.costCalc?.moneySavedIdr ? `Rp ${stats.costCalc.moneySavedIdr}` : 'Rp 32.5';

  if (isTelkomsel) {
    // Mode 1: Mesin Telkomsel - Token Meter Highlight
    statsEl.innerHTML = `
      <div class="stats-left">
        <span class="stats-highlight" style="color: #FF5C69;">🌐 Mesin Telkomsel Sovereign</span>
        <span class="stats-cost">Token Dihitung: <b>${stats.inputTokens || 0} In + ${stats.outputTokens || 0} Out = ${stats.totalTokens || 0} Token</b></span>
        <span class="stats-cost">Tarif: <b>${costIdr}</b> (Potong Kuota Token Flat)</span>
      </div>
      <span class="stats-savings-tag" style="color: #00D084;">🇮🇩 100% Kedaulatan Data Lokal</span>
    `;
  } else {
    // Mode 2: OmniRouter Multi-LLM - Saving Energy & Cost Highlight
    statsEl.innerHTML = `
      <div class="stats-left">
        <span class="stats-highlight">🍃 Saving Energy: -${savedPercent}% Beban GPU Cloud</span>
        <span class="stats-cost">Rute: <b>${stats.modelUsed.replace('gemini-3.8-', 'Gemini 3.8 ')}</b></span>
        <span class="stats-cost">Biaya Efektif: <b>${costIdr}</b></span>
      </div>
      <span class="stats-savings-tag">⚡ Hemat ${savedMoney} & Pangkas ${stats.tokensSaved || 0} Token</span>
    `;
  }
}

// Update Active Mode UI State (Buttons & HUD Strip)
export function updateModeUI() {
  const btnTelkomsel = document.getElementById('btnNavTelkomsel');
  const btnOmni = document.getElementById('btnNavOmniRouter');
  const hudStrip = document.getElementById('modeHudStrip');
  const hudTag = document.getElementById('hudModeTag');
  const hudTitle = document.getElementById('hudModeTitle');
  const hudEnergyBox = document.getElementById('hudMeterEnergyBox');
  const hudTokenBox = document.getElementById('hudMeterTokenBox');
  const promptInput = document.getElementById('userPromptInput');
  const shortNameEl = document.getElementById('activeModelShortName');

  const isTelkomsel = state.appMode === 'telkomsel';

  if (btnTelkomsel && btnOmni) {
    btnTelkomsel.classList.toggle('active', isTelkomsel);
    btnTelkomsel.classList.toggle('mode-telkomsel-active', isTelkomsel);

    btnOmni.classList.toggle('active', !isTelkomsel);
    btnOmni.classList.toggle('mode-omni-active', !isTelkomsel);
  }

  if (hudStrip) {
    hudStrip.className = `mode-hud-strip ${isTelkomsel ? 'mode-telkomsel-strip' : 'mode-omni-strip'}`;
  }

  if (hudTag) {
    hudTag.className = `hud-live-tag ${isTelkomsel ? 'tag-telkomsel' : 'tag-omni'}`;
    hudTag.textContent = isTelkomsel ? '🌐 1. LLM LOKAL TELKOMSEL' : '⚡ 2. LLM-CONNECTOR (MULTI-LLM)';
  }

  if (hudTitle) {
    hudTitle.textContent = isTelkomsel
      ? 'Cluster GPU Telkomsel • Kedaulatan Data • Pemakaian Token Dihitung Real-Time'
      : 'Link Gemini 3.8 / GPT-6 • In-House Saving Energy Komputasi Cloud & Efisiensi Pulsa';
  }

  if (hudEnergyBox) {
    hudEnergyBox.style.display = isTelkomsel ? 'none' : 'flex';
  }

  if (promptInput) {
    if (isTelkomsel) {
      promptInput.placeholder = 'Tanya ke LLM Lokal Mesin Telkomsel (Token Anda akan dihitung real-time)...';
    } else {
      promptInput.placeholder = 'Tanya via LLM-Connector (In-house saving energy otomatis ke Gemini 3.8 / GPT-6 / NanoBanana)...';
    }
  }

  if (shortNameEl) {
    if (isTelkomsel) {
      shortNameEl.textContent = state.activeModelId.includes('r1') ? 'DeepSeek-R1' : (state.activeModelId.includes('glm') ? 'GLM-4' : 'DeepSeek-V3');
    } else {
      shortNameEl.textContent = 'LLM-Connector';
    }
  }
}

// Render Model Picker Modal List
export function renderModelsModal(models) {
  const container = document.getElementById('modelsModalList');
  if (!container) return;

  container.innerHTML = '';

  // Group by category
  const categories = {};
  models.forEach(m => {
    const cat = m.category || 'Lainnya';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(m);
  });

  for (const [catName, catModels] of Object.entries(categories)) {
    const catHeader = document.createElement('div');
    catHeader.style.cssText = 'font-size: 0.78rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; margin: 8px 0 4px; letter-spacing: 0.05em;';
    catHeader.textContent = catName;
    container.appendChild(catHeader);

    const group = document.createElement('div');
    group.className = 'models-list-group';

    catModels.forEach(model => {
      const card = document.createElement('div');
      card.className = `model-option-card ${state.activeModelId === model.id ? 'selected' : ''}`;
      card.onclick = () => {
        setActiveModel(model.id);
        if (model.id.includes('telkomsel')) {
          state.appMode = 'telkomsel';
        } else {
          state.appMode = 'omni';
        }
        updateModeUI();
        updateActiveModelHeader();
        closeModal('modelPickerModal');
      };

      const badgeColor = model.provider === 'telkomsel_oss' ? 'badge-green' : (model.id === 'auto' ? 'badge-blue' : 'badge-purple');

      card.innerHTML = `
        <div class="model-option-info">
          <div class="model-option-title">
            <span>${model.name}</span>
            <span class="quick-card-badge ${badgeColor}">${model.badge || ''}</span>
          </div>
          <div class="model-option-desc">${model.description}</div>
        </div>
        <div style="font-size: 0.8rem; color: ${state.activeModelId === model.id ? 'var(--saver-green)' : 'var(--text-muted)'}; font-weight: 700;">
          ${state.activeModelId === model.id ? '✓ Aktif' : 'Pilih'}
        </div>
      `;
      group.appendChild(card);
    });

    container.appendChild(group);
  }
}

// Update Active Model Pill in Header
export function updateActiveModelHeader() {
  const shortNameEl = document.getElementById('activeModelShortName');
  if (shortNameEl && state.activeModelObj) {
    shortNameEl.textContent = state.activeModelObj.name.split(' ')[0] || state.activeModelObj.name;
  }
}

// Render Telkomsel Billing Modal Details
export function renderBillingModal(billingData, transactions) {
  if (billingData) {
    const pulsaEl = document.getElementById('billingPulsaVal');
    const quotaEl = document.getElementById('billingQuotaVal');
    const savedEl = document.getElementById('billingSavedVal');
    const msisdnEl = document.getElementById('billingMsisdn');
    const planEl = document.getElementById('billingPlanName');

    if (pulsaEl) pulsaEl.textContent = billingData.formattedPulsa;
    if (quotaEl) quotaEl.textContent = new Intl.NumberFormat('id-ID').format(billingData.tokenQuotaRemaining) + ' Token';
    if (savedEl) savedEl.textContent = billingData.formattedSavedMoney;
    if (msisdnEl && billingData.msisdn) msisdnEl.textContent = billingData.msisdn;
    if (planEl && billingData.planName) planEl.textContent = billingData.planName;

    // Render packages list
    const pkgContainer = document.getElementById('packageCardsList');
    if (pkgContainer && billingData.packages) {
      pkgContainer.innerHTML = '';
      billingData.packages.forEach(pkg => {
        const item = document.createElement('div');
        item.className = 'package-item-card';
        item.innerHTML = `
          <div class="package-left-info">
            <div class="package-name">
              <span>${pkg.name}</span>
              <span class="quick-card-badge badge-green">${pkg.badge}</span>
            </div>
            <div class="package-desc">${pkg.description}</div>
          </div>
          <div class="package-price-wrap">
            <div class="package-price">Rp ${new Intl.NumberFormat('id-ID').format(pkg.priceIdr)}</div>
            <button class="btn btn-primary buy-pkg-btn" data-pkg-id="${pkg.id}" style="padding: 4px 12px; font-size: 0.75rem;">
              Beli Paket
            </button>
          </div>
        `;
        pkgContainer.appendChild(item);
      });

      // Bind package buy buttons
      pkgContainer.querySelectorAll('.buy-pkg-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const pkgId = e.currentTarget.getAttribute('data-pkg-id');
          btn.textContent = 'Memproses...';
          btn.disabled = true;
          try {
            const res = await topUpPackage(pkgId);
            state.billing = res.account;
            renderBillingModal(res.account, state.transactions);
            updateNavBillingDisplay();
            alert(`Aktivasi berhasil! Kuota bertambah ${new Intl.NumberFormat('id-ID').format(res.package.tokenQuota)} Token.`);
          } catch (err) {
            alert('Gagal aktivasi paket: ' + err.message);
          } finally {
            btn.textContent = 'Beli Paket';
            btn.disabled = false;
          }
        });
      });
    }
  }

  // Render transaction history table
  const txTableBody = document.getElementById('transactionTableBody');
  if (txTableBody && transactions) {
    txTableBody.innerHTML = '';
    transactions.forEach(tx => {
      const row = document.createElement('tr');
      const timeStr = new Date(tx.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const costStr = tx.costIdr === 0 ? '<span style="color: #00D084; font-weight:700;">GRATIS</span>' : `Rp ${tx.costIdr}`;
      const savedStr = tx.tokensSaved > 0 ? `+${tx.tokensSaved} tok` : '-';

      row.innerHTML = `
        <td>${timeStr}</td>
        <td><b>${tx.model}</b></td>
        <td>${new Intl.NumberFormat('id-ID').format(tx.totalTokens)}</td>
        <td>${costStr}</td>
        <td>${tx.chargeMethod || tx.type}</td>
        <td style="color: #00D084; font-weight: 700;">${savedStr}</td>
      `;
      txTableBody.appendChild(row);
    });
  }
}

// Modal open/close helpers
export function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

export function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

export function scrollToBottom() {
  const scrollable = document.getElementById('messagesScrollable');
  if (scrollable) {
    scrollable.scrollTop = scrollable.scrollHeight;
  }
}
