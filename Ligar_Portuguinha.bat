@echo off
title Ligar Portuguinha - Lava Rapido do Portuga
echo ==========================================================
echo  INICIANDO O PORTUGUINHA NO SEU NOTEBOOK...
echo ==========================================================
echo.

docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [1/2] Abrindo o motor do Docker Desktop...
    start "" "C:\Users\guilh\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe"
    echo Aguardando o Docker ficar pronto...
)

:WAIT_DOCKER
docker info >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 3 /nobreak >nul
    goto WAIT_DOCKER
)

echo [2/2] Subindo os containers do Portuguinha...
cd /d "C:\Users\guilh\Downloads\N8N Wahal Local"
docker compose up -d

echo.
echo ==========================================================
echo  [SUCESSO] PORTUGUINHA LIGADO E TRABALHANDO NOS TRINQUES!
echo  Voce recebera uma mensagem no seu WhatsApp assim que o
echo  sistema terminar de carregar (cerca de 10 segundos)!
echo ==========================================================
echo  - Painel n8n:       http://localhost:5678
echo  - Painel Evolution: http://localhost:8080/manager
echo  - Para desligar tudo e liberar 100%% da memoria do PC,
echo    basta clicar em "Desligar_Portuguinha.bat"!
echo ==========================================================
pause
