export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  referredById?: string;
  notes?: string;
  deviceInfo?: {
    appUsed?: string;
    deviceCount?: number;
    macAddress?: string;
  };
  createdAt: string;
};

export type SubscriptionStatus = 'active' | 'expired' | 'pending_payment';

export type Subscription = {
  id: string;
  customerId: string;
  startDate: string;
  endDate: string;
  price: number;
  status: SubscriptionStatus;
};

export type CreditTransaction = {
  id: string;
  type: 'buy' | 'use';
  amount: number;
  cost?: number; // Total cost if 'buy'
  date: string;
};

export type PaymentStatus = 'paid' | 'pending' | 'partial';

export type Payment = {
  id: string;
  subscriptionId: string;
  customerId: string;
  amount: number;
  baseAmount: number;
  paidAmount: number;
  dueDate: string;
  paymentDate?: string;
  status: PaymentStatus;
};

export type ProductPackage = {
  id: string;
  name: string;
  credits: number;
  price: number;
};

export type Plan = {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  credits: number;
};

export type Supplier = {
  id: string;
  name: string;
  whatsapp: string;
  website?: string;
};

export type AppSettings = {
  referralDiscount: number;
  referralMaxDiscountPercent: number;
  welcomeMessage: string;
  debtCollectionMessage: string;
  expirationReminderMessage: string;
  paymentConfirmationMessage: string;
  panelName: string;
  logoUrl?: string;
  primaryColor: string;
  supportPhone: string;
  criticalStockThreshold: number;
  expirationReminderDays: number;
  theme: 'light' | 'dark' | 'system';
};
