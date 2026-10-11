#!/bin/bash
set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
GRAY='\033[0;90m'
NC='\033[0m'

clear
echo -e "${CYAN}"
cat << "EOF"
  ██████╗ ██╗      █████╗ ██╗   ██╗██████╗ ███████╗     ██████╗ ██████╗ ██████╗ ███████╗
 ██╔════╝ ██║     ██╔══██╗██║   ██║██╔══██╗██╔════╝    ██╔════╝██╔═══██╗██╔══██╗██╔════╝
 ██║      ██║     ███████║██║   ██║██║  ██║█████╗      ██║     ██║   ██║██║  ██║█████╗  
 ██║      ██║     ██╔══██║██║   ██║██║  ██║██╔══╝      ██║     ██║   ██║██║  ██║██╔══╝  
 ╚██████╗ ███████╗██║  ██║╚██████╔╝██████╔╝███████╗    ╚██████╗╚██████╔╝██████╔╝███████╗
  ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝     ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝
                                 [ INFINITE EDITION ]
EOF
echo -e "${GRAY}==============================================================================${NC}"
echo -e "${YELLOW} Proxy Inteligente Multi-Proveedor (49+ Modelos) para Claude Code CLI & Desktop${NC}"
echo -e "${CYAN} 100% Gratuito · Streaming SSE Real-Time · Auto-Failover · Creado por JuaneX${NC}"
echo -e "${GRAY}==============================================================================\n${NC}"

echo -e "Selecciona el modo de instalación:"
echo -e " ${GREEN}[1] Instalación Express (Recomendada)${NC} - Cero preguntas, usa modelos gratuitos incluidos"
echo -e " ${YELLOW}[2] Instalación Personalizada${NC} - Configura o agrega tus propias API Keys (Groq, Cerebras, etc.)\n"

read -p "Elige una opción [1 o 2] (Default: 1): " MODO
MODO=${MODO:-1}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

if [ "$MODO" = "2" ]; then
  echo -e "\n${GRAY}----------------------------------------------------------------------------${NC}"
  echo -e "${CYAN} CONFIGURACIÓN DE PROVEEDORES (Presiona ENTER en cualquier opción para OMITIR)${NC}"
  echo -e "${GRAY}----------------------------------------------------------------------------\n${NC}"

  read -p "OpenRouter Key [ENTER para omitir]: " OR_KEY
  [ -n "$OR_KEY" ] && echo "OPENROUTER_API_KEY=$OR_KEY" >> "$ENV_FILE"

  read -p "NVIDIA NIM Key [ENTER para omitir]: " NIM_KEY
  [ -n "$NIM_KEY" ] && echo "NVIDIA_API_KEY=$NIM_KEY" >> "$ENV_FILE"

  read -p "OmniRouter Key [ENTER para usar endpoint libre por defecto]: " OMNI_KEY
  [ -n "$OMNI_KEY" ] && echo "OMNIROUTER_API_KEY=$OMNI_KEY" >> "$ENV_FILE"

  read -p "9Router Key [ENTER para usar endpoint libre por defecto]: " R9_KEY
  [ -n "$R9_KEY" ] && echo "ROUTER9_API_KEY=$R9_KEY" >> "$ENV_FILE"

  read -p "Groq Key [ENTER para omitir]: " GROQ_KEY
  [ -n "$GROQ_KEY" ] && echo "GROQ_API_KEY=$GROQ_KEY" >> "$ENV_FILE"

  read -p "Together Key [ENTER para omitir]: " TOGETHER_KEY
  [ -n "$TOGETHER_KEY" ] && echo "TOGETHER_API_KEY=$TOGETHER_KEY" >> "$ENV_FILE"
fi

echo -e "\n${GRAY}----------------------------------------------------------------------------${NC}"
echo -e "${CYAN} APLICANDO CONFIGURACIÓN${NC}"
echo -e "${GRAY}----------------------------------------------------------------------------\n${NC}"

# Detectar shell profile
PROFILE_FILE="$HOME/.bashrc"
[ -f "$HOME/.zshrc" ] && PROFILE_FILE="$HOME/.zshrc"

echo -e "${YELLOW}[1/3] Configurando variables en $PROFILE_FILE...${NC}"
grep -q 'ANTHROPIC_BASE_URL' "$PROFILE_FILE" || echo 'export ANTHROPIC_BASE_URL="http://127.0.0.1:20129"' >> "$PROFILE_FILE"
grep -q 'ANTHROPIC_AUTH_TOKEN' "$PROFILE_FILE" || echo 'export ANTHROPIC_AUTH_TOKEN="infinite"' >> "$PROFILE_FILE"
echo -e "${GREEN}      [✓] ANTHROPIC_BASE_URL  -> http://127.0.0.1:20129${NC}"
echo -e "${GREEN}      [✓] ANTHROPIC_AUTH_TOKEN -> infinite${NC}"

# Matar instancias previas y levantar en segundo plano
echo -e "\n${YELLOW}[2/3] Levantando daemon en segundo plano...${NC}"
pkill -f "router.js" 2>/dev/null || true
nohup node "$SCRIPT_DIR/src/router.js" > "$SCRIPT_DIR/router.log" 2>&1 &
sleep 2

# Verificación
echo -e "\n${YELLOW}[3/3] Verificando servicio...${NC}"
if curl -s http://127.0.0.1:20129 > /dev/null; then
  echo -e "${GREEN}      [✓] Router activo y saludable en puerto 20129${NC}"
else
  echo -e "${YELLOW}      [!] El daemon está iniciando en segundo plano.${NC}"
fi

echo -e "\n${CYAN}==============================================================================${NC}"
echo -e "${GREEN} 🎉 ¡INSTALACIÓN COMPLETADA!${NC}"
echo -e " Ejecuta: ${YELLOW}source $PROFILE_FILE${NC} y luego ${CYAN}claude${NC} para empezar a programar gratis!"
echo -e "${CYAN}==============================================================================${NC}\n"
