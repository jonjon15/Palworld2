#Requires -RunAsAdministrator

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   INSTALADOR PALWORLD TRACKER - SIMPLES       " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Detectar servidor
$ServerPath = ""
$possiblePaths = @(
    "D:\SteamLibrary\steamapps\common\PalServer",
    "C:\Program Files (x86)\Steam\steamapps\common\PalServer",
    "E:\SteamLibrary\steamapps\common\PalServer"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $ServerPath = $path
        Write-Host "[OK] Servidor: $ServerPath" -ForegroundColor Green
        break
    }
}

if (-not $ServerPath) {
    Write-Host "[ERRO] Servidor não encontrado!" -ForegroundColor Red
    $ServerPath = Read-Host "Digite o caminho"
    if (-not (Test-Path $ServerPath)) {
        Write-Host "Caminho inválido!" -ForegroundColor Red
        exit 1
    }
}

# Verificar Python
try {
    $pyVer = python --version 2>&1
    Write-Host "[OK] $pyVer" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] Python não instalado!" -ForegroundColor Red
    Start-Process "https://www.python.org/downloads/"
    exit 1
}

# Criar pastas
$dataPath = "C:\palworld-data"
$scriptsPath = Join-Path $ServerPath "palworld-tracker"

New-Item -Path $dataPath -ItemType Directory -Force | Out-Null
New-Item -Path $scriptsPath -ItemType Directory -Force | Out-Null
Write-Host "[OK] Pastas criadas" -ForegroundColor Green

# Baixar scripts do GitHub
Write-Host "[INFO] Baixando scripts..." -ForegroundColor Yellow

$baseUrl = "https://raw.githubusercontent.com/jonjon15/Palworld2/main/scripts"

try {
    Invoke-WebRequest -Uri "$baseUrl/Extract-PlayerPositions.ps1" -OutFile "$scriptsPath\Extract-PlayerPositions.ps1"
    Write-Host "[OK] Extrator baixado" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] Falha ao baixar extrator: $_" -ForegroundColor Red
    exit 1
}

# Criar servidor HTTP
$httpServer = @'
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

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
            except:
                self.send_response(500)
                self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()
    def log_message(self, format, *args):
        pass

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', 8888), PlayerHandler)
    print('HTTP Server rodando na porta 8888')
    server.serve_forever()
'@

$httpServer | Out-File -FilePath "$scriptsPath\http_server.py" -Encoding UTF8
Write-Host "[OK] Servidor HTTP criado" -ForegroundColor Green

# Criar inicializador
$startBat = @"
@echo off
title Palworld Tracker

taskkill /F /IM python.exe 2>nul
timeout /t 1 /nobreak >nul

start /MIN "Extractor" powershell -WindowStyle Hidden -Command "while(`$true) { & '$scriptsPath\Extract-PlayerPositions.ps1' -ServerPath '$ServerPath' -OutputFile '$dataPath\players.json'; Start-Sleep -Seconds 10 }"

timeout /t 3 /nobreak >nul

start /MIN "HTTP" python "$scriptsPath\http_server.py"

echo [OK] Tracker iniciado!
echo [OK] API: http://localhost:8888/api/players
echo.
echo Pressione qualquer tecla para parar...
pause >nul

taskkill /F /IM python.exe 2>nul
taskkill /F /IM powershell.exe /FI "WINDOWTITLE eq Extractor*" 2>nul
"@

$startBat | Out-File -FilePath "$scriptsPath\START-TRACKER.bat" -Encoding ASCII
Write-Host "[OK] Inicializador criado" -ForegroundColor Green

# Criar atalho
try {
    $WshShell = New-Object -ComObject WScript.Shell
    $desktop = [Environment]::GetFolderPath("Desktop")
    $shortcut = $WshShell.CreateShortcut("$desktop\Palworld Tracker.lnk")
    $shortcut.TargetPath = "$scriptsPath\START-TRACKER.bat"
    $shortcut.WorkingDirectory = $scriptsPath
    $shortcut.Save()
    Write-Host "[OK] Atalho criado na área de trabalho" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Não criou atalho" -ForegroundColor Yellow
}

# Configurar firewall
try {
    Remove-NetFirewallRule -DisplayName "Palworld Tracker HTTP" -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName "Palworld Tracker HTTP" -Direction Inbound -Protocol TCP -LocalPort 8888 -Action Allow | Out-Null
    Write-Host "[OK] Firewall configurado" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Firewall não configurado" -ForegroundColor Yellow
}

# Teste
Write-Host ""
Write-Host "[INFO] Executando teste..." -ForegroundColor Yellow
& powershell -ExecutionPolicy Bypass -File "$scriptsPath\Extract-PlayerPositions.ps1" -ServerPath $ServerPath -OutputFile "$dataPath\players.json"

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "           INSTALAÇÃO CONCLUÍDA!                " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Arquivos: $scriptsPath" -ForegroundColor Yellow
Write-Host "API: http://localhost:8888/api/players" -ForegroundColor Yellow
Write-Host ""
Write-Host "Use o atalho 'Palworld Tracker' na área de trabalho!" -ForegroundColor Cyan
Write-Host ""

$choice = Read-Host "Iniciar tracker agora? (S/N)"
if ($choice -eq 'S' -or $choice -eq 's') {
    Start-Process -FilePath "$scriptsPath\START-TRACKER.bat"
    Write-Host "Tracker iniciado!" -ForegroundColor Green
}

Write-Host ""
Read-Host "Pressione Enter para sair"
