'use client';

import { useState } from 'react';

interface Player {
  name: string;
  userId: string;
  level?: number;
}

// Lista de itens comuns do Palworld
const COMMON_ITEMS = [
  { id: 'Sphere', name: 'Pal Sphere', category: 'Captura' },
  { id: 'MegaSphere', name: 'Mega Sphere', category: 'Captura' },
  { id: 'GigaSphere', name: 'Giga Sphere', category: 'Captura' },
  { id: 'UltraSphere', name: 'Ultra Sphere', category: 'Captura' },
  { id: 'Wood', name: 'Madeira', category: 'Recursos' },
  { id: 'Stone', name: 'Pedra', category: 'Recursos' },
  { id: 'Fiber', name: 'Fibra', category: 'Recursos' },
  { id: 'PalFluid', name: 'Fluido de Pal', category: 'Recursos' },
  { id: 'Ore', name: 'Minério', category: 'Recursos' },
  { id: 'Coal', name: 'Carvão', category: 'Recursos' },
  { id: 'IronOre', name: 'Minério de Ferro', category: 'Recursos' },
  { id: 'Sulfur', name: 'Enxofre', category: 'Recursos' },
  { id: 'Gunpowder', name: 'Pólvora', category: 'Crafting' },
  { id: 'CopperIngot', name: 'Lingote de Cobre', category: 'Crafting' },
  { id: 'IronIngot', name: 'Lingote de Ferro', category: 'Crafting' },
  { id: 'Cement', name: 'Cimento', category: 'Crafting' },
  { id: 'AssaultRifle', name: 'Rifle de Assalto', category: 'Armas' },
  { id: 'Shotgun', name: 'Escopeta', category: 'Armas' },
  { id: 'RocketLauncher', name: 'Lança-Foguetes', category: 'Armas' },
  { id: 'Handgun', name: 'Pistola', category: 'Armas' },
  { id: 'Bow', name: 'Arco', category: 'Armas' },
  { id: 'ArrowNormal', name: 'Flecha', category: 'Munição' },
  { id: 'Bullet', name: 'Bala', category: 'Munição' },
  { id: 'ShotgunShell', name: 'Cartucho de Escopeta', category: 'Munição' },
  { id: 'BerrySeeds', name: 'Sementes de Berry', category: 'Agricultura' },
  { id: 'WheatSeeds', name: 'Sementes de Trigo', category: 'Agricultura' },
];

const ITEM_CATEGORIES = Array.from(new Set(COMMON_ITEMS.map(i => i.category)));

export default function GiveItemsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [itemAmount, setItemAmount] = useState('1');
  const [customItemId, setCustomItemId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // Carregar jogadores
  const loadPlayers = async () => {
    try {
      const res = await fetch('/api/players');
      const data = await res.json();
      setPlayers(data || []);
    } catch (error) {
      console.error('Erro ao carregar jogadores:', error);
    }
  };

  // Dar item (via RCON se disponível)
  const giveItem = async () => {
    if (!selectedPlayer || (!selectedItem && !customItemId) || !itemAmount) {
      showMessage('Preencha todos os campos!', 'error');
      return;
    }

    setLoading(true);
    const itemId = customItemId || selectedItem;
    const amount = parseInt(itemAmount);

    try {
      const res = await fetch('/api/admin/give-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedPlayer,
          itemId,
          amount
        })
      });

      const data = await res.json();

      if (res.ok) {
        showMessage(`✅ ${amount}x ${itemId} enviado para ${players.find(p => p.userId === selectedPlayer)?.name}!`, 'success');
        setItemAmount('1');
      } else {
        showMessage(`❌ Erro: ${data.error}`, 'error');
      }
    } catch (error) {
      showMessage('❌ Erro ao enviar item. Verifique se RCON está habilitado.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const filteredItems = selectedCategory === 'all' 
    ? COMMON_ITEMS 
    : COMMON_ITEMS.filter(i => i.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">🎁 Dar Itens aos Jogadores</h1>
          <button
            onClick={loadPlayers}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            🔄 Atualizar Jogadores
          </button>
        </div>

        {/* Mensagem */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            messageType === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {message}
          </div>
        )}

        {/* Aviso */}
        <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4 mb-6">
          <h3 className="font-bold mb-2">⚠️ Requisitos:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>RCON deve estar habilitado no servidor</li>
            <li>Ou use um mod de servidor que suporte esta funcionalidade</li>
            <li>A REST API oficial NÃO suporta dar itens nativamente</li>
          </ul>
        </div>

        {/* Formulário */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-6">
          {/* Selecionar Jogador */}
          <div>
            <label className="block text-sm font-medium mb-2">
              👤 Selecionar Jogador
            </label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              onFocus={loadPlayers}
            >
              <option value="">-- Selecione um jogador --</option>
              {players.map((player) => (
                <option key={player.userId} value={player.userId}>
                  {player.name} {player.level ? `(Nv. ${player.level})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium mb-2">
              📦 Categoria
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as Categorias</option>
              {ITEM_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Selecionar Item */}
          <div>
            <label className="block text-sm font-medium mb-2">
              🎁 Selecionar Item
            </label>
            <select
              value={selectedItem}
              onChange={(e) => {
                setSelectedItem(e.target.value);
                setCustomItemId('');
              }}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={!!customItemId}
            >
              <option value="">-- Selecione um item --</option>
              {filteredItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.category})
                </option>
              ))}
            </select>
          </div>

          {/* OU Item Customizado */}
          <div>
            <label className="block text-sm font-medium mb-2">
              🔧 OU Digite o ID do Item Manualmente
            </label>
            <input
              type="text"
              value={customItemId}
              onChange={(e) => {
                setCustomItemId(e.target.value);
                setSelectedItem('');
              }}
              placeholder="Ex: Sphere, Wood, Stone..."
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={!!selectedItem}
            />
            <p className="text-xs text-gray-400 mt-1">
              Lista completa de IDs: <a href="https://palworld.fandom.com/wiki/Item_IDs" target="_blank" className="text-blue-400 hover:underline">Palworld Wiki</a>
            </p>
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-sm font-medium mb-2">
              🔢 Quantidade
            </label>
            <input
              type="number"
              min="1"
              max="9999"
              value={itemAmount}
              onChange={(e) => setItemAmount(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Botão Enviar */}
          <button
            onClick={giveItem}
            disabled={loading || !selectedPlayer || (!selectedItem && !customItemId)}
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold text-lg"
          >
            {loading ? '⏳ Enviando...' : '✅ Dar Item'}
          </button>
        </div>

        {/* Instruções */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">📚 Como Funciona</h3>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-bold text-blue-400 mb-1">Método 1: RCON (Recomendado)</h4>
              <p className="text-gray-300">
                Configure RCON no servidor Palworld. O comando será: <code className="bg-gray-700 px-2 py-1 rounded">GiveItem PlayerName ItemID Amount</code>
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-blue-400 mb-1">Método 2: Mod de Servidor</h4>
              <p className="text-gray-300">
                Instale um mod que adicione suporte a dar itens via API REST.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-blue-400 mb-1">Método 3: Edição Direta do Save</h4>
              <p className="text-gray-300">
                Para servidores offline, você pode editar o arquivo de save diretamente usando ferramentas de terceiros.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
