import React, { useState } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { X, Check, ShoppingBag, ShieldCheck, Truck, Sparkles, Sliders } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onOpenCustomizer: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenCustomizer,
}) => {
  const { addToCart } = useStore();
  const [selectedSize, setSelectedSize] = useState<string>(product.frameSize);
  const [selectedColor, setSelectedColor] = useState<string>(product.color);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState<boolean>(false);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      product,
      quantity,
      unitPrice: product.discountPrice,
      selectedSize,
      selectedColor,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Images */}
          <div className="bg-slate-50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100">
            <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-200 border border-slate-200/80 shadow-xs">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-emerald-600 scale-95'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-200/80 text-[11px] text-slate-500 space-y-2">
              <p className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Museum Alpha-Cellulose Preservation Matting</span>
              </p>
              <p className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ready to ship in {product.productionTime}</span>
              </p>
            </div>
          </div>

          {/* Right: Product specs & Purchase module */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                  {product.categoryName} · SKU: {product.sku}
                </span>
                <h2 className="text-xl sm:text-2xl font-serif-luxury font-bold text-slate-900 tracking-tight mt-1">
                  {product.name}
                </h2>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold font-mono-numbers text-slate-900">
                  ₹{product.discountPrice.toLocaleString()}
                </span>
                {product.sellingPrice > product.discountPrice && (
                  <span className="text-sm text-slate-400 line-through font-mono-numbers">
                    ₹{product.sellingPrice.toLocaleString()}
                  </span>
                )}
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Save ₹{(product.sellingPrice - product.discountPrice).toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {product.description}
              </p>

              {/* Sizes */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Select Frame Size:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.availableVariants.map((variant) => (
                    <button
                      key={variant}
                      onClick={() => setSelectedSize(variant)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono-numbers font-medium border cursor-pointer ${
                        selectedSize === variant
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              </div>

              {/* Materials info */}
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p>
                  <strong>Wood & Glazing:</strong> {product.material} ({selectedColor})
                </p>
                <p className="mt-1">
                  <strong>Stock Status:</strong>{' '}
                  <span className={product.stockQuantity > 0 ? 'text-emerald-700 font-semibold' : 'text-rose-600 font-semibold'}>
                    {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity} ready)` : 'Made to Order'}
                  </span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1 text-xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono-numbers font-semibold px-2">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={handleAddToCart}
                  disabled={added}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart (₹{(product.discountPrice * quantity).toLocaleString()})</span>
                    </>
                  )}
                </button>
              </div>

              {/* Customize In Studio Link */}
              <button
                onClick={() => {
                  onClose();
                  onOpenCustomizer();
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Upload Custom Photo & Customize This Moulding</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
