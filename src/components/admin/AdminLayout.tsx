import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Users,
  MessageSquare,
  BarChart3,
  Tag,
  Settings,
  Shield,
  LogOut,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Plus,
  Sliders,
  Store,
  User as UserIcon,
  FileText,
} from 'lucide-react';
import { AdminDashboardOverview } from './AdminDashboardOverview';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminOrders } from './AdminOrders';
import { AdminPayments } from './AdminPayments';
import { AdminWhatsAppNotifications } from './AdminWhatsAppNotifications';
import { AdminReports } from './AdminReports';
import { AdminCustomers } from './AdminCustomers';
import { AdminSettings } from './AdminSettings';
import { AdminCoupons } from './AdminCoupons';
import { AdminBackupSecurity } from './AdminBackupSecurity';
import { AdminInvoiceModal } from './AdminInvoiceModal';
import { MakeInvoiceModal } from './MakeInvoiceModal';

export const AdminLayout: React.FC = () => {
  const { currentUser, logout, setActivePortal, orders, notifications, products } = useStore();

  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [sectionFilter, setSectionFilter] = useState<string | undefined>(undefined);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [selectedInvoiceOrderId, setSelectedInvoiceOrderId] = useState<string | null>(null);
  const [isMakeInvoiceOpen, setIsMakeInvoiceOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  const pendingOrdersCount = orders.filter((o) => o.productionStatus === 'Pending').length;

  const handleNavigateSection = (section: string, filter?: string) => {
    if (section === 'make-invoice') {
      setIsMakeInvoiceOpen(true);
      return;
    }
    setActiveSection(section);
    setSectionFilter(filter);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'make-invoice', label: 'Make Invoice', icon: FileText, badge: 'Quick Bill', badgeColor: 'bg-emerald-600' },
    { id: 'products', label: 'Product Catalog', icon: Package, badge: products.length },
    { id: 'categories', label: 'Product Categories', icon: Layers },
    { id: 'orders', label: 'All Orders', icon: ShoppingBag, badge: orders.length },
    { id: 'pending-orders', label: 'Pending Orders', icon: Clock, badge: pendingOrdersCount, badgeColor: 'bg-amber-500' },
    { id: 'completed-orders', label: 'Completed Orders', icon: CheckCircle },
    { id: 'rejected-orders', label: 'Rejected / Cancelled', icon: XCircle },
    { id: 'payments', label: 'Payment Ledger', icon: CreditCard },
    { id: 'pending-payments', label: 'Pending Balances', icon: Clock },
    { id: 'customers', label: 'Customer Directory', icon: Users },
    { id: 'whatsapp', label: 'WhatsApp Alerts', icon: MessageSquare, badge: 'Live', badgeColor: 'bg-emerald-600' },
    { id: 'reports', label: 'Sales Reports & Profit', icon: BarChart3 },
    { id: 'coupons', label: 'Discount Coupons', icon: Tag },
    { id: 'settings', label: 'Studio & UPI Settings', icon: Settings },
    { id: 'backup', label: 'Security & Backup', icon: Shield },
  ];

  const orderForInvoice = orders.find((o) => o.id === selectedInvoiceOrderId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation Bar adhering to ECOMMERCEGO architecture */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6">
        {/* Left: Studio Brand & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
            title="Toggle Sidebar"
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-serif-luxury font-bold">
              A
            </div>
            <div>
              <span className="font-bold text-sm font-serif-luxury text-slate-900 tracking-tight">
                Agifthub
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-700 ml-1.5 tracking-wider bg-emerald-50 px-1.5 py-0.5 rounded">
                Admin Suite
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden md:flex items-center relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders, frames, customers..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        {/* Right: Quick Action, Notification Center, Switch to Store, Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Make Invoice Primary Top Button */}
          <button
            onClick={() => setIsMakeInvoiceOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white shadow-xs transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-200" />
            <span>Make Invoice</span>
          </button>

          {/* Switch to Storefront Button */}
          <button
            onClick={() => setActivePortal('store')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <Store className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">View Public Storefront</span>
          </button>

          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 relative cursor-pointer"
              title="Recent WhatsApp & Order Alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600"></span>
            </button>

            {notificationsOpen && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 text-xs space-y-3"
                onMouseLeave={() => setNotificationsOpen(false)}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900">Notifications & Webhooks</span>
                  <span className="text-[10px] text-slate-400">Latest 4 events</span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.slice(0, 4).map((n) => (
                    <div key={n.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <p className="font-semibold text-slate-800 line-clamp-1">{n.title}</p>
                      <p className="text-[10px] text-slate-500 font-mono-numbers mt-0.5">
                        {new Date(n.timestamp).toLocaleTimeString()} · {n.type.toUpperCase()}
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setNotificationsOpen(false);
                    setActiveSection('whatsapp');
                  }}
                  className="w-full py-1.5 text-center text-emerald-700 hover:underline font-semibold text-[11px] cursor-pointer"
                >
                  Open WhatsApp Alert Center →
                </button>
              </div>
            )}
          </div>

          {/* Admin User Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
              {currentUser?.name
                ? currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'EA'}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <p className="font-bold text-slate-900 leading-tight">
                {currentUser?.name || 'Expert Aftab Tech'}
              </p>
              <p className="text-[10px] text-emerald-700 font-semibold">Master Studio Admin</p>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace: Collapsible Sidebar + Content Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={`bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 flex flex-col shrink-0 ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigateSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between truncate">
                      <span className="truncate">{item.label}</span>
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] font-mono-numbers px-1.5 py-0.2 rounded-full font-bold ${
                            item.badgeColor ? `${item.badgeColor} text-white` : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Switcher */}
          <div className="p-3 border-t border-slate-800/80">
            <button
              onClick={() => setActivePortal('store')}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <Store className="w-4 h-4 text-emerald-400 shrink-0" />
              {!sidebarCollapsed && <span>Return to Storefront</span>}
            </button>
          </div>
        </aside>

        {/* Right Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeSection === 'dashboard' && (
            <AdminDashboardOverview
              onNavigateSection={handleNavigateSection}
              onOpenOrderInvoice={(orderId) => setSelectedInvoiceOrderId(orderId)}
              onOpenMakeInvoice={() => setIsMakeInvoiceOpen(true)}
            />
          )}

          {activeSection === 'products' && <AdminProducts />}

          {activeSection === 'categories' && <AdminCategories />}

          {(activeSection === 'orders' ||
            activeSection === 'pending-orders' ||
            activeSection === 'completed-orders' ||
            activeSection === 'rejected-orders') && (
            <AdminOrders
              initialFilter={
                activeSection === 'pending-orders'
                  ? 'Pending'
                  : activeSection === 'completed-orders'
                  ? 'Completed'
                  : activeSection === 'rejected-orders'
                  ? 'Rejected'
                  : sectionFilter || 'all'
              }
              onOpenCashMemo={(orderId) => setSelectedInvoiceOrderId(orderId)}
              onOpenMakeInvoice={() => setIsMakeInvoiceOpen(true)}
            />
          )}

          {(activeSection === 'payments' || activeSection === 'pending-payments' || activeSection === 'received-payments') && (
            <AdminPayments
              onOpenCashMemo={(orderId) => setSelectedInvoiceOrderId(orderId)}
            />
          )}

          {activeSection === 'customers' && <AdminCustomers />}

          {activeSection === 'whatsapp' && <AdminWhatsAppNotifications />}

          {activeSection === 'reports' && <AdminReports />}

          {activeSection === 'coupons' && <AdminCoupons />}

          {activeSection === 'settings' && <AdminSettings />}

          {activeSection === 'backup' && <AdminBackupSecurity />}
        </main>
      </div>

      {/* Make Invoice Modal */}
      {isMakeInvoiceOpen && (
        <MakeInvoiceModal
          onClose={() => setIsMakeInvoiceOpen(false)}
          onInvoiceCreated={(newOrderId) => {
            setSelectedInvoiceOrderId(newOrderId);
          }}
        />
      )}

      {/* Invoice / Cash Memo Modal if selected */}
      {orderForInvoice && (
        <AdminInvoiceModal
          order={orderForInvoice}
          onClose={() => setSelectedInvoiceOrderId(null)}
        />
      )}
    </div>
  );
};
