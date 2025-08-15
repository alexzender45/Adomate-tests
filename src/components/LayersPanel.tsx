'use client';

import React, { useState } from 'react';
import { TextLayer } from '@/types';
import { reorderLayers, normalizeZIndexes } from '@/lib/utils';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  GripVertical, 
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Type
} from 'lucide-react';

interface LayersPanelProps {
  layers: TextLayer[];
  selectedLayerId: string | null;
  onSelectLayer: (layerId: string) => void;
  onUpdateLayers: (layers: TextLayer[]) => void;
  onDeleteLayer: (layerId: string) => void;
  onDuplicateLayer: (layerId: string) => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayers,
  onDeleteLayer,
  onDuplicateLayer,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newLayers = reorderLayers(layers, draggedIndex, index);
    onUpdateLayers(newLayers);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    // Ensure z-indexes are normalized after drag operations
    const normalizedLayers = normalizeZIndexes(layers);
    if (JSON.stringify(normalizedLayers.map(l => l.zIndex)) !== JSON.stringify(layers.map(l => l.zIndex))) {
      onUpdateLayers(normalizedLayers);
    }
  };

  const handleToggleVisibility = (layerId: string) => {
    const updatedLayers = layers.map(layer =>
      layer.id === layerId ? { ...layer, opacity: layer.opacity > 0 ? 0 : 1 } : layer
    );
    onUpdateLayers(updatedLayers);
  };

  const handleMoveLayer = (layerId: string, direction: 'up' | 'down') => {
    const currentIndex = layers.findIndex(layer => layer.id === layerId);
    if (currentIndex === -1) return;

    let newIndex: number;
    if (direction === 'up' && currentIndex < layers.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'down' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else {
      return;
    }

    const newLayers = reorderLayers(layers, currentIndex, newIndex);
    onUpdateLayers(newLayers);
  };

  const handleDuplicateLayer = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    const duplicatedLayer: TextLayer = {
      ...layer,
      id: Math.random().toString(36).substr(2, 9),
      x: layer.x + 20,
      y: layer.y + 20,
      zIndex: Math.max(...layers.map(l => l.zIndex)) + 1,
    };

    const newLayers = [...layers, duplicatedLayer];
    // Normalize z-indexes after adding new layer
    const normalizedLayers = normalizeZIndexes(newLayers);
    onUpdateLayers(normalizedLayers);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Text Layers</h3>
        <div className="text-xs text-gray-500">
          {layers.length} layer{layers.length !== 1 ? 's' : ''}
        </div>
      </div>

      {layers.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Type className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">No text layers yet</p>
          <p className="text-xs text-gray-400 mt-1">Double-click on the canvas to add text</p>
        </div>
      ) : (
        <div className="space-y-2">
          {layers.map((layer, index) => (
            <div
              key={layer.id}
              className={`
                group relative bg-white border rounded-lg p-3 transition-all duration-200 cursor-pointer
                ${selectedLayerId === layer.id 
                  ? 'border-blue-500 shadow-glow bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-soft'
                }
              `}
              onClick={() => onSelectLayer(layer.id)}
            >
              {/* Layer Content */}
              <div className="flex items-center space-x-3">
                {/* Layer Icon */}
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                  ${selectedLayerId === layer.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {index + 1}
                </div>

                {/* Layer Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {layer.text || 'Empty text'}
                    </p>
                    <div className="text-xs text-gray-500">
                      {layer.fontSize}px
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {layer.fontFamily} • {layer.color}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateLayer(layer.id);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Duplicate layer"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteLayer(layer.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete layer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Move Up/Down Buttons */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveLayer(layer.id, 'up');
                    }}
                    disabled={index === 0}
                    className={`
                      p-1 rounded text-xs transition-colors
                      ${index === 0 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                      }
                    `}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveLayer(layer.id, 'down');
                    }}
                    disabled={index === layers.length - 1}
                    className={`
                      p-1 rounded text-xs transition-colors
                      ${index === layers.length - 1 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                      }
                    `}
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Layer Tips */}
      {layers.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <h4 className="text-xs font-medium text-gray-700 mb-2">💡 Layer Tips:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Click to select • Drag to reorder • Hover for actions</li>
            <li>• Higher layers appear on top • Use arrow keys to nudge</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default LayersPanel; 