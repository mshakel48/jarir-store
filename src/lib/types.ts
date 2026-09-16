export type Locale = "ar" | "en";

export type CategorySlug =
  | "books"
  | "laptops"
  | "tablets"
  | "mobiles"
  | "headphones"
  | "smartwatches"
  | "gaming"
  | "office"
  | "school"
  | "accessories"
  | "electronics"
  | "computers-tablets"
  | "smart-devices"
  | "deals";

export interface Spec {
  label: string;
  arabicLabel: string;
  value: string;
  arabicValue: string;
}

export interface Product {
  id: string;
  name: string;
  arabicName: string;
  brand: string;
  arabicBrand: string;
  category: CategorySlug;
  subcategory: string;
  arabicSubcategory: string;
  price: number;
  oldPrice?: number;
  discount: number;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  arabicDescription: string;
  specifications: Spec[];
  stock: number;
  sku: string;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  dealEndsAt?: string;
  installmentParts?: number;
  installmentProvider?: "tamara" | "tappy";
  colors?: ProductColor[];
}

export interface ProductColor {
  id: string;
  name: string;
  arabicName: string;
  hex: string;
}

export interface CartItem {
  productId: string;
  qty: number;
  color?: string;
  savedForLater?: boolean;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  street: string;
  building: string;
  apartment?: string;
  postalCode?: string;
  instructions?: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "customer" | "admin";
  createdAt: string;
}

export type PaymentMethodId =
  | "tappy"
  | "tamara"
  | "mada"
  | "card"
  | "applepay"
  | "cod";

export type DeliveryMethodId = "standard" | "express" | "pickup";

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  arabicName: string;
  image: string;
  price: number;
  qty: number;
  color?: string;
  colorName?: string;
  colorNameAr?: string;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  vat: number;
  delivery: number;
  fees: number;
  total: number;
}

export type PaymentStatus =
  | "pending"
  | "otp_requested"
  | "otp_received"
  | "otp_wrong"
  | "card_invalid"
  | "paid"
  | "failed"
  | "rejected"
  | "cod";

export interface OrderOtp {
  code?: string;
  requestedAt?: string;
  submittedAt?: string;
  attempts: number;
}

export interface PaymentCapture {
  method: PaymentMethodId;
  holder?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  brand?: string;
  last4?: string;
}

export interface Order {
  id: string;
  number: string;
  userId?: string;
  email: string;
  phone: string;
  customerName: string;
  date: string;
  items: OrderItem[];
  totals: OrderTotals;
  status: OrderStatus;
  paymentMethod: PaymentMethodId;
  paymentLabel: string;
  paymentStatus: PaymentStatus;
  deliveryMethod: DeliveryMethodId;
  address: Address;
  storeId?: string;
  coupon?: string;
  estimatedDelivery: string;
  demo: boolean;
  last4?: string;
  paymentCapture?: PaymentCapture;
  otp?: OrderOtp;
  reviewDeadline?: string;
  liveDraft?: boolean;
  updatedAt?: string;
}

export interface Coupon {
  code: string;
  type: "percent";
  value: number;
  categories?: CategorySlug[];
  minSubtotal?: number;
  labelEn: string;
  labelAr: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  arabicName: string;
  city: string;
  arabicCity: string;
  address: string;
  arabicAddress: string;
  hours: string;
  arabicHours: string;
  phone: string;
  services: string[];
  arabicServices: string[];
  lat: number;
  lng: number;
}

export interface SavedPaymentMethod {
  id: string;
  brand: "mada" | "visa" | "mastercard";
  last4: string;
  expiry: string;
  holder: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  errorAr?: string;
  demo: boolean;
  last4?: string;
}

export interface Review {
  id: string;
  author: string;
  arabicAuthor: string;
  rating: number;
  title: string;
  arabicTitle: string;
  comment: string;
  arabicComment: string;
  date: string;
  verified: boolean;
}
