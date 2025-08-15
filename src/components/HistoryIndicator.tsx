'use client';

import React from 'react';
import { Undo, Redo, History } from 'lucide-react';

interface HistoryIndicatorProps {
  historyLength: number;
  currentIndex: number;
  maxSteps: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

const HistoryIndicator: React.FC<HistoryIndicatorProps> = ({
  historyLength,
  currentIndex,
  maxSteps,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  // Calculate progress percentage based on current position in history
  // Handle edge cases to prevent NaN or values > 100%
  const historyPercentage = historyLength > 1 
    ? Math.min(100, Math.max(0, (currentIndex / (historyLength - 1)) * 100))
    : historyLength === 1 
      ? 100 
      : 0;
  
  const stepsUsed = historyLength;
  const stepsRemaining = maxSteps - stepsUsed;

  // Don't show the indicator if there's no history yet
  if (historyLength === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 p-4 min-w-72">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <History className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-800">History</span>
        </div>
        <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {stepsUsed}/{maxSteps}
        </div>
      </div>

      {/* History Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span>Progress</span>
          <span className="font-medium">{Math.round(historyPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${historyPercentage}%` }}
          />
        </div>
      </div>

      {/* Steps Usage */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span>Steps Used</span>
          <span className="font-medium">{stepsUsed}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(stepsUsed / maxSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Undo/Redo Buttons */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`
            flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${canUndo 
              ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-soft hover:shadow-glow' 
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }
          `}
          title={canUndo ? 'Undo (Ctrl+Z)' : 'Nothing to undo'}
        >
          <Undo className="w-4 h-4 mr-2" />
          Undo
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`
            flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${canRedo 
              ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-soft hover:shadow-glow' 
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }
          `}
          title={canRedo ? 'Redo (Ctrl+Y)' : 'Nothing to redo'}
        >
          <Redo className="w-4 h-4 mr-2" />
          Redo
        </button>
      </div>

      {/* Current Position Indicator */}
      {historyLength > 1 && (
        <div className="pt-3 border-t border-gray-200/50">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Current Position</span>
            <span className="font-medium">{currentIndex + 1} of {historyLength}</span>
          </div>
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(historyLength, 12) }, (_, i) => (
              <div
                key={i}
                className={`
                  flex-1 h-1.5 rounded-full transition-all duration-200
                  ${i === currentIndex 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                    : i < currentIndex 
                      ? 'bg-gray-300' 
                      : 'bg-gray-100'
                  }
                `}
              />
            ))}
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="mt-3 pt-3 border-t border-gray-200/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Status</span>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${historyLength > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className={`text-xs ${historyLength > 0 ? 'text-green-600' : 'text-gray-400'}`}>
              {historyLength > 0 ? 'Active' : 'Ready'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryIndicator; 