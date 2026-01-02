@echo off
title Palworld Position Tracker
color 0A

echo.
echo ========================================
echo   Palworld Position Tracker
echo   Iniciando Sistema...
echo ========================================
echo.

REM Configurações
set SERVER_PATH=%~dp0
set DATA_PATH=C:\palworld-data
set PYTHON_SCRIPT=%SERVER_PATH%http_server.py
set PS_SCRIPT=%SERVER_PATH%Extract-PlayerPositions.ps1

REM Verificar se pasta de dados existe
if not exist "%DATA_PATH%" (
    echo [INFO] Criando pasta de dados: %DATA_PATH%
    mkdir "%DATA_PATH%"
)

REM Matar processos antigos
echo [INFO] Parando processos anteriores...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *Palworld*" >nul 2>&1
powershell -Command "Get-Process | Where-Object {$_.MainWindowTitle -like '*Position*'} | Stop-Process -Force" >nul 2>&1
timeout /t 2 /nobreak >nul

REM Verificar Python
echo [INFO] Verificando Python...
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Python nao encontrado!
    echo.
    echo Por favor, instale Python 3.10+ de: https://www.python.org/downloads/
    echo Nao esqueca de marcar "Add to PATH" durante instalacao
    echo.
    pause
    exit /b 1
)

REM Verificar palworld-save-tools
echo [INFO] Verificando palworld-save-tools...
pip show palworld-save-tools >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Instalando palworld-save-tools...
    pip install palworld-save-tools
    if %ERRORLEVEL% NEQ 0 (
        echo [ERRO] Falha ao instalar palworld-save-tools
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo   Iniciando Componentes
echo ========================================
echo.

REM Testar extração uma vez
echo [INFO] Testando extracao de dados...
powershell -ExecutionPolicy Bypass -Command "& '%PS_SCRIPT%' -OutputFile '%DATA_PATH%\players.json'" >nul 2>&1
if exist "%DATA_PATH%\players.json" (
    echo [OK] Arquivo de dados criado com sucesso
) else (
    echo [AVISO] Nenhum jogador encontrado ainda
)

echo.

REM Iniciar extrator em loop
echo [INFO] Iniciando extrator automatico (10s)...
start "Palworld Extractor" /MIN powershell -WindowStyle Hidden -ExecutionPolicy Bypass -Command "$host.ui.RawUI.WindowTitle='Palworld Position Extractor'; while($true) { try { & '%PS_SCRIPT%' -OutputFile '%DATA_PATH%\players.json' -ErrorAction Stop } catch { Write-Host 'Erro na extracao' }; Start-Sleep -Seconds 10 }"

REM Aguardar
timeout /t 2 /nobreak >nul

REM Iniciar servidor HTTP
echo [INFO] Iniciando servidor HTTP (porta 8888)...
start "Palworld HTTP Server" python "%PYTHON_SCRIPT%"

REM Aguardar servidor iniciar
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   SISTEMA ATIVO!
echo ========================================
echo.
echo   [OK] Extrator: Rodando (atualiza a cada 10s)
echo   [OK] HTTP Server: http://192.168.15.8:8888
echo.
echo   Endpoints disponiveis:
echo     - http://192.168.15.8:8888/api/players
echo     - http://192.168.15.8:8888/health
echo.
echo   Arquivo de dados:
echo     - %DATA_PATH%\players.json
echo.
echo ========================================
echo.
echo   Pressione qualquer tecla para PARAR o sistema...
pause >nul

echo.
echo [INFO] Parando servicos...

REM Parar tudo
taskkill /F /IM python.exe /FI "WINDOWTITLE eq Palworld*" >nul 2>&1
powershell -Command "Get-Process | Where-Object {$_.MainWindowTitle -like '*Position*'} | Stop-Process -Force" >nul 2>&1

echo [OK] Sistema finalizado!
echo.
timeout /t 2
