'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { CanvasState, TextLayer, ExportOptions } from '@/types';
import { createDefaultTextLayer, getNextZIndex, normalizeZIndexes } from '@/lib/utils';
import ImageUpload from '@/components/ImageUpload';
import TextProperties from '@/components/TextProperties';
import LayersPanel from '@/components/LayersPanel';
import ExportPanel from '@/components/ExportPanel';
import HistoryIndicator from '@/components/HistoryIndicator';
import {
  Loader2
} from 'lucide-react';
import Toolbar from '@/components/Toolbar';

// Dynamically import Canvas component to avoid SSR issues with Konva.js
const Canvas = dynamic(() => import('@/components/Canvas'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  ),
});

export default function Home() {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    image: null,
    imageWidth: 0,
    imageHeight: 0,
    textLayers: [],
    selectedLayerId: null,
  });

  const [activeTab, setActiveTab] = useState<'upload' | 'properties' | 'layers' | 'export'>('upload');
  const [history, setHistory] = useState<CanvasState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);

  // Autosave functionality
  const AUTOSAVE_KEY = 'image-text-composer-design';
  const MAX_HISTORY_STEPS = 20;

  // Initialize history with initial state
  useEffect(() => {
    if (history.length === 0) {
      // Don't initialize with the initial state to prevent progress issues
      // The first action will create the first history entry
    }
  }, [canvasState, history.length]);

  // Debug: Monitor history changes
  useEffect(() => {
    console.log('History state changed:', {
      historyLength: history.length,
      historyIndex,
      canUndo: historyIndex > 0,
      canRedo: historyIndex < history.length - 1
    });
  }, [history, historyIndex]);

  // Load saved design on component mount
  useEffect(() => {
    try {
      const savedDesign = localStorage.getItem(AUTOSAVE_KEY);
      if (savedDesign) {
        const parsedDesign = JSON.parse(savedDesign);
        setCanvasState(parsedDesign);
        // Initialize history with the loaded state
        setHistory([parsedDesign]);
        setHistoryIndex(0);
      }
    } catch (error) {
      console.warn('Failed to load saved design:', error);
    }
  }, []);

  // Autosave design whenever canvas state changes
  useEffect(() => {
    if (canvasState.image) { // Only save if there's an image
      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(canvasState));
      } catch (error) {
        console.warn('Failed to save design:', error);
      }
    }
  }, [canvasState]);

  // Reset design function
  const handleResetDesign = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem(AUTOSAVE_KEY);
    
    // Reset to blank state
    const blankState: CanvasState = {
      image: null,
      imageWidth: 0,
      imageHeight: 0,
      textLayers: [],
      selectedLayerId: null,
    };
    
    setCanvasState(blankState);
    setHistory([blankState]);
    setHistoryIndex(0);
    setActiveTab('upload');
  }, []);

  // History management
  const addToHistory = useCallback((newState: CanvasState) => {
    setHistory(prevHistory => {
      setHistoryIndex(prevIndex => {
        // Remove any future history when adding a new state
        const newHistory = prevHistory.slice(0, prevIndex + 1);
        newHistory.push(newState);

        // Calculate the new index before limiting history
        let newIndex = newHistory.length - 1;

        // Limit history to MAX_HISTORY_STEPS
        if (newHistory.length > MAX_HISTORY_STEPS) {
          newHistory.shift(); // Remove oldest entry
          newIndex = MAX_HISTORY_STEPS - 1; // Adjust index after removing oldest
        }

        return newIndex;
      });

      // Calculate the new history array (same logic as above)
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      newHistory.push(newState);

      // Limit history to MAX_HISTORY_STEPS
      if (newHistory.length > MAX_HISTORY_STEPS) {
        newHistory.shift(); // Remove oldest entry
      }

      return newHistory;
    });
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCanvasState(history[newIndex]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCanvasState(history[newIndex]);
    }
  }, [history, historyIndex]);

  // Canvas state management
  const updateCanvas = useCallback((updates: Partial<CanvasState>) => {
    setCanvasState(prevState => {
      const newState = { ...prevState, ...updates };
      addToHistory(newState);
      return newState;
    });
  }, [addToHistory]);

  const handleImageUpload = useCallback((imageData: string, width: number, height: number) => {
    const newState: CanvasState = {
      image: imageData,
      imageWidth: width,
      imageHeight: height,
      textLayers: [],
      selectedLayerId: null,
    };

    // Reset history when uploading a new image (fresh start)
    setCanvasState(newState);
    setHistory([newState]);
    setHistoryIndex(0);
    setActiveTab('properties');
  }, []);

  const handleSelectLayer = useCallback((layerId: string | null) => {
    setCanvasState(prevState => {
      const newState = { ...prevState, selectedLayerId: layerId };
      addToHistory(newState);
      return newState;
    });
    if (layerId) {
      setActiveTab('properties');
    }
  }, [addToHistory]);

  const handleUpdateLayer = useCallback((updates: Partial<TextLayer>) => {
    setCanvasState(prevState => {
      if (!prevState.selectedLayerId) {
        return prevState;
      }

      console.log('Updating layer:', prevState.selectedLayerId);
      const updatedLayers = prevState.textLayers.map(layer =>
        layer.id === prevState.selectedLayerId ? { ...layer, ...updates } : layer
      );

      const newState = { ...prevState, textLayers: updatedLayers };
      console.log('New state:', newState);
      addToHistory(newState);
      return newState;
    });
  }, [addToHistory]);

  const handleDeleteLayer = useCallback((layerId: string) => {
    setCanvasState(prevState => {
      const updatedLayers = prevState.textLayers.filter(layer => layer.id !== layerId);
      const newSelectedLayerId = prevState.selectedLayerId === layerId ? null : prevState.selectedLayerId;
      
      // Normalize z-indexes after deletion
      const normalizedLayers = normalizeZIndexes(updatedLayers);
      
      const newState = { 
        ...prevState,
        textLayers: normalizedLayers,
        selectedLayerId: newSelectedLayerId
      };
      addToHistory(newState);
      return newState;
    });
  }, [addToHistory]);

  const handleDuplicateLayer = useCallback((layerId: string) => {
    setCanvasState(prevState => {
      const layer = prevState.textLayers.find(l => l.id === layerId);
      if (!layer) return prevState;

      const duplicatedLayer: TextLayer = {
        ...layer,
        id: Math.random().toString(36).substring(2, 11),
        x: layer.x + 20,
        y: layer.y + 20,
        zIndex: getNextZIndex(prevState.textLayers),
      };

      const updatedLayers = normalizeZIndexes([...prevState.textLayers, duplicatedLayer]);
      const newState = { ...prevState, textLayers: updatedLayers };
      addToHistory(newState);
      return newState;
    });
  }, [addToHistory]);

  const handleAddTextLayer = useCallback(() => {
    setCanvasState(prevState => {
      if (!prevState.image) return prevState;

      const newLayer = createDefaultTextLayer(
        prevState.imageWidth / 2 - 100,
        prevState.imageHeight / 2 - 25
      );
      newLayer.zIndex = getNextZIndex(prevState.textLayers);

      const updatedLayers = normalizeZIndexes([...prevState.textLayers, newLayer]);
      const newState = { 
        ...prevState,
        textLayers: updatedLayers,
        selectedLayerId: newLayer.id
      };
      addToHistory(newState);
      return newState;
    });
    setActiveTab('properties');
  }, [addToHistory]);

  // Export functionality
  const handleExport = useCallback(async (options: ExportOptions): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx || !canvasState.image) {
          reject(new Error('Failed to create canvas context'));
          return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          const scaledWidth = canvasState.imageWidth * options.scale;
          const scaledHeight = canvasState.imageHeight * options.scale;
          
          canvas.width = scaledWidth;
          canvas.height = scaledHeight;
          
          // Draw white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, scaledWidth, scaledHeight);
          
          // Draw image
          ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
          
          // Draw text layers in z-index order (same as Canvas component)
          const sortedLayers = [...canvasState.textLayers].sort((a, b) => a.zIndex - b.zIndex);

          sortedLayers.forEach(layer => {
            if (layer.opacity > 0 && layer.isVisible) {
              ctx.save();
              ctx.globalAlpha = layer.opacity;
              ctx.font = `${layer.fontWeight === 'bold' ? 'bold' : 'normal'} ${layer.fontSize * options.scale}px ${layer.fontFamily}`;
              ctx.fillStyle = layer.color;
              ctx.textAlign = layer.textAlign;
              ctx.textBaseline = 'alphabetic'; // Set consistent baseline

              // Apply rotation
              if (layer.rotation !== 0) {
                ctx.translate(layer.x * options.scale, layer.y * options.scale);
                ctx.rotate((layer.rotation * Math.PI) / 180);
                ctx.fillText(layer.text, 0, 0);
              } else {
                ctx.fillText(layer.text, layer.x * options.scale, layer.y * options.scale);
              }

              ctx.restore();
            }
          });
          
          const mimeType = options.format === 'jpg' ? 'image/jpeg' : 'image/png';
          const quality = options.format === 'jpg' ? options.quality : undefined;
          
          const dataUrl = canvas.toDataURL(mimeType, quality);
          resolve(dataUrl);
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = canvasState.image;
        
      } catch (error) {
        reject(error);
      }
    });
  }, [canvasState]);

  // Quick export function for toolbar
  const handleQuickExport = useCallback(async () => {
    if (!canvasState.image) return;

    try {
      const dataUrl = await handleExport({ format: 'png', quality: 1, scale: 1 });
      const filename = `image-text-composer-${Date.now()}.png`;

      // Download the image
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export image. Please try again.');
    }
  }, [canvasState.image, handleExport]);

  const selectedLayer = canvasState.selectedLayerId
    ? canvasState.textLayers.find(layer => layer.id === canvasState.selectedLayerId) || null
    : null;

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Keyboard event handling
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't handle keyboard events if user is typing in an input field
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          return;
        case 'y':
          e.preventDefault();
          redo();
          return;
        case 'd':
          e.preventDefault();
          if (canvasState.selectedLayerId) {
            handleDuplicateLayer(canvasState.selectedLayerId);
          }
          return;
      }
    }

    if (canvasState.selectedLayerId) {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteLayer(canvasState.selectedLayerId);
      }
    }

    // Zoom controls
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      setZoom(prev => Math.min(3, prev + 0.1));
    } else if (e.key === '-') {
      e.preventDefault();
      setZoom(prev => Math.max(0.1, prev - 0.1));
    } else if (e.key === '0') {
      e.preventDefault();
      setZoom(1);
    }
  }, [canvasState.selectedLayerId, undo, redo, handleDuplicateLayer, handleDeleteLayer]);

  // Add keyboard event listeners
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen main-bg-ocean">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AT</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Adomate Text Composer
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Toolbar
                canUndo={canUndo}
                canRedo={canRedo}
                hasImage={!!canvasState.image}
                hasSelectedLayer={!!canvasState.selectedLayerId}
                showGrid={showGrid}
                onUndo={undo}
                onRedo={redo}
                onAddText={handleAddTextLayer}
                onDuplicateLayer={() => canvasState.selectedLayerId && handleDuplicateLayer(canvasState.selectedLayerId)}
                onDeleteLayer={() => canvasState.selectedLayerId && handleDeleteLayer(canvasState.selectedLayerId)}
                onExport={handleQuickExport}
                onResetZoom={() => setZoom(1)}
                onZoomIn={() => setZoom(prev => Math.min(3, prev + 0.1))}
                onZoomOut={() => setZoom(prev => Math.max(0.1, prev - 0.1))}
                onToggleGrid={() => setShowGrid(prev => !prev)}
                onResetDesign={handleResetDesign}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar */}
        <div className="w-80 bg-white/90 backdrop-blur-sm border-r border-gray-200/50 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <div className="p-4 h-full overflow-y-auto">
              <div className="flex space-x-1 mb-4">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === 'upload'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Upload
                </button>
                <button
                  onClick={() => setActiveTab('layers')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === 'layers'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Layers
                </button>
                <button
                  onClick={() => setActiveTab('properties')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === 'properties'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Properties
                </button>
                <button
                  onClick={() => setActiveTab('export')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === 'export'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Export
                </button>
              </div>

              <div className="space-y-4">
                {activeTab === 'upload' && (
                  <div className="fade-in">
                    <ImageUpload onImageUpload={handleImageUpload} />
                  </div>
                )}
                {activeTab === 'layers' && (
                  <div className="fade-in">
                    <LayersPanel
                      layers={canvasState.textLayers}
                      selectedLayerId={canvasState.selectedLayerId}
                      onSelectLayer={handleSelectLayer}
                      onUpdateLayers={(layers) => {
                        // Ensure z-indexes are normalized when layers are updated
                        const normalizedLayers = normalizeZIndexes(layers);
                        setCanvasState(prevState => {
                          const newState = { ...prevState, textLayers: normalizedLayers };
                          addToHistory(newState);
                          return newState;
                        });
                      }}
                      onDeleteLayer={handleDeleteLayer}
                      onDuplicateLayer={handleDuplicateLayer}
                    />
                  </div>
                )}
                {activeTab === 'properties' && (
                  <div className="fade-in">
                    <TextProperties
                      selectedLayer={selectedLayer}
                      onUpdateLayer={handleUpdateLayer}
                      onDeleteLayer={() => selectedLayer && handleDeleteLayer(selectedLayer.id)}
                    />
                  </div>
                )}
                {activeTab === 'export' && (
                  <div className="fade-in">
                    <ExportPanel
                      canvasState={canvasState}
                      onExport={handleExport}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col bg-white/20 backdrop-blur-sm">
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="relative">
              <Canvas
                canvasState={canvasState}
                onUpdateCanvas={updateCanvas}
                onSelectLayer={handleSelectLayer}
                zoom={zoom}
                showGrid={showGrid}
              />
            </div>
          </div>
        </div>
      </div>

      {/* History Indicator */}
      <HistoryIndicator
        historyLength={history.length}
        currentIndex={historyIndex}
        maxSteps={MAX_HISTORY_STEPS}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
      />
    </div>
  );
}
