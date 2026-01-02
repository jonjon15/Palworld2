# 🎮 Gerenciamento de Configurações do Servidor Palworld

## Visão Geral

O portal agora possui um **sistema completo de gerenciamento de configurações** que permite que administradores alterem as configurações do servidor Palworld em tempo real diretamente da interface do painel.

## 🎯 Funcionalidades Implementadas

### 1. **Dashboard de Configurações**
- **Localização**: `/stats` (página de estatísticas)
- **Acesso**: Apenas administradores (`role: 'admin'`)
- **Atualizações**: A cada 10 segundos (junto com as métricas)

### 2. **Configurações Editáveis**

As seguintes configurações podem ser modificadas:

| Configuração | Descrição | Tipo |
|---|---|---|
| **Difficulty** | Dificuldade geral do jogo | String |
| **ExpRate** | Multiplicador de experiência | Number |
| **PalSpawnNumRate** | Multiplicador de spawn de Pals | Number |
| **PalCaptureRate** | Taxa de captura de Pals | Number |
| **PlayerDamageRateAttack** | Dano do jogador | Number |
| **PalDamageRateAttack** | Dano dos Pals | Number |
| **bEnablePlayerToPlayerDamage** | PvP entre jogadores | Boolean |
| **bEnableFriendlyFire** | Dano entre aliados | Boolean |
| **DayTimeSpeedRate** | Velocidade do dia | Number |
| **NightTimeSpeedRate** | Velocidade da noite | Number |

### 3. **Sistema de Edição**

Cada configuração possui:
- ✅ **Leitura em tempo real** da API do servidor
- ✅ **Validação de tipos** (número, texto, booleano)
- ✅ **Comparação de valores** (detecta mudanças)
- ✅ **Salvamento seguro** com autenticação
- ✅ **Logs de auditoria** (registra quem alterou o quê e quando)

### 4. **Interface de Usuário**

```
┌─ Configurações (Editáveis) ─────────────────────────┐
│                                                      │
│  [Editando: ExpRate                             ]   │
│  [________________] (campo de entrada)             │
│  [  Salvar  ] [  Cancelar  ]                        │
│                                                      │
│  ┌─────────────┐ ┌──────────┐ ┌─────────┐         │
│  │ Difficulty  │ │ ExpRate  │ │ Pals    │         │
│  │    Easy     │ │   1.0x   │ │  1.0x   │         │
│  │ Click para  │ │ Click    │ │ Click   │         │
│  │   editar    │ │ para...  │ │ para... │         │
│  └─────────────┘ └──────────┘ └─────────┘         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## 📡 API de Atualização

### Endpoint

```
POST /api/server/update-setting
Content-Type: application/json
Authorization: Bearer {auth_token}

Body:
{
  "key": "ExpRate",
  "value": 2.0
}
```

### Resposta de Sucesso

```json
{
  "success": true,
  "message": "Configuração ExpRate alterada para 2",
  "data": {
    "key": "ExpRate",
    "value": 2
  }
}
```

### Resposta de Erro

```json
{
  "message": "Erro: Motivo do erro",
  "error": "Detalhes técnicos"
}
```

## 🔐 Segurança

### Autenticação
- ✅ Token Bearer obrigatório
- ✅ Validação de token (24 horas de validade)
- ✅ Verificação de role de admin

### Validação
- ✅ **Whitelist de configurações** - apenas chaves permitidas podem ser alteradas
- ✅ **Tipo de dados** - validação de tipo automática
- ✅ **Prevenção de injection** - sem injeção de SQL ou RCON

### Auditoria
- ✅ Registro de todas as alterações em `config_changes`
- ✅ Rastreamento: quem, o quê, quando
- ✅ Histórico completo disponível via API

## 💾 Persistência de Dados

### Armazenamento Local
```
/palworld-settings.json  ← Cache local das configurações
auth.db                  ← Banco de dados SQLite
├── users               ← Usuários do portal
└── config_changes      ← Histórico de alterações
```

## 🚀 Como Usar

### 1. Fazer Login
```bash
1. Acesse http://localhost:3000/login
2. Use suas credenciais (admin/palworld por padrão)
3. Clique em "Dashboard"
```

### 2. Acessar Configurações
```bash
1. No dashboard, clique em "📊 Estatísticas"
2. Role até a seção "⚙️ Configurações"
3. Se for admin, verá "Clique para editar" em cada config
```

### 3. Editar uma Configuração
```bash
1. Clique na configuração que deseja alterar
2. Uma caixa de edição aparecerá
3. Modifique o valor desejado
4. Clique em "Salvar" para confirmar
5. O portal atualiza automaticamente após 2 segundos
```

### Exemplo: Aumentar ExpRate

```
[ClIQUE]
ExpRate
1.0x

↓ (Abre modal de edição)

Editando: ExpRate
[____2.0____]
[ Salvar ] [ Cancelar ]

↓ (Clica em Salvar)

✅ ExpRate alterado com sucesso!

↓ (Atualiza automaticamente)

ExpRate
2.0x
```

## 🔧 Troubleshooting

### "Erro ao alterar configuração"

**Problema**: A API retorna erro ao tentar salvar

**Soluções**:
1. Verifique se você é administrador
2. Verifique se o valor é do tipo correto
3. Verifique se a chave está na whitelist
4. Verifique logs do servidor em `npm run dev`

### "Configuração não é alterada no servidor"

**Problema**: A config salva mas não afeta o jogo

**Soluções**:
1. Algumas configs requerem reinicialização do servidor
2. Verifique a documentação oficial do Palworld
3. Confirme que o valor está correto no `/stats`

### "Apenas admins podem alterar"

**Problema**: Recebe erro 403 ao tentar editar

**Solução**: Faça login com uma conta admin ou peça ao admin para promover sua conta.

## 📊 Logs de Auditoria

### Consultar histórico de alterações

```bash
# Via API (futura implementação)
GET /api/server/config-history

# Via banco de dados SQLite
sqlite3 auth.db
> SELECT * FROM config_changes;
```

## 🎮 Integração com Servidor Palworld

### Método de Sincronização

```
Portal Palworld
    ↓
/api/server/update-setting
    ↓
palworld-settings.json (cache local)
    ↓
RCON/REST API (futuro)
    ↓
Servidor Palworld
```

**Status Atual**:
- ✅ Salva em banco de dados local
- ⏳ Sincronização com servidor (RCON/REST API) em desenvolvimento

## 🚧 Funcionalidades Futuras

- [ ] Sincronização com servidor via RCON
- [ ] Rollback automático de alterações
- [ ] Programação de alterações (scheduled changes)
- [ ] Notificações push quando config muda
- [ ] Dashboard de histórico detalhado
- [ ] Presets de configuração (Easy, Normal, Hard, PvP)
- [ ] Backup automático de configurações

## 📝 Notas de Desenvolvimento

### Variáveis de Ambiente

```bash
# No .env.local, adicione se necessário:
PALWORLD_RCON_HOST=201.93.248.252
PALWORLD_RCON_PORT=25575
PALWORLD_RCON_PASSWORD=sua_senha_rcon
```

### Estrutura do Banco de Dados

```sql
CREATE TABLE config_changes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  config_key TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🎓 Exemplos

### Aumentar Taxa de XP para 2x
1. Acesse `/stats`
2. Clique em "ExpRate"
3. Digite `2` no campo
4. Clique em "Salvar"

### Ativar PvP
1. Acesse `/stats`
2. Clique em "bEnablePlayerToPlayerDamage"
3. Mude de `OFF` para `1` (ou `true`)
4. Clique em "Salvar"

### Diminuir Spawn de Pals para Mais Desafio
1. Acesse `/stats`
2. Clique em "PalSpawnNumRate"
3. Digite `0.5` para reduzir pela metade
4. Clique em "Salvar"

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique este documento
2. Consulte `USER_MANAGEMENT.md` para gerenciamento de usuários
3. Verifique `PALWORLD_REST_API.md` para detalhes da API

---

**Versão**: 1.0  
**Última Atualização**: 2024  
**Status**: ✅ Produção
