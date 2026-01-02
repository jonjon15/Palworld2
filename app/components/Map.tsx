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
  server?: string;
  steamId?: string;
}

interface MapProps {
  players: Player[];
  onMapClick?: (x: number, y: number) => void;
  isAdmin?: boolean;
  selectedServerId?: string;
  onServerChange?: (serverId: string) => void;
}

// Configurações do mapa
const MAP_WORLD_SIZE = 500000; // -500k a +500k
const MAP_CANVAS_SIZE = 600; // Tamanho do container

export default function Map({ players, onMapClick, isAdmin = false }: MapProps) {
  const [mapImageLoaded, setMapImageLoaded] = useState(false);
  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number } | null>(null);

  // Função de conversão de coordenadas
  const worldToScreen = (worldX: number, worldY: number) => {
    const OFFSET_X = 357573;
    const OFFSET_Y = -268868;

    // X = horizontal, Y = vertical (invertido para corresponder ao mapa do jogo)
    const screenX = MAP_CANVAS_SIZE - ((worldX + MAP_WORLD_SIZE / 2 + OFFSET_X) / MAP_WORLD_SIZE) * MAP_CANVAS_SIZE;
    const screenY = MAP_CANVAS_SIZE - ((worldY + MAP_WORLD_SIZE / 2 + OFFSET_Y) / MAP_WORLD_SIZE) * MAP_CANVAS_SIZE;

    return {
      x: screenX,
      y: screenY
    };
  };

  const screenToWorld = (screenX: number, screenY: number) => {
    const OFFSET_X = 357574;
    const OFFSET_Y = -268868;
    
    const worldX = ((MAP_CANVAS_SIZE - screenX) / MAP_CANVAS_SIZE) * MAP_WORLD_SIZE - MAP_WORLD_SIZE/2 - OFFSET_X;
    const worldY = ((MAP_CANVAS_SIZE - screenY) / MAP_CANVAS_SIZE) * MAP_WORLD_SIZE - MAP_WORLD_SIZE/2 - OFFSET_Y;

    return { x: worldX, y: worldY };
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    
    const worldCoords = screenToWorld(screenX, screenY);
    setMouseCoords(worldCoords);
  };

  const handleMouseLeave = () => {
    setMouseCoords(null);
  };

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onMapClick || !isAdmin) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Converter de volta para coordenadas do mundo
    const OFFSET_X = -200000;
    const OFFSET_Y = 280000;
    
    const worldY = (clickX / MAP_CANVAS_SIZE) * MAP_WORLD_SIZE - MAP_WORLD_SIZE/2 - OFFSET_X;
    const worldX = ((MAP_CANVAS_SIZE - clickY) / MAP_CANVAS_SIZE) * MAP_WORLD_SIZE - MAP_WORLD_SIZE/2 - OFFSET_Y;

    onMapClick(worldX, worldY);
  };

  return (
    <div className="relative w-full h-[600px] bg-gray-800 rounded-lg border border-gray-700 overflow-hidden" style={{ backgroundImage: 'url(/map/palworld-map.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Área do mapa clicável */}
      <div
        className={`w-full h-full ${isAdmin ? 'cursor-crosshair' : 'cursor-default'}`}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />

      {/* Grade de referência */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Linhas verticais */}
        <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gray-600 opacity-30"></div>
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-600 opacity-50"></div>
        <div className="absolute left-3/4 top-0 bottom-0 w-px bg-gray-600 opacity-30"></div>

        {/* Linhas horizontais */}
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gray-600 opacity-30"></div>
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-600 opacity-50"></div>
        <div className="absolute top-3/4 left-0 right-0 h-px bg-gray-600 opacity-30"></div>
      </div>

      {/* Jogadores */}
      {players.map((player) => {
        const pos = worldToScreen(player.location.x, player.location.y);
        
        // Debug: mostrar coordenadas
        console.log(`Player: ${player.name}`);
        console.log(`World coords: X=${player.location.x}, Y=${player.location.y}`);
        console.log(`Screen coords: X=${pos.x}, Y=${pos.y}`);
        console.log(`Map offsets: OFFSET_X=${-200000}, OFFSET_Y=${280000}`);
        
        return (
          <div
            key={player.playerId}
            className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transform: 'translate(-50%, -50%)'
            }}
            title={`${player.name} (Nível ${player.level}) - Posição: (${player.location.x.toFixed(0)}, ${player.location.y.toFixed(0)})`}
          >
            {/* Nome do jogador */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {player.name}
            </div>
          </div>
        );
      })}

      {/* Coordenadas do mouse */}
      {mouseCoords && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white text-sm px-3 py-2 rounded">
          X: {mouseCoords.x.toFixed(0)}, Y: {mouseCoords.y.toFixed(0)}
        </div>
      )}

      {/* Controles */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition-colors"
          title="Zoom +"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>

        <button
          className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition-colors"
          title="Zoom -"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14"/>
          </svg>
        </button>
      </div>

      {/* Legenda */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white text-sm px-3 py-2 rounded">
        <div>Jogadores: {players.length}</div>
        <div className="text-xs text-gray-300 mt-1">
          {isAdmin ? 'Modo Admin: Clique para spawn' : 'Modo Visualização'}
        </div>
      </div>
    </div>
  );
}