'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ServerStats {
  info: {
    version: string;
    servername: string;
    description: string;
    worldguid: string;
  };
  metrics: {
    currentplayernum: number;
    serverfps: number;
    serverframetime: number;
    days: number;
    maxplayernum: number;
    uptime: number;
  };
  players: any[];
  settings: Record<string, any>;
}

interface EditingConfig {
  key: string;
  value: any;
  originalValue: any;
}

export default function ServerStatsPage() {
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingConfig, setEditingConfig] = useState<EditingConfig | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const router = useRouter();

  const fetchServerStats = async () => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // Verificar autenticação
      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.valid) {
        router.push('/login');
        return;
      }

      setIsAdmin(verifyData.user.role === 'admin');

      // Buscar dados do servidor Palworld
      const infoRes = await fetch('/api/server/info');
      const metricsRes = await fetch('/api/server/metrics');
      const playersRes = await fetch('/api/players');
      const settingsRes = await fetch('/api/server/settings');

      const infoData = await infoRes.json();
      const metricsData = await metricsRes.json();
      const playersData = await playersRes.json();
      const settingsData = await settingsRes.json();

      if (infoData.success && metricsData.success) {
        setStats({
          info: infoData.data,
          metrics: metricsData.data,
          players: playersData.data?.players || [],
          settings: settingsData.data || {}
        });
        setLastUpdate(new Date());
        setError('');
      } else {
        setError('Erro ao buscar dados do servidor');
      }
    } catch (err: any) {
      setError(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!editingConfig) return;

    setSavingConfig(true);
    try {
      const res = await fetch('/api/server/update-setting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          key: editingConfig.key,
          value: editingConfig.value
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(`✅ ${editingConfig.key} alterado com sucesso!`);
        setEditingConfig(null);
        setTimeout(() => {
          setSuccess('');
          fetchServerStats();
        }, 2000);
      } else {
        setError(data.message || 'Erro ao alterar configuração');
      }
    } catch (err: any) {
      setError(`Erro: ${err.message}`);
    } finally {
      setSavingConfig(false);
    }
  };

  useEffect(() => {
    fetchServerStats();
    // Atualizar a cada 10 segundos
    const interval = setInterval(fetchServerStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const IMPORTANT_CONFIGS = [
    'Difficulty',
    'ExpRate',
    'PalSpawnNumRate',
    'PalCaptureRate',
    'PlayerDamageRateAttack',
    'PalDamageRateAttack',
    'bEnablePlayerToPlayerDamage',
    'bEnableFriendlyFire',
    'DayTimeSpeedRate',
    'NightTimeSpeedRate'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Carregando estatísticas do servidor...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto pb-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">📊 Estatísticas do Servidor</h1>
              {lastUpdate && (
                <p className="text-gray-400 text-sm">
                  Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
                </p>
              )}
            </div>
            <button
              onClick={fetchServerStats}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
            >
              🔄 Atualizar
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {stats && (
          <>
            {/* Info do Servidor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-blue-400">🎮 Servidor</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">Nome</p>
                    <p className="text-xl font-semibold">{stats.info.servername}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Versão</p>
                    <p className="text-lg">{stats.info.version}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Descrição</p>
                    <p className="text-lg">{stats.info.description || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Métricas em Tempo Real */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-green-400">⚡ Performance</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">FPS do Servidor</span>
                    <span className={`text-lg font-bold ${stats.metrics.serverfps >= 50 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {stats.metrics.serverfps.toFixed(1)} FPS
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Frame Time</span>
                    <span className="text-lg">{stats.metrics.serverframetime.toFixed(2)} ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Uptime</span>
                    <span className="text-lg">{formatUptime(stats.metrics.uptime)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Jogadores */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
              <h2 className="text-2xl font-bold mb-4 text-purple-400">👥 Jogadores</h2>
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold">
                  {stats.metrics.currentplayernum}
                  <span className="text-gray-400 text-lg ml-2">/ {stats.metrics.maxplayernum}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Dias no Mundo</div>
                  <div className="text-2xl font-bold">{stats.metrics.days}</div>
                </div>
              </div>
              
              {/* Barra de progresso */}
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    stats.metrics.currentplayernum / stats.metrics.maxplayernum > 0.8
                      ? 'bg-red-500'
                      : stats.metrics.currentplayernum / stats.metrics.maxplayernum > 0.5
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{
                    width: `${(stats.metrics.currentplayernum / stats.metrics.maxplayernum) * 100}%`
                  }}
                />
              </div>

              {/* Lista de Jogadores */}
              {stats.players && stats.players.length > 0 ? (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-3">Jogadores Conectados</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {stats.players.map((player, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-700/50 p-3 rounded border border-gray-600 text-sm"
                      >
                        <p className="font-semibold">{player.name}</p>
                        <p className="text-gray-400 text-xs">ID: {player.userId || player.playerId}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 mt-4">Nenhum jogador conectado</p>
              )}
            </div>

            {/* Configurações Importantes */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 text-orange-400">⚙️ Configurações {isAdmin && '(Editáveis)'}</h2>
              
              {editingConfig && (
                <div className="mb-6 bg-blue-600/20 border border-blue-500 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Editando: {editingConfig.key}</h3>
                  <div className="space-y-3">
                    <input
                      type={typeof editingConfig.value === 'number' ? 'number' : 'text'}
                      value={editingConfig.value}
                      onChange={(e) => {
                        const newValue = typeof editingConfig.value === 'number' 
                          ? parseFloat(e.target.value) 
                          : e.target.value;
                        setEditingConfig({ ...editingConfig, value: newValue });
                      }}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveConfig}
                        disabled={savingConfig || editingConfig.value === editingConfig.originalValue}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-3 py-2 rounded transition"
                      >
                        {savingConfig ? 'Salvando...' : 'Salvar'}
                      </button>
                      <button
                        onClick={() => setEditingConfig(null)}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {stats.settings && IMPORTANT_CONFIGS.map(key => (
                  <div
                    key={key}
                    className={`p-3 rounded cursor-pointer transition ${
                      isAdmin
                        ? 'bg-gray-700/50 hover:bg-gray-700 border border-gray-600'
                        : 'bg-gray-700/50 border border-gray-600'
                    }`}
                    onClick={() => {
                      if (isAdmin) {
                        setEditingConfig({
                          key,
                          value: stats.settings[key],
                          originalValue: stats.settings[key]
                        });
                      }
                    }}
                  >
                    <p className="text-gray-400 text-sm">{key}</p>
                    <p className="font-semibold text-lg">
                      {typeof stats.settings[key] === 'boolean'
                        ? stats.settings[key] ? '✅ ON' : '❌ OFF'
                        : stats.settings[key]}
                    </p>
                    {isAdmin && <p className="text-xs text-blue-400 mt-1">Clique para editar</p>}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
