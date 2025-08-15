import { FontOption } from '@/types';

const GOOGLE_FONTS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY || '';

interface GoogleFontItem {
  family: string;
  category: string;
  variants: string[];
}

export async function fetchGoogleFonts(): Promise<FontOption[]> {
  // If no API key is provided, return system fonts immediately
  if (!GOOGLE_FONTS_API_KEY) {
    console.log('No Google Fonts API key provided, using system fonts');
    return getSystemFonts();
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}&sort=popularity`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items.map((font: GoogleFontItem) => ({
      family: font.family,
      category: font.category,
      variants: font.variants,
    }));
  } catch (error) {
    console.warn('Failed to fetch Google Fonts, falling back to system fonts:', error);
    return getSystemFonts();
  }
}

export function getSystemFonts(): FontOption[] {
  return [
    { family: 'Arial', category: 'sans-serif', variants: ['regular', 'bold', 'italic'] },
    { family: 'Helvetica', category: 'sans-serif', variants: ['regular', 'bold', 'italic'] },
    { family: 'Times New Roman', category: 'serif', variants: ['regular', 'bold', 'italic'] },
    { family: 'Georgia', category: 'serif', variants: ['regular', 'bold', 'italic'] },
    { family: 'Verdana', category: 'sans-serif', variants: ['regular', 'bold', 'italic'] },
    { family: 'Courier New', category: 'monospace', variants: ['regular', 'bold', 'italic'] },
    { family: 'Impact', category: 'sans-serif', variants: ['regular'] },
    { family: 'Comic Sans MS', category: 'cursive', variants: ['regular'] },
    { family: 'Tahoma', category: 'sans-serif', variants: ['regular', 'bold'] },
    { family: 'Trebuchet MS', category: 'sans-serif', variants: ['regular', 'bold', 'italic'] },
    { family: 'Lucida Console', category: 'monospace', variants: ['regular'] },
    { family: 'Palatino', category: 'serif', variants: ['regular', 'bold', 'italic'] },
    { family: 'Garamond', category: 'serif', variants: ['regular', 'bold', 'italic'] },
    { family: 'Bookman', category: 'serif', variants: ['regular', 'bold', 'italic'] },
    { family: 'Avant Garde', category: 'sans-serif', variants: ['regular', 'bold', 'italic'] },
    { family: 'Century Gothic', category: 'sans-serif', variants: ['regular', 'bold', 'italic'] },
  ];
}

export function loadFont(fontFamily: string): Promise<void> {
  return new Promise((resolve) => {
    // For system fonts, we don't need to load anything
    if (getSystemFonts().some(font => font.family === fontFamily)) {
      resolve();
      return;
    }

    // For Google Fonts, try to load them
    if (document.fonts && document.fonts.load) {
      document.fonts.load(`16px "${fontFamily}"`).then(() => {
        resolve();
      }).catch(() => {
        // If loading fails, just resolve anyway
        resolve();
      });
    } else {
      // Fallback for older browsers
      resolve();
    }
  });
} 