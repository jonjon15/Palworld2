import { NextRequest, NextResponse } from 'next/server';
import userDB from '@/lib/database';
import crypto from 'crypto';

// Gerar um token simples (em produção, use JWT)
function generateToken(username: string, userId: number): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(16).toString('hex');
  return Buffer.from(`${userId}:${username}:${timestamp}:${random}`).toString('base64');
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

    // Verificar credenciais no banco de dados
    const isValid = userDB.verifyPassword(username, password);
    
    if (isValid) {
      const user = userDB.findByUsername(username);
      
      if (!user) {
        return NextResponse.json(
          { message: 'Erro ao buscar usuário' },
          { status: 500 }
        );
      }

      const token = generateToken(username, user.id);
      
      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
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
