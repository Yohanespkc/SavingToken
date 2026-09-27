// api.js - Frontend API and Streaming Client for SavingToken

export async function fetchStatus() {
  const res = await fetch('/api/status');
  if (!res.ok) throw new Error('Gagal mengambil status server');
  return await res.json();
}

export async function fetchBilling() {
  const res = await fetch('/api/billing');
  if (!res.ok) throw new Error('Gagal mengambil data billing Telkomsel');
  return await res.json();
}

export async function topUpPackage(packageId, method = 'PULSA_TELKOMSEL') {
  const res = await fetch('/api/billing/topup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ packageId, method })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Gagal melakukan top-up');
  }
  return await res.json();
}

export async function topUpPulsa(nominalIdr) {
  const res = await fetch('/api/billing/topup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nominalIdr })
  });
  if (!res.ok) throw new Error('Gagal menambah saldo pulsa');
  return await res.json();
}

export async function fetchCacheStats() {
  const res = await fetch('/api/cache/stats');
  if (!res.ok) throw new Error('Gagal mengambil analitik cache');
  return await res.json();
}

export async function clearCache() {
  const res = await fetch('/api/cache/clear', { method: 'POST' });
  if (!res.ok) throw new Error('Gagal membersihkan cache');
  return await res.json();
}

export async function saveSettings(settings) {
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error('Gagal menyimpan pengaturan');
  return await res.json();
}

// Server-Sent Events Chat Stream Reader
export async function streamChat({
  prompt,
  model = 'auto',
  media = null,
  enableCompression = true,
  onChunk,
  onPruneStats,
  onRouteDecision,
  onImageReady,
  onCacheHit,
  onStats,
  onError,
  onDone
}) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model, media, enableCompression })
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || ''; // Keep incomplete part

      for (const eventBlock of events) {
        if (!eventBlock.trim()) continue;

        const lines = eventBlock.split('\n');
        let eventType = 'message';
        let eventData = null;

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            try {
              eventData = JSON.parse(line.slice(6));
            } catch (e) {
              eventData = line.slice(6);
            }
          }
        }

        if (eventType === 'chunk' && onChunk) {
          onChunk(eventData);
        } else if (eventType === 'prune_stats' && onPruneStats) {
          onPruneStats(eventData);
        } else if (eventType === 'route_decision' && onRouteDecision) {
          onRouteDecision(eventData);
        } else if (eventType === 'image_ready' && onImageReady) {
          onImageReady(eventData);
        } else if (eventType === 'cache_hit' && onCacheHit) {
          onCacheHit(eventData);
        } else if (eventType === 'stats' && onStats) {
          onStats(eventData);
        } else if (eventType === 'done' && onDone) {
          onDone();
        } else if (eventType === 'error' && onError) {
          onError(eventData);
        }
      }
    }

    if (onDone) onDone();
  } catch (err) {
    if (onError) onError({ message: err.message });
  }
}
