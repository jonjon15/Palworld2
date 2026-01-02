@echo off
REM Script para Windows - Extrair posições dos jogadores do Palworld
REM Coloque este arquivo em: D:\SteamLibrary\steamapps\common\PalServer\

echo ========================================
echo Palworld Player Position Extractor
echo ========================================
echo.

REM Configurações
set PALSERVER_PATH=D:\SteamLibrary\steamapps\common\PalServer
set OUTPUT_FILE=%PALSERVER_PATH%\players.json

REM Ir para o diretório do script
cd /d %~dp0

REM Verificar se Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Node.js nao encontrado!
    echo Por favor, instale Node.js: https://nodejs.org/
    pause
    exit /b 1
)

REM Executar o extrator
echo [INFO] Executando extrator...
node extract-player-positions.js

REM Verificar se o arquivo foi criado
if exist "%OUTPUT_FILE%" (
    echo.
    echo [OK] Arquivo criado: %OUTPUT_FILE%
    echo.
    type "%OUTPUT_FILE%"
) else (
    echo [ERRO] Falha ao criar arquivo de saida
)

echo.
echo ========================================
pause
