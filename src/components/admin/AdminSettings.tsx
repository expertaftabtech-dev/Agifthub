import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Settings,
  QrCode,
  Building,
  Phone,
  Mail,
  MapPin,
  Save,
  Check,
  Upload,
  Percent,
} from 'lucide-react';
import { generateQRCodeSVG, buildUpiUri } from '../../utils/qrGenerator';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useStore();

  const [formData, setFormData] = useState({ ...settings });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const qrFileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setToastMsg('Studio configuration & UPI payment parameters saved!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, upiQrImage: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Preview generated QR SVG
  const sampleUri = buildUpiUri({
    upiId: formData.upiId,
    storeName: formData.storeName,
  });
  const generatedQrSvg = generateQRCodeSVG(sampleUri, 130);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center gap-2 border border-slate-700">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
          Studio Parameters & Official Payment QR Settings
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure studio contact details, tax compliance, and official UPI QR code displayed on final cash memos.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs">
        {/* Left Form: General Studio Credentials (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-700" />
            <span>Store Identity & Workshop Address</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Official Store Name</label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Studio Tagline</label>
              <input
                type="text"
                value={formData.storeTagline}
                onChange={(e) => setFormData({ ...formData, storeTagline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Studio Phone</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono-numbers"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Studio Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Workshop Physical Address (Prints on Invoices)
              </label>
              <textarea
                rows={2}
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">GST Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="28"
                value={formData.taxRate}
                onChange={(e) =>
                  setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono-numbers font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Free Delivery Min (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.freeDeliveryThreshold}
                onChange={(e) =>
                  setFormData({ ...formData, freeDeliveryThreshold: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono-numbers"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard Courier (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.standardDeliveryCharge}
                onChange={(e) =>
                  setFormData({ ...formData, standardDeliveryCharge: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono-numbers"
              />
            </div>
          </div>
        </div>

        {/* Right Form: Official Store UPI Payment QR Code Settings (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-700" />
            <span>Store Payment QR Code (Mandated Section)</span>
          </h3>

          <p className="text-slate-500 text-[11px] leading-relaxed">
            This official UPI QR Code appears directly on small 58mm/80mm thermal cash memos and A4 invoices.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Official Store UPI ID (VPA)
            </label>
            <input
              type="text"
              required
              value={formData.upiId}
              onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
              placeholder="e.g. agifthub@icici"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold text-emerald-800"
            />
          </div>

          {/* QR Code Live Preview */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Live Preview of Printable QR Code
            </p>

            <div className="inline-block p-2 bg-white rounded-lg border border-slate-200 shadow-xs">
              {formData.upiQrImage ? (
                <img
                  src={formData.upiQrImage}
                  alt="Custom Store QR"
                  className="w-32 h-32 object-contain mx-auto"
                />
              ) : (
                <div
                  className="mx-auto"
                  dangerouslySetInnerHTML={{ __html: generatedQrSvg }}
                />
              )}
            </div>

            <p className="text-xs font-bold text-slate-900">Scan to Pay / Verify</p>
            <p className="text-[11px] font-mono text-emerald-700">{formData.upiId}</p>

            <div className="pt-2">
              <input
                ref={qrFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleQrUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => qrFileInputRef.current?.click()}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium text-xs flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Custom Bank QR Graphic</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All Studio Parameters</span>
          </button>
        </div>
      </form>
    </div>
  );
};
