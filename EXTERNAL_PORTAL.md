# Integração com Portal Externo - Palworld

## 🌐 Portal Externo: http://sukeserver.ddns.net:8080/

### Funcionalidades Integradas

#### 1. **Dados do Jogador** (`/Player`)
- Visualização de estatísticas
- Histórico de jogo
- Conquistas personalizadas
- Gerenciamento de pontuação

**API Endpoint:** `GET /api/external/player`
- Requer: Header `x-external-session` com cookie de sessão
- Retorna: Dados do jogador do portal externo

#### 2. **Mapa Interativo** (`/InterativeMap`)
- Exploração avançada do mapa
- Recursos visuais
- Localização de pontos de interesse

**API Endpoint:** `GET /api/external/map`
- Requer: Header `x-external-session` com cookie de sessão
- Retorna: URL e dados do mapa interativo

#### 3. **Meus Servidores** (`/MyServer`)
- Gerenciamento de servidores
- Moderação e monitoramento
- Configuração de eventos
- Relatórios e estatísticas

**API Endpoint:** `GET /api/external/server`
- Requer: Header `x-external-session` com cookie de sessão
- Retorna: Dados dos servidores gerenciados

### Autenticação no Portal Externo

**API Endpoint:** `POST /api/external/player`

**Requisição:**
```json
{
  "username": "seu_usuario",
  "password": "sua_senha"
}
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "session": {
    "cookies": "SESSION_COOKIE_STRING",
    "expiresAt": 1234567890
  }
}
```

### Como Usar no Dashboard

1. **Acesso Direto:**
   - No dashboard, há uma seção "Portal Externo"
   - Links diretos para as 3 funcionalidades principais
   - Abre em nova aba/janela

2. **Requisitos:**
   - Ter uma conta no portal externo
   - Fazer login no portal externo separadamente
   - Manter a sessão ativa

### Estrutura de Arquivos

```
app/api/external/
├── player/
│   └── route.ts          # Dados do jogador
├── map/
│   └── route.ts          # Mapa interativo
└── server/
    └── route.ts          # Gerenciamento de servidores

lib/
└── externalPortal.ts     # Configurações e tipos
```

### Configuração

Arquivo: [lib/externalPortal.ts](lib/externalPortal.ts)

```typescript
export const EXTERNAL_PORTAL_CONFIG = {
  baseUrl: 'http://sukeserver.ddns.net:8080',
  endpoints: {
    login: '/Account/Login',
    player: '/Player',
    map: '/InterativeMap',
    myServer: '/MyServer'
  },
  timeout: 10000
};
```

### Links Disponíveis no Dashboard

| Funcionalidade | URL | Descrição |
|---------------|-----|-----------|
| 👤 Dados do Jogador | `/Player` | Estatísticas e progresso |
| 🗺️ Mapa Interativo | `/InterativeMap` | Exploração avançada |
| 🖥️ Meus Servidores | `/MyServer` | Gerenciamento |

### Notas Importantes

⚠️ **Atenção:**
- As páginas do portal externo requerem login separado
- O sistema não compartilha sessões entre portais
- É necessário ter conta no portal externo: http://sukeserver.ddns.net:8080/Account/Register
- Os dados são carregados diretamente do portal externo

### Funcionalidades Futuras

Possíveis melhorias:
- [ ] SSO (Single Sign-On) entre portais
- [ ] Cache de dados do portal externo
- [ ] Sincronização automática de estatísticas
- [ ] Webhook para notificações
- [ ] Integração completa da API
- [ ] Iframe embarcado das páginas

### Troubleshooting

**Problema:** "Sessão não fornecida"
- **Solução:** Fazer login no portal externo primeiro

**Problema:** "Erro ao conectar com portal externo"
- **Solução:** Verificar se o portal está online e acessível

**Problema:** Página requer login
- **Solução:** Acessar diretamente pelo link e fazer login no portal externo
