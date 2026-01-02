<![CDATA[#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Instalador Automático do Palworld Position Tracker
    
.DESCRIPTION
    Este script faz TUDO automaticamente:
    - Detecta o servidor Palworld
    - Baixa os scripts necessários
    - Configura o sistema
    - Inicia o tracker
    
.EXAMPLE
    powershell -ExecutionPolicy Bypass -File INSTALL-AUTOMATICO.ps1
#>

param(
    [string]$ServerPath = "",
    [int]$UpdateInterval = 10,
    [int]$HttpPort = 8888
)

$ErrorActionPreference = "Stop"

# Cores
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warn { Write-Host $args -ForegroundColor Yellow }
function Write-Fail { Write-Host $args -ForegroundColor Red }

Clear-Host
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   INSTALADOR AUTOMÁTICO - PALWORLD TRACKER    " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PASSO 1: DETECTAR SERVIDOR PALWORLD
# ============================================

Write-Info "[1/7] Detectando servidor Palworld..."

$possiblePaths = @(
    "D:\SteamLibrary\steamapps\common\PalServer",
    "C:\Program Files (x86)\Steam\steamapps\common\PalServer",
    "E:\SteamLibrary\steamapps\common\PalServer",
    "C:\SteamLibrary\steamapps\common\PalServer"
)

if ($ServerPath -and (Test-Path $ServerPath)) {
    Write-Success "   ✓ Usando caminho fornecido: $ServerPath"
} else {
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $ServerPath = $path
            Write-Success "   ✓ Servidor encontrado: $ServerPath"
            break
        }
    }
}

if (-not $ServerPath -or -not (Test-Path $ServerPath)) {
    Write-Fail "   ✗ Servidor Palworld não encontrado!"
    Write-Host ""
    Write-Info "Por favor, forneça o caminho manualmente:"
    $ServerPath = Read-Host "Caminho completo"
    
    if (-not (Test-Path $ServerPath)) {
        Write-Fail "Caminho inválido! Abortando."
        exit 1
    }
}

# Verificar se é realmente o Palworld
if (-not (Test-Path (Join-Path $ServerPath "PalServer.exe"))) {
    Write-Fail "   ✗ PalServer.exe não encontrado neste caminho!"
    exit 1
}

Write-Host ""

# ============================================
# PASSO 2: VERIFICAR PYTHON
# ============================================

Write-Info "[2/7] Verificando Python..."

try {
    $pythonVersion = python --version 2>&1
    Write-Success "   ✓ $pythonVersion instalado"
} catch {
    Write-Fail "   ✗ Python não encontrado!"
    Write-Host ""
    Write-Warn "Abrindo página de download do Python..."
    Start-Process "https://www.python.org/downloads/"
    Write-Host ""
    Write-Info "Após instalar o Python, execute este script novamente."
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""

# ============================================
# PASSO 3: CRIAR PASTAS
# ============================================

Write-Info "[3/7] Criando estrutura de pastas..."

$dataPath = "C:\palworld-data"
$scriptsPath = Join-Path $ServerPath "palworld-tracker"

try {
    New-Item -Path $dataPath -ItemType Directory -Force | Out-Null
    Write-Success "   ✓ Pasta de dados: $dataPath"
    
    New-Item -Path $scriptsPath -ItemType Directory -Force | Out-Null
    Write-Success "   ✓ Pasta de scripts: $scriptsPath"
} catch {
    Write-Fail "   ✗ Erro ao criar pastas: $_"
    exit 1
}

Write-Host ""

# ============================================
# PASSO 4: BAIXAR/CRIAR SCRIPTS
# ============================================

Write-Info "[4/7] Criando scripts necessários..."

# Script 1: Extrator de Posições
$extractorScript = @'
# PowerShell Script - Extrator de Posições do Palworld v2.1
param(
    [string]$ServerPath = "D:\SteamLibrary\steamapps\common\PalServer",
    [string]$OutputFile = "C:\palworld-data\players.json"
)

$SavePath = Join-Path $ServerPath "Pal\Saved\SaveGames\0"
$WorldDirs = Get-ChildItem -Path $SavePath -Directory -ErrorAction SilentlyContinue

if ($WorldDirs.Count -eq 0) {
    Write-Host "[ERRO] Nenhum mundo encontrado" -ForegroundColor Red
    exit 1
}

$WorldDir = $WorldDirs[0].FullName

$PythonScript = @"
import json, sys, os, struct, re
from pathlib import Path

world_dir = Path(sys.argv[1])
output_file = sys.argv[2]

players_dir = world_dir / 'Players'
if not players_dir.exists():
    print(f'[ERRO] Players não encontrado')
    sys.exit(1)

players = []

for sav_file in players_dir.glob('*.sav'):
    try:
        with open(sav_file, 'rb') as f:
            data = f.read()
        
        user_id = sav_file.stem
        name = 'Unknown'
        
        # Extrair nome
        nickname_pattern = b'NickName\x00.{1,4}'
        matches = list(re.finditer(nickname_pattern, data))
        
        if matches:
            for match in matches:
                start = match.end()
                try:
                    end = data.find(b'\x00\x00\x00', start)
                    if end > start:
                        potential_name = data[start:end].decode('utf-16-le', errors='ignore').strip()
                        if potential_name and len(potential_name) < 50 and potential_name.isprintable():
                            name = potential_name
                            break
                except:
                    pass
        
        # Extrair posição
        x, y, z = 0, 0, 0
        transform_pattern = b'transform\x00'
        matches = list(re.finditer(transform_pattern, data))
        
        for match in matches:
            try:
                offset = match.end() + 20
                if offset + 12 <= len(data):
                    x = struct.unpack('<f', data[offset:offset+4])[0]
                    y = struct.unpack('<f', data[offset+4:offset+8])[0]
                    z = struct.unpack('<f', data[offset+8:offset+12])[0]
                    
                    if abs(x) < 1000000 and abs(y) < 1000000 and abs(z) < 100000:
                        break
            except:
                pass
        
        # Extrair nível
        level = 1
        level_pattern = b'Level\x00.{1,10}'
        matches = list(re.finditer(level_pattern, data))
        
        for match in matches:
            try:
                offset = match.end()
                if offset + 4 <= len(data):
                    potential_level = struct.unpack('<I', data[offset:offset+4])[0]
                    if 1 <= potential_level <= 100:
                        level = potential_level
                        break
            except:
                pass
        
        player = {
            'name': name,
            'userId': f'steam_{user_id}',
            'playerId': user_id,
            'level': level,
            'position': {'x': int(x), 'y': int(y), 'z': int(z)},
            'ping': 0,
            'timestamp': int(os.path.getmtime(sav_file) * 1000)
        }
        
        players.append(player)
    except Exception as e:
        continue

os.makedirs(os.path.dirname(output_file), exist_ok=True)
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(players, f, indent=2, ensure_ascii=False)

print(f'[OK] {len(players)} jogadores')
"@

$TempPyScript = Join-Path $env:TEMP "extract_palworld_positions.py"
$PythonScript | Out-File -FilePath $TempPyScript -Encoding UTF8

python $TempPyScript $WorldDir $OutputFile
Remove-Item $TempPyScript -ErrorAction SilentlyContinue
exit $LASTEXITCODE
'@

$extractorPath = Join-Path $scriptsPath "Extract-PlayerPositions.ps1"
$extractorScript | Out-File -FilePath $extractorPath -Encoding UTF8
Write-Success "   ✓ Extrator criado"

# Script 2: Servidor HTTP
$httpServerScript = @'
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os

class PlayerHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/players':
            try:
                with open('C:\\palworld-data\\players.json', 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        pass

if __name__ == '__main__':
    port = int(os.environ.get('HTTP_PORT', 8888))
    server = HTTPServer(('0.0.0.0', port), PlayerHandler)
    print(f'HTTP Server running on port {port}')
    server.serve_forever()
'@

$httpServerPath = Join-Path $scriptsPath "http_server.py"
$httpServerScript | Out-File -FilePath $httpServerPath -Encoding UTF8
Write-Success "   ✓ Servidor HTTP criado"

# Script 3: Inicializador
$startScript = @"
@echo off
title Palworld Tracker - Ativo

echo ========================================
echo  Palworld Position Tracker
echo ========================================
echo.

REM Parar processos antigos
taskkill /F /IM python.exe /FI "WINDOWTITLE eq Palworld*" 2>nul
timeout /t 1 /nobreak >nul

REM Iniciar extrator em loop
start /MIN "Palworld Extractor" powershell -WindowStyle Hidden -Command "while(`$true) { & '$scriptsPath\Extract-PlayerPositions.ps1' -ServerPath '$ServerPath' -OutputFile '$dataPath\players.json'; Start-Sleep -Seconds $UpdateInterval }"

REM Aguardar primeiro save
timeout /t 3 /nobreak >nul

REM Iniciar servidor HTTP
set HTTP_PORT=$HttpPort
start /MIN "Palworld HTTP" python "$scriptsPath\http_server.py"

echo [OK] Tracker iniciado!
echo [OK] Servidor HTTP: http://localhost:$HttpPort/api/players
echo.
echo Pressione qualquer tecla para PARAR o tracker...
pause >nul

REM Parar tudo
taskkill /F /IM python.exe /FI "WINDOWTITLE eq Palworld*" 2>nul
taskkill /F /IM powershell.exe /FI "WINDOWTITLE eq Palworld*" 2>nul

echo.
echo Tracker parado!
timeout /t 2 /nobreak >nul
"@

$startScriptPath = Join-Path $scriptsPath "START-TRACKER.bat"
$startScript | Out-File -FilePath $startScriptPath -Encoding ASCII
Write-Success "   ✓ Inicializador criado"

Write-Host ""

# ============================================
# PASSO 5: CRIAR ATALHO NA ÁREA DE TRABALHO
# ============================================

Write-Info "[5/7] Criando atalhos..."

try {
    $WshShell = New-Object -ComObject WScript.Shell
    $desktopPath = [Environment]::GetFolderPath("Desktop")
    
    $shortcut = $WshShell.CreateShortcut("$desktopPath\Palworld Tracker.lnk")
    $shortcut.TargetPath = $startScriptPath
    $shortcut.WorkingDirectory = $scriptsPath
    $shortcut.Description = "Iniciar Palworld Position Tracker"
    $shortcut.Save()
    
    Write-Success "   ✓ Atalho criado na área de trabalho"
} catch {
    Write-Warn "   ! Não foi possível criar atalho: $_"
}

Write-Host ""

# ============================================
# PASSO 6: CONFIGURAR FIREWALL
# ============================================

Write-Info "[6/7] Configurando firewall..."

try {
    $ruleName = "Palworld Tracker HTTP"
    
    # Remover regra antiga se existir
    Remove-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
    
    # Criar nova regra
    New-NetFirewallRule -DisplayName $ruleName `
                        -Direction Inbound `
                        -Protocol TCP `
                        -LocalPort $HttpPort `
                        -Action Allow `
                        -ErrorAction Stop | Out-Null
    
    Write-Success "   ✓ Firewall configurado (porta $HttpPort)"
} catch {
    Write-Warn "   ! Firewall não configurado: $_"
    Write-Warn "   ! Você pode precisar liberar a porta $HttpPort manualmente"
}

Write-Host ""

# ============================================
# PASSO 7: TESTE INICIAL
# ============================================

Write-Info "[7/7] Executando teste inicial..."

try {
    & powershell -ExecutionPolicy Bypass -File $extractorPath -ServerPath $ServerPath -OutputFile "$dataPath\players.json"
    
    if ($LASTEXITCODE -eq 0 -and (Test-Path "$dataPath\players.json")) {
        $players = Get-Content "$dataPath\players.json" | ConvertFrom-Json
        Write-Success "   ✓ Teste OK! $($players.Count) jogador(es) encontrado(s)"
    } else {
        Write-Warn "   ! Teste executou mas sem jogadores salvos"
        Write-Warn "   ! Isso é normal se ninguém jogou ainda"
    }
} catch {
    Write-Warn "   ! Erro no teste: $_"
}

Write-Host ""

# ============================================
# RESUMO FINAL
# ============================================

Write-Host "================================================" -ForegroundColor Green
Write-Host "           INSTALAÇÃO CONCLUÍDA! ✓             " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

Write-Info "📁 Arquivos instalados em:"
Write-Host "   $scriptsPath" -ForegroundColor Yellow
Write-Host ""

Write-Info "📊 Dados salvos em:"
Write-Host "   $dataPath" -ForegroundColor Yellow
Write-Host ""

Write-Info "🌐 API disponível em:"
Write-Host "   http://localhost:$HttpPort/api/players" -ForegroundColor Yellow
Write-Host "   http://<SEU_IP>:$HttpPort/api/players" -ForegroundColor Yellow
Write-Host ""

Write-Info "🚀 Para iniciar o tracker:"
Write-Host "   1. Use o atalho na área de trabalho: 'Palworld Tracker'" -ForegroundColor Cyan
Write-Host "   2. OU execute: $startScriptPath" -ForegroundColor Cyan
Write-Host ""

Write-Info "⚙️ Configurações:"
Write-Host "   - Atualização: a cada $UpdateInterval segundos" -ForegroundColor Gray
Write-Host "   - Porta HTTP: $HttpPort" -ForegroundColor Gray
Write-Host ""

Write-Host "================================================" -ForegroundColor Green
Write-Host ""

$choice = Read-Host "Deseja iniciar o tracker agora? (S/N)"
if ($choice -eq 'S' -or $choice -eq 's') {
    Write-Info "Iniciando tracker..."
    Start-Process -FilePath $startScriptPath
    Start-Sleep -Seconds 2
    
    Write-Success "`nTracker iniciado em segundo plano!"
    Write-Info "Verifique em: http://localhost:$HttpPort/api/players"
}

Write-Host ""
Write-Success "Instalação finalizada! 🎮"
Write-Host ""
Read-Host "Pressione Enter para sair"
]]>