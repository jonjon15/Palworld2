# 🎮 Como Extrair Posições dos Jogadores

## 📋 Pré-requisitos

1. **Acesso ao servidor** Palworld: `D:\SteamLibrary\steamapps\common\PalServer`
2. **Python 3.10+**: https://www.python.org/downloads/
3. **Node.js 18+** (opcional): https://nodejs.org/

## 🚀 Método 1: PowerShell + Python (Recomendado)

### Instalação

1. **Instale Python** e marque "Add to PATH"

2. **Abra PowerShell como Administrador** no servidor

3. **Instale a ferramenta de parser:**
```powershell
pip install palworld-save-tools
```

4. **Execute o extrator:**
```powershell
cd D:\SteamLibrary\steamapps\common\PalServer
powershell -ExecutionPolicy Bypass -File Extract-PlayerPositions.ps1
```

### Modo Watch (Atualização Contínua)

```powershell
# Atualiza a cada 10 segundos
powershell -ExecutionPolicy Bypass -File Extract-PlayerPositions.ps1 -Watch -Interval 10
```

### Saída

Arquivo criado: `C:\temp\palworld_players.json`

```json
[
  {
    "name": "PlayerName",
    "userId": "steam_76561198000866703",
    "playerId": "uuid-here",
    "level": 25,
    "position": {
      "x": -123456,
      "y": -789012,
      "z": 1000
    },
    "ping": 0,
    "timestamp": 1704225600000
  }
]
```

## 🔧 Método 2: Node.js (Alternativo)

Se preferir usar apenas Node.js:

```bash
cd D:\SteamLibrary\steamapps\common\PalServer
node extract-player-positions.js
```

**Nota:** Este método usa parser básico e pode não ser tão preciso.

## 🌐 Conectar ao Portal

### Opção A: Compartilhamento de Arquivo (Mesma Rede)

1. **No servidor Windows**, compartilhe a pasta:
```powershell
New-SmbShare -Name "PalworldData" -Path "C:\temp" -FullAccess "Everyone"
```

2. **No portal Linux**, monte o compartilhamento:
```bash
# Instalar cifs-utils
sudo apt-get install cifs-utils

# Montar
sudo mount -t cifs //192.168.15.8/PalworldData /mnt/palworld -o username=seu_usuario,password=sua_senha

# Criar symlink
ln -s /mnt/palworld/palworld_players.json /tmp/palworld_players.json
```

3. **Configure o portal:**
```bash
echo "MOD_JSON_PATH=/tmp/palworld_players.json" >> .env.local
```

### Opção B: API HTTP (Recomendado)

1. **No servidor Windows**, crie um servidor HTTP simples:

```powershell
# Instalar módulo HTTP
Install-Module -Name Pode -Scope CurrentUser -Force

# Criar server.ps1
@"
Import-Module Pode

Start-PodeServer {
    Add-PodeEndpoint -Address * -Port 8888 -Protocol Http
    
    Add-PodeRoute -Method Get -Path '/api/players' -ScriptBlock {
        `$json = Get-Content 'C:\temp\palworld_players.json' -Raw
        Write-PodeJsonResponse -Value (`$json | ConvertFrom-Json)
    }
}
"@ | Out-File server.ps1

# Executar
powershell -File server.ps1
```

2. **Configure o portal** para usar a API:
```bash
echo "PALWORLD_POSITIONS_URL=http://192.168.15.8:8888/api/players" >> .env.local
```

### Opção C: Servidor HTTP com Python

```python
# http_server.py
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

class PlayerHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/players':
            try:
                with open('C:\\temp\\palworld_players.json', 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(data).encode())
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode())

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', 8888), PlayerHandler)
    print('Servidor rodando em http://0.0.0.0:8888')
    server.serve_forever()
```

Execute:
```powershell
python http_server.py
```

## 🤖 Automatizar com Task Scheduler

1. **Abra Task Scheduler** no Windows

2. **Criar nova tarefa:**
   - Nome: "Palworld Position Extractor"
   - Trigger: A cada 10 segundos (ou quando desejado)
   - Action: Executar PowerShell script
   - Program: `powershell.exe`
   - Arguments: `-ExecutionPolicy Bypass -File "D:\SteamLibrary\steamapps\common\PalServer\Extract-PlayerPositions.ps1"`

3. **Configurações:**
   - ☑ Executar mesmo se usuário não estiver logado
   - ☑ Executar com privilégios mais altos

## ✅ Verificação

1. **Teste o extrator:**
```powershell
powershell -ExecutionPolicy Bypass -File Extract-PlayerPositions.ps1
```

2. **Verifique o arquivo:**
```powershell
Get-Content C:\temp\palworld_players.json | ConvertFrom-Json
```

3. **Teste a API (se configurou):**
```powershell
Invoke-WebRequest -Uri http://localhost:8888/api/players | ConvertFrom-Json
```

4. **No portal, verifique se está recebendo:**
```bash
curl http://192.168.15.8:8888/api/players
```

## 📊 Resultado Esperado

Após configurar, o portal mostrará:
- ✅ Jogadores no mapa com posições reais
- ✅ Atualização em tempo real (a cada 10s)
- ✅ Mesma funcionalidade do Suke Portal

## 🐛 Troubleshooting

### Erro: "palworld-save-tools not found"
```powershell
pip install --upgrade palworld-save-tools
```

### Erro: "Level.sav corrupted"
- O servidor pode estar salvando no momento
- Aguarde alguns segundos e tente novamente

### Posições aparecem como 0,0,0
- O save pode não ter jogadores online
- Verifique se há jogadores conectados no servidor

### Portal não mostra jogadores
- Verifique se o arquivo JSON está sendo atualizado
- Confirme que o caminho `MOD_JSON_PATH` está correto
- Teste o endpoint manualmente: `curl http://localhost:8888/api/players`
