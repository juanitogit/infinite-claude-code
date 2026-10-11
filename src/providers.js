/**
 * Provider catalog with capability tags for Semantic Routing & Swarm Balancing.
 * Tags:
 * - 'reasoning': High-parameter deep thinking models (120B+, Kimi K3, DeepSeek)
 * - 'code': Specialized coding and syntax generation models (Cohere Code, Qwen Coder)
 * - 'speed': Ultra-low latency models (<500ms responses for terminal/bash)
 * - 'offline': Local fallback when internet is down
 */

function getProviders(env = process.env) {
  const openrouterKey = env.OPENROUTER_API_KEY || '';
  const nvidiaKey = env.NVIDIA_API_KEY || '';

  const pool = [];

  // --- FLAGSHIP ACTIVE TIER (NVIDIA NIM - Sub-second & Native Tools) ---
  if (nvidiaKey) {
    pool.push({
      name: 'NVIDIA NIM - LLaMA 3.2 11B Vision & Code',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'meta/llama-3.2-11b-vision-instruct',
      tags: ['code', 'speed', 'reasoning'],
      headers: {
        'Authorization': `Bearer ${nvidiaKey}`,
        'Content-Type': 'application/json'
      },
      cooldownUntil: 0
    });
  }

  // --- REASONING TIER (OpenRouter Fallback) ---
  if (openrouterKey) {
    pool.push({
      name: 'OpenRouter - Nemotron 120B Super (Free)',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'nvidia/nemotron-3-super-120b-a12b:free',
      tags: ['reasoning', 'code'],
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/juanitogit/infinite-claude-code',
        'X-Title': 'Infinite Claude Code'
      },
      cooldownUntil: 0
    });
  }

  if (nvidiaKey) {

    pool.push({
      name: 'NVIDIA NIM - GLM 5.3 Agentic Reasoning',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'z-ai/glm-5.3',
      tags: ['reasoning', 'code'],
      headers: {
        'Authorization': `Bearer ${nvidiaKey}`,
        'Content-Type': 'application/json'
      },
      cooldownUntil: 0
    });

    pool.push({
      name: 'NVIDIA NIM - Nemotron 120B Super Reasoning',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'nvidia/nemotron-3-super-120b-a12b',
      tags: ['reasoning', 'code'],
      headers: {
        'Authorization': `Bearer ${nvidiaKey}`,
        'Content-Type': 'application/json'
      },
      cooldownUntil: 0
    });

    pool.push({
      name: 'NVIDIA NIM - Nemotron 30B Nano Omni',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
      tags: ['speed', 'reasoning', 'code'],
      headers: {
        'Authorization': `Bearer ${nvidiaKey}`,
        'Content-Type': 'application/json'
      },
      cooldownUntil: 0
    });

    pool.push({
      name: 'NVIDIA NIM - Nemotron 550B Ultra Reasoning',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'nvidia/nemotron-3-ultra-550b-a55b',
      tags: ['reasoning', 'code'],
      headers: {
        'Authorization': `Bearer ${nvidiaKey}`,
        'Content-Type': 'application/json'
      },
      cooldownUntil: 0
    });
  }

  // --- CODE SPECIALIST TIER ---
  if (openrouterKey) {
    pool.push({
      name: 'OpenRouter - North Mini Code (Free)',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'cohere/north-mini-code:free',
      tags: ['code', 'speed'],
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/juanitogit/infinite-claude-code',
        'X-Title': 'Infinite Claude Code'
      },
      cooldownUntil: 0
    });
  }

  // 9Router & OmniRouter (Only active if custom endpoints are configured)
  if (env.ROUTER9_BASE_URL) {
    pool.push({
      name: '9Router - Fast Free Dispatcher',
      url: env.ROUTER9_BASE_URL,
      model: env.ROUTER9_MODEL || 'qwen/qwen-2.5-coder-32b',
      tags: ['code'],
      headers: {
        'Authorization': `Bearer ${env.ROUTER9_API_KEY || 'free'}`,
        'Content-Type': 'application/json',
        'X-Title': 'Infinite Claude Code'
      },
      cooldownUntil: 0
    });
  }

  if (openrouterKey) {
    pool.push({
      name: 'OpenRouter - Gemma 4 31B (Free)',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'google/gemma-4-31b-it:free',
      tags: ['code', 'reasoning'],
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/juanitogit/infinite-claude-code',
        'X-Title': 'Infinite Claude Code'
      },
      cooldownUntil: 0
    });
  }

  // --- ULTRA-FAST / LOW LATENCY TIER ---
  if (openrouterKey) {
    pool.push({
      name: 'OpenRouter - Nemotron Lightning (Free)',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'nvidia/nemotron-3.5-lightning:free',
      tags: ['speed'],
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/juanitogit/infinite-claude-code',
        'X-Title': 'Infinite Claude Code'
      },
      cooldownUntil: 0
    });
  }

  if (env.OMNIROUTER_BASE_URL) {
    pool.push({
      name: 'OmniRouter - Free Auto Balance',
      url: env.OMNIROUTER_BASE_URL,
      model: env.OMNIROUTER_MODEL || 'deepseek/deepseek-chat',
      tags: ['speed', 'code'],
      headers: {
        'Authorization': `Bearer ${env.OMNIROUTER_API_KEY || 'free'}`,
        'Content-Type': 'application/json',
        'X-Title': 'Infinite Claude Code'
      },
      cooldownUntil: 0
    });
  }

  if (openrouterKey) {
    pool.push({
      name: 'OpenRouter - Nemotron 30B Reasoning (Free)',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
      tags: ['reasoning', 'speed'],
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/juanitogit/infinite-claude-code',
        'X-Title': 'Infinite Claude Code'
      },
      cooldownUntil: 0
    });
  }

  // Optional User Configured Providers
  if (env.GROQ_API_KEY) {
    pool.push({
      name: 'Groq - LLaMA 3.3 70B (800 tok/s)',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'llama-3.3-70b-versatile',
      tags: ['speed', 'code'],
      headers: { 'Authorization': `Bearer ${env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });
  }

  if (env.CEREBRAS_API_KEY) {
    pool.push({
      name: 'Cerebras - LLaMA 3.3 70B (Ultra-Speed)',
      url: 'https://api.cerebras.ai/v1/chat/completions',
      model: 'llama3.3-70b',
      tags: ['speed'],
      headers: { 'Authorization': `Bearer ${env.CEREBRAS_API_KEY}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });
  }

  if (env.TOGETHER_API_KEY) {
    pool.push({
      name: 'Together AI - DeepSeek V3',
      url: 'https://api.together.xyz/v1/chat/completions',
      model: 'deepseek-ai/DeepSeek-V3',
      tags: ['reasoning', 'code'],
      headers: { 'Authorization': `Bearer ${env.TOGETHER_API_KEY}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });
  }

  // Local Offline Resilient Fallback
  const ollamaHost = env.OLLAMA_HOST || 'http://localhost:11434';
  pool.push({
    name: 'Ollama Local - Qwen3 4B (Offline Resilience)',
    url: `${ollamaHost}/v1/chat/completions`,
    model: 'qwen3:4b',
    tags: ['offline', 'speed'],
    headers: { 'Content-Type': 'application/json' },
    cooldownUntil: 0
  });

  return pool;
}

module.exports = { getProviders };
