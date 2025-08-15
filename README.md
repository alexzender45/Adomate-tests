# Image Text Composer - Adomate Coding Assignment

A powerful, desktop-only image editing tool built with Next.js and TypeScript that enables users to upload PNG images and overlay them with fully customizable text layers.

## 🚀 Features

### Core Features
- **Image Upload**: Drag & drop or click to upload PNG, JPG, GIF images (up to 10MB)
- **Text Layers**: Add multiple text layers with independent positioning, styling, and manipulation
- **Text Customization**: 
  - Font family (Google Fonts + system fonts)
  - Font size (8px - 200px)
  - Font weight (normal/bold)
  - Text color with color picker
  - Opacity control (0-100%)
  - Text alignment (left/center/right)
  - Rotation (-180° to +180°)
- **Layer Management**:
  - Drag & drop reordering
  - Show/hide layers
  - Duplicate layers
  - Delete layers
  - Layer selection and editing
- **Export Options**:
  - PNG and JPEG formats
  - Quality control for JPEG
  - Scale options (0.5x - 3x)
  - Preserves original image dimensions

### Bonus Features
- **Undo/Redo System**: Full history management with keyboard shortcuts
- **Keyboard Shortcuts**: Delete key to remove selected layers
- **Responsive Design**: Optimized for desktop with intuitive UI
- **Real-time Preview**: Instant visual feedback for all changes
- **Performance Optimized**: Smooth interactions with debounced updates
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 🛠️ Technical Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Canvas**: HTML5 Canvas API (native, no external dependencies)
- **Icons**: Lucide React
- **Fonts**: Google Fonts API + system fonts
- **Build Tool**: Vite (via Next.js)

## 🎯 Why These Technologies?

### HTML5 Canvas over Konva.js
- **No SSR Issues**: Native Canvas API works perfectly with Next.js
- **Better Performance**: Direct Canvas 2D context access
- **Smaller Bundle**: No external canvas library dependencies
- **More Control**: Standard web APIs, no library-specific quirks
- **Easier Maintenance**: No complex workarounds needed

### Next.js 14
- **App Router**: Modern routing with better performance
- **TypeScript**: First-class TypeScript support
- **Optimization**: Built-in image optimization and performance features
- **Developer Experience**: Excellent DX with hot reloading and error handling

### Tailwind CSS
- **Rapid Development**: Utility-first approach for quick styling
- **Consistency**: Design system with consistent spacing and colors
- **Responsive**: Built-in responsive design utilities
- **Customization**: Easy to customize and extend

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd Adomate-tests

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables (Optional)
Create a `.env.local` file for Google Fonts API:
```env
NEXT_PUBLIC_GOOGLE_FONTS_API_KEY=your_google_fonts_api_key
```

**Note**: If no Google Fonts API key is provided, the application will automatically use system fonts. This is perfectly fine for most use cases and doesn't affect functionality.

### Build for Production
```bash
npm run build
npm start
```

## 🎨 Usage Guide

### Getting Started
1. **Upload Image**: Drag and drop or click to upload an image
2. **Add Text**: Double-click on the canvas or use the "Add Text" button
3. **Edit Text**: Select a text layer to edit its properties
4. **Customize**: Use the Properties panel to modify text appearance
5. **Manage Layers**: Use the Layers panel to reorder, duplicate, or delete layers
6. **Export**: Use the Export panel to download your final design

### Keyboard Shortcuts
- `Delete` / `Backspace`: Remove selected text layer
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Y`: Redo
- `Ctrl/Cmd + D`: Duplicate selected layer
- `+/-`: Zoom in/out
- `0`: Reset zoom to 100%

### Layer Management
- **Drag to Move**: Click and drag text layers on the canvas
- **Double-click to Edit**: Double-click text to edit content
- **Reorder**: Drag layers in the Layers panel to change stacking order

## 🏗️ Architecture

### Component Structure
```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main application
│   └── globals.css         # Global styles
├── components/
│   ├── Canvas.tsx          # Main canvas with HTML5 Canvas
│   ├── ImageUpload.tsx     # Image upload component
│   ├── TextProperties.tsx  # Text editing panel
│   ├── LayersPanel.tsx     # Layer management
│   ├── ExportPanel.tsx     # Export functionality
│   └── Toolbar.tsx         # Toolbar with quick actions
├── lib/
│   ├── fonts.ts            # Font management utilities
│   └── utils.ts            # General utilities
└── types/
    └── index.ts            # TypeScript type definitions
```

### State Management
- **Canvas State**: Centralized state for image and text layers
- **History Management**: Undo/redo functionality with state snapshots
- **Component Communication**: Props and callbacks for parent-child communication

### Performance Optimizations
- **Debounced Updates**: Prevents excessive re-renders during text editing
- **Efficient Rendering**: HTML5 Canvas optimized rendering
- **Lazy Loading**: Font loading on demand
- **Memory Management**: Proper cleanup of event listeners

## 🧪 Testing

### Manual Testing Checklist
- [ ] Image upload (drag & drop, file picker)
- [ ] Text layer creation and editing
- [ ] Font family and size changes
- [ ] Color and opacity adjustments
- [ ] Text alignment and rotation
- [ ] Layer reordering and management
- [ ] Export functionality (PNG/JPEG)
- [ ] Undo/redo operations
- [ ] Keyboard shortcuts
- [ ] Responsive design

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Deploy the .next folder
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Customization

### Adding New Fonts
1. Update `src/lib/fonts.ts` with new font families
2. Add font loading logic in `TextProperties.tsx`

### Styling Changes
- Modify `tailwind.config.js` for theme customization
- Update component styles in respective `.tsx` files

### Adding New Features
- Extend TypeScript interfaces in `src/types/index.ts`
- Add new components in `src/components/`
- Update main page logic in `src/app/page.tsx`

## 📝 License

This project is created for the Adomate coding assignment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or issues, please refer to the project documentation or create an issue in the repository.

---

**Built with ❤️ using Next.js, TypeScript, and HTML5 Canvas**
