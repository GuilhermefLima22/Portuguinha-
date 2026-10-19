@echo off
title Desligar Portuguinha - Liberar Memoria do Notebook
echo ==========================================================
echo  DESLIGANDO O PORTUGUINHA E LIBERANDO MEMORIA DO PC...
echo ==========================================================
echo.

echo [1/3] Parando os containers...
cd /d "C:\Users\guilh\Downloads\N8N Wahal Local"
docker compose stop >nul 2>&1

echo [2/3] Fechando o Docker Desktop por completo...
taskkill /F /IM "Docker Desktop.exe" >nul 2>&1
taskkill /F /IM "com.docker.backend.exe" >nul 2>&1
taskkill /F /IM "com.docker.build.exe" >nul 2>&1

echo [3/3] Desligando o subsistema WSL para liberar 100%% da RAM...
wsl --shutdown >nul 2>&1

echo.
echo ==========================================================
echo  [SUCESSO] TUDO DESLIGADO! 0%% DE USO EM SEGUNDO PLANO!
echo  Seu notebook esta 100%% livre e leve para usar!
echo ==========================================================
pause
