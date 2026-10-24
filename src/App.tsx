import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './components/storefront/HomePage';
import { ProductCatalog } from './components/storefront/ProductCatalog';
import { CustomFrameDesigner } from './components/storefront/CustomFrameDesigner';
import { ProductDetailModal } from './components/storefront/ProductDetailModal';
import { CartDrawer } from './components/storefront/CartDrawer';
import { AuthModal } from './components/storefront/AuthModal';
import { CheckoutModal } from './components/storefront/CheckoutModal';
import { CustomerDashboard } from './components/storefront/CustomerDashboard';
import { OrderTrackingPage } from './components/storefront/OrderTrackingPage';
import { ContactPage } from './components/storefront/ContactPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { AdminInvoiceModal } from './components/admin/AdminInvoiceModal';
import { Product } from './types';
import { Shield, Lock } from 'lucide-react';

const MainApp: React.FC = () => {
  const { activePortal, setActivePortal, currentUser, orders } = useStore();

  // Navigation states
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Modals
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [viewInvoiceOrderId, setViewInvoiceOrderId] = useState<string | null>(null);

  const orderForInvoice = orders.find((o) => o.id === viewInvoiceOrderId);

  // If in Admin Portal
  if (activePortal === 'admin') {
    // If not logged in as admin, require authentication via clean, secure AdminLoginPage
    if (!currentUser || currentUser.role !== 'admin') {
      return <AdminLoginPage />;
    }

    return <AdminLayout />;
  }

  // Otherwise in Customer Storefront
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        onOpenCart={() => setCartDrawerOpen(true)}
        onOpenAuth={(tab) => {
          setAuthInitialTab(tab || 'login');
          setAuthModalOpen(true);
        }}
      />

      {/* Main Page Routing */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={(page) => setCurrentPage(page)}
            onSelectProduct={(p) => setSelectedProduct(p)}
          />
        )}

        {currentPage === 'catalog' && (
          <ProductCatalog
            onSelectProduct={(p) => setSelectedProduct(p)}
            onNavigateToCustomizer={() => setCurrentPage('customizer')}
          />
        )}

        {currentPage === 'customizer' && (
          <CustomFrameDesigner
            onSuccessAddToCart={() => setCartDrawerOpen(true)}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {currentPage === 'dashboard' && (
          <CustomerDashboard
            onOpenCashMemo={(orderId) => setViewInvoiceOrderId(orderId)}
            onNavigateToCatalog={() => setCurrentPage('catalog')}
          />
        )}

        {currentPage === 'tracking' && (
          <OrderTrackingPage
            onOpenCashMemo={(orderId) => setViewInvoiceOrderId(orderId)}
            onNavigateToCustomizer={() => setCurrentPage('customizer')}
          />
        )}

        {currentPage === 'contact' && <ContactPage />}
      </main>

      {/* Footer */}
      <Footer onNavigate={(page) => setCurrentPage(page)} />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onOpenCustomizer={() => setCurrentPage('customizer')}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        onProceedToCheckout={() => setCheckoutModalOpen(true)}
      />

      {/* Auth Modal (Login / Register / OTP verification) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authInitialTab}
      />

      {/* Authenticated Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        onOpenAuth={() => {
          setAuthInitialTab('login');
          setAuthModalOpen(true);
        }}
        onNavigateToDashboard={() => setCurrentPage('dashboard')}
      />

      {/* Cash Memo Invoice Modal */}
      {orderForInvoice && (
        <AdminInvoiceModal
          order={orderForInvoice}
          onClose={() => setViewInvoiceOrderId(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
