import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { valid: false, message: 'Token não fornecido' },
        { status: 401 }
      );
    }

    // Decodificar e validar token (implementação simples)
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [username, timestamp] = decoded.split(':');
      
      // Verificar se o token não expirou (24 horas)
      const tokenAge = Date.now() - parseInt(timestamp);
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas
      
      if (tokenAge > maxAge) {
        return NextResponse.json(
          { valid: false, message: 'Token expirado' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        valid: true,
        user: {
          username,
          role: username === 'admin' ? 'admin' : 'user'
        }
      });
    } catch (error) {
      return NextResponse.json(
        { valid: false, message: 'Token inválido' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Erro na verificação:', error);
    return NextResponse.json(
      { valid: false, message: 'Erro no servidor' },
      { status: 500 }
    );
  }
}
