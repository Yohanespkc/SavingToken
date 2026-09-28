# 📜 SavingToken Changelog

All notable changes to the **SavingToken LLM-Connector AI** project are documented in this directory.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## 📑 Version History

| Version | Release Date | Summary | Release Notes |
| :--- | :--- | :--- | :--- |
| **[v1.1.0](#110---2026-09-28)** | 2026-09-28 | Multilingual Documentation & Docs Architecture | [v1.1.0.md](v1.1.0.md) |
| **[v1.0.0](#100---2026-09-27)** | 2026-09-27 | Initial Release — Native LLM-Connector & Telkomsel Billing | [v1.0.0.md](v1.0.0.md) |

---

## [1.1.0] - 2026-09-28

### Added
- **Multilingual Documentation Framework (`docs/`)**:
  - Implemented internationalized documentation structure under `docs/` to support global and enterprise adoption.
  - Added [`docs/en/README.md`](../en/README.md) featuring a complete English translation of the system architecture, dual-mode interface, core in-house optimization engines, model catalogs, and API specifications.
  - Added [`docs/id/README.md`](../id/README.md) structuring canonical Indonesian documentation with consistent relative references.
  - Added [`docs/README.md`](../README.md) acting as the multilingual navigation hub with quick links across topics and translation guidelines.
- **Dedicated Changelog Directory (`docs/changelog/`)**:
  - Established `docs/changelog/` containing version ledgers, milestone breakdowns, and release archives.
  - Added [`v1.0.0.md`](v1.0.0.md) detailing the genesis architecture, in-house pruning algorithms, and Telkomsel sovereign billing.
  - Added [`v1.1.0.md`](v1.1.0.md) detailing multilingual documentation milestones.
  - Added [`CHANGELOG_ID.md`](CHANGELOG_ID.md) preserving bilingual Indonesian changelog records.
- **Global Language Navigation**:
  - Embedded bidirectional language switcher buttons (`[English] | [Bahasa Indonesia]`) across root and documentation readmes.

### Changed
- Updated root [`README.md`](../../README.md) directory diagram to reflect the new `docs/` and `docs/changelog/` layout.
- Normalized internal repository links to relative paths for offline portability.

---

## [1.0.0] - 2026-09-27

### Added
- **Native In-House LLM-Connector Engine (`server/router/llmConnector.js`)**:
  - Built 100% native gateway eliminating external SaaS proxy dependencies.
  - **Semantic Caching Engine**: In-memory context and similarity matching delivering instant cached responses (0 tokens consumed, 0 Watts wasted, <40ms latency).
  - **Token Pruner & Compressor**: Heuristic removal of conversational fluff, polite preambles, repetitive closings, and whitespace normalization (saving 30% to 65% of input tokens).
  - **Smart Tiered Auto-Routing**: Dynamic prompt classifier directing reasoning to DeepSeek-R1, coding to GLM-4, graphics to NanoBanana, media to Gemini 3.8 Flash, and general tasks to DeepSeek-V3/Qwen.
- **Dual-Mode UI Navigation (`src/index.html`, `src/modules/ui.js`)**:
  - **Button 1 (Telkomsel Sovereign Engine)**: Local inferencing on domestic Telkomsel GPU clusters prioritizing national data sovereignty with real-time token metering.
  - **Button 2 (LLM-Connector Multi-LLM)**: Cloud gateway to paid commercial APIs with cost and energy reduction safeguards.
- **Integrated Model Catalog**:
  - *Telkomsel Sovereign GPU Cluster*: DeepSeek-R1 (interactive `<think>` reasoning stream), DeepSeek-V3, GLM-4 / GLM-Edge, and Qwen 2.5 72B.
  - *Commercial Cloud APIs*: Google Gemini 3.8 Flash, Gemini 3.8 NanoBanana Studio (`/imagine`), Gemini 3.8 Pro Video, and GPT-6.0 Omni Preview.
- **Telkomsel Carrier Billing System (`server/router/billingService.js`)**:
  - Dual balance deduction: Telkomsel Mobile Credit (Pulsa) for commercial APIs, and Telkomsel Token Quota for sovereign cluster models.
  - Prepaid AI Quota tiers: Student AI (1M tokens), Developer Pro (10M tokens), and Enterprise Sovereign (50M tokens).
  - Real-time immutable transaction ledger logging model ID, token usage, tokens saved, and net IDR monetary savings.
- **Real-Time Token HUD & Analytics**:
  - Live HUD pills for each assistant message displaying pruning statistics, latency, and cost estimates.
  - Analytics modal for monitoring cumulative token savings, Watt-hours saved, and cache hit ratios.
  - Settings modal allowing dynamic runtime configuration of Telkomsel GPU endpoints and commercial API keys.
- **High-Fidelity Hybrid Simulation Streamer (`server/mock/mockStreamer.js`)**:
  - Complete offline fallback simulation ensuring responsive demonstration capabilities even when backend clusters or internet connections are unavailable.
- **Security & Infrastructure**:
  - Server-Sent Events (SSE) streaming protocol (`POST /api/chat`).
  - `.gitignore` rules isolating credentials and runtime artifacts.
  - Official GitHub repository launch on `Yohanespkc/SavingToken`.

### Changed
- Re-architected gateway from third-party proxy abstraction into self-contained in-house `LLMConnector`.
- Preserved `server/router/omniRouter.js` as backward-compatible facade re-exporting `llmConnector.js`.

### Security
- Isolated sensitive API credentials and GPU cluster URLs within server environment variables (`.env`).
- Sanitized client payload structures to prevent credential leakage.
