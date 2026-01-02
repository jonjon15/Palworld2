import { NextResponse } from 'next/server';
import { Rcon } from 'rcon-client';

export async function POST(request: Request) {
  try {
    const { userId, itemId, amount } = await request.json();

    if (!userId || !itemId || !amount) {
      return NextResponse.json(
        { error: 'Parâmetros faltando' },
        { status: 400 }
      );
    }

    // Tentar via RCON
    const rconHost = process.env.PALWORLD_RCON_HOST || process.env.RCON_HOST;
    const rconPort = parseInt(process.env.PALWORLD_RCON_PORT || process.env.RCON_PORT || '25575');
    const rconPassword = process.env.PALWORLD_RCON_PASSWORD || process.env.RCON_PASSWORD;

    if (!rconHost || !rconPassword) {
      return NextResponse.json(
        { 
          error: 'RCON não configurado',
          message: 'Configure as variáveis RCON_HOST, RCON_PORT e RCON_PASSWORD no .env.local'
        },
        { status: 503 }
      );
    }

    try {
      const rcon = await Rcon.connect({
        host: rconHost,
        port: rconPort,
        password: rconPassword,
      });

      // Comando para dar item
      // Formato: GiveItem <PlayerUID> <ItemID> <Amount>
      const command = `GiveItem ${userId} ${itemId} ${amount}`;
      const response = await rcon.send(command);
      
      await rcon.end();

      return NextResponse.json({
        success: true,
        message: `Item ${itemId} (${amount}x) enviado`,
        response: response
      });

    } catch (rconError: any) {
      console.error('Erro RCON:', rconError);
      
      return NextResponse.json(
        { 
          error: 'Erro ao conectar com RCON',
          message: rconError.message,
          details: 'Verifique se RCON está habilitado no servidor Palworld'
        },
        { status: 503 }
      );
    }

  } catch (error: any) {
    console.error('Erro ao dar item:', error);
    return NextResponse.json(
      { error: 'Erro interno', message: error.message },
      { status: 500 }
    );
  }
}
