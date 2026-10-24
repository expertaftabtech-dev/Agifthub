import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { User, Order } from '../../types';
import { Users, Search, Mail, Phone, ShoppingBag, Eye, Calendar, X } from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const { orders, registeredUsers } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectCustomerEmail, setInspectCustomerEmail] = useState<string | null>(null);

  // Group customers from registered users and orders
  const customerMap: Record<
    string,
    {
      name: string;
      email: string;
      phone: string;
      orders: Order[];
      totalSpent: number;
      firstOrderDate: string;
      lastOrderDate: string;
    }
  > = {};

  // First include registered customer accounts
  (registeredUsers || [])
    .filter((u) => u.role === 'customer')
    .forEach((u) => {
      const key = u.email.toLowerCase();
      customerMap[key] = {
        name: u.name,
        email: u.email,
        phone: u.phone,
        orders: [],
        totalSpent: 0,
        firstOrderDate: u.createdAt || new Date().toISOString(),
        lastOrderDate: u.createdAt || new Date().toISOString(),
      };
    });

  orders.forEach((o) => {
    const key = o.customerEmail.toLowerCase();
    if (!customerMap[key]) {
      customerMap[key] = {
        name: o.customerName,
        email: o.customerEmail,
        phone: o.customerPhone,
        orders: [],
        totalSpent: 0,
        firstOrderDate: o.orderDate,
        lastOrderDate: o.orderDate,
      };
    }
    customerMap[key].orders.push(o);
    customerMap[key].totalSpent += o.orderTotal;
    if (new Date(o.orderDate) < new Date(customerMap[key].firstOrderDate)) {
      customerMap[key].firstOrderDate = o.orderDate;
    }
    if (new Date(o.orderDate) > new Date(customerMap[key].lastOrderDate)) {
      customerMap[key].lastOrderDate = o.orderDate;
    }
  });

  const customerList = Object.values(customerMap).filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
    }
    return true;
  });

  const inspectedCustomer = inspectCustomerEmail ? customerMap[inspectCustomerEmail] : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
            Customer Relationship Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified customers, lifetime framing orders, and purchase frequencies.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, email..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-3">Email Address</th>
                <th className="py-3 px-3">Mobile Number</th>
                <th className="py-3 px-3 text-center">Total Orders</th>
                <th className="py-3 px-3 text-right">Lifetime Spent (₹)</th>
                <th className="py-3 px-3">Latest Order</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customerList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No Customer Records Yet</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Customers will automatically appear here once an invoice or order is generated.
                    </p>
                  </td>
                </tr>
              ) : (
                customerList.map((cust) => (
                  <tr key={cust.email} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{cust.name}</td>
                    <td className="py-3 px-3 text-slate-600">{cust.email}</td>
                    <td className="py-3 px-3 font-mono-numbers text-slate-600">{cust.phone}</td>
                    <td className="py-3 px-3 text-center font-mono-numbers font-semibold">
                      {cust.orders.length}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-numbers font-bold text-slate-900">
                      ₹{cust.totalSpent.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono-numbers text-slate-500">
                      {new Date(cust.lastOrderDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setInspectCustomerEmail(cust.email)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-slate-100 cursor-pointer"
                        title="Inspect Order History"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Customer Modal */}
      {inspectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 relative text-xs space-y-4">
            <button
              onClick={() => setInspectCustomerEmail(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                Customer Profile
              </span>
              <h3 className="text-xl font-bold font-serif-luxury text-slate-900 mt-0.5">
                {inspectedCustomer.name}
              </h3>
              <p className="text-slate-500 font-mono-numbers">
                {inspectedCustomer.email} · {inspectedCustomer.phone}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl grid grid-cols-2 gap-3 text-slate-700 font-mono-numbers">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Orders</p>
                <p className="text-base font-bold text-slate-900">{inspectedCustomer.orders.length}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Lifetime Spend</p>
                <p className="text-base font-bold text-emerald-700">
                  ₹{inspectedCustomer.totalSpent.toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-2">
                Order History
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {inspectedCustomer.orders.map((o) => (
                  <div key={o.id} className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800 font-mono-numbers">{o.orderNumber}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(o.orderDate).toLocaleDateString()} · {o.productionStatus}
                      </p>
                    </div>
                    <span className="font-bold font-mono-numbers text-slate-900">
                      ₹{o.orderTotal.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
