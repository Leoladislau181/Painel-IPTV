import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  Users, CreditCard, AlertCircle, TrendingUp, MessageCircle, X, 
  Search, UserPlus, Zap, ShoppingCart, Clock, AlertTriangle, ExternalLink,
  ChevronRight, BarChart as BarChartIcon, CheckCircle
} from 'lucide-react';
import { formatCurrency, generateWhatsAppLink } from '../lib/utils';
import { isPast, parseISO, format, addDays, isBefore, isAfter, subDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { 
    customers, subscriptions, payments, creditsAvailable, 
    transactions, getDebtors, receivePayment, suppliers, settings
  } = useAppContext();
  const navigate = useNavigate();
  const debtors = getDebtors();
  
  const [receivingFrom, setReceivingFrom] = useState<{ customerId: string, name: string, totalDue: number } | null>(null);
  const [receiveAmount, setReceiveAmount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper to format messages with variables
  const formatMsg = (template: string, data: Record<string, string>) => {
    let msg = template;
    Object.entries(data).forEach(([key, value]) => {
      msg = msg.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    return msg;
  };

  // --- Idea 6: Global Search Logic ---
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.phone.includes(term) || 
      c.email.toLowerCase().includes(term)
    ).slice(0, 5);
  }, [searchTerm, customers]);

  // --- Idea 2: Upcoming Expirations (Dynamic days) ---
  const upcomingExpirations = useMemo(() => {
    const today = new Date();
    const reminderDays = settings.expirationReminderDays || 5;
    const expirationLimit = addDays(today, reminderDays);
    
    return subscriptions
      .filter(s => s.status === 'active')
      .filter(s => {
        const endDate = parseISO(s.endDate);
        return isAfter(endDate, today) && isBefore(endDate, expirationLimit);
      })
      .map(s => ({
        subscription: s,
        customer: customers.find(c => c.id === s.customerId)
      }))
      .sort((a, b) => parseISO(a.subscription.endDate).getTime() - parseISO(b.subscription.endDate).getTime());
  }, [subscriptions, customers, settings.expirationReminderDays]);

  // --- Idea 4: Critical Stock Alert (Dynamic threshold) ---
  const isStockCritical = creditsAvailable < (settings.criticalStockThreshold || 5);

  const groupedDebtors = Object.values(debtors.reduce((acc, curr) => {
    const { customer, payment } = curr;
    const sub = subscriptions.find(s => s.id === payment.subscriptionId);
    const dueDate = sub ? sub.startDate : payment.dueDate;

    if (!acc[customer.id]) {
      acc[customer.id] = {
        customer,
        totalAmount: 0,
        paidAmount: 0,
        oldestDueDate: dueDate,
      };
    }
    
    acc[customer.id].totalAmount += payment.amount;
    acc[customer.id].paidAmount += payment.paidAmount;
    
    if (new Date(dueDate) < new Date(acc[customer.id].oldestDueDate)) {
      acc[customer.id].oldestDueDate = dueDate;
    }
    
    return acc;
  }, {} as Record<string, { customer: typeof customers[0], totalAmount: number, paidAmount: number, oldestDueDate: string }>));

  const handleReceivePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (receivingFrom && receiveAmount > 0) {
      receivePayment(receivingFrom.customerId, receiveAmount);
      setReceivingFrom(null);
      setReceiveAmount(0);
    }
  };

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active' || s.status === 'pending_payment').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
  const debtorsCount = payments.filter(p => p.status === 'pending' && isPast(parseISO(p.dueDate))).length;

  const totalReceived = payments.filter(p => p.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalCreditsBought = transactions.filter(t => t.type === 'buy').reduce((acc, curr) => acc + curr.amount, 0);
  const totalCost = transactions.filter(t => t.type === 'buy').reduce((acc, curr) => acc + (curr.cost || 0), 0);
  const avgCostPerCredit = totalCreditsBought > 0 ? totalCost / totalCreditsBought : 0;
  
  const totalCreditsUsed = transactions.filter(t => t.type === 'use').reduce((acc, curr) => acc + curr.amount, 0);
  const costOfCreditsUsed = totalCreditsUsed * avgCostPerCredit;
  
  const profit = totalReceived - costOfCreditsUsed;

  const stats = [
    { name: 'Total de Clientes', value: customers.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Assinaturas Ativas', value: activeSubscriptions, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Créditos Disponíveis', value: creditsAvailable, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Inadimplentes', value: debtorsCount, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-10">
      {/* Stock Alert Banner */}
      {isStockCritical && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-5 rounded-r-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-rose-100 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-900">Estoque de Créditos Crítico!</p>
              <p className="text-xs text-rose-700">Você tem apenas {creditsAvailable} créditos disponíveis. Reponha agora para não parar suas vendas.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/inventory')}
            className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
          >
            <ShoppingCart className="h-4 w-4" />
            Comprar Créditos
          </button>
        </div>
      )}

      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Visão geral do seu negócio e ações rápidas.</p>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full lg:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="input-modern pl-12 py-3 shadow-sm"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
              <div className="p-2">
                {searchResults.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      navigate('/customers');
                      setSearchTerm('');
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all text-left group"
                  >
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{c.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{c.phone}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 ml-auto text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Quick Actions */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          onClick={() => navigate('/customers')}
          className="flex items-center gap-4 p-4 modern-card hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group text-left"
        >
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <UserPlus className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Novo Cliente</span>
        </button>
        <button 
          onClick={() => navigate('/subscriptions')}
          className="flex items-center gap-4 p-4 modern-card hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group text-left"
        >
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <Zap className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ativar Plano</span>
        </button>
        <button 
          onClick={() => navigate('/inventory')}
          className="flex items-center gap-4 p-4 modern-card hover:border-amber-200 hover:bg-amber-50/30 transition-all group text-left"
        >
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Comprar Créditos</span>
        </button>
        <button 
          onClick={() => navigate('/reports')}
          className="flex items-center gap-4 p-4 modern-card hover:border-slate-200 hover:bg-slate-50 transition-all group text-left"
        >
          <div className="p-3 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-all">
            <BarChartIcon className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Relatórios</span>
        </button>
      </section>
      
      {/* Main Stats Grid */}
      <section className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item) => (
            <div key={item.name} className="modern-card p-6 flex items-center gap-5">
              <div className={`p-4 rounded-2xl ${item.bg}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">{item.name}</dt>
                <dd className="text-2xl font-bold text-slate-900">{item.value}</dd>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="modern-card p-6 border-l-4 border-l-emerald-500">
            <dt className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Recebido</dt>
            <dd className="text-3xl font-black text-slate-900">{formatCurrency(totalReceived)}</dd>
          </div>
          <div className="modern-card p-6 border-l-4 border-l-indigo-500">
            <dt className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Lucro Líquido</dt>
            <dd className={`text-3xl font-black ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatCurrency(profit)}
            </dd>
            <p className="text-[10px] text-slate-400 mt-1">Recebido - Custo de Créditos</p>
          </div>
          <div className="modern-card p-6 border-l-4 border-l-amber-500">
            <dt className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">A Receber</dt>
            <dd className="text-3xl font-black text-slate-900">{formatCurrency(pendingPayments)}</dd>
            <p className="text-[10px] text-slate-400 mt-1">Faturas Pendentes</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Debtors */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-rose-600" />
                Inadimplentes
              </h2>
              {groupedDebtors.length > 0 && (
                <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest">
                  {groupedDebtors.length} Clientes
                </span>
              )}
            </div>
            
            <div className="modern-card overflow-hidden">
              {groupedDebtors.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Nome</th>
                        <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Vencimento</th>
                        <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Valor</th>
                        <th scope="col" className="relative py-4 pl-3 pr-6">
                          <span className="sr-only">Ações</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {groupedDebtors.map((debtor: any) => (
                        <tr key={debtor.customer.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="whitespace-nowrap py-5 pl-6 pr-3">
                            <p className="text-sm font-semibold text-slate-900">{debtor.customer.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{debtor.customer.phone}</p>
                          </td>
                          <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500">
                            {format(parseISO(debtor.oldestDueDate), 'dd/MM/yyyy')}
                          </td>
                          <td className="whitespace-nowrap px-3 py-5 text-sm">
                            <span className="font-bold text-rose-600">{formatCurrency(debtor.totalAmount - debtor.paidAmount)}</span>
                          </td>
                          <td className="relative whitespace-nowrap py-5 pl-3 pr-6 text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setReceivingFrom({ 
                                    customerId: debtor.customer.id, 
                                    name: debtor.customer.name, 
                                    totalDue: debtor.totalAmount - debtor.paidAmount 
                                  });
                                  setReceiveAmount(debtor.totalAmount - debtor.paidAmount);
                                }}
                                className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
                                title="Receber Pagamento"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <a
                                href={generateWhatsAppLink(debtor.customer.phone, formatMsg(settings.debtCollectionMessage, {
                                  nome: debtor.customer.name,
                                  painel: settings.panelName,
                                  valor: formatCurrency(debtor.totalAmount - debtor.paidAmount),
                                  data: format(parseISO(debtor.oldestDueDate), 'dd/MM/yyyy')
                                }))}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all active:scale-95"
                                title="Cobrar WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 italic flex flex-col items-center gap-3">
                  <div className="p-4 rounded-full bg-emerald-50">
                    <CheckCircle className="h-10 w-10 text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium">Tudo em dia! Nenhum cliente inadimplente.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Upcoming Expirations */}
        <div className="space-y-8">
          <section className="modern-card p-6 h-fit">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                Vencendo em Breve
              </h2>
              <span className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                {settings.expirationReminderDays || 5} Dias
              </span>
            </div>
            
            <div className="space-y-3">
              {upcomingExpirations.length > 0 ? (
                upcomingExpirations.map((item) => (
                  <div key={item.subscription.id} className="p-4 rounded-2xl bg-slate-50/50 border border-transparent hover:border-slate-100 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.customer?.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{item.customer?.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-indigo-600">
                          {format(parseISO(item.subscription.endDate), 'dd/MM')}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const message = encodeURIComponent(formatMsg(settings.expirationReminderMessage, {
                          nome: item.customer?.name || '',
                          painel: settings.panelName,
                          data: format(parseISO(item.subscription.endDate), 'dd/MM/yyyy')
                        }));
                        window.open(`https://wa.me/${item.customer?.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
                      }}
                      className="w-full py-2 px-4 rounded-xl bg-white border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="h-3 w-3" />
                      Lembrar
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 italic flex flex-col items-center gap-3">
                  <CheckCircle className="h-10 w-10 text-emerald-100" />
                  <p className="text-xs">Nenhum vencimento próximo.</p>
                </div>
              )}
            </div>
          </section>

          {/* Activity Summary Card */}
          <section className="modern-card p-6 bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp className="h-24 w-24" />
            </div>
            <h3 className="text-lg font-bold mb-6 relative z-10">Resumo de Atividade</h3>
            <div className="space-y-6 relative z-10">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Faturamento Total</p>
                <p className="text-2xl font-black">{formatCurrency(totalReceived + pendingPayments)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Créditos Usados</p>
                  <p className="text-xl font-black">{totalCreditsUsed}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Novos Clientes</p>
                  <p className="text-xl font-black">+{customers.filter(c => isAfter(parseISO(c.createdAt), subDays(new Date(), 7))).length}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Receive Payment Modal */}
      {receivingFrom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Receber Pagamento</h3>
              <button onClick={() => setReceivingFrom(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-sm text-slate-500 leading-relaxed">
                Registrar pagamento de <span className="font-bold text-slate-900">{receivingFrom.name}</span>. 
                Dívida total: <span className="font-bold text-rose-600">{formatCurrency(receivingFrom.totalDue)}</span>.
              </p>
            </div>
            <form onSubmit={handleReceivePayment} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Valor Recebido (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={receivingFrom.totalDue}
                  required
                  autoFocus
                  className="input-modern text-lg font-bold"
                  value={receiveAmount}
                  onChange={(e) => setReceiveAmount(Number(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  className="btn-primary w-full py-4 text-sm font-bold shadow-lg shadow-slate-900/10"
                >
                  Confirmar Recebimento
                </button>
                <button
                  type="button"
                  onClick={() => setReceivingFrom(null)}
                  className="btn-secondary w-full py-4 text-sm font-bold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
