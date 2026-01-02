import { NextRequest, NextResponse } from 'next/server';

const EXTERNAL_PORTAL_URL = 'http://sukeserver.ddns.net:8080';

// Obter dados dos servidores
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.headers.get('x-external-session');

    if (!sessionCookie) {
      return NextResponse.json(
        { message: 'Sessão não fornecida' },
        { status: 401 }
      );
    }

    // Buscar dados dos servidores
    const response = await fetch(`${EXTERNAL_PORTAL_URL}/MyServer`, {
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
        serverUrl: `${EXTERNAL_PORTAL_URL}/MyServer`
      }
    });
  } catch (error) {
    console.error('Erro ao buscar servidores:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar servidores' },
      { status: 500 }
    );
  }
}
