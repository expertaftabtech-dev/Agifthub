import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PaymentMethod, PaymentStatus, OrderStatus } from '../../types';
import {
  FileText,
  X,
  Plus,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  CreditCard,
  Calendar,
  CheckCircle,
  FileCheck,
} from 'lucide-react';

interface InvoiceItemState {
  name: string;
  size: string;
  material: string;
  color: string;
  quantity: number;
  price: number;
  customText: string;
}

interface MakeInvoiceModalProps {
  onClose: () => void;
  onInvoiceCreated: (orderId: string) => void;
}

const COMMON_SIZES = [
  '8x10 inch',
  '10x12 inch',
  '12x18 inch',
  '16x20 inch',
  '18x24 inch',
  '20x30 inch',
  '24x36 inch',
];

export const MakeInvoiceModal: React.FC<MakeInvoiceModalProps> = ({
  onClose,
  onInvoiceCreated,
}) => {
  const { products, settings, createManualInvoice } = useStore();

  // Customer Information
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('New Delhi');
  const [state, setState] = useState('Delhi');
  const [postalCode, setPostalCode] = useState('110001');

  // Items
  const [items, setItems] = useState<InvoiceItemState[]>([
    {
      name: products[0]?.name || 'Artisan Teakwood Heritage Frame',
      size: '12x18 inch',
      material: products[0]?.material || 'Handcrafted Teakwood',
      color: products[0]?.color || 'Natural Amber Teak',
      quantity: 1,
      price: products[0]?.sellingPrice || 1499,
      customText: '',
    },
  ]);

  // Financials & Discounts
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [shippingCharge, setShippingCharge] = useState<number>(0);
  const [applyTax, setApplyTax] = useState<boolean>(true);

  // Payment
  const [paymentOption, setPaymentOption] = useState<'full' | 'advance' | 'unpaid'>('full');
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [transactionRef, setTransactionRef] = useState('');

  // Production Status & Delivery
  const [productionStatus, setProductionStatus] = useState<OrderStatus>('Confirmed');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  });
  const [internalNotes, setInternalNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const effectiveDiscount = Math.min(discountAmount || 0, subtotal);
  const taxableBase = Math.max(0, subtotal - effectiveDiscount);
  const taxRate = applyTax ? settings.taxRate || 18 : 0;
  const taxAmount = Math.round((taxableBase * taxRate) / 100);
  const orderTotal = taxableBase + (shippingCharge || 0) + taxAmount;

  // Sync advance paid when total or payment option changes
  const computedAdvance =
    paymentOption === 'full'
      ? orderTotal
      : paymentOption === 'unpaid'
      ? 0
      : Math.min(advancePaid, orderTotal);

  const balanceDue = Math.max(0, orderTotal - computedAdvance);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        name: 'Custom Wood Photo Frame',
        size: '12x18 inch',
        material: 'Handcrafted Wood',
        color: 'Natural Wood',
        quantity: 1,
        price: 1200,
        customText: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItemState, value: any) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleCatalogProductSelect = (index: number, productId: string) => {
    const found = products.find((p) => p.id === productId);
    if (!found) return;

    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        name: found.name,
        size: found.frameSize,
        material: found.material,
        color: found.color,
        price: found.sellingPrice,
      };
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!customerName.trim()) {
      setFormError('Please enter the customer name.');
      return;
    }
    if (!customerPhone.trim()) {
      setFormError('Please enter the customer mobile number.');
      return;
    }
    if (items.length === 0) {
      setFormError('Please include at least one photo frame item in the invoice.');
      return;
    }

    let paymentStatus: PaymentStatus = 'Pending';
    if (computedAdvance >= orderTotal && orderTotal > 0) {
      paymentStatus = 'Paid';
    } else if (computedAdvance > 0) {
      paymentStatus = 'Partially Paid';
    }

    const createdOrder = createManualInvoice({
      customerName,
      customerPhone,
      customerEmail: customerEmail.trim() || undefined,
      address: {
        street: street.trim() || 'Studio Counter Pickup',
        city: city.trim() || 'New Delhi',
        state: state.trim() || 'Delhi',
        postalCode: postalCode.trim() || '110001',
      },
      items,
      subtotal,
      discountAmount: effectiveDiscount,
      shippingCharge: shippingCharge || 0,
      taxAmount,
      orderTotal,
      advancePaid: computedAdvance,
      paymentMethod,
      paymentStatus,
      productionStatus,
      transactionReference: transactionRef.trim() || undefined,
      internalNotes: internalNotes.trim() || undefined,
      deliveryDate,
    });

    onClose();
    onInvoiceCreated(createdOrder.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif-luxury tracking-tight text-white flex items-center gap-2">
                <span>Make Studio Invoice</span>
                <span className="text-[10px] font-sans font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Counter Billing
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Generate official photo frame invoice, record customer details, and print cash memo receipt.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-medium animate-in fade-in">
              {formError}
            </div>
          )}

          {/* Section 1: Customer Details */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-700" />
              <span>Customer & Delivery Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rahul Verma"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 text-xs font-mono-numbers"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer Email <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@gmail.com"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Street / Address / Landmark <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. Flat 301, Sector 14, Ring Road"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">PIN / Postal Code</label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 text-xs font-mono-numbers"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-700" />
                <span>Invoice Frame Items ({items.length})</span>
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2.5 relative group"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-800 font-mono-numbers text-[11px]">
                      Item #{index + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    {/* Catalog Quick Select */}
                    <div className="sm:col-span-5">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Frame / Artwork Title
                      </label>
                      <input
                        type="text"
                        required
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        placeholder="e.g. Royal Teakwood Heritage Frame"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                      {products.length > 0 && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                          <span>Or pick catalog:</span>
                          <select
                            onChange={(e) => handleCatalogProductSelect(index, e.target.value)}
                            className="bg-transparent border-none text-emerald-700 font-semibold underline cursor-pointer p-0"
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Select frame product...
                            </option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} (₹{p.sellingPrice})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Size */}
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">Size</label>
                      <input
                        type="text"
                        required
                        value={item.size}
                        onChange={(e) => handleItemChange(index, 'size', e.target.value)}
                        list="size-suggestions"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                      <datalist id="size-suggestions">
                        {COMMON_SIZES.map((s) => (
                          <option key={s} value={s} />
                        ))}
                      </datalist>
                    </div>

                    {/* Qty */}
                    <div className="sm:col-span-1">
                      <label className="block font-semibold text-slate-700 mb-1">Qty</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)
                        }
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono-numbers text-center"
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">Rate (₹)</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={item.price}
                        onChange={(e) =>
                          handleItemChange(index, 'price', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono-numbers"
                      />
                    </div>

                    {/* Line Total */}
                    <div className="sm:col-span-2 text-right">
                      <label className="block font-semibold text-slate-500 mb-1">Total</label>
                      <p className="py-1.5 font-bold text-slate-900 font-mono-numbers text-sm">
                        ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                    <div>
                      <input
                        type="text"
                        value={item.material}
                        onChange={(e) => handleItemChange(index, 'material', e.target.value)}
                        placeholder="Material (e.g. Teakwood)"
                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-[11px]"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={item.color}
                        onChange={(e) => handleItemChange(index, 'color', e.target.value)}
                        placeholder="Finish / Color (e.g. Natural Teak)"
                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-[11px]"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={item.customText}
                        onChange={(e) => handleItemChange(index, 'customText', e.target.value)}
                        placeholder="Custom engraving / note"
                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Financials & Settlement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Method & Status */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span>Payment & Settlement</span>
              </h3>

              <div className="space-y-2">
                <label className="block font-semibold text-slate-700">Payment Condition</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentOption('full');
                      setAdvancePaid(orderTotal);
                    }}
                    className={`py-1.5 px-2 rounded-lg font-semibold text-center border cursor-pointer transition-all ${
                      paymentOption === 'full'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Paid in Full
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentOption('advance');
                      setAdvancePaid(Math.round(orderTotal / 2));
                    }}
                    className={`py-1.5 px-2 rounded-lg font-semibold text-center border cursor-pointer transition-all ${
                      paymentOption === 'advance'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Advance (Part)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentOption('unpaid');
                      setAdvancePaid(0);
                    }}
                    className={`py-1.5 px-2 rounded-lg font-semibold text-center border cursor-pointer transition-all ${
                      paymentOption === 'unpaid'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Unpaid / Due
                  </button>
                </div>
              </div>

              {paymentOption === 'advance' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Advance Amount Received (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={orderTotal}
                    value={advancePaid}
                    onChange={(e) => setAdvancePaid(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono-numbers"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs cursor-pointer"
                  >
                    <option value="Cash">Cash (Counter)</option>
                    <option value="UPI">UPI (QR / ID)</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="Online Gateway">Card / Gateway</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ref / Transaction ID
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="e.g. UPI-9921820"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Workshop Status</label>
                  <select
                    value={productionStatus}
                    onChange={(e) => setProductionStatus(e.target.value as OrderStatus)}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs cursor-pointer"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="In Production">In Production</option>
                    <option value="Ready for Delivery">Ready for Delivery</option>
                    <option value="Completed">Completed / Handed Over</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Date</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center justify-between">
                  <span>Billing Summary</span>
                  <span className="font-mono text-xs text-slate-400">All amounts in INR (₹)</span>
                </h3>

                <div className="space-y-2 pt-2 divide-y divide-slate-200/60 text-xs">
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-600">Items Subtotal:</span>
                    <span className="font-semibold text-slate-900 font-mono-numbers">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1.5">
                    <span className="text-slate-600">Discount:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">-₹</span>
                      <input
                        type="number"
                        min="0"
                        max={subtotal}
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-0.5 bg-white border border-slate-200 rounded text-right font-mono-numbers text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1.5">
                    <span className="text-slate-600">Delivery / Shipping:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">+₹</span>
                      <input
                        type="number"
                        min="0"
                        value={shippingCharge}
                        onChange={(e) => setShippingCharge(parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-0.5 bg-white border border-slate-200 rounded text-right font-mono-numbers text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1.5">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
                      <input
                        type="checkbox"
                        checked={applyTax}
                        onChange={(e) => setApplyTax(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>GST ({settings.taxRate}%)</span>
                    </label>
                    <span className="font-semibold text-slate-900 font-mono-numbers">
                      ₹{taxAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between pt-2 text-sm font-bold text-slate-900">
                    <span>Invoice Grand Total:</span>
                    <span className="text-emerald-700 font-mono-numbers">
                      ₹{orderTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Outstanding Due Badge */}
              <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <p className="text-[10px] uppercase font-bold text-emerald-700">Amount Paid</p>
                  <p className="text-sm font-bold font-mono-numbers">
                    ₹{computedAdvance.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className={`p-2 rounded-lg border ${
                  balanceDue > 0
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  <p className="text-[10px] uppercase font-bold">Balance Due</p>
                  <p className="text-sm font-bold font-mono-numbers">
                    ₹{balanceDue.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Internal Workshop Notes / Special Instructions
            </label>
            <textarea
              rows={2}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="e.g. High-gloss anti-glare glass requested. Hanging wire installed on rear."
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Generates real database order, payment ledger record, and cash memo receipt.</span>
            </span>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
              >
                <FileCheck className="w-4 h-4" />
                <span>Generate & Open Invoice</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
