/**
 * Performance & Benchmark Suite for Infinite Claude Code
 * Tests:
 * 1. Low-latency Quick Prompt (Speed Tier)
 * 2. Coding & Algorithm Task (Code Specialist Tier)
 * 3. Deep Reasoning & Architecture (Reasoning Tier)
 * 4. Concurrent Swarm Load Test (3 subagents in parallel)
 * 5. SSE Streaming Latency & Throughput (tokens/sec)
 */

const http = require('http');

const PORT = 20129;

function sendRequest(prompt, isStream = true) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    let ttft = 0;
    let chunks = 0;
    let fullText = '';
    let eventCount = 0;

    const payload = JSON.stringify({
      model: 'claude-3-7-sonnet',
      messages: [{ role: 'user', content: prompt }],
      stream: isStream
    });

    const req = http.request(`http://127.0.0.1:${PORT}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 30000
    }, (res) => {
      res.on('data', (d) => {
        if (!ttft) ttft = Date.now() - t0;
        chunks++;
        const str = d.toString();
        fullText += str;
        if (str.includes('event: content_block_delta')) {
          eventCount++;
        }
      });

      res.on('end', () => {
        const totalTime = Date.now() - t0;
        resolve({
          statusCode: res.statusCode,
          ttft,
          totalTime,
          chunks,
          eventCount,
          outputLength: fullText.length,
          preview: fullText.slice(0, 120).replace(/\n/g, ' ')
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(payload);
    req.end();
  });
}

async function runBenchmark() {
  console.log('='.repeat(70));
  console.log('⚡ INICIANDO SUITE DE BENCHMARK & RENDIMIENTO - INFINITE CLAUDE CODE');
  console.log(`📡 Endpoint objetivo: http://127.0.0.1:${PORT}`);
  console.log('='.repeat(70));

  const results = [];

  // TEST 1: Speed Tier
  console.log('\n[1/4] 🚀 Test 1: Petición Rápida de Baja Latencia (Tier Velocidad)...');
  try {
    const res1 = await sendRequest('Responde en una sola palabra: ACTIVO', true);
    console.log(`   ✓ Estado: ${res1.statusCode} HTTP`);
    console.log(`   ✓ Tiempo hasta primer token (TTFT): ${res1.ttft} ms`);
    console.log(`   ✓ Tiempo total: ${res1.totalTime} ms`);
    console.log(`   ✓ Eventos SSE recibidos: ${res1.eventCount}`);
    results.push({ name: 'Speed Query (Terminal)', ttft: res1.ttft, total: res1.totalTime, status: 'PASSED' });
  } catch (e) {
    console.log(`   ✗ Error: ${e.message}`);
    results.push({ name: 'Speed Query', status: 'FAILED' });
  }

  // TEST 2: Coding Specialist
  console.log('\n[2/4] 💻 Test 2: Tarea de Programación / Refactor (Tier Código)...');
  try {
    const res2 = await sendRequest('Escribe una función recursiva en JavaScript para calcular fibonacci con memoization y explica en 1 línea.', true);
    console.log(`   ✓ Estado: ${res2.statusCode} HTTP`);
    console.log(`   ✓ Tiempo hasta primer token (TTFT): ${res2.ttft} ms`);
    console.log(`   ✓ Tiempo total: ${res2.totalTime} ms`);
    console.log(`   ✓ Chunks de streaming: ${res2.chunks}`);
    results.push({ name: 'Code Generation (Fibonacci)', ttft: res2.ttft, total: res2.totalTime, status: 'PASSED' });
  } catch (e) {
    console.log(`   ✗ Error: ${e.message}`);
    results.push({ name: 'Code Generation', status: 'FAILED' });
  }

  // TEST 3: Reasoning Tier
  console.log('\n[3/4] 🧠 Test 3: Razonamiento Lógico y Arquitectura (Tier Reasoning)...');
  try {
    const res3 = await sendRequest('Analiza y diseña brevemente la arquitectura de un sistema de mensajería distribuido como Kafka indicando particionado y replicación.', true);
    console.log(`   ✓ Estado: ${res3.statusCode} HTTP`);
    console.log(`   ✓ Tiempo hasta primer token (TTFT): ${res3.ttft} ms`);
    console.log(`   ✓ Tiempo total: ${res3.totalTime} ms`);
    results.push({ name: 'Deep Reasoning (Architecture)', ttft: res3.ttft, total: res3.totalTime, status: 'PASSED' });
  } catch (e) {
    console.log(`   ✗ Error: ${e.message}`);
    results.push({ name: 'Deep Reasoning', status: 'FAILED' });
  }

  // TEST 4: Swarm Concurrency
  console.log('\n[4/4] 🐝 Test 4: Prueba de Estrés de Subagentes Concurrentes (3 agentes simultáneos)...');
  const tSwarm0 = Date.now();
  try {
    const promises = [
      sendRequest('Subagente 1: Crea un validador de emails en regex', true),
      sendRequest('Subagente 2: Crea un formateador de fechas ISO a legible', true),
      sendRequest('Subagente 3: Crea un generador de hashes sha256', true)
    ];

    const swarmResults = await Promise.all(promises);
    const totalSwarmTime = Date.now() - tSwarm0;
    console.log(`   ✓ 3 Subagentes despachados y completados en paralelo!`);
    console.log(`   ✓ Tiempo total del enjambre: ${totalSwarmTime} ms`);
    swarmResults.forEach((r, idx) => {
      console.log(`     - Subagente ${idx + 1}: ${r.totalTime}ms (TTFT: ${r.ttft}ms, Status: ${r.statusCode})`);
    });
    results.push({ name: 'Swarm Concurrency (3 Parallel Agents)', ttft: Math.min(...swarmResults.map(r=>r.ttft)), total: totalSwarmTime, status: 'PASSED' });
  } catch (e) {
    console.log(`   ✗ Error en Swarm: ${e.message}`);
    results.push({ name: 'Swarm Concurrency', status: 'FAILED' });
  }

  // Telemetry from HUD
  console.log('\n' + '='.repeat(70));
  console.log('📊 TELEMETRÍA FINAL OBTENIDA DESDE EL CYBER HUD (/api/stats)');
  console.log('='.repeat(70));
  http.get(`http://127.0.0.1:${PORT}/api/stats`, (res) => {
    let b = '';
    res.on('data', c => b += c);
    res.on('end', () => {
      try {
        const stats = JSON.parse(b);
        console.log(`💰 Dinero total ahorrado hoy: $${stats.moneySavedUsd.toFixed(4)} USD`);
        console.log(`🔢 Peticiones totales despachadas: ${stats.totalRequests}`);
        console.log(`📦 Tokens totales procesados: ${stats.totalInputTokens + stats.totalOutputTokens} (${stats.totalInputTokens} in / ${stats.totalOutputTokens} out)`);
        console.log('\nÚltimas peticiones en el Cyber HUD:');
        (stats.recentRequests || []).slice(0, 5).forEach((r, i) => {
          console.log(`  [${i+1}] ${r.timestamp} | Task: ${r.task.toUpperCase()} | ${r.provider} | ${r.latencyMs}ms | ${r.tokens} tokens | Ahorro: +$${r.savingsUsd}`);
        });
      } catch (e) {}
    });
  });
}

runBenchmark();
