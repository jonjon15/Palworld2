# 🎯 GUIA RÁPIDO - Extrair Posições dos Jogadores

## Você tem acesso ao servidor: `D:\SteamLibrary\steamapps\common\PalServer`

### ✅ Passos Rápidos (5 minutos)

1. **Instale Python** (se não tiver):
   - Download: https://www.python.org/downloads/
   - ☑ Marque "Add to PATH"

2. **Copie os scripts** para o servidor:
   - `Extract-PlayerPositions.ps1`
   - `extract-player-positions.js`

3. **Abra PowerShell** e execute:
```powershell
cd D:\SteamLibrary\steamapps\common\PalServer

# Instalar ferramenta
pip install palworld-save-tools

# Extrair posições
powershell -ExecutionPolicy Bypass -File .\Extract-PlayerPositions.ps1
```

4. **Arquivo gerado**: `C:\temp\palworld_players.json`

5. **Compartilhe com o portal**:

**Opção A - HTTP Server (Recomendado)**
```powershell
# Criar server.py no servidor Windows
python http_server.py  # Porta 8888
```

Depois configure no portal:
```bash
echo "PALWORLD_POSITIONS_URL=http://192.168.15.8:8888/api/players" >> .env.local
```

**Opção B - Compartilhamento de Rede**
```bash
# No Linux (portal)
sudo mount -t cifs //192.168.15.8/C$/temp /mnt/palworld
ln -s /mnt/palworld/palworld_players.json /tmp/palworld_players.json
```

### 🎮 Resultado

Seu portal mostrará:
- ✅ Jogadores com posições reais (igual Suke Portal)
- ✅ Mapa interativo atualizado
- ✅ Coordenadas X, Y, Z precisas

### 📞 Precisa de Ajuda?

Veja: `INSTALL_POSITION_TRACKER.md` (instruções completas)
