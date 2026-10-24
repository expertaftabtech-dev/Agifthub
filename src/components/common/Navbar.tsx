import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  ShoppingBag,
  User as UserIcon,
  Search,
  SlidersHorizontal,
  ChevronDown,
  LogOut,
  Shield,
  LayoutDashboard,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  onOpenCart: () => void;
  onOpenAuth: (initialTab?: 'login' | 'register') => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCart,
  onOpenAuth,
  onNavigate,
  currentPage,
}) => {
  const { currentUser, logout, cart, setActivePortal } = useStore();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'catalog', label: 'Collections' },
    { id: 'customizer', label: 'Custom Frame Studio' },
    { id: 'tracking', label: 'Track Order' },
    { id: 'contact', label: 'Studio & Support' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top micro announcement */}
      <div className="bg-slate-900 text-slate-100 text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        <span>Artisan Handmade Frames · Free Express Shipping on orders over ₹999 · Official UPI QR Enabled</span>
      </div>

      {/* Main Top Bar adhering to 3-zone contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-sm font-serif-luxury font-bold text-xl border border-emerald-600/50">
              A
            </div>
            <div>
              <span className="text-xl font-bold font-serif-luxury tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors">
                Agifthub
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-slate-500 font-semibold -mt-1">
                Picture Frame Studio
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                currentPage === link.id
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600 -mb-[2px]'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Actions (Search, Cart, User / Admin toggle) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Admin Portal Switcher */}
          <button
            onClick={() => {
              setActivePortal('admin');
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200/80 cursor-pointer"
            title="Switch to Admin Dashboard"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-700" />
            <span>Admin Portal</span>
          </button>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center font-mono-numbers shadow-sm">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* User Account / Profile */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-800 transition-colors text-sm font-medium cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-300">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden lg:inline text-xs font-semibold max-w-[110px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-slate-500 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 font-mono text-[10px] uppercase text-emerald-700 font-bold">
                      {currentUser.role} Account
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNavigate('dashboard');
                    }}
                    className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>My Customer Dashboard</span>
                  </button>

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setActivePortal('admin');
                      }}
                      className="w-full text-left px-4 py-2 text-emerald-800 hover:bg-emerald-50 flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                      <span>Admin Dashboard</span>
                    </button>
                  )}

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => {
                setActivePortal('admin');
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 text-xs font-medium text-center bg-slate-100 text-slate-800 rounded-lg"
            >
              Switch to Admin Panel
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
