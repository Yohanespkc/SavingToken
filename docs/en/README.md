# ⚡ SavingToken LLM-Connector AI Gateway
> **In-House LLM Token & Cost Optimization Platform Powered by Sovereign Telkomsel GPU Clusters & Commercial Cloud (Gemini 3.8 / GPT-6)**

[English](README.md) | [Bahasa Indonesia](../id/README.md)

[![GitHub Repo](https://img.shields.io/badge/GitHub-Yohanespkc%2FSavingToken-blue?logo=github)](https://github.com/Yohanespkc/SavingToken)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B%20%7C%20v20%2B-green?logo=node.js)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Engine](https://img.shields.io/badge/In--House-LLM--Connector%20Native-crimson)]()
[![Telkomsel AI](https://img.shields.io/badge/Telkomsel-Sovereign%20GPU%20Cluster-red?logo=telkomsel)]()

SavingToken is an intelligent gateway application (**LLM-Connector**) built independently from the ground up (100% *native in-house*, with zero dependencies on third-party SaaS proxies) to **slash token consumption by up to 70%**, conserve cloud computing energy, and safeguard national data sovereignty through direct integration with **Telkomsel's Open-Source GPU Engines** as well as **Tier-1 Commercial APIs (Gemini 3.8 Multimodal & NanoBanana Studio)** connected to the **Telkomsel Carrier Billing System (Mobile Credit / Pulsa & Flat Token Quotas)**.

---

## 📑 Table of Contents
- [System Architecture](#-system-architecture)
- [Dual-Mode Interface](#-dual-mode-interface)
- [Core Features of In-House LLM-Connector](#-core-features-of-in-house-llm-connector)
- [Supported AI Model Catalog](#-supported-ai-model-catalog)
- [Telkomsel Billing & Quota System](#-telkomsel-billing--quota-system)
- [Project Directory Structure](#-project-directory-structure)
- [Installation & Usage Guide](#-installation--usage-guide)
- [Environment Configuration (.env)](#-environment-configuration-env)
- [API Specifications & Server-Sent Events (SSE)](#-api-specifications--server-sent-events-sse)
- [Changelog](#-changelog)
- [License](#-license)

---

## 🏛️ System Architecture

```
                              ┌─────────────────────────────────────────┐
                              │             USER / BROWSER              │
                              │     (Dual-Mode UI + Live Token HUD)     │
                              └───────────────────┬─────────────────────┘
                                                  │ POST /api/chat (SSE)
                                                  ▼
                              ┌─────────────────────────────────────────┐
                              │        EXPRESS BACKEND GATEWAY          │
                              │            (server/index.js)            │
                              └───────────────────┬─────────────────────┘
                                                  │
                 ┌────────────────────────────────┴──────────────────────────────┐
                 ▼                                                               ▼
  ┌─────────────────────────────┐                                ┌───────────────────────────────┐
  │    1. SEMANTIC CACHING      │                                │  2. TOKEN PRUNER & COMPRESS   │
  │    Similar query detected?  │                                │  Strip conversational fluff   │
  │    ↳ 0 Tokens, 0 W, <40ms   │                                │  ↳ Save 30% - 65% input tkns  │
  └──────────────┬──────────────┘                                └───────────────┬───────────────┘
                 │ (Cache Miss)                                                  │
                 └────────────────────────────────┬──────────────────────────────┘
                                                  ▼
                              ┌─────────────────────────────────────────┐
                              │      3. SMART TIERED AUTO-ROUTING       │
                              │      (Query Complexity Evaluation)      │
                              └───────┬─────────────────────────┬───────┘
                                      │                         │
                                      ▼                         ▼
         ┌──────────────────────────────────────┐     ┌─────────────────────────────────────────┐
         │     BUTTON 1: TELKOMSEL ENGINE       │     │        BUTTON 2: LLM-CONNECTOR          │
         │   (Internal Sovereign GPU Cluster)   │     │         (Commercial Cloud APIs)         │
         │  ──────────────────────────────────  │     │  ─────────────────────────────────────  │
         │  • DeepSeek-R1 (Reasoning <think>)   │     │  • Gemini 3.8 Flash (Multimodal)        │
         │  • DeepSeek-V3 (Versatile & Fast)    │     │  • Gemini 3.8 NanoBanana (/imagine)     │
         │  • GLM-4 / GLM-Edge (Code Specialist)│     │  • Gemini 3.8 Pro (Video & Canvas)      │
         │  • Qwen 2.5 72B (Fast Automation)    │     │  • GPT-6.0 Omni Preview                 │
         └──────────────────┬───────────────────┘     └───────────────────┬─────────────────────┘
                            │                                             │
                            └─────────────────────┬───────────────────────┘
                                                  │
                                                  ▼
                              ┌─────────────────────────────────────────┐
                              │        STREAMING RESPONSE ENGINE        │
                              │     (Live Chunks + Thinking Stream)     │
                              └───────────────────┬─────────────────────┘
                                                  │
                                                  ▼
                              ┌─────────────────────────────────────────┐
                              │       BILLING & TRANSACTION LEDGER      │
                              │  • Deduct Flat Token Quota (Telkomsel)  │
                              │  • Transparent Credit Deduction (Pulsa) │
                              │  • Real-time IDR Savings Audit          │
                              └─────────────────────────────────────────┘
```

---

## 🎛️ Dual-Mode Interface

The interface features an intuitive **Dual-Mode Switcher** located in the top navigation bar:

### 1. 🌐 Button 1: Telkomsel Engine (Local LLMs)
* **Objective**: Leverage Telkomsel's domestic server and GPU cluster infrastructure prioritizing national **data sovereignty**.
* **Token Tracking**: Every input and output token is metered in real time via the **Token Meter HUD**.
* **Billing**: Deducts from the **Telkomsel Flat Token Quota** (highly cost-effective, estimated at IDR 1.5 - IDR 2.5 per 1,000 tokens).
* **Key Features**:
  * Deep reasoning on **DeepSeek-R1** featuring an interactive, collapsible streaming `<think>` thought accordion.
  * Fully operational with a **High-Fidelity Hybrid Simulation** fallback system whenever the local cluster is offline.

### 2. ⚡ Button 2: LLM-Connector (Multi-LLM)
* **Objective**: Connect users to top-tier commercial LLMs (Google Gemini 3.8, NanoBanana, GPT-6) with built-in cost and energy optimization safeguards.
* **Optimization Mechanism**: Prompts are pre-processed by the **Token Pruner** and **Semantic Cache** prior to calling paid APIs.
* **Billing**: Transparently deducts from the user's **Telkomsel Mobile Credit (Pulsa)** based on the actual post-compression token usage.
* **Key Features**:
  * Full multimodal support: text prompts, image/document attachments, and `/imagine` visual rendering commands.

---

## 💡 Core Features of In-House LLM-Connector

### 1. ⚡ Semantic Caching
* Stores query context representations and previous responses in ultra-fast memory.
* When a user submits an identical or semantically equivalent query, the cached response is served immediately:
  * **0 Tokens** consumed
  * **0 Watts** of cloud energy wasted
  * **IDR 0 Cost**
  * **Latency < 40ms**

### 2. ✂️ Token Pruning & Compression
* Automatically identifies and trims polite fillers and conversational fluff (*e.g.*, *"Hello, could you please help me explain..."*, *"Thank you very much in advance..."*, redundant greetings, and repeated whitespace).
* Retains the core prompt instructions and full semantic intent.
* Successfully strips **30% to 65% of input tokens**, dramatically reducing commercial API charges.

### 3. 🎯 Smart Tiered Auto-Routing
When `auto` mode is enabled, the LLM-Connector intelligently evaluates and routes prompts to the optimal engine:
* **Complex Reasoning / Mathematics** $\rightarrow$ Routed to **DeepSeek-R1 (Telkomsel Engine)**.
* **Coding, Refactoring, & Architecture** $\rightarrow$ Routed to **GLM-4 / GLM-Edge (Telkomsel Engine)**.
* **Visual Image Generation** $\rightarrow$ Routed to **Gemini 3.8 NanoBanana Studio**.
* **Media / Vision / Document Analysis** $\rightarrow$ Routed to **Gemini 3.8 Flash**.
* **Fast General Inquiries** $\rightarrow$ Routed to **DeepSeek-V3 / Qwen 2.5**.

---

## 🤖 Supported AI Model Catalog

| Model Name | Category | Provider | Specialization & Features |
| :--- | :--- | :--- | :--- |
| **DeepSeek-R1** | Telkomsel Engine | Open Source (vLLM/Ollama) | Deep reasoning, logical proofs, interactive `<think>` visual blocks |
| **DeepSeek-V3** | Telkomsel Engine | Open Source (vLLM/Ollama) | Large-capacity, versatile model with low latency |
| **GLM-4 / GLM-Edge** | Telkomsel Engine | Open Source (vLLM/Ollama) | Bilingual Indonesian-English, code refactoring & architecture |
| **Qwen 2.5 72B** | Telkomsel Engine | Open Source (vLLM/Ollama) | Daily task automation, lightning-fast response speeds |
| **Gemini 3.8 Flash** | Commercial | Google Cloud API | Multimodal: text, vision, audio, and web groundings |
| **Gemini 3.8 NanoBanana** | Commercial | Google / In-House Studio | High-resolution graphic rendering (2048 x 2048 HDR) via `/imagine` |
| **Gemini 3.8 Pro Video** | Commercial | Google Cloud API | Frame-by-frame video context analysis and long-form documents |
| **GPT-6.0 Omni Preview** | Commercial | OpenAI API | Top-tier commercial benchmark comparison model |

---

## 💳 Telkomsel Billing & Quota System

The platform includes an integrated telecom operator billing module:

1. **Telkomsel Mobile Credit (Pulsa Balance)**: Used to pay for commercial API requests (Gemini / GPT) with per-query transparent auditability.
2. **Telkomsel Token Quota Balance**: Used for model inference on local sovereign GPU clusters (flat, discounted rate).
3. **Prepaid AI Quota Packages**:
   * 🎓 **Student / Education AI Package**: 1,000,000 Tokens — `IDR 25,000`
   * 💼 **Telkomsel AI Developer Pro Package**: 10,000,000 Tokens — `IDR 150,000`
   * 🏢 **Telkomsel Enterprise Sovereign Package**: 50,000,000 Dedicated Tokens — `IDR 650,000`
4. **Real-time Transaction Ledger**:
   * Records timestamp, active model, input/output tokens, tokens saved via optimization, and net monetary savings in Indonesian Rupiah (IDR).

---

## 📁 Project Directory Structure

```
SavingToken/
├── docs/                            # Multilingual documentation repository
│   ├── README.md                    # Multilingual documentation index & language hub
│   ├── changelog/                   # Release logs & version history (v1.0.0, v1.1.0)
│   ├── en/                          # English documentation
│   │   └── README.md                # English translation of project documentation
│   └── id/                          # Indonesian documentation
│       └── README.md                # Dokumentasi bahasa Indonesia
├── public/
│   └── favicon.svg                  # Official SavingToken vector favicon
├── server/
│   ├── index.js                     # Express server & SSE endpoints (/api/chat, /api/billing, etc.)
│   ├── mock/
│   │   └── mockStreamer.js          # High-fidelity response simulator & offline fallback
│   └── router/
│       ├── billingService.js        # Mobile credit, token quota, and transaction ledger logic
│       ├── commercialProvider.js    # Official connectors for Gemini 3.8, NanoBanana, & OpenAI
│       ├── llmConnector.js          # In-House Engine: Cache, Pruner, & Smart Tiered Router
│       ├── omniRouter.js            # Transparent re-export to llmConnector.js for backward compatibility
│       └── telkomselCluster.js      # Telkomsel sovereign GPU vLLM/Ollama cluster connector
├── src/
│   ├── index.html                   # Application entry HTML (Dual-Mode UI)
│   ├── main.js                      # Front-end initialization & event orchestration
│   ├── modules/
│   │   ├── api.js                   # Client-side SSE stream reader & API caller
│   │   ├── state.js                 # Reactive client store & persistent storage
│   │   └── ui.js                    # HUD renderer, chat bubbles, token chips, and modal managers
│   └── styles/
│       ├── chat.css                 # Chat message styling & footer token HUD
│       ├── hud.css                  # Navigation header, dual-mode switcher, & balance chips
│       ├── main.css                 # Design tokens, CSS variables, dark theme & typography
│       └── modals.css               # Popup modal styling (Billing, Analytics, Settings)
├── CHANGELOG.md                     # Official project version history & release notes
├── package.json                     # Project metadata & npm execution scripts
├── README.md                        # Primary project documentation (Indonesian)
└── .gitignore                       # Git ignore definitions for environment & build files
```

---

## 🚀 Installation & Usage Guide

### Prerequisites
* **Node.js**: Version `18.0.0` or higher (Node.js v20 LTS recommended).
* **NPM**: Version `9.0.0` or higher.
* **Web Browser**: Modern Chromium (Chrome, Edge), Safari, or Firefox.

### Quick Start
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Yohanespkc/SavingToken.git
   cd SavingToken
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the application server**:
   ```bash
   npm start
   ```

4. **Launch the web application**:
   Open your browser and navigate to:
   👉 **`http://localhost:3000`**

---

## ⚙️ Environment Configuration (.env)

Create a `.env` file in the root directory to configure live model endpoints:

```env
# Express Server Port
PORT=3000

# Telkomsel Sovereign Engine Endpoint (vLLM / Ollama OpenAI-compatible API)
TELKOMSEL_GPU_URL=http://127.0.0.1:8000/v1
TELKOMSEL_GPU_KEY=telkomsel-internal-token

# Google Gemini API Key (for live Gemini 3.8 Flash & NanoBanana Studio)
GEMINI_API_KEY=AIzaSy...

# Optional OpenAI API Key (for live GPT-6)
OPENAI_API_KEY=sk-...
```

> **Note**: You can also configure `TELKOMSEL_GPU_URL` and `GEMINI_API_KEY` directly from the web interface via the **Settings (Gear Icon)** modal without restarting the server.

---

## 📡 API Specifications & Server-Sent Events (SSE)

### `POST /api/chat`
Primary streaming chat endpoint powered by Server-Sent Events (SSE).

**Request Body (JSON):**
```json
{
  "prompt": "Explain the concept of Sovereign AI and how to optimize LLM tokens.",
  "model": "auto",
  "enableCompression": true,
  "media": null
}
```

**SSE Event Types Dispatched:**
* `cache_hit`: Dispatched when the prompt matches an entry in the Semantic Cache (includes similarity ratio & tokens saved).
* `prune_stats`: Token pruning statistics (`originalTokens`, `prunedTokens`, `tokensSaved`, `reductionPercent`).
* `route_decision`: Autonomous routing decision (`modelId`, `provider`, `rationale`).
* `image_ready`: Dispatched when a NanoBanana `/imagine` prompt completes image generation.
* `chunk`: Streaming response text chunk (`{ type: "reasoning" | "content", content: "..." }`).
* `stats`: Summary of actual token consumption, calculated billing charges, and remaining credit/quota balances.
* `done`: End-of-stream indicator.

### Additional Endpoints:
* `GET /api/status`: Server health check and comprehensive catalog of supported AI models.
* `GET /api/billing`: Current credit balance, token quota, and transaction ledger records.
* `POST /api/billing/topup`: Purchase token packages or recharge mobile credit.
* `GET /api/cache/stats`: Semantic cache hit statistics and cumulative energy savings (Wh).
* `POST /api/cache/clear`: Flush in-memory semantic cache entries.
* `POST /api/settings`: Update GPU URL and API keys dynamically at runtime.

---

## 📜 Changelog

All release notes and version updates are thoroughly documented in [CHANGELOG.md](../../CHANGELOG.md).

---

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). You are free to use, modify, and distribute this software for internal and commercial applications.
