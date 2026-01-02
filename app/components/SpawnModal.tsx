'use client';

import { useState, useEffect } from 'react';

interface SpawnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpawn: (palId: string, quantity: number, x: number, y: number, z: number) => void;
  initialPosition?: { x: number; y: number } | null;
}

export default function SpawnModal({ isOpen, onClose, onSpawn, initialPosition }: SpawnModalProps) {
  const [palId, setPalId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [z, setZ] = useState(0);

  useEffect(() => {
    if (initialPosition) {
      setX(initialPosition.x);
      setY(initialPosition.y);
    }
  }, [initialPosition]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSpawn(palId, quantity, x, y, z);
    setPalId('');
    setQuantity(1);
    setX(0);
    setY(0);
    setZ(0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
        <h2 className="text-2xl font-bold mb-4">Spawn Pal</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Pal ID</label>
            <input
              type="text"
              value={palId}
              onChange={(e) => setPalId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Lamball"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Quantity (1-100)</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              min="1"
              max="100"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">X</label>
              <input
                type="number"
                value={x}
                onChange={(e) => setX(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly={!!initialPosition}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Y</label>
              <input
                type="number"
                value={y}
                onChange={(e) => setY(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly={!!initialPosition}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Z</label>
              <input
                type="number"
                value={z}
                onChange={(e) => setZ(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Spawn
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
