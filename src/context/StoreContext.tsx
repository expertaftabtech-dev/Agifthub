import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Category,
  Product,
  Order,
  Payment,
  CartItem,
  StudioSettings,
  Coupon,
  NotificationLog,
  AuditLog,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  CashMemo,
  Address,
  OrderItem,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_USERS,
  INITIAL_ORDERS,
  INITIAL_PAYMENTS,
  INITIAL_SETTINGS,
  INITIAL_COUPONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/seedData';
import { buildUpiUri, generateQRCodeSVG } from '../utils/qrGenerator';

interface StoreContextType {
  // Current user & authentication
  currentUser: User | null;
  activePortal: 'store' | 'admin';
  setActivePortal: (portal: 'store' | 'admin') => void;
  login: (email: string, password?: string, role?: 'admin' | 'customer') => { success: boolean; message: string };
  register: (name: string, email: string, phone: string, password?: string, role?: 'customer') => { success: boolean; message: string };
  logout: () => void;

  // Catalog
  categories: Category[];
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'dateAdded'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;
  updateStock: (id: string, quantity: number) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string; discount?: number };
  removeCoupon: () => void;

  // Users & Customers
  registeredUsers: User[];

  // Orders
  orders: Order[];
  createOrder: (orderData: {
    customerId?: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    shippingAddress: Address;
    items: CartItem[];
    paymentMethod: PaymentMethod;
    advancePaymentAmount: number;
  }) => Order;
  createManualInvoice: (invoiceData: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
    };
    items: Array<{
      name: string;
      size: string;
      material?: string;
      color?: string;
      quantity: number;
      price: number;
      customText?: string;
    }>;
    subtotal: number;
    discountAmount?: number;
    shippingCharge?: number;
    taxAmount?: number;
    orderTotal: number;
    advancePaid: number;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    productionStatus?: OrderStatus;
    transactionReference?: string;
    internalNotes?: string;
    deliveryDate?: string;
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, comment?: string) => void;
  rejectOrder: (orderId: string, reason: string) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  deleteOrder: (orderId: string) => void;

  // Payments
  payments: Payment[];
  recordPayment: (payment: {
    orderId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    transactionReference: string;
    notes?: string;
  }) => void;

  // Cash Memo / Invoices
  cashMemos: Record<string, CashMemo>;
  generateFinalCashMemo: (orderId: string) => CashMemo | null;
  getCashMemoForOrder: (orderId: string) => CashMemo | null;

  // Settings, Coupons, Logs
  settings: StudioSettings;
  updateSettings: (newSettings: Partial<StudioSettings>) => void;
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usageCount'>) => void;
  deleteCoupon: (id: string) => void;
  notifications: NotificationLog[];
  sendCustomNotification: (type: 'whatsapp' | 'email', recipient: string, title: string, message: string) => void;
  auditLogs: AuditLog[];
  resetDataToFactory: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_PREFIX = 'agifthub_pfs_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Registered users database with automatic synchronization of admin credentials
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    const loaded = loadFromStorage<User[]>('registered_users', INITIAL_USERS);
    // Ensure the designated admin account is always up-to-date and purge demo seed customers
    const filtered = (loaded || []).filter(
      (u) =>
        u.role !== 'admin' &&
        u.email.toLowerCase() !== 'admin@agifthub.com' &&
        u.id !== 'user-cust-1' &&
        u.id !== 'user-cust-2' &&
        u.id !== 'user-cust-3' &&
        u.email.toLowerCase() !== 'rohit.sharma@example.com' &&
        u.email.toLowerCase() !== 'priya.verma@example.com' &&
        u.email.toLowerCase() !== 'ananya.sen@example.com'
    );
    return [INITIAL_USERS[0], ...filtered];
  });

  // Auth state - guests start unauthenticated unless stored in localStorage
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const user = loadFromStorage<User | null>('user', null);
    if (user && user.role === 'admin') {
      return { ...user, name: 'Expert Aftab Tech', email: 'expertaftabtech@gmail.com' };
    }
    return user;
  });
  const [activePortal, setActivePortal] = useState<'store' | 'admin'>('store');

  // Entities - purged of any previously cached demo seed records
  const [categories, setCategories] = useState<Category[]>(() => {
    const loaded = loadFromStorage<Category[]>('categories', INITIAL_CATEGORIES);
    return (loaded || INITIAL_CATEGORIES).map((c) =>
      c.id === 'cat-1' ? { ...c, image: '/assets/aistudio/14_Photos_HBD_b1b13701.jpg' } : c
    );
  });
  const [products, setProducts] = useState<Product[]>(() =>
    loadFromStorage('products', INITIAL_PRODUCTS)
  );
  const [orders, setOrders] = useState<Order[]>(() => {
    const loaded = loadFromStorage<Order[]>('orders', INITIAL_ORDERS);
    return (loaded || []).filter(
      (o) =>
        !['ord-1', 'ord-2', 'ord-3', 'ord-4', 'ord-5', 'ord-6'].includes(o.id) &&
        !['PFS-2026-00001', 'PFS-2026-00002', 'PFS-2026-00003', 'PFS-2026-00004', 'PFS-2026-00005', 'PFS-2026-00006'].includes(o.orderNumber) &&
        o.customerId !== 'user-cust-1' &&
        o.customerId !== 'user-cust-2' &&
        o.customerId !== 'user-cust-3'
    );
  });
  const [payments, setPayments] = useState<Payment[]>(() => {
    const loaded = loadFromStorage<Payment[]>('payments', INITIAL_PAYMENTS);
    return (loaded || []).filter(
      (p) =>
        !['pay-1', 'pay-2', 'pay-3', 'pay-4'].includes(p.id) &&
        !['Rohit Sharma', 'Priya Verma', 'Ananya Sen'].includes(p.customerName)
    );
  });
  const [cart, setCart] = useState<CartItem[]>(() =>
    loadFromStorage('cart', [])
  );
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() =>
    loadFromStorage('applied_coupon', null)
  );
  const [settings, setSettings] = useState<StudioSettings>(() => {
    const loaded = loadFromStorage('settings', INITIAL_SETTINGS);
    return {
      ...loaded,
      phone: '+91 8404049497',
      email: 'expertaftabtech@gmail.com',
      adminWhatsAppNumber: '+91 8404049497',
    };
  });
  const [coupons, setCoupons] = useState<Coupon[]>(() =>
    loadFromStorage('coupons', INITIAL_COUPONS)
  );
  const [notifications, setNotifications] = useState<NotificationLog[]>(() => {
    const loaded = loadFromStorage<NotificationLog[]>('notifications', INITIAL_NOTIFICATIONS);
    return (loaded || []).filter((n) => !['notif-1', 'notif-2', 'notif-3', 'notif-4'].includes(n.id));
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const loaded = loadFromStorage<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
    return (loaded || []).filter((a) => !['aud-1', 'aud-2', 'aud-3', 'aud-4'].includes(a.id));
  });
  const [cashMemos, setCashMemos] = useState<Record<string, CashMemo>>(() =>
    loadFromStorage('cash_memos', {})
  );

  // Persistence hooks
  useEffect(() => saveToStorage('registered_users', registeredUsers), [registeredUsers]);
  useEffect(() => saveToStorage('user', currentUser), [currentUser]);
  useEffect(() => saveToStorage('categories', categories), [categories]);
  useEffect(() => saveToStorage('products', products), [products]);
  useEffect(() => saveToStorage('orders', orders), [orders]);
  useEffect(() => saveToStorage('payments', payments), [payments]);
  useEffect(() => saveToStorage('cart', cart), [cart]);
  useEffect(() => saveToStorage('applied_coupon', appliedCoupon), [appliedCoupon]);
  useEffect(() => saveToStorage('settings', settings), [settings]);
  useEffect(() => saveToStorage('coupons', coupons), [coupons]);
  useEffect(() => saveToStorage('notifications', notifications), [notifications]);
  useEffect(() => saveToStorage('audit_logs', auditLogs), [auditLogs]);
  useEffect(() => saveToStorage('cash_memos', cashMemos), [cashMemos]);

  // Log audit helper
  const addAuditLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actor: currentUser?.email || 'Anonymous/System',
      action,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Dispatch simulated WhatsApp / Email notifications
  const logNotification = (
    type: 'whatsapp' | 'email',
    recipient: string,
    title: string,
    message: string,
    triggerEvent: string
  ) => {
    const newNotification: NotificationLog = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      recipient,
      title,
      message,
      triggerEvent,
      status: 'Sent',
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  // Auth functions - strictly enforces that customers without registration cannot log in
  const login = (email: string, password?: string, role: 'admin' | 'customer' = 'customer') => {
    const trimmed = email.trim().toLowerCase();
    const existing = registeredUsers.find((u) => u.email.toLowerCase() === trimmed);

    if (!existing) {
      return {
        success: false,
        message: 'Account not found. A customer without prior registration cannot log in. Please register an account first.',
      };
    }

    // Password verification
    if (existing.password && password !== undefined) {
      if (password !== existing.password) {
        return {
          success: false,
          message: 'Incorrect password. Please verify and try again.',
        };
      }
    }

    // Role check if logging in to admin portal
    if (role === 'admin' && existing.role !== 'admin') {
      return {
        success: false,
        message: 'Access denied. You do not have administrator credentials.',
      };
    }

    setCurrentUser(existing);
    addAuditLog('USER_LOGIN', `User ${existing.name} (${existing.role}) logged in.`);
    return { success: true, message: `Welcome back, ${existing.name}!` };
  };

  const register = (
    name: string,
    email: string,
    phone: string,
    password?: string,
    role: 'customer' = 'customer'
  ) => {
    const trimmedEmail = email.trim().toLowerCase();
    const existing = registeredUsers.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (existing) {
      return {
        success: false,
        message: 'An account with this email address is already registered. Please proceed to login.',
      };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: trimmedEmail,
      phone: phone.trim(),
      role,
      password: password || 'user123',
      createdAt: new Date().toISOString(),
    };

    setRegisteredUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    addAuditLog('USER_REGISTER', `New customer ${newUser.name} registered.`);
    logNotification(
      'email',
      newUser.email,
      'Welcome to Agifthub Picture Frame Studio',
      `Dear ${newUser.name}, welcome to Agifthub! Your account is active. Explore our handcrafted frames.`,
      'Account Registration'
    );
    return { success: true, message: 'Account registered and verified successfully!' };
  };

  const logout = () => {
    addAuditLog('USER_LOGOUT', `User ${currentUser?.name} logged out.`);
    setCurrentUser(null);
    setActivePortal('store');
  };

  // Product actions
  const addProduct = (prodData: Omit<Product, 'id' | 'dateAdded'>) => {
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      dateAdded: new Date().toISOString().split('T')[0],
    };
    setProducts((prev) => [newProduct, ...prev]);
    addAuditLog('ADD_PRODUCT', `Added new product "${newProduct.name}" (SKU: ${newProduct.sku})`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    addAuditLog('UPDATE_PRODUCT', `Updated product details for ID: ${id}`);
  };

  const deleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addAuditLog('DELETE_PRODUCT', `Deleted product "${target?.name || id}"`);
  };

  const duplicateProduct = (id: string) => {
    const source = products.find((p) => p.id === id);
    if (!source) return;
    const duplicated: Product = {
      ...source,
      id: `prod-${Date.now()}`,
      sku: `${source.sku}-COPY`,
      name: `${source.name} (Copy)`,
      dateAdded: new Date().toISOString().split('T')[0],
    };
    setProducts((prev) => [duplicated, ...prev]);
    addAuditLog('DUPLICATE_PRODUCT', `Duplicated product "${source.name}"`);
  };

  const updateStock = (id: string, quantity: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stockQuantity: quantity } : p))
    );
    addAuditLog('UPDATE_STOCK', `Updated stock for product ID: ${id} to ${quantity}`);
  };

  // Categories
  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
      productCount: 0,
    };
    setCategories((prev) => [...prev, newCat]);
    addAuditLog('ADD_CATEGORY', `Created category "${newCat.name}"`);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    addAuditLog('UPDATE_CATEGORY', `Updated category ID: ${id}`);
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    addAuditLog('DELETE_CATEGORY', `Deleted category ID: ${id}`);
  };

  // Cart operations
  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...item,
      id: `cart-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    setCart((prev) => [...prev, newItem]);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const coupon = coupons.find((c) => c.code.toUpperCase() === cleanCode && c.active);
    if (!coupon) {
      return { success: false, message: 'Invalid or expired coupon code' };
    }
    const cartSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    if (cartSubtotal < coupon.minOrder) {
      return {
        success: false,
        message: `Minimum order of ₹${coupon.minOrder} required for this coupon`,
      };
    }
    setAppliedCoupon(coupon);
    return {
      success: true,
      message: `Coupon ${coupon.code} applied! ${coupon.discountPercent}% discount!`,
      discount: coupon.discountPercent,
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Create Order
  const createOrder = (orderData: {
    customerId?: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    shippingAddress: Address;
    items: CartItem[];
    paymentMethod: PaymentMethod;
    advancePaymentAmount: number;
  }): Order => {
    const nextOrderSeq = orders.length + 1;
    const orderNumber = `PFS-2026-${String(nextOrderSeq).padStart(5, '0')}`;
    const subtotal = orderData.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

    const discountAmount = appliedCoupon
      ? Math.round((subtotal * appliedCoupon.discountPercent) / 100)
      : 0;

    const shippingCharge =
      subtotal - discountAmount >= settings.freeDeliveryThreshold
        ? 0
        : settings.standardDeliveryCharge;

    const taxableBase = subtotal - discountAmount;
    const taxAmount = Math.round((taxableBase * settings.taxRate) / 100);
    const orderTotal = taxableBase + shippingCharge + taxAmount;

    const advancePaid = Math.min(orderData.advancePaymentAmount, orderTotal);
    const balanceDue = Math.max(0, orderTotal - advancePaid);

    let paymentStatus: PaymentStatus = 'Pending';
    if (advancePaid >= orderTotal) {
      paymentStatus = 'Paid';
    } else if (advancePaid > 0) {
      paymentStatus = 'Partially Paid';
    }

    const orderItems = orderData.items.map((ci) => ({
      id: `oi-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: ci.product ? ci.product.name : ci.customDesign ? `Custom Frame (${ci.customDesign.mouldingStyle})` : 'Framed Print',
      sku: ci.product ? ci.product.sku : 'PFS-CUST',
      size: ci.selectedSize || ci.customDesign?.frameSize || '12x18 inch',
      material: ci.product?.material || ci.customDesign?.material || 'Handcrafted Wood',
      color: ci.selectedColor || ci.customDesign?.frameColor || 'Natural Teak',
      quantity: ci.quantity,
      price: ci.unitPrice,
      discount: 0,
      finalPrice: ci.unitPrice * ci.quantity,
      customPhotoUrl: ci.customDesign?.photoUrl,
      customText: ci.customDesign?.customText,
      customDesignDetails: ci.customDesign
        ? `${ci.customDesign.mouldingStyle}, Matting: ${ci.customDesign.mattingColor} (${ci.customDesign.mattingWidth}"), Font: ${ci.customDesign.customTextFont}`
        : undefined,
      isCustom: Boolean(ci.customDesign),
    }));

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerId: orderData.customerId || currentUser?.id || `user-guest-${Date.now()}`,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerEmail: orderData.customerEmail,
      shippingAddress: orderData.shippingAddress,
      items: orderItems,
      subtotal,
      discountAmount,
      shippingCharge,
      taxAmount,
      orderTotal,
      advancePaid,
      balanceDue,
      paymentStatus,
      productionStatus: 'Pending',
      orderDate: new Date().toISOString(),
      estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      statusHistory: [
        {
          id: `sh-${Date.now()}`,
          status: 'Pending',
          changedAt: new Date().toISOString(),
          changedBy: orderData.customerName,
          comment: `Order placed via ${orderData.paymentMethod}`,
        },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Record initial payment if advance paid
    if (advancePaid > 0) {
      const paymentRecord: Payment = {
        id: `pay-${Date.now()}`,
        paymentNumber: `PAY-2026-${String(payments.length + 1).padStart(4, '0')}`,
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        customerName: newOrder.customerName,
        amount: advancePaid,
        paymentMethod: orderData.paymentMethod,
        transactionReference: `${orderData.paymentMethod}-ORD-${Date.now()}`,
        paymentDate: new Date().toISOString(),
        verificationStatus: 'Verified',
        notes: `Initial ${paymentStatus === 'Paid' ? 'Full' : 'Advance'} Payment at Checkout`,
      };
      setPayments((prev) => [paymentRecord, ...prev]);
    }

    // Deduct stock for standard products
    orderData.items.forEach((item) => {
      if (item.productId) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === item.productId
              ? { ...p, stockQuantity: Math.max(0, p.stockQuantity - item.quantity) }
              : p
          )
        );
      }
    });

    // Clear cart
    clearCart();

    // Trigger WhatsApp notification to Studio Owner
    const primaryItem = orderItems[0];
    const waMessage = `NEW PHOTO FRAME ORDER\n\nOrder ID: ${newOrder.orderNumber}\nCustomer: ${newOrder.customerName}\nMobile: ${newOrder.customerPhone}\nProduct: ${primaryItem?.name || 'Photo Frame'}\nSize: ${primaryItem?.size || 'Standard'}\nQuantity: ${primaryItem?.quantity || 1}\nOrder Total: ₹${newOrder.orderTotal.toLocaleString()}\nAdvance Paid: ₹${newOrder.advancePaid.toLocaleString()}\nBalance Due: ₹${newOrder.balanceDue.toLocaleString()}\nPayment Status: ${newOrder.paymentStatus}\nOrder Status: ${newOrder.productionStatus}\n\nPlease log in to the Admin Dashboard to view full order details.`;

    logNotification(
      'whatsapp',
      `${settings.adminWhatsAppNumber} (Studio Owner)`,
      `New Order Placed: ${newOrder.orderNumber}`,
      waMessage,
      'New Order Placed'
    );

    // Trigger Email confirmation to customer
    logNotification(
      'email',
      newOrder.customerEmail,
      `Order Confirmed: ${newOrder.orderNumber} - Agifthub Picture Frame Studio`,
      `Dear ${newOrder.customerName},\n\nThank you for choosing Agifthub. We have received your order ${newOrder.orderNumber} for ₹${newOrder.orderTotal.toLocaleString()}. Our master artisans will begin craftsmanship shortly.\n\nTrack your order in your customer dashboard anytime.`,
      'Order Confirmation'
    );

    addAuditLog('CREATE_ORDER', `Order ${newOrder.orderNumber} created by ${newOrder.customerName}. Total: ₹${newOrder.orderTotal}`);

    return newOrder;
  };

  const createManualInvoice = (data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
    };
    items: Array<{
      name: string;
      size: string;
      material?: string;
      color?: string;
      quantity: number;
      price: number;
      customText?: string;
    }>;
    subtotal: number;
    discountAmount?: number;
    shippingCharge?: number;
    taxAmount?: number;
    orderTotal: number;
    advancePaid: number;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    productionStatus?: OrderStatus;
    transactionReference?: string;
    internalNotes?: string;
    deliveryDate?: string;
  }): Order => {
    const nextSeq = orders.length + 1;
    const orderNumber = `PFS-2026-${String(nextSeq).padStart(5, '0')}`;
    const invoiceNumber = `PFS-INV-2026-${String(nextSeq).padStart(4, '0')}`;

    // Ensure customer is saved in registeredUsers
    const cleanPhone = data.customerPhone.trim();
    const cleanEmail =
      (data.customerEmail && data.customerEmail.trim()) ||
      `${cleanPhone.replace(/\D/g, '') || 'cust'}@studio.agifthub.com`;

    let existingCust = registeredUsers.find(
      (u) =>
        (cleanPhone && u.phone === cleanPhone) ||
        (data.customerEmail && u.email.toLowerCase() === data.customerEmail.toLowerCase())
    );

    const customerId = existingCust ? existingCust.id : `user-cust-${Date.now()}`;
    if (!existingCust) {
      const newCust: User = {
        id: customerId,
        name: data.customerName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        role: 'customer',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setRegisteredUsers((prev) => [...prev, newCust]);
    }

    const orderItems: OrderItem[] = data.items.map((item, idx) => ({
      id: `oi-inv-${Date.now()}-${idx}`,
      name: item.name || 'Artisan Custom Photo Frame',
      sku: `PFS-INV-${idx + 1}`,
      size: item.size || '12x18 inch',
      material: item.material || 'Solid Handcrafted Teakwood',
      color: item.color || 'Natural Amber Teak',
      quantity: Math.max(1, item.quantity),
      price: item.price,
      discount: 0,
      finalPrice: item.price * Math.max(1, item.quantity),
      customText: item.customText || undefined,
      isCustom: Boolean(item.customText),
    }));

    const balanceDue = Math.max(0, data.orderTotal - data.advancePaid);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      invoiceNumber,
      customerId,
      customerName: data.customerName.trim(),
      customerPhone: cleanPhone,
      customerEmail: cleanEmail,
      shippingAddress: {
        id: `addr-${Date.now()}`,
        userId: customerId,
        fullName: data.customerName.trim(),
        phone: cleanPhone,
        street: data.address.street.trim() || 'Studio Counter Pickup',
        city: data.address.city.trim() || 'New Delhi',
        state: data.address.state.trim() || 'Delhi',
        postalCode: data.address.postalCode.trim() || '110001',
        isDefault: true,
      },
      items: orderItems,
      subtotal: data.subtotal,
      discountAmount: data.discountAmount || 0,
      shippingCharge: data.shippingCharge || 0,
      taxAmount: data.taxAmount || 0,
      orderTotal: data.orderTotal,
      advancePaid: data.advancePaid,
      balanceDue,
      paymentStatus: data.paymentStatus,
      productionStatus: data.productionStatus || 'Confirmed',
      orderDate: new Date().toISOString(),
      estimatedDeliveryDate:
        data.deliveryDate ||
        new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      internalNotes: data.internalNotes || 'Invoice generated directly from Admin Suite counter.',
      statusHistory: [
        {
          id: `sh-${Date.now()}`,
          status: data.productionStatus || 'Confirmed',
          changedAt: new Date().toISOString(),
          changedBy: currentUser?.name || 'Expert Aftab Tech',
          comment: `Invoice generated by Studio Admin. Payment Method: ${data.paymentMethod}`,
        },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Create Payment if advance/full amount received
    if (data.advancePaid > 0) {
      const paymentRecord: Payment = {
        id: `pay-${Date.now()}`,
        paymentNumber: `PAY-2026-${String(payments.length + 1).padStart(4, '0')}`,
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        customerName: newOrder.customerName,
        amount: data.advancePaid,
        paymentMethod: data.paymentMethod,
        transactionReference:
          data.transactionReference ||
          `${data.paymentMethod}-INV-${Date.now().toString().slice(-6)}`,
        paymentDate: new Date().toISOString(),
        verificationStatus: 'Verified',
        notes: `Payment for Invoice ${invoiceNumber}`,
      };
      setPayments((prev) => [paymentRecord, ...prev]);
    }

    // Auto-generate cash memo
    const upiUri = buildUpiUri({
      upiId: settings.upiId,
      storeName: settings.storeName,
      amount: newOrder.balanceDue > 0 ? newOrder.balanceDue : undefined,
      orderNumber: newOrder.orderNumber,
    });
    const qrCodeData = generateQRCodeSVG(upiUri, 150);

    const memo: CashMemo = {
      invoiceNumber,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      issuedDate: new Date().toISOString(),
      subtotal: newOrder.subtotal,
      discount: newOrder.discountAmount,
      shipping: newOrder.shippingCharge,
      tax: newOrder.taxAmount,
      total: newOrder.orderTotal,
      amountPaid: newOrder.advancePaid,
      balanceDue: newOrder.balanceDue,
      paymentMethod: data.paymentMethod,
      paymentStatus: newOrder.paymentStatus,
      deliveryStatus: newOrder.productionStatus,
      deliveredDate: newOrder.deliveredDate,
      upiId: settings.upiId,
      qrCodeData,
      customer: {
        name: newOrder.customerName,
        phone: newOrder.customerPhone,
        address: `${newOrder.shippingAddress.street}, ${newOrder.shippingAddress.city}, ${newOrder.shippingAddress.state} - ${newOrder.shippingAddress.postalCode}`,
      },
      items: newOrder.items.map((i) => ({
        name: i.name,
        size: i.size,
        quantity: i.quantity,
        price: i.price,
        total: i.finalPrice,
      })),
    };
    setCashMemos((prev) => ({ ...prev, [newOrder.id]: memo }));

    // Send WhatsApp notification log
    logNotification(
      'whatsapp',
      `${settings.adminWhatsAppNumber} (Studio Owner)`,
      `Invoice Generated: ${invoiceNumber}`,
      `NEW INVOICE GENERATED\n\nInvoice No: ${invoiceNumber}\nCustomer: ${newOrder.customerName}\nMobile: ${newOrder.customerPhone}\nItems: ${newOrder.items.length}\nTotal: ₹${newOrder.orderTotal.toLocaleString('en-IN')}\nPaid: ₹${newOrder.advancePaid.toLocaleString('en-IN')}\nDue: ₹${newOrder.balanceDue.toLocaleString('en-IN')}\nPayment: ${newOrder.paymentStatus} (${data.paymentMethod})\nStatus: ${newOrder.productionStatus}`,
      'Invoice Generated'
    );

    addAuditLog(
      'MAKE_INVOICE',
      `Generated invoice ${invoiceNumber} for ${newOrder.customerName} (₹${newOrder.orderTotal})`
    );

    return newOrder;
  };

  // Status transitions
  const updateOrderStatus = (orderId: string, status: OrderStatus, comment?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;

        const isDelivered = status === 'Delivered';
        const deliveredDate = isDelivered ? new Date().toISOString() : ord.deliveredDate;

        const newHistoryItem = {
          id: `sh-${Date.now()}`,
          status,
          changedAt: new Date().toISOString(),
          changedBy: currentUser?.name || 'Admin',
          comment: comment || `Status updated to ${status}`,
        };

        const updatedOrder: Order = {
          ...ord,
          productionStatus: status,
          deliveredDate,
          statusHistory: [newHistoryItem, ...ord.statusHistory],
        };

        // Notify customer on status update
        logNotification(
          'whatsapp',
          `${ord.customerPhone} (Customer)`,
          `Order ${ord.orderNumber} Status: ${status}`,
          `Hello ${ord.customerName}, your photo frame order ${ord.orderNumber} is now: *${status}*.\n${comment ? `Note: ${comment}` : ''}`,
          'Status Change'
        );

        // Auto-generate Cash memo if delivered and paid
        if (isDelivered && updatedOrder.paymentStatus === 'Paid') {
          setTimeout(() => generateFinalCashMemo(orderId), 100);
        }

        return updatedOrder;
      })
    );
    addAuditLog('ORDER_STATUS_UPDATE', `Order ${orderId} changed to ${status}`);
  };

  const rejectOrder = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const updated = {
          ...ord,
          productionStatus: 'Rejected' as OrderStatus,
          rejectionReason: reason,
          statusHistory: [
            {
              id: `sh-${Date.now()}`,
              status: 'Rejected' as OrderStatus,
              changedAt: new Date().toISOString(),
              changedBy: currentUser?.name || 'Admin',
              comment: `Rejected: ${reason}`,
            },
            ...ord.statusHistory,
          ],
        };

        logNotification(
          'whatsapp',
          `${ord.customerPhone} (Customer)`,
          `Order ${ord.orderNumber} Rejected`,
          `Dear ${ord.customerName}, your order ${ord.orderNumber} could not be fulfilled. Reason: ${reason}. Our team will contact you or issue a refund immediately.`,
          'Order Rejection'
        );

        return updated;
      })
    );
    addAuditLog('ORDER_REJECTED', `Order ${orderId} rejected. Reason: ${reason}`);
  };

  const cancelOrder = (orderId: string, reason?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          productionStatus: 'Cancelled' as OrderStatus,
          rejectionReason: reason || 'Cancelled by customer',
          statusHistory: [
            {
              id: `sh-${Date.now()}`,
              status: 'Cancelled' as OrderStatus,
              changedAt: new Date().toISOString(),
              changedBy: currentUser?.name || 'Customer',
              comment: reason || 'Cancelled by customer',
            },
            ...ord.statusHistory,
          ],
        };
      })
    );
    addAuditLog('ORDER_CANCELLED', `Order ${orderId} was cancelled.`);
  };

  const deleteOrder = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setPayments((prev) => prev.filter((p) => p.orderId !== orderId));
    setCashMemos((prev) => {
      const copy = { ...prev };
      delete copy[orderId];
      return copy;
    });

    addAuditLog(
      'ORDER_DELETED',
      `Order ${targetOrder.orderNumber} for ${targetOrder.customerName} (₹${targetOrder.orderTotal}) was permanently deleted by ${currentUser?.name || 'Admin'}.`
    );
  };

  // Record payment
  const recordPayment = (paymentData: {
    orderId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    transactionReference: string;
    notes?: string;
  }) => {
    const order = orders.find((o) => o.id === paymentData.orderId);
    if (!order) return;

    const newPaymentSeq = payments.length + 1;
    const paymentNumber = `PAY-2026-${String(newPaymentSeq).padStart(4, '0')}`;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      paymentNumber,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      transactionReference: paymentData.transactionReference,
      paymentDate: new Date().toISOString(),
      verificationStatus: 'Verified',
      notes: paymentData.notes,
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Update order financials
    const totalPaidSoFar = order.advancePaid + paymentData.amount;
    const newBalanceDue = Math.max(0, order.orderTotal - totalPaidSoFar);
    const newPaymentStatus: PaymentStatus =
      newBalanceDue === 0
        ? 'Paid'
        : totalPaidSoFar > 0
        ? 'Partially Paid'
        : 'Pending';

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== order.id) return o;
        const updated = {
          ...o,
          advancePaid: totalPaidSoFar,
          balanceDue: newBalanceDue,
          paymentStatus: newPaymentStatus,
        };

        // If delivered and now fully paid, auto generate cash memo
        if (o.productionStatus === 'Delivered' && newPaymentStatus === 'Paid') {
          setTimeout(() => generateFinalCashMemo(order.id), 100);
        }

        return updated;
      })
    );

    logNotification(
      'whatsapp',
      `${settings.adminWhatsAppNumber} (Studio Owner)`,
      `Payment Received for ${order.orderNumber}`,
      `PAYMENT RECEIVED\n\nOrder ID: ${order.orderNumber}\nCustomer: ${order.customerName}\nAmount Received: ₹${paymentData.amount.toLocaleString()}\nMethod: ${paymentData.paymentMethod}\nRef: ${paymentData.transactionReference}\nRemaining Balance Due: ₹${newBalanceDue.toLocaleString()}`,
      'Payment Received'
    );

    addAuditLog('RECORD_PAYMENT', `Recorded payment ${paymentNumber} of ₹${paymentData.amount} for order ${order.orderNumber}`);
  };

  // Cash Memo / Invoice Generation
  const generateFinalCashMemo = (orderId: string): CashMemo | null => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    // Check if existing
    if (cashMemos[orderId]) {
      return cashMemos[orderId];
    }

    const memoSeq = Object.keys(cashMemos).length + 1;
    const invoiceNumber = `PFS-INV-2026-${String(memoSeq).padStart(4, '0')}`;

    // UPI QR URI
    const upiUri = buildUpiUri({
      upiId: settings.upiId,
      storeName: settings.storeName,
      amount: order.balanceDue > 0 ? order.balanceDue : undefined,
      orderNumber: order.orderNumber,
    });
    const qrCodeData = generateQRCodeSVG(upiUri, 150);

    const cashMemo: CashMemo = {
      invoiceNumber,
      orderId: order.id,
      orderNumber: order.orderNumber,
      issuedDate: new Date().toISOString(),
      subtotal: order.subtotal,
      discount: order.discountAmount,
      shipping: order.shippingCharge,
      tax: order.taxAmount,
      total: order.orderTotal,
      amountPaid: order.advancePaid,
      balanceDue: order.balanceDue,
      paymentMethod: order.paymentStatus === 'Paid' ? 'Paid in Full' : 'Advance / Partial',
      paymentStatus: order.paymentStatus,
      deliveryStatus: order.productionStatus,
      deliveredDate: order.deliveredDate,
      upiId: settings.upiId,
      qrCodeData,
      customer: {
        name: order.customerName,
        phone: order.customerPhone,
        address: `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}`,
      },
      items: order.items.map((i) => ({
        name: i.name,
        size: i.size,
        quantity: i.quantity,
        price: i.price,
        total: i.finalPrice,
      })),
    };

    setCashMemos((prev) => ({ ...prev, [orderId]: cashMemo }));
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, invoiceNumber } : o))
    );

    addAuditLog('GENERATE_FINAL_CASH_MEMO', `Generated official Cash Memo ${invoiceNumber} for Order ${order.orderNumber}`);

    return cashMemo;
  };

  const getCashMemoForOrder = (orderId: string): CashMemo | null => {
    if (cashMemos[orderId]) return cashMemos[orderId];
    // If order is delivered & paid, or admin requests, we can generate on-the-fly
    return generateFinalCashMemo(orderId);
  };

  // Studio Settings update
  const updateSettings = (newSettings: Partial<StudioSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addAuditLog('UPDATE_SETTINGS', 'Studio configuration updated.');
  };

  // Coupons
  const addCoupon = (couponData: Omit<Coupon, 'id' | 'usageCount'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `coup-${Date.now()}`,
      usageCount: 0,
    };
    setCoupons((prev) => [...prev, newCoupon]);
    addAuditLog('ADD_COUPON', `Created coupon ${newCoupon.code}`);
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    addAuditLog('DELETE_COUPON', `Deleted coupon ID: ${id}`);
  };

  // Manual Notification trigger
  const sendCustomNotification = (
    type: 'whatsapp' | 'email',
    recipient: string,
    title: string,
    message: string
  ) => {
    logNotification(type, recipient, title, message, 'Manual Trigger');
    addAuditLog('MANUAL_NOTIFICATION', `Sent ${type} to ${recipient}`);
  };

  const resetDataToFactory = () => {
    setCategories(INITIAL_CATEGORIES);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setPayments(INITIAL_PAYMENTS);
    setSettings(INITIAL_SETTINGS);
    setCoupons(INITIAL_COUPONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCashMemos({});
    setCart([]);
    setAppliedCoupon(null);
    setCurrentUser(INITIAL_USERS[0]);
    localStorage.clear();
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        activePortal,
        setActivePortal,
        login,
        register,
        logout,
        registeredUsers,
        categories,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        updateStock,
        addCategory,
        updateCategory,
        deleteCategory,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        orders,
        createOrder,
        createManualInvoice,
        updateOrderStatus,
        rejectOrder,
        cancelOrder,
        deleteOrder,
        payments,
        recordPayment,
        cashMemos,
        generateFinalCashMemo,
        getCashMemoForOrder,
        settings,
        updateSettings,
        coupons,
        addCoupon,
        deleteCoupon,
        notifications,
        sendCustomNotification,
        auditLogs,
        resetDataToFactory,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
