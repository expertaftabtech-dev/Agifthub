export type UserRole = 'admin' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  password?: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  displayOrder: number;
  isPublished: boolean;
  productCount?: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  description: string;
  frameSize: string;
  material: string;
  color: string;
  availableVariants: string[];
  sellingPrice: number;
  discountPrice: number;
  productionCost: number; // Admin visible only
  stockQuantity: number;
  productionTime: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  images: string[];
  dateAdded: string;
}

export interface CustomDesign {
  id: string;
  mouldingStyle: string; // e.g. 'Royal Teak Wood', 'Matte Black Metal', 'Champagne Gold Bevel', 'Rustic Oak', 'Warm White Minimal'
  frameSize: string; // e.g. '8x10 inch', '12x18 inch', '16x20 inch'
  frameColor: string; // e.g. 'Dark Walnut', 'Brushed Gold', 'Deep Ebony', 'Pure White'
  material: string;
  mattingColor: string; // 'Ivory Cream', 'Midnight Black', 'Warm White', 'None'
  mattingWidth: number; // in inches e.g. 1, 1.5, 2
  photoUrl: string;
  photoZoom: number;
  photoOffsetX: number;
  photoOffsetY: number;
  customText: string;
  customTextFont: string;
  dateOrYear: string;
  specialInstructions: string;
  calculatedPrice: number;
}

export interface CartItem {
  id: string;
  productId?: string;
  product?: Product;
  customDesign?: CustomDesign;
  quantity: number;
  unitPrice: number;
  selectedSize?: string;
  selectedColor?: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Photo Review'
  | 'In Production'
  | 'Ready for Delivery'
  | 'Shipped'
  | 'Delivered'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled';

export type PaymentStatus = 'Pending' | 'Partially Paid' | 'Paid' | 'Refunded';

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Online Gateway';

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  size: string;
  material: string;
  color: string;
  quantity: number;
  price: number;
  discount: number;
  finalPrice: number;
  customPhotoUrl?: string;
  customText?: string;
  customDesignDetails?: string;
  isCustom: boolean;
}

export interface StatusHistoryItem {
  id: string;
  status: OrderStatus;
  changedAt: string;
  changedBy: string;
  comment?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "PFS-2026-00001"
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: Address;
  items: OrderItem[];
  orderTotal: number;
  subtotal: number;
  discountAmount: number;
  shippingCharge: number;
  taxAmount: number;
  advancePaid: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
  productionStatus: OrderStatus;
  rejectionReason?: string;
  orderDate: string;
  estimatedDeliveryDate?: string;
  deliveredDate?: string;
  internalNotes?: string;
  statusHistory: StatusHistoryItem[];
  invoiceNumber?: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  paymentDate: string;
  verificationStatus: 'Verified' | 'Pending' | 'Failed';
  receiptUrl?: string;
  notes?: string;
}

export interface CashMemo {
  invoiceNumber: string; // e.g. "PFS-INV-2026-0001"
  orderId: string;
  orderNumber: string;
  issuedDate: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  deliveryStatus: OrderStatus;
  deliveredDate?: string;
  upiId: string;
  qrCodeData: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: {
    name: string;
    size: string;
    quantity: number;
    price: number;
    total: number;
  }[];
}

export interface NotificationLog {
  id: string;
  type: 'whatsapp' | 'email';
  recipient: string;
  title: string;
  message: string;
  triggerEvent: string;
  status: 'Sent' | 'Failed' | 'Pending';
  timestamp: string;
}

export interface StudioSettings {
  storeName: string;
  storeTagline: string;
  phone: string;
  email: string;
  address: string;
  upiId: string;
  upiQrImage: string;
  adminWhatsAppNumber: string;
  currency: string;
  taxRate: number; // percentage
  freeDeliveryThreshold: number;
  standardDeliveryCharge: number;
  enableWhatsAppAutomation: boolean;
  enableEmailAutomation: boolean;
  autoGenerateInvoice: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  minOrder: number;
  validTill: string;
  active: boolean;
  usageCount: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}
