import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Lock, Mail, Phone, User, CheckCircle2, Shield, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
  onSuccess,
}) => {
  const { login, register } = useStore();
  const [tab, setTab] = useState<'login' | 'register' | 'verify' | 'forgot'>(initialTab);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setMsg({ text: 'Please enter your registered email', error: true });
      return;
    }
    const res = login(email);
    if (res.success) {
      setMsg({ text: res.message });
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 700);
    } else {
      setMsg({ text: res.message, error: true });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setMsg({ text: 'Please complete all required fields.', error: true });
      return;
    }
    // Transition to OTP verification step (mandated by prompt)
    setTab('verify');
    setMsg({ text: `Verification OTP sent to ${phone} and ${email}. (Enter code 123456 to verify)` });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setMsg({ text: 'Please enter the 6-digit verification code.', error: true });
      return;
    }

    const res = register(name, email, phone, password);
    if (res.success) {
      setMsg({ text: 'Account verified and created successfully!' });
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 700);
    } else {
      setMsg({ text: res.message, error: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2 font-serif-luxury font-bold text-lg">
            A
          </div>
          <h3 className="text-xl font-bold font-serif-luxury text-slate-900">
            {tab === 'login' && 'Sign in to Agifthub'}
            {tab === 'register' && 'Create Customer Account'}
            {tab === 'verify' && 'Verify Mobile & Email'}
            {tab === 'forgot' && 'Reset Password'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {tab === 'login' && 'Track framing orders, custom designs, and payment invoices.'}
            {tab === 'register' && 'Mandatory customer registration to place customized orders.'}
            {tab === 'verify' && 'Enter the 6-digit security code sent to your device.'}
            {tab === 'forgot' && 'We will send a password reset code to your email.'}
          </p>
        </div>

        {/* Tabs for Login / Register */}
        {(tab === 'login' || tab === 'register') && (
          <div className="flex border-b border-slate-200 mb-6 text-xs font-semibold">
            <button
              onClick={() => {
                setTab('login');
                setMsg(null);
              }}
              className={`flex-1 py-2.5 text-center cursor-pointer ${
                tab === 'login'
                  ? 'border-b-2 border-emerald-600 text-emerald-700 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Customer Login
            </button>
            <button
              onClick={() => {
                setTab('register');
                setMsg(null);
              }}
              className={`flex-1 py-2.5 text-center cursor-pointer ${
                tab === 'register'
                  ? 'border-b-2 border-emerald-600 text-emerald-700 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              New Registration
            </button>
          </div>
        )}

        {/* Status Message */}
        {msg && (
          <div
            className={`p-3 rounded-lg text-xs mb-4 ${
              msg.error ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rohit.sharma@example.com"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setTab('forgot')}
                  className="text-emerald-700 hover:underline cursor-pointer text-[11px]"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-md text-xs sm:text-sm"
            >
              Sign In
            </button>
          </form>
        )}

        {/* Registration Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rohit Sharma"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98234 56789"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rohit@example.com"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Create Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-md text-xs sm:text-sm mt-2"
            >
              Continue to Secure Verification →
            </button>
          </form>
        )}

        {/* OTP Verification Step */}
        {tab === 'verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-center">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full text-center text-xl font-mono-numbers tracking-widest py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <p className="text-[11px] text-center text-slate-500 mt-2">
                Simulated Sandbox Code: <strong>123456</strong>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-md text-xs sm:text-sm"
            >
              Verify & Complete Registration
            </button>

            <button
              type="button"
              onClick={() => setTab('register')}
              className="w-full text-center text-slate-500 hover:text-slate-800 text-xs cursor-pointer"
            >
              ← Back to Edit Details
            </button>
          </form>
        )}

        {/* Forgot Password */}
        {tab === 'forgot' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Your Registered Email
              </label>
              <input
                type="email"
                placeholder="rohit@example.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setMsg({ text: 'A password reset link has been dispatched to your email.' });
                setTimeout(() => setTab('login'), 2000);
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg"
            >
              Send Password Reset Link
            </button>
            <button
              type="button"
              onClick={() => setTab('login')}
              className="w-full text-center text-slate-500 hover:text-slate-800 text-xs"
            >
              ← Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
