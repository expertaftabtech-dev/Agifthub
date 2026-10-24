import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Address, PaymentMethod } from '../../types';
import {
  X,
  ShieldCheck,
  CheckCircle,
  Truck,
  CreditCard,
  QrCode,
  ArrowRight,
  FileText,
  UserCheck,
} from 'lucide-react';
import { generateQRCodeSVG, buildUpiUri } from '../../utils/qrGenerator';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
  onNavigateToDashboard: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
  onNavigateToDashboard,
}) => {
  const {
    currentUser,
    cart,
    appliedCoupon,
    settings,
    createOrder,
  } = useStore();

  const [shippingAddress, setShippingAddress] = useState<Address>({
    id: `addr-${Date.now()}`,
    userId: currentUser?.id || '',
    fullName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    street: 'Flat 402, Lotus Orchid, MG Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560001',
    isDefault: true,
  });

  const [paymentOption, setPaymentOption] = useState<'full' | 'advance50'>('full');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);

  if (!isOpen) return null;

  // Enforce Mandatory Requirement: No Guest Checkout!
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-8 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-serif-luxury text-slate-900">
            Customer Login Required
          </h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            As per studio security policy, guest checkout is not permitted for custom photo frame fabrication. Please sign in or register to secure your order and preview your prints.
          </p>
          <div className="mt-6 space-y-2">
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm cursor-pointer shadow-md"
            >
              Sign In or Register Now
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Financial Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discountAmount = appliedCoupon
    ? Math.round((subtotal * appliedCoupon.discountPercent) / 100)
    : 0;
  const isFreeDelivery = subtotal - discountAmount >= settings.freeDeliveryThreshold;
  const deliveryCharge = isFreeDelivery ? 0 : settings.standardDeliveryCharge;
  const taxableBase = subtotal - discountAmount;
  const taxAmount = Math.round((taxableBase * settings.taxRate) / 100);
  const orderTotal = taxableBase + deliveryCharge + taxAmount;

  const advancePaymentAmount =
    paymentOption === 'full' ? orderTotal : Math.round(orderTotal * 0.5);
  const balanceDueOnDelivery = Math.max(0, orderTotal - advancePaymentAmount);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const order = createOrder({
      customerId: currentUser.id,
      customerName: shippingAddress.fullName || currentUser.name,
      customerPhone: shippingAddress.phone || currentUser.phone,
      customerEmail: currentUser.email,
      shippingAddress,
      items: cart,
      paymentMethod,
      advancePaymentAmount,
    });

    setCreatedOrder(order);
  };

  // Official UPI QR Code for payment
  const upiUri = buildUpiUri({
    upiId: settings.upiId,
    storeName: settings.storeName,
    amount: advancePaymentAmount,
    orderNumber: 'NEW',
  });
  const upiQrSvg = generateQRCodeSVG(upiUri, 130);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {createdOrder ? (
          /* Order Placement Success View */
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                Order Confirmed
              </span>
              <h3 className="text-2xl font-serif-luxury font-bold text-slate-900 mt-1">
                Thank you, {createdOrder.customerName}!
              </h3>
              <p className="text-xs text-slate-600 mt-1 font-mono-numbers">
                Unique Order ID: <strong className="text-slate-900 font-bold">{createdOrder.orderNumber}</strong>
              </p>
            </div>

            {/* Notification alert summary */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-left max-w-md mx-auto space-y-2">
              <p className="text-slate-700">
                ✅ Order details dispatched to your email: <strong>{createdOrder.customerEmail}</strong>
              </p>
              <p className="text-slate-700">
                📲 Studio WhatsApp notification sent to owner: <strong>{settings.adminWhatsAppNumber}</strong>
              </p>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-mono-numbers">
                <span>Total Amount:</span>
                <span className="font-bold">₹{createdOrder.orderTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-mono-numbers text-emerald-700 font-semibold">
                <span>Amount Paid ({createdOrder.paymentStatus}):</span>
                <span>₹{createdOrder.advancePaid.toLocaleString()}</span>
              </div>
              {createdOrder.balanceDue > 0 && (
                <div className="flex justify-between font-mono-numbers text-amber-700">
                  <span>Balance Due on Delivery:</span>
                  <span>₹{createdOrder.balanceDue.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={() => {
                  onClose();
                  onNavigateToDashboard();
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
              >
                Track in Customer Dashboard
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Return to Store
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handlePlaceOrder} className="space-y-6 text-xs">
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                Authenticated Checkout
              </span>
              <h2 className="text-xl font-bold font-serif-luxury text-slate-900 mt-0.5">
                Delivery & Payment Finalization
              </h2>
              <p className="text-slate-500 text-[11px]">
                Signed in as <strong>{currentUser.name}</strong> ({currentUser.email})
              </p>
            </div>

            {/* Delivery Address */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-700" />
                <span>1. Safe-Transit Shipping Address</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.fullName}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, fullName: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, phone: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-medium mb-1">
                    Street Address & Landmark
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.street}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, street: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">PIN Code</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.postalCode}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                <span>2. Payment Terms</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentOption('full')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    paymentOption === 'full'
                      ? 'border-emerald-600 bg-white ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white/60'
                  }`}
                >
                  <p className="font-bold text-slate-900">Full 100% Payment</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Pay in full now via UPI or Card</p>
                  <p className="text-xs font-mono-numbers font-bold text-emerald-700 mt-1">
                    ₹{orderTotal.toLocaleString()}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption('advance50')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    paymentOption === 'advance50'
                      ? 'border-emerald-600 bg-white ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white/60'
                  }`}
                >
                  <p className="font-bold text-slate-900">50% Advance Booking</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Balance due on delivery</p>
                  <p className="text-xs font-mono-numbers font-bold text-emerald-700 mt-1">
                    Pay ₹{advancePaymentAmount.toLocaleString()} now
                  </p>
                </button>
              </div>

              {/* UPI QR Display Box */}
              <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                <div
                  className="shrink-0 p-1.5 border border-slate-200 rounded-lg bg-white"
                  dangerouslySetInnerHTML={{ __html: upiQrSvg }}
                />
                <div className="text-left space-y-1">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-emerald-700" />
                    <span>Instant Studio UPI Scan & Pay</span>
                  </p>
                  <p className="text-[11px] text-slate-600 font-mono">
                    UPI ID: <strong>{settings.upiId}</strong>
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Scan with PhonePe, Google Pay, Paytm, or BHIM. Verified payment records automatically update in your studio account.
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal ({cart.length} items)</span>
                <span className="font-mono-numbers">₹{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Savings</span>
                  <span className="font-mono-numbers">-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Safe-Transit Courier</span>
                <span className="font-mono-numbers">
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>GST Tax ({settings.taxRate}%)</span>
                <span className="font-mono-numbers">₹{taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-slate-800 text-white">
                <span>Total Order Value:</span>
                <span className="font-mono-numbers text-emerald-400">
                  ₹{orderTotal.toLocaleString()}
                </span>
              </div>
              {balanceDueOnDelivery > 0 && (
                <div className="flex justify-between text-amber-300 text-[11px] pt-1">
                  <span>Balance Due upon Delivery:</span>
                  <span className="font-mono-numbers">₹{balanceDueOnDelivery.toLocaleString()}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
            >
              <span>Confirm & Place Framing Order (Pay ₹{advancePaymentAmount.toLocaleString()})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
