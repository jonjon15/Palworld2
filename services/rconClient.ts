import { Rcon } from 'rcon-client';

interface RconConfig {
  host: string;
  port: number;
  password: string;
}

class RconClient {
  private config: RconConfig;

  constructor() {
    const host = process.env.PALWORLD_RCON_HOST;
    const port = process.env.PALWORLD_RCON_PORT;
    const password = process.env.PALWORLD_RCON_PASSWORD;

    if (!host || !port || !password) {
      throw new Error('Missing required RCON environment variables');
    }

    this.config = {
      host,
      port: parseInt(port),
      password
    };
  }

  async executeCommand(command: string): Promise<string> {
    const rcon = await Rcon.connect({
      host: this.config.host,
      port: this.config.port,
      password: this.config.password,
      timeout: 10000 // 10 segundos de timeout (mais razoável)
    });

    try {
      const response = await rcon.send(command);
      return response;
    } finally {
      rcon.end();
    }
  }

  async getPlayersCoordinates(): Promise<any[]> {
    try {
      // Primeiro, obter lista de jogadores
      const showPlayersResponse = await this.executeCommand('ShowPlayers');
      
      // Parsear a resposta (formato: name,playeruid,steamid)
      const lines = showPlayersResponse.trim().split('\n');
      if (lines.length < 2) return []; // Sem jogadores ou erro
      
      const players: any[] = [];
      
      // Pular header e processar cada linha
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 3) {
          const name = parts[0].trim();
          const playerUid = parts[1].trim();
          const steamId = parts[2].trim();
          
          // Como o Palworld vanilla não suporta comandos para coordenadas,
          // retornamos array vazio para usar API REST
          // Se o servidor tiver mods, pode ser implementado aqui
        }
      }
      
      return players; // Sempre vazio por enquanto
    } catch (error) {
      console.error('Erro ao buscar coordenadas via RCON:', error);
      return [];
    }
  }

  async spawnPal(palId: string, quantity: number, x: number, y: number, z: number): Promise<string> {
    const command = `/SpawnPal ${palId} ${quantity} ${x} ${y} ${z}`;
    return this.executeCommand(command);
  }
}

export const rconClient = new RconClient();
