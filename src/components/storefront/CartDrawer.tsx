import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Tag,
  ShieldCheck,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    settings,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; error?: boolean } | null>(null);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discountAmount = appliedCoupon
    ? Math.round((subtotal * appliedCoupon.discountPercent) / 100)
    : 0;
  const isFreeDelivery = subtotal - discountAmount >= settings.freeDeliveryThreshold;
  const deliveryCharge = isFreeDelivery ? 0 : settings.standardDeliveryCharge;
  const estimatedTax = Math.round(((subtotal - discountAmount) * settings.taxRate) / 100);
  const finalTotal = subtotal - discountAmount + deliveryCharge + estimatedTax;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (res.success) {
      setCouponMsg({ text: res.message });
      setCouponInput('');
    } else {
      setCouponMsg({ text: res.message, error: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base font-bold text-slate-900 font-serif-luxury">
                Your Framing Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free delivery progress */}
          <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 text-xs">
            {isFreeDelivery ? (
              <p className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>You unlocked Free Safe-Transit Delivery!</span>
              </p>
            ) : (
              <div>
                <p className="text-slate-600">
                  Add{' '}
                  <strong className="font-mono-numbers text-slate-900">
                    ₹{(settings.freeDeliveryThreshold - (subtotal - discountAmount)).toLocaleString()}
                  </strong>{' '}
                  more for Free Safe-Transit Delivery!
                </p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        ((subtotal - discountAmount) / settings.freeDeliveryThreshold) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <p className="font-semibold text-slate-800 text-sm">Your cart is currently empty</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Explore our handcrafted photo frames or design a personalized frame in our interactive studio.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 text-xs"
                >
                  {/* Photo Thumbnail */}
                  <div className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                    <img
                      src={
                        item.customDesign?.photoUrl ||
                        item.product?.images[0] ||
                        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80'
                      }
                      alt="Cart item"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-bold text-slate-900 leading-snug">
                          {item.customDesign
                            ? `Custom ${item.customDesign.mouldingStyle}`
                            : item.product?.name}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-500 font-mono-numbers mt-0.5">
                        {item.selectedSize || item.customDesign?.frameSize} ·{' '}
                        {item.selectedColor || item.customDesign?.frameColor}
                      </p>

                      {item.customDesign?.customText && (
                        <p className="text-[10px] text-emerald-800 italic mt-0.5 line-clamp-1">
                          "{item.customDesign.customText}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 mt-1">
                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-1.5 py-0.5">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono-numbers font-semibold text-[11px] px-1">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-bold text-slate-900 font-mono-numbers text-xs">
                        ₹{(item.unitPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Coupon Code section */}
          {cart.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-xs">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-emerald-800">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied ({appliedCoupon.discountPercent}% OFF)</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-emerald-700 hover:text-rose-600 text-xs font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Coupon code (e.g. WELCOME10)"
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg uppercase text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponMsg && (
                <p
                  className={`text-[10px] mt-1 ${
                    couponMsg.error ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {couponMsg.text}
                </p>
              )}
            </div>
          )}

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-white space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono-numbers">₹{subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Coupon Discount</span>
                    <span className="font-mono-numbers">-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Reinforced Transit & Courier</span>
                  <span className="font-mono-numbers">
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GST ({settings.taxRate}%)</span>
                  <span className="font-mono-numbers">₹{estimatedTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
                  <span>Order Total</span>
                  <span className="font-mono-numbers text-emerald-700">
                    ₹{finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
              >
                <span>Proceed to Authenticated Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Customer Login Required · No Guest Checkout</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
