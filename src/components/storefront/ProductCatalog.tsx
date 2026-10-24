import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { Search, SlidersHorizontal, Eye, ShoppingBag, Check, X } from 'lucide-react';

interface ProductCatalogProps {
  onSelectProduct: (product: Product) => void;
  onNavigateToCustomizer: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  onSelectProduct,
  onNavigateToCustomizer,
}) => {
  const { products, categories, addToCart } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(4000);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  // Extract materials
  const allMaterials = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.material) set.add(p.material);
    });
    return Array.from(set);
  }, [products]);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (!p.isPublished) return false;
        if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
        if (selectedMaterial !== 'all' && p.material !== selectedMaterial) return false;
        if (p.discountPrice > maxPrice) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.discountPrice - b.discountPrice;
        if (sortBy === 'price-desc') return b.discountPrice - a.discountPrice;
        if (sortBy === 'newest') return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, selectedCategory, selectedMaterial, maxPrice, searchQuery, sortBy]);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      productId: product.id,
      product,
      quantity: 1,
      unitPrice: product.discountPrice,
      selectedSize: product.frameSize,
      selectedColor: product.color,
    });
    setAddedToast(product.name);
    setTimeout(() => setAddedToast(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Added <strong>{addedToast}</strong> to cart!</span>
        </div>
      )}

      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-slate-900 tracking-tight">
            Artisan Picture Frame Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Displaying {filteredProducts.length} handcrafted picture frames ready for personal photo printing and framing.
          </p>
        </div>

        {/* Global Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, SKU or wood type..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar (1 Col) */}
        <aside className="space-y-6 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs h-fit text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
              <span>Filters</span>
            </span>
            {(selectedCategory !== 'all' || selectedMaterial !== 'all' || maxPrice < 4000) && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedMaterial('all');
                  setMaxPrice(4000);
                }}
                className="text-emerald-700 hover:underline cursor-pointer text-[11px]"
              >
                Reset
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2.5">
              Category
            </h4>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Categories ({products.length})
              </button>
              {categories.map((cat) => {
                const count = products.filter((p) => p.categoryId === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="font-mono-numbers text-[10px] text-slate-400">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Max Price Slider */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between font-bold text-slate-800 mb-2">
              <span className="uppercase tracking-wider text-[11px]">Max Price</span>
              <span className="font-mono-numbers text-emerald-700">₹{maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="800"
              max="4000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono-numbers mt-1">
              <span>₹800</span>
              <span>₹4,000</span>
            </div>
          </div>

          {/* Materials */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
              Hardwood & Material
            </h4>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedMaterial('all')}
                className={`w-full text-left px-2.5 py-1.5 rounded-md cursor-pointer ${
                  selectedMaterial === 'all'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Materials
              </button>
              {allMaterials.map((mat) => (
                <button
                  key={mat}
                  onClick={() => setSelectedMaterial(mat)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md truncate cursor-pointer ${
                    selectedMaterial === mat
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {mat}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Frame Studio CTA Box */}
          <div className="pt-4 border-t border-slate-100 bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-900/30">
            <p className="font-bold text-slate-900 text-xs">Need Custom Sizing?</p>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              Design your custom frame with millimeter-precise mats and engraving.
            </p>
            <button
              onClick={onNavigateToCustomizer}
              className="mt-2.5 w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs cursor-pointer"
            >
              Open Studio Customizer →
            </button>
          </div>
        </aside>

        {/* Products Grid (3 Cols) */}
        <main className="lg:col-span-3 space-y-6">
          {/* Sorting and result count bar */}
          <div className="flex items-center justify-between text-xs bg-white px-4 py-2.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-mono-numbers">
              Showing <strong>{filteredProducts.length}</strong> items
            </span>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-semibold text-slate-800 border-none focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured Picks</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">New Arrivals</option>
              </select>
            </div>
          </div>

          {/* Grid Cards */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="group bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col cursor-pointer"
                >
                  <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs font-mono-numbers">
                      {product.frameSize}
                    </div>

                    {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                      <div className="absolute bottom-2.5 left-2.5 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                        Only {product.stockQuantity} left
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        {product.categoryName}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors mt-0.5 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-base font-bold text-slate-900 font-mono-numbers">
                          ₹{product.discountPrice.toLocaleString()}
                        </span>
                        {product.sellingPrice > product.discountPrice && (
                          <span className="text-xs text-slate-400 line-through ml-2 font-mono-numbers">
                            ₹{product.sellingPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleQuickAdd(product, e)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <p className="text-sm font-semibold text-slate-800">No photo frames found</p>
              <p className="text-xs text-slate-500 mt-1">
                Try widening your price range or clearing search filters.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
