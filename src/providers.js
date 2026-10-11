/**
 * Provider catalog with capability tags for Semantic Routing & Swarm Balancing.
 * Tags:
 * - 'reasoning': High-parameter deep thinking models (Kimi K3, Nemotron 120B/550B, GLM 5.3, DeepSeek)
 * - 'code': Specialized coding and syntax generation models (Cohere Code, Qwen Coder, Codestral)
 * - 'speed': Ultra-low latency models (<500ms responses for terminal/bash)
 * - 'offline': Local fallback when internet is down
 */

function getProviders(env = process.env) {
  const openrouterKey = env.OPENROUTER_API_KEY || '';
  const nvidiaKey = env.NVIDIA_API_KEY || '';
  const groqKey = env.GROQ_API_KEY || '';
  const cerebrasKey = env.CEREBRAS_API_KEY || '';
  const togetherKey = env.TOGETHER_API_KEY || '';
  const sambanovaKey = env.SAMBANOVA_API_KEY || '';

  const pool = [];

  // ==============================================================================
  // TIER 1: FLAGSHIP HIGH-REASONING & VISION (NVIDIA NIM - Sub-second & Native Tools)
  // ==============================================================================
  if (nvidiaKey) {
    // 1. Kimi K3 - Reasoning Flagship (Top reasoning in pool, 16k context)
    pool.push({
      name: 'NVIDIA NIM - Kimi K3 Reasoning Flagship',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'moonshotai/kimi-k3',
      tags: ['reasoning', 'code'],
      headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 2. Kimi K2.6
    pool.push({
      name: 'NVIDIA NIM - Kimi K2.6 High Context',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'moonshotai/kimi-k2.6',
      tags: ['reasoning', 'code'],
      headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 3. GLM 5.3 Agentic Reasoning
    pool.push({
      name: 'NVIDIA NIM - GLM 5.3 Agentic Reasoning',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'z-ai/glm-5.3',
      tags: ['reasoning', 'code'],
      headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 4. GLM 5.3 Flash
    pool.push({
      name: 'NVIDIA NIM - GLM 5.3 Flash Latency',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'z-ai/glm-5.3-flash',
      tags: ['speed', 'reasoning'],
      headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 5. Nemotron 120B Super Reasoning
    pool.push({
      name: 'NVIDIA NIM - Nemotron 120B Super Reasoning',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'nvidia/nemotron-3-super-120b-a12b',
      tags: ['reasoning', 'code'],
      headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 6. Nemotron 550B Ultra Reasoning
    pool.push({
      name: 'NVIDIA NIM - Nemotron 550B Ultra Reasoning',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'nvidia/nemotron-3-ultra-550b-a55b',
      tags: ['reasoning', 'code'],
      headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 7. Nemotron 30B Nano Omni
    pool.push({
      name: 'NVIDIA NIM - Nemotron 30B Nano Omni',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
      tags: ['speed', 'reasoning', 'code'],
      headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 8. Nemotron 3.5 Lightning 30B
    pool.push({
      name: 'NVIDIA NIM - Nemotron 3.5 Lightning 30B',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'nvidia/nemotron-3.5-lightning-30b-a3b',
      tags: ['speed', 'code'],
      headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 9. Nemotron 4 340B Instruct
    pool.push({
      name: 'NVIDIA NIM - Nemotron 4 340B Instruct',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'nvidia/nemotron-4-340b-instruct',
      tags: ['reasoning', 'code'],
      headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 10. Nemotron 70B Instruct
    pool.push({
      name: 'NVIDIA NIM - LLaMA 3.1 Nemotron 70B Instruct',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'nvidia/llama-3.1-nemotron-70b-instruct',
      tags: ['reasoning', 'code'],
      headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 11. Nemotron Ultra 253B
    pool.push({
      name: 'NVIDIA NIM - LLaMA 3.1 Nemotron Ultra 253B',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'nvidia/llama-3.1-nemotron-ultra-253b-v1',
      tags: ['reasoning', 'code'],
      headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 12. LLaMA 3.2 11B Vision & Code
    pool.push({
      name: 'NVIDIA NIM - LLaMA 3.2 11B Vision & Code',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'meta/llama-3.2-11b-vision-instruct',
      tags: ['code', 'speed', 'reasoning'],
      headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 13. LLaMA 3.2 90B Vision Instruct
    pool.push({
      name: 'NVIDIA NIM - LLaMA 3.2 90B Vision Instruct',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'meta/llama-3.2-90b-vision-instruct',
      tags: ['reasoning', 'code'],
      headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 14. Codestral 22B Instruct
    pool.push({
      name: 'NVIDIA NIM - Codestral 22B Instruct',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'mistralai/codestral-22b-instruct-v0.1',
      tags: ['code', 'speed'],
      headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 15. Mistral Large 2 Instruct
    pool.push({
      name: 'NVIDIA NIM - Mistral Large 2 Instruct',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'mistralai/mistral-large-2-instruct',
      tags: ['reasoning', 'code'],
      headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 16. DeepSeek V4.1 Flash
    pool.push({
      name: 'NVIDIA NIM - DeepSeek V4.1 Flash',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'deepseek-ai/deepseek-v4.1-flash',
      tags: ['speed', 'code', 'reasoning'],
      headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 17. DeepSeek Coder 6.7B
    pool.push({
      name: 'NVIDIA NIM - DeepSeek Coder 6.7B',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'deepseek-ai/deepseek-coder-6.7b-instruct',
      tags: ['code', 'speed'],
      headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 18. Gemma 4 31B Instruct
    pool.push({
      name: 'NVIDIA NIM - Gemma 4 31B Instruct',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'google/gemma-4-31b-it',
      tags: ['code', 'reasoning'],
      headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 19. DiffusionGemma 26B
    pool.push({
      name: 'NVIDIA NIM - DiffusionGemma 26B',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'google/diffusiongemma-26b-a4b-it',
      tags: ['reasoning', 'speed'],
      headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 20. Muse Glimmer 30B
    pool.push({
      name: 'NVIDIA NIM - Muse Glimmer 30B',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'meta/muse-glimmer-30b',
      tags: ['speed', 'reasoning'],
      headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 21. Granite 34B Code Instruct
    pool.push({
      name: 'NVIDIA NIM - Granite 34B Code Instruct',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'ibm/granite-34b-code-instruct',
      tags: ['code'],
      headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 22. Nemotron Parse 2.0
    pool.push({
      name: 'NVIDIA NIM - Nemotron Parse 2.0',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'nvidia/nemotron-parse-2.0',
      tags: ['code', 'speed'],
      headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });
  }

  // ==============================================================================
  // TIER 2: OPENROUTER FREE CLOUD POOL (:free models)
  // ==============================================================================
  if (openrouterKey) {
    const orHeaders = {
      'Authorization': `Bearer ${openrouterKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/juanitogit/infinite-claude-code',
      'X-Title': 'Infinite Claude Code'
    };

    // 23. Nemotron 120B Super
    pool.push({
      name: 'OpenRouter - Nemotron 120B Super (Free)',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'nvidia/nemotron-3-super-120b-a12b:free',
      tags: ['reasoning', 'code'],
      headers: orHeaders,
      cooldownUntil: 0
    });

    // 24. Gemma 4 31B
    pool.push({
      name: 'OpenRouter - Gemma 4 31B (Free)',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'google/gemma-4-31b-it:free',
      tags: ['code', 'reasoning'],
      headers: orHeaders,
      cooldownUntil: 0
    });

    // 25. Gemma 4 26B
    pool.push({
      name: 'OpenRouter - Gemma 4 26B (Free)',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'google/gemma-4-26b-a4b-it:free',
      tags: ['code', 'speed'],
      headers: orHeaders,
      cooldownUntil: 0
    });

    // 26. North Mini Code
    pool.push({
      name: 'OpenRouter - North Mini Code (Free)',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'cohere/north-mini-code:free',
      tags: ['code', 'speed'],
      headers: orHeaders,
      cooldownUntil: 0
    });

    // 27. Nemotron Lightning
    pool.push({
      name: 'OpenRouter - Nemotron Lightning (Free)',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'nvidia/nemotron-3.5-lightning:free',
      tags: ['speed'],
      headers: orHeaders,
      cooldownUntil: 0
    });

    // 28. Nemotron 30B Nano Omni
    pool.push({
      name: 'OpenRouter - Nemotron 30B Reasoning (Free)',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
      tags: ['reasoning', 'speed'],
      headers: orHeaders,
      cooldownUntil: 0
    });

    // 29. Nemotron 550B Ultra
    pool.push({
      name: 'OpenRouter - Nemotron 550B Ultra (Free)',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'nvidia/nemotron-3-ultra-550b-a55b:free',
      tags: ['reasoning', 'code'],
      headers: orHeaders,
      cooldownUntil: 0
    });

    // 30. Laguna S 2.1
    pool.push({
      name: 'OpenRouter - Laguna S 2.1 (Free)',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'poolside/laguna-s-2.1:free',
      tags: ['code', 'speed'],
      headers: orHeaders,
      cooldownUntil: 0
    });

    // 31. Laguna XS 2.1
    pool.push({
      name: 'OpenRouter - Laguna XS 2.1 (Free)',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'poolside/laguna-xs-2.1:free',
      tags: ['speed', 'code'],
      headers: orHeaders,
      cooldownUntil: 0
    });

    // 32. Apodex 1.1 Mini
    pool.push({
      name: 'OpenRouter - Apodex 1.1 Mini (Free)',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'apodex/apodex-1.1-mini:free',
      tags: ['speed'],
      headers: orHeaders,
      cooldownUntil: 0
    });

    // 33. Liquid LFM 2.5
    pool.push({
      name: 'OpenRouter - Liquid LFM 2.5 (Free)',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'liquid/lfm-2.5-2.6b:free',
      tags: ['speed'],
      headers: orHeaders,
      cooldownUntil: 0
    });

    // 34. Inkling
    pool.push({
      name: 'OpenRouter - Inkling Reasoning (Free)',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'thinkingmachines/inkling:free',
      tags: ['reasoning'],
      headers: orHeaders,
      cooldownUntil: 0
    });

    // 35. Inkling Small
    pool.push({
      name: 'OpenRouter - Inkling Small (Free)',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'thinkingmachines/inkling-small:free',
      tags: ['speed'],
      headers: orHeaders,
      cooldownUntil: 0
    });

    // 36. Dots 3 Note Preview
    pool.push({
      name: 'OpenRouter - Dots 3 Note Preview (Free)',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'dots-studio/dots-3-note-preview:free',
      tags: ['speed'],
      headers: orHeaders,
      cooldownUntil: 0
    });

    // 37. Nemotron Content Safety
    pool.push({
      name: 'OpenRouter - Nemotron Safety (Free)',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'nvidia/nemotron-3.5-content-safety:free',
      tags: ['speed'],
      headers: orHeaders,
      cooldownUntil: 0
    });

    // 38. DeepSeek R1 Free
    pool.push({
      name: 'OpenRouter - DeepSeek R1 Reasoning (Free)',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'deepseek/deepseek-r1:free',
      tags: ['reasoning', 'code'],
      headers: orHeaders,
      cooldownUntil: 0
    });

    // 39. DeepSeek V3 Free
    pool.push({
      name: 'OpenRouter - DeepSeek V3 (Free)',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'deepseek/deepseek-chat:free',
      tags: ['reasoning', 'code', 'speed'],
      headers: orHeaders,
      cooldownUntil: 0
    });

    // 40. Qwen 2.5 Coder 32B Free
    pool.push({
      name: 'OpenRouter - Qwen 2.5 Coder 32B (Free)',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'qwen/qwen-2.5-coder-32b-instruct:free',
      tags: ['code', 'speed'],
      headers: orHeaders,
      cooldownUntil: 0
    });

    // 41. LLaMA 3.3 70B Free
    pool.push({
      name: 'OpenRouter - LLaMA 3.3 70B (Free)',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      tags: ['reasoning', 'code'],
      headers: orHeaders,
      cooldownUntil: 0
    });

    // 42. Mistral 7B Free
    pool.push({
      name: 'OpenRouter - Mistral 7B Instruct (Free)',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'mistralai/mistral-7b-instruct:free',
      tags: ['speed', 'code'],
      headers: orHeaders,
      cooldownUntil: 0
    });
  }

  // ==============================================================================
  // TIER 3: GROQ CLOUD ULTRA-SPEED LPU TIER (Sub-second Latency)
  // ==============================================================================
  if (groqKey) {
    // 43. GPT-OSS 120B
    pool.push({
      name: 'Groq - GPT-OSS 120B (Ultra-Speed LPU)',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'openai/gpt-oss-120b',
      tags: ['speed', 'code', 'reasoning'],
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 44. Qwen 27B Fast
    pool.push({
      name: 'Groq - Qwen 27B Fast (Ultra-Speed LPU)',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'qwen/qwen3.8-27b',
      tags: ['speed', 'code'],
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 45. GPT-OSS 20B
    pool.push({
      name: 'Groq - GPT-OSS 20B (Ultra-Speed LPU)',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'openai/gpt-oss-20b',
      tags: ['speed'],
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 46. GPT-OSS Safeguard 20B
    pool.push({
      name: 'Groq - GPT-OSS Safeguard 20B',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'openai/gpt-oss-safeguard-20b',
      tags: ['speed'],
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 47. Allam 7B Fast
    pool.push({
      name: 'Groq - Allam 7B Fast',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'allam-2-7b',
      tags: ['speed'],
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });
  }

  // ==============================================================================
  // TIER 4: CEREBRAS WAFER-SCALE ENGINE TIER (1,000+ Tokens/Sec)
  // ==============================================================================
  if (cerebrasKey) {
    // 48. GPT-OSS 120B
    pool.push({
      name: 'Cerebras - GPT-OSS 120B (Wafer-Scale Engine)',
      url: 'https://api.cerebras.ai/v1/chat/completions',
      model: 'gpt-oss-120b',
      tags: ['speed', 'code', 'reasoning'],
      headers: { 'Authorization': `Bearer ${cerebrasKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });

    // 49. Qwen 27B Ultra-Speed
    pool.push({
      name: 'Cerebras - Qwen 27B Ultra-Speed (Wafer-Scale Engine)',
      url: 'https://api.cerebras.ai/v1/chat/completions',
      model: 'qwen-3.8-27b',
      tags: ['speed', 'code'],
      headers: { 'Authorization': `Bearer ${cerebrasKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });
  }

  // ==============================================================================
  // TIER 5: ZERO-KEY & META-ROUTERS (Public Dispatchers & Zero Setup)
  // ==============================================================================
  // 50. Pollinations GPT-4o Mini Free Engine (100% Free, Zero Key required)
  pool.push({
    name: 'Pollinations - GPT-4o Mini Free Engine',
    url: 'https://text.pollinations.ai/openai/chat/completions',
    model: 'openai',
    tags: ['speed', 'code'],
    headers: { 'Content-Type': 'application/json' },
    cooldownUntil: 0
  });

  // 51. 9Router Fast Free Dispatcher
  pool.push({
    name: '9Router - Fast Free Dispatcher',
    url: env.ROUTER9_BASE_URL || 'https://api.9router.free/v1/chat/completions',
    model: env.ROUTER9_MODEL || 'qwen/qwen-2.5-coder-32b',
    tags: ['code', 'speed'],
    headers: {
      'Authorization': `Bearer ${env.ROUTER9_API_KEY || 'free'}`,
      'Content-Type': 'application/json',
      'X-Title': 'Infinite Claude Code'
    },
    cooldownUntil: 0
  });

  // 52. OmniRouter Free Auto Balance
  pool.push({
    name: 'OmniRouter - Free Auto Balance',
    url: env.OMNIROUTER_BASE_URL || 'https://api.omnirouter.free/v1/chat/completions',
    model: env.OMNIROUTER_MODEL || 'deepseek/deepseek-chat',
    tags: ['speed', 'code', 'reasoning'],
    headers: {
      'Authorization': `Bearer ${env.OMNIROUTER_API_KEY || 'free'}`,
      'Content-Type': 'application/json',
      'X-Title': 'Infinite Claude Code'
    },
    cooldownUntil: 0
  });

  // ==============================================================================
  // TIER 6: LOCAL OFFLINE RESILIENCE (OLLAMA - MODEL AGNOSTIC)
  // Driven dynamically by env.OLLAMA_MODEL (defaults to llama3.2, supports any local model)
  // ==============================================================================
  const ollamaHost = env.OLLAMA_HOST || 'http://localhost:11434';
  const ollamaModel = env.OLLAMA_MODEL || 'llama3.2';
  pool.push({
    name: `Ollama Local (${ollamaModel}) [Offline Resilience]`,
    url: `${ollamaHost}/v1/chat/completions`,
    model: ollamaModel,
    tags: ['offline', 'speed', 'code'],
    headers: { 'Content-Type': 'application/json' },
    cooldownUntil: 0
  });

  // ==============================================================================
  // TIER 7: OPTIONAL EXTENDED CLOUD TIERS (Together AI, SambaNova, DeepInfra)
  // ==============================================================================
  if (togetherKey) {
    pool.push({
      name: 'Together AI - DeepSeek V3',
      url: 'https://api.together.xyz/v1/chat/completions',
      model: 'deepseek-ai/DeepSeek-V3',
      tags: ['reasoning', 'code'],
      headers: { 'Authorization': `Bearer ${togetherKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });
    pool.push({
      name: 'Together AI - LLaMA 3.3 70B Turbo',
      url: 'https://api.together.xyz/v1/chat/completions',
      model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      tags: ['reasoning', 'code', 'speed'],
      headers: { 'Authorization': `Bearer ${togetherKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });
    pool.push({
      name: 'Together AI - Qwen 2.5 Coder 32B',
      url: 'https://api.together.xyz/v1/chat/completions',
      model: 'Qwen/Qwen2.5-Coder-32B-Instruct',
      tags: ['code'],
      headers: { 'Authorization': `Bearer ${togetherKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });
  }

  if (sambanovaKey) {
    pool.push({
      name: 'SambaNova - LLaMA 3.3 70B',
      url: 'https://api.sambanova.ai/v1/chat/completions',
      model: 'Meta-Llama-3.3-70B-Instruct',
      tags: ['reasoning', 'code'],
      headers: { 'Authorization': `Bearer ${sambanovaKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });
    pool.push({
      name: 'SambaNova - Qwen 2.5 Coder 32B',
      url: 'https://api.sambanova.ai/v1/chat/completions',
      model: 'Qwen2.5-Coder-32B-Instruct',
      tags: ['code'],
      headers: { 'Authorization': `Bearer ${sambanovaKey}`, 'Content-Type': 'application/json' },
      cooldownUntil: 0
    });
  }

  return pool;
}

module.exports = { getProviders };
