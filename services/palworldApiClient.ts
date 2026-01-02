import type { PlayersResponse, ServerInfo } from '@/types/palworld';

interface PalworldConfig {
  baseUrl: string;
  username: string;
  password: string;
}

class PalworldApiClient {
  private config: PalworldConfig;
  private authHeader: string;

  constructor() {
    const baseUrl = process.env.PALWORLD_API_URL;
    const username = process.env.PALWORLD_API_USERNAME;
    const password = process.env.PALWORLD_API_PASSWORD;

    if (!baseUrl || !username || !password) {
      throw new Error('Missing required environment variables for Palworld API');
    }

    this.config = { baseUrl, username, password };
    this.authHeader = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': this.authHeader,
        'Content-Type': 'application/json',
        'User-Agent': 'curl/8.5.0',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Palworld API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getServerInfo(): Promise<ServerInfo> {
    return this.request('/v1/api/info');
  }

  async getPlayers(): Promise<PlayersResponse> {
    return this.request('/v1/api/players');
  }

  async getSettings(): Promise<any> {
    return this.request('/v1/api/settings');
  }

  async getMetrics(): Promise<any> {
    return this.request('/v1/api/metrics');
  }

  async getSave(): Promise<any> {
    return this.request('/v1/api/save');
  }
}

export const palworldApi = new PalworldApiClient();
