import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { CustomDesign } from '../../types';
import {
  Upload,
  ZoomIn,
  ZoomOut,
  Move,
  Type,
  Check,
  ShoppingBag,
  Sparkles,
  RefreshCw,
  Eye,
  Info,
} from 'lucide-react';

interface CustomFrameDesignerProps {
  onSuccessAddToCart: () => void;
  onOpenAuth: () => void;
}

const FRAME_MOULDINGS = [
  {
    id: 'mould-teak',
    name: 'Artisan Solid Teak',
    material: 'Burma Solid Teak',
    basePrice: 1399,
    borderStyle: 'border-[#78350f]',
    innerAccent: 'border-[#b45309]',
    colorName: 'Warm Honey Teak',
    frameClass: 'bg-[#78350f] shadow-2xl',
    mouldingDepth: '28px',
  },
  {
    id: 'mould-walnut',
    name: 'Royal Dark Walnut',
    material: 'American Black Walnut',
    basePrice: 1599,
    borderStyle: 'border-[#382212]',
    innerAccent: 'border-[#d97706]',
    colorName: 'Espresso Walnut with Gold Bevel',
    frameClass: 'bg-[#2a1810] shadow-2xl',
    mouldingDepth: '32px',
  },
  {
    id: 'mould-gold',
    name: 'Champagne Antique Gold',
    material: 'Hand-Carved Gold Leaf',
    basePrice: 1899,
    borderStyle: 'border-[#d4af37]',
    innerAccent: 'border-[#fef08a]',
    colorName: 'Vintage Florentine Gold',
    frameClass: 'bg-gradient-to-br from-[#b8860b] via-[#d4af37] to-[#8b6508] shadow-2xl',
    mouldingDepth: '30px',
  },
  {
    id: 'mould-black',
    name: 'Modernist Matte Black',
    material: 'Anodized Aluminum / Pine',
    basePrice: 1199,
    borderStyle: 'border-slate-900',
    innerAccent: 'border-slate-700',
    colorName: 'Nordic Matt Black',
    frameClass: 'bg-slate-900 shadow-2xl',
    mouldingDepth: '24px',
  },
  {
    id: 'mould-birch',
    name: 'Scandi Natural Birch',
    material: 'European White Birch',
    basePrice: 1299,
    borderStyle: 'border-[#e2d5c3]',
    innerAccent: 'border-[#c5b49d]',
    colorName: 'Natural Pale Birch',
    frameClass: 'bg-[#e7dbce] shadow-2xl',
    mouldingDepth: '26px',
  },
];

const FRAME_SIZES = [
  { size: '8x10 inch', label: '8" × 10" (Tabletop / Wall)', multiplier: 1.0 },
  { size: '10x12 inch', label: '10" × 12" (Medium Portrait)', multiplier: 1.25 },
  { size: '12x18 inch', label: '12" × 18" (Standard Gallery)', multiplier: 1.55 },
  { size: '16x20 inch', label: '16" × 20" (Statement Living Room)', multiplier: 1.95 },
  { size: '18x24 inch', label: '18" × 24" (Grand Heirloom)', multiplier: 2.4 },
  { size: '24x36 inch', label: '24" × 36" (Full Wall Exhibition)', multiplier: 3.1 },
];

const MATTING_COLORS = [
  { name: 'Warm Ivory Museum Mat', color: 'bg-[#FAF8F5] text-slate-800', hex: '#FAF8F5' },
  { name: 'Pure Snow White', color: 'bg-white text-slate-800', hex: '#FFFFFF' },
  { name: 'Midnight Charcoal', color: 'bg-slate-900 text-white', hex: '#0F172A' },
  { name: 'No Matting (Edge-to-Edge)', color: 'bg-transparent text-slate-800', hex: 'none' },
];

const MATTING_WIDTHS = [
  { width: 0, label: 'None' },
  { width: 1.0, label: '1.0 Inch' },
  { width: 1.5, label: '1.5 Inch (Recommended)' },
  { width: 2.0, label: '2.0 Inch (Gallery Deep)' },
];

const FONT_OPTIONS = [
  { id: 'serif-luxury', name: 'Playfair Display (Luxury Serif)', css: 'font-serif-luxury italic' },
  { id: 'sans-clean', name: 'Plus Jakarta Sans (Modern Clean)', css: 'font-sans font-semibold tracking-wider uppercase' },
  { id: 'mono-type', name: 'Monospace Coordinates', css: 'font-mono text-xs tracking-widest' },
];

// Sample romantic / family default photo for instant visual joy
const SAMPLE_PHOTO = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80';

export const CustomFrameDesigner: React.FC<CustomFrameDesignerProps> = ({
  onSuccessAddToCart,
  onOpenAuth,
}) => {
  const { addToCart, currentUser } = useStore();

  const [selectedMoulding, setSelectedMoulding] = useState(FRAME_MOULDINGS[0]);
  const [selectedSize, setSelectedSize] = useState(FRAME_SIZES[2]); // 12x18 inch default
  const [selectedMatting, setSelectedMatting] = useState(MATTING_COLORS[0]);
  const [selectedMattingWidth, setSelectedMattingWidth] = useState(MATTING_WIDTHS[2]); // 1.5"
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0]);

  // Photo state
  const [photoUrl, setPhotoUrl] = useState<string>(SAMPLE_PHOTO);
  const [photoZoom, setPhotoZoom] = useState<number>(1.0);
  const [photoOffsetX, setPhotoOffsetX] = useState<number>(0);
  const [photoOffsetY, setPhotoOffsetY] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Custom text
  const [customText, setCustomText] = useState<string>('Aarav & Meera · 18th December 2024');
  const [dateOrYear, setDateOrYear] = useState<string>('Forever In Our Hearts');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Price calculation
  const calculatedUnitPrice = Math.round(
    selectedMoulding.basePrice * selectedSize.multiplier +
      (selectedMattingWidth.width > 0 ? 250 : 0)
  );
  const calculatedTotalPrice = calculatedUnitPrice * quantity;

  // File upload handler (from mobile gallery or desktop file picker)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert('Photo size is greater than 25MB. Please choose a slightly smaller file.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
        setPhotoZoom(1.0);
        setPhotoOffsetX(0);
        setPhotoOffsetY(0);
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert('Failed to read the selected photo.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Add customized item to cart
  const handleAddToCart = () => {
    const design: CustomDesign = {
      id: `cd-${Date.now()}`,
      mouldingStyle: selectedMoulding.name,
      frameSize: selectedSize.size,
      frameColor: selectedMoulding.colorName,
      material: selectedMoulding.material,
      mattingColor: selectedMatting.name,
      mattingWidth: selectedMattingWidth.width,
      photoUrl,
      photoZoom,
      photoOffsetX,
      photoOffsetY,
      customText: `${customText}${dateOrYear ? ` · ${dateOrYear}` : ''}`,
      customTextFont: selectedFont.name,
      dateOrYear,
      specialInstructions,
      calculatedPrice: calculatedUnitPrice,
    };

    addToCart({
      customDesign: design,
      quantity,
      unitPrice: calculatedUnitPrice,
      selectedSize: selectedSize.size,
      selectedColor: selectedMoulding.colorName,
    });

    onSuccessAddToCart();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Studio Banner */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-slate-900 tracking-tight">
          Interactive Custom Frame Designer
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Craft your one-of-a-kind heirloom frame. Upload your photograph, choose artisan hardwood moulding, customize museum matting, and engrave commemorative vows.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Live Frame Canvas & Photo Controls (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm sticky top-24">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Live Studio Visualizer
            </span>
            <div className="text-xs text-slate-500 font-mono-numbers">
              {selectedSize.size} · {selectedMoulding.name}
            </div>
          </div>

          {/* Canvas Frame Display Container */}
          <div className="my-6 py-6 bg-slate-100/70 rounded-xl flex items-center justify-center min-h-[380px] sm:min-h-[460px] p-4 overflow-hidden relative">
            {/* The Outer Frame Moulding */}
            <div
              className={`relative transition-all duration-300 p-4 sm:p-6 rounded-sm ${selectedMoulding.frameClass}`}
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(0,0,0,0.1)',
                borderWidth: selectedMoulding.mouldingDepth,
                borderStyle: 'solid',
                borderColor: selectedMoulding.borderStyle.replace('border-', '').replace('[', '').replace(']', ''),
              }}
            >
              {/* Optional Gold Bevel / Filigree inner rim */}
              <div className="border border-amber-400/40 p-1 bg-amber-500/10">
                {/* Matting Board */}
                <div
                  className={`relative transition-colors duration-200 ${
                    selectedMattingWidth.width === 0
                      ? 'p-0'
                      : selectedMattingWidth.width === 1.0
                      ? 'p-4 sm:p-6'
                      : selectedMattingWidth.width === 1.5
                      ? 'p-6 sm:p-9'
                      : 'p-8 sm:p-12'
                  }`}
                  style={{
                    backgroundColor: selectedMatting.hex !== 'none' ? selectedMatting.hex : 'transparent',
                    boxShadow: selectedMattingWidth.width > 0 ? 'inset 0 0 12px rgba(0,0,0,0.15)' : 'none',
                  }}
                >
                  {/* Photo Window Container */}
                  <div className="relative w-[240px] sm:w-[320px] h-[280px] sm:h-[360px] overflow-hidden bg-slate-900 border border-slate-300/40 shadow-inner">
                    {/* Customer Photo with Zoom & Pan */}
                    <img
                      src={photoUrl}
                      alt="Uploaded frame memory"
                      className="w-full h-full object-cover transition-transform duration-75 select-none"
                      style={{
                        transform: `scale(${photoZoom}) translate(${photoOffsetX}px, ${photoOffsetY}px)`,
                        transformOrigin: 'center center',
                      }}
                      referrerPolicy="no-referrer"
                    />

                    {/* Glaze Reflection Subtle Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>

                    {/* In-Frame Custom Engraving Text (if entered) */}
                    {(customText || dateOrYear) && (
                      <div className="absolute bottom-2 inset-x-2 bg-black/60 backdrop-blur-xs text-white text-center py-1.5 px-2 rounded-xs border border-white/20">
                        {customText && (
                          <p className={`text-xs sm:text-sm tracking-wide ${selectedFont.css}`}>
                            {customText}
                          </p>
                        )}
                        {dateOrYear && (
                          <p className="text-[10px] text-amber-200 font-mono-numbers mt-0.5">
                            {dateOrYear}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Adjustments Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
            {/* Upload Button */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Loading Image...' : 'Upload Your Photo'}</span>
              </button>
              <p className="text-[10px] text-slate-500 mt-1">Supports JPG, PNG, WebP up to 25MB.</p>
            </div>

            {/* Zoom / Pan Controls */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-600 font-medium">
                <span className="flex items-center gap-1">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Photo Zoom: {photoZoom.toFixed(1)}x</span>
                </span>
                <button
                  onClick={() => {
                    setPhotoZoom(1.0);
                    setPhotoOffsetX(0);
                    setPhotoOffsetY(0);
                  }}
                  className="text-emerald-700 hover:underline cursor-pointer text-[11px]"
                >
                  Reset Fit
                </button>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.05"
                value={photoZoom}
                onChange={(e) => setPhotoZoom(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>1.0x (Standard)</span>
                <span>2.5x (Close-up)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Customization Controls & Pricing (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section 1: Frame Moulding Style */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Select Moulding Style & Wood
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {FRAME_MOULDINGS.map((moulding) => {
                const isSelected = selectedMoulding.id === moulding.id;
                return (
                  <button
                    key={moulding.id}
                    onClick={() => setSelectedMoulding(moulding)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900">{moulding.name}</p>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{moulding.material}</p>
                    <p className="text-xs font-mono-numbers font-semibold text-emerald-800 mt-1">
                      ₹{moulding.basePrice.toLocaleString()} base
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Frame Dimensions */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Frame Size (Inches)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FRAME_SIZES.map((fs) => {
                const isSelected = selectedSize.size === fs.size;
                return (
                  <button
                    key={fs.size}
                    onClick={() => setSelectedSize(fs)}
                    className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-600 text-white font-semibold shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <p className="text-xs font-mono-numbers font-bold">{fs.size}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 italic">
              {selectedSize.label} · Includes hanging wire and wall mounts.
            </p>
          </div>

          {/* Section 3: Museum Matting */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              3. Acid-Free Museum Matting
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {MATTING_COLORS.map((mat) => {
                const isSelected = selectedMatting.name === mat.name;
                return (
                  <button
                    key={mat.name}
                    onClick={() => setSelectedMatting(mat)}
                    className={`p-2 rounded-lg border text-left text-xs transition-colors cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 font-semibold text-slate-900'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span>{mat.name.split(' ')[0]}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
                Matting Width Border:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {MATTING_WIDTHS.map((mw) => (
                  <button
                    key={mw.width}
                    onClick={() => setSelectedMattingWidth(mw)}
                    className={`py-1.5 text-xs rounded-md border text-center cursor-pointer ${
                      selectedMattingWidth.width === mw.width
                        ? 'bg-slate-900 text-white font-medium border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {mw.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Custom Engraving & Text */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-emerald-600" />
              <span>4. Bespoke Caption / Date Engraving</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Custom Names or Message:
                </label>
                <input
                  type="text"
                  maxLength={60}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="e.g. Kabir & Ananya · Always & Forever"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Commemorative Date or Subtext:
                </label>
                <input
                  type="text"
                  maxLength={40}
                  value={dateOrYear}
                  onChange={(e) => setDateOrYear(e.target.value)}
                  placeholder="e.g. 15th December 2024"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Typography Style:
                </label>
                <select
                  value={selectedFont.id}
                  onChange={(e) => {
                    const f = FONT_OPTIONS.find((fo) => fo.id === e.target.value);
                    if (f) setSelectedFont(f);
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 text-xs"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Special Instructions */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-2">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              Special Artisan Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Warm color tone correction, portrait retouching, or gold hanging wire..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Pricing & Add to Cart Sticky Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <p className="text-xs text-slate-400">Total Custom Piece Price</p>
                <p className="text-2xl font-bold font-mono-numbers text-emerald-400">
                  ₹{calculatedTotalPrice.toLocaleString()}
                </p>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white rounded cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono-numbers font-semibold text-xs px-1 text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white rounded cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Handcrafted Moulding ({selectedMoulding.name})</span>
                <span className="font-mono-numbers">₹{selectedMoulding.basePrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Size Multiplier ({selectedSize.size})</span>
                <span className="font-mono-numbers">{selectedSize.multiplier}x</span>
              </div>
              {selectedMattingWidth.width > 0 && (
                <div className="flex justify-between">
                  <span>Acid-Free Museum Matting</span>
                  <span className="font-mono-numbers">+₹250</span>
                </div>
              )}
              <div className="flex justify-between text-emerald-400 font-medium pt-1 border-t border-slate-800">
                <span>Free Safe-Transit Wood Crating</span>
                <span>FREE</span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg cursor-pointer text-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add Custom Piece to Cart (₹{calculatedTotalPrice.toLocaleString()})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
