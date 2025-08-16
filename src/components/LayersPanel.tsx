'use client';

import React, { useState } from 'react';
import { TextLayer } from '@/types';
import { reorderLayers, normalizeZIndexes } from '@/lib/utils';
import {
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Type,
  GripVertical
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
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (layerId: string) => {
    const originalIndex = layers.findIndex(l => l.id === layerId);
    setDraggedIndex(originalIndex);
  };

  const handleDragOver = (e: React.DragEvent, targetLayerId: string) => {
    e.preventDefault();
    const targetIndex = layers.findIndex(l => l.id === targetLayerId);
    setDragOverIndex(targetIndex);

    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newLayers = reorderLayers(layers, draggedIndex, targetIndex);
    onUpdateLayers(newLayers);
    setDraggedIndex(targetIndex);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    // Ensure z-indexes are normalized after drag operations
    const normalizedLayers = normalizeZIndexes(layers);
    if (JSON.stringify(normalizedLayers.map(l => l.zIndex)) !== JSON.stringify(layers.map(l => l.zIndex))) {
      onUpdateLayers(normalizedLayers);
    }
  };

  const handleToggleVisibility = (layerId: string) => {
    const updatedLayers = layers.map(layer =>
      layer.id === layerId ? { ...layer, isVisible: !layer.isVisible } : layer
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



  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Text Layers</h3>
          <p className="text-xs text-gray-500 mt-1">Drag to reorder • Higher numbers appear on top</p>
        </div>
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
          {/* Sort layers by z-index in descending order (topmost first) */}
          {[...layers].sort((a, b) => b.zIndex - a.zIndex).map((layer, index) => (
            <div
              key={layer.id}
              draggable
              onDragStart={() => handleDragStart(layer.id)}
              onDragOver={(e) => handleDragOver(e, layer.id)}
              onDragLeave={handleDragLeave}
              onDragEnd={handleDragEnd}
              className={`
                group relative bg-white border rounded-lg p-3 transition-all duration-200 cursor-pointer
                ${selectedLayerId === layer.id
                  ? 'border-blue-500 shadow-glow bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-soft'
                }
                ${draggedIndex === layers.findIndex(l => l.id === layer.id) ? 'opacity-50 scale-95' : ''}
                ${dragOverIndex === layers.findIndex(l => l.id === layer.id) && draggedIndex !== layers.findIndex(l => l.id === layer.id) ? 'border-green-400 bg-green-50' : ''}
              `}
              onClick={() => onSelectLayer(layer.id)}
            >
              {/* Layer Content */}
              <div className="flex items-center space-x-3">
                {/* Drag Handle */}
                <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors">
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Layer Icon */}
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                  ${selectedLayerId === layer.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {layers.length - index}
                </div>

                {/* Layer Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium truncate ${
                      layer.isVisible ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {layer.text || 'Empty text'}
                    </p>
                    <div className="text-xs text-gray-500">
                      {layer.fontSize}px
                    </div>
                  </div>
                  <p className={`text-xs truncate ${
                    layer.isVisible ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {layer.fontFamily} • {layer.color}
                    {!layer.isVisible && ' • Hidden'}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleVisibility(layer.id);
                    }}
                    className={`p-1 transition-colors ${
                      layer.isVisible 
                        ? 'text-gray-400 hover:text-gray-600' 
                        : 'text-red-400 hover:text-red-600'
                    }`}
                    title={layer.isVisible ? 'Hide layer' : 'Show layer'}
                  >
                    {layer.isVisible ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3" />
                    )}
                  </button>
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