import { NextRequest, NextResponse } from 'next/server';
import userDB from '@/lib/database';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, email } = body;

    // Validações
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Usuário e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { message: 'Usuário deve ter pelo menos 3 caracteres' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar se usuário já existe
    const existingUser = userDB.findByUsername(username);
    if (existingUser) {
      return NextResponse.json(
        { message: 'Usuário já existe' },
        { status: 409 }
      );
    }

    // Hash da senha
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Criar usuário
    const userId = userDB.createUser({
      username,
      password: hashedPassword,
      email: email || undefined,
      role: 'user'
    });

    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        id: userId,
        username,
        email
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { message: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
}
