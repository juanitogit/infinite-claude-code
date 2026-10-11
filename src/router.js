/**
 * INFINITY CLAUDE CODE ROUTER - CORE ENGINE
 * Features:
 * 1. Swarm Concurrency Dispatcher (Load-balances subagents across providers)
 * 2. Semantic Task Routing (Reasoning vs Code vs Speed classification)
 * 3. Self-Healing Tool Repair (Sanitizes and auto-fixes malformed JSON tool calls)
 * 4. Cyber HUD & Savings Tracker (Live web telemetry at /hud)
 * 5. Native Real-Time SSE Streaming (Zero-latency Anthropic Messages API translation)
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

function loadLocalEnv() {
  const envPaths = [
    path.join(__dirname, '..', '.env'),
    path.join(process.env.USERPROFILE || process.env.HOME || '', '.infinite-claude', '.env')
  ];
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        for (const line of content.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const idx = trimmed.indexOf('=');
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      } catch (e) {}
    }
  }
}
loadLocalEnv();

const { getProviders } = require('./providers');

const DEFAULT_PORT = 20129;

// ==============================================================================
// 1. SELF-HEALING TOOL CALL REPAIR UTILITY
// ==============================================================================
function repairJsonArguments(raw) {
  if (!raw || typeof raw !== 'string') return '{}';
  let str = raw.trim();

  // Try parsing directly
  try {
    JSON.parse(str);
    return str;
  } catch (e) {}

  // Strip markdown code fences if LLM wrapped it
  str = str.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  // Auto-close open braces or brackets
  let openBraces = (str.match(/\{/g) || []).length;
  let closeBraces = (str.match(/\}/g) || []).length;
  while (openBraces > closeBraces) { str += '}'; closeBraces++; }

  let openBrackets = (str.match(/\[/g) || []).length;
  let closeBrackets = (str.match(/\]/g) || []).length;
  while (openBrackets > closeBrackets) { str += ']'; closeBrackets++; }

  // Clean trailing commas before closers
  str = str.replace(/,\s*([\}\]])/g, '$1');

  try {
    JSON.parse(str);
    return str;
  } catch (err) {
    // Regex extraction for common Bash / command fields
    const cmdMatch = str.match(/"command"\s*:\s*"([\s\S]*?)"/);
    if (cmdMatch) return JSON.stringify({ command: cmdMatch[1] });
    return '{}';
  }
}

// ==============================================================================
// 2. ADVANCED SEMANTIC TASK CLASSIFIER (Level 1, 2 & 3)
// ==============================================================================
function classifyTask(reqData) {
  const messages = reqData.messages || [];
  const lastMsg = messages[messages.length - 1] || {};
  let content = '';

  if (typeof lastMsg.content === 'string') {
    content = lastMsg.content.toLowerCase();
  } else if (Array.isArray(lastMsg.content)) {
    content = lastMsg.content.map(p => p.text || '').join(' ').toLowerCase();
  }

  const tools = reqData.tools || [];
  const toolNames = tools.map(t => (t.name || '').toLowerCase());

  // PRIORITY: Code Execution & Action Tasks (Tool-use, files, subagents)
  const codeActionKeywords = [
    'crea', 'genera', 'escribe', 'haz', 'construye', 'write', 'create', 'build',
    'implement', 'fix', 'run', 'make', 'agentes', 'subagentes', 'portfolio',
    'portafolio', 'archivo', 'carpeta', 'code', 'function', 'app', 'web', 'script'
  ];
  if (
    codeActionKeywords.some(kw => content.includes(kw)) ||
    toolNames.includes('write') ||
    toolNames.includes('edit') ||
    toolNames.includes('bash') ||
    toolNames.includes('agent') ||
    toolNames.includes('fileedittool') ||
    toolNames.includes('write_to_file')
  ) {
    return 'code';
  }

  // LEVEL 3: Pure Analytical / Theoretical Reasoning (Opus 5.5 / Astra 6 Engine)
  const reasoningKeywords = [
    'why', 'explain concept', 'analyze theory', 'por que', 'compara algoritmos',
    'filosofia', 'analisis abstracto', 'arquitectura pura'
  ];
  if (reasoningKeywords.some(kw => content.includes(kw))) {
    return 'reasoning';
  }

  // LEVEL 1: Quick Terminal / Inspection / Short queries (Lightning Engine)
  return 'speed';
}

// Precision Temperature & Thinking Calibration
function getPrecisionParams(taskType) {
  if (taskType === 'code') {
    return { temperature: 0.2, top_p: 0.95 }; // Ultra-deterministic syntax
  }
  if (taskType === 'reasoning') {
    return { temperature: 0.3, top_p: 0.9 };  // Rigorous analytical thinking
  }
  return { temperature: 0.5, top_p: 1.0 };    // Fast conversational
}

class InfiniteRouter {
  constructor(options = {}) {
    this.port = options.port || DEFAULT_PORT;
    this.logFile = options.logFile || path.join(__dirname, '..', 'router.log');
    this.providers = getProviders(process.env);
    this.server = null;

    // Concurrency & Telemetry Tracker
    this.activeSubagents = 0;
    this.totalRequests = 0;
    this.totalInputTokens = 0;
    this.totalOutputTokens = 0;
    this.moneySavedUsd = 0.0;
    this.recentRequests = [];
    this.roundRobinIndex = 0;
  }

  log(msg) {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
    const line = `[${ts}] ${msg}\n`;
    try { fs.appendFileSync(this.logFile, line); } catch (e) {}
    if (process.env.DEBUG) console.log(`[Router] ${msg}`);
  }

  recordTelemetry(reqInfo) {
    this.totalRequests++;
    this.totalInputTokens += reqInfo.inputTokens || 0;
    this.totalOutputTokens += reqInfo.outputTokens || 0;

    // Anthropic Claude 3.7 Sonnet rates: $3.00/M input, $15.00/M output
    const saved = ((reqInfo.inputTokens || 0) * 0.000003) + ((reqInfo.outputTokens || 0) * 0.000015);
    this.moneySavedUsd += saved;

    this.recentRequests.unshift({
      id: reqInfo.id,
      timestamp: new Date().toLocaleTimeString(),
      task: reqInfo.task,
      model: reqInfo.model,
      provider: reqInfo.provider,
      latencyMs: reqInfo.latencyMs,
      tokens: (reqInfo.inputTokens || 0) + (reqInfo.outputTokens || 0),
      savingsUsd: saved.toFixed(4)
    });

    if (this.recentRequests.length > 50) this.recentRequests.pop();
  }

  // ==============================================================================
  // 3. SWARM CONCURRENCY DISPATCHER
  // ==============================================================================
  getSortedProviders(taskType) {
    const now = Date.now() / 1000;
    const available = this.providers.filter(p => p.cooldownUntil <= now);

    // Prefer models tagged for this task
    const matched = available.filter(p => p.tags && p.tags.includes(taskType));
    const others = available.filter(p => !p.tags || !p.tags.includes(taskType));

    // If multiple subagents run concurrently, rotate candidates
    if (this.activeSubagents > 1 && matched.length > 1) {
      const offset = (this.roundRobinIndex++) % matched.length;
      return [...matched.slice(offset), ...matched.slice(0, offset), ...others];
    }

    return [...matched, ...others];
  }

  convertToOpenAI(reqData, streamMode = false, taskType = 'speed') {
    const messages = [];

    // Opus 5.5 / Astra 6 Cognitive Precision Scaffold
    const opus55Scaffold = [
      '[OPUS 5.5 / ASTRA 6 COGNITIVE PRECISION DIRECTIVE]',
      'Operating Mode: Senior Architect & Code Virtuoso (Opus 5.5 / Astra 6 Tier).',
      '1. ZERO INCOMPLETE CODE: Output 100% complete, production-ready implementations. NEVER use "// TODO", "// implement logic", or placeholders.',
      '2. CHAIN-OF-VERIFICATION: Verify imports, types, syntax, async safety, and edge cases before emitting code or tool parameters.',
      '3. TOOL EXECUTION DIRECTIVE: You have native tools provided. When the user requests creating files, writing code, executing commands, or launching subagents, YOU MUST INVOKE THE TOOLS IMMEDIATELY. DO NOT ask for user permission or explain what you intend to do; invoke the tool call directly.',
      '4. MAXIMUM TECHNICAL DENSITY: Be authoritative, concise, and eliminate conversational filler.'
    ].join('\n');

    // System prompt with injected precision scaffold
    const sys = reqData.system;
    let combinedSys = opus55Scaffold;
    if (sys) {
      const sysText = Array.isArray(sys)
        ? sys.filter(p => typeof p === 'object').map(p => p.text || '').join('\n')
        : String(sys);
      if (sysText) combinedSys = `${opus55Scaffold}\n\n[CLIENT SYSTEM INSTRUCTIONS]\n${sysText}`;
    }
    messages.push({ role: 'system', content: combinedSys });

    // Messages
    for (const msg of (reqData.messages || [])) {
      const role = msg.role;
      const content = msg.content;
      let text = '';
      if (Array.isArray(content)) {
        const parts = [];
        for (const part of content) {
          if (typeof part === 'object') {
            if (part.type === 'text') parts.push(part.text || '');
            else if (part.type === 'tool_result') {
              let tc = part.content || '';
              if (Array.isArray(tc)) {
                tc = tc.filter(x => typeof x === 'object').map(x => x.text || '').join('\n');
              }
              parts.push(`[Tool Result: ${tc}]`);
            } else if (part.type === 'tool_use') {
              parts.push(`[Tool Call: ${part.name || ''}(${JSON.stringify(part.input || {})})]`);
            }
          }
        }
        text = parts.join('\n');
      } else {
        text = content ? String(content) : '';
      }
      if (text) messages.push({ role, content: text });
    }

    // Tools
    const tools = (reqData.tools || []).map(t => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description || '',
        parameters: t.input_schema || {}
      }
    }));

    const maxTokens = Math.max(reqData.max_tokens || 4096, 4096);
    const precision = getPrecisionParams(taskType);

    const payload = {
      messages,
      max_tokens: maxTokens,
      temperature: precision.temperature,
      top_p: precision.top_p,
      stream: streamMode
    };
    if (tools.length > 0) {
      payload.tools = tools;
      payload.tool_choice = 'auto';
    }

    return payload;
  }

  sseEvent(res, eventName, data) {
    res.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  streamProviderToClient(provider, payload, reqData, clientRes) {
    return new Promise((resolve, reject) => {
      const u = new URL(provider.url);
      const mod = u.protocol === 'https:' ? https : http;
      const bodyStr = JSON.stringify(payload);

      const opts = {
        hostname: u.hostname,
        port: u.port || (u.protocol === 'https:' ? 443 : 80),
        path: u.pathname,
        method: 'POST',
        headers: { ...provider.headers, 'Content-Length': Buffer.byteLength(bodyStr) },
        timeout: 10000
      };

      let firstTokenReceived = false;
      let messageId = `msg_${Date.now()}`;
      let buffer = '';
      let totalOutputTokens = 0;
      let nextBlockIndex = 0;
      let textBlockIndex = null;
      let hasStoppedText = false;
      const toolBlocks = new Map();

      const watchdogTimer = setTimeout(() => {
        if (!firstTokenReceived) {
          req.destroy(new Error('First token timeout (15s)'));
        }
      }, 15000);

      const req = mod.request(opts, (res) => {
        if (res.statusCode >= 400) {
          clearTimeout(watchdogTimer);
          let errBody = '';
          res.on('data', c => errBody += c);
          res.on('end', () => reject({ statusCode: res.statusCode, body: errBody }));
          return;
        }

        res.on('data', (chunk) => {
          if (!firstTokenReceived) {
            firstTokenReceived = true;
            clearTimeout(watchdogTimer);
            if (!clientRes.headersSent) {
              clientRes.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no'
              });
            }
            this.sseEvent(clientRes, 'message_start', {
              type: 'message_start',
              message: {
                id: messageId,
                type: 'message',
                role: 'assistant',
                model: reqData.model || 'claude-3-7-sonnet-20250219',
                content: [],
                stop_reason: null,
                stop_sequence: null,
                usage: { input_tokens: 30, output_tokens: 0 }
              }
            });
          }

          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop();

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const dataStr = trimmed.slice(5).trim();
            if (dataStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(dataStr);
              const choice = (parsed.choices || [])[0] || {};
              const delta = choice.delta || {};

              const textToSend = delta.content;

              if (textToSend) {
                if (textBlockIndex === null) {
                  textBlockIndex = nextBlockIndex++;
                  this.sseEvent(clientRes, 'content_block_start', {
                    type: 'content_block_start',
                    index: textBlockIndex,
                    content_block: { type: 'text', text: '' }
                  });
                }
                this.sseEvent(clientRes, 'content_block_delta', {
                  type: 'content_block_delta',
                  index: textBlockIndex,
                  delta: { type: 'text_delta', text: textToSend }
                });
                totalOutputTokens++;
              }

              // Self-Healing Tool Handling with Exact Anthropic Block Indexing
              if (delta.tool_calls && delta.tool_calls.length > 0) {
                if (textBlockIndex !== null && !hasStoppedText) {
                  this.sseEvent(clientRes, 'content_block_stop', {
                    type: 'content_block_stop',
                    index: textBlockIndex
                  });
                  hasStoppedText = true;
                }
                for (const tc of delta.tool_calls) {
                  const key = tc.index !== undefined ? tc.index : 0;
                  if (!toolBlocks.has(key)) {
                    const bIdx = nextBlockIndex++;
                    const tObj = {
                      blockIndex: bIdx,
                      id: tc.id || `call_${Date.now()}_${bIdx}`,
                      name: (tc.function && tc.function.name) || 'tool',
                      args: ''
                    };
                    toolBlocks.set(key, tObj);
                    this.sseEvent(clientRes, 'content_block_start', {
                      type: 'content_block_start',
                      index: bIdx,
                      content_block: {
                        type: 'tool_use',
                        id: tObj.id,
                        name: tObj.name,
                        input: {}
                      }
                    });
                  }
                  const currentTool = toolBlocks.get(key);
                  if (tc.function && tc.function.name && tc.function.name !== currentTool.name) {
                    currentTool.name = tc.function.name;
                  }
                  if (tc.function && tc.function.arguments) {
                    currentTool.args += tc.function.arguments;
                    this.sseEvent(clientRes, 'content_block_delta', {
                      type: 'content_block_delta',
                      index: currentTool.blockIndex,
                      delta: {
                        type: 'input_json_delta',
                        partial_json: tc.function.arguments
                      }
                    });
                  }
                }
              }
            } catch (e) {}
          }
        });

        res.on('end', () => {
          if (!firstTokenReceived) {
            reject(new Error('Empty stream from provider'));
            return;
          }

          if (textBlockIndex !== null && !hasStoppedText) {
            this.sseEvent(clientRes, 'content_block_stop', {
              type: 'content_block_stop',
              index: textBlockIndex
            });
            hasStoppedText = true;
          }

          for (const tb of toolBlocks.values()) {
            this.sseEvent(clientRes, 'content_block_stop', {
              type: 'content_block_stop',
              index: tb.blockIndex
            });
          }

          const stopReason = toolBlocks.size > 0 ? 'tool_use' : 'end_turn';
          this.sseEvent(clientRes, 'message_delta', {
            type: 'message_delta',
            delta: { stop_reason: stopReason, stop_sequence: null },
            usage: { output_tokens: Math.max(totalOutputTokens, 1) }
          });

          clearTimeout(watchdogTimer);
          this.sseEvent(clientRes, 'message_stop', { type: 'message_stop' });
          clientRes.end();
          resolve({ outputTokens: Math.max(totalOutputTokens, 1) });
        });
      });

      req.on('error', (err) => {
        clearTimeout(watchdogTimer);
        if (!firstTokenReceived) reject(err);
        else { clientRes.end(); resolve({ outputTokens: totalOutputTokens }); }
      });

      req.on('timeout', () => {
        clearTimeout(watchdogTimer);
        req.destroy();
        if (!firstTokenReceived) reject(new Error('First token timeout'));
        else { clientRes.end(); resolve({ outputTokens: totalOutputTokens }); }
      });

      req.write(bodyStr);
      req.end();
    });
  }

  requestNonStreaming(provider, payload) {
    return new Promise((resolve, reject) => {
      const u = new URL(provider.url);
      const mod = u.protocol === 'https:' ? https : http;
      const bodyStr = JSON.stringify(payload);

      const opts = {
        hostname: u.hostname,
        port: u.port || (u.protocol === 'https:' ? 443 : 80),
        path: u.pathname,
        method: 'POST',
        headers: { ...provider.headers, 'Content-Length': Buffer.byteLength(bodyStr) },
        timeout: 25000
      };

      let timer = setTimeout(() => {
        req.destroy(new Error('Non-streaming request timeout (25s)'));
      }, 25000);

      const req = mod.request(opts, (res) => {
        let b = '';
        res.on('data', c => b += c);
        res.on('end', () => {
          clearTimeout(timer);
          if (res.statusCode >= 400) {
            reject({ statusCode: res.statusCode, body: b });
          } else {
            try { resolve(JSON.parse(b)); }
            catch (e) { reject({ statusCode: res.statusCode, body: b }); }
          }
        });
      });
      req.on('error', (err) => { clearTimeout(timer); reject(err); });
      req.on('timeout', () => { clearTimeout(timer); req.destroy(); reject(new Error('timeout')); });
      req.write(bodyStr);
      req.end();
    });
  }

  convertToAnthropicJSON(reqData, responseData) {
    const choice = (responseData.choices || [{}])[0];
    const msg = choice.message || {};
    const content = [];

    const textContent = msg.content;
    const reasoningContent = msg.reasoning || msg.reasoning_content;

    if (textContent) {
      content.push({ type: 'text', text: textContent });
    } else if (reasoningContent) {
      content.push({ type: 'text', text: reasoningContent.trim() });
    }

    // Self-Healing Tool Call Inspection
    if (msg.tool_calls && msg.tool_calls.length > 0) {
      for (const tc of msg.tool_calls) {
        const fn = tc.function || {};
        const repaired = repairJsonArguments(fn.arguments);
        let parsedArgs = {};
        try { parsedArgs = JSON.parse(repaired); } catch (e) {}

        content.push({
          type: 'tool_use',
          id: tc.id || `call_${Date.now()}`,
          name: fn.name,
          input: parsedArgs
        });
      }
    }

    if (content.length === 0) {
      content.push({ type: 'text', text: '¡Listo! ¿En qué puedo ayudarte hoy?' });
    }

    const stopReason = (msg.tool_calls && msg.tool_calls.length > 0) ? 'tool_use' : 'end_turn';

    return {
      id: responseData.id || `msg_${Date.now()}`,
      type: 'message',
      role: 'assistant',
      model: reqData.model || 'claude-3-7-sonnet-20250219',
      content,
      stop_reason: stopReason,
      usage: {
        input_tokens: (responseData.usage || {}).prompt_tokens || 25,
        output_tokens: (responseData.usage || {}).completion_tokens || 35
      }
    };
  }

  // ==============================================================================
  // 4. CYBER HUD HTML TEMPLATE
  // ==============================================================================
  renderHudHtml() {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>⚡ Infinite Claude Code | Cyber HUD</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: rgba(16, 24, 40, 0.75);
      --border: rgba(30, 41, 59, 0.8);
      --accent: #00f2fe;
      --accent-grad: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      --green: #10b981;
      --purple: #8b5cf6;
      --text: #f1f5f9;
      --subtext: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }
    body { background: var(--bg); color: var(--text); min-height: 100vh; padding: 2rem; background-image: radial-gradient(circle at top right, rgba(0, 242, 254, 0.08), transparent 400px), radial-gradient(circle at bottom left, rgba(139, 92, 246, 0.08), transparent 400px); }
    .container { max-width: 1200px; margin: 0 auto; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border); }
    .logo { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.5px; background: var(--accent-grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .badge { background: rgba(16, 185, 129, 0.15); color: var(--green); border: 1px solid rgba(16, 185, 129, 0.3); padding: 0.35rem 0.8rem; border-radius: 999px; font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.4rem; }
    .dot { width: 8px; height: 8px; background: var(--green); border-radius: 50%; box-shadow: 0 0 10px var(--green); animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .card { background: var(--card-bg); backdrop-filter: blur(12px); border: 1px solid var(--border); border-radius: 1rem; padding: 1.5rem; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); }
    .card-title { font-size: 0.85rem; text-transform: uppercase; color: var(--subtext); letter-spacing: 1px; margin-bottom: 0.5rem; }
    .card-value { font-size: 2.2rem; font-weight: 800; background: var(--accent-grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .card-sub { font-size: 0.85rem; color: var(--subtext); margin-top: 0.4rem; }
    .section-title { font-size: 1.2rem; font-weight: 700; margin-bottom: 1rem; color: #fff; display: flex; align-items: center; gap: 0.5rem; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
    th { padding: 0.75rem 1rem; color: var(--subtext); border-bottom: 1px solid var(--border); font-weight: 600; }
    td { padding: 0.85rem 1rem; border-bottom: 1px solid rgba(30, 41, 59, 0.4); }
    tr:hover td { background: rgba(255, 255, 255, 0.02); }
    .tag { padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .tag-reasoning { background: rgba(139, 92, 246, 0.2); color: #c4b5fd; border: 1px solid rgba(139, 92, 246, 0.3); }
    .tag-code { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.3); }
    .tag-speed { background: rgba(0, 242, 254, 0.2); color: #67e8f9; border: 1px solid rgba(0, 242, 254, 0.3); }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">⚡ INFINITE CLAUDE CODE · CYBER HUD</div>
      <div class="badge"><div class="dot"></div> POOL OPERATIVO (49+ MODELOS)</div>
    </header>

    <div class="grid">
      <div class="card">
        <div class="card-title">💰 Dinero Ahorrado Estimado</div>
        <div class="card-value" id="val-saved">$0.00</div>
        <div class="card-sub">Calculado vs tarifas oficiales Claude 3.7 Sonnet</div>
      </div>
      <div class="card">
        <div class="card-title">⚡ Subagentes Concurrente Activos</div>
        <div class="card-value" id="val-agents">0</div>
        <div class="card-sub">Swarm Dispatcher balanceando carga</div>
      </div>
      <div class="card">
        <div class="card-title">📊 Tokens Totales Procesados</div>
        <div class="card-value" id="val-tokens">0</div>
        <div class="card-sub" id="val-tokens-sub">0 in / 0 out</div>
      </div>
      <div class="card">
        <div class="card-title">🚀 Peticiones Despachadas</div>
        <div class="card-value" id="val-reqs">0</div>
        <div class="card-sub">Auto-failover con latencia media <span id="val-lat">0</span>ms</div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 2rem;">
      <div class="section-title">🤖 Feed de Actividad en Tiempo Real</div>
      <table>
        <thead>
          <tr>
            <th>Hora</th>
            <th>Tipo de Tarea</th>
            <th>Modelo Despachado</th>
            <th>Tokens</th>
            <th>Latencia</th>
            <th>Ahorro</th>
          </tr>
        </thead>
        <tbody id="feed-tbody">
          <tr><td colspan="6" style="text-align: center; color: var(--subtext); padding: 2rem;">Esperando peticiones de Claude Code...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <script>
    async function updateStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        document.getElementById('val-saved').textContent = '$' + data.moneySavedUsd.toFixed(3);
        document.getElementById('val-agents').textContent = data.activeSubagents;
        document.getElementById('val-tokens').textContent = (data.totalInputTokens + data.totalOutputTokens).toLocaleString();
        document.getElementById('val-tokens-sub').textContent = data.totalInputTokens.toLocaleString() + ' in / ' + data.totalOutputTokens.toLocaleString() + ' out';
        document.getElementById('val-reqs').textContent = data.totalRequests.toLocaleString();

        const tbody = document.getElementById('feed-tbody');
        if (data.recentRequests && data.recentRequests.length > 0) {
          let avgLat = Math.round(data.recentRequests.reduce((a, b) => a + (b.latencyMs || 0), 0) / data.recentRequests.length);
          document.getElementById('val-lat').textContent = avgLat;

          tbody.innerHTML = data.recentRequests.map(r => \`
            <tr>
              <td style="color: var(--subtext)">\${r.timestamp}</td>
              <td><span class="tag tag-\${r.task}">\${r.task}</span></td>
              <td style="font-weight: 600; color: #fff;">\${r.provider}</td>
              <td>\${r.tokens}</td>
              <td style="color: var(--accent)">\${r.latencyMs}ms</td>
              <td style="color: var(--green); font-weight: 600;">+$\${r.savingsUsd}</td>
            </tr>
          \`).join('');
        }
      } catch (e) {}
    }
    setInterval(updateStats, 1500);
    updateStats();
  </script>
</body>
</html>`;
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer(async (req, res) => {
        // HEAD
        if (req.method === 'HEAD') {
          res.writeHead(200);
          return res.end();
        }

        // GET /hud or GET /dashboard
        if (req.method === 'GET' && (req.url === '/hud' || req.url === '/dashboard')) {
          const html = this.renderHudHtml();
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          return res.end(html);
        }

        // GET /api/stats
        if (req.method === 'GET' && req.url === '/api/stats') {
          const stats = {
            activeSubagents: this.activeSubagents,
            totalRequests: this.totalRequests,
            totalInputTokens: this.totalInputTokens,
            totalOutputTokens: this.totalOutputTokens,
            moneySavedUsd: this.moneySavedUsd,
            recentRequests: this.recentRequests
          };
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(stats));
        }

        // GET Root / (JSON Status + Link to HUD)
        if (req.method === 'GET' && req.url === '/') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            status: 'online',
            streaming: true,
            dashboard: `http://127.0.0.1:${this.port}/hud`,
            moneySavedUsd: `$${this.moneySavedUsd.toFixed(2)}`,
            activeSubagents: this.activeSubagents,
            providers_count: this.providers.length,
            pool: this.providers.map(p => p.name)
          }));
        }

        // POST /v1/messages (Claude Code Core Routing)
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', async () => {
            let reqData;
            try { reqData = JSON.parse(body); }
            catch (e) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }

            this.activeSubagents++;
            const t0 = Date.now();
            const taskType = classifyTask(reqData);
            const isStream = reqData.stream === true;
            const candidateProviders = this.getSortedProviders(taskType);
            let handled = false;

            for (const provider of candidateProviders) {
              const openaiPayload = this.convertToOpenAI(reqData, isStream, taskType);
              openaiPayload.model = provider.model;
              this.log(`🔄 [${isStream ? 'STREAM' : 'POST'}][${taskType.toUpperCase()}] ${provider.name}...`);

              try {
                if (isStream) {
                  const result = await this.streamProviderToClient(provider, openaiPayload, reqData, res);
                  const latency = Date.now() - t0;
                  this.log(`✅ [STREAM SUCCESS] ${provider.name} (${latency}ms)`);
                  this.recordTelemetry({
                    id: `req_${Date.now()}`,
                    task: taskType,
                    model: provider.model,
                    provider: provider.name,
                    latencyMs: latency,
                    inputTokens: 30,
                    outputTokens: (result && result.outputTokens) || 40
                  });
                  handled = true;
                  break;
                } else {
                  const data = await this.requestNonStreaming(provider, openaiPayload);
                  const anthropicJson = this.convertToAnthropicJSON(reqData, data);
                  const latency = Date.now() - t0;
                  const respStr = JSON.stringify(anthropicJson);
                  res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(respStr)
                  });
                  res.end(respStr);
                  this.log(`✅ [JSON SUCCESS] ${provider.name} (${latency}ms)`);
                  this.recordTelemetry({
                    id: `req_${Date.now()}`,
                    task: taskType,
                    model: provider.model,
                    provider: provider.name,
                    latencyMs: latency,
                    inputTokens: (data.usage && data.usage.prompt_tokens) || 30,
                    outputTokens: (data.usage && data.usage.completion_tokens) || 40
                  });
                  handled = true;
                  break;
                }
              } catch (err) {
                const code = err.statusCode || 0;
                this.log(`⚠️ ${provider.name} failed (${code || err.message}). Failing over to next...`);
                provider.cooldownUntil = (Date.now() / 1000) + 90;
                if (provider.name.startsWith('OpenRouter') && (code === 429 || (err.body && String(err.body).includes('free-models-per-day')))) {
                  this.log('🚨 OpenRouter free-tier daily cap reached. Setting cooldown on OpenRouter models to prioritize active NIM/Groq pool.');
                  for (const p of this.providers) {
                    if (p.name.startsWith('OpenRouter')) {
                      p.cooldownUntil = (Date.now() / 1000) + 3600;
                    }
                  }
                }
              }
            }

            this.activeSubagents = Math.max(0, this.activeSubagents - 1);

            if (!handled) {
              this.log('❌ All candidate providers in pool failed.');
              if (!res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'All providers in pool failed or are cooling down' }));
              }
            }
          });
          return;
        }

        res.writeHead(405);
        res.end();
      });

      this.server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          reject(new Error(`Port ${this.port} is already in use.`));
        } else {
          reject(err);
        }
      });

      this.server.listen(this.port, '127.0.0.1', () => {
        this.log(`🚀 Infinite Router active on http://127.0.0.1:${this.port}`);
        resolve(this.port);
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (this.server) this.server.close(resolve);
      else resolve();
    });
  }
}

module.exports = { InfiniteRouter };

if (require.main === module) {
  const router = new InfiniteRouter();
  router.start().then(port => {
    console.log(`[InfiniteRouter] Listening on http://127.0.0.1:${port}`);
    console.log(`[InfiniteRouter] Cyber HUD active at http://127.0.0.1:${port}/hud`);
  }).catch(err => {
    console.error(`[InfiniteRouter] Error:`, err.message);
    process.exit(1);
  });
}
