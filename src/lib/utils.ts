import { TextLayer } from '@/types';

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function createDefaultTextLayer(x: number, y: number): TextLayer {
  return {
    id: generateId(),
    text: 'Double click to edit',
    x,
    y,
    width: 200,
    height: 50,
    rotation: 0,
    fontSize: 24,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    color: '#000000',
    opacity: 1,
    textAlign: 'left',
    isSelected: false,
    zIndex: 0,
    isVisible: true, // Default to visible
    // Additional properties with default values
    scale: 1,
    shadowColor: '#000000',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: '#000000',
  };
}

export function calculateAspectRatioFit(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
  return {
    width: srcWidth * ratio,
    height: srcHeight * ratio,
  };
}

export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function getNextZIndex(layers: TextLayer[]): number {
  if (layers.length === 0) return 0;
  return Math.max(...layers.map(layer => layer.zIndex)) + 1;
}

export function reorderLayers(layers: TextLayer[], fromIndex: number, toIndex: number): TextLayer[] {
  const result = [...layers];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  
  // Update z-index values to ensure they are sequential and unique
  return result.map((layer, index) => ({
    ...layer,
    zIndex: index,
  }));
}

export function normalizeZIndexes(layers: TextLayer[]): TextLayer[] {
  // Sort layers by current z-index and reassign sequential z-indexes
  const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);
  return sortedLayers.map((layer, index) => ({
    ...layer,
    zIndex: index,
  }));
} 