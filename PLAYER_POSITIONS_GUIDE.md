# Como Obter Posições dos Jogadores no Palworld

## Problema Atual
A REST API oficial do Palworld (`/v1/api/players`) retorna apenas:
- Nome do jogador
- UserID e PlayerID
- Nível
- Ping

**NÃO retorna coordenadas X, Y, Z**

## Soluções Possíveis

### 1. MOD C++ (Recomendado - Como o Suke Portal faz)

O portal do Suke provavelmente usa um MOD customizado que:

1. Roda dentro do servidor Palworld
2. Lê a memória do processo em tempo real
3. Extrai posições dos jogadores
4. Exporta para arquivo JSON ou API HTTP

**Como implementar:**

```cpp
// PalworldTracker/Tracker.cpp (já existe no projeto)
// Adicionar função para exportar posições:

void ExportPlayerPositions() {
    nlohmann::json playersJson = nlohmann::json::array();
    
    for (auto& player : GetAllPlayers()) {
        playersJson.push_back({
            {"name", player.GetName()},
            {"userId", player.GetUserId()},
            {"playerId", player.GetPlayerId()},
            {"level", player.GetLevel()},
            {"position", {
                {"x", player.GetPosition().X},
                {"y", player.GetPosition().Y},
                {"z", player.GetPosition().Z}
            }},
            {"timestamp", GetCurrentTimestamp()}
        });
    }
    
    // Exportar para arquivo
    std::ofstream file("/tmp/palworld_players.json");
    file << playersJson.dump(2);
    file.close();
}
```

**Configurar no portal:**
```bash
# .env.local
MOD_JSON_PATH=/tmp/palworld_players.json
```

### 2. Parser de Save File (.sav)

O Palworld salva dados em arquivos binários:
- `Saved/SaveGames/0/<WorldID>/Level.sav` - Dados do mundo
- `Saved/SaveGames/0/<WorldID>/Players/*.sav` - Dados dos jogadores

**Ferramentas disponíveis:**
- **palworld-save-tools** (Python): https://github.com/cheahjs/palworld-save-tools
- **uesave-rs** (Rust): Parser de Unreal Engine saves

**Exemplo com palworld-save-tools:**

```python
from palworld_save_tools.gvas import GvasFile
from palworld_save_tools.palsav import decompress_sav_to_gvas

# Ler Level.sav
with open("Level.sav", "rb") as f:
    data = f.read()
    
gvas_file = decompress_sav_to_gvas(data)
parsed = GvasFile.read(gvas_file)

# Extrair posições dos jogadores
for character in parsed["CharacterSaveParameterMap"]["value"]:
    if character["is_player"]:
        position = character["RawData"]["location"]
        print(f"Player: {character['name']}")
        print(f"Position: X={position['x']}, Y={position['y']}, Z={position['z']}")
```

### 3. RCON Customizado

Criar comandos RCON customizados no servidor:

```bash
# Comando customizado (requer MOD)
GetPlayerPosition PlayerName
# Retorno: X=123.45 Y=678.90 Z=100.00
```

### 4. API HTTP no Servidor (Recomendado)

Criar um servidor HTTP simples dentro do MOD C++ que exponha:

```
GET /api/players/positions
{
  "players": [
    {
      "name": "PlayerName",
      "userId": "steam_xxxxx",
      "position": {"x": 123, "y": 456, "z": 78},
      "timestamp": 1234567890
    }
  ]
}
```

## Implementação Atual no Portal

O portal já está preparado para receber posições via:

1. **MOD JSON** (`/tmp/palworld_players.json`)
2. **RCON** (fallback)
3. **REST API** (fallback sem coordenadas)

**Para ativar posições:**

1. Compile o MOD C++ do projeto:
```bash
cd PalworldTracker
# Compilar e injetar no servidor
```

2. Configure o caminho do JSON:
```bash
echo "MOD_JSON_PATH=/tmp/palworld_players.json" >> .env.local
```

3. O portal automaticamente usará as posições quando disponíveis

## Por que o Suke Portal consegue?

O Suke Portal provavelmente:
1. Tem acesso direto aos arquivos de save do servidor
2. Usa um MOD customizado rodando no servidor
3. Tem um parser de save implementado
4. Ou roda diretamente no servidor Palworld

## Próximos Passos

1. **Opção Rápida**: Pedir acesso aos arquivos de save e usar parser Python
2. **Opção Completa**: Implementar MOD C++ para exportar posições
3. **Opção Alternativa**: Usar ferramenta externa que monitora o save

## Exemplo de Uso no Portal

Quando o MOD estiver ativo, o portal automaticamente mostrará:
- Jogadores no mapa interativo em suas posições reais
- Atualização em tempo real das movimentações
- Sistema de fallback se MOD não disponível
