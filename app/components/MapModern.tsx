'use client';

import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

interface MapModernProps {
  players: Player[];
  onMapClick?: (x: number, y: number) => void;
  isAdmin?: boolean;
}

export default function MapModern({ players, onMapClick, isAdmin = false }: MapModernProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Configurações do mapa
  const MAP_WORLD_SIZE = 500000;
  const MAP_CENTER: [number, number] = [0, 0];

  // Função de conversão de coordenadas do jogo para Leaflet
  const gameToLeaflet = (x: number, y: number): [number, number] => {
    return [-y / 1000, x / 1000];
  };

  // Função de conversão de Leaflet para coordenadas do jogo
  const leafletToGame = (lat: number, lng: number): { x: number; y: number } => {
    return {
      x: lng * 1000,
      y: -lat * 1000
    };
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Criar mapa
    const map = L.map(mapContainerRef.current, {
      crs: L.CRS.Simple,
      center: MAP_CENTER,
      zoom: 3,
      minZoom: 2,
      maxZoom: 6,
      zoomControl: true,
      attributionControl: false
    });

    // Adicionar imagem de fundo
    const bounds: L.LatLngBoundsExpression = [[-250, -250], [250, 250]];
    L.imageOverlay('/map/palworld-map.png', bounds).addTo(map);
    
    // Fit bounds
    map.fitBounds(bounds);

    // Event listeners
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      const coords = leafletToGame(e.latlng.lat, e.latlng.lng);
      setMouseCoords(coords);
    });

    map.on('mouseout', () => {
      setMouseCoords(null);
    });

    if (onMapClick && isAdmin) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const coords = leafletToGame(e.latlng.lat, e.latlng.lng);
        onMapClick(coords.x, coords.y);
      });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Atualizar marcadores quando players mudam
  useEffect(() => {
    if (!mapRef.current) return;

    // Limpar marcadores antigos
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Filtrar jogadores
    const filteredPlayers = searchTerm
      ? players.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : players;

    // Adicionar novos marcadores
    filteredPlayers.forEach(player => {
      const pos = gameToLeaflet(player.location.x, player.location.y);

      // Criar ícone customizado
      const icon = L.divIcon({
        className: 'custom-player-marker',
        html: `
          <div class="player-marker">
            <div class="marker-dot"></div>
            <div class="marker-label">
              <div class="marker-name">${player.name}</div>
              <div class="marker-level">Nível ${player.level}</div>
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker(pos, { icon }).addTo(mapRef.current!);

      // Popup com informações
      marker.bindPopup(`
        <div class="player-popup">
          <div class="popup-name">${player.name}</div>
          <div class="popup-info">Nível ${player.level}</div>
          <div class="popup-info">Ping: ${player.ping}ms</div>
          <div class="popup-coords">
            X: ${player.location.x.toFixed(0)}, Y: ${player.location.y.toFixed(0)}
          </div>
        </div>
      `);

      markersRef.current.push(marker);
    });
  }, [players, searchTerm]);

  return (
    <div className="game-map">
      {/* Toggle Button */}
      <div 
        className={`toggle ${isPanelOpen ? 'active' : ''}`}
        onClick={() => setIsPanelOpen(!isPanelOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
        <p>Filtros</p>
      </div>

      {/* Botão de Refresh */}
      <button 
        onClick={async () => {
          const res = await fetch('/api/players');
          const data = await res.json();
          window.location.reload();
        }}
        style={{
          position: 'absolute',
          top: '30px',
          right: '30px',
          zIndex: 9999,
          backgroundColor: '#20597a',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          padding: '10px 15px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          transition: 'background-color 0.3s'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2a7aa8'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#20597a'}
      >
        🔄 Atualizar
      </button>

      {/* Painel Lateral */}
      <div className={`map-panel ${!isPanelOpen ? 'hidden' : ''}`}>
        <h1>Palworld <span>Admin</span></h1>
        
        {/* Indicadores */}
        <div className="indicators">
          <div className="item active">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2317f0ff'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E" alt="Players" width="32" height="32" />
            <div className="right">
              <div className="name">Jogadores</div>
              <div className="count">{players.length} online</div>
            </div>
          </div>
        </div>

        {/* Busca */}
        <h2>Buscar Jogador</h2>
        <div className="filters">
          <div className="search">
            <input 
              type="text" 
              placeholder="Digite o nome do jogador..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Lista de Jogadores */}
        <h2>Lista de Jogadores</h2>
        <div className="players-list">
          {players.filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(player => (
            <div key={player.playerId} className="player-item">
              <div className="player-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#17f0ff">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div className="player-details">
                <div className="player-name">{player.name}</div>
                <div className="player-stats">
                  <span>Nv. {player.level}</span>
                  <span>•</span>
                  <span>{player.ping}ms</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Container do Mapa */}
      <div className="map-container">
        <div ref={mapContainerRef} className="leaflet-map"></div>
        
        {/* Coordenadas do Mouse */}
        {mouseCoords && (
          <div className="eagle-tooltip">
            X: {mouseCoords.x.toFixed(0)}, Y: {mouseCoords.y.toFixed(0)}
          </div>
        )}
      </div>

      <style jsx>{`
        .game-map {
          display: flex;
          max-height: 100vh;
          min-height: 100vh;
          position: relative;
          background-color: #0b1d2c;
        }

        .toggle {
          position: absolute;
          top: 30px;
          left: 400px;
          width: 125px;
          height: 40px;
          background-color: #20597a;
          display: flex;
          align-items: center;
          cursor: pointer;
          z-index: 9999;
          border-radius: 5px;
          transition: left 0.3s;
        }

        .toggle.active {
          left: 10px;
        }

        .toggle svg {
          width: 40px;
          height: 40px;
          padding: 12px;
          transform: rotate(180deg);
        }

        .toggle.active svg {
          transform: rotate(0deg);
        }

        .toggle svg path {
          fill: #fff;
        }

        .toggle p {
          color: #fff;
          font-weight: 600;
        }

        .map-panel {
          background-color: #091825;
          color: #fff;
          max-width: 400px;
          min-width: 400px;
          max-height: 100vh;
          min-height: 100vh;
          overflow-y: scroll;
          overflow-x: hidden;
          padding: 3rem 0.5rem 0.5rem;
          position: relative;
          text-align: center;
        }

        .map-panel::-webkit-scrollbar {
          width: 5px;
        }

        .map-panel::-webkit-scrollbar-track {
          background-color: #0d2031;
        }

        .map-panel::-webkit-scrollbar-thumb {
          box-shadow: inset 0 0 6px #3989b8;
        }

        .map-panel.hidden {
          display: none;
        }

        .map-panel h1 {
          margin-bottom: 1.5rem;
          font-size: 1.8rem;
        }

        .map-panel h1 span {
          color: #17f0ff;
        }

        .map-panel h2 {
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          margin: 1rem 0 0.5rem;
          text-align: left;
        }

        .indicators {
          display: grid;
          gap: 0.7rem;
          grid-template-columns: repeat(2, 1fr);
          margin-bottom: 1rem;
          margin-top: 10px;
          text-align: left;
        }

        .indicators .item {
          display: flex;
          align-items: center;
          opacity: 0.5;
          cursor: pointer;
          color: #e5fbff;
        }

        .indicators .item.active {
          opacity: 1;
        }

        .indicators .item img {
          background-color: #0c2235;
          border-radius: 5px;
          margin-right: 10px;
          width: 32px;
          height: 32px;
          padding: 4px;
        }

        .indicators .item .right .name {
          font-size: 15px;
        }

        .indicators .item .right .count {
          font-size: 13px;
          color: #dadada;
        }

        .filters {
          padding-bottom: 0.5rem;
          padding-top: 0.5rem;
          width: 100%;
        }

        .filters .search {
          max-width: 100%;
          width: 100%;
        }

        .filters .search input {
          width: 100%;
          background-color: #0f2941;
          padding: 8px 10px;
          border: none;
          border-radius: 5px;
          color: #fff;
          font-size: 14px;
        }

        .filters .search input::placeholder {
          color: #e0e0e0;
        }

        .players-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .player-item {
          background-color: #051219;
          border: 2px solid transparent;
          border-radius: 5px;
          padding: 10px;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .player-item:hover {
          border-color: rgba(30, 118, 165, 0.341);
        }

        .player-avatar {
          width: 40px;
          height: 40px;
          background-color: #091825;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 10px;
        }

        .player-avatar svg {
          width: 24px;
          height: 24px;
        }

        .player-details {
          flex: 1;
          text-align: left;
        }

        .player-name {
          font-size: 15px;
          font-weight: 600;
          color: #e5fbff;
        }

        .player-stats {
          font-size: 13px;
          color: #dadada;
        }

        .player-stats span {
          margin-right: 5px;
        }

        .map-container {
          flex: 1;
          background-color: #102536;
          position: relative;
        }

        .leaflet-map {
          width: 100%;
          height: 100vh;
          background-color: #102536;
        }

        .eagle-tooltip {
          position: absolute;
          top: 10px;
          left: 10px;
          background-color: transparent;
          border: none;
          border-bottom: 2px solid #78ffff;
          color: #78ffff;
          font-size: 14.5px;
          font-weight: 500;
          padding: 2px;
          text-shadow: 0 0 2px #000, 0 0 2px #000, 0 0 2px #000;
          z-index: 1000;
        }

        :global(.custom-player-marker) {
          background: transparent !important;
          border: none !important;
        }

        :global(.player-marker) {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        :global(.marker-dot) {
          width: 12px;
          height: 12px;
          background-color: #17f0ff;
          border: 2px solid #fff;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(23, 240, 255, 0.8);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 8px rgba(23, 240, 255, 0.8);
          }
          50% {
            box-shadow: 0 0 16px rgba(23, 240, 255, 1);
          }
        }

        :global(.marker-label) {
          position: absolute;
          top: 20px;
          background-color: rgba(9, 24, 37, 0.95);
          border: 1px solid #2e5270;
          border-radius: 5px;
          padding: 4px 8px;
          white-space: nowrap;
          pointer-events: none;
          display: none;
        }

        :global(.player-marker:hover .marker-label) {
          display: block;
        }

        :global(.marker-name) {
          color: #17f0ff;
          font-size: 13px;
          font-weight: 600;
        }

        :global(.marker-level) {
          color: #dadada;
          font-size: 11px;
        }

        :global(.player-popup) {
          background-color: #091825;
          color: #fff;
          padding: 8px;
          border-radius: 5px;
        }

        :global(.popup-name) {
          font-size: 15px;
          font-weight: 600;
          color: #17f0ff;
          margin-bottom: 5px;
        }

        :global(.popup-info) {
          font-size: 13px;
          color: #e5fbff;
          margin: 2px 0;
        }

        :global(.popup-coords) {
          font-size: 12px;
          color: #dadada;
          margin-top: 5px;
          padding-top: 5px;
          border-top: 1px solid #2e5270;
        }

        :global(.leaflet-popup-content-wrapper) {
          background: #091825 !important;
          border: 1px solid #2e5270 !important;
          border-radius: 8px !important;
          box-shadow: 0 3px 14px rgba(0, 0, 0, 0.6) !important;
        }

        :global(.leaflet-popup-tip) {
          background: #091825 !important;
          border: 1px solid #2e5270 !important;
        }

        :global(.leaflet-container) {
          background-color: #102536 !important;
          outline: none;
        }

        @media (max-width: 1100px) {
          .map-panel {
            position: absolute;
            top: 0;
            left: 0;
            max-width: 100%;
            min-width: 100%;
            z-index: 1001;
            opacity: 0.99;
            padding-top: 5.5rem;
          }

          .map-panel.hidden {
            display: none;
          }

          .toggle {
            left: 10px !important;
            top: 80px;
            border-radius: 5px;
            z-index: 1051;
          }
        }
      `}</style>
    </div>
  );
}
