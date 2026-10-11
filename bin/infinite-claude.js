#!/usr/bin/env node

/**
 * Infinite Claude Code CLI
 */

const { execSync, spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const cmd = process.argv[2] || 'status';
const PORT = 20129;

function checkStatus() {
  const req = http.request(`http://127.0.0.1:${PORT}`, { timeout: 3000 }, (res) => {
    let b = '';
    res.on('data', c => b += c);
    res.on('end', () => {
      try {
        const j = JSON.parse(b);
        console.log('\n🟢 Infinite Claude Code is ACTIVE and HEALTHY!');
        console.log(`📡 URL: http://127.0.0.1:${PORT}`);
        console.log(`⚡ Streaming: ${j.streaming ? 'ENABLED (SSE Real-time)' : 'DISABLED'}`);
        console.log(`🤖 Active Providers in Pool (${j.providers_count}):`);
        (j.pool || []).forEach((p, i) => console.log(`   [${i + 1}] ${p}`));
        console.log('');
      } catch (e) {
        console.log('🟡 Port 20129 responded with non-JSON response.');
      }
    });
  });

  req.on('error', () => {
    console.log('\n🔴 Infinite Claude Code is NOT running on port ' + PORT);
    console.log('👉 Run `infinite-claude start` to launch the router.\n');
  });

  req.end();
}

function startDaemon() {
  const routerPath = path.join(__dirname, '..', 'src', 'router.js');
  const projectDir = path.join(__dirname, '..');
  const logFile = path.join(__dirname, '..', 'router.log');
  const out = fs.openSync(logFile, 'a');

  console.log('🚀 Starting Infinite Claude Code in the background...');
  const child = spawn(process.execPath, [routerPath], {
    cwd: projectDir,
    detached: true,
    stdio: ['ignore', out, out],
    windowsHide: true
  });
  child.unref();

  setTimeout(checkStatus, 1500);
}

function stopDaemon() {
  const isWin = process.platform === 'win32';
  console.log('🛑 Stopping Infinite Claude Code daemon...');
  try {
    if (isWin) {
      execSync(`powershell -Command "Get-CimInstance Win32_Process -Filter \\"CommandLine like '%router.js%'\\" | Stop-Process -Force"`, { stdio: 'ignore' });
    } else {
      execSync(`pkill -f "router.js"`, { stdio: 'ignore' });
    }
    console.log('✅ Daemon stopped successfully.\n');
  } catch (e) {
    console.log('ℹ️ No active process was found or could be stopped.\n');
  }
}

function setupEnv() {
  const isWin = process.platform === 'win32';
  console.log('\n⚙️ Configuring Claude Code environment variables globally...');
  if (isWin) {
    execSync(`setx ANTHROPIC_BASE_URL "http://127.0.0.1:${PORT}"`, { stdio: 'inherit' });
    execSync(`setx ANTHROPIC_AUTH_TOKEN "infinite"`, { stdio: 'inherit' });
  } else {
    console.log('Add the following to your ~/.bashrc or ~/.zshrc:');
    console.log(`export ANTHROPIC_BASE_URL="http://127.0.0.1:${PORT}"`);
    console.log(`export ANTHROPIC_AUTH_TOKEN="infinite"`);
  }
  console.log('✅ Environment configured! You can now run `claude` freely without API usage limits!\n');
}

switch (cmd) {
  case 'start':
    startDaemon();
    break;
  case 'stop':
    stopDaemon();
    break;
  case 'status':
    checkStatus();
    break;
  case 'setup':
    setupEnv();
    break;
  default:
    console.log('\nUsage: infinite-claude [start | stop | status | setup]\n');
}
