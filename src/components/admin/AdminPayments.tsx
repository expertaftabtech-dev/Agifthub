import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PaymentMethod } from '../../types';
import {
  CreditCard,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter,
  FileText,
  Building,
  QrCode,
} from 'lucide-react';

export const AdminPayments: React.FC<{ onOpenCashMemo: (orderId: string) => void }> = ({
  onOpenCashMemo,
}) => {
  const { payments, orders, recordPayment, settings } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // New offline payment form state
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    orders.find((o) => o.balanceDue > 0)?.id || orders[0]?.id || ''
  );
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('UPI');
  const [payRef, setPayRef] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');

  // Calculations
  const totalOrderValue = orders.reduce((sum, o) => sum + o.orderTotal, 0);
  const totalPaymentsReceived = payments
    .filter((p) => p.verificationStatus === 'Verified')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalOutstandingBalance = orders
    .filter((o) => o.productionStatus !== 'Cancelled' && o.productionStatus !== 'Rejected')
    .reduce((sum, o) => sum + o.balanceDue, 0);

  const unpaidOrdersCount = orders.filter((o) => o.paymentStatus === 'Pending').length;
  const partiallyPaidCount = orders.filter((o) => o.paymentStatus === 'Partially Paid').length;
  const fullyPaidCount = orders.filter((o) => o.paymentStatus === 'Paid').length;

  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
  const overdueAmount = orders
    .filter((o) => o.balanceDue > 0 && new Date(o.orderDate).getTime() < threeDaysAgo)
    .reduce((sum, o) => sum + o.balanceDue, 0);

  // Filtered payments
  const filteredPayments = payments.filter((p) => {
    if (filterMethod !== 'all' && p.paymentMethod !== filterMethod) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.paymentNumber.toLowerCase().includes(q) ||
        p.orderNumber.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.transactionReference.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenRecord = () => {
    const defaultOrder = orders.find((o) => o.balanceDue > 0) || orders[0];
    if (defaultOrder) {
      setSelectedOrderId(defaultOrder.id);
      setPayAmount(defaultOrder.balanceDue);
      setPayRef(`UPI-SETTLE-${Date.now().toString().slice(-6)}`);
    }
    setIsRecordModalOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || payAmount <= 0) return;

    recordPayment({
      orderId: selectedOrderId,
      amount: payAmount,
      paymentMethod: payMethod,
      transactionReference: payRef,
      notes: payNotes,
    });

    setIsRecordModalOpen(false);
    setPayNotes('');
  };

  const chosenOrder = orders.find((o) => o.id === selectedOrderId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
            Payment Reconciliation & Balance Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of UPI transfers, counter cash, advances, and outstanding customer balances.
          </p>
        </div>

        <button
          onClick={handleOpenRecord}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Offline / UPI Payment</span>
        </button>
      </div>

      {/* 9 Payment Dashboard Metric Cards mandated by Section 8 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Order Value</p>
          <p className="text-lg font-bold font-mono-numbers text-slate-900 mt-1">
            ₹{totalOrderValue.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Payments Received</p>
          <p className="text-lg font-bold font-mono-numbers text-emerald-700 mt-1">
            ₹{totalPaymentsReceived.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Outstanding Balance</p>
          <p className="text-lg font-bold font-mono-numbers text-amber-700 mt-1">
            ₹{totalOutstandingBalance.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Overdue Payments</p>
          <p className="text-lg font-bold font-mono-numbers text-rose-700 mt-1">
            ₹{overdueAmount.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Order Breakdown</p>
          <p className="text-xs font-mono-numbers text-slate-700 mt-1">
            <span className="text-emerald-700 font-bold">{fullyPaidCount} Paid</span> ·{' '}
            <span className="text-amber-700 font-bold">{partiallyPaidCount} Partial</span> ·{' '}
            <span className="text-rose-700 font-bold">{unpaidOrdersCount} Unpaid</span>
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search payments by ref, customer, order..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Method:</span>
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="all">All Payment Methods</option>
            <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
            <option value="Cash">Cash at Counter</option>
            <option value="Online Gateway">Online Gateway (Razorpay)</option>
            <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
          </select>
        </div>
      </div>

      {/* Payment Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Method</th>
                <th className="py-3 px-3">Reference / UTR</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-right">Amount (₹)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-slate-400">
                    <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">No Payments Recorded Yet</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Payments received through invoices or counter settlements will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono-numbers font-bold text-slate-900">
                    {pay.paymentNumber}
                  </td>
                  <td className="py-3 px-3 font-mono-numbers text-slate-700">
                    {pay.orderNumber}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {pay.customerName}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {pay.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">
                    {pay.transactionReference}
                  </td>
                  <td className="py-3 px-3 font-mono-numbers text-slate-500">
                    {new Date(pay.paymentDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono-numbers font-bold text-emerald-700">
                    ₹{pay.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Verified
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onOpenCashMemo(pay.orderId)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100 cursor-pointer"
                      title="View Order Cash Memo"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative text-xs space-y-4">
            <div>
              <h3 className="font-bold font-serif-luxury text-slate-900 text-base">
                Record Verified Payment
              </h3>
              <p className="text-slate-500 mt-0.5">
                Record UPI settlement, cash counter receipt, or direct bank transfer.
              </p>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Order</label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => {
                    setSelectedOrderId(e.target.value);
                    const ord = orders.find((o) => o.id === e.target.value);
                    if (ord) setPayAmount(ord.balanceDue);
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} - {o.customerName} (Due: ₹{o.balanceDue})
                    </option>
                  ))}
                </select>
              </div>

              {chosenOrder && (
                <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] space-y-0.5 text-slate-600 font-mono-numbers">
                  <p>Order Total: ₹{chosenOrder.orderTotal.toLocaleString()}</p>
                  <p className="text-emerald-700">Already Paid: ₹{chosenOrder.advancePaid.toLocaleString()}</p>
                  <p className="font-bold text-amber-700">Remaining Due: ₹{chosenOrder.balanceDue.toLocaleString()}</p>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Received Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono-numbers font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm / BHIM)</option>
                  <option value="Cash">Cash at Studio Counter</option>
                  <option value="Bank Transfer">Direct Bank Transfer (NEFT/RTGS)</option>
                  <option value="Online Gateway">Online Gateway (Razorpay/Card)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Transaction Reference / UTR
                </label>
                <input
                  type="text"
                  required
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="UPI-982348102"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Receipt Ref</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Verified with HDFC settlement slip"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Confirm & Update Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
