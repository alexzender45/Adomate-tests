'use client';

import React, { useState, useRef } from 'react';
import { CanvasState, ExportOptions } from '@/types';
import { downloadImage } from '@/lib/utils';
import { Download, Settings, Image as ImageIcon } from 'lucide-react';

interface ExportPanelProps {
  canvasState: CanvasState;
  onExport: (options: ExportOptions) => Promise<string>;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ canvasState, onExport }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 1,
    scale: 1,
  });

  const handleExport = async () => {
    if (!canvasState.image) return;

    setIsExporting(true);
    try {
      const dataUrl = await onExport(exportOptions);
      const filename = `image-text-composer-${Date.now()}.${exportOptions.format}`;
      downloadImage(dataUrl, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFormatChange = (format: 'png' | 'jpg') => {
    setExportOptions(prev => ({ ...prev, format }));
  };

  const handleQualityChange = (quality: number) => {
    setExportOptions(prev => ({ ...prev, quality }));
  };

  const handleScaleChange = (scale: number) => {
    setExportOptions(prev => ({ ...prev, scale }));
  };

  if (!canvasState.image) {
    return (
      <div className="p-6 text-center text-gray-500">
        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p>Upload an image to enable export</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Export</h3>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Export options"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Export Options */}
      {showOptions && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format
            </label>
            <div className="flex space-x-2">
              {[
                { value: 'png' as const, label: 'PNG' },
                { value: 'jpg' as const, label: 'JPEG' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleFormatChange(value)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    exportOptions.format === value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Quality (for JPEG) */}
          {exportOptions.format === 'jpg' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality: {Math.round(exportOptions.quality * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={exportOptions.quality}
                onChange={(e) => handleQualityChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          )}

          {/* Scale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scale: {exportOptions.scale}x
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={exportOptions.scale}
              onChange={(e) => handleScaleChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <p className="text-xs text-gray-500 mt-1">
              Output size: {Math.round(canvasState.imageWidth * exportOptions.scale)} × {Math.round(canvasState.imageHeight * exportOptions.scale)}px
            </p>
          </div>
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`
          w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors
          ${isExporting
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
          }
        `}
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Exporting...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Export as {exportOptions.format.toUpperCase()}
          </>
        )}
      </button>

      {/* Image Info */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <p><strong>Original size:</strong> {canvasState.imageWidth} × {canvasState.imageHeight}px</p>
          <p><strong>Text layers:</strong> {canvasState.textLayers.length}</p>
          {exportOptions.scale !== 1 && (
            <p><strong>Export size:</strong> {Math.round(canvasState.imageWidth * exportOptions.scale)} × {Math.round(canvasState.imageHeight * exportOptions.scale)}px</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default ExportPanel; 