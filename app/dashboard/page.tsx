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

      const data = await res.json();
      setServerInfo(data);
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

      const data = await res.json();
      setPlayers(data.players || []);
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
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Palworld Admin Panel</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/stats')}
              className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg transition"
            >
              📊 Estatísticas
            </button>
            {isAdmin && (
              <button
                onClick={() => router.push('/users')}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition"
              >
                👥 Gerenciar Usuários
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
            >
              Sair
            </button>
          </div>
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
            <h2 className="text-xl font-semibold mb-2 text-green-400">Jogadores Online</h2>
            <p className="text-3xl font-bold">{players.length}</p>
            <div className="mt-2 max-h-32 overflow-y-auto">
              {players.map((player, idx) => (
                <div key={idx} className="text-sm text-gray-400 py-1 border-b border-gray-700">
                  {player.name} (Nível {player.level})
                </div>
              ))}
            </div>
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

        {/* Portal Externo */}
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">🌐 Portal Externo</h2>
          <p className="text-gray-400 mb-4">Acesse funcionalidades adicionais do Palworld Portal</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="http://sukeserver.ddns.net:8080/Player"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500 p-4 rounded-lg transition text-center"
            >
              <div className="text-3xl mb-2">👤</div>
              <div className="font-semibold">Dados do Jogador</div>
              <div className="text-xs text-gray-400 mt-1">Estatísticas e progresso</div>
            </a>
            <a
              href="http://sukeserver.ddns.net:8080/InterativeMap"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600/20 hover:bg-green-600/30 border border-green-500 p-4 rounded-lg transition text-center"
            >
              <div className="text-3xl mb-2">🗺️</div>
              <div className="font-semibold">Mapa Interativo</div>
              <div className="text-xs text-gray-400 mt-1">Exploração avançada</div>
            </a>
            <a
              href="http://sukeserver.ddns.net:8080/MyServer"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500 p-4 rounded-lg transition text-center"
            >
              <div className="text-3xl mb-2">🖥️</div>
              <div className="font-semibold">Meus Servidores</div>
              <div className="text-xs text-gray-400 mt-1">Gerenciamento</div>
            </a>
          </div>
          <div className="mt-4 text-xs text-gray-500 text-center">
            * Requer login no portal externo
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
          position={summonPosition}
        />
      )}
    </main>
  );
}
