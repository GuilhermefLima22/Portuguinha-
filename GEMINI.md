# Diretrizes do Projeto - Portuguinha

## 📌 Regra Mandatória de Sincronização com o GitHub

Sempre que qualquer alteração for realizada no projeto (mesmo alterações pequenas ou pontuais):
1. **Exportar o Fluxo Atualizado do n8n:**
   - Atualizar `fluxos/Agente de IA Simples - Evolution API.json`
   - Atualizar `deploy-nuvem/workflow.json`
2. **Atualizar Scripts Auxiliares:**
   - Se houver alterações em scripts do container (ex: `server.js`), sincronizar em `utilitarios/server.js`.
3. **Commit & Push Imediato:**
   - Executar `git add .`, criar um commit semântico claro e fazer `git push origin main`.
   - Garantir que o repositório remoto esteja sempre 100% atualizado com o ambiente de produção.
