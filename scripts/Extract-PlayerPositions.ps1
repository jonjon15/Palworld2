# PowerShell Script - Extrator de Posições do Palworld
# Usa palworld-save-tools para parser preciso

param(
    [string]$ServerPath = "D:\SteamLibrary\steamapps\common\PalServer",
    [string]$OutputFile = "C:\temp\palworld_players.json",
    [switch]$Watch = $false,
    [int]$Interval = 10
)

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Palworld Position Extractor v2.0" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Python está instalado
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[OK] Python encontrado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] Python não encontrado!" -ForegroundColor Red
    Write-Host "Instale Python 3.10+: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

Write-Host "[INFO] Usando extrator nativo (sem dependências externas)" -ForegroundColor Yellow

# Caminho dos saves
$SavePath = Join-Path $ServerPath "Pal\Saved\SaveGames\0"

# Encontrar diretório do mundo
$WorldDirs = Get-ChildItem -Path $SavePath -Directory
if ($WorldDirs.Count -eq 0) {
    Write-Host "[ERRO] Nenhum mundo encontrado em: $SavePath" -ForegroundColor Red
    exit 1
}

$WorldDir = $WorldDirs[0].FullName
Write-Host "[OK] Mundo: $($WorldDirs[0].Name)" -ForegroundColor Green

# Script Python inline para extrair posições
$PythonScript = @"
import json
import sys
import os
import struct
import re
from pathlib import Path

world_dir = sys.argv[1]
output_file = sys.argv[2]

# Ler arquivo Players/*.sav
players_dir = Path(world_dir) / 'Players'
if not players_dir.exists():
    print(f'[ERRO] Diretório Players não encontrado: {players_dir}')
    sys.exit(1)

print(f'[INFO] Lendo arquivos de jogadores em {players_dir}...')

players = []

for sav_file in players_dir.glob('*.sav'):
    try:
        with open(sav_file, 'rb') as f:
            data = f.read()
        
        # Extrair userId do nome do arquivo
        user_id = sav_file.stem
        
        # Tentar extrair nome do jogador (buscar strings Unicode)
        name = 'Unknown'
        
        # Procurar por padrões de nome (geralmente após "NickName")
        nickname_pattern = b'NickName\x00.{1,4}'
        matches = list(re.finditer(nickname_pattern, data))
        
        if matches:
            for match in matches:
                start = match.end()
                # Tentar ler string UTF-16
                try:
                    end = data.find(b'\x00\x00\x00', start)
                    if end > start:
                        potential_name = data[start:end].decode('utf-16-le', errors='ignore').strip()
                        if potential_name and len(potential_name) < 50 and potential_name.isprintable():
                            name = potential_name
                            break
                except:
                    pass
        
        # Se não encontrou, tentar extrair qualquer string legível
        if name == 'Unknown':
            # Procurar por strings UTF-8 legíveis
            text = data.decode('utf-8', errors='ignore')
            potential_names = re.findall(r'[A-Za-z0-9_]{3,20}', text)
            if potential_names:
                # Pegar o primeiro nome razoável
                for pn in potential_names:
                    if not pn.startswith('steam_') and len(pn) >= 3:
                        name = pn
                        break
        
        # Extrair posição (buscar por padrão de coordenadas)
        # Coordenadas são geralmente float32 (4 bytes cada)
        x, y, z = 0, 0, 0
        
        # Procurar por padrão de transformação
        transform_pattern = b'transform\x00'
        matches = list(re.finditer(transform_pattern, data))
        
        for match in matches:
            try:
                offset = match.end() + 20  # Pular alguns bytes
                if offset + 12 <= len(data):
                    x = struct.unpack('<f', data[offset:offset+4])[0]
                    y = struct.unpack('<f', data[offset+4:offset+8])[0]
                    z = struct.unpack('<f', data[offset+8:offset+12])[0]
                    
                    # Verificar se as coordenadas são razoáveis (mapa do Palworld)
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
            'position': {
                'x': int(x),
                'y': int(y),
                'z': int(z)
            },
            'ping': 0,
            'timestamp': int(os.path.getmtime(sav_file) * 1000)
        }
        
        players.append(player)
        print(f'[OK] Jogador: {player["name"]} @ ({player["position"]["x"]}, {player["position"]["y"]}, {player["position"]["z"]})')
        
    except Exception as e:
        print(f'[WARN] Erro ao processar {sav_file.name}: {e}')
        continue

# Salvar JSON
os.makedirs(os.path.dirname(output_file), exist_ok=True)
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(players, f, indent=2, ensure_ascii=False)

print(f'[OK] {len(players)} jogadores salvos em: {output_file}')
"@

# Salvar script Python temporário
$TempPyScript = Join-Path $env:TEMP "extract_palworld_positions.py"
$PythonScript | Out-File -FilePath $TempPyScript -Encoding UTF8

# Função para extrair posições
function Extract-Positions {
    Write-Host "`n[INFO] Extraindo posições..." -ForegroundColor Yellow
    python $TempPyScript $WorldDir $OutputFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Extração concluída!" -ForegroundColor Green
        
        # Mostrar preview
        if (Test-Path $OutputFile) {
            $json = Get-Content $OutputFile | ConvertFrom-Json
            Write-Host "`nJogadores encontrados: $($json.Count)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "[ERRO] Falha na extração" -ForegroundColor Red
    }
}

# Executar uma vez ou em loop
if ($Watch) {
    Write-Host "`n[INFO] Modo watch ativado (intervalo: ${Interval}s)" -ForegroundColor Yellow
    Write-Host "Pressione Ctrl+C para parar`n" -ForegroundColor Yellow
    
    while ($true) {
        Extract-Positions
        Start-Sleep -Seconds $Interval
    }
} else {
    Extract-Positions
}

# Limpar
Remove-Item $TempPyScript -ErrorAction SilentlyContinue

Write-Host "`n==================================" -ForegroundColor Cyan
