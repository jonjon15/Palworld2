@echo off
REM Script para verificar se o servidor Palworld tem saves

echo ========================================
echo  Verificador de Saves do Palworld
echo ========================================
echo.

set "SERVER_PATH=D:\SteamLibrary\steamapps\common\PalServer"
set "SAVE_PATH=%SERVER_PATH%\Pal\Saved\SaveGames\0"

REM Verificar se o caminho existe
if not exist "%SERVER_PATH%" (
    echo [ERRO] Servidor Palworld nao encontrado em:
    echo        %SERVER_PATH%
    echo.
    echo Por favor, ajuste o caminho no script.
    pause
    exit /b 1
)

echo [OK] Servidor encontrado: %SERVER_PATH%
echo.

REM Verificar pasta de saves
if not exist "%SAVE_PATH%" (
    echo [ERRO] Pasta de saves nao encontrada em:
    echo        %SAVE_PATH%
    echo.
    echo O servidor pode nunca ter sido iniciado.
    pause
    exit /b 1
)

echo [OK] Pasta de saves encontrada
echo.

REM Listar mundos
echo Mundos salvos:
echo.
for /d %%D in ("%SAVE_PATH%\*") do (
    echo   [MUNDO] %%~nxD
    
    REM Verificar se tem jogadores
    if exist "%%D\Players\*.sav" (
        for %%F in ("%%D\Players\*.sav") do (
            echo      ^|-- Jogador: %%~nxF
        )
    ) else (
        echo      ^|-- [AVISO] Nenhum jogador salvo ainda
    )
    echo.
)

echo ========================================
echo  Resumo:
echo ========================================
echo.

REM Contar arquivos de jogadores
set /a PLAYER_COUNT=0
for /r "%SAVE_PATH%" %%F in (*.sav) do (
    set /a PLAYER_COUNT+=1
)

echo Total de arquivos .sav encontrados: %PLAYER_COUNT%
echo.

if %PLAYER_COUNT% GTR 0 (
    echo [OK] O servidor tem saves! O extrator deve funcionar.
) else (
    echo [AVISO] Nenhum save encontrado.
    echo         O servidor precisa ser iniciado e jogadores
    echo         precisam entrar pelo menos uma vez.
)

echo.
echo Pressione qualquer tecla para sair...
pause >nul
