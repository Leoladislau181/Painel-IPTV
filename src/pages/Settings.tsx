import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  Plus, Edit2, Trash2, X, Package, MessageCircle, Globe, ExternalLink, 
  Settings as SettingsIcon, MessageSquare, Users, Database, Save, Download,
  Palette, Bell, Shield, Key
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';

export function Settings() {
  const { 
    plans, addPlan, updatePlan, deletePlan, 
    suppliers, addSupplier, updateSupplier, deleteSupplier,
    settings, updateSettings, exportData
  } = useAppContext();
  
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const activeTab = tab || 'general';
  
  // Plans State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planFormData, setPlanFormData] = useState({ name: '', price: 0, durationMonths: 1, credits: 1 });
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  // Suppliers State
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [supplierFormData, setSupplierFormData] = useState({ name: '', whatsapp: '', website: '' });
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);

  // Settings Forms State
  const [generalForm, setGeneralForm] = useState({ ...settings });
  const [messagesForm, setMessagesForm] = useState({ ...settings });
  const [referralForm, setReferralForm] = useState({ ...settings });

  // Update forms when settings change (e.g. initial load)
  useEffect(() => {
    setGeneralForm({ ...settings });
    setMessagesForm({ ...settings });
    setReferralForm({ ...settings });
  }, [settings]);

  const handleOpenAddPlanModal = () => {
    setEditingPlanId(null);
    setPlanFormData({ name: '', price: 35, durationMonths: 1, credits: 1 });
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlanModal = (plan: any) => {
    setEditingPlanId(plan.id);
    setPlanFormData({ name: plan.name, price: plan.price, durationMonths: plan.durationMonths, credits: plan.credits });
    setIsPlanModalOpen(true);
  };

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlanId) {
      updatePlan(editingPlanId, planFormData);
    } else {
      addPlan(planFormData);
    }
    setIsPlanModalOpen(false);
  };

  const handlePlanDeleteConfirm = () => {
    if (planToDelete) {
      deletePlan(planToDelete);
      setPlanToDelete(null);
    }
  };

  // Supplier Handlers
  const handleOpenAddSupplierModal = () => {
    setEditingSupplierId(null);
    setSupplierFormData({ name: '', whatsapp: '', website: '' });
    setIsSupplierModalOpen(true);
  };

  const handleOpenEditSupplierModal = (supplier: any) => {
    setEditingSupplierId(supplier.id);
    setSupplierFormData({ name: supplier.name, whatsapp: supplier.whatsapp, website: supplier.website || '' });
    setIsSupplierModalOpen(true);
  };

  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSupplierId) {
      updateSupplier(editingSupplierId, supplierFormData);
    } else {
      addSupplier(supplierFormData);
    }
    setIsSupplierModalOpen(false);
  };

  const handleSupplierDeleteConfirm = () => {
    if (supplierToDelete) {
      deleteSupplier(supplierToDelete);
      setSupplierToDelete(null);
    }
  };

  const handleWhatsAppContact = (phone: string) => {
    const message = encodeURIComponent('Preciso de mais créditos.');
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(generalForm);
    alert('Configurações gerais salvas com sucesso!');
  };

  const handleMessagesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(messagesForm);
    alert('Modelos de mensagens salvos com sucesso!');
  };

  const handleReferralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(referralForm);
    alert('Regras de indicação salvas com sucesso!');
  };

  const getTitle = () => {
    switch(activeTab) {
      case 'plans': return 'Planos de Assinatura';
      case 'suppliers': return 'Fornecedores';
      case 'general': return 'Configurações Gerais';
      case 'messages': return 'Modelos de Mensagens';
      case 'referral': return 'Regras de Indicação';
      case 'backup': return 'Backup e Segurança';
      default: return 'Configurações';
    }
  };

  return (
    <div className="space-y-10">
      <header className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{getTitle()}</h1>
          <p className="mt-2 text-slate-500">
            Gerencie as preferências e dados do seu painel.
          </p>
        </div>
      </header>

      {activeTab === 'plans' && (
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Planos de Assinatura</h2>
            <button
              type="button"
              onClick={handleOpenAddPlanModal}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </button>
          </div>

          {/* Delete Confirmation Modal */}
          {planToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
              <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full border border-slate-100">
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-rose-50 mb-4">
                    <Trash2 className="h-8 w-8 text-rose-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Excluir Plano</h3>
                  <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                    Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.
                  </p>
                </div>
                <div className="mt-8 flex flex-col gap-3">
                  <button
                    onClick={handlePlanDeleteConfirm}
                    className="btn-primary bg-rose-600 hover:bg-rose-700 w-full py-4"
                  >
                    Sim, Excluir
                  </button>
                  <button
                    onClick={() => setPlanToDelete(null)}
                    className="btn-secondary w-full py-4"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add/Edit Plan Modal */}
          {isPlanModalOpen && (
            <section className="modern-card p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  {editingPlanId ? 'Editar Plano' : 'Novo Plano'}
                </h3>
                <button onClick={() => setIsPlanModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handlePlanSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nome do Plano</label>
                  <input
                    type="text"
                    required
                    className="input-modern"
                    placeholder="Ex: Plano Mensal"
                    value={planFormData.name}
                    onChange={e => setPlanFormData({...planFormData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Preço de Venda (R$)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="input-modern"
                    value={planFormData.price}
                    onChange={e => setPlanFormData({...planFormData, price: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Duração (Meses)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="input-modern"
                    value={planFormData.durationMonths}
                    onChange={e => setPlanFormData({...planFormData, durationMonths: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Custo (Créditos)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="input-modern"
                    value={planFormData.credits}
                    onChange={e => setPlanFormData({...planFormData, credits: Number(e.target.value)})}
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsPlanModalOpen(false)}
                    className="btn-secondary px-8"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-12"
                  >
                    Salvar Plano
                  </button>
                </div>
              </form>
            </section>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.id} className="modern-card p-8 group hover:shadow-xl transition-all duration-300 border-transparent hover:border-indigo-100">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Package className="h-6 w-6" />
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleOpenEditPlanModal(plan)} 
                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all" 
                      title="Editar plano"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setPlanToDelete(plan.id)} 
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all" 
                      title="Excluir plano"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h2>
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                    {plan.durationMonths} {plan.durationMonths === 1 ? 'mês' : 'meses'}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                    {plan.credits} {plan.credits === 1 ? 'crédito' : 'créditos'}
                  </span>
                </div>
                
                <div className="pt-6 border-t border-slate-50">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">{formatCurrency(plan.price)}</span>
                    <span className="text-xs text-slate-400 font-medium">/ assinatura</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'suppliers' && (
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Fornecedores</h2>
            <button
              type="button"
              onClick={handleOpenAddSupplierModal}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Fornecedor
            </button>
          </div>

          {/* Delete Confirmation Modal */}
          {supplierToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
              <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full border border-slate-100">
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-rose-50 mb-4">
                    <Trash2 className="h-8 w-8 text-rose-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Excluir Fornecedor</h3>
                  <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                    Tem certeza que deseja excluir este fornecedor? Esta ação não pode ser desfeita.
                  </p>
                </div>
                <div className="mt-8 flex flex-col gap-3">
                  <button
                    onClick={handleSupplierDeleteConfirm}
                    className="btn-primary bg-rose-600 hover:bg-rose-700 w-full py-4"
                  >
                    Sim, Excluir
                  </button>
                  <button
                    onClick={() => setSupplierToDelete(null)}
                    className="btn-secondary w-full py-4"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add/Edit Supplier Modal */}
          {isSupplierModalOpen && (
            <section className="modern-card p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  {editingSupplierId ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                </h3>
                <button onClick={() => setIsSupplierModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSupplierSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nome do Fornecedor</label>
                  <input
                    type="text"
                    required
                    className="input-modern"
                    placeholder="Ex: Fornecedor Master"
                    value={supplierFormData.name}
                    onChange={e => setSupplierFormData({...supplierFormData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">WhatsApp</label>
                  <input
                    type="text"
                    required
                    className="input-modern"
                    placeholder="Ex: 11999999999"
                    value={supplierFormData.whatsapp}
                    onChange={e => setSupplierFormData({...supplierFormData, whatsapp: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Site (Opcional)</label>
                  <input
                    type="url"
                    className="input-modern"
                    placeholder="Ex: https://site.com"
                    value={supplierFormData.website}
                    onChange={e => setSupplierFormData({...supplierFormData, website: e.target.value})}
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsSupplierModalOpen(false)}
                    className="btn-secondary px-8"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-12"
                  >
                    Salvar Fornecedor
                  </button>
                </div>
              </form>
            </section>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="modern-card p-8 group hover:shadow-xl transition-all duration-300 border-transparent hover:border-indigo-100">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleOpenEditSupplierModal(supplier)} 
                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all" 
                      title="Editar fornecedor"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setSupplierToDelete(supplier.id)} 
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all" 
                      title="Excluir fornecedor"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-slate-900 mb-1">{supplier.name}</h2>
                <p className="text-sm text-slate-500 mb-6">{supplier.whatsapp}</p>
                
                <div className="space-y-3 pt-6 border-t border-slate-50">
                  <button
                    onClick={() => handleWhatsAppContact(supplier.whatsapp)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-sm hover:shadow-md"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Pedir Créditos
                  </button>
                  
                  {supplier.website && (
                    <a
                      href={supplier.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 transition-all"
                    >
                      <Globe className="h-4 w-4" />
                      Visitar Site
                      <ExternalLink className="h-3 w-3 ml-auto opacity-40" />
                    </a>
                  )}
                </div>
              </div>
            ))}
            
            {suppliers.length === 0 && !isSupplierModalOpen && (
              <div className="sm:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-12 px-4 modern-card border-dashed border-2 border-slate-200 bg-transparent">
                <div className="p-4 rounded-full bg-slate-50 mb-4">
                  <Globe className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Nenhum fornecedor cadastrado</h3>
                <p className="text-sm text-slate-500 mt-1">Cadastre seus fornecedores para facilitar o contato.</p>
                <button
                  onClick={handleOpenAddSupplierModal}
                  className="mt-6 text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Cadastrar Primeiro Fornecedor
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === 'general' && (
        <section className="space-y-8">
          <div className="flex items-center gap-2">
            <Palette className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Configurações Gerais</h2>
          </div>
          <form onSubmit={handleGeneralSubmit} className="modern-card p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Perfil do Painel</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nome do Painel</label>
                  <input
                    type="text"
                    className="input-modern"
                    value={generalForm.panelName}
                    onChange={e => setGeneralForm({...generalForm, panelName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">URL da Logomarca</label>
                  <input
                    type="text"
                    className="input-modern"
                    placeholder="https://exemplo.com/logo.png"
                    value={generalForm.logoUrl}
                    onChange={e => setGeneralForm({...generalForm, logoUrl: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tema do Painel</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'light', name: 'Claro' },
                      { id: 'dark', name: 'Escuro' },
                      { id: 'system', name: 'Sistema' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setGeneralForm({...generalForm, theme: t.id as any})}
                        className={cn(
                          "py-3 px-4 rounded-xl text-xs font-bold border transition-all",
                          generalForm.theme === t.id 
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-300"
                        )}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Limites e Alertas</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Alerta de Estoque Crítico (Créditos)</label>
                  <input
                    type="number"
                    className="input-modern"
                    value={generalForm.criticalStockThreshold}
                    onChange={e => setGeneralForm({...generalForm, criticalStockThreshold: Number(e.target.value)})}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">O Dashboard mostrará um alerta quando o saldo for menor que este valor.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Dias para Lembrete de Vencimento</label>
                  <input
                    type="number"
                    className="input-modern"
                    value={generalForm.expirationReminderDays}
                    onChange={e => setGeneralForm({...generalForm, expirationReminderDays: Number(e.target.value)})}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Antecedência para listar clientes na aba "Vencendo em Breve".</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-6 border-t border-slate-50">
              <button type="submit" className="btn-primary px-12">
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </button>
            </div>
          </form>
        </section>
      )}

      {activeTab === 'messages' && (
        <section className="space-y-8">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Modelos de Mensagens</h2>
          </div>
          <form onSubmit={handleMessagesSubmit} className="modern-card p-8 space-y-8">
            <div className="grid grid-cols-1 gap-8">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Boas-vindas (Novo Cliente)</label>
                <textarea
                  className="input-modern min-h-[100px] py-3"
                  value={messagesForm.welcomeMessage}
                  onChange={e => setMessagesForm({...messagesForm, welcomeMessage: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Cobrança de Inadimplência</label>
                <textarea
                  className="input-modern min-h-[100px] py-3"
                  value={messagesForm.debtCollectionMessage}
                  onChange={e => setMessagesForm({...messagesForm, debtCollectionMessage: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Lembrete de Vencimento</label>
                <textarea
                  className="input-modern min-h-[100px] py-3"
                  value={messagesForm.expirationReminderMessage}
                  onChange={e => setMessagesForm({...messagesForm, expirationReminderMessage: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Confirmação de Pagamento</label>
                <textarea
                  className="input-modern min-h-[100px] py-3"
                  value={messagesForm.paymentConfirmationMessage}
                  onChange={e => setMessagesForm({...messagesForm, paymentConfirmationMessage: e.target.value})}
                />
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Variáveis Disponíveis:</p>
              <div className="flex flex-wrap gap-2">
                {['{nome}', '{painel}', '{valor}', '{data}'].map(tag => (
                  <span key={tag} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-mono text-indigo-600">{tag}</span>
                ))}
              </div>
            </div>
            <div className="flex justify-end pt-6 border-t border-slate-50">
              <button type="submit" className="btn-primary px-12">
                <Save className="h-4 w-4 mr-2" />
                Salvar Modelos
              </button>
            </div>
          </form>
        </section>
      )}

      {activeTab === 'referral' && (
        <section className="space-y-8">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Regras de Indicação</h2>
          </div>
          <form onSubmit={handleReferralSubmit} className="modern-card p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Desconto por Indicação Ativa (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-modern"
                  value={referralForm.referralDiscount}
                  onChange={e => setReferralForm({...referralForm, referralDiscount: Number(e.target.value)})}
                />
                <p className="text-[10px] text-slate-400 mt-1">Valor fixo descontado da mensalidade do indicador para cada amigo ativo.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Limite Máximo de Desconto (%)</label>
                <input
                  type="number"
                  max="100"
                  min="0"
                  className="input-modern"
                  value={referralForm.referralMaxDiscountPercent}
                  onChange={e => setReferralForm({...referralForm, referralMaxDiscountPercent: Number(e.target.value)})}
                />
                <p className="text-[10px] text-slate-400 mt-1">O desconto total não pode ultrapassar esta porcentagem do valor do plano.</p>
              </div>
            </div>
            <div className="flex justify-end pt-6 border-t border-slate-50">
              <button type="submit" className="btn-primary px-12">
                <Save className="h-4 w-4 mr-2" />
                Salvar Regras
              </button>
            </div>
          </form>
        </section>
      )}

      {activeTab === 'backup' && (
        <section className="space-y-8">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Backup e Segurança</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="modern-card p-8 space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Exportar Dados</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Baixe uma cópia completa de todos os seus dados (clientes, pagamentos, configurações) para segurança ou uso em planilhas.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => exportData('json')}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white text-indigo-600 shadow-sm">
                      <Download className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Backup Completo (JSON)</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </button>
                <button 
                  onClick={() => exportData('csv')}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white text-emerald-600 shadow-sm">
                      <Download className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Lista de Clientes (CSV)</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                </button>
              </div>
            </div>

            <div className="modern-card p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-6 w-6 text-rose-600" />
                <h3 className="text-lg font-bold text-slate-900">Segurança</h3>
              </div>
              <div className="space-y-4">
                <button className="w-full flex items-center gap-3 p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group text-left">
                  <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Key className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Alterar Senha de Acesso</p>
                    <p className="text-[10px] text-slate-400 font-medium">Atualize suas credenciais de segurança.</p>
                  </div>
                </button>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Últimos Acessos</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-medium">
                      <span className="text-slate-600">Hoje, 12:45</span>
                      <span className="text-slate-400">IP: 189.12.XX.XX</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-medium">
                      <span className="text-slate-600">Ontem, 20:12</span>
                      <span className="text-slate-400">IP: 189.12.XX.XX</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
