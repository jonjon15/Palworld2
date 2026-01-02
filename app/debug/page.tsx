'use client';

import { useEffect, useState } from 'react';

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

export default function DebugPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch('/api/players');
        const data = await res.json();
        console.log('Debug - API Response:', data);
        if (data.success) {
          setPlayers(data.data.players);
          console.log('Debug - Players loaded:', data.data.players.length);
        }
      } catch (err) {
        console.error('Debug - Failed to fetch players:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  if (loading) {
    return <div className="p-8">Carregando jogadores...</div>;
  }

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Debug - Jogadores no Servidor</h1>

      <div className="mb-4">
        <strong>Total de jogadores:</strong> {players.length}
      </div>

      {players.length === 0 ? (
          <div>
            <p className="text-red-400">Nenhum jogador encontrado! Verifique:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Se o servidor Palworld está rodando</li>
              <li>Se as variáveis de ambiente estão configuradas</li>
              <li>Se a API está acessível</li>
            </ul>
          </div>
      ) : (
        <div className="grid gap-4">
          {players.map((player) => (
            <div key={player.playerId} className="bg-gray-800 p-4 rounded">
              <h3 className="font-bold text-blue-400">{player.name}</h3>
              <p>ID: {player.playerId}</p>
              <p>Level: {player.level}</p>
              <p>Ping: {player.ping}ms</p>
              <p>Posição: X={player.location.x.toFixed(2)}, Y={player.location.y.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Console Logs:</h2>
        <p className="text-sm text-gray-400">
          Abra o Console do navegador (F12) para ver os logs detalhados de carregamento e coordenadas.
        </p>
      </div>
    </div>
  );
}