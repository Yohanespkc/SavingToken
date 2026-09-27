// telkomselCluster.js - Client for Telkomsel Sovereign GPU Cluster (vLLM / Ollama / SGLang)

export class TelkomselClusterClient {
  constructor(config = {}) {
    // Default or user-configured endpoint for Telkomsel Machine
    this.baseUrl = config.baseUrl || process.env.TELKOMSEL_GPU_URL || 'http://127.0.0.1:8000/v1';
    this.apiKey = config.apiKey || process.env.TELKOMSEL_GPU_KEY || 'telkomsel-internal-token';
    this.defaultModel = config.defaultModel || 'deepseek-v3';
  }

  // Check cluster health
  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${this.baseUrl}/models`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        return { online: true, models: data.data || [] };
      }
      return { online: false, error: `HTTP ${res.status}` };
    } catch (err) {
      return { online: false, error: err.message };
    }
  }

  // Stream completion from Telkomsel cluster
  async streamChat({ model, messages, onChunk, onComplete, onError }) {
    try {
      const mappedModel = this.mapModelName(model);
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: mappedModel,
          messages,
          stream: true,
          temperature: 0.6,
          max_tokens: 3000
        })
      });

      if (!res.ok) {
        throw new Error(`Telkomsel Cluster Error: ${res.status} ${res.statusText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullText = '';
      let reasoningText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (trimmed.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              const delta = parsed.choices[0]?.delta;
              if (delta) {
                if (delta.reasoning_content) {
                  reasoningText += delta.reasoning_content;
                  onChunk({ type: 'reasoning', content: delta.reasoning_content });
                }
                if (delta.content) {
                  fullText += delta.content;
                  onChunk({ type: 'content', content: delta.content });
                }
              }
            } catch (e) {
              // Ignore partial JSON chunks
            }
          }
        }
      }

      onComplete({ text: fullText, reasoning: reasoningText });
    } catch (err) {
      onError(err);
    }
  }

  mapModelName(modelId) {
    if (modelId.includes('r1')) return 'deepseek-ai/DeepSeek-R1';
    if (modelId.includes('glm')) return 'THUDM/glm-4-9b-chat';
    if (modelId.includes('qwen')) return 'Qwen/Qwen2.5-72B-Instruct';
    return 'deepseek-ai/DeepSeek-V3';
  }
}

export default new TelkomselClusterClient();
