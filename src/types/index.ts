export interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  opacity: number;
  textAlign: 'left' | 'center' | 'right';
  isSelected: boolean;
  zIndex: number;
  isVisible: boolean; 
  scale?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  backgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
}

export interface CanvasState {
  image: string | null;
  imageWidth: number;
  imageHeight: number;
  textLayers: TextLayer[];
  selectedLayerId: string | null;
}

export interface FontOption {
  family: string;
  category: string;
  variants: string[];
}

export interface ExportOptions {
  format: 'png' | 'jpg';
  quality: number;
  scale: number;
} 