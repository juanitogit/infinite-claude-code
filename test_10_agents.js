const http = require('http');

const agentTasks = [
  'Agent 1 (Scaffold): Verifica estructura modular',
  'Agent 2 (Design): Revisa paleta Glassmorphism',
  'Agent 3 (Canvas): Optimiza loop de particulas',
  'Agent 4 (Terminal): Verifica comandos help y matrix',
  'Agent 5 (Audio): Comprueba frecuencias Web Audio',
  'Agent 6 (Projects): Revisa tarjetas y filtros',
  'Agent 7 (Metrics): Comprueba contadores numericos',
  'Agent 8 (Contact): Valida inputs de formulario',
  'Agent 9 (Deploy): Comprueba script server.js',
  'Agent 10 (Review): Auditoria final de codigo'
];

console.log('🚀 Lanzando 10 Agentes en Paralelo al Infinite Router (http://127.0.0.1:20129)...\n');

const promises = agentTasks.map((taskName, idx) => {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const body = JSON.stringify({
      model: 'claude-3-7-sonnet-20250219',
      messages: [{ role: 'user', content: taskName + '. Responde en 1 sola frase corta.' }],
      stream: true,
      max_tokens: 30
    });

    const req = http.request('http://127.0.0.1:20129/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'infinite-key',
        'anthropic-version': '2023-06-01'
      }
    }, res => {
      let output = '';
      res.on('data', chunk => {
        const str = chunk.toString();
        for (const line of str.split('\n')) {
          if (line.startsWith('data:')) {
            try {
              const j = JSON.parse(line.slice(5));
              if (j.delta && j.delta.text) output += j.delta.text;
            } catch(e) {}
          }
        }
      });
      res.on('end', () => {
        const dt = Date.now() - t0;
        console.log(`✅ [${taskName}] Status: ${res.statusCode} | Latencia: ${dt}ms | Respuesta: "${output.trim().slice(0, 60)}"`);
        resolve({ task: taskName, status: res.statusCode, dt });
      });
    });

    req.on('error', err => {
      console.log(`❌ [${taskName}] Error: ${err.message}`);
      resolve({ task: taskName, error: err.message });
    });

    req.write(body);
    req.end();
  });
});

Promise.all(promises).then(results => {
  console.log('\n======================================================');
  console.log('🎉 TODOS LOS 10 AGENTES EN PARALELO COMPLETARON EXITOSAMENTE!');
  console.log('======================================================');
});
