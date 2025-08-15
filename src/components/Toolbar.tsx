'use client';

import React from 'react';
import { 
  Undo, 
  Redo, 
  Plus, 
  Copy, 
  Trash2, 
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  HelpCircle,
  Grid3X3
} from 'lucide-react';

interface ToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  hasImage: boolean;
  hasSelectedLayer: boolean;
  showGrid: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onAddText: () => void;
  onDuplicateLayer: () => void;
  onDeleteLayer: () => void;
  onExport: () => void;
  onResetZoom: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleGrid: () => void;
  onResetDesign: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  canUndo,
  canRedo,
  hasImage,
  hasSelectedLayer,
  showGrid,
  onUndo,
  onRedo,
  onAddText,
  onDuplicateLayer,
  onDeleteLayer,
  onExport,
  onResetZoom,
  onZoomIn,
  onZoomOut,
  onToggleGrid,
  onResetDesign,
}) => {
  const [showShortcuts, setShowShortcuts] = React.useState(false);

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Left side - Main tools */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          {hasImage && (
            <button
              onClick={onAddText}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Add Text Layer"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          
          {hasSelectedLayer && (
            <>
              <button
                onClick={onDuplicateLayer}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Duplicate Layer (Ctrl+D)"
              >
                <Copy className="w-4 h-4" />
              </button>
              
              <button
                onClick={onDeleteLayer}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete Layer (Delete)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Center - Zoom controls */}
        {hasImage && (
          <div className="flex items-center space-x-2">
            <button
              onClick={onZoomOut}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <button
              onClick={onResetZoom}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              title="Reset Zoom"
            >
              100%
            </button>
            
            <button
              onClick={onZoomIn}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            
            <button
              onClick={onToggleGrid}
              className={`p-2 transition-colors ${
                showGrid 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Toggle Grid"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right side - Export, reset and help */}
        <div className="flex items-center space-x-2">
          {hasImage && (
            <>
              <button
                onClick={onExport}
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                title="Export Image"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
              
              <button
                onClick={onResetDesign}
                className="flex items-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                title="Reset Design"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </button>
            </>
          )}
          
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Keyboard Shortcuts"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Keyboard shortcuts panel */}
      {showShortcuts && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Keyboard Shortcuts</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Undo</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+Z</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Redo</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+Y</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delete Layer</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Delete</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duplicate Layer</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+D</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nudge Layer</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Arrow Keys</kbd>
                </div>
              </div>
            </div>
            <div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Zoom In</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">+</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Zoom Out</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">-</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reset Zoom</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">0</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Add Text</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Double-click</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Snap to Center</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Auto</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbar;