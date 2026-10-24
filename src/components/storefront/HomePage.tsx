import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import {
  ArrowRight,
  Sparkles,
  Sliders,
  CheckCircle,
  Star,
  Shield,
  Layers,
  Heart,
  Eye,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectProduct }) => {
  const { products, categories } = useStore();

  const featuredProducts = products.filter((p) => p.isFeatured && p.isPublished).slice(0, 4);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-16 sm:py-24">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bespoke Framing · Handcrafted in New Delhi</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-luxury font-bold tracking-tight text-white leading-tight">
                Turn your cherished moments into timeless wall heirlooms.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                Premium solid teak, royal walnut, and antique gold leaf mouldings.
                Upload your photograph, customize museum-grade matting, and preview in real-time.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('customizer')}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg hover:shadow-emerald-900/30 transition-all cursor-pointer text-sm"
                >
                  <span>Design Custom Frame</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('catalog')}
                  className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer text-sm"
                >
                  <span>Explore Catalog</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-xs text-slate-400">
                <div>
                  <p className="font-bold text-white text-base font-mono-numbers">100%</p>
                  <p>Kiln-Dried Hardwood</p>
                </div>
                <div>
                  <p className="font-bold text-white text-base font-mono-numbers">24-48h</p>
                  <p>Express Crafting</p>
                </div>
                <div>
                  <p className="font-bold text-white text-base font-mono-numbers">Zero</p>
                  <p>Transit Breakage Guarantee</p>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-gradient-to-br from-amber-900/40 to-slate-800 p-4 rounded-2xl border border-amber-500/20 shadow-2xl">
                {/* Simulated Framed Piece */}
                <div className="border-[14px] border-[#382212] bg-[#FAF8F5] p-5 shadow-2xl rounded-xs">
                  <div className="relative aspect-4/5 overflow-hidden rounded-xs bg-slate-900 border border-slate-200 shadow-inner">
                    <img
                      src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=85"
                      alt="Customized Photo Frame"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-2 inset-x-2 bg-black/70 backdrop-blur-xs text-white text-center py-1.5 px-2 rounded-xs border border-white/20">
                      <p
                        className="text-xs font-serif-luxury italic"
                        style={{ fontFamily: 'Playfair Display' }}
                      >
                        Customized Photo Frame
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-center text-xs text-amber-200/80 font-mono-numbers">
                  Custom Royal Dark Walnut with Archival Ivory Matting
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections / Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
              Curated Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-slate-900 tracking-tight mt-1">
              Browse by Framing Style
            </h2>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate('catalog')}
              className="group text-left bg-white rounded-xl overflow-hidden border border-slate-200/80 hover:border-emerald-600/60 shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <p className="font-bold text-xs sm:text-sm line-clamp-1">{cat.name}</p>
                </div>
              </div>
              <div className="p-3">
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Interactive Customizer Promotion Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 rounded-2xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-block px-3 py-1 rounded-md bg-emerald-800/80 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
              Online Custom Framing Studio
            </span>
            <h3 className="text-3xl font-serif-luxury font-bold leading-tight">
              Have a special photograph? Preview it inside real woods before purchasing.
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Upload from your phone or camera gallery. Select from 6 moulding widths, double acid-free matting, custom typography engravings, and get automated UPI cash memo billing.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('customizer')}
                className="px-6 py-3 bg-white text-slate-950 hover:bg-slate-100 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
              >
                Launch Studio Customizer Now →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Ready-to-Ship Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
              Masterpiece Picks
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-slate-900 tracking-tight mt-1">
              Popular Studio Best-Sellers
            </h2>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col"
            >
              <div
                onClick={() => onSelectProduct(product)}
                className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs font-mono-numbers">
                  {product.frameSize}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                    {product.categoryName}
                  </span>
                  <h4
                    onClick={() => onSelectProduct(product)}
                    className="font-bold text-sm text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer mt-0.5 line-clamp-1"
                  >
                    {product.name}
                  </h4>
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
                    onClick={() => onSelectProduct(product)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 transition-colors cursor-pointer"
                    title="View & Configure"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Craftsmanship & Quality Standards */}
      <section className="bg-slate-100/70 border-y border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
              The Agifthub Guarantee
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-slate-900 tracking-tight mt-1">
              Precision Framing Built to Last Generations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">45° Mitred V-Nail Joints</h4>
              <p className="text-slate-600 leading-relaxed">
                Every frame corner is cut on pneumatic double-mitre saws and joined with hardened steel V-nails and marine PVA adhesive for permanent diagonal alignment.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">100% Acid-Free Alpha Cellulose</h4>
              <p className="text-slate-600 leading-relaxed">
                Standard cardboard stains photos yellow within 3 years. We exclusively use buffered museum-grade matboards that safeguard memories from chemical degradation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Optical UV Acrylic Glazing</h4>
              <p className="text-slate-600 leading-relaxed">
                Unlike brittle standard float glass that shatters during shipping, our 2.5mm cast acrylic provides 92% light transmission and zero-breakage peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
