# Palworld Admin Panel

Painel web para administração de servidores Palworld com mapa interativo em tempo real.

## Funcionalidades

- 🗺️ **Mapa Interativo**: Canvas-based com clustering inteligente
- 👥 **Jogadores em Tempo Real**: Movimentação ao vivo via Socket.IO
- ⚙️ **Admin Tools**: Spawn de Pals, teleporte de jogadores
- 📊 **Clustering**: Agrupamento automático de jogadores próximos
- 🔄 **Auto-refresh**: Atualizações automáticas

## Instalação Local

1. Instalar dependências:
```bash
npm install
```

2. Configurar ambiente:
```bash
cp .env.example .env.local
```

**IMPORTANTE:** Edite `.env.local` com suas próprias credenciais:
```bash
# REST API do Palworld
PALWORLD_API_URL=http://seu-servidor:8212
PALWORLD_API_USERNAME=admin
PALWORLD_API_PASSWORD=sua_senha_segura

# RCON (opcional - para coordenadas em tempo real)
PALWORLD_RCON_HOST=seu-servidor
PALWORLD_RCON_PORT=25575
PALWORLD_RCON_PASSWORD=sua_senha_rcon

# Parsing de Saves (opcional - alternativa para coordenadas)
# Caminho para a pasta Saved/SaveGames do servidor Palworld
PALWORLD_SAVE_PATH=/caminho/para/servidor/Pal/Saved/SaveGames
```

3. Rodar desenvolvimento:
```bash
npm run dev
```

Acesse http://localhost:3000
## 📍 Coordenadas dos Jogadores

O painel suporta múltiplas fontes para coordenadas:

1. **API REST** (padrão): Coordenadas aproximadas baseadas no último save
2. **RCON com Mods**: Coordenadas em tempo real (requer mods no servidor)
3. **Parsing de Saves**: Coordenadas do arquivo de save (mais preciso que API)

### Configuração para Coordenadas em Tempo Real

#### Opção 1: Mods RCON (Recomendado)
Instale mods como **Palworld RCON Enhanced** no seu servidor dedicado:
- Adiciona comandos como `PlayerInfo <SteamID>` que retornam X, Y, Z
- Coordenadas atualizam em tempo real

#### Opção 2: Parsing de Saves
Configure o caminho para os saves do servidor:
```bash
PALWORLD_SAVE_PATH=/caminho/para/servidor/Pal/Saved/SaveGames
```
- Lê coordenadas diretamente dos arquivos .sav
- Mais preciso que API REST, mas não em tempo real
- Atualiza quando o save é salvo

**Nota:** Sem mods ou parsing, as coordenadas são da API REST e podem não atualizar em tempo real.
## �️ Gerenciamento do Servidor

Para rodar o servidor em background (persistente):

### Usando o Script Automático

```bash
# Iniciar servidor em background
./server.sh start

# Verificar status
./server.sh status

# Ver logs em tempo real
./server.sh logs

# Parar servidor
./server.sh stop

# Reiniciar servidor
./server.sh restart
```

### Comandos Disponíveis

- `start` - Inicia o servidor em background
- `stop` - Para o servidor
- `restart` - Reinicia o servidor
- `status` - Mostra status atual
- `logs` - Exibe logs em tempo real

### Usando NPM Scripts

```bash
# Iniciar em background
npm run dev:bg

# Verificar status
npm run dev:status

# Parar servidor
npm run dev:stop

# Reiniciar
npm run dev:restart
```

**Nota:** O servidor roda na porta 3000 (ou 3001 se ocupada) e salva logs em `dev.log`.

## �🚀 Deploy Online

### Vercel (Recomendado)

1. **Instalar Vercel CLI:**
```bash
npm i -g vercel
```

2. **Fazer login:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel --prod
```

4. **Configurar variáveis de ambiente** no painel Vercel:
- `PALWORLD_API_URL`
- `PALWORLD_API_USERNAME`
- `PALWORLD_API_PASSWORD`

### Outras Opções

**Railway:**
```bash
railway login
railway link
railway up
```

**Netlify:**
```bash
npm i -g netlify-cli
netlify deploy --prod
```

## Tecnologias

- **Next.js 14** - Framework React
- **Socket.IO** - Tempo real
- **Canvas API** - Renderização do mapa
- **Tailwind CSS** - Estilização
- **TypeScript** - Tipagem

## API Endpoints

- `GET /api/players` - Lista jogadores
- `GET /api/server/info` - Info do servidor
- `POST /api/pals/spawn` - Spawn de Pals
- `WebSocket /api/socket` - Atualizações em tempo real

## Deploy Vercel

1. Push para GitHub
2. Import na Vercel
3. Configure variáveis de ambiente
4. Deploy!
