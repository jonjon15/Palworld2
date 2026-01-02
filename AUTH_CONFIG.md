# Configurações de Autenticação - Palworld Admin Panel

## Credenciais Padrão

**Usuário:** admin  
**Senha:** palworld

## Como Adicionar Novos Usuários

Edite o arquivo `app/api/auth/login/route.ts` e adicione novos usuários no objeto `USERS`:

```typescript
const USERS = {
  admin: 'palworld',
  usuario2: 'senha123',
  // Adicione mais usuários aqui
};
```

## Segurança

⚠️ **IMPORTANTE**: Esta é uma implementação básica para desenvolvimento. Para produção, você deve:

1. Usar variáveis de ambiente (.env) para armazenar credenciais
2. Implementar hash de senhas (bcrypt)
3. Usar JWT (JSON Web Tokens) para autenticação
4. Adicionar rate limiting para prevenir ataques de força bruta
5. Implementar HTTPS
6. Adicionar autenticação de dois fatores (2FA)

## Expiração do Token

Os tokens expiram após 24 horas. Após esse período, o usuário precisará fazer login novamente.

## Alterando Credenciais Padrão

Para alterar as credenciais padrão, edite:
- `app/api/auth/login/route.ts` - objeto USERS
- `app/login/page.tsx` - texto informativo (opcional)
