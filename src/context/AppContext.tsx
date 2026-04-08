import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, Subscription, CreditTransaction, Payment, ProductPackage, Plan, Supplier, AppSettings } from '../types';
import { addMonths, format, isPast, isToday, parseISO, subDays } from 'date-fns';

interface AppContextType {
  customers: Customer[];
  subscriptions: Subscription[];
  transactions: CreditTransaction[];
  payments: Payment[];
  packages: ProductPackage[];
  plans: Plan[];
  suppliers: Supplier[];
  settings: AppSettings;
  creditsAvailable: number;
  
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  addPackage: (pkg: Omit<ProductPackage, 'id'>) => void;
  updatePackage: (id: string, pkg: Partial<ProductPackage>) => void;
  deletePackage: (id: string) => void;

  addPlan: (plan: Omit<Plan, 'id'>) => void;
  updatePlan: (id: string, plan: Partial<Plan>) => void;
  deletePlan: (id: string) => void;

  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  updateSettings: (settings: Partial<AppSettings>) => void;
  exportData: (format: 'json' | 'csv') => void;
  
  activateSubscription: (customerId: string, price: number, startDate: string, endDate: string, credits: number) => void;
  renewSubscription: (subscriptionId: string, price: number, months: number) => void;
  
  buyCredits: (packageId: string) => void;
  
  markPaymentPaid: (paymentId: string) => void;
  receivePayment: (customerId: string, amount: number) => void;
  getReferralDiscount: (customerId: string) => number;
  
  getDebtors: () => { customer: Customer, payment: Payment }[];
  getCashFlow: () => { date: string, income: number, expense: number }[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Mock Data
const initialPackages: ProductPackage[] = [
  { id: 'pkg_1', name: 'Iniciante (10 Créditos)', credits: 10, price: 50 },
  { id: 'pkg_2', name: 'Profissional (50 Créditos)', credits: 50, price: 200 },
  { id: 'pkg_3', name: 'Master (100 Créditos)', credits: 100, price: 350 },
];

const initialPlans: Plan[] = [
  { id: 'plan_1', name: 'Mensal', price: 35, durationMonths: 1, credits: 1 },
  { id: 'plan_2', name: 'Trimestral', price: 90, durationMonths: 3, credits: 3 },
];

const initialCustomers: Customer[] = [
  { id: 'c_1', name: 'João Silva', phone: '11999999999', email: 'joao@email.com', createdAt: new Date().toISOString() },
  { id: 'c_2', name: 'Maria Souza', phone: '11988888888', email: 'maria@email.com', referredById: 'c_1', createdAt: new Date().toISOString() },
];

const initialSettings: AppSettings = {
  referralDiscount: 5,
  referralMaxDiscountPercent: 50,
  welcomeMessage: "Olá {nome}, seja bem-vindo ao {painel}! Sua assinatura foi ativada com sucesso.",
  debtCollectionMessage: "Olá {nome}, verificamos que há faturas em aberto no valor de {valor}. Gostaria de regularizar?",
  expirationReminderMessage: "Olá {nome}, sua assinatura no {painel} vence em {data}. Gostaria de renovar antecipadamente?",
  paymentConfirmationMessage: "Obrigado {nome}! Recebemos seu pagamento de {valor}. Sua assinatura está em dia.",
  panelName: "Meu Painel IPTV",
  primaryColor: "#4f46e5",
  supportPhone: "11999999999",
  criticalStockThreshold: 5,
  expirationReminderDays: 5,
  theme: 'dark',
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [packages, setPackages] = useState<ProductPackage[]>(initialPackages);
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('app_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
    
    // Apply theme
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (settings.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(settings.theme);
    }
  }, [settings]);

  // Calculate available credits
  const creditsAvailable = transactions.reduce((acc, curr) => {
    return curr.type === 'buy' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  // Update subscription statuses based on dates
  useEffect(() => {
    setSubscriptions(subs => {
      return subs.map(sub => {
        if (sub.status === 'pending_payment') return sub;
        
        const isExpired = isPast(parseISO(sub.endDate)) && !isToday(parseISO(sub.endDate));
        if (isExpired && sub.status === 'active') {
          return { ...sub, status: 'expired' };
        }
        return sub;
      });
    });
  }, [customers]);

  // Effect to handle referral discount updates when subscription statuses change
  useEffect(() => {
    // Update all customers who have referrals
    const referrers = new Set<string>(customers.filter(c => c.referredById).map(c => c.referredById as string));
    referrers.forEach(referrerId => {
      if (referrerId) updateReferrerPayments(referrerId);
    });
  }, [subscriptions]);

  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `c_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCustomers([...customers, newCustomer]);
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  const addPackage = (pkgData: Omit<ProductPackage, 'id'>) => {
    const newPkg: ProductPackage = {
      ...pkgData,
      id: `pkg_${Date.now()}`,
    };
    setPackages([...packages, newPkg]);
  };

  const updatePackage = (id: string, data: Partial<ProductPackage>) => {
    setPackages(packages.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deletePackage = (id: string) => {
    setPackages(packages.filter(p => p.id !== id));
  };

  const addPlan = (planData: Omit<Plan, 'id'>) => {
    const newPlan: Plan = {
      ...planData,
      id: `plan_${Date.now()}`,
    };
    setPlans([...plans, newPlan]);
  };

  const updatePlan = (id: string, data: Partial<Plan>) => {
    setPlans(plans.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deletePlan = (id: string) => {
    setPlans(plans.filter(p => p.id !== id));
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup_${Date.now()}`,
    };
    setSuppliers([...suppliers, newSupplier]);
  };

  const updateSupplier = (id: string, data: Partial<Supplier>) => {
    setSuppliers(suppliers.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const exportData = (formatType: 'json' | 'csv') => {
    const data = {
      customers,
      subscriptions,
      transactions,
      payments,
      packages,
      plans,
      suppliers,
      settings
    };

    if (formatType === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
      link.click();
    } else {
      // Simple CSV export for customers as example
      let csv = 'ID,Nome,Telefone,Email,Criado Em\n';
      customers.forEach(c => {
        csv += `${c.id},${c.name},${c.phone},${c.email},${c.createdAt}\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `clientes_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();
    }
  };

  const getReferralDiscount = (customerId: string) => {
    // Referrer must be active or pending payment to receive discount
    const hasValidSubscription = subscriptions.some(s => s.customerId === customerId && (s.status === 'active' || s.status === 'pending_payment'));
    if (!hasValidSubscription) return 0;

    // Count active referrals
    const activeReferralsCount = customers.filter(c => c.referredById === customerId).filter(referredCustomer => {
      const sub = subscriptions.find(s => s.customerId === referredCustomer.id && s.status === 'active');
      return !!sub;
    }).length;

    return activeReferralsCount * settings.referralDiscount;
  };

  const updateReferrerPayments = (referrerId: string) => {
    const discount = getReferralDiscount(referrerId);
    
    setPayments(prevPayments => prevPayments.map(p => {
      if (p.customerId === referrerId && (p.status === 'pending' || p.status === 'partial')) {
        const maxDiscount = (p.baseAmount * settings.referralMaxDiscountPercent) / 100;
        const actualDiscount = Math.min(discount, maxDiscount);
        const newAmount = Math.max(p.paidAmount, p.baseAmount - actualDiscount);
        return { 
          ...p, 
          amount: newAmount,
          status: newAmount <= p.paidAmount ? 'paid' : p.status
        };
      }
      return p;
    }));
  };

  const activateSubscription = (customerId: string, basePrice: number, startDate: string, endDate: string, credits: number) => {
    if (creditsAvailable < credits) {
      alert('Créditos insuficientes! Compre mais pacotes.');
      return;
    }

    const discount = getReferralDiscount(customerId);
    const maxDiscount = (basePrice * settings.referralMaxDiscountPercent) / 100;
    const actualDiscount = Math.min(discount, maxDiscount);
    const finalPrice = Math.max(0, basePrice - actualDiscount);

    const newSub: Subscription = {
      id: `sub_${Date.now()}`,
      customerId,
      startDate,
      endDate,
      price: finalPrice,
      status: 'pending_payment',
    };

    const newPayment: Payment = {
      id: `pay_${Date.now()}`,
      subscriptionId: newSub.id,
      customerId,
      amount: finalPrice,
      baseAmount: basePrice,
      paidAmount: 0,
      dueDate: startDate, // Vencimento do pagamento é a data de início
      status: 'pending',
    };

    const newTransaction: CreditTransaction = {
      id: `tx_${Date.now()}`,
      type: 'use',
      amount: credits,
      date: new Date().toISOString(),
    };

    setSubscriptions([...subscriptions, newSub]);
    setPayments([...payments, newPayment]);
    setTransactions([...transactions, newTransaction]);
  };

  const renewSubscription = (subscriptionId: string, basePrice: number, months: number = 1) => {
    if (creditsAvailable < months) {
      alert('Créditos insuficientes! Compre mais pacotes.');
      return;
    }

    const sub = subscriptions.find(s => s.id === subscriptionId);
    if (!sub) return;

    const discount = getReferralDiscount(sub.customerId);
    const maxDiscount = (basePrice * settings.referralMaxDiscountPercent) / 100;
    const actualDiscount = Math.min(discount, maxDiscount);
    const finalPrice = Math.max(0, basePrice - actualDiscount);

    const newEndDate = addMonths(new Date(), months); // Simple renewal from today
    
    const updatedSub: Subscription = {
      ...sub,
      endDate: newEndDate.toISOString(),
      status: 'pending_payment',
      price: finalPrice,
    };

    const newPayment: Payment = {
      id: `pay_${Date.now()}`,
      subscriptionId: sub.id,
      customerId: sub.customerId,
      amount: finalPrice,
      baseAmount: basePrice,
      paidAmount: 0,
      dueDate: new Date().toISOString(),
      status: 'pending',
    };

    const newTransaction: CreditTransaction = {
      id: `tx_${Date.now()}`,
      type: 'use',
      amount: months,
      date: new Date().toISOString(),
    };

    setSubscriptions(subscriptions.map(s => s.id === subscriptionId ? updatedSub : s));
    setPayments([...payments, newPayment]);
    setTransactions([...transactions, newTransaction]);
  };

  const buyCredits = (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;

    const newTransaction: CreditTransaction = {
      id: `tx_${Date.now()}`,
      type: 'buy',
      amount: pkg.credits,
      cost: pkg.price,
      date: new Date().toISOString(),
    };

    setTransactions([...transactions, newTransaction]);
  };

  const markPaymentPaid = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    setPayments(payments.map(p => p.id === paymentId ? { ...p, status: 'paid', paidAmount: p.amount, paymentDate: new Date().toISOString() } : p));
    
    // Update subscription status if it was pending
    setSubscriptions(subs => subs.map(s => {
      if (s.id === payment.subscriptionId && s.status === 'pending_payment') {
        return { ...s, status: 'active' };
      }
      return s;
    }));

    // Trigger immediate discount update for the referrer
    const customer = customers.find(c => c.id === payment.customerId);
    if (customer?.referredById) {
      updateReferrerPayments(customer.referredById);
    }
  };

  const receivePayment = (customerId: string, amountReceived: number) => {
    let remaining = amountReceived;
    const updatedPayments = [...payments];
    const affectedSubscriptionIds = new Set<string>();
    let referrerIdToUpdate: string | null = null;

    // Sort pending/partial payments by due date
    const pendingPayments = updatedPayments
      .filter(p => p.customerId === customerId && (p.status === 'pending' || p.status === 'partial'))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    for (const payment of pendingPayments) {
      if (remaining <= 0) break;

      const balance = payment.amount - payment.paidAmount;
      const paymentToApply = Math.min(remaining, balance);

      payment.paidAmount += paymentToApply;
      remaining -= paymentToApply;

      if (payment.paidAmount >= payment.amount) {
        payment.status = 'paid';
        payment.paymentDate = new Date().toISOString();
        affectedSubscriptionIds.add(payment.subscriptionId);
        
        // If this payment makes a subscription active, we might need to update a referrer
        const customer = customers.find(c => c.id === payment.customerId);
        if (customer?.referredById) {
          referrerIdToUpdate = customer.referredById;
        }
      } else {
        payment.status = 'partial';
      }
    }

    setPayments(updatedPayments);

    // Update subscription statuses if fully paid
    if (affectedSubscriptionIds.size > 0) {
      setSubscriptions(subs => subs.map(s => {
        if (affectedSubscriptionIds.has(s.id) && s.status === 'pending_payment') {
          return { ...s, status: 'active' };
        }
        return s;
      }));
    }

    // Trigger immediate discount update for the referrer
    if (referrerIdToUpdate) {
      updateReferrerPayments(referrerIdToUpdate);
    }
  };

  const getDebtors = () => {
    return payments
      .filter(p => p.status !== 'paid' && isPast(parseISO(p.dueDate)))
      .map(p => {
        const customer = customers.find(c => c.id === p.customerId)!;
        return { customer, payment: p };
      })
      .filter(d => d.customer !== undefined);
  };

  const getCashFlow = () => {
    // Simple aggregation by month
    const flow: Record<string, { income: number, expense: number }> = {};
    
    payments.forEach(p => {
      if (p.paidAmount > 0 && p.paymentDate) {
        const month = format(parseISO(p.paymentDate), 'MMM yyyy');
        if (!flow[month]) flow[month] = { income: 0, expense: 0 };
        flow[month].income += p.paidAmount;
      }
    });

    transactions.filter(t => t.type === 'buy').forEach(t => {
      const month = format(parseISO(t.date), 'MMM yyyy');
      if (!flow[month]) flow[month] = { income: 0, expense: 0 };
      flow[month].expense += t.cost || 0;
    });

    return Object.entries(flow).map(([date, data]) => ({
      date,
      income: data.income,
      expense: data.expense
    }));
  };

  return (
    <AppContext.Provider value={{
      customers, subscriptions, transactions, payments, packages, plans, suppliers, settings, creditsAvailable,
      addCustomer, updateCustomer, deleteCustomer, addPackage, updatePackage, deletePackage, addPlan, updatePlan, deletePlan, addSupplier, updateSupplier, deleteSupplier, updateSettings, exportData, activateSubscription, renewSubscription, buyCredits, markPaymentPaid, receivePayment, getReferralDiscount, getDebtors, getCashFlow
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
