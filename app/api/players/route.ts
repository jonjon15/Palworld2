import { NextResponse } from 'next/server';
import type { Player } from '@/types/palworld';
import { getPlayersWithFallback, getSourceStatus } from '@/services/playerLocationService';

export async function GET(request: Request) {
  try {
    // Obtém URL de query params
    const { searchParams } = new URL(request.url);
    const includeStatus = searchParams.get('status') === 'true';

    // Usa o novo serviço com fallback em cascata
    const players = await getPlayersWithFallback();

    // Formata resposta
    const response: any = {
      success: true,
      data: {
        players: players.map((p) => ({
          name: p.name,
          playerId: p.playerId,
          userId: p.userId,
          level: p.level,
          ping: p.ping,
          location: p.location,
        })),
        count: players.length,
        source: players.length > 0 ? players[0].source : null,
      },
    };

    // Inclui status de fontes se solicitado
    if (includeStatus) {
      response.debug = await getSourceStatus();
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erro ao buscar jogadores:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar jogadores',
        data: {
          players: [],
          count: 0,
        },
      },
      { status: 500 }
    );
  }
}
