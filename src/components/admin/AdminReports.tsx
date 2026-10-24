import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  TrendingUp,
  DollarSign,
  Download,
  Calendar,
  Layers,
  Award,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

export const AdminReports: React.FC = () => {
  const { orders, products, payments } = useStore();

  const [dateRange, setDateRange] = useState<'all' | 'month' | 'week'>('all');

  // Total gross revenue
  const totalRevenue = orders.reduce((sum, o) => sum + o.orderTotal, 0);

  // Total estimated production costs for ordered items
  let totalProductionCost = 0;
  orders.forEach((o) => {
    o.items.forEach((item) => {
      const prod = products.find((p) => p.sku === item.sku);
      const unitCost = prod?.productionCost || 450;
      totalProductionCost += unitCost * item.quantity;
    });
  });

  const estimatedProfit = Math.max(0, totalRevenue - totalProductionCost);
  const profitMarginPercent = totalRevenue > 0 ? ((estimatedProfit / totalRevenue) * 100).toFixed(1) : '0';

  // Category breakdown
  const categorySalesMap: Record<string, number> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      const prod = products.find((p) => p.sku === item.sku);
      const cat = prod?.categoryName || 'Bespoke Custom Frames';
      categorySalesMap[cat] = (categorySalesMap[cat] || 0) + item.finalPrice;
    });
  });

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Order ID,Date,Customer,Phone,Total,Advance Paid,Balance,Status,Payment Status\n';
    orders.forEach((o) => {
      csvContent += `"${o.orderNumber}","${new Date(o.orderDate).toLocaleDateString()}","${o.customerName}","${o.customerPhone}",${o.orderTotal},${o.advancePaid},${o.balanceDue},"${o.productionStatus}","${o.paymentStatus}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `agifthub_sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
            Sales Analytics & Profit Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gross revenue, material and craftsmanship expenses, category performance, and profit margins.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Sales CSV Report</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Gross Revenue</p>
          <p className="text-2xl font-bold font-mono-numbers text-slate-900 mt-1">
            ₹{totalRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-700 mt-1 font-medium">Across {orders.length} orders</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Timber & Glaze Costs</p>
          <p className="text-2xl font-bold font-mono-numbers text-slate-600 mt-1">
            ₹{totalProductionCost.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Hardwood mouldings & optical acrylic</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Estimated Net Studio Profit</p>
          <p className="text-2xl font-bold font-mono-numbers text-emerald-700 mt-1">
            ₹{estimatedProfit.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-700 mt-1 font-semibold">{profitMarginPercent}% Net Margin</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Settled UPI / Bank Payments</p>
          <p className="text-2xl font-bold font-mono-numbers text-blue-700 mt-1">
            ₹{payments.reduce((s, p) => s + p.amount, 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-blue-700 mt-1 font-medium">Verified in bank account</p>
        </div>
      </div>

      {/* Category Performance & Top Framing Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        {/* Category Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Revenue by Framing Category</h3>
          <div className="space-y-3">
            {Object.entries(categorySalesMap).length === 0 ? (
              <p className="text-slate-400 text-xs py-8 text-center italic">
                No framing revenue data yet. Invoices and orders will populate this breakdown.
              </p>
            ) : (
              Object.entries(categorySalesMap).map(([category, amount], idx) => {
                const percent = totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(0) : '0';
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-800">{category}</span>
                      <span className="font-mono-numbers font-bold text-slate-900">
                        ₹{amount.toLocaleString()} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Product Performers (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Best-Selling Frame Models</h3>
          <div className="space-y-3">
            {products.slice(0, 5).map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] font-mono-numbers">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-slate-800 truncate max-w-[160px]">{p.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono-numbers">{p.frameSize}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold font-mono-numbers text-slate-900">
                    ₹{p.discountPrice.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-mono-numbers">
                    Cost: ₹{p.productionCost}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
