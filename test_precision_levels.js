/**
 * Verification Suite for Semantic Task Routing & Opus 5.5 Precision Engine
 */

const http = require('http');

function postMsg(prompt, stream = false) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const payload = JSON.stringify({
      model: 'claude-3-7-sonnet',
      messages: [{ role: 'user', content: prompt }],
      stream
    });

    const req = http.request('http://127.0.0.1:20129/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 35000
    }, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(b);
          const text = j.content.map(c => c.text).join('\n');
          resolve({
            statusCode: res.statusCode,
            latencyMs: Date.now() - t0,
            text,
            tokens: (j.usage && j.usage.output_tokens) || 0
          });
        } catch (e) {
          resolve({ statusCode: res.statusCode, latencyMs: Date.now() - t0, text: b });
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('='.repeat(70));
  console.log('🎯 PRUEBA DE NIVELES DE PETICIÓN & MOTOR DE PRECISIÓN OPUS 5.5 / ASTRA 6');
  console.log('='.repeat(70));

  // NIVEL 1: Speed / Inspección
  console.log('\n[NIVEL 1: SPEED / COMANDOS RÁPIDOS]');
  console.log('Prompt: "Cual es el comando de git para deshacer el ultimo commit manteniendo los cambios?"');
  const res1 = await postMsg('Cual es el comando de git para deshacer el ultimo commit manteniendo los cambios?');
  console.log(`⏱ Latencia: ${res1.latencyMs} ms`);
  console.log(`📝 Respuesta:\n${res1.text.trim()}\n`);

  // NIVEL 2: Código / Precisión de Sintaxis
  console.log('[NIVEL 2: CÓDIGO & PRECISIÓN SINTÁCTICA (Opus 5.5 Directives)]');
  console.log('Prompt: "Implementa una clase TypeScript RateLimiter con token bucket algoritmo, sin omitir codigo ni poner placeholders."');
  const res2 = await postMsg('Implementa una clase TypeScript RateLimiter con token bucket algoritmo, sin omitir codigo ni poner placeholders.');
  console.log(`⏱ Latencia: ${res2.latencyMs} ms`);
  console.log(`📝 Extracto de Código (verificando completitud y cero placeholders):\n${res2.text.slice(0, 450)}...\n`);

  // NIVEL 3: Razonamiento Profundo / Arquitectura
  console.log('[NIVEL 3: ARQUITECTURA & ANÁLISIS PROFUNDO]');
  console.log('Prompt: "Analiza y diseña el flujo de consenso y failover para una base de datos distribuida con Raft vs Paxos."');
  const res3 = await postMsg('Analiza y diseña el flujo de consenso y failover para una base de datos distribuida con Raft vs Paxos.');
  console.log(`⏱ Latencia: ${res3.latencyMs} ms`);
  console.log(`📝 Extracto del Análisis:\n${res3.text.slice(0, 450)}...\n`);

  // Consultar Telemetría del HUD
  console.log('='.repeat(70));
  console.log('📊 TELEMETRÍA DEL CLASIFICADOR EN EL CYBER HUD');
  console.log('='.repeat(70));
  http.get('http://127.0.0.1:20129/api/stats', (sRes) => {
    let b = '';
    sRes.on('data', c => b += c);
    sRes.on('end', () => {
      const stats = JSON.parse(b);
      console.log(`Dinero ahorrado hoy: $${stats.moneySavedUsd.toFixed(4)} USD`);
      console.log('\nHistorial de clasificación de tareas:');
      (stats.recentRequests || []).slice(0, 3).forEach((r, i) => {
        console.log(`  [Nivel Detectado: ${r.task.toUpperCase()}] Model: ${r.provider} | Latencia: ${r.latencyMs}ms | Tokens: ${r.tokens}`);
      });
    });
  });
}

run();
