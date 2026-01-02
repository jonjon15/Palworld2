# 🎁 Como Dar Itens aos Jogadores no Palworld

## ⚠️ Importante

A **REST API oficial** do Palworld **NÃO suporta** dar itens diretamente. Para essa funcionalidade, você precisa usar uma das soluções alternativas abaixo.

---

## 🎯 Método 1: RCON (Recomendado)

### Passo 1: Habilitar RCON no Servidor

Edite o arquivo `PalWorldSettings.ini` (geralmente em `Pal/Saved/Config/WindowsServer/`):

```ini
[/Script/Pal.PalGameWorldSettings]
OptionSettings=(
    ...
    RCONEnabled=True,
    RCONPort=25575,
    AdminPassword="sua_senha_rcon_aqui",
    ...
)
```

**Salve o arquivo e reinicie o servidor Palworld.**

### Passo 2: Configurar Portal Web

No Linux (portal), edite `.env.local`:

```bash
# Adicione estas linhas:
PALWORLD_RCON_HOST=201.93.248.252  # IP do servidor
PALWORLD_RCON_PORT=25575
PALWORLD_RCON_PASSWORD=sua_senha_rcon_aqui
```

### Passo 3: Reiniciar Portal

```bash
pkill -f "next dev"
npm run dev
```

### Passo 4: Usar no Portal

1. Acesse: http://localhost:3000/admin/give-items
2. Selecione o jogador
3. Escolha o item
4. Digite a quantidade
5. Clique em "Dar Item"

---

## 🎯 Método 2: Mod de Servidor (Avançado)

Se RCON não funcionar, você pode instalar um mod que adicione funcionalidades administrativas.

### Mods Populares:

1. **PalGuard** - Adiciona comandos admin via console
2. **ServerManagement Mod** - Sistema de admin completo
3. **AdminTools** - Ferramentas administrativas extras

### Como Instalar:

1. Baixe o mod do [Nexus Mods](https://www.nexusmods.com/palworld) ou site oficial
2. Extraia para `Pal/Binaries/Win64/Mods/`
3. Reinicie o servidor
4. Configure conforme documentação do mod

---

## 🎯 Método 3: Comandos Console do Servidor

Se você tem acesso direto ao console do servidor:

### Comandos Disponíveis:

```
/GiveItem <PlayerName> <ItemID> <Amount>
/GiveItemToSelf <ItemID> <Amount>
/GiveExp <PlayerName> <Amount>
/GiveGold <PlayerName> <Amount>
```

### Exemplo:

```
/GiveItem X_DRAKE_X Sphere 100
/GiveItem PlayerName IronOre 500
```

---

## 📦 Lista de IDs de Itens Comuns

### Captura:
- `Sphere` - Pal Sphere
- `MegaSphere` - Mega Sphere  
- `GigaSphere` - Giga Sphere
- `UltraSphere` - Ultra Sphere
- `LegendarySphere` - Legendary Sphere

### Recursos Básicos:
- `Wood` - Madeira
- `Stone` - Pedra
- `Fiber` - Fibra
- `PalFluid` - Fluido de Pal
- `Leather` - Couro
- `Bone` - Osso
- `Wool` - Lã

### Minérios:
- `Ore` - Minério
- `Coal` - Carvão
- `IronOre` - Minério de Ferro
- `CopperOre` - Minério de Cobre
- `Sulfur` - Enxofre
- `QuartzCrystal` - Cristal de Quartzo
- `PalladiumOre` - Minério de Paládio

### Lingotes:
- `CopperIngot` - Lingote de Cobre
- `IronIngot` - Lingote de Ferro
- `Cement` - Cimento
- `PalladiumIngot` - Lingote de Paládio
- `RefinedMetalIngot` - Lingote de Metal Refinado

### Armas:
- `Bow` - Arco
- `Crossbow` - Besta
- `HandGun` - Pistola
- `AssaultRifle` - Rifle de Assalto
- `Shotgun` - Escopeta
- `RocketLauncher` - Lança-Foguetes
- `LaserGun` - Arma Laser

### Munição:
- `ArrowNormal` - Flecha Normal
- `ArrowFire` - Flecha de Fogo
- `ArrowPoison` - Flecha Venenosa
- `Bullet` - Bala
- `ShotgunShell` - Cartucho de Escopeta
- `Rocket` - Foguete
- `EnergyCell` - Célula de Energia

### Comida:
- `Berry` - Berry
- `Bread` - Pão
- `CookedMeat` - Carne Cozida
- `Egg` - Ovo
- `Milk` - Leite
- `Honey` - Mel
- `Wheat` - Trigo
- `Vegetables` - Vegetais

### Sementes:
- `BerrySeeds` - Sementes de Berry
- `WheatSeeds` - Sementes de Trigo
- `TomatoSeeds` - Sementes de Tomate
- `LettuceSeeds` - Sementes de Alface

### Itens Especiais:
- `AncientCivilizationParts` - Partes da Civilização Antiga
- `PalOil` - Óleo de Pal
- `Gunpowder` - Pólvora
- `HighQualityPalOil` - Óleo de Pal de Alta Qualidade
- `ElectricOrgans` - Órgãos Elétricos
- `FlameOrgans` - Órgãos Flamejantes

---

## 🔍 Como Encontrar IDs de Itens

### Método 1: Wiki Oficial
https://palworld.fandom.com/wiki/Item_IDs

### Método 2: Arquivos do Jogo
Navegue até:
```
Pal/Content/Pal/DataTable/
```

Procure por arquivos `.uasset` que contêm definições de itens.

### Método 3: Ferramentas de Terceiros
- **Palworld Save Editor** - Mostra todos os IDs
- **UE4SS** - Extrai dados do Unreal Engine

---

## 🛠️ Testando RCON

### Via Terminal (Linux/Mac):

```bash
# Instalar ferramenta RCON
npm install -g rcon-cli

# Testar conexão
rcon -h 201.93.248.252 -p 25575 -P sua_senha "Info"

# Dar item
rcon -h 201.93.248.252 -p 25575 -P sua_senha "GiveItem PlayerName Sphere 100"
```

### Via PowerShell (Windows):

```powershell
# Baixar ferramenta
Invoke-WebRequest -Uri "https://github.com/gorcon/rcon-cli/releases/download/v0.10.3/rcon-0.10.3-windows-amd64.zip" -OutFile "rcon.zip"
Expand-Archive -Path "rcon.zip" -DestinationPath "."

# Testar
.\rcon.exe -a 201.93.248.252:25575 -p sua_senha "Info"

# Dar item
.\rcon.exe -a 201.93.248.252:25575 -p sua_senha "GiveItem PlayerName Sphere 100"
```

---

## 🚀 Usando a Interface do Portal

1. **Acesse**: http://localhost:3000/admin/give-items

2. **Passos**:
   - Clique em "Atualizar Jogadores"
   - Selecione o jogador no dropdown
   - Escolha a categoria (Armas, Recursos, etc.)
   - Selecione o item OU digite o ID manualmente
   - Digite a quantidade (1-9999)
   - Clique em "Dar Item"

3. **Resultado**:
   - ✅ Sucesso: Item enviado!
   - ❌ Erro: Verifique RCON ou logs do servidor

---

## 📊 Exemplo Prático

### Cenário: Dar 100 Pal Spheres para X_DRAKE_X

**Via Portal:**
1. Jogador: `X_DRAKE_X`
2. Item: `Sphere (Pal Sphere)`
3. Quantidade: `100`
4. Clicar "Dar Item"

**Via RCON (terminal):**
```bash
rcon -h 201.93.248.252 -p 25575 -P admin "GiveItem X_DRAKE_X Sphere 100"
```

**Via Console do Servidor:**
```
/GiveItem X_DRAKE_X Sphere 100
```

---

## ⚠️ Limitações

### REST API Oficial (NÃO suporta):
- ❌ Dar itens
- ❌ Modificar inventário
- ❌ Spawnar Pals
- ❌ Teletransportar jogadores
- ❌ Editar nível do jogador

### RCON (Suporta - se habilitado):
- ✅ Dar itens
- ✅ Dar experiência
- ✅ Dar dinheiro (gold)
- ✅ Comandos administrativos básicos
- ❌ Inventário detalhado
- ❌ Posições exatas

### Solução Completa:
Para funcionalidades avançadas, considere:
- Mods de servidor especializados
- Ferramentas de edição de save
- Plugins customizados

---

## 🔧 Troubleshooting

### "RCON não configurado"
→ Configure variáveis no `.env.local`

### "Erro ao conectar com RCON"
→ Verifique se porta 25575 está aberta no firewall

### "Comando não reconhecido"
→ Verifique se o servidor suporta o comando

### "Jogador não encontrado"
→ Use o nome exato do jogador (case-sensitive)

---

**Atualizado**: 02/01/2026  
**Versão**: 1.0
