'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import SpawnModal from '../components/SpawnModal';

const Map = dynamic(() => import('../components/Map'), { ssr: false });
const MapModern = dynamic(() => import('../components/MapModern'), { ssr: false });

interface ServerInfo {
  servername: string;
  version: string;
  description: string;
}

interface Player {
  name: string;
  playerId: string;
  userId: string;
  level: number;
  ping: number;
  location: {
    x: number;
    y: number;
  };
}

export default function Dashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isSpawnModalOpen, setIsSpawnModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [summonPosition, setSummonPosition] = useState<{ x: number; y: number } | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const router = useRouter();

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (data.valid) {
          setAuthenticated(true);
          setIsAdmin(data.user.role === 'admin');
        } else {
          localStorage.removeItem('auth_token');
          router.push('/login');
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const fetchServerInfo = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch('/api/server/info', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const response = await res.json();
      if (response.success && response.data) {
        setServerInfo(response.data);
        setLastUpdate(new Date());
      } else {
        setServerInfo(null);
      }
    } catch (error) {
      console.error('Erro ao buscar informações do servidor:', error);
      setServerInfo(null);
    }
  };

  const fetchPlayers = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch('/api/players', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const response = await res.json();
      if (response.success && response.data) {
        setPlayers(response.data.players || []);
      } else {
        setPlayers([]);
      }
    } catch (error) {
      console.error('Erro ao buscar jogadores:', error);
      setPlayers([]);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchServerInfo();
      fetchPlayers();
      const interval = setInterval(() => {
        fetchServerInfo();
        fetchPlayers();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [authenticated]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/login');
  };

  const handleMapClick = (x: number, y: number) => {
    if (isAdmin) {
      setSummonPosition({ x, y });
      setIsSpawnModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <main className="bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">🎮 Painel de Administração</h1>
            {lastUpdate && (
              <p className="text-sm text-gray-400 mt-2">
                Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              fetchServerInfo();
              fetchPlayers();
            }}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
          >
            🔄 Atualizar
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-2 text-blue-400">Informações do Servidor</h2>
            {serverInfo ? (
              <div className="space-y-2">
                <p><span className="text-gray-400">Nome:</span> {serverInfo.servername}</p>
                <p><span className="text-gray-400">Versão:</span> {serverInfo.version}</p>
                <p><span className="text-gray-400">Descrição:</span> {serverInfo.description}</p>
              </div>
            ) : (
              <p className="text-gray-500">Carregando informações...</p>
            )}
          </div>

          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-2 text-green-400">👥 Jogadores Online</h2>
            <p className="text-3xl font-bold mb-3">{players.length}</p>
            {players.length > 0 ? (
              <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                {players.map((player, idx) => (
                  <div key={idx} className="bg-gray-700/50 px-3 py-2 rounded text-sm border-l-2 border-green-500">
                    <div className="font-semibold">{player.name}</div>
                    <div className="text-xs text-gray-400">
                      Nível {player.level} • Ping: {player.ping}ms
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Nenhum jogador online</p>
            )}
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-purple-400">Mapa Interativo</h2>
          <div className="h-[600px] rounded-lg overflow-hidden">
            <MapModern 
              players={players} 
              onMapClick={isAdmin ? handleMapClick : undefined}
            />
          </div>
        </div>
      </div>

      {isAdmin && isSpawnModalOpen && summonPosition && (
        <SpawnModal
          isOpen={isSpawnModalOpen}
          onClose={() => {
            setIsSpawnModalOpen(false);
            setSummonPosition(null);
          }}
          initialPosition={summonPosition}
          onSpawn={(palId, quantity, x, y, z) => {
            console.log('Spawn Pal:', { palId, quantity, x, y, z });
            setIsSpawnModalOpen(false);
            setSummonPosition(null);
          }}
        />
      )}
    </main>
  );
}
