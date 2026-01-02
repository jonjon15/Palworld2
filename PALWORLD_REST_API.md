# REST API do Palworld - Documentação Completa

## ⚠️ RCON está DEPRECATED

A partir da versão 0.3+ do Palworld, o sistema RCON foi descontinuado e substituído pela **REST API HTTP**.

## 🌐 REST API Oficial

**Documentação:** https://docs.palworldgame.com/api/rest-api/palwold-rest-api/

### Configuração do Servidor

Edite o arquivo `PalWorldSettings.ini`:

```ini
RESTAPIEnabled=True
RESTAPIPort=8212
AdminPassword="sua_senha_segura_aqui"
```

###⚠️ Segurança

> **IMPORTANTE:** A REST API não foi projetada para exposição pública na Internet. Use apenas em LAN ou com VPN/túnel seguro para evitar acesso não autorizado.

## 🔐 Autenticação

- **Tipo:** HTTP Basic Authentication  
- **Username:** `admin` (padrão)
- **Password:** Configurada em `AdminPassword`
- **Header:** `Authorization: Basic <base64(admin:senha)>`

## 📡 Endpoints Disponíveis

### Base URL
```
http://seu-servidor:8212/v1/api
```

### 1. **GET /v1/api/info** - Informações do Servidor

Retorna informações gerais do servidor.

**Resposta:**
```json
{
  "version": "v0.2.0.0",
  "servername": "Nome do Servidor",
  "description": "Descrição do servidor"
}
```

**Exemplo cURL:**
```bash
curl -u admin:sua_senha http://localhost:8212/v1/api/info
```

---

### 2. **GET /v1/api/players** - Lista de Jogadores

Retorna todos os jogadores conectados.

**Resposta:**
```json
{
  "players": [
    {
      "userid": "steam_00000000000000000",
      "name": "NomeJogador",
      "playeruid": "...",
      "accountName": "..."
    }
  ]
}
```

**Campos:**
- `userid`: Steam ID do jogador
- `name`: Nome do personagem no jogo
- `playeruid`: ID único do jogador
- `accountName`: Nome da conta Steam

**Exemplo cURL:**
```bash
curl -u admin:sua_senha http://localhost:8212/v1/api/players
```

---

### 3. **GET /v1/api/metrics** - Métricas do Servidor

Retorna estatísticas de performance e estado do servidor.

**Resposta:**
```json
{
  "serverfps": 60,
  "currentplayernum": 5,
  "serverframetime": 16.67,
  "maxplayernum": 32,
  "uptime": 86400
}
```

**Campos:**
- `serverfps`: FPS atual do servidor
- `currentplayernum`: Número de jogadores conectados
- `serverframetime`: Tempo de frame em milissegundos
- `maxplayernum`: Número máximo de jogadores permitido
- `uptime`: Tempo online em segundos

**Exemplo cURL:**
```bash
curl -u admin:sua_senha http://localhost:8212/v1/api/metrics
```

---

### 4. **GET /v1/api/settings** - Configurações do Servidor

Retorna todas as configurações do servidor (PalWorldSettings).

**Resposta:** JSON com mais de 100 configurações incluindo:
- `Difficulty`: Dificuldade do jogo
- `DayTimeSpeedRate`, `NightTimeSpeedRate`: Velocidade dia/noite
- `ExpRate`: Taxa de experiência
- `PalCaptureRate`: Taxa de captura de Pals
- E muitos outros...

---

### 5. **POST /v1/api/announce** - Enviar Anúncio

Envia uma mensagem para todos os jogadores online.

**Body:**
```json
{
  "message": "Olá jogadores! Servidor será reiniciado em 10 minutos."
}
```

**Exemplo cURL:**
```bash
curl -X POST -u admin:sua_senha \
  -H "Content-Type: application/json" \
  -d '{"message": "Servidor será reiniciado!"}' \
  http://localhost:8212/v1/api/announce
```

---

### 6. **POST /v1/api/kick** - Expulsar Jogador

Expulsa um jogador do servidor.

**Body:**
```json
{
  "userid": "steam_00000000000000000",
  "message": "Você foi expulso do servidor."
}
```

**Exemplo cURL:**
```bash
curl -X POST -u admin:sua_senha \
  -H "Content-Type: application/json" \
  -d '{"userid": "steam_123", "message": "Kicked"}' \
  http://localhost:8212/v1/api/kick
```

---

### 7. **POST /v1/api/ban** - Banir Jogador

Bane permanentemente um jogador do servidor.

**Body:**
```json
{
  "userid": "steam_00000000000000000",
  "message": "Você foi banido."
}
```

---

### 8. **POST /v1/api/unban** - Desbanir Jogador

Remove o banimento de um jogador.

**Body:**
```json
{
  "userid": "steam_00000000000000000"
}
```

---

### 9. **POST /v1/api/save** - Salvar Mundo

Força o salvamento do estado atual do mundo.

**Exemplo cURL:**
```bash
curl -X POST -u admin:sua_senha http://localhost:8212/v1/api/save
```

---

### 10. **POST /v1/api/shutdown** - Desligar Servidor (Gradual)

Agenda o desligamento do servidor com aviso prévio.

**Body:**
```json
{
  "waittime": 60,
  "message": "Servidor será desligado em 60 segundos."
}
```

**Campos:**
- `waittime`: Tempo de espera em segundos
- `message`: Mensagem exibida aos jogadores

---

### 11. **POST /v1/api/stop** - Parar Servidor (Imediato)

Para o servidor imediatamente sem aviso.

**⚠️ Cuidado:** Não salva automaticamente antes de parar!

**Exemplo cURL:**
```bash
curl -X POST -u admin:sua_senha http://localhost:8212/v1/api/stop
```

---

## 🔧 Configuração no Projeto

### Variáveis de Ambiente

Crie/edite o arquivo `.env.local`:

```env
# REST API do Palworld (substitui RCON deprecated)
PALWORLD_API_URL=http://seu-servidor:8212
PALWORLD_API_USERNAME=admin
PALWORLD_API_PASSWORD=sua_senha_admin
```

### Arquivos do Projeto

- **[services/palworldAPI.ts](services/palworldAPI.ts)** - Cliente REST API completo
- **[services/palworldApiClient.ts](services/palworldApiClient.ts)** - Cliente simplificado
- **[services/rconClient.ts](services/rconClient.ts)** - ⚠️ DEPRECATED

## 📊 Dados Disponíveis vs Limitações

### ✅ Dados Disponíveis via REST API

- ✅ Informações do servidor (nome, versão, descrição)
- ✅ Lista de jogadores conectados (nome, Steam ID, UID)
- ✅ Métricas do servidor (FPS, uptime, jogadores)
- ✅ Configurações completas do servidor
- ✅ Comandos administrativos (kick, ban, save, shutdown)

### ❌ Dados NÃO Disponíveis (API v1)

- ❌ Coordenadas/localização dos jogadores em tempo real
- ❌ Nível do jogador
- ❌ Ping do jogador
- ❌ Inventário do jogador
- ❌ Pals do jogador
- ❌ Bases construídas

> **Nota:** Esses dados requerem parsing do save file ou mod de servidor com API estendida.

## 🐍 Biblioteca Python Oficial

Existe uma biblioteca Python para facilitar o uso:

```bash
pip install palworld-api
```

```python
import asyncio
from palworld_api import PalworldAPI

async def main():
    api = PalworldAPI("http://localhost:8212", "sua_senha")
    
    # Informações do servidor
    info = await api.get_server_info()
    print(f"Servidor: {info['servername']}")
    
    # Jogadores online
    players = await api.get_player_list()
    print(f"Jogadores: {len(players['players'])}")
    
    # Métricas
    metrics = await api.get_server_metrics()
    print(f"FPS: {metrics['serverfps']}")

asyncio.run(main())
```

## 🔍 Exemplos de Uso

### Verificar Status do Servidor

```typescript
import palworldAPI from '@/services/palworldAPI';

const isOnline = await palworldAPI.ping();
if (isOnline) {
  const info = await palworldAPI.getServerInfo();
  console.log(`Servidor: ${info.servername}`);
}
```

### Listar Jogadores Online

```typescript
const players = await palworldAPI.getPlayers();
console.log(`${players.length} jogadores online:`);
players.forEach(p => console.log(`- ${p.name}`));
```

### Enviar Anúncio

```typescript
await palworldAPI.announce('Bem-vindos ao servidor!');
```

### Obter Métricas

```typescript
const metrics = await palworldAPI.getMetrics();
console.log(`FPS: ${metrics.serverfps}`);
console.log(`Jogadores: ${metrics.currentplayernum}/${metrics.maxplayernum}`);
console.log(`Uptime: ${metrics.uptime}s`);
```

## 📝 Códigos de Status HTTP

- **200 OK** - Requisição bem-sucedida
- **400 Bad Request** - Dados inválidos no body
- **401 Unauthorized** - Autenticação falhou
- **500 Internal Server Error** - Erro no servidor

## 🔗 Links Úteis

- **Documentação Oficial:** https://docs.palworldgame.com/api/rest-api/palwold-rest-api/
- **GitHub da Biblioteca Python:** https://github.com/oliverrahner/palworld-api
- **Guia do Servidor:** https://docs.palworldgame.com/

## 🆚 Migração de RCON para REST API

| RCON Command | REST API Endpoint | Notas |
|--------------|-------------------|-------|
| `Info` | `GET /v1/api/info` | ✅ Melhor formatação |
| `ShowPlayers` | `GET /v1/api/players` | ✅ Retorna JSON estruturado |
| `Broadcast <msg>` | `POST /v1/api/announce` | ✅ Mesmo comportamento |
| `KickPlayer <id>` | `POST /v1/api/kick` | ✅ Requer Steam ID |
| `BanPlayer <id>` | `POST /v1/api/ban` | ✅ Requer Steam ID |
| `Save` | `POST /v1/api/save` | ✅ Mesmo comportamento |
| `Shutdown <time> <msg>` | `POST /v1/api/shutdown` | ✅ JSON ao invés de args |
| `DoExit` | `POST /v1/api/stop` | ✅ Mesmo comportamento |

## ✅ Vantagens da REST API

1. ✅ **JSON estruturado** - Não precisa fazer parsing de texto
2. ✅ **HTTP padrão** - Mais fácil de integrar
3. ✅ **Sem biblioteca RCON** - Apenas fetch/axios
4. ✅ **Métricas detalhadas** - FPS, uptime, etc
5. ✅ **Suporte oficial** - RCON está deprecated

## 🚀 Próximos Passos

Para obter dados mais avançados (coordenadas de jogadores, inventário, etc), você precisará:

1. **Parser de Save File** - Ler diretamente o arquivo de save
2. **Mod de Servidor** - Mod com API estendida
3. **Portal Externo** - Integração com portais de terceiros como o Suke

---

**Versão da API:** v1  
**Versão do Palworld:** 0.7.0+  
**Última Atualização:** Janeiro 2026
