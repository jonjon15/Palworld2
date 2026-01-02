/**
 * Cliente REST API do Palworld
 * 
 * A REST API substituiu o RCON deprecated a partir da versão 0.3+
 * Documentação: https://docs.palworldgame.com/api/rest-api/palwold-rest-api/
 * 
 * Porta padrão: 8212
 * Autenticação: HTTP Basic Auth
 */

interface PalworldAPIConfig {
  host: string;
  port: number;
  password: string;
  username?: string;
}

interface ServerInfo {
  version: string;
  servername: string;
  description: string;
}

interface Player {
  name: string;
  playerId: string;
  userId: string;
  accountName?: string;
}

interface ServerMetrics {
  serverfps: number;
  currentplayernum: number;
  serverframetime: number;
  maxplayernum: number;
  uptime: number;
}

class PalworldAPIClient {
  private config: PalworldAPIConfig;
  private baseUrl: string;
  private authHeader: string;

  constructor() {
    const host = process.env.PALWORLD_API_HOST || 'localhost';
    const port = process.env.PALWORLD_API_PORT || '8212';
    const password = process.env.PALWORLD_ADMIN_PASSWORD;
    const username = process.env.PALWORLD_API_USERNAME || 'admin';

    if (!password) {
      throw new Error('PALWORLD_ADMIN_PASSWORD environment variable is required');
    }

    this.config = {
      host,
      port: parseInt(port),
      password,
      username
    };

    this.baseUrl = `http://${this.config.host}:${this.config.port}/v1/api`;
    
    // Criar header de autenticação Basic
    const credentials = Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64');
    this.authHeader = `Basic ${credentials}`;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.authHeader,
        ...options.headers,
      },
      signal: AbortSignal.timeout(10000), // 10 segundos timeout
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * GET /v1/api/info - Obter informações do servidor
   */
  async getServerInfo(): Promise<ServerInfo> {
    return this.request<ServerInfo>('/info');
  }

  /**
   * GET /v1/api/players - Obter lista de jogadores online
   */
  async getPlayers(): Promise<Player[]> {
    const response = await this.request<{ players: any[] }>('/players');
    
    return response.players.map(p => ({
      name: p.name,
      playerId: p.playeruid || p.playerId,
      userId: p.userid || p.userId,
      accountName: p.accountName
    }));
  }

  /**
   * GET /v1/api/metrics - Obter métricas do servidor
   */
  async getMetrics(): Promise<ServerMetrics> {
    return this.request<ServerMetrics>('/metrics');
  }

  /**
   * GET /v1/api/settings - Obter configurações do servidor
   */
  async getSettings(): Promise<Record<string, any>> {
    return this.request<Record<string, any>>('/settings');
  }

  /**
   * POST /v1/api/announce - Enviar anúncio para todos os jogadores
   */
  async announce(message: string): Promise<void> {
    await this.request('/announce', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }

  /**
   * POST /v1/api/kick - Expulsar jogador
   */
  async kickPlayer(userId: string, message: string = 'You have been kicked'): Promise<void> {
    await this.request('/kick', {
      method: 'POST',
      body: JSON.stringify({ userid: userId, message })
    });
  }

  /**
   * POST /v1/api/ban - Banir jogador
   */
  async banPlayer(userId: string, message: string = 'You have been banned'): Promise<void> {
    await this.request('/ban', {
      method: 'POST',
      body: JSON.stringify({ userid: userId, message })
    });
  }

  /**
   * POST /v1/api/unban - Desbanir jogador
   */
  async unbanPlayer(userId: string): Promise<void> {
    await this.request('/unban', {
      method: 'POST',
      body: JSON.stringify({ userid: userId })
    });
  }

  /**
   * POST /v1/api/save - Salvar mundo
   */
  async saveWorld(): Promise<void> {
    await this.request('/save', {
      method: 'POST'
    });
  }

  /**
   * POST /v1/api/shutdown - Desligar servidor (gradual)
   */
  async shutdown(waitTime: number = 60, message: string = 'Server is shutting down'): Promise<void> {
    await this.request('/shutdown', {
      method: 'POST',
      body: JSON.stringify({ waittime: waitTime, message })
    });
  }

  /**
   * POST /v1/api/stop - Parar servidor (imediato)
   */
  async stop(): Promise<void> {
    await this.request('/stop', {
      method: 'POST'
    });
  }

  /**
   * Verificar se a API está acessível
   */
  async ping(): Promise<boolean> {
    try {
      await this.getServerInfo();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const palworldAPI = new PalworldAPIClient();
export default palworldAPI;
