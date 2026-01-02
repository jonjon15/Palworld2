export interface ServerInfo {
  version: string;
  servername: string;
  description: string;
}

export interface PlayerLocation {
  x: number;
  y: number;
  z: number;
}

export interface Player {
  name: string;
  playerId: string;
  userId: string;
  ip: string;
  ping: number;
  location_x: number;
  location_y: number;
  level: number;
}

export interface PlayersResponse {
  players: Player[];
}

export interface SpawnRequest {
  palId: string;
  quantity: number;
  coordinates: {
    x: number;
    y: number;
    z: number;
  };
}
