import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import {
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Eye,
  CreditCard,
  FileText,
  User as UserIcon,
  MapPin,
  Calendar,
  ExternalLink,
  Download,
} from 'lucide-react';
import { generateVectorInvoicePDF } from '../../utils/pdfGenerator';

interface CustomerDashboardProps {
  onOpenCashMemo: (orderId: string) => void;
  onNavigateToCatalog: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onOpenCashMemo,
  onNavigateToCatalog,
}) => {
  const { currentUser, orders, payments, settings, getCashMemoForOrder, generateFinalCashMemo } = useStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter orders for the logged-in customer (or show all if admin)
  const customerOrders = orders.filter((o) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return o.customerId === currentUser.id || o.customerEmail.toLowerCase() === currentUser.email.toLowerCase();
  });

  // Calculate dynamic metrics
  const totalOrders = customerOrders.length;
  const pendingOrders = customerOrders.filter((o) => o.productionStatus === 'Pending' || o.productionStatus === 'Photo Review').length;
  const inProductionOrders = customerOrders.filter((o) => o.productionStatus === 'In Production' || o.productionStatus === 'Confirmed').length;
  const completedOrders = customerOrders.filter((o) => o.productionStatus === 'Completed' || o.productionStatus === 'Delivered').length;
  const cancelledOrders = customerOrders.filter((o) => o.productionStatus === 'Cancelled' || o.productionStatus === 'Rejected').length;

  const totalAmount = customerOrders.reduce((sum, o) => sum + o.orderTotal, 0);
  const totalPaid = customerOrders.reduce((sum, o) => sum + o.advancePaid, 0);
  const totalBalanceDue = customerOrders.reduce((sum, o) => sum + o.balanceDue, 0);

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

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-sm font-semibold text-slate-800">Please sign in to access your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            Customer Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-slate-900 tracking-tight mt-0.5">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-mono-numbers">
            {currentUser.email} · {currentUser.phone}
          </p>
        </div>

        <button
          onClick={onNavigateToCatalog}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          Browse New Frames
        </button>
      </div>

      {/* 8 Statistic Cards mandated by Section 10 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Orders</p>
          <p className="text-xl font-bold font-mono-numbers text-slate-900 mt-1">{totalOrders}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Pending</p>
          <p className="text-xl font-bold font-mono-numbers text-amber-600 mt-1">{pendingOrders}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">In Production</p>
          <p className="text-xl font-bold font-mono-numbers text-blue-600 mt-1">{inProductionOrders}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Completed</p>
          <p className="text-xl font-bold font-mono-numbers text-emerald-600 mt-1">{completedOrders}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Cancelled</p>
          <p className="text-xl font-bold font-mono-numbers text-rose-600 mt-1">{cancelledOrders}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Amount</p>
          <p className="text-lg font-bold font-mono-numbers text-slate-900 mt-1">₹{totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Paid</p>
          <p className="text-lg font-bold font-mono-numbers text-emerald-700 mt-1">₹{totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Balance Due</p>
          <p className="text-lg font-bold font-mono-numbers text-amber-700 mt-1">₹{totalBalanceDue.toLocaleString()}</p>
        </div>
      </div>

      {/* Main Grid: Orders List & Order Details Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Orders List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            My Orders History
          </h3>

          {customerOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 text-xs">No framing orders found yet.</p>
              <button
                onClick={onNavigateToCatalog}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg text-xs"
              >
                Start Your First Order
              </button>
            </div>
          ) : (
            customerOrders.map((order) => {
              const isSelected = selectedOrder?.id === order.id;
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer text-xs ${
                    isSelected
                      ? 'border-emerald-600 ring-1 ring-emerald-600 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="font-bold text-slate-900 font-mono-numbers text-sm">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] text-slate-500 ml-2 font-mono-numbers">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${getStatusBadge(
                        order.productionStatus
                      )}`}
                    >
                      {order.productionStatus}
                    </span>
                  </div>

                  <div className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-800 line-clamp-1">
                        {order.items.map((i) => i.name).join(', ')}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono-numbers mt-0.5">
                        {order.items.length} item(s) · Total: ₹{order.orderTotal.toLocaleString()}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold font-mono-numbers text-slate-900">
                        Paid: ₹{order.advancePaid.toLocaleString()}
                      </p>
                      {order.balanceDue > 0 && (
                        <p className="text-[11px] font-mono-numbers text-amber-700">
                          Due: ₹{order.balanceDue.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Est. Delivery: {order.estimatedDeliveryDate || '3-5 Days'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const memo = getCashMemoForOrder(order.id) || generateFinalCashMemo(order.id);
                          generateVectorInvoicePDF(
                            order,
                            settings,
                            memo,
                            `${memo?.invoiceNumber || order.orderNumber}_Invoice.pdf`
                          );
                        }}
                        className="text-xs text-slate-600 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer"
                        title="Download Invoice as PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCashMemo(order.id);
                        }}
                        className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Invoice</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Order Inspector & Tracking Timeline (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm sticky top-24 text-xs space-y-6">
          {selectedOrder ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold font-serif-luxury text-slate-900 text-sm">
                    Order Details: {selectedOrder.orderNumber}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono-numbers">
                    Placed on {new Date(selectedOrder.orderDate).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const memo = getCashMemoForOrder(selectedOrder.id) || generateFinalCashMemo(selectedOrder.id);
                      generateVectorInvoicePDF(
                        selectedOrder,
                        settings,
                        memo,
                        `${memo?.invoiceNumber || selectedOrder.orderNumber}_Invoice.pdf`
                      );
                    }}
                    className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                    title="Download Invoice as PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => onOpenCashMemo(selectedOrder.id)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Memo</span>
                  </button>
                </div>
              </div>

              {/* Visual Production Timeline Stepper */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-3">
                  Live Production & Delivery Status
                </h4>
                <div className="space-y-2">
                  {getStatusSteps(selectedOrder.productionStatus).map((step, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          step.isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        {step.isCompleted ? '✓' : idx + 1}
                      </div>
                      <span
                        className={`text-xs ${
                          step.isCurrent
                            ? 'font-bold text-emerald-800'
                            : step.isCompleted
                            ? 'font-medium text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Uploaded Customer Photo Thumbnail */}
              {selectedOrder.items.some((i) => i.customPhotoUrl) && (
                <div className="pt-3 border-t border-slate-100">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-2">
                    Your Uploaded Photograph
                  </h4>
                  <div className="flex gap-2">
                    {selectedOrder.items
                      .filter((i) => i.customPhotoUrl)
                      .map((item, idx) => (
                        <div
                          key={idx}
                          className="w-20 h-20 rounded-lg overflow-hidden border border-slate-300 relative group"
                        >
                          <img
                            src={item.customPhotoUrl}
                            alt="Uploaded memory"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Items Breakdown */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  Ordered Pieces
                </h4>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start text-xs">
                    <div>
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono-numbers">
                        Qty: {item.quantity} · {item.size} · {item.color}
                      </p>
                      {item.customText && (
                        <p className="text-[10px] text-emerald-800 italic">
                          Engraved: "{item.customText}"
                        </p>
                      )}
                    </div>
                    <span className="font-bold font-mono-numbers">
                      ₹{item.finalPrice.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Snapshot */}
              <div className="pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-xl space-y-1 font-mono-numbers">
                <div className="flex justify-between text-slate-600">
                  <span>Order Total:</span>
                  <span>₹{selectedOrder.orderTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Amount Paid ({selectedOrder.paymentStatus}):</span>
                  <span>₹{selectedOrder.advancePaid.toLocaleString()}</span>
                </div>
                {selectedOrder.balanceDue > 0 && (
                  <div className="flex justify-between text-amber-700 font-bold">
                    <span>Balance Due:</span>
                    <span>₹{selectedOrder.balanceDue.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Eye className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>Select any order on the left to inspect its live craftsman timeline, uploaded photo, and invoice.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
