# ==============================================================================
#  INFINITE CLAUDE CODE - INTERACTIVE INSTALLER (PowerShell Edition)
# ==============================================================================

Clear-Host
$host.UI.RawUI.ForegroundColor = "White"

function Show-Banner {
    Write-Host @"
  ██████╗ ██╗      █████╗ ██╗   ██╗██████╗ ███████╗     ██████╗ ██████╗ ██████╗ ███████╗
 ██╔════╝ ██║     ██╔══██╗██║   ██║██╔══██╗██╔════╝    ██╔════╝██╔═══██╗██╔══██╗██╔════╝
 ██║      ██║     ███████║██║   ██║██║  ██║█████╗      ██║     ██║   ██║██║  ██║█████╗  
 ██║      ██║     ██╔══██║██║   ██║██║  ██║██╔══╝      ██║     ██║   ██║██║  ██║██╔══╝  
 ╚██████╗ ███████╗██║  ██║╚██████╔╝██████╔╝███████╗    ╚██████╗╚██████╔╝██████╔╝███████╗
  ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝     ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝
                                 [ INFINITE EDITION ]
"@ -ForegroundColor Cyan
    Write-Host " ==============================================================================" -ForegroundColor DarkGray
    Write-Host "  Proxy Inteligente Multi-Proveedor (49+ Modelos) para Claude Code CLI & Desktop" -ForegroundColor Yellow
    Write-Host "  100% Gratuito · Streaming SSE Real-Time · Auto-Failover · Creado por JuaneX" -ForegroundColor Cyan
    Write-Host " ==============================================================================`n" -ForegroundColor DarkGray
}

Show-Banner

# Menu de Modo de Instalación
Write-Host " Selecciona el modo de instalacion:" -ForegroundColor White
Write-Host "  [1] Instalacion Express (Recomendada) - Cero preguntas, usa los modelos gratuitos ya incluidos" -ForegroundColor Green
Write-Host "  [2] Instalacion Personalizada - Configura o agrega tus propias API Keys (Groq, Cerebras, etc.)" -ForegroundColor Yellow
Write-Host ""
$modo = Read-Host " Elige una opcion [1 o 2] (Default: 1)"

if ([string]::IsNullOrWhiteSpace($modo)) { $modo = "1" }

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if ([string]::IsNullOrEmpty($scriptDir)) { $scriptDir = (Get-Location).Path }
$envFile = Join-Path $scriptDir ".env"
$customEnv = @{}

if ($modo -eq "2") {
    Write-Host "`n ----------------------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "  CONFIGURACION DE PROVEEDORES (Presiona ENTER en cualquier opcion para OMITIR)" -ForegroundColor Cyan
    Write-Host " ----------------------------------------------------------------------------`n" -ForegroundColor DarkGray

    # OpenRouter
    Write-Host " [1/6] OpenRouter (Nemotron 120B, Gemma 4 31B, North Mini Code Free Tier)" -ForegroundColor White
    Write-Host "       (Obtenla gratis en: https://openrouter.ai/keys)" -ForegroundColor DarkGray
    $orKey = Read-Host "       Ingresa tu OPENROUTER_API_KEY [ENTER para omitir]"
    if (-not [string]::IsNullOrWhiteSpace($orKey)) { $customEnv["OPENROUTER_API_KEY"] = $orKey.Trim() }

    # NVIDIA NIM
    Write-Host "`n [2/6] NVIDIA NIM (Kimi K3 Reasoning & Nemotron 120B)" -ForegroundColor White
    Write-Host "       (Obtenla gratis en: https://build.nvidia.com/settings/api-keys)" -ForegroundColor DarkGray
    $nimKey = Read-Host "       Ingresa tu NVIDIA_API_KEY [ENTER para omitir]"
    if (-not [string]::IsNullOrWhiteSpace($nimKey)) { $customEnv["NVIDIA_API_KEY"] = $nimKey.Trim() }

    # OmniRouter
    Write-Host "`n [3/8] OmniRouter (Balanceador Multi-Modelo Gratuito)" -ForegroundColor White
    $omniKey = Read-Host "       Ingresa tu OMNIROUTER_API_KEY [ENTER para usar endpoint libre por defecto]"
    if (-not [string]::IsNullOrWhiteSpace($omniKey)) { $customEnv["OMNIROUTER_API_KEY"] = $omniKey.Trim() }

    # 9Router
    Write-Host "`n [4/8] 9Router (Enrutador de Alta Disponibilidad de Modelos Abiertos)" -ForegroundColor White
    $router9Key = Read-Host "       Ingresa tu ROUTER9_API_KEY [ENTER para usar endpoint libre por defecto]"
    if (-not [string]::IsNullOrWhiteSpace($router9Key)) { $customEnv["ROUTER9_API_KEY"] = $router9Key.Trim() }

    # Groq Cloud
    Write-Host "`n [5/8] Groq Cloud (LLaMA 3.3 70B & Qwen Coder a ultra-velocidad)" -ForegroundColor White
    Write-Host "       (Obtenla gratis en: https://console.groq.com/keys)" -ForegroundColor DarkGray
    $groqKey = Read-Host "       Ingresa tu GROQ_API_KEY [ENTER para omitir]"
    if (-not [string]::IsNullOrWhiteSpace($groqKey)) { $customEnv["GROQ_API_KEY"] = $groqKey.Trim() }

    # Cerebras Inference
    Write-Host "`n [6/8] Cerebras (1,000+ tokens/segundo)" -ForegroundColor White
    Write-Host "       (Obtenla gratis en: https://cloud.cerebras.ai)" -ForegroundColor DarkGray
    $cerebrasKey = Read-Host "       Ingresa tu CEREBRAS_API_KEY [ENTER para omitir]"
    if (-not [string]::IsNullOrWhiteSpace($cerebrasKey)) { $customEnv["CEREBRAS_API_KEY"] = $cerebrasKey.Trim() }

    # Together AI / DeepSeek
    Write-Host "`n [7/8] Together AI (DeepSeek V3, GLM 5.2)" -ForegroundColor White
    Write-Host "       (Obtenla en: https://api.together.ai/settings/api-keys)" -ForegroundColor DarkGray
    $togetherKey = Read-Host "       Ingresa tu TOGETHER_API_KEY [ENTER para omitir]"
    if (-not [string]::IsNullOrWhiteSpace($togetherKey)) { $customEnv["TOGETHER_API_KEY"] = $togetherKey.Trim() }

    # Ollama Local
    Write-Host "`n [8/8] Ollama Local (Respaldo 100% Offline si te quedas sin Internet)" -ForegroundColor White
    $ollamaHost = Read-Host "       Ingresa URL de Ollama [ENTER para 'http://localhost:11434']"
    if (-not [string]::IsNullOrWhiteSpace($ollamaHost)) { $customEnv["OLLAMA_HOST"] = $ollamaHost.Trim() }

    # Guardar .env si hubo custom keys
    if ($customEnv.Count -gt 0) {
        $envLines = @()
        foreach ($k in $customEnv.Keys) {
            $envLines += "$k=$($customEnv[$k])"
        }
        [System.IO.File]::WriteAllLines($envFile, $envLines)
        Write-Host "`n [OK] Configuracion guardada exitosamente en .env" -ForegroundColor Green
    }
}

Write-Host "`n ----------------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  APLICANDO CONFIGURACION DEL SISTEMA" -ForegroundColor Cyan
Write-Host " ----------------------------------------------------------------------------" -ForegroundColor DarkGray

# 1. Configurar Variables de Entorno Globales para Claude Code
Write-Host "`n [1/4] Configurando variables de entorno globales..." -ForegroundColor Yellow
[System.Environment]::SetEnvironmentVariable('ANTHROPIC_BASE_URL', 'http://127.0.0.1:20129', [System.EnvironmentVariableTarget]::User)
[System.Environment]::SetEnvironmentVariable('ANTHROPIC_AUTH_TOKEN', 'infinite', [System.EnvironmentVariableTarget]::User)
$env:ANTHROPIC_BASE_URL = 'http://127.0.0.1:20129'
$env:ANTHROPIC_AUTH_TOKEN = 'infinite'
Write-Host "       [OK] ANTHROPIC_BASE_URL  -> http://127.0.0.1:20129" -ForegroundColor Green
Write-Host "       [OK] ANTHROPIC_AUTH_TOKEN -> infinite" -ForegroundColor Green

# 2. Configurar Auto-Arranque Silencioso en Windows (Startup)
Write-Host "`n [2/4] Configurando inicio automatico e invisible en segundo plano..." -ForegroundColor Yellow
$startupFolder = [System.IO.Path]::Combine($env:APPDATA, 'Microsoft\Windows\Start Menu\Programs\Startup')
$vbsPath = [System.IO.Path]::Combine($scriptDir, 'launch_hidden.vbs')
$routerScript = [System.IO.Path]::Combine($scriptDir, 'src\router.js')

$vbsContent = "Set WshShell = CreateObject(`"WScript.Shell`")`r`nWshShell.CurrentDirectory = `"`"$scriptDir`"`"`r`nWshShell.Run `"node `"`"$routerScript`"`"`", 0, False`r`n"
[System.IO.File]::WriteAllText($vbsPath, $vbsContent)
Copy-Item $vbsPath (Join-Path $startupFolder 'infinite_claude_router.vbs') -Force
Write-Host "       [OK] Acceso de inicio creado en carpeta Startup de Windows" -ForegroundColor Green

# 3. Matar instancias previas si las hay y arrancar el router
Write-Host "`n [3/4] Iniciando demonio del router en segundo plano..." -ForegroundColor Yellow
try {
    $existing = Get-CimInstance Win32_Process -Filter "CommandLine like '%router.js%'" -ErrorAction SilentlyContinue
    if ($existing) {
        Stop-Process -Id $existing.ProcessId -Force -ErrorAction SilentlyContinue
    }
} catch {}

$cliScript = Join-Path $scriptDir "bin\infinite-claude.js"
node $cliScript start

# 4. Prueba de Estado y Diagnostico en Vivo
Write-Host "`n [4/4] Verificando conexion con el pool de modelos..." -ForegroundColor Yellow
try {
    $res = Invoke-RestMethod -Uri "http://127.0.0.1:20129" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "       [OK] Estado: $($res.status.ToUpper())" -ForegroundColor Green
    Write-Host "       [OK] Streaming SSE: $($res.streaming)" -ForegroundColor Green
    Write-Host "       [OK] Proveedores Activos: $($res.providers_count)" -ForegroundColor Green
    Write-Host "       [OK] Pool listo: $($res.pool[0])" -ForegroundColor Gray
} catch {
    Write-Host "       [!] El servicio se inicio pero el socket aun esta levantando." -ForegroundColor Yellow
}

Write-Host @"

 ==============================================================================
  🎉 ¡INSTALACION COMPLETADA CON EXITO!
 ==============================================================================

  Ya puedes abrir tu terminal o IDE y ejecutar Claude Code libremente:

    ❯ claude

  • Sin cargos de API ni limites de tokens.
  • Streaming en tiempo real con latencia cero.
  • Subagentes concurrentes infinitos.

 ==============================================================================
"@ -ForegroundColor Cyan
