/**
 * Serviço de Localização de Jogadores
 * Sistema de Fallback em Cascata (Suke Model)
 *
 * Prioridade:
 * 1. MOD C++ (Arquivo JSON local - Ultra preciso)
 * 2. RCON (Comando ShowPlayers - Tempo real)
 * 3. REST API (API HTTP - Sempre disponível)
 */

import fs from 'fs';
import path from 'path';

// Tipos
export interface PlayerLocation {
  name: string;
  playerId: string;
  userId: string;
  level: number;
  ping: number;
  location: {
    x: number;
    y: number;
    z?: number;
  };
  timestamp: number;
  source: 'mod' | 'rcon' | 'api';
}

interface ModPlayerData {
  name: string;
  playerId: string;
  userId: string;
  level: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  timestamp?: number;
}

// Configurações
const MOD_JSON_PATH = process.env.MOD_JSON_PATH || '/tmp/palworld_players.json';
const RCON_HOST = process.env.RCON_HOST || 'localhost';
const RCON_PORT = parseInt(process.env.RCON_PORT || '25575', 10);
const RCON_PASSWORD = process.env.RCON_PASSWORD || 'admin';
const REST_API_URL = process.env.REST_API_URL || 'http://201.93.248.252:8212';
const REST_API_USER = process.env.REST_API_USER || 'admin';
const REST_API_PASS = process.env.REST_API_PASS || '060892';

// Cache para evitar requisições simultâneas
let lastFetchTime = 0;
let cachedPlayers: PlayerLocation[] = [];
const CACHE_TTL = 2000; // 2 segundos

/**
 * 1️⃣ Tenta obter dados do MOD C++ (arquivo JSON local)
 */
async function getPlayersFromMod(): Promise<PlayerLocation[] | null> {
  try {
    // Verifica se arquivo existe
    if (!fs.existsSync(MOD_JSON_PATH)) {
      console.log('[MOD] Arquivo não encontrado:', MOD_JSON_PATH);
      return null;
    }

    const data = fs.readFileSync(MOD_JSON_PATH, 'utf-8');
    const modData = JSON.parse(data) as ModPlayerData[];

    if (!Array.isArray(modData) || modData.length === 0) {
      console.log('[MOD] Nenhum jogador encontrado');
      return null;
    }

    console.log(`[MOD] ✅ Carregados ${modData.length} jogadores (ultra-preciso, 0ms delay)`);

    return modData.map((player) => ({
      name: player.name,
      playerId: player.playerId,
      userId: player.userId,
      level: player.level,
      ping: 0, // MOD não retorna ping
      location: {
        x: player.position.x,
        y: player.position.y,
        z: player.position.z,
      },
      timestamp: player.timestamp || Date.now(),
      source: 'mod',
    }));
  } catch (error) {
    console.log('[MOD] ❌ Erro:', (error as Error).message);
    return null;
  }
}

/**
 * 2️⃣ Tenta obter dados via RCON
 */
async function getPlayersFromRCON(): Promise<PlayerLocation[] | null> {
  try {
    // Importa rcon-client que já está no projeto
    const { rconClient } = await import('./rconClient');

    const showPlayersResponse = await rconClient.executeCommand('ShowPlayers');
    const lines = showPlayersResponse.trim().split('\n');

    if (lines.length <= 1) {
      console.log('[RCON] Nenhum jogador online');
      return null;
    }

    // Nota: RCON não retorna coordenadas por padrão
    // Isso seria ideal com um mod customizado que estenda ShowPlayers
    console.log(`[RCON] ⚠️ ${lines.length - 1} jogadores encontrados (sem coordenadas)`);

    // Por enquanto, retorna null para forçar fallback para API
    // Se tivesse coordenadas via RCON customizado, parsearia aqui
    return null;
  } catch (error) {
    console.log('[RCON] ❌ Não disponível:', (error as Error).message);
    return null;
  }
}

/**
 * 3️⃣ Fallback: Obter dados via REST API (sempre disponível)
 */
async function getPlayersFromRestAPI(): Promise<PlayerLocation[] | null> {
  try {
    const auth = Buffer.from(`${REST_API_USER}:${REST_API_PASS}`).toString('base64');
    const response = await fetch(`${REST_API_URL}/v1/api/players`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as any;

    if (!data.players || !Array.isArray(data.players)) {
      console.log('[API] Resposta inválida ou sem jogadores');
      return null;
    }

    console.log(`[API] ✅ Carregados ${data.players.length} jogadores (via REST API)`);

    return data.players.map((player: any) => ({
      name: player.name,
      playerId: player.playerId,
      userId: player.userId,
      level: player.level,
      ping: player.ping,
      location: {
        x: player.location_x,
        y: player.location_y,
      },
      timestamp: Date.now(),
      source: 'api',
    }));
  } catch (error) {
    console.log('[API] ❌ Erro:', (error as Error).message);
    return null;
  }
}

/**
 * 🎯 FUNÇÃO PRINCIPAL: Fallback em Cascata
 * Tenta MOD → RCON → REST API até conseguir dados
 */
export async function getPlayersWithFallback(): Promise<PlayerLocation[]> {
  // Verifica cache
  if (Date.now() - lastFetchTime < CACHE_TTL) {
    console.log('[CACHE] Usando dados em cache');
    return cachedPlayers;
  }

  console.log('\n📍 Iniciando busca de jogadores (sistema de fallback)...');

  // 1. Tenta MOD C++
  console.log('[1/3] Tentando MOD C++...');
  let players = await getPlayersFromMod();
  if (players) {
    lastFetchTime = Date.now();
    cachedPlayers = players;
    console.log('✅ Dados obtidos via MOD C++\n');
    return players;
  }

  // 2. Tenta RCON
  console.log('[2/3] Tentando RCON...');
  players = await getPlayersFromRCON();
  if (players) {
    lastFetchTime = Date.now();
    cachedPlayers = players;
    console.log('✅ Dados obtidos via RCON\n');
    return players;
  }

  // 3. Fallback para REST API
  console.log('[3/3] Tentando REST API...');
  players = await getPlayersFromRestAPI();
  if (players) {
    lastFetchTime = Date.now();
    cachedPlayers = players;
    console.log('✅ Dados obtidos via REST API\n');
    return players;
  }

  // Sem sucesso em nenhum método
  console.log('❌ Nenhuma fonte disponível!');
  return [];
}

/**
 * Obtém status das fontes de dados
 */
export async function getSourceStatus() {
  const status = {
    mod: {
      available: fs.existsSync(MOD_JSON_PATH),
      path: MOD_JSON_PATH,
    },
    rcon: {
      available: true, // Sempre tentamos, mas pode falhar
      host: RCON_HOST,
      port: RCON_PORT,
    },
    api: {
      available: true, // Sempre tentamos, mas pode falhar
      url: REST_API_URL,
    },
    lastFetch: lastFetchTime,
    cachedPlayers: cachedPlayers.length,
  };

  return status;
}
