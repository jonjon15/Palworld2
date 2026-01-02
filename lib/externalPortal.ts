// Configuração para integração com o portal externo
export const EXTERNAL_PORTAL_CONFIG = {
  baseUrl: 'http://sukeserver.ddns.net:8080',
  endpoints: {
    login: '/Account/Login',
    player: '/Player',
    map: '/InterativeMap',
    myServer: '/MyServer',
    register: '/Account/Register'
  },
  timeout: 10000
};

// Tipos para dados do portal externo
export interface ExternalPortalSession {
  cookies: string;
  expiresAt: number;
}

export interface ExternalPlayerData {
  name: string;
  level?: number;
  stats?: any;
  achievements?: any[];
}

export interface ExternalServerData {
  name: string;
  status: string;
  players: number;
  maxPlayers: number;
  uptime?: string;
}
