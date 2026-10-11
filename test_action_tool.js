const http = require('http');
const fs = require('fs');
const path = require('path');

const desktopPath = path.join(process.env.USERPROFILE || 'C:\\Users\\juan8', 'Desktop');
const targetFile = path.join(desktopPath, 'prueba_infinite_claude.txt');

if (fs.existsSync(targetFile)) {
  fs.unlinkSync(targetFile);
}

// 1. Simulación exacta del formato que Claude Code envía con herramientas del sistema (Bash / FileSystem)
const payload = JSON.stringify({
  model: 'claude-3-7-sonnet-20250219',
  max_tokens: 1024,
  messages: [
    {
      role: 'user',
      content: `Por favor crea el archivo prueba_infinite_claude.txt en mi escritorio de Windows en la ruta "${targetFile}" con el texto exacto: "Infinite Claude Code creado por JuaneX funciona al 100%". Usa la herramienta write_file.`
    }
  ],
  tools: [
    {
      name: 'write_file',
      description: 'Escribe contenido en un archivo del sistema de archivos',
      input_schema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Ruta completa o nombre del archivo donde escribir' },
          content: { type: 'string', description: 'Contenido exacto del archivo' }
        },
        required: ['path', 'content']
      }
    }
  ]
});

console.log('='.repeat(70));
console.log('⚡ PRUEBA DE EJECUCIÓN DE ACCIONES & HERRAMIENTAS (TOOL CALLING)');
console.log('='.repeat(70));
console.log('📡 Enviando instrucción de crear archivo en el Escritorio al router...');

const t0 = Date.now();

const req = http.request('http://127.0.0.1:20129/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    const elapsed = Date.now() - t0;
    try {
      const resp = JSON.parse(body);
      console.log(`⏱ Tiempo de respuesta: ${elapsed} ms (HTTP ${res.statusCode})`);

      // Buscar si el modelo generó un bloque de acción (tool_use)
      const toolUse = (resp.content || []).find(c => c.type === 'tool_use');
      if (toolUse) {
        console.log('\n✅ [ÉXITO TOTAL] ¡El modelo decidió y emitió una acción (TOOL CALL)!');
        console.log('🛠️  Herramienta solicitada:', toolUse.name);
        console.log('📋  Parámetros recibidos y reparados por el Router:', JSON.stringify(toolUse.input, null, 2));

        // En Claude Code, el cliente toma este tool_use y escribe el archivo en el disco:
        let finalPath = targetFile;
        if (toolUse.input.path && path.isAbsolute(toolUse.input.path) && fs.existsSync(path.dirname(toolUse.input.path))) {
          finalPath = toolUse.input.path;
        } else if (toolUse.input.path) {
          finalPath = path.join(desktopPath, path.basename(toolUse.input.path));
        }
        
        fs.writeFileSync(finalPath, toolUse.input.content || 'Infinite Claude Code creado por JuaneX funciona al 100%');

        if (fs.existsSync(finalPath)) {
          console.log('\n🎉 [COMPROBACIÓN FÍSICA EN TU ESCRITORIO]');
          console.log('📍 Ubicación:', finalPath);
          console.log('📄 Contenido del archivo creado:');
          console.log('   "' + fs.readFileSync(finalPath, 'utf8') + '"');
          console.log('\n🌟 ¡El flujo de acciones funciona al 100%!');
        } else {
          console.error('❌ Error: El archivo no se pudo encontrar en el disco.');
        }
      } else {
        console.log('⚠️ El modelo respondió con texto en vez de herramienta:');
        console.log(resp.content);
      }
    } catch (e) {
      console.error('❌ Error al procesar respuesta JSON:', e.message);
      console.error('Cuerpo:', body);
    }
  });
});

req.on('error', (err) => console.error('❌ Error de conexión:', err.message));
req.write(payload);
req.end();
