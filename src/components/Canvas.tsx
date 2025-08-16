'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CanvasState } from '@/types';
import { createDefaultTextLayer, getNextZIndex } from '@/lib/utils';

interface CanvasProps {
  canvasState: CanvasState;
  onUpdateCanvas: (updates: Partial<CanvasState>) => void;
  onSelectLayer: (layerId: string | null) => void;
  zoom?: number;
  showGrid?: boolean;
}

const Canvas: React.FC<CanvasProps> = ({ 
  canvasState, 
  onUpdateCanvas, 
  onSelectLayer, 
  zoom = 1,
  showGrid = false 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Load image when canvasState.image changes
  useEffect(() => {
    if (canvasState.image) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setImageElement(img);
      };
      img.src = canvasState.image;
    }
  }, [canvasState.image]);

  // Draw function
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageElement) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      
      const gridSize = 20 * zoom;
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // Draw text layers in z-index order
    const sortedLayers = [...canvasState.textLayers].sort((a, b) => a.zIndex - b.zIndex);
    
    sortedLayers.forEach(layer => {
      if (layer.opacity > 0 && layer.isVisible) {
        ctx.save();
        ctx.globalAlpha = layer.opacity;
        ctx.font = `${layer.fontWeight === 'bold' ? 'bold' : 'normal'} ${layer.fontSize * zoom}px ${layer.fontFamily}`;
        ctx.fillStyle = layer.color;
        ctx.textAlign = layer.textAlign;
        
        // Calculate text metrics for dynamic border sizing
        const textMetrics = ctx.measureText(layer.text);
        const textWidth = textMetrics.width;
        const textHeight = layer.fontSize * zoom;
        
        // Calculate text position based on alignment
        const textX = layer.x * zoom;
        const textY = layer.y * zoom;
        
        // Apply rotation
        if (layer.rotation !== 0) {
          ctx.translate(textX, textY);
          ctx.rotate((layer.rotation * Math.PI) / 180);
          ctx.fillText(layer.text, 0, 0);
        } else {
          ctx.fillText(layer.text, textX, textY);
        }
        
        // Draw selection border with dynamic sizing
        if (selectedId === layer.id) {
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]); // Dashed border
          
          // Add subtle animation to the border
          const time = Date.now() * 0.005;
          const dashOffset = Math.sin(time) * 5;
          ctx.lineDashOffset = dashOffset;
          
          // Calculate border dimensions based on text content and alignment
          let borderX, borderY, borderWidth, borderHeight;
          
          if (layer.rotation !== 0) {
            // For rotated text, use a larger border to accommodate rotation
            const maxDimension = Math.max(textWidth, textHeight);
            borderWidth = maxDimension + 20;
            borderHeight = maxDimension + 20;
            borderX = textX - borderWidth / 2;
            borderY = textY - borderHeight / 2;
          } else {
            // For non-rotated text, calculate precise border
            borderWidth = textWidth + 20;
            borderHeight = textHeight + 20;
            
            // Calculate border position based on text alignment
            if (layer.textAlign === 'left') {
              borderX = textX - 10;
            } else if (layer.textAlign === 'center') {
              borderX = textX - textWidth / 2 - 10;
            } else { // right
              borderX = textX - textWidth - 10;
            }
            borderY = textY - textHeight - 10;
          }
          
          ctx.strokeRect(borderX, borderY, borderWidth, borderHeight);
          ctx.setLineDash([]); // Reset line dash
          ctx.lineDashOffset = 0; // Reset dash offset
        }
        
        ctx.restore();
      }
    });
  }, [canvasState.textLayers, selectedId, imageElement, zoom, showGrid]);

  // Redraw canvas when dependencies change
  useEffect(() => {
    requestAnimationFrame(() => {
      drawCanvas();
    });
  }, [drawCanvas]);

  // Ensure canvas redraws when textLayers change
  useEffect(() => {
    requestAnimationFrame(() => {
      drawCanvas();
    });
  }, [canvasState.textLayers]);

  const snapToGrid = useCallback((value: number, gridSize: number = 20) => {
    return Math.round(value / gridSize) * gridSize;
  }, []);

  const snapToCenter = useCallback((x: number, y: number, imageWidth: number, imageHeight: number) => {
    const centerX = imageWidth / 2;
    const centerY = imageHeight / 2;
    const snapThreshold = 50; // pixels from center to snap
    
    let snappedX = x;
    let snappedY = y;
    
    // Snap to vertical center
    if (Math.abs(x - centerX) < snapThreshold) {
      snappedX = centerX;
    }
    
    // Snap to horizontal center
    if (Math.abs(y - centerY) < snapThreshold) {
      snappedY = centerY;
    }
    
    return { x: snappedX, y: snappedY };
  }, []);

  const nudgeLayer = useCallback((layerId: string, direction: 'up' | 'down' | 'left' | 'right', amount: number = 10) => {
    const layer = canvasState.textLayers.find(l => l.id === layerId);
    if (!layer) return;

    let newX = layer.x;
    let newY = layer.y;

    switch (direction) {
      case 'up':
        newY -= amount;
        break;
      case 'down':
        newY += amount;
        break;
      case 'left':
        newX -= amount;
        break;
      case 'right':
        newX += amount;
        break;
    }

    // Snap to grid if enabled
    if (showGrid) {
      newX = snapToGrid(newX);
      newY = snapToGrid(newY);
    }

    // Snap to center
    const snapped = snapToCenter(newX, newY, canvasState.imageWidth, canvasState.imageHeight);
    
    const updatedLayers = canvasState.textLayers.map(l =>
      l.id === layerId ? { ...l, x: snapped.x, y: snapped.y } : l
    );
    
    onUpdateCanvas({ textLayers: updatedLayers });
  }, [canvasState.textLayers, canvasState.imageWidth, canvasState.imageHeight, showGrid, snapToGrid, snapToCenter, onUpdateCanvas]);

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    return { x, y };
  }, [zoom]);

  const findLayerAtPosition = useCallback((x: number, y: number) => {
    // Find layer at position (highest z-index first)
    const sortedLayers = [...canvasState.textLayers].sort((a, b) => b.zIndex - a.zIndex);
    
    // Create a temporary canvas for text measurements
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    for (const layer of sortedLayers) {
      if (layer.opacity > 0 && layer.isVisible && tempCtx) {
        // Set up the font for measurement
        tempCtx.font = `${layer.fontWeight === 'bold' ? 'bold' : 'normal'} ${layer.fontSize}px ${layer.fontFamily}`;
        
        // Calculate actual text bounds
        const textMetrics = tempCtx.measureText(layer.text);
        const textWidth = textMetrics.width;
        const textHeight = layer.fontSize;
        
        // Calculate bounds based on text alignment
        let layerX, layerY, layerWidth, layerHeight;
        
        if (layer.textAlign === 'left') {
          layerX = layer.x;
          layerY = layer.y - textHeight; // Adjust for text baseline
          layerWidth = textWidth;
          layerHeight = textHeight;
        } else if (layer.textAlign === 'center') {
          layerX = layer.x - textWidth / 2;
          layerY = layer.y - textHeight; // Adjust for text baseline
          layerWidth = textWidth;
          layerHeight = textHeight;
        } else { // right
          layerX = layer.x - textWidth;
          layerY = layer.y - textHeight; // Adjust for text baseline
          layerWidth = textWidth;
          layerHeight = textHeight;
        }
        
        if (x >= layerX && x <= layerX + layerWidth && 
            y >= layerY && y <= layerY + layerHeight) {
          return layer;
        }
      }
    }
    return null;
  }, [canvasState.textLayers]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    // If currently editing, don't allow dragging
    if (editingLayerId) return;
    
    const pos = getMousePos(e);
    const layer = findLayerAtPosition(pos.x, pos.y);
    
    if (layer) {
      setSelectedId(layer.id);
      onSelectLayer(layer.id);
      setIsDragging(true);
      setDragStart(pos);
      setDragOffset({
        x: pos.x - layer.x,
        y: pos.y - layer.y
      });
    } else {
      setSelectedId(null);
      onSelectLayer(null);
    }
  }, [getMousePos, findLayerAtPosition, onSelectLayer, editingLayerId]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedId || editingLayerId) return;
    
    const pos = getMousePos(e);
    let newX = pos.x - dragOffset.x;
    let newY = pos.y - dragOffset.y;
    
    // Snap to grid if enabled
    if (showGrid) {
      newX = snapToGrid(newX);
      newY = snapToGrid(newY);
    }
    
    // Snap to center
    const snapped = snapToCenter(newX, newY, canvasState.imageWidth, canvasState.imageHeight);
    
    // Update the layer position immediately for smooth dragging
    const updatedLayers = canvasState.textLayers.map(layer =>
      layer.id === selectedId ? { ...layer, x: snapped.x, y: snapped.y } : layer
    );
    
    // Update canvas state immediately for smooth dragging
    onUpdateCanvas({ textLayers: updatedLayers });
  }, [isDragging, selectedId, getMousePos, dragOffset, showGrid, snapToGrid, snapToCenter, canvasState.imageWidth, canvasState.imageHeight, canvasState.textLayers, onUpdateCanvas, editingLayerId]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const layer = findLayerAtPosition(pos.x, pos.y);
    
    if (layer) {
      // Start editing existing layer
      setEditingLayerId(layer.id);
      setEditingText(layer.text);
      setSelectedId(layer.id);
      onSelectLayer(layer.id);
    } else if (canvasState.image) {
      // Create new layer
      let x = pos.x;
      let y = pos.y;
      
      // Snap to grid if enabled
      if (showGrid) {
        x = snapToGrid(x);
        y = snapToGrid(y);
      }
      
      const newLayer = createDefaultTextLayer(x, y);
      newLayer.zIndex = getNextZIndex(canvasState.textLayers);
      
      const updatedLayers = [...canvasState.textLayers, newLayer];
      onUpdateCanvas({ textLayers: updatedLayers });
      setSelectedId(newLayer.id);
      onSelectLayer(newLayer.id);
      
      // Start editing the new layer immediately
      setEditingLayerId(newLayer.id);
      setEditingText(newLayer.text);
    }
  }, [getMousePos, findLayerAtPosition, canvasState.image, canvasState.textLayers, showGrid, snapToGrid, onUpdateCanvas, onSelectLayer]);

  const handleTextEditSave = useCallback(() => {
    if (editingLayerId && editingText.trim() !== '') {
      // Create a temporary canvas to measure text dimensions
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        const layer = canvasState.textLayers.find(l => l.id === editingLayerId);
        if (layer) {
          tempCtx.font = `${layer.fontWeight === 'bold' ? 'bold' : 'normal'} ${layer.fontSize}px ${layer.fontFamily}`;
          const textMetrics = tempCtx.measureText(editingText);
          
          const updatedLayers = canvasState.textLayers.map(l =>
            l.id === editingLayerId ? { 
              ...l, 
              text: editingText,
              width: textMetrics.width,
              height: layer.fontSize
            } : l
          );
          onUpdateCanvas({ textLayers: updatedLayers });
        }
      }
    }
    setEditingLayerId(null);
    setEditingText('');
  }, [editingLayerId, editingText, canvasState.textLayers, onUpdateCanvas]);

  const handleTextEditCancel = useCallback(() => {
    setEditingLayerId(null);
    setEditingText('');
  }, []);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleTextEditCancel();
    }
  }, [handleTextEditCancel]);

  const handleTextEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextEditSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleTextEditCancel();
    }
  }, [handleTextEditSave, handleTextEditCancel]);

  // Add keyboard event listeners for nudging
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if editing text
      if (editingLayerId) return;
      
      // Don't handle if typing in input fields
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      if (selectedId) {
        let direction: 'up' | 'down' | 'left' | 'right' | null = null;
        let amount = 10;

        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            direction = 'up';
            break;
          case 'ArrowDown':
            e.preventDefault();
            direction = 'down';
            break;
          case 'ArrowLeft':
            e.preventDefault();
            direction = 'left';
            break;
          case 'ArrowRight':
            e.preventDefault();
            direction = 'right';
            break;
        }

        if (direction) {
          // Use larger amount for Shift key
          if (e.shiftKey) {
            amount = 50;
          }
          nudgeLayer(selectedId, direction, amount);
        }

        // Handle rotation shortcuts
        if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          const layer = canvasState.textLayers.find(l => l.id === selectedId);
          if (layer) {
            const rotationAmount = e.shiftKey ? 45 : 15; // 45° with Shift, 15° without
            const newRotation = (layer.rotation + rotationAmount) % 360;
            const updatedLayers = canvasState.textLayers.map(l =>
              l.id === selectedId ? { ...l, rotation: newRotation } : l
            );
            onUpdateCanvas({ textLayers: updatedLayers });
          }
        }

        // Handle rotation reset
        if (e.key === '0') {
          e.preventDefault();
          const updatedLayers = canvasState.textLayers.map(l =>
            l.id === selectedId ? { ...l, rotation: 0 } : l
          );
          onUpdateCanvas({ textLayers: updatedLayers });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, editingLayerId, nudgeLayer, canvasState.textLayers, onUpdateCanvas]);

  // Remove the conflicting keyboard event handler from Canvas
  // The main page will handle keyboard events

  const canvasWidth = canvasState.imageWidth * zoom;
  const canvasHeight = canvasState.imageHeight * zoom;

  if (!canvasState.image) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Upload an image to get started</p>
          <p className="text-sm text-gray-400">Double-click on the canvas to add text layers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Canvas Container with enhanced styling */}
      <div className="canvas-border rounded-lg shadow-soft bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="block cursor-crosshair smooth-transition"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            transition: 'transform 0.2s ease-out'
          }}
        />
      </div>

      {/* Zoom indicator */}
      {zoom !== 1 && (
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
          {Math.round(zoom * 100)}%
        </div>
      )}

      {/* Grid indicator */}
      {showGrid && (
        <div className="absolute top-2 left-2 bg-blue-500/80 text-white px-2 py-1 rounded text-xs font-medium">
          Grid On
        </div>
      )}

      {/* Inline Text Editor Modal */}
      {editingLayerId && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleOverlayClick}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl p-6 min-w-96 max-w-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Text</h3>
              <button
                onClick={handleTextEditCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <textarea
              ref={textAreaRef}
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              onKeyDown={handleTextEditKeyDown}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your text here..."
              autoFocus
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={handleTextEditCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTextEditSave}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 btn-hover"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions overlay when no image */}
      {!canvasState.image && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg max-w-md">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">📷</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload an Image</h3>
            <p className="text-gray-600 text-sm">
              Start by uploading a PNG image to begin composing your text overlay design.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas; 