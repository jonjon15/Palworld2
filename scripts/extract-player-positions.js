#!/usr/bin/env node
/**
 * Script para extrair posições de jogadores dos arquivos de save do Palworld
 * Uso: node extract-player-positions.js
 */

const fs = require('fs');
const path = require('path');

// Configurações
const PALSERVER_PATH = process.env.PALSERVER_PATH || 'D:\\SteamLibrary\\steamapps\\common\\PalServer';
const SAVE_PATH = path.join(PALSERVER_PATH, 'Pal', 'Saved', 'SaveGames', '0');
const OUTPUT_FILE = process.env.OUTPUT_FILE || '/tmp/palworld_players.json';

/**
 * Busca o diretório do mundo (GUID)
 */
function findWorldDirectory() {
  try {
    if (!fs.existsSync(SAVE_PATH)) {
      console.error(`❌ Caminho não encontrado: ${SAVE_PATH}`);
      console.log('\n📝 Configure o caminho correto:');
      console.log('   export PALSERVER_PATH="D:\\SteamLibrary\\steamapps\\common\\PalServer"');
      return null;
    }

    const dirs = fs.readdirSync(SAVE_PATH, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    if (dirs.length === 0) {
      console.error('❌ Nenhum mundo encontrado em:', SAVE_PATH);
      return null;
    }

    // Pega o primeiro mundo (normalmente só tem um)
    const worldGuid = dirs[0];
    console.log(`✅ Mundo encontrado: ${worldGuid}`);
    return path.join(SAVE_PATH, worldGuid);
  } catch (error) {
    console.error('❌ Erro ao buscar diretório do mundo:', error.message);
    return null;
  }
}

/**
 * Lê o arquivo Level.sav e extrai dados básicos
 */
function readLevelSav(worldDir) {
  try {
    const levelSavPath = path.join(worldDir, 'Level.sav');
    
    if (!fs.existsSync(levelSavPath)) {
      console.error('❌ Level.sav não encontrado');
      return null;
    }

    const buffer = fs.readFileSync(levelSavPath);
    console.log(`📦 Level.sav carregado: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
    
    return buffer;
  } catch (error) {
    console.error('❌ Erro ao ler Level.sav:', error.message);
    return null;
  }
}

/**
 * Extrai players do diretório Players/
 */
function extractPlayersFromDirectory(worldDir) {
  const playersDir = path.join(worldDir, 'Players');
  
  if (!fs.existsSync(playersDir)) {
    console.error('❌ Diretório Players/ não encontrado');
    return [];
  }

  const playerFiles = fs.readdirSync(playersDir).filter(f => f.endsWith('.sav'));
  console.log(`👥 ${playerFiles.length} arquivos de jogadores encontrados`);

  const players = [];

  for (const file of playerFiles) {
    try {
      const playerPath = path.join(playersDir, file);
      const buffer = fs.readFileSync(playerPath);
      
      // Extrair userId do nome do arquivo
      const userId = path.basename(file, '.sav');
      
      // Tentar extrair nome do jogador (busca por strings legíveis)
      const playerName = extractPlayerName(buffer) || `Player_${userId.substring(0, 8)}`;
      
      // Tentar extrair posição (bytes específicos onde geralmente está)
      const position = extractPosition(buffer);
      
      players.push({
        userId,
        name: playerName,
        playerId: userId,
        level: extractLevel(buffer) || 1,
        position: position || { x: 0, y: 0, z: 0 },
        ping: 0,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error(`⚠️ Erro ao processar ${file}:`, error.message);
    }
  }

  return players;
}

/**
 * Extrai nome do jogador de um buffer
 */
function extractPlayerName(buffer) {
  const text = buffer.toString('utf8', 0, Math.min(buffer.length, 10000));
  
  // Procura por padrões comuns de nomes
  const nameMatch = text.match(/PlayerCharacter[^\x00]*?([A-Za-z0-9_]{3,20})/);
  if (nameMatch) {
    return nameMatch[1];
  }
  
  return null;
}

/**
 * Extrai nível do jogador
 */
function extractLevel(buffer) {
  // Palworld geralmente armazena level como int32
  // Procura em offsets comuns
  for (let offset = 0; offset < Math.min(buffer.length - 4, 5000); offset += 4) {
    const value = buffer.readInt32LE(offset);
    if (value >= 1 && value <= 50) {
      // Provavelmente é o level
      return value;
    }
  }
  return 1;
}

/**
 * Extrai posição X, Y, Z do buffer
 */
function extractPosition(buffer) {
  // Posições são geralmente float (4 bytes cada)
  // Procura por coordenadas válidas do Palworld
  
  for (let offset = 0; offset < Math.min(buffer.length - 12, 10000); offset += 4) {
    try {
      const x = buffer.readFloatLE(offset);
      const y = buffer.readFloatLE(offset + 4);
      const z = buffer.readFloatLE(offset + 8);
      
      // Validar se são coordenadas realistas do Palworld
      if (Math.abs(x) < 1000000 && Math.abs(y) < 1000000 && Math.abs(z) < 10000) {
        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
          return { x: Math.round(x), y: Math.round(y), z: Math.round(z) };
        }
      }
    } catch (e) {
      continue;
    }
  }
  
  return { x: 0, y: 0, z: 0 };
}

/**
 * Salva players no arquivo JSON
 */
function savePlayersToJson(players) {
  try {
    const json = JSON.stringify(players, null, 2);
    fs.writeFileSync(OUTPUT_FILE, json, 'utf8');
    console.log(`✅ Dados exportados para: ${OUTPUT_FILE}`);
    console.log(`📊 Total de jogadores: ${players.length}`);
  } catch (error) {
    console.error('❌ Erro ao salvar JSON:', error.message);
  }
}

/**
 * Main
 */
function main() {
  console.log('🎮 Palworld Player Position Extractor\n');
  console.log(`📁 Servidor: ${PALSERVER_PATH}`);
  console.log(`💾 Saves: ${SAVE_PATH}\n`);

  const worldDir = findWorldDirectory();
  if (!worldDir) {
    process.exit(1);
  }

  const players = extractPlayersFromDirectory(worldDir);
  
  if (players.length > 0) {
    savePlayersToJson(players);
    
    console.log('\n📍 Exemplos de posições:');
    players.slice(0, 3).forEach(p => {
      console.log(`   ${p.name}: X=${p.position.x}, Y=${p.position.y}, Z=${p.position.z}`);
    });
  } else {
    console.log('⚠️ Nenhum jogador encontrado');
  }
}

// Executar
main();
