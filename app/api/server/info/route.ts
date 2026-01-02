import { NextResponse } from 'next/server';
import { palworldApi } from '@/services/palworldApiClient';
import { rconClient } from '@/services/rconClient';

export async function GET() {
  try {
    // Primeiro verifica se o servidor está realmente rodando via RCON
    await rconClient.executeCommand('Info');
    
    // Se RCON funcionou, o servidor está rodando, então busca info via API
    const data = await palworldApi.getServerInfo();
    
    return NextResponse.json({
      success: true,
      data: {
        version: data.version,
        servername: data.servername,
        description: data.description
      }
    });
  } catch (error) {
    console.error('Error fetching server info:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server not running or not accessible' 
      },
      { status: 503 }
    );
  }
}
