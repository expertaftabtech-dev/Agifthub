import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { settings, setActivePortal } = useStore();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-14 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-white">Artisan Solid Woods</p>
              <p className="text-slate-400 text-[11px]">Kiln-dried teak & walnut</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-white">Museum Acid-Free Mats</p>
              <p className="text-slate-400 text-[11px]">Preserves photos for 100+ yrs</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-white">Reinforced Crate Transit</p>
              <p className="text-slate-400 text-[11px]">Zero-breakage guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-white">Instant UPI QR Billing</p>
              <p className="text-slate-400 text-[11px]">Official automated cash memos</p>
            </div>
          </div>
        </div>

        {/* Footer main grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10 text-xs">
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-emerald-700 flex items-center justify-center text-white font-serif-luxury font-bold">
                A
              </div>
              <span className="text-lg font-serif-luxury font-bold text-white tracking-tight">
                {settings.storeName}
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              {settings.storeTagline}. Handcrafted luxury picture frames, heirloom multi-aperture collages, and ambient LED wall galleries.
            </p>
            <div className="pt-2 text-[11px] text-slate-500">
              <span>GSTIN: 07AAACA1234F1Z9</span> · <span>ISO 9001:2015 Framing Certified</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Explore Studio
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('customizer')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Interactive Custom Frame Designer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Artisan Wood Collections
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Wedding & Anniversary Frames
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  LED Backlit Acrylic Displays
                </button>
              </li>
            </ul>
          </div>

          {/* Customer support */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Customer Care
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('tracking')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Track Order Status
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  My Orders & Payment Invoices
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Photo Upload Guidelines & DPI Check
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Refund & Return Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Studio contact */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Studio Workshop
            </h4>
            <div className="space-y-2.5 text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{settings.phone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{settings.email}</span>
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800">
              <button
                onClick={() => setActivePortal('admin')}
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Authorized Staff & Admin Login →</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 {settings.storeName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Terms of Service</span>
            <span>·</span>
            <span>GST Invoice Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
