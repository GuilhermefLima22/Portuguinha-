#!/usr/bin/env bash
set -e

echo "=========================================================="
echo " 🚗🇵🇹 INSTALADOR 24H - LAVA RÁPIDO DO PORTUGA (ORACLE CLOUD)"
echo "=========================================================="

# 0. Garantir privilégios de root
if [ "$EUID" -ne 0 ]; then
  echo "🔄 Reexecutando com sudo..."
  exec sudo bash "$0" "$@"
fi

# 1. Criar 4GB de memória Swap automaticamente (evita travamentos por falta de RAM)
if [ ! -f /swapfile ]; then
  echo "🧠 Configurando 4GB de memória Swap de segurança..."
  fallocate -l 4G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=4096
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# 2. Liberar portas 5678 (n8n) e 8080 (Evolution API) no Firewall interno da Oracle Cloud (iptables / ufw)
echo "🔓 Liberando portas 5678 e 8080 no firewall interno da máquina..."
iptables -I INPUT 1 -p tcp --dport 5678 -j ACCEPT || true
iptables -I INPUT 1 -p tcp --dport 8080 -j ACCEPT || true
if command -v netfilter-persistent &> /dev/null; then
  netfilter-persistent save || true
fi
if command -v ufw &> /dev/null; then
  ufw allow 5678/tcp >/dev/null 2>&1 || true
  ufw allow 8080/tcp >/dev/null 2>&1 || true
fi

# 3. Instalar Docker se não estiver instalado
if ! command -v docker &> /dev/null; then
  echo "📦 Instalando Docker e Docker Compose..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
fi

# 4. Detectar IP Público da VPS
PUBLIC_IP=$(curl -s https://api.ipify.org || curl -s https://ifconfig.me || echo "localhost")
echo "PUBLIC_IP=${PUBLIC_IP}" > .env
echo "🌐 IP Público detectado: ${PUBLIC_IP}"

# 5. Subir os containers em segundo plano (24/7)
echo "🚀 Subindo containers (Postgres, Redis, Evolution API e n8n)..."
docker compose up -d

echo "⏳ Aguardando inicialização do banco e serviços (20s)..."
sleep 20

# 6. Instalar pacote da Evolution API dentro do n8n
echo "🔌 Instalando nó da Evolution API no n8n..."
docker exec -u root n8n sh -c "mkdir -p /home/node/.n8n/nodes && cd /home/node/.n8n/nodes && npm init -y >/dev/null 2>&1 && npm install n8n-nodes-evolution-api@1.0.4 >/dev/null 2>&1 && chown -R node:node /home/node/.n8n"

# 7. Importar credenciais e fluxo do Portuguinha
echo "🔑 Importando credenciais e ativando o fluxo do Portuguinha..."
docker cp credentials.json n8n:/tmp/credentials.json
docker cp workflow.json n8n:/tmp/workflow.json
docker exec n8n n8n import:credentials --input=/tmp/credentials.json
docker exec n8n n8n import:workflow --input=/tmp/workflow.json
docker exec n8n n8n publish:workflow --id=LmrRkDdn7hcNzNFf
docker exec n8n rm -f /tmp/credentials.json /tmp/workflow.json

echo "🔄 Reiniciando n8n para registrar o Webhook de produção..."
docker restart n8n
sleep 12

# 8. Criar instância 'lavarapido-bot' e configurar Webhook automaticamente na Evolution API
echo "📲 Configurando instância 'lavarapido-bot' e Webhook na Evolution API..."
curl -s -X POST "http://localhost:8080/instance/create" \
  -H "apikey: 4296ef44b13f3a5f4917ff51ecc70ebd" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "lavarapido-bot",
    "token": "DDABDDE1D2A8-4DC6-9136-48371951B4F4",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS"
  }' >/dev/null 2>&1 || true

curl -s -X POST "http://localhost:8080/webhook/set/lavarapido-bot" \
  -H "apikey: 4296ef44b13f3a5f4917ff51ecc70ebd" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook": {
      "enabled": true,
      "url": "http://n8n:5678/webhook/agente01",
      "webhookByEvents": false,
      "webhookBase64": true,
      "events": ["MESSAGES_UPSERT"]
    }
  }' >/dev/null 2>&1 || true

echo ""
echo "=========================================================="
echo " ✅ TUDO PRONTO E RODANDO 24H NA ORACLE CLOUD!"
echo "=========================================================="
echo " 📌 Painel n8n:           http://${PUBLIC_IP}:5678"
echo " 📌 Painel Evolution API: http://${PUBLIC_IP}:8080/manager"
echo "    - Server URL:         http://${PUBLIC_IP}:8080"
echo "    - Global API Key:     4296ef44b13f3a5f4917ff51ecc70ebd"
echo "=========================================================="
echo " 👉 Agora basta abrir o Manager da Evolution API, clicar em"
echo "    'lavarapido-bot' e escanear o QR Code do WhatsApp!"
echo "=========================================================="
