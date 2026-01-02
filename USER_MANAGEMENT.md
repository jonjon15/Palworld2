# Sistema de Gerenciamento de Usuários - Palworld Admin Panel

## ✅ Implementações Concluídas

### 1. Banco de Dados SQLite
- ✅ Banco de dados SQLite ([lib/database.ts](lib/database.ts))
- ✅ Tabela de usuários com campos: id, username, password, email, role, created_at, updated_at, active
- ✅ Índices otimizados para performance
- ✅ Soft delete (usuários marcados como inativos)

### 2. Criptografia de Senhas
- ✅ Senhas criptografadas com bcrypt (10 rounds)
- ✅ Verificação segura de senhas
- ✅ Não armazena senhas em texto plano

### 3. Sistema de Registro
- ✅ Página de registro: `/register`
- ✅ API de registro: `/api/auth/register`
- ✅ Validações:
  - Usuário mínimo 3 caracteres
  - Senha mínimo 6 caracteres
  - Email opcional
  - Verificação de usuário duplicado

### 4. Sistema de Login Melhorado
- ✅ Autenticação via banco de dados
- ✅ Tokens com ID do usuário
- ✅ Verificação de usuários ativos
- ✅ Link para criar conta

### 5. Gerenciamento de Usuários (Admin)
- ✅ Página administrativa: `/users`
- ✅ Funcionalidades:
  - Listar todos os usuários
  - Editar usuários (username, email, role, senha)
  - Deletar usuários (soft delete)
  - Proteção: apenas admins
  - Não permite deletar própria conta

## 🔐 Credenciais Padrão

**Usuário Admin:**
- Usuário: `admin`
- Senha: `palworld`
- Função: admin

## 📝 Como Usar

### Criar Novo Usuário
1. Acesse: http://localhost:3001/register
2. Preencha os dados (email é opcional)
3. Clique em "Criar Conta"
4. Faça login com as credenciais criadas

### Gerenciar Usuários (Admin)
1. Faça login como admin
2. No dashboard, clique em "👥 Gerenciar Usuários"
3. Ou acesse: http://localhost:3001/users
4. Funcionalidades disponíveis:
   - **Editar:** Clique em "Editar" para modificar dados
   - **Deletar:** Remove usuário (soft delete)
   - **Alterar senha:** Digite nova senha ao editar
   - **Alterar função:** Pode promover usuário para admin

### Estrutura de Funções
- **admin:** Acesso total, pode gerenciar usuários
- **user:** Acesso ao dashboard e funcionalidades básicas

## 🗄️ Estrutura do Banco de Dados

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  active INTEGER DEFAULT 1
);
```

## 📂 Arquivos Criados/Modificados

### Novos Arquivos
- `lib/database.ts` - Gerenciador do banco de dados
- `app/register/page.tsx` - Página de registro
- `app/users/page.tsx` - Página de gerenciamento de usuários
- `app/api/auth/register/route.ts` - API de registro
- `app/api/users/route.ts` - API de gerenciamento de usuários
- `data/users.db` - Banco de dados SQLite (ignorado no git)

### Arquivos Modificados
- `app/api/auth/login/route.ts` - Usa banco de dados
- `app/api/auth/verify/route.ts` - Verifica usuários no banco
- `app/login/page.tsx` - Link para registro
- `app/dashboard/page.tsx` - Botão de gerenciar usuários (admin)
- `.gitignore` - Ignora banco de dados

## 🔒 Segurança

### Implementado
✅ Senhas criptografadas (bcrypt)
✅ Tokens com validade de 24h
✅ Proteção de rotas admin
✅ Validação de dados de entrada
✅ Soft delete (dados não são perdidos)
✅ Proteção contra deleção própria conta

### Recomendações para Produção
- [ ] Usar JWT ao invés de tokens simples
- [ ] Implementar refresh tokens
- [ ] Adicionar rate limiting
- [ ] Usar HTTPS obrigatório
- [ ] Adicionar 2FA (autenticação de dois fatores)
- [ ] Mover credenciais para variáveis de ambiente
- [ ] Implementar logs de auditoria
- [ ] Adicionar recuperação de senha

## 📦 Dependências Instaladas

```json
{
  "dependencies": {
    "better-sqlite3": "Banco SQLite para Node.js",
    "bcryptjs": "Criptografia de senhas"
  },
  "devDependencies": {
    "@types/bcryptjs": "Tipos TypeScript para bcrypt"
  }
}
```

## 🚀 Iniciar o Sistema

```bash
# Iniciar servidor
./server.sh start

# Reiniciar servidor
./server.sh restart

# Parar servidor
./server.sh stop

# Ver status
./server.sh status
```

## 🔗 URLs Principais

- **Home:** http://localhost:3001/
- **Login:** http://localhost:3001/login
- **Registro:** http://localhost:3001/register
- **Dashboard:** http://localhost:3001/dashboard
- **Gerenciar Usuários (Admin):** http://localhost:3001/users

## 💾 Backup do Banco de Dados

O banco de dados está em: `data/users.db`

Para fazer backup:
```bash
cp data/users.db data/users.db.backup
```

Para restaurar:
```bash
cp data/users.db.backup data/users.db
```

## ⚠️ Observações

1. O banco de dados é criado automaticamente na primeira execução
2. O usuário admin é criado automaticamente se não existir
3. O banco não é commitado no git (está no .gitignore)
4. Senhas são criptografadas e não podem ser recuperadas (apenas resetadas)
5. Soft delete mantém os dados no banco, apenas marca como inativo
