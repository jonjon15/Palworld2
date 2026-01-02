# 🔧 SOLUÇÃO: Erro "PlM instead of PlZ"

## 🚨 O Problema

Se você está recebendo este erro:

```
Exception: not a compressed Palworld save, found b'PlM' instead of b'PlZ'
```

**Isso significa**: A nova versão do Palworld (v0.7+) mudou o formato dos arquivos de save!

## ✅ A Solução

O script `Extract-PlayerPositions.ps1` foi **ATUALIZADO** para funcionar com o novo formato!

### O que mudou:

- ❌ **ANTES**: Usava a biblioteca `palworld-save-tools` (que não funciona mais)
- ✅ **AGORA**: Lê diretamente os arquivos `.sav` sem dependências!

### Como usar:

1. **Você NÃO precisa mais instalar** `palworld-save-tools`
2. **Apenas Python é necessário** (3.10 ou superior)

## 📝 Comandos Atualizados

### Teste Simples:

```powershell
cd D:\SteamLibrary\steamapps\common\PalServer

# Execute o script (sem instalar nada além do Python!)
powershell -ExecutionPolicy Bypass -File .\Extract-PlayerPositions.ps1 -OutputFile "C:\palworld-data\players.json"
```

### Saída Esperada:

```
==================================
Palworld Position Extractor v2.0
==================================

[OK] Python encontrado: Python 3.13.11
[INFO] Usando extrator nativo (sem dependências externas)
[OK] Mundo: 11674E544C0C5FA7577A05B8B43F9D2C
[INFO] Lendo arquivos de jogadores em D:\...\11674E544C0C5FA7577A05B8B43F9D2C\Players...
[OK] Jogador: X_DRAKE_X @ (-123456, -789012, 1000)
[OK] Jogador: OutroPlayer @ (-111111, -222222, 500)
[OK] 2 jogadores salvos em: C:\palworld-data\players.json

==================================
```

## 🎯 Como Funciona Agora

O novo extrator:

1. **Localiza** a pasta `Players/` dentro do save do mundo
2. **Lê cada arquivo** `.sav` individualmente (um por jogador)
3. **Extrai usando regex e padrões binários**:
   - Nome do jogador
   - Posição (X, Y, Z)
   - Nível
   - Timestamp
4. **Salva em JSON** pronto para o portal web

## 🔍 Verificar se Funcionou

```powershell
# Ver o JSON gerado
Get-Content C:\palworld-data\players.json | ConvertFrom-Json

# Deve mostrar:
# name       : X_DRAKE_X
# userId     : steam_76561198000866703
# level      : 25
# position   : @{x=-123456; y=-789012; z=1000}
```

## 📦 Arquivos Necessários

Você só precisa de:

1. ✅ **Python 3.10+** instalado
2. ✅ **Extract-PlayerPositions.ps1** (atualizado)
3. ✅ **http_server.py** (para servir os dados)
4. ✅ **start-tracker.bat** (para iniciar tudo)

**Baixe todos em**: https://github.com/jonjon15/Palworld2/tree/main/scripts

## 🚀 Próximos Passos

Depois que o extrator funcionar:

1. **Iniciar o servidor HTTP**:
```powershell
.\start-tracker.bat
```

2. **Verificar endpoint**:
```powershell
curl http://localhost:8888/api/players
```

3. **Configurar portal Linux** com a URL:
```bash
PALWORLD_POSITIONS_URL=http://192.168.15.8:8888/api/players
```

## 💡 Dicas

### Se ainda não funcionar:

1. **Verifique se há jogadores salvos**:
```powershell
ls "D:\SteamLibrary\steamapps\common\PalServer\Pal\Saved\SaveGames\0\*\Players\*.sav"
```

2. **Verifique a versão do Python**:
```powershell
python --version
# Deve ser 3.10 ou superior
```

3. **Execute com mais detalhes**:
```powershell
python -u $env:TEMP\extract_palworld_positions.py "D:\...\11674E544C0C5FA7577A05B8B43F9D2C" "C:\palworld-data\players.json"
```

## 📞 Problemas?

Se continuar com erros, verifique:

- ✅ Python instalado corretamente
- ✅ Caminho do servidor Palworld correto
- ✅ Servidor Palworld JÁ FOI USADO (tem saves)
- ✅ Pasta `Players/` existe no diretório do mundo

---

**Atualizado**: 02/01/2026
**Versão do Script**: 2.1 (compatível com Palworld v0.7+)
