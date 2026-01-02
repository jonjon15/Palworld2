# Script de Verificação do Sistema
# Verifica se tudo está funcionando corretamente

param(
    [switch]$Detailed = $false
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Verificação do Sistema Palworld" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$allGood = $true

# 1. Verificar Python
Write-Host "1. Python:" -NoNewline -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    if ($pythonVersion -match "Python (\d+\.\d+)") {
        $version = $matches[1]
        if ([double]$version -ge 3.10) {
            Write-Host " ✅ $pythonVersion" -ForegroundColor Green
        } else {
            Write-Host " ⚠️  $pythonVersion (recomendado 3.10+)" -ForegroundColor Yellow
            $allGood = $false
        }
    }
} catch {
    Write-Host " ❌ Não instalado" -ForegroundColor Red
    $allGood = $false
}

# 2. Verificar palworld-save-tools
Write-Host "2. palworld-save-tools:" -NoNewline -ForegroundColor Yellow
$pipList = pip list 2>&1 | Out-String
if ($pipList -match "palworld-save-tools") {
    Write-Host " ✅ Instalado" -ForegroundColor Green
} else {
    Write-Host " ❌ Não instalado" -ForegroundColor Red
    Write-Host "   Execute: pip install palworld-save-tools" -ForegroundColor Gray
    $allGood = $false
}

# 3. Verificar Extrator
Write-Host "3. Processo Extrator:" -NoNewline -ForegroundColor Yellow
$extractorProcess = Get-Process powershell -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*Position*" }
if ($extractorProcess) {
    Write-Host " ✅ Rodando (PID: $($extractorProcess.Id))" -ForegroundColor Green
} else {
    Write-Host " ❌ Não está rodando" -ForegroundColor Red
    $allGood = $false
}

# 4. Verificar HTTP Server
Write-Host "4. Servidor HTTP:" -NoNewline -ForegroundColor Yellow
$httpConnection = Get-NetTCPConnection -LocalPort 8888 -ErrorAction SilentlyContinue
if ($httpConnection) {
    Write-Host " ✅ Rodando (porta 8888)" -ForegroundColor Green
    
    # Testar endpoint
    if ($Detailed) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8888/health" -UseBasicParsing -TimeoutSec 5
            $health = $response.Content | ConvertFrom-Json
            Write-Host "   Status: $($health.status)" -ForegroundColor Gray
            if ($health.playerCount) {
                Write-Host "   Jogadores: $($health.playerCount)" -ForegroundColor Gray
            }
        } catch {
            Write-Host "   ⚠️  Não respondendo" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host " ❌ Não está rodando" -ForegroundColor Red
    $allGood = $false
}

# 5. Verificar Arquivo de Dados
Write-Host "5. Arquivo de Dados:" -NoNewline -ForegroundColor Yellow
$dataFile = "C:\palworld-data\players.json"
if (Test-Path $dataFile) {
    $fileInfo = Get-Item $dataFile
    $ageSeconds = (Get-Date) - $fileInfo.LastWriteTime
    
    if ($ageSeconds.TotalSeconds -lt 30) {
        Write-Host " ✅ Atualizado recentemente" -ForegroundColor Green
    } elseif ($ageSeconds.TotalSeconds -lt 120) {
        Write-Host " ⚠️  Atualizado há $([int]$ageSeconds.TotalSeconds)s" -ForegroundColor Yellow
    } else {
        Write-Host " ⚠️  Desatualizado (há $([int]$ageSeconds.TotalMinutes)m)" -ForegroundColor Yellow
        $allGood = $false
    }
    
    if ($Detailed) {
        try {
            $players = Get-Content $dataFile | ConvertFrom-Json
            Write-Host "   Última atualização: $($fileInfo.LastWriteTime.ToString('HH:mm:ss'))" -ForegroundColor Gray
            Write-Host "   Jogadores: $($players.Count)" -ForegroundColor Gray
            if ($players.Count -gt 0) {
                Write-Host "   Exemplo: $($players[0].name) @ ($($players[0].position.x), $($players[0].position.y))" -ForegroundColor Gray
            }
        } catch {
            Write-Host "   ⚠️  Erro ao ler arquivo" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host " ❌ Não existe" -ForegroundColor Red
    Write-Host "   Esperado em: $dataFile" -ForegroundColor Gray
    $allGood = $false
}

# 6. Verificar Servidor Palworld
Write-Host "6. Servidor Palworld:" -NoNewline -ForegroundColor Yellow
$palworldProcess = Get-Process -Name "PalServer*" -ErrorAction SilentlyContinue
if ($palworldProcess) {
    Write-Host " ✅ Rodando" -ForegroundColor Green
} else {
    Write-Host " ⚠️  Não detectado" -ForegroundColor Yellow
    Write-Host "   (Normal se estiver em outra máquina)" -ForegroundColor Gray
}

# Resumo
Write-Host "`n========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "  ✅ SISTEMA OPERACIONAL" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Cyan
    Write-Host "Tudo funcionando corretamente!`n" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  PROBLEMAS DETECTADOS" -ForegroundColor Yellow
    Write-Host "========================================`n" -ForegroundColor Cyan
    Write-Host "Verifique os itens marcados com ❌ acima.`n" -ForegroundColor Yellow
}

# Comandos úteis
Write-Host "Comandos úteis:" -ForegroundColor Cyan
Write-Host "  • Iniciar sistema:  .\start-tracker.bat" -ForegroundColor Gray
Write-Host "  • Parar tudo:       .\stop-tracker.bat" -ForegroundColor Gray
Write-Host "  • Ver detalhes:     .\check-status.ps1 -Detailed" -ForegroundColor Gray
Write-Host "  • Testar API:       Invoke-WebRequest http://localhost:8888/api/players" -ForegroundColor Gray
Write-Host ""
