import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { MapPin, Phone, Mail, Clock, HelpCircle, Check, Send, ShieldCheck } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings } = useStore();
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
          Artisan Studio & Support
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-slate-900 tracking-tight">
          We Frame Memories with Precision
        </h1>
        <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
          Have questions about photo resolutions, custom timber cuts, or commercial wall art projects? Our master framing consultants are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Contact Info & Workshop details */}
        <div className="space-y-6 text-xs">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold font-serif-luxury text-slate-900 text-base">
              Agifthub Framing Studio HQ
            </h3>

            <div className="space-y-3 text-slate-600">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-mono-numbers">{settings.phone} (WhatsApp Enabled)</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{settings.email}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Mon – Sat: 9:30 AM – 7:30 PM IST</span>
              </p>
            </div>
          </div>

          {/* Photo DPI Guide Box */}
          <div className="bg-emerald-950/20 p-6 rounded-2xl border border-emerald-900/40 text-slate-800 space-y-3">
            <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Recommended Photo Resolution Guide</span>
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              For crisp museum reproduction without blurriness, aim for at least <strong>150 to 300 DPI</strong> at the requested physical frame size:
            </p>
            <div className="space-y-1.5 font-mono-numbers text-[11px]">
              <div className="flex justify-between border-b border-emerald-900/10 pb-1">
                <span>8" × 10" Tabletop:</span>
                <span>Minimum 1200 × 1500 px</span>
              </div>
              <div className="flex justify-between border-b border-emerald-900/10 pb-1">
                <span>12" × 18" Standard:</span>
                <span>Minimum 1800 × 2700 px</span>
              </div>
              <div className="flex justify-between border-b border-emerald-900/10 pb-1">
                <span>16" × 20" Living Room:</span>
                <span>Minimum 2400 × 3000 px</span>
              </div>
              <div className="flex justify-between">
                <span>24" × 36" Grand Wall:</span>
                <span>Minimum 3600 × 5400 px</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs text-xs space-y-4">
          <h3 className="font-bold font-serif-luxury text-slate-900 text-base">
            Inquire or Request Custom Quote
          </h3>

          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
              <Check className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-bold text-emerald-900 text-sm">Thank You!</p>
              <p className="text-slate-600 text-xs">
                Your framing inquiry has been received. Our studio artisans will contact you on WhatsApp within 2 hours.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarti Mehta"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">WhatsApp Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98000 00000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono-numbers"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="aarti@example.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Inquiry / Requirements</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us about the photograph, frame size, or timber preference..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Inquiry to Studio</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
