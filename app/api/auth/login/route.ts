import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Credenciais padrão (em produção, use variáveis de ambiente e hash de senhas)
const USERS = {
  admin: 'palworld',
  // Adicione mais usuários aqui
};

// Gerar um token simples (em produção, use JWT)
function generateToken(username: string): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(16).toString('hex');
  return Buffer.from(`${username}:${timestamp}:${random}`).toString('base64');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Usuário e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar credenciais
    if (USERS[username as keyof typeof USERS] === password) {
      const token = generateToken(username);
      
      return NextResponse.json({
        success: true,
        token,
        user: {
          username,
          role: username === 'admin' ? 'admin' : 'user'
        }
      });
    }

    return NextResponse.json(
      { message: 'Usuário ou senha incorretos' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { message: 'Erro no servidor' },
      { status: 500 }
    );
  }
}
