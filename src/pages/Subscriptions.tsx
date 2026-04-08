import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { format, parseISO, addMonths } from 'date-fns';
import { formatCurrency, generateWhatsAppLink } from '../lib/utils';
import { MessageCircle, CheckCircle, AlertCircle, Package, CreditCard, X } from 'lucide-react';

export function Subscriptions() {
  const { 
    customers, subscriptions, payments, activateSubscription, 
    renewSubscription, markPaymentPaid, receivePayment, 
    getReferralDiscount, creditsAvailable, plans, settings 
  } = useAppContext();
  const [isActivating, setIsActivating] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [receivingFrom, setReceivingFrom] = useState<{ customerId: string, name: string, totalDue: number } | null>(null);
  const [receiveAmount, setReceiveAmount] = useState<number>(0);
  
  const today = new Date();
  const [formData, setFormData] = useState({ 
    customerId: '', 
    price: 35, 
    startDate: format(today, 'yyyy-MM-dd'),
    endDate: format(addMonths(today, 1), 'yyyy-MM-dd'),
    credits: 1 
  });

  // Helper to format messages with variables
  const formatMsg = (template: string, data: Record<string, string>) => {
    let msg = template;
    Object.entries(data).forEach(([key, value]) => {
      msg = msg.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    return msg;
  };

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const planId = e.target.value;
    setSelectedPlanId(planId);
    
    if (planId) {
      const plan = plans.find(p => p.id === planId);
      if (plan) {
        setFormData({
          ...formData,
          price: plan.price,
          endDate: format(addMonths(parseISO(formData.startDate), plan.durationMonths), 'yyyy-MM-dd'),
          credits: plan.credits
        });
      }
    }
  };

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) return alert('Selecione um cliente');
    
    const startIso = new Date(formData.startDate + 'T12:00:00').toISOString();
    const endIso = new Date(formData.endDate + 'T12:00:00').toISOString();
    
    activateSubscription(formData.customerId, formData.price, startIso, endIso, formData.credits);
    setIsActivating(false);
  };

  const currentDiscount = formData.customerId ? getReferralDiscount(formData.customerId) : 0;

  const getCustomer = (id: string) => customers.find(c => c.id === id);
  const getPendingPayment = (subId: string) => payments.find(p => p.subscriptionId === subId && p.status !== 'paid');

  const handleReceivePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (receivingFrom && receiveAmount > 0) {
      receivePayment(receivingFrom.customerId, receiveAmount);
      setReceivingFrom(null);
      setReceiveAmount(0);
    }
  };

  return (
    <div className="space-y-10">
      <header className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Assinaturas</h1>
          <p className="mt-2 text-slate-500">
            Ative ou renove assinaturas. Cada mês ativado consome 1 crédito do seu estoque.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsActivating(!isActivating)}
            className="btn-primary"
          >
            {isActivating ? 'Fechar Formulário' : 'Ativar Assinatura'}
          </button>
        </div>
      </header>

      {isActivating && (
        <section className="modern-card p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Nova Assinatura</h3>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
              <Package className="h-3 w-3" />
              {creditsAvailable} créditos disponíveis
            </div>
          </div>
          <form onSubmit={handleActivate} className="space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Cliente</label>
                <select
                  required
                  className="input-modern"
                  value={formData.customerId}
                  onChange={e => setFormData({...formData, customerId: e.target.value})}
                >
                  <option value="">Selecione um cliente...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Plano</label>
                <select
                  className="input-modern"
                  value={selectedPlanId}
                  onChange={handlePlanChange}
                >
                  <option value="">Plano Personalizado</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Preço (R$)</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="input-modern"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  />
                  {currentDiscount > 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                      -{formatCurrency(currentDiscount)}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Data de Início</label>
                <input
                  type="date"
                  required
                  className="input-modern"
                  value={formData.startDate}
                  onChange={e => {
                    setFormData({...formData, startDate: e.target.value});
                    if (selectedPlanId) {
                      const plan = plans.find(p => p.id === selectedPlanId);
                      if (plan) {
                        setFormData(prev => ({
                          ...prev,
                          endDate: format(addMonths(parseISO(e.target.value), plan.durationMonths), 'yyyy-MM-dd')
                        }));
                      }
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Data de Término</label>
                <input
                  type="date"
                  required
                  className="input-modern"
                  value={formData.endDate}
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Créditos a Consumir</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="input-modern"
                  value={formData.credits}
                  onChange={e => setFormData({...formData, credits: Number(e.target.value)})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsActivating(false)}
                className="btn-secondary px-8"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary px-12"
              >
                Ativar Agora
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="modern-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Cliente</th>
                <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Vencimento</th>
                <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Pagamento</th>
                <th scope="col" className="relative py-4 pl-3 pr-6">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subscriptions.map((sub) => {
                const customer = getCustomer(sub.customerId);
                const pendingPayment = getPendingPayment(sub.id);
                if (!customer) return null;

                return (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="whitespace-nowrap py-5 pl-6 pr-3 text-sm font-semibold text-slate-900">{customer.name}</td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        sub.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                        sub.status === 'expired' ? 'bg-rose-50 text-rose-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {sub.status === 'active' ? 'Ativa' : sub.status === 'expired' ? 'Expirada' : 'Pendente'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500 font-medium">{format(parseISO(sub.endDate), 'dd/MM/yyyy')}</td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm">
                      {pendingPayment ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-rose-600 font-bold">{formatCurrency(pendingPayment.amount - pendingPayment.paidAmount)}</span>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => markPaymentPaid(pendingPayment.id)}
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                                title="Marcar como Pago Total"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => {
                                  setReceivingFrom({ 
                                    customerId: customer.id, 
                                    name: customer.name, 
                                    totalDue: pendingPayment.amount - pendingPayment.paidAmount 
                                  });
                                  setReceiveAmount(pendingPayment.amount - pendingPayment.paidAmount);
                                }}
                                className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                                title="Receber Parcial"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          {pendingPayment.paidAmount > 0 && (
                            <div className="flex items-center gap-1.5">
                              <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500" 
                                  style={{ width: `${(pendingPayment.paidAmount / pendingPayment.amount) * 100}%` }}
                                />
                              </div>
                              <span className="text-[9px] text-slate-400 font-bold uppercase">{(pendingPayment.paidAmount / pendingPayment.amount * 100).toFixed(0)}%</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4"/> 
                          Pago
                        </span>
                      )}
                    </td>
                    <td className="relative whitespace-nowrap py-5 pl-3 pr-6 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        {sub.status === 'expired' && (
                          <button
                            onClick={() => renewSubscription(sub.id, sub.price, 1)}
                            className="text-indigo-600 hover:text-indigo-900 text-xs font-bold uppercase tracking-wider"
                          >
                            Renovar
                          </button>
                        )}
                        
                        {pendingPayment ? (
                          <a
                            href={generateWhatsAppLink(customer.phone, formatMsg(settings.debtCollectionMessage, {
                              nome: customer.name,
                              painel: settings.panelName,
                              valor: formatCurrency(pendingPayment.amount - pendingPayment.paidAmount),
                              data: format(parseISO(pendingPayment.dueDate), 'dd/MM/yyyy')
                            }))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all active:scale-95"
                            title="Cobrar via WhatsApp"
                          >
                            <MessageCircle className="w-5 h-5" />
                          </a>
                        ) : (
                          <a
                            href={generateWhatsAppLink(customer.phone, formatMsg(settings.expirationReminderMessage, {
                              nome: customer.name,
                              painel: settings.panelName,
                              data: format(parseISO(sub.endDate), 'dd/MM/yyyy')
                            }))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-95"
                            title="Avisar renovação via WhatsApp"
                          >
                            <MessageCircle className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-slate-400 italic">Nenhuma assinatura encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

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
