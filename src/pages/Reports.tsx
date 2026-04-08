import React from 'react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency, generateWhatsAppLink } from '../lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  MessageCircle, CheckCircle, BarChart as BarChartIcon, 
  TrendingUp, Users, Zap, Award, DollarSign, ArrowUpRight, Package, Target
} from 'lucide-react';
import { format, parseISO, subDays, isAfter, differenceInDays } from 'date-fns';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

export function Reports() {
  const { 
    getDebtors, getCashFlow, subscriptions, payments, 
    transactions, customers, getReferralDiscount 
  } = useAppContext();
  
  const debtors = getDebtors();
  const cashFlow = getCashFlow();

  // --- Metrics Calculation ---
  
  // 1. Financial Metrics
  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const mrr = activeSubs.reduce((acc, curr) => acc + curr.price, 0);
  const totalIncome = payments.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalExpense = transactions.filter(t => t.type === 'buy').reduce((acc, curr) => acc + (curr.cost || 0), 0);
  const profitMargin = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  const ticketMedio = activeSubs.length > 0 ? mrr / activeSubs.length : 0;

  // 2. Retention Metrics
  const totalSubsCount = subscriptions.length;
  const expiredSubsCount = subscriptions.filter(s => s.status === 'expired').length;
  const churnRate = totalSubsCount > 0 ? (expiredSubsCount / totalSubsCount) * 100 : 0;

  // 3. Popular Plans (by price range)
  const planDistribution = subscriptions.reduce((acc: any, sub) => {
    const priceRange = `R$ ${sub.price}`;
    acc[priceRange] = (acc[priceRange] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(planDistribution).map(([name, value]) => ({ name, value: value as number }));

  // 4. Credit Burn Rate (Last 30 days)
  const thirtyDaysAgo = subDays(new Date(), 30);
  const recentUsage = transactions
    .filter(t => t.type === 'use' && isAfter(parseISO(t.date), thirtyDaysAgo))
    .reduce((acc, curr) => acc + curr.amount, 0);
  const burnRate = recentUsage / 30;

  // 5. Referrer Ranking
  const referrerCounts = customers.reduce((acc: any, curr) => {
    if (curr.referredById) {
      acc[curr.referredById] = (acc[curr.referredById] || 0) + 1;
    }
    return acc;
  }, {});
  
  const referrerRanking = Object.entries(referrerCounts)
    .map(([id, count]) => ({
      customer: customers.find(c => c.id === id),
      count: count as number,
      discount: getReferralDiscount(id)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const totalReferralDiscounts = payments.reduce((acc, curr) => acc + (curr.baseAmount - curr.amount), 0);

  const totalDebt = debtors.reduce((acc, curr) => acc + (curr.payment.amount - curr.payment.paidAmount), 0);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Relatórios & BI</h1>
        <p className="mt-2 text-slate-500">
          Análise detalhada de faturamento, retenção e desempenho operacional.
        </p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="modern-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              MRR
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Receita Recorrente</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(mrr)}</p>
        </div>

        <div className="modern-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
              {churnRate.toFixed(1)}% Churn
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ticket Médio</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(ticketMedio)}</p>
        </div>

        <div className="modern-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
              {profitMargin.toFixed(1)}% Margem
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lucro Estimado</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalIncome - totalExpense)}</p>
        </div>

        <div className="modern-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
              {burnRate.toFixed(1)}/dia
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Burn Rate Créditos</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{recentUsage} <span className="text-sm font-bold text-slate-400">/30d</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Cash Flow Chart */}
        <section className="modern-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Fluxo de Caixa</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Receitas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Despesas</span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            {cashFlow.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={cashFlow}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '1rem', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      padding: '12px'
                    }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#6366f1" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                  <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-slate-400 italic gap-3">
                <BarChartIcon className="h-12 w-12 opacity-20" />
                <p className="text-sm">Dados insuficientes para o gráfico.</p>
              </div>
            )}
          </div>
        </section>

        {/* Popular Plans Pie Chart */}
        <section className="modern-card p-8">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-8">Distribuição de Planos</h2>
          <div className="h-80 w-full flex items-center">
            {pieData.length > 0 ? (
              <>
                <div className="flex-1 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/3 space-y-3">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-xs font-bold text-slate-600 truncate">{entry.name}</span>
                      <span className="text-xs font-medium text-slate-400 ml-auto">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center text-slate-400 italic gap-3">
                <PieChart className="h-12 w-12 opacity-20" />
                <p className="text-sm">Nenhuma assinatura ativa.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Referrer Ranking */}
        <section className="modern-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Top Indicadores</h2>
            <div className="px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-none">Investimento em ROI</p>
              <p className="text-lg font-black text-indigo-600 leading-none mt-1">{formatCurrency(totalReferralDiscounts)}</p>
            </div>
          </div>
          <div className="space-y-4">
            {referrerRanking.map((item, index) => (
              <div key={item.customer?.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-transparent hover:border-slate-100 transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                  index === 0 ? 'bg-amber-100 text-amber-600' : 
                  index === 1 ? 'bg-slate-200 text-slate-600' : 
                  index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  {index === 0 ? <Award className="h-5 w-5" /> : index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">{item.customer?.name}</p>
                  <p className="text-xs font-medium text-slate-400">{item.count} indicações ativas</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-indigo-600">-{formatCurrency(item.discount)}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Desconto Mensal</p>
                </div>
              </div>
            ))}
            {referrerRanking.length === 0 && (
              <div className="py-12 text-center text-slate-400 italic flex flex-col items-center gap-3">
                <Target className="h-12 w-12 opacity-20" />
                <p className="text-sm">Nenhuma indicação registrada.</p>
              </div>
            )}
          </div>
        </section>

        {/* Debtors List */}
        <section className="modern-card p-8 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Inadimplência</h2>
            <div className="px-4 py-2 rounded-2xl bg-rose-50 border border-rose-100">
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest leading-none">Total em Aberto</p>
              <p className="text-lg font-black text-rose-600 leading-none mt-1">{formatCurrency(totalDebt)}</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[20rem] pr-2 custom-scrollbar">
            <ul role="list" className="space-y-4">
              {debtors.map((debtor) => (
                <li key={debtor.payment.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex flex-col">
                    <p className="text-sm font-bold text-slate-900">{debtor.customer.name}</p>
                    <p className="text-xs font-medium text-slate-400">{debtor.customer.phone}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-black text-rose-600">
                        {formatCurrency(debtor.payment.amount - debtor.payment.paidAmount)}
                      </p>
                      {debtor.payment.paidAmount > 0 && (
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Parcial: {formatCurrency(debtor.payment.paidAmount)}
                        </p>
                      )}
                    </div>
                    <a
                      href={generateWhatsAppLink(debtor.customer.phone, `Olá ${debtor.customer.name}, verificamos que há uma fatura em aberto no valor de ${formatCurrency(debtor.payment.amount - debtor.payment.paidAmount)}. Gostaria de regularizar?`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all active:scale-95"
                      title="Cobrar via WhatsApp"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </a>
                  </div>
                </li>
              ))}
              {debtors.length === 0 && (
                <li className="py-12 text-center text-sm text-slate-400 italic flex flex-col items-center gap-3">
                  <CheckCircle className="h-12 w-12 text-emerald-100" />
                  Nenhum cliente inadimplente.
                </li>
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
