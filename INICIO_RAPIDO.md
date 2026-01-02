# ⚡ INÍCIO RÁPIDO - 1 MINUTO

## Windows (Servidor Palworld)

### 1️⃣ Abrir PowerShell como Admin
`Win + X` → **PowerShell (Administrador)**

### 2️⃣ Colar e Executar
```powershell
irm https://raw.githubusercontent.com/jonjon15/Palworld2/main/scripts/INSTALL-AUTOMATICO.ps1 | iex
```

### 3️⃣ Apertar "S" quando perguntar

### ✅ PRONTO!

Vai criar um atalho na área de trabalho chamado **"Palworld Tracker"**

---

## Linux (Portal Web)

### 1️⃣ Clonar repositório
```bash
git clone https://github.com/jonjon15/Palworld2.git
cd Palworld2
```

### 2️⃣ Instalar dependências
```bash
npm install
```

### 3️⃣ Configurar .env.local
```bash
cat > .env.local << 'EOF'
# REST API do Palworld
PALWORLD_API_URL=http://201.93.248.252:8212
PALWORLD_API_USER=admin
PALWORLD_API_PASS=060892

# API de Posições (Windows)
PALWORLD_POSITIONS_URL=http://192.168.15.8:8888/api/players

# RCON (backup)
RCON_HOST=201.93.248.252
RCON_PORT=25575
RCON_PASSWORD=admin
EOF
```

> **IMPORTANTE**: Troque `192.168.15.8` pelo IP do seu PC Windows!

### 4️⃣ Iniciar
```bash
npm run dev
```

### ✅ PRONTO!

Acesse: `http://localhost:3001`

---

## 🎯 Descobrir IP do Windows

No PowerShell:
```powershell
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"}).IPAddress
```

---

## 🔗 Links Úteis

- 📖 [Guia Completo](GUIA_COMPLETO_ZERO_AO_FIM.md)
- 🚀 [Instalação Automática](INSTALACAO_AUTOMATICA.md)  
- 🔧 [Corrigir Erro PlM](FIX_PLM_ERROR.md)
- ⚙️ [Gerenciamento de Usuários](USER_MANAGEMENT.md)
- 🗺️ [Sistema de Mapa Moderno](MAPA_MODERNO.md)

---

## 📊 Verificar se Está Funcionando

### No Windows:
```
http://localhost:8888/api/players
```

### No Linux (do portal):
```bash
curl http://192.168.15.8:8888/api/players
```

Deve retornar JSON com jogadores! 🎉

---

## 🛑 Parar o Tracker

- Se iniciou pelo atalho: aperte qualquer tecla na janela
- Ou force: `taskkill /F /IM python.exe`

---

**Última atualização**: 02/01/2026
