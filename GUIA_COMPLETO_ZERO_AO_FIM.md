# 🎮 GUIA COMPLETO - Portal Palworld do ZERO ao FIM

## 📋 O QUE VOCÊ TEM

- ✅ Servidor Palworld: `D:\SteamLibrary\steamapps\common\PalServer`
- ✅ IP: `201.93.248.252`
- ✅ REST API: porta `8212` (admin / 060892)
- ✅ Portal rodando em Linux (codespace ou servidor)

## 🎯 O QUE VAMOS CONSEGUIR

- ✅ Painel web com login
- ✅ Ver jogadores online em tempo real
- ✅ Ver estatísticas do servidor
- ✅ **Mapa interativo com posições dos jogadores** (igual Suke Portal)
- ✅ Editar configurações do servidor

---

# 📦 PARTE 1: PREPARAR O SERVIDOR WINDOWS

## Passo 1: Instalar Python

1. **Baixe Python 3.11+**: https://www.python.org/downloads/
2. Durante instalação:
   - ☑ **IMPORTANTE**: Marque "Add Python to PATH"
   - Clique "Install Now"
3. Teste no PowerShell:
```powershell
python --version
# Deve mostrar: Python 3.11.x
```

## Passo 2: ~~Instalar Ferramenta de Extração~~ (NÃO NECESSÁRIO)

**ATUALIZAÇÃO**: A nova versão do Palworld (v0.7+) mudou o formato dos saves. O script agora funciona **SEM precisar instalar nada**!

O extrator agora lê diretamente os arquivos `.sav` sem dependências externas.

## Passo 3: Baixar os Scripts

Você tem 2 opções:

### Opção A: Git (se tiver instalado)
```powershell
cd D:\SteamLibrary\steamapps\common\PalServer
git clone https://github.com/jonjon15/Palworld2.git
cd Palworld2\scripts

# Copiar scripts para a pasta do servidor
Copy-Item *.ps1, *.py, *.bat ..\ -Force
cd ..
```

### Opção B: Download Manual (Mais Simples)

1. Acesse: https://github.com/jonjon15/Palworld2/tree/main/scripts
2. Baixe estes arquivos:
   - `Extract-PlayerPositions.ps1`
   - `http_server.py`
   - `start-tracker.bat`
   - `check-status.ps1`
3. Salve tudo em: `D:\SteamLibrary\steamapps\common\PalServer\`

## Passo 4: Criar Pasta de Saída

```powershell
# Criar pasta onde os dados serão salvos
New-Item -Path "C:\palworld-data" -ItemType Directory -Force
```

---

# 🔧 PARTE 2: CONFIGURAR O EXTRATOR

## Passo 5: Testar Extração

No **PowerShell**:

```powershell
cd D:\SteamLibrary\steamapps\common\PalServer

# Executar uma vez para testar
powershell -ExecutionPolicy Bypass -File .\Extract-PlayerPositions.ps1 -OutputFile "C:\palworld-data\players.json"
```

**O que deve acontecer:**
```
==================================
Palworld Position Extractor v2.0
==================================

[OK] Python encontrado: Python 3.13.x
[INFO] Usando extrator nativo (sem dependências externas)
[OK] Mundo: 11674E544C0C5FA7577A05B8B43F9D2C
[INFO] Lendo arquivos de jogadores em D:\...\Players...
[OK] Jogador: PlayerName @ (-123456, -789012, 1000)
[OK] 3 jogadores salvos em: C:\palworld-data\players.json

==================================
```

## Passo 6: Verificar o Arquivo Gerado

```powershell
# Ver conteúdo
Get-Content C:\palworld-data\players.json | ConvertFrom-Json

# Deve mostrar algo assim:
# name       : X_DRAKE_X
# userId     : steam_76561198000866703
# level      : 25
# position   : @{x=-123456; y=-789012; z=1000}
```

---

# 🌐 PARTE 3: CRIAR SERVIDOR HTTP (Compartilhar Dados)

## Passo 7: Criar Servidor Python

Crie arquivo `http_server.py` em `D:\SteamLibrary\steamapps\common\PalServer\`:

```python
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
                print(f'[OK] Enviados {len(data)} jogadores')
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                print(f'[ERRO] {e}')
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        pass  # Silenciar logs

if __name__ == '__main__':
    port = 8888
    server = HTTPServer(('0.0.0.0', port), PlayerHandler)
    print(f'✅ Servidor HTTP rodando em http://0.0.0.0:{port}')
    print(f'📡 Endpoint: http://192.168.15.8:{port}/api/players')
    print('Pressione Ctrl+C para parar\n')
    server.serve_forever()
```

## Passo 8: Testar Servidor HTTP

Em um PowerShell:

```powershell
cd D:\SteamLibrary\steamapps\common\PalServer
python http_server.py

# Deve mostrar:
# ✅ Servidor HTTP rodando em http://0.0.0.0:8888
# 📡 Endpoint: http://192.168.15.8:8888/api/players
```

Em **outro PowerShell**, teste:

```powershell
Invoke-WebRequest -Uri http://localhost:8888/api/players | ConvertFrom-Json

# Deve retornar lista de jogadores
```

---

# 🤖 PARTE 4: AUTOMATIZAR TUDO

## Passo 9: Criar Script de Inicialização

Crie `start-tracker.bat` em `D:\SteamLibrary\steamapps\common\PalServer\`:

```batch
@echo off
title Palworld Position Tracker

echo ========================================
echo  Palworld Position Tracker - Iniciando
echo ========================================
echo.

REM Matar processos antigos
taskkill /F /IM python.exe /FI "WINDOWTITLE eq Palworld*" 2>nul
timeout /t 2 /nobreak >nul

REM Iniciar extrator em loop (a cada 10 segundos)
start "Extractor" powershell -WindowStyle Minimized -Command "while($true) { & '.\Extract-PlayerPositions.ps1' -OutputFile 'C:\palworld-data\players.json'; Start-Sleep -Seconds 10 }"

REM Aguardar 2 segundos
timeout /t 2 /nobreak >nul

REM Iniciar servidor HTTP
start "HTTP Server" python http_server.py

echo.
echo ========================================
echo  TUDO PRONTO!
echo ========================================
echo.
echo  [OK] Extrator rodando (atualiza a cada 10s)
echo  [OK] Servidor HTTP em: http://192.168.15.8:8888
echo.
echo  Pressione qualquer tecla para parar...
pause >nul

REM Parar tudo
taskkill /F /IM python.exe /FI "WINDOWTITLE eq HTTP*" 2>nul
taskkill /F /IM powershell.exe /FI "WINDOWTITLE eq Extractor*" 2>nul

echo Finalizado!
```

## Passo 10: Executar

```powershell
cd D:\SteamLibrary\steamapps\common\PalServer
.\start-tracker.bat
```

**O que acontece:**
1. Extrator roda a cada 10 segundos em background
2. Servidor HTTP fica ativo na porta 8888
3. Ambos ficam minimizados
4. Aperte qualquer tecla para parar tudo

---

# 🐧 PARTE 5: CONFIGURAR O PORTAL (Linux)

## Passo 11: Configurar Variáveis de Ambiente

No seu **portal Linux** (codespace):

```bash
cd /workspaces/Palworld2

# Editar .env.local
cat >> .env.local << 'EOF'

# Configurações do Servidor Palworld
PALWORLD_API_URL=http://201.93.248.252:8212
PALWORLD_API_USER=admin
PALWORLD_API_PASS=060892

# API de Posições (servidor Windows)
PALWORLD_POSITIONS_URL=http://192.168.15.8:8888/api/players

# RCON (backup)
RCON_HOST=201.93.248.252
RCON_PORT=25575
RCON_PASSWORD=admin
EOF
```

## Passo 12: Atualizar Serviço de Players

Edite `/workspaces/Palworld2/services/playerLocationService.ts` para adicionar fonte HTTP:

```bash
# O arquivo já está preparado, só precisa configurar a URL acima
```

## Passo 13: Testar Conexão

```bash
# Do portal, teste se consegue acessar o servidor Windows
curl http://192.168.15.8:8888/api/players

# Deve retornar JSON com jogadores
```

## Passo 14: Reiniciar Portal

```bash
cd /workspaces/Palworld2

# Parar servidor
pkill -f "next dev"

# Limpar cache
rm -rf .next

# Iniciar
npm run dev
```

---

# ✅ PARTE 6: VERIFICAR SE ESTÁ FUNCIONANDO

## Passo 15: Acessar Portal

1. Abra navegador: `http://localhost:3001` (ou porta que estiver rodando)
2. Faça login: `admin / palworld`
3. Vá para **Dashboard**

**O que deve aparecer:**
- ✅ Nome do servidor: [BR] JONJONTESTE
- ✅ Versão: v0.7.0.84578
- ✅ Jogadores online: X
- ✅ **Mapa interativo com marcadores dos jogadores nas posições reais**

## Passo 16: Testar Estatísticas

1. Clique em **Estatísticas** no menu
2. Deve mostrar:
   - ✅ FPS do servidor
   - ✅ Uptime
   - ✅ Lista de jogadores com nível e ping
   - ✅ Configurações do servidor

---

# 🚀 PARTE 7: EXTRAS

## Iniciar Automaticamente com Windows

1. **Aperte** `Win + R`
2. **Digite**: `shell:startup`
3. **Copie** o atalho de `start-tracker.bat` para esta pasta
4. **Pronto!** Vai iniciar sempre que o Windows ligar

## Monitorar se Está Funcionando

Crie `check-status.ps1`:

```powershell
# Verificar Extrator
$extractorRunning = Get-Process powershell -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*Extractor*" }

# Verificar HTTP Server
$serverRunning = Get-NetTCPConnection -LocalPort 8888 -ErrorAction SilentlyContinue

Write-Host "Status do Sistema:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Extrator: " -NoNewline
if ($extractorRunning) { Write-Host "✅ Rodando" -ForegroundColor Green } else { Write-Host "❌ Parado" -ForegroundColor Red }

Write-Host "HTTP Server: " -NoNewline
if ($serverRunning) { Write-Host "✅ Rodando (porta 8888)" -ForegroundColor Green } else { Write-Host "❌ Parado" -ForegroundColor Red }

Write-Host ""
Write-Host "Último arquivo gerado:"
if (Test-Path "C:\palworld-data\players.json") {
    $lastWrite = (Get-Item "C:\palworld-data\players.json").LastWriteTime
    $players = (Get-Content "C:\palworld-data\players.json" | ConvertFrom-Json).Count
    Write-Host "  📅 $lastWrite" -ForegroundColor Yellow
    Write-Host "  👥 $players jogadores" -ForegroundColor Yellow
} else {
    Write-Host "  ❌ Arquivo não existe" -ForegroundColor Red
}
```

Execute: `.\check-status.ps1`

---

# 🎯 RESUMO FINAL

## No Servidor Windows:

```powershell
# 1. Instalar Python
# 2. Baixar scripts (não precisa mais do palworld-save-tools!)
# 3. Copiar scripts para:
D:\SteamLibrary\steamapps\common\PalServer\

# 4. Executar
.\start-tracker.bat
```

## No Portal Linux:

```bash
# 1. Configurar .env.local
# 2. Reiniciar portal
npm run dev
```

## Resultado:

✅ Portal funcionando **IGUAL** ao Suke Portal!
✅ Jogadores com posições reais no mapa
✅ Atualização automática a cada 10 segundos
✅ Todas as estatísticas do servidor

---

# 📞 PRECISA DE AJUDA?

Se algo não funcionar:

1. **Verifique os logs** no PowerShell
2. **Teste cada parte** separadamente
3. **Confirme que o firewall** permite porta 8888
4. **Verifique se o servidor Palworld** está rodando

## Comandos Úteis:

```powershell
# Ver se porta 8888 está aberta
Test-NetConnection -ComputerName localhost -Port 8888

# Ver processos
Get-Process | Where-Object { $_.ProcessName -like "*python*" }

# Parar tudo
taskkill /F /IM python.exe
taskkill /F /IM powershell.exe
```

---

# 🎮 PRONTO!

Agora você tem um portal Palworld completo e funcional! 🚀
