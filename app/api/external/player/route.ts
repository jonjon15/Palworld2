import { NextRequest, NextResponse } from 'next/server';

const EXTERNAL_PORTAL_URL = 'http://sukeserver.ddns.net:8080';

// Fazer login no portal externo e obter sessão
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

    // Fazer login no portal externo
    const response = await fetch(`${EXTERNAL_PORTAL_URL}/Account/Login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: new URLSearchParams({
        username,
        password,
        rememberMe: 'false'
      }),
      redirect: 'manual'
    });

    // Capturar cookies de sessão
    const cookies = response.headers.get('set-cookie');
    
    if (response.status === 302 || response.status === 200) {
      return NextResponse.json({
        success: true,
        message: 'Login realizado com sucesso',
        session: {
          cookies: cookies || '',
          expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
        }
      });
    }

    return NextResponse.json(
      { message: 'Credenciais inválidas no portal externo' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Erro ao fazer login no portal externo:', error);
    return NextResponse.json(
      { message: 'Erro ao conectar com portal externo' },
      { status: 500 }
    );
  }
}

// Obter dados do jogador do portal externo
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.headers.get('x-external-session');

    if (!sessionCookie) {
      return NextResponse.json(
        { message: 'Sessão não fornecida' },
        { status: 401 }
      );
    }

    // Buscar dados do jogador
    const response = await fetch(`${EXTERNAL_PORTAL_URL}/Player`, {
      headers: {
        'Cookie': sessionCookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (response.status === 401 || response.status === 403) {
      return NextResponse.json(
        { message: 'Sessão expirada ou inválida' },
        { status: 401 }
      );
    }

    const html = await response.text();

    // Verificar se conseguiu acessar a página protegida
    if (html.includes('Login') && html.includes('Nome de Usuário')) {
      return NextResponse.json(
        { message: 'Sessão inválida, faça login novamente' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        hasAccess: true,
        pageContent: html.substring(0, 500) // Preview dos dados
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados do jogador:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar dados' },
      { status: 500 }
    );
  }
}
