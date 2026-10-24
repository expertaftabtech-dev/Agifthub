import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  RotateCcw,
  XCircle,
  Users,
  DollarSign,
  CreditCard,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  FileText,
  Plus,
  Eye,
  Sliders,
  Trash2,
} from 'lucide-react';

interface AdminDashboardOverviewProps {
  onNavigateSection: (section: string, filter?: string) => void;
  onOpenOrderInvoice: (orderId: string) => void;
  onOpenMakeInvoice?: () => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  onNavigateSection,
  onOpenOrderInvoice,
  onOpenMakeInvoice,
}) => {
  const { orders, products, payments, currentUser, registeredUsers, deleteOrder } = useStore();
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState<Order | null>(null);

  // Dynamic real calculations
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.productionStatus === 'Pending').length;
  const confirmedOrders = orders.filter((o) => o.productionStatus === 'Confirmed').length;
  const inProductionOrders = orders.filter((o) => o.productionStatus === 'In Production' || o.productionStatus === 'Photo Review').length;
  const readyForDelivery = orders.filter((o) => o.productionStatus === 'Ready for Delivery').length;
  const completedOrders = orders.filter((o) => o.productionStatus === 'Completed' || o.productionStatus === 'Delivered').length;
  const rejectedOrders = orders.filter((o) => o.productionStatus === 'Rejected').length;
  const cancelledOrders = orders.filter((o) => o.productionStatus === 'Cancelled').length;

  // Customers count (distinct registered or order customers)
  const orderCustomerEmails = orders.map((o) => o.customerEmail.toLowerCase()).filter(Boolean);
  const registeredCustomerEmails = (registeredUsers || [])
    .filter((u) => u.role === 'customer')
    .map((u) => u.email.toLowerCase());
  const customerSet = new Set([...orderCustomerEmails, ...registeredCustomerEmails]);
  const totalCustomers = customerSet.size;

  // Financial calculations
  const totalSales = orders.reduce((sum, o) => sum + o.orderTotal, 0);
  const totalPaymentsReceived = payments
    .filter((p) => p.verificationStatus === 'Verified')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPendingPayments = orders
    .filter((o) => o.balanceDue > 0 && o.productionStatus !== 'Cancelled' && o.productionStatus !== 'Rejected')
    .reduce((sum, o) => sum + o.balanceDue, 0);

  // Overdue payments (orders older than 3 days with balance > 0)
  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
  const overduePayments = orders
    .filter((o) => o.balanceDue > 0 && new Date(o.orderDate).getTime() < threeDaysAgo)
    .reduce((sum, o) => sum + o.balanceDue, 0);

  // Today's orders
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todaysOrders = orders.filter((o) => o.orderDate.startsWith(todayDateStr)).length;

  // 14 Statistical Cards
  const statCards = [
    {
      id: 'total-orders',
      title: 'Total Orders',
      value: totalOrders,
      icon: Package,
      color: 'text-blue-600 bg-blue-50',
      section: 'orders',
      filter: 'all',
      trend: '+12% this week',
    },
    {
      id: 'pending-orders',
      title: 'Pending Orders',
      value: pendingOrders,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50',
      section: 'pending-orders',
      filter: 'Pending',
      trend: 'Requires review',
    },
    {
      id: 'confirmed-orders',
      title: 'Confirmed Orders',
      value: confirmedOrders,
      icon: CheckCircle,
      color: 'text-emerald-600 bg-emerald-50',
      section: 'orders',
      filter: 'Confirmed',
      trend: 'Ready for cutting',
    },
    {
      id: 'in-production',
      title: 'In Production',
      value: inProductionOrders,
      icon: Sliders,
      color: 'text-indigo-600 bg-indigo-50',
      section: 'orders',
      filter: 'In Production',
      trend: 'On workbench',
    },
    {
      id: 'ready-delivery',
      title: 'Ready for Delivery',
      value: readyForDelivery,
      icon: Truck,
      color: 'text-purple-600 bg-purple-50',
      section: 'orders',
      filter: 'Ready for Delivery',
      trend: 'QC Passed',
    },
    {
      id: 'completed-orders',
      title: 'Completed Orders',
      value: completedOrders,
      icon: CheckCircle,
      color: 'text-teal-600 bg-teal-50',
      section: 'completed-orders',
      filter: 'Completed',
      trend: 'Delivered',
    },
    {
      id: 'rejected-orders',
      title: 'Rejected Orders',
      value: rejectedOrders,
      icon: XCircle,
      color: 'text-rose-600 bg-rose-50',
      section: 'rejected-orders',
      filter: 'Rejected',
      trend: 'Low DPI / refund',
    },
    {
      id: 'cancelled-orders',
      title: 'Cancelled Orders',
      value: cancelledOrders,
      icon: RotateCcw,
      color: 'text-slate-600 bg-slate-100',
      section: 'rejected-orders',
      filter: 'Cancelled',
      trend: 'Client request',
    },
    {
      id: 'total-customers',
      title: 'Total Customers',
      value: totalCustomers,
      icon: Users,
      color: 'text-cyan-600 bg-cyan-50',
      section: 'customers',
      filter: 'all',
      trend: '+4 new',
    },
    {
      id: 'total-sales',
      title: 'Total Sales',
      value: `₹${totalSales.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-700 bg-emerald-50',
      section: 'reports',
      filter: 'sales',
      trend: '+18.4% gross',
    },
    {
      id: 'payments-received',
      title: 'Payments Received',
      value: `₹${totalPaymentsReceived.toLocaleString()}`,
      icon: CreditCard,
      color: 'text-emerald-600 bg-emerald-50',
      section: 'received-payments',
      filter: 'verified',
      trend: 'Settled to bank',
    },
    {
      id: 'pending-payments',
      title: 'Pending Payments',
      value: `₹${totalPendingPayments.toLocaleString()}`,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50',
      section: 'pending-payments',
      filter: 'pending',
      trend: 'Due on delivery',
    },
    {
      id: 'overdue-payments',
      title: 'Overdue Payments',
      value: `₹${overduePayments.toLocaleString()}`,
      icon: AlertTriangle,
      color: 'text-rose-600 bg-rose-50',
      section: 'pending-payments',
      filter: 'overdue',
      trend: '> 3 days old',
    },
    {
      id: 'todays-orders',
      title: "Today's Orders",
      value: todaysOrders,
      icon: Calendar,
      color: 'text-blue-700 bg-blue-50',
      section: 'orders',
      filter: 'today',
      trend: 'Live today',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
            Agifthub Studio HQ
          </span>
          <h1 className="text-xl sm:text-2xl font-serif-luxury font-bold text-slate-900 mt-0.5">
            Crafting & E-Commerce Control Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time workshop status, payment reconciliations, and thermal cash memo billing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenMakeInvoice && (
            <button
              onClick={onOpenMakeInvoice}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-950/20"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-300" />
              <span>Make Invoice</span>
            </button>
          )}
          <button
            onClick={() => onNavigateSection('products', 'add')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Frame</span>
          </button>
          <button
            onClick={() => onNavigateSection('payments', 'record')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Record Payment</span>
          </button>
          <button
            onClick={() => onNavigateSection('whatsapp')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>WhatsApp Center</span>
          </button>
        </div>
      </div>

      {/* 14 Dynamic Statistic Cards Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Real-time Studio Metrics (Click card to filter)
          </h2>
          <span className="text-[11px] text-slate-500 font-mono-numbers">
            Updated: {new Date().toLocaleTimeString()}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onNavigateSection(card.section, card.filter)}
                className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs hover:border-emerald-600/70 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                      {card.title}
                    </span>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${card.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-lg font-bold font-mono-numbers text-slate-900 mt-2">
                    {card.value}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 mt-2 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 group-hover:text-emerald-700 transition-colors">
                    {card.trend}
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analytics Chart & Outstanding Payments Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Performance Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Weekly Framing Revenue & Production Output
              </h3>
              <p className="text-xs text-slate-500">
                Gross sales vs handcrafted pieces dispatched
              </p>
            </div>
            <span className="text-xs font-mono-numbers font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
              Total Revenue: ₹{totalSales.toLocaleString()}
            </span>
          </div>

          {/* SVG Bar Chart Visualization */}
          <div className="pt-4">
            <div className="h-52 flex items-end gap-3 sm:gap-6 border-b border-slate-200 pb-2 px-2">
              {[
                { day: 'Mon', revenue: 4200, count: 2 },
                { day: 'Tue', revenue: 6800, count: 4 },
                { day: 'Wed', revenue: 5400, count: 3 },
                { day: 'Thu', revenue: 9200, count: 5 },
                { day: 'Fri', revenue: 11400, count: 6 },
                { day: 'Sat', revenue: 14800, count: 8 },
                { day: 'Sun', revenue: 8900, count: 4 },
              ].map((item, idx) => {
                const heightPercent = (item.revenue / 15000) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-mono-numbers pointer-events-none whitespace-nowrap z-20 shadow-md">
                      ₹{item.revenue.toLocaleString()} · {item.count} orders
                    </div>
                    <div
                      className="w-full bg-emerald-600 group-hover:bg-emerald-500 rounded-t-md transition-all duration-300"
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                    <span className="text-[10px] font-semibold text-slate-500 mt-1">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-2">
              <span>0% (₹0)</span>
              <span>Daily Capacity: 10 Frames / Day</span>
              <span>100% (₹15,000)</span>
            </div>
          </div>
        </div>

        {/* Outstanding Balance Alert Card (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                Outstanding Balance Queue
              </h3>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Orders requiring balance settlement on delivery
            </p>

            <div className="mt-4 space-y-2.5 text-xs">
              {orders
                .filter((o) => o.balanceDue > 0)
                .slice(0, 4)
                .map((order) => (
                  <div
                    key={order.id}
                    onClick={() => onNavigateSection('orders', order.orderNumber)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-800 font-mono-numbers">
                        {order.orderNumber}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[140px]">
                        {order.customerName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold font-mono-numbers text-amber-700">
                        ₹{order.balanceDue.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono-numbers">
                        Paid: ₹{order.advancePaid.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateSection('pending-payments')}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            View All Pending Balances (₹{totalPendingPayments.toLocaleString()}) →
          </button>
        </div>
      </div>

      {/* Recent Orders & Latest Products Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Recent Customer Orders</h3>
              <p className="text-xs text-slate-500">Live order processing and status history</p>
            </div>
            <button
              onClick={() => onNavigateSection('orders')}
              className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
            >
              View All Orders →
            </button>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-mono-numbers font-bold text-slate-900">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-800">{order.customerName}</p>
                      <p className="text-[10px] text-slate-400 font-mono-numbers">{order.customerPhone}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {order.productionStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono-numbers font-bold text-slate-900">
                      ₹{order.orderTotal.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onOpenOrderInvoice(order.id)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-slate-100 cursor-pointer"
                          title="View Cash Memo"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmOrder(order)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest Catalog Items (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Catalog Inventory</h3>
              <p className="text-xs text-slate-500">{products.length} registered frame models</p>
            </div>
            <button
              onClick={() => onNavigateSection('products')}
              className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
            >
              Manage Catalog →
            </button>
          </div>

          <div className="p-4 space-y-3 text-xs">
            {products.slice(0, 4).map((product) => (
              <div
                key={product.id}
                onClick={() => onNavigateSection('products', product.id)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate">{product.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono-numbers">
                    {product.frameSize} · Stock: {product.stockQuantity}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold font-mono-numbers text-slate-900">
                    ₹{product.discountPrice.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono-numbers">
                    Cost: ₹{product.productionCost}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
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
                  <span className="font-sans">Framed Pieces:</span>
                  <span>{deleteConfirmOrder.items.length} item(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans">Order Total:</span>
                  <span className="font-bold text-slate-900">₹{deleteConfirmOrder.orderTotal.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-[10px] text-rose-600 pt-1 border-t border-rose-200 leading-tight">
                This will permanently delete this order and its records from your database.
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
                onClick={() => {
                  deleteOrder(deleteConfirmOrder.id);
                  setDeleteConfirmOrder(null);
                }}
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
