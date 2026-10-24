import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Lock, Mail, Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { login, setActivePortal } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your administrator email and password.');
      return;
    }

    setIsSubmitting(true);
    const res = login(email, password, 'admin');
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-xs text-white">
        {/* Studio Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-900/60 border border-emerald-700/50 text-emerald-400 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold font-serif-luxury tracking-tight text-white">
            Agifthub Studio Admin Portal
          </h1>
          <p className="text-[11px] text-slate-400">
            Authorized studio administration and workshop control center.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-950/60 border border-rose-800/80 text-rose-300 rounded-xl text-xs leading-relaxed animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {/* Secure Login Form - No passwords or emails shown */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer shadow-lg shadow-emerald-950/50 mt-2"
          >
            {isSubmitting ? 'Verifying Authorization...' : 'Secure Admin Sign In'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center">
          <button
            type="button"
            onClick={() => setActivePortal('store')}
            className="text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Storefront</span>
          </button>
        </div>
      </div>
    </div>
  );
};
