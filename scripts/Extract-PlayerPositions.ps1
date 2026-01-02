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

# Instalar palworld-save-tools se necessário
Write-Host "[INFO] Verificando palworld-save-tools..." -ForegroundColor Yellow
$pipList = pip list 2>&1 | Out-String
if ($pipList -notmatch "palworld-save-tools") {
    Write-Host "[INFO] Instalando palworld-save-tools..." -ForegroundColor Yellow
    pip install palworld-save-tools
}

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
from pathlib import Path

try:
    from palworld_save_tools.gvas import GvasFile
    from palworld_save_tools.palsav import decompress_sav_to_gvas, compress_gvas_to_sav
    from palworld_save_tools.paltypes import PALWORLD_CUSTOM_PROPERTIES
except ImportError:
    print('[ERRO] palworld-save-tools não instalado')
    print('Execute: pip install palworld-save-tools')
    sys.exit(1)

world_dir = sys.argv[1]
output_file = sys.argv[2]

# Ler Level.sav
level_sav = Path(world_dir) / 'Level.sav'
if not level_sav.exists():
    print(f'[ERRO] Level.sav não encontrado: {level_sav}')
    sys.exit(1)

print(f'[INFO] Lendo {level_sav}...')

with open(level_sav, 'rb') as f:
    data = f.read()

# Decomprimir
gvas_data = decompress_sav_to_gvas(data)
gvas_file = GvasFile.read(gvas_data, PALWORLD_CUSTOM_PROPERTIES)

players = []

# Extrair players
if 'CharacterSaveParameterMap' in gvas_file.properties:
    char_map = gvas_file.properties['CharacterSaveParameterMap']['value']
    
    for char_id, char_data in char_map.items():
        char_props = char_data['value']
        
        # Verificar se é jogador
        is_player = char_props.get('IsPlayer', {}).get('value', False)
        
        if is_player:
            raw_data = char_props.get('RawData', {}).get('value', {})
            
            # Extrair posição
            location = raw_data.get('transform', {}).get('translation', {})
            
            # Extrair informações
            player = {
                'name': char_props.get('NickName', {}).get('value', 'Unknown'),
                'userId': char_props.get('OwnerPlayerUId', {}).get('value', ''),
                'playerId': char_id,
                'level': char_props.get('Level', {}).get('value', 1),
                'position': {
                    'x': int(location.get('x', 0)),
                    'y': int(location.get('y', 0)),
                    'z': int(location.get('z', 0))
                },
                'ping': 0,
                'timestamp': int(os.path.getmtime(level_sav) * 1000)
            }
            
            players.append(player)
            print(f'[OK] Jogador: {player["name"]} @ ({player["position"]["x"]}, {player["position"]["y"]}, {player["position"]["z"]})')

# Salvar JSON
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
