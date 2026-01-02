import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'users.db');
const db = new Database(dbPath);

// Criar tabela de usuários se não existir
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    active INTEGER DEFAULT 1
  )
`);

// Criar índices
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_username ON users(username);
  CREATE INDEX IF NOT EXISTS idx_email ON users(email);
`);

export interface User {
  id?: number;
  username: string;
  password: string;
  email?: string;
  role?: 'admin' | 'user';
  created_at?: string;
  updated_at?: string;
  active?: number;
}

export interface UserPublic {
  id: number;
  username: string;
  email?: string;
  role: string;
  created_at: string;
  updated_at: string;
  active: number;
}

class UserDatabase {
  // Inicializar com usuário admin padrão
  initializeDefaultAdmin() {
    const existingAdmin = this.findByUsername('admin');
    if (!existingAdmin) {
      const hashedPassword = bcrypt.hashSync('palworld', 10);
      this.createUser({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@palworld.com',
        role: 'admin'
      });
      console.log('✅ Usuário admin padrão criado');
    }
  }

  // Criar usuário
  createUser(user: User): number {
    const stmt = db.prepare(`
      INSERT INTO users (username, password, email, role)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      user.username,
      user.password,
      user.email || null,
      user.role || 'user'
    );
    
    return result.lastInsertRowid as number;
  }

  // Buscar usuário por username
  findByUsername(username: string): UserPublic | null {
    const stmt = db.prepare(`
      SELECT id, username, password, email, role, created_at, updated_at, active
      FROM users
      WHERE username = ? AND active = 1
    `);
    
    return stmt.get(username) as UserPublic | null;
  }

  // Buscar usuário por ID
  findById(id: number): UserPublic | null {
    const stmt = db.prepare(`
      SELECT id, username, email, role, created_at, updated_at, active
      FROM users
      WHERE id = ? AND active = 1
    `);
    
    return stmt.get(id) as UserPublic | null;
  }

  // Verificar senha
  verifyPassword(username: string, password: string): boolean {
    const user = this.findByUsername(username);
    if (!user || !(user as any).password) return false;
    
    return bcrypt.compareSync(password, (user as any).password);
  }

  // Listar todos os usuários (sem senha)
  listUsers(): UserPublic[] {
    const stmt = db.prepare(`
      SELECT id, username, email, role, created_at, updated_at, active
      FROM users
      WHERE active = 1
      ORDER BY created_at DESC
    `);
    
    return stmt.all() as UserPublic[];
  }

  // Atualizar usuário
  updateUser(id: number, updates: Partial<User>): boolean {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.username) {
      fields.push('username = ?');
      values.push(updates.username);
    }
    if (updates.password) {
      fields.push('password = ?');
      values.push(updates.password);
    }
    if (updates.email !== undefined) {
      fields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.role) {
      fields.push('role = ?');
      values.push(updates.role);
    }

    if (fields.length === 0) return false;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    const result = stmt.run(...values);
    return result.changes > 0;
  }

  // Deletar usuário (soft delete)
  deleteUser(id: number): boolean {
    const stmt = db.prepare(`
      UPDATE users
      SET active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Contar usuários
  countUsers(): number {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM users
      WHERE active = 1
    `);

    const result = stmt.get() as { count: number };
    return result.count;
  }
}

// Criar instância única
const userDB = new UserDatabase();

// Inicializar admin padrão
userDB.initializeDefaultAdmin();

export default userDB;
