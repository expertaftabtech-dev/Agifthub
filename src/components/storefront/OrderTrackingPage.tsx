import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import { Search, Package, CheckCircle, Clock, Truck, FileText, ArrowRight, Download } from 'lucide-react';
import { generateVectorInvoicePDF } from '../../utils/pdfGenerator';

export const OrderTrackingPage: React.FC<{
  onOpenCashMemo: (orderId: string) => void;
  onNavigateToCustomizer: () => void;
}> = ({ onOpenCashMemo, onNavigateToCustomizer }) => {
  const { orders, settings, getCashMemoForOrder, generateFinalCashMemo } = useStore();
  const [query, setQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const clean = query.trim().toUpperCase();
    const found = orders.find(
      (o) =>
        o.orderNumber.toUpperCase() === clean ||
        o.customerPhone.includes(clean) ||
        o.customerEmail.toLowerCase() === clean.toLowerCase()
    );

    if (found) {
      setSearchedOrder(found);
    } else {
      setErrorMsg(`No order found matching "${query}". Please check your order ID (e.g. PFS-2026-00001).`);
      setSearchedOrder(null);
    }
  };

  const getStatusSteps = (currentStatus: OrderStatus) => {
    const steps: OrderStatus[] = [
      'Pending',
      'Confirmed',
      'Photo Review',
      'In Production',
      'Ready for Delivery',
      'Delivered',
    ];
    const currentIndex = steps.indexOf(currentStatus);
    return steps.map((step, idx) => ({
      name: step,
      isCompleted: currentIndex >= idx,
      isCurrent: currentStatus === step,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
          Agifthub Live Dispatch
        </span>
        <h1 className="text-3xl font-serif-luxury font-bold text-slate-900 tracking-tight">
          Track Your Framing Order
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Enter your unique order number (e.g. <strong>PFS-2026-00001</strong>) or registered mobile number to see real-time craftsman workbench updates.
        </p>
      </div>

      {/* Search Box */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter Order ID (e.g. PFS-2026-00001)"
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
        >
          Track Order
        </button>
      </form>

      {errorMsg && (
        <div className="max-w-md mx-auto p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs text-center">
          {errorMsg}
        </div>
      )}

      {/* Searched Order Card */}
      {searchedOrder && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-mono-numbers font-bold text-emerald-700">
                {searchedOrder.orderNumber}
              </span>
              <h3 className="text-lg font-bold font-serif-luxury text-slate-900 mt-0.5">
                Recipient: {searchedOrder.customerName}
              </h3>
              <p className="text-xs text-slate-500 font-mono-numbers">
                Ordered on {new Date(searchedOrder.orderDate).toLocaleDateString()}
              </p>
            </div>

            <div className="text-right">
              <span className="px-3 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {searchedOrder.productionStatus}
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Est. Delivery: <strong>{searchedOrder.estimatedDeliveryDate || '3-5 Days'}</strong>
              </p>
            </div>
          </div>

          {/* Stepper */}
          <div className="py-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-4 text-center">
              Crafting & Fulfillment Milestones
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
              {getStatusSteps(searchedOrder.productionStatus).map((step, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 ${
                    step.isCompleted
                      ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900 font-semibold'
                      : 'border-slate-200 bg-slate-50 text-slate-400'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white border border-current flex items-center justify-center text-[10px] font-bold">
                    {step.isCompleted ? '✓' : idx + 1}
                  </span>
                  <span className="text-[11px] leading-tight">{step.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Items & Payment snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="space-y-1.5">
              <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                Framed Pieces
              </p>
              {searchedOrder.items.map((i) => (
                <p key={i.id} className="text-slate-700">
                  • <strong>{i.name}</strong> ({i.size}) x {i.quantity}
                </p>
              ))}
            </div>

            <div className="text-right space-y-1 font-mono-numbers">
              <p className="text-slate-600">
                Total Order Value: ₹{searchedOrder.orderTotal.toLocaleString()}
              </p>
              <p className="text-emerald-700 font-semibold">
                Amount Paid: ₹{searchedOrder.advancePaid.toLocaleString()}
              </p>
              {searchedOrder.balanceDue > 0 && (
                <p className="text-amber-700 font-bold">
                  Balance Due on Delivery: ₹{searchedOrder.balanceDue.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-end gap-2">
            <button
              onClick={() => {
                const memo = getCashMemoForOrder(searchedOrder.id) || generateFinalCashMemo(searchedOrder.id);
                generateVectorInvoicePDF(
                  searchedOrder,
                  settings,
                  memo,
                  `${memo?.invoiceNumber || searchedOrder.orderNumber}_Invoice.pdf`
                );
              }}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
              title="Download Invoice as PDF"
            >
              <Download className="w-4 h-4" />
              <span>Download Invoice PDF</span>
            </button>
            <button
              onClick={() => onOpenCashMemo(searchedOrder.id)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>View Cash Memo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
