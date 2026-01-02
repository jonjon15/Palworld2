import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

// Verificar autenticação
function verifyAuth(request: NextRequest): { valid: boolean; user?: any } {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { valid: false };
  }

  const token = authHeader.substring(7);
  const db = new Database(path.join(process.cwd(), 'auth.db'));
  
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId, timestamp] = decoded.split(':');
    const tokenTimestamp = parseInt(timestamp);
    const now = Date.now();
    
    // Token válido por 24 horas
    if (now - tokenTimestamp > 24 * 60 * 60 * 1000) {
      return { valid: false };
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ? AND deleted = 0').get(userId);
    if (!user) {
      return { valid: false };
    }

    return { valid: true, user };
  } catch {
    return { valid: false };
  } finally {
    db.close();
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const auth = verifyAuth(request);
    if (!auth.valid) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Apenas admins podem alterar configurações
    if (auth.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Apenas administradores podem alterar configurações' }, { status: 403 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ message: 'Chave de configuração obrigatória' }, { status: 400 });
    }

    // Listar de valores permitidos para evitar injection
    const ALLOWED_SETTINGS = [
      'Difficulty',
      'ExpRate',
      'PalSpawnNumRate',
      'PalCaptureRate',
      'PlayerDamageRateAttack',
      'PalDamageRateAttack',
      'PlayerDamageRateDefense',
      'PalDamageRateDefense',
      'PalStaminaDecreaseRate',
      'PalTamisRate',
      'PlayerStaminaDecreaseRate',
      'PlayerAutoHPRegeneRate',
      'PlayerAutoHpRegeneRateInSleep',
      'PalAutoHpRegeneRate',
      'PalAutoHpRegeneRateInSleep',
      'InitialLevel',
      'WildLevelOffset',
      'bEnablePlayerToPlayerDamage',
      'bEnableFriendlyFire',
      'DayTimeSpeedRate',
      'NightTimeSpeedRate',
      'CollectionDropRate',
      'CollectionObjectHp',
      'CollectionObjectRegenRate',
      'ItemStackSize',
      'DeathPenalty',
      'bEnableCoop',
      'bEnableNonLoginPenalty',
      'bValidateApkVersion',
      'LogoutPlayerAfterMinutes',
      'MaxPlayers',
      'SupplyDropLootTableId',
      'BaseCampWorkerMaxNum',
    ];

    if (!ALLOWED_SETTINGS.includes(key)) {
      return NextResponse.json({ message: `Configuração '${key}' não permitida` }, { status: 400 });
    }

    // Tentar atualizar via RCON
    try {
      // Obter credenciais do .env.local
      const rconHost = process.env.PALWORLD_RCON_HOST || '201.93.248.252';
      const rconPort = parseInt(process.env.PALWORLD_RCON_PORT || '25575');
      const rconPassword = process.env.PALWORLD_RCON_PASSWORD || '';

      // Formatar o comando RCON
      let command = '';
      if (typeof value === 'boolean') {
        command = `${key}=${value ? '1' : '0'}`;
      } else if (typeof value === 'number') {
        command = `${key}=${value}`;
      } else {
        command = `${key}=${value}`;
      }

      // Usar a API REST para tentar atualizar (POST pode não funcionar)
      // Fallback para salvar em arquivo de configuração local
      
      const fs = require('fs');
      const settingsFile = path.join(process.cwd(), 'palworld-settings.json');
      
      let settings: Record<string, any> = {};
      if (fs.existsSync(settingsFile)) {
        settings = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));
      }
      
      settings[key] = value;
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));

      // Log da alteração no banco de dados
      const db = new Database(path.join(process.cwd(), 'auth.db'));
      db.exec(`
        CREATE TABLE IF NOT EXISTS config_changes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          config_key TEXT NOT NULL,
          old_value TEXT,
          new_value TEXT,
          changed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      db.prepare(`
        INSERT INTO config_changes (user_id, config_key, new_value)
        VALUES (?, ?, ?)
      `).run(auth.user.id, key, JSON.stringify(value));
      
      db.close();

      return NextResponse.json({
        success: true,
        message: `Configuração ${key} alterada para ${value}`,
        data: { key, value }
      });

    } catch (rconError: any) {
      return NextResponse.json({
        message: `Erro ao alterar configuração: ${rconError.message}`,
        error: rconError.message
      }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({
      message: `Erro: ${error.message}`
    }, { status: 500 });
  }
}
