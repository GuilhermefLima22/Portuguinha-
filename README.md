# 🚗🇵🇹 Lava Rápido do Portuga - Assistente Virtual "Portuguinha"

Assistente virtual inteligente para o **Lava Rápido do Portuga**, integrado via **Evolution API (WhatsApp)**, **n8n** e **Google Gemini IA**.

---

## 📁 Estrutura de Pastas do Projeto

```
Portuguinha/
├── 🟢 Ligar_Portuguinha.bat        # Inicia o Docker e sobe o bot no notebook
├── 🔴 Desligar_Portuguinha.bat     # Desliga tudo e libera 100% da RAM e CPU
├── 📖 README.md                   # Manual de instruções e documentação rápida
├── 📂 fluxos/                     # Arquivos do fluxo do n8n
│   ├── Agente de IA Simples - Evolution API.json   # Fluxo ativo completo
│   └── backups/                   # Cópias de segurança antigas
├── 📂 deploy-nuvem/               # Pacote pronto para servidor em nuvem (Oracle, GCP, VPS)
│   ├── docker-compose.yml
│   ├── instalar.sh
│   ├── credentials.json
│   └── workflow.json
└── 📂 utilitarios/                # Scripts auxiliares e ferramentas de checagem
    └── check_cred.js
```

---

## 🚀 Como Ligar e Desligar no Notebook

1. **Para Ligar:** Dê dois cliques em `Ligar_Portuguinha.bat`.
   - O Docker Desktop será aberto caso esteja fechado.
   - Os containers (`n8n`, `evolution_api`, `postgres`, `redis`) sobem automaticamente.
   - Assim que o sistema estiver pronto, o Portuguinha manda uma **mensagem de confirmação no seu WhatsApp** (`11989568771`).
2. **Para Desligar:** Dê dois cliques em `Desligar_Portuguinha.bat`.
   - Para os containers, fecha o Docker por completo e desliga o subsistema WSL.
   - Libera **100% da memória RAM e do processador** para você usar o notebook livremente.

---

## 📱 Comandos Exclusivos do WhatsApp (Gerência)

### 1. Aviso de Carro Pronto (`ok`)
- **Como usar:** No WhatsApp do bot, quando um carro ficar pronto, **deslize o dedo para o lado e responda (cite)** a mensagem daquele pedido dizendo **`ok`** (ou `Ok` / `OK`).
- **O que o Portuguinha faz:**
  - Identifica a placa e o cliente com 100% de precisão.
  - Atualiza o status do carro na planilha para **`Pronto`**.
  - Envia mensagem no privado do cliente avisando que a caranga já está liberada para retirada.
  - Confirma de volta para a gerência.

### 2. Controle Geral do Bot (Exclusivo do número do Guilherme: `11989568771`)
- **`desativar`** (ou `pausar` / `desligar`): O bot entra em modo silencioso e para de responder qualquer mensagem até você reativar.
- **`ativar`** (ou `ligar`): O bot volta a atender clientes e registrar carros do pátio na hora.
- **`status`**: Informa se o bot está atualmente **🟢 ATIVADO** ou **🔴 DESATIVADO**.

---

## 🧠 Tabela Mental de Preços no Pátio (Foto do Veículo)

Ao enviar uma foto no WhatsApp da gerência:
- **Prioridade Máxima:** O que você escrever na legenda manda em tudo (ex: se escrever `Ducha 60` em uma van, ele respeita que é `Ducha` no valor de `R$ 60`).
- **Se digitar apenas o número do valor:** O Portuguinha deduz o serviço automaticamente pelo porte do veículo na foto:

| Porte na Foto 📸 | Valor Digitado | Serviço Registrado |
| :--- | :--- | :--- |
| **Hatch ou Sedan** | `30` | Simples / Ducha |
| **Hatch ou Sedan** | `60` | Completa |
| **Hatch ou Sedan** | `90` | Lavagem VIP |
| **Hatch ou Sedan** | `120+` | Lavagem Personalizada (Por baixo e Motor) |
| **SUV ou Caminhonete/Picape** | `40` | Simples / Ducha |
| **SUV ou Caminhonete/Picape** | `90` | Completa |
| **SUV ou Caminhonete/Picape** | `100` a `120` | Lavagem VIP |
| **SUV ou Caminhonete/Picape** | `120+` (ou `120 motor`) | Lavagem Personalizada (Por baixo e Motor) |
| **Van / Utilitário** *(Sprinter, Ducato, HR, etc.)* | Conforme legenda | Reconhecido como `Van` com valores personalizados |
| **Moto** 🏍️ | `30` ou em branco | Completa (Moto) — R$ 30 fixo |

---

## 🛡️ Proteções e Blindagens Ativas

1. **Modo Recepcionista Desativado para os Chefes:** Mensagens de texto comuns ou áudios enviados pelos gerentes nunca são respondidas como se fossem clientes.
2. **Anti-Mensagens Antigas:** Mensagens com mais de 5 minutos (histórico sincronizado do WhatsApp) são descartadas imediatamente para não gerar registros indevidos.
3. **Anti-Duplicidade de Placa:** Se a mesma placa for enviada duas vezes no mesmo dia, o bot bloqueia a repetição e avisa na hora no WhatsApp, mantendo a planilha sempre limpa.
4. **Visão com Retry Automático:** Usa o modelo ultrarrápido `gemini-3.5-flash-lite` com até 4 retentativas automáticas contra oscilações de conexão.
5. **Roteamento Exclusivo da Oficina Jcar (Jeferson):** Carros identificados com "Jeferson" ou "Jcar" são gravados automaticamente na aba dedicada `Jcar` da planilha.
6. **Anti-Spam de Inicialização (Trava Diária):** O aviso de "sistema iniciado" só é enviado no primeiro boot do dia. Qualquer reinicialização ou manutenção subsequente no mesmo dia é silenciada automaticamente para não poluir o seu WhatsApp!

---

## 🏢 Aba Exclusiva da Oficina Jcar (Jeferson)

- **Como funciona:** Sempre que a legenda da foto contiver o nome **`Jeferson`** (ou `Jefferson`, `Jéferson`, `Jcar`, `J car`):
  - O Portuguinha direciona o lançamento diretamente para a aba **`Jcar`** da planilha `Planilha_LavaRápido`!
  - O cliente fica registrado como **`Jeferson (Jcar)`**.
  - O WhatsApp confirma: `🚗🇵🇹 ENTRADA NO PÁTIO REGISTRADA — OFICINA JCAR! ✅ Já lancei na planilha exclusiva da JCAR!`
  - Os carros normais continuam indo para a aba principal `Página1`.

- **Tabela Fixa da Jcar (Preços Padronizados):**
  - **Hatch ou Sedan:** **R$ 50**
  - **SUV ou Caminhonete / Picape:** **R$ 65**
  - *(Basta mandar a foto com a legenda "Jeferson" ou "Jcar" sem precisar digitar valor nenhum — ele já aplica os R$ 50 ou R$ 65 automaticamente pelo porte do veículo!)*
  - ⚠️ **Prioridade Máxima à Legenda:** Se for um caso especial e você/Portuga digitarem um valor explícito na legenda (ex: `Jeferson 80`, `Jcar motor 120`), o valor digitado na legenda prevalece sempre!

