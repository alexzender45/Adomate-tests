'use client';

import React, { useState, useEffect } from 'react';
import { TextLayer, FontOption } from '@/types';
import { fetchGoogleFonts, loadFont, getSystemFonts } from '@/lib/fonts';
import { 
  Type, 
  Eye, 
  EyeOff,
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  RotateCcw,
  Trash2
} from 'lucide-react';

interface TextPropertiesProps {
  selectedLayer: TextLayer | null;
  onUpdateLayer: (updates: Partial<TextLayer>) => void;
  onDeleteLayer: () => void;
}

const TextProperties: React.FC<TextPropertiesProps> = ({ 
  selectedLayer, 
  onUpdateLayer, 
  onDeleteLayer 
}) => {
  const [fonts, setFonts] = useState<FontOption[]>([]);
  const [isLoadingFonts, setIsLoadingFonts] = useState(true);
  const [fontError, setFontError] = useState<string | null>(null);

  useEffect(() => {
    const loadFonts = async () => {
      setIsLoadingFonts(true);
      setFontError(null);
      
      try {
        const googleFonts = await fetchGoogleFonts();
        setFonts(googleFonts);
      } catch (error) {
        console.error('Failed to load fonts:', error);
        setFontError('Failed to load Google Fonts, using system fonts');
        // Fallback to system fonts
        setFonts(getSystemFonts());
      } finally {
        setIsLoadingFonts(false);
      }
    };

    loadFonts();
  }, []);

  const handleFontChange = async (fontFamily: string) => {
    try {
      await loadFont(fontFamily);
      onUpdateLayer({ fontFamily });
      
      // Recalculate dimensions when font family changes
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx && selectedLayer) {
        tempCtx.font = `${selectedLayer.fontWeight === 'bold' ? 'bold' : 'normal'} ${selectedLayer.fontSize}px ${fontFamily}`;
        const textMetrics = tempCtx.measureText(selectedLayer.text);
        
        onUpdateLayer({ 
          fontFamily,
          width: textMetrics.width,
          height: selectedLayer.fontSize
        });
      }
    } catch (error) {
      console.warn('Failed to load font:', fontFamily, error);
      // Still update the font family even if loading fails
      onUpdateLayer({ fontFamily });
    }
  };

  const handleFontWeightChange = (weight: string) => {
    onUpdateLayer({ fontWeight: weight });
    
    // Recalculate dimensions when font weight changes
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx && selectedLayer) {
      tempCtx.font = `${weight === 'bold' ? 'bold' : 'normal'} ${selectedLayer.fontSize}px ${selectedLayer.fontFamily}`;
      const textMetrics = tempCtx.measureText(selectedLayer.text);
      
      onUpdateLayer({ 
        fontWeight: weight,
        width: textMetrics.width,
        height: selectedLayer.fontSize
      });
    }
  };

  const handleColorChange = (color: string) => {
    onUpdateLayer({ color });
  };


  const handleFontSizeChange = (fontSize: number) => {
    const newFontSize = Math.max(8, Math.min(200, fontSize));
    onUpdateLayer({ fontSize: newFontSize });
    
    // Recalculate dimensions when font size changes
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx && selectedLayer) {
      tempCtx.font = `${selectedLayer.fontWeight === 'bold' ? 'bold' : 'normal'} ${newFontSize}px ${selectedLayer.fontFamily}`;
      const textMetrics = tempCtx.measureText(selectedLayer.text);
      
      onUpdateLayer({ 
        fontSize: newFontSize,
        width: textMetrics.width,
        height: newFontSize
      });
    }
  };



  const handleTextChange = (text: string) => {
    onUpdateLayer({ text });
    
    // Recalculate dimensions when text changes
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx && selectedLayer) {
      tempCtx.font = `${selectedLayer.fontWeight === 'bold' ? 'bold' : 'normal'} ${selectedLayer.fontSize}px ${selectedLayer.fontFamily}`;
      const textMetrics = tempCtx.measureText(text);
      
      onUpdateLayer({ 
        text,
        width: textMetrics.width,
        height: selectedLayer.fontSize
      });
    }
  };

  if (!selectedLayer) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Type className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">No text layer selected</p>
        <p className="text-xs text-gray-400 mt-1">Select a text layer to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Text Properties</h3>
        <div className="flex items-center space-x-2">
          {/* Hide/Show Toggle */}
          <button
            onClick={() => onUpdateLayer({ isVisible: !selectedLayer.isVisible })}
            className={`p-2 rounded-lg transition-colors ${
              selectedLayer.isVisible 
                ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100' 
                : 'text-red-500 hover:text-red-700 hover:bg-red-50'
            }`}
            title={selectedLayer.isVisible ? 'Hide layer' : 'Show layer'}
          >
            {selectedLayer.isVisible ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>
          
          {/* Delete Button */}
          <button
            onClick={onDeleteLayer}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete layer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visibility Status */}
      <div className={`p-3 rounded-lg border ${
        selectedLayer.isVisible 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center space-x-2">
          {selectedLayer.isVisible ? (
            <Eye className="w-4 h-4 text-green-600" />
          ) : (
            <EyeOff className="w-4 h-4 text-red-600" />
          )}
          <span className={`text-sm font-medium ${
            selectedLayer.isVisible ? 'text-green-800' : 'text-red-800'
          }`}>
            {selectedLayer.isVisible ? 'Layer is visible' : 'Layer is hidden'}
          </span>
        </div>
        <p className={`text-xs mt-1 ${
          selectedLayer.isVisible ? 'text-green-600' : 'text-red-600'
        }`}>
          {selectedLayer.isVisible 
            ? 'This text layer is currently visible on the canvas.' 
            : 'This text layer is hidden and will not appear in exports.'
          }
        </p>
      </div>

      {/* Text Content */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900">Text Content</label>
        <textarea
          value={selectedLayer.text}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
          rows={3}
          placeholder="Enter your text here..."
          style={{ color: '#000000' }}
        />
      </div>

      {/* Rotation - Moved to top for visibility */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900">Rotation</label>
        
        {/* Quick rotation buttons */}
        <div className="flex space-x-2 mb-3">
          <button
            onClick={() => {
              console.log('Setting rotation to 0');
              onUpdateLayer({ rotation: 0 });
            }}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            title="Reset rotation (0°)"
          >
            0°
          </button>
          <button
            onClick={() => {
              console.log('Setting rotation to 45');
              onUpdateLayer({ rotation: 45 });
            }}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            title="45° rotation"
          >
            45°
          </button>
          <button
            onClick={() => {
              console.log('Setting rotation to 90');
              onUpdateLayer({ rotation: 90 });
            }}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            title="90° rotation"
          >
            90°
          </button>
          <button
            onClick={() => {
              console.log('Setting rotation to 180');
              onUpdateLayer({ rotation: 180 });
            }}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            title="180° rotation"
          >
            180°
          </button>
          <button
            onClick={() => {
              console.log('Setting rotation to 270');
              onUpdateLayer({ rotation: 270 });
            }}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            title="270° rotation"
          >
            270°
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          <input
            type="range"
            min="0"
            max="360"
            value={selectedLayer.rotation}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              console.log('Rotation slider changed to:', value);
              onUpdateLayer({ rotation: value });
            }}
            className="flex-1"
          />
          <input
            type="number"
            min="0"
            max="360"
            value={selectedLayer.rotation}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              console.log('Rotation input changed to:', value);
              onUpdateLayer({ rotation: value });
            }}
            className="w-16 p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
            style={{ color: '#000000' }}
          />
          <button
            onClick={() => {
              console.log('Reset rotation clicked');
              onUpdateLayer({ rotation: 0 });
            }}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Reset rotation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        
        {/* Rotation preview */}
        <div className="text-xs text-gray-500 text-center">
          Current rotation: {selectedLayer.rotation}°
        </div>
      </div>

      {/* Opacity - Moved to top for visibility */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900">
          Opacity: {Math.round(selectedLayer.opacity * 100)}%
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={selectedLayer.opacity}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              console.log('Opacity slider changed to:', value);
              onUpdateLayer({ opacity: value });
            }}
            className="flex-1"
          />
          <input
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={selectedLayer.opacity}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              console.log('Opacity input changed to:', value);
              onUpdateLayer({ opacity: value });
            }}
            className="w-16 p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
            style={{ color: '#000000' }}
          />
        </div>
      </div>

      {/* Font Family */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900">Font Family</label>
        {isLoadingFonts ? (
          <div className="skeleton h-10 rounded-lg"></div>
        ) : (
          <select
            value={selectedLayer.fontFamily}
            onChange={(e) => handleFontChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
            style={{ color: '#000000' }}
          >
            {fonts.map((font) => (
              <option key={font.family} value={font.family} style={{ color: '#000000' }}>
                {font.family}
              </option>
            ))}
          </select>
        )}
        {fontError && (
          <p className="text-xs text-red-600">{fontError}</p>
        )}
      </div>

      {/* Font Size and Weight */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">Font Size</label>
          <input
            type="number"
            min="8"
            max="200"
            value={selectedLayer.fontSize}
            onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
            style={{ color: '#000000' }}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">Font Weight</label>
          <select
            value={selectedLayer.fontWeight}
            onChange={(e) => handleFontWeightChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
            style={{ color: '#000000' }}
          >
            <option value="normal" style={{ color: '#000000' }}>Normal</option>
            <option value="bold" style={{ color: '#000000' }}>Bold</option>
          </select>
        </div>
      </div>

      {/* Text Color */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-900">Text Color</label>
        
        {/* Color Preview */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div 
            className="w-8 h-8 rounded-lg border-2 border-gray-300"
            style={{ backgroundColor: selectedLayer.color }}
          />
          <input
            type="color"
            value={selectedLayer.color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
            title="Choose color"
          />
          <input
            type="text"
            value={selectedLayer.color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="flex-1 p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
            placeholder="#000000"
            pattern="^#[0-9A-Fa-f]{6}$"
            title="Enter hex color code"
            style={{ color: '#000000' }}
          />
        </div>

        {/* Quick Colors */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Quick Colors</label>
          <div className="grid grid-cols-8 gap-2">
            {[
              '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
              '#FFA500', '#800080', '#008000', '#FFC0CB', '#A52A2A', '#808080', '#FFD700', '#4B0082'
            ].map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`
                  w-8 h-8 rounded-md border-2 transition-all hover:scale-110
                  ${selectedLayer.color === color 
                    ? 'border-blue-500 scale-110 shadow-glow' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Color Categories */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Color Categories</label>
          <div className="space-y-2">
            <div className="flex space-x-1">
              <span className="text-xs text-gray-500 w-12">Warm:</span>
              {['#FF6B6B', '#FF8E53', '#FFA726', '#FFB74D', '#FFCC02'].map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <div className="flex space-x-1">
              <span className="text-xs text-gray-500 w-12">Cool:</span>
              {['#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'].map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <div className="flex space-x-1">
              <span className="text-xs text-gray-500 w-12">Neutral:</span>
              {['#2C3E50', '#34495E', '#7F8C8D', '#BDC3C7', '#ECF0F1'].map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Text Alignment */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900">Text Alignment</label>
        <div className="flex space-x-2">
          {[
            { value: 'left', icon: AlignLeft, label: 'Left' },
            { value: 'center', icon: AlignCenter, label: 'Center' },
            { value: 'right', icon: AlignRight, label: 'Right' }
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => onUpdateLayer({ textAlign: value as 'left' | 'center' | 'right' })}
              className={`
                flex-1 flex items-center justify-center p-3 border rounded-lg transition-all
                ${selectedLayer.textAlign === value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Position Controls */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-900">Position</label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-gray-600">X Position</label>
            <input
              type="number"
              value={Math.round(selectedLayer.x)}
              onChange={(e) => onUpdateLayer({ x: parseInt(e.target.value) })}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
              style={{ color: '#000000' }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-gray-600">Y Position</label>
            <input
              type="number"
              value={Math.round(selectedLayer.y)}
              onChange={(e) => onUpdateLayer({ y: parseInt(e.target.value) })}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
              style={{ color: '#000000' }}
            />
          </div>
        </div>
      </div>

      {/* Layer Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <h4 className="text-xs font-medium text-gray-700 mb-2">Layer Information</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Width:</span>
            <span>{Math.round(selectedLayer.width)}px</span>
          </div>
          <div className="flex justify-between">
            <span>Height:</span>
            <span>{Math.round(selectedLayer.height)}px</span>
          </div>
          <div className="flex justify-between">
            <span>Z-Index:</span>
            <span>{selectedLayer.zIndex}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextProperties; 