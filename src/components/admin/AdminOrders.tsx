import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Eye,
  FileText,
  CreditCard,
  AlertCircle,
  Sliders,
  Send,
  MessageSquare,
  Download,
  Trash2,
} from 'lucide-react';
import { generateVectorInvoicePDF } from '../../utils/pdfGenerator';

interface AdminOrdersProps {
  initialFilter?: string;
  onOpenCashMemo: (orderId: string) => void;
  onOpenMakeInvoice?: () => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  initialFilter = 'all',
  onOpenCashMemo,
  onOpenMakeInvoice,
}) => {
  const {
    orders,
    updateOrderStatus,
    rejectOrder,
    deleteOrder,
    recordPayment,
    sendCustomNotification,
    settings,
    getCashMemoForOrder,
    generateFinalCashMemo,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>(initialFilter);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState<Order | null>(null);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);

  const handleQuickDownloadPdf = (order: Order) => {
    const memo = getCashMemoForOrder(order.id) || generateFinalCashMemo(order.id);
    generateVectorInvoicePDF(
      order,
      settings,
      memo,
      `${memo?.invoiceNumber || order.orderNumber}_Tax_Invoice.pdf`
    );
  };

  const handleDeleteOrder = (orderId: string) => {
    const ord = orders.find((o) => o.id === orderId);
    deleteOrder(orderId);
    setDeleteConfirmOrder(null);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(null);
    }
    setDeleteSuccessMsg(`Order ${ord?.orderNumber || ''} has been permanently deleted.`);
    setTimeout(() => setDeleteSuccessMsg(null), 3500);
  };

  // Modals
  const [rejectModalOrder, setRejectModalOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [paymentModalOrder, setPaymentModalOrder] = useState<Order | null>(null);
  const [offlinePaymentAmount, setOfflinePaymentAmount] = useState<number>(0);
  const [offlinePaymentRef, setOfflinePaymentRef] = useState<string>('');
  const [offlinePaymentMethod, setOfflinePaymentMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer'>('UPI');

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (selectedFilter !== 'all' && selectedFilter !== 'today') {
      if (selectedFilter === 'Pending' && o.productionStatus !== 'Pending') return false;
      if (selectedFilter === 'Confirmed' && o.productionStatus !== 'Confirmed') return false;
      if (selectedFilter === 'In Production' && o.productionStatus !== 'In Production') return false;
      if (selectedFilter === 'Ready for Delivery' && o.productionStatus !== 'Ready for Delivery') return false;
      if (selectedFilter === 'Completed' && o.productionStatus !== 'Completed' && o.productionStatus !== 'Delivered') return false;
      if (selectedFilter === 'Rejected' && o.productionStatus !== 'Rejected' && o.productionStatus !== 'Cancelled') return false;
    }
    if (selectedFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      if (!o.orderDate.startsWith(today)) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.items.some((i) => i.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
      case 'Completed':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'In Production':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Ready for Delivery':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'Confirmed':
      case 'Photo Review':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Rejected':
      case 'Cancelled':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const handleOpenOfflinePayment = (order: Order) => {
    setPaymentModalOrder(order);
    setOfflinePaymentAmount(order.balanceDue);
    setOfflinePaymentRef(`UPI-${Date.now().toString().slice(-6)}`);
  };

  const handleConfirmOfflinePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalOrder || offlinePaymentAmount <= 0) return;

    recordPayment({
      orderId: paymentModalOrder.id,
      amount: offlinePaymentAmount,
      paymentMethod: offlinePaymentMethod,
      transactionReference: offlinePaymentRef,
      notes: `Offline ${offlinePaymentMethod} recorded by Admin`,
    });

    setPaymentModalOrder(null);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalOrder || !rejectReason.trim()) return;

    rejectOrder(rejectModalOrder.id, rejectReason);
    setRejectModalOrder(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
            Order Management & Production Control
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of customer custom framing requests, workshop status changes, and balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenMakeInvoice && (
            <button
              onClick={onOpenMakeInvoice}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-200" />
              <span>Make Invoice</span>
            </button>
          )}
          <span className="text-xs font-mono-numbers text-slate-500">
            Total in view: <strong>{filteredOrders.length}</strong>
          </span>
        </div>
      </div>

      {/* Delete Success Alert Banner */}
      {deleteSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{deleteSuccessMsg}</span>
          </div>
          <button
            onClick={() => setDeleteSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'Pending', label: 'Pending' },
            { id: 'Confirmed', label: 'Confirmed' },
            { id: 'In Production', label: 'In Production' },
            { id: 'Ready for Delivery', label: 'Ready' },
            { id: 'Completed', label: 'Completed' },
            { id: 'Rejected', label: 'Rejected / Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                selectedFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, phone, customer..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Main Orders Table (Mandated 14 columns by Section 7) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">S.No</th>
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Mobile</th>
                <th className="py-3 px-3">Product Name</th>
                <th className="py-3 px-3 text-center">Qty</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-right">Advance Paid</th>
                <th className="py-3 px-3 text-right">Balance Due</th>
                <th className="py-3 px-3 text-center">Payment</th>
                <th className="py-3 px-3 text-center">Production</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-14 text-center text-slate-400">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">No Orders Found</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto">
                      {searchQuery
                        ? 'Try searching with another keyword or resetting filters.'
                        : 'No orders in this view. Click "Make Invoice" above to generate your first customer bill.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, idx) => (
                <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono-numbers text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-3 font-mono-numbers font-bold text-slate-900">
                    {order.orderNumber}
                  </td>
                  <td className="py-3 px-3 font-mono-numbers text-slate-500">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {order.customerName}
                  </td>
                  <td className="py-3 px-3 font-mono-numbers text-slate-600">
                    {order.customerPhone}
                  </td>
                  <td className="py-3 px-3 text-slate-800 max-w-[160px] truncate">
                    {order.items.map((i) => i.name).join(', ')}
                  </td>
                  <td className="py-3 px-3 text-center font-mono-numbers">
                    {order.items.reduce((s, i) => s + i.quantity, 0)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono-numbers font-bold text-slate-900">
                    ₹{order.orderTotal.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono-numbers font-semibold text-emerald-700">
                    ₹{order.advancePaid.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono-numbers font-semibold text-amber-700">
                    ₹{order.balanceDue.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        order.paymentStatus === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : order.paymentStatus === 'Partially Paid'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(
                        order.productionStatus
                      )}`}
                    >
                      {order.productionStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Cash memo print */}
                      <button
                        onClick={() => onOpenCashMemo(order.id)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-slate-100 cursor-pointer"
                        title="Print / View Cash Memo"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      {/* Quick Download PDF */}
                      <button
                        onClick={() => handleQuickDownloadPdf(order)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                        title="Download Invoice as PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Record payment button if balance due */}
                      {order.balanceDue > 0 && (
                        <button
                          onClick={() => handleOpenOfflinePayment(order)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-slate-100 cursor-pointer"
                          title="Record Payment"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                      )}

                      {/* Inspect details */}
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                        title="Inspect Order & Workflow"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Delete Order */}
                      <button
                        onClick={() => setDeleteConfirmOrder(order)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                        title="Delete Order Permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Order Workflow Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 my-8 relative max-h-[90vh] overflow-y-auto text-xs space-y-6">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                  Order Management
                </span>
                <h3 className="text-xl font-bold font-serif-luxury text-slate-900">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <span
                className={`px-3 py-1 rounded-md text-xs font-bold border ${getStatusBadge(
                  selectedOrder.productionStatus
                )}`}
              >
                {selectedOrder.productionStatus}
              </span>
            </div>

            {/* Quick Status Transition Actions */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                Advance Production Status Workflow
              </h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'Confirmed', 'Admin verified frame specs');
                    setSelectedOrder(null);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 font-semibold rounded-lg border border-emerald-300 cursor-pointer"
                >
                  ✓ Confirm Order
                </button>
                <button
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'Photo Review', 'Inspecting uploaded photo resolution');
                    setSelectedOrder(null);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-800 font-semibold rounded-lg border border-amber-300 cursor-pointer"
                >
                  Photo Review
                </button>
                <button
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'In Production', 'Wood moulding cutting and v-nailing');
                    setSelectedOrder(null);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-800 font-semibold rounded-lg border border-blue-300 cursor-pointer"
                >
                  In Production
                </button>
                <button
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'Ready for Delivery', 'QC passed and crated');
                    setSelectedOrder(null);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-purple-50 text-purple-800 font-semibold rounded-lg border border-purple-300 cursor-pointer"
                >
                  Ready for Delivery
                </button>
                <button
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'Delivered', 'Delivered to customer');
                    setSelectedOrder(null);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Mark Delivered (Final Cash Memo)
                </button>
                <button
                  onClick={() => {
                    setRejectModalOrder(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 font-semibold rounded-lg border border-rose-300 cursor-pointer"
                >
                  ✕ Reject Order
                </button>
              </div>
            </div>

            {/* Uploaded Customer Photos Preview */}
            {selectedOrder.items.some((i) => i.customPhotoUrl) && (
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-2">
                  Customer Uploaded Photo(s)
                </h4>
                <div className="flex gap-3">
                  {selectedOrder.items
                    .filter((i) => i.customPhotoUrl)
                    .map((item, idx) => (
                      <div key={idx} className="w-28 h-28 rounded-xl overflow-hidden border border-slate-300">
                        <img
                          src={item.customPhotoUrl}
                          alt="Customer photograph"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Audit Status History */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-2">
                Status History Audit Trail
              </h4>
              <div className="space-y-2 border-l-2 border-slate-200 pl-3">
                {selectedOrder.statusHistory.map((item) => (
                  <div key={item.id} className="relative">
                    <span className="font-bold text-slate-900">{item.status}</span> ·{' '}
                    <span className="text-slate-500 font-mono-numbers">
                      {new Date(item.changedAt).toLocaleString()}
                    </span>{' '}
                    by <span className="font-medium text-emerald-800">{item.changedBy}</span>
                    {item.comment && (
                      <p className="text-[11px] text-slate-600 mt-0.5">{item.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => {
                  const toDelete = selectedOrder;
                  setSelectedOrder(null);
                  setDeleteConfirmOrder(toDelete);
                }}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl border border-rose-200 text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Permanently remove order"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Delete Order</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleQuickDownloadPdf(selectedOrder)}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                  title="Directly save PDF file to computer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Invoice PDF</span>
                </button>
                <button
                  onClick={() => {
                    onOpenCashMemo(selectedOrder.id);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Open Invoice Generator</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Offline Payment Modal */}
      {paymentModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-xl space-y-4 text-xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Record Payment for {paymentModalOrder.orderNumber}
              </h3>
              <p className="text-slate-500 mt-0.5">
                Outstanding Balance Due: ₹{paymentModalOrder.balanceDue.toLocaleString()}
              </p>
            </div>

            <form onSubmit={handleConfirmOfflinePayment} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount to Record (₹)</label>
                <input
                  type="number"
                  min="1"
                  max={paymentModalOrder.balanceDue}
                  required
                  value={offlinePaymentAmount}
                  onChange={(e) => setOfflinePaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono-numbers font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={offlinePaymentMethod}
                  onChange={(e) => setOfflinePaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Cash">Cash at Studio Counter</option>
                  <option value="Bank Transfer">NEFT / RTGS Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transaction Ref / Note</label>
                <input
                  type="text"
                  required
                  value={offlinePaymentRef}
                  onChange={(e) => setOfflinePaymentRef(e.target.value)}
                  placeholder="e.g. UPI-98124012"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalOrder(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                >
                  Verify & Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Order Reason Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-xl space-y-4 text-xs">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                Reject Order {rejectModalOrder.orderNumber}
              </h3>
              <p className="text-slate-500 mt-1">
                A rejection notification with your reason will be dispatched to customer {rejectModalOrder.customerPhone}.
              </p>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rejection Reason (Required)
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Image resolution under 150 DPI for 16x20 enlargement; client requested refund..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOrder(null)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Order Confirmation Modal */}
      {deleteConfirmOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Delete Order Permanently?
                </h3>
                <p className="text-slate-500 text-[11px] font-mono-numbers">
                  Order {deleteConfirmOrder.orderNumber}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2 text-slate-700">
              <p className="text-xs text-rose-800 font-semibold">
                Are you sure you want to delete this order?
              </p>
              <div className="text-[11px] space-y-1 font-mono-numbers text-slate-600">
                <div className="flex justify-between">
                  <span className="font-sans">Customer:</span>
                  <span className="font-bold text-slate-900">{deleteConfirmOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans">Mobile:</span>
                  <span>{deleteConfirmOrder.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans">Framed Items:</span>
                  <span>{deleteConfirmOrder.items.length} frame(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans">Total Order Value:</span>
                  <span className="font-bold text-slate-900">₹{deleteConfirmOrder.orderTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans">Payment Status:</span>
                  <span>{deleteConfirmOrder.paymentStatus}</span>
                </div>
              </div>
              <p className="text-[10px] text-rose-600 pt-1 border-t border-rose-200 leading-tight">
                This will permanently delete this order, associated payments, and invoice cash memos from your database. This action cannot be reversed.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOrder(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteOrder(deleteConfirmOrder.id)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
