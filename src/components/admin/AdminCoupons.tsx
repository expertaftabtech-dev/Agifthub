import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Coupon } from '../../types';
import { Tag, Plus, Trash2, CheckCircle, Percent, Calendar } from 'lucide-react';

export const AdminCoupons: React.FC = () => {
  const { coupons, addCoupon, deleteCoupon } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [minOrder, setMinOrder] = useState<number>(999);
  const [validTill, setValidTill] = useState('2027-12-31');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    addCoupon({
      code: code.trim().toUpperCase(),
      discountPercent,
      minOrder,
      validTill,
      active: true,
    });

    setIsModalOpen(false);
    setCode('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
            Coupons & Promotional Discounts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure discount codes for storefront checkout and festive promotional campaigns.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                  Discount Code
                </span>
                <h3 className="text-lg font-bold font-mono tracking-wider text-slate-900 mt-0.5">
                  {coupon.code}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono-numbers">
                {coupon.discountPercent}% OFF
              </span>
            </div>

            <div className="space-y-1 text-slate-600 font-mono-numbers text-[11px]">
              <p>Minimum Order: ₹{coupon.minOrder.toLocaleString()}</p>
              <p>Valid Until: {coupon.validTill}</p>
              <p className="text-slate-400">Times Used: {coupon.usageCount} orders</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-700">Active on Store</span>
              <button
                onClick={() => deleteCoupon(coupon.id)}
                className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                title="Delete Coupon"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 relative text-xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Create Discount Coupon</h3>
              <p className="text-slate-500 mt-0.5">Define code name and discount percentage.</p>
            </div>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. DIWALI20"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Discount (%)</label>
                <input
                  type="number"
                  min="1"
                  max="70"
                  required
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono-numbers"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Minimum Order Value (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={minOrder}
                  onChange={(e) => setMinOrder(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono-numbers"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={validTill}
                  onChange={(e) => setValidTill(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono-numbers"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
