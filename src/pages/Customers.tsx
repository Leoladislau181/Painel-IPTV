import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Search, Edit2, Trash2, X, MessageCircle, Smartphone, StickyNote, CheckSquare, Square } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { generateWhatsAppLink, cn } from '../lib/utils';

export function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, settings } = useAppContext();
  const [isAdding, setIsAdding] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    referredById: '',
    notes: '',
    deviceInfo: {
      appUsed: '',
      deviceCount: 1,
      macAddress: ''
    }
  });

  // Helper to format messages with variables
  const formatMsg = (template: string, data: Record<string, string>) => {
    let msg = template;
    Object.entries(data).forEach(([key, value]) => {
      msg = msg.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    return msg;
  };

  const handleOpenAdd = () => {
    setEditingCustomerId(null);
    setFormData({ 
      name: '', 
      phone: '', 
      email: '', 
      referredById: '',
      notes: '',
      deviceInfo: {
        appUsed: '',
        deviceCount: 1,
        macAddress: ''
      }
    });
    setIsAdding(true);
  };

  const handleOpenEdit = (customer: any) => {
    setEditingCustomerId(customer.id);
    setFormData({ 
      name: customer.name, 
      phone: customer.phone, 
      email: customer.email || '',
      referredById: customer.referredById || '',
      notes: customer.notes || '',
      deviceInfo: {
        appUsed: customer.deviceInfo?.appUsed || '',
        deviceCount: customer.deviceInfo?.deviceCount || 1,
        macAddress: customer.deviceInfo?.macAddress || ''
      }
    });
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomerId) {
      updateCustomer(editingCustomerId, formData);
    } else {
      addCustomer(formData);
    }
    setIsAdding(false);
  };

  const handleDeleteConfirm = () => {
    if (customerToDelete) {
      deleteCustomer(customerToDelete);
      setCustomerToDelete(null);
    }
  };

  const toggleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
  };

  const toggleSelectCustomer = (id: string) => {
    if (selectedCustomers.includes(id)) {
      setSelectedCustomers(selectedCustomers.filter(cid => cid !== id));
    } else {
      setSelectedCustomers([...selectedCustomers, id]);
    }
  };

  const handleBulkWhatsApp = () => {
    const selectedData = customers.filter(c => selectedCustomers.includes(c.id));
    if (selectedData.length === 0) return;
    
    // For bulk actions in a browser without a real API, we can only open them one by one
    // or just inform the user. A real implementation would use an API.
    alert(`Preparando para enviar mensagens para ${selectedData.length} clientes. Devido a limitações do navegador, as janelas serão abertas sequencialmente.`);
    
    selectedData.forEach((c, index) => {
      setTimeout(() => {
        const link = generateWhatsAppLink(c.phone, formatMsg(settings.welcomeMessage, {
          nome: c.name,
          painel: settings.panelName
        }));
        window.open(link, '_blank');
      }, index * 1000);
    });
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-10">
      <header className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Clientes</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Gerencie o cadastro dos seus clientes e acompanhe as indicações.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </button>
        </div>
      </header>

      {/* Bulk Actions Toolbar */}
      {selectedCustomers.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4">
          <span className="text-sm font-bold">{selectedCustomers.length} selecionados</span>
          <div className="h-6 w-px bg-slate-800" />
          <button 
            onClick={handleBulkWhatsApp}
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-bold transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Enviar WhatsApp
          </button>
          <button 
            onClick={() => setSelectedCustomers([])}
            className="text-slate-400 hover:text-white text-sm font-bold transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl max-w-sm w-full border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 rounded-full bg-rose-50 dark:bg-rose-500/10 mb-4">
                <Trash2 className="h-8 w-8 text-rose-600 dark:text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Excluir Cliente</h3>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita e removerá todo o histórico associado.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={handleDeleteConfirm}
                className="btn-primary bg-rose-600 hover:bg-rose-700 w-full py-4 border-none"
              >
                Sim, Excluir
              </button>
              <button
                onClick={() => setCustomerToDelete(null)}
                className="btn-secondary w-full py-4"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <section className="modern-card p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {editingCustomerId ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
            </h3>
            <button onClick={() => setIsAdding(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nome Completo</label>
                <input
                  type="text"
                  required
                  className="input-modern"
                  placeholder="Ex: João Silva"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">WhatsApp</label>
                <input
                  type="text"
                  required
                  className="input-modern"
                  placeholder="Ex: 11999999999"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email (Opcional)</label>
                <input
                  type="email"
                  className="input-modern"
                  placeholder="Ex: joao@email.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Indicado por</label>
                <select
                  className="input-modern"
                  value={formData.referredById}
                  onChange={e => setFormData({...formData, referredById: e.target.value})}
                >
                  <option value="">Ninguém</option>
                  {customers.filter(c => c.id !== editingCustomerId).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">App Utilizado</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    className="input-modern pl-12"
                    placeholder="Ex: IPTV Smarters"
                    value={formData.deviceInfo.appUsed}
                    onChange={e => setFormData({...formData, deviceInfo: {...formData.deviceInfo, appUsed: e.target.value}})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Qtd. Dispositivos</label>
                <input
                  type="number"
                  min="1"
                  className="input-modern"
                  value={formData.deviceInfo.deviceCount}
                  onChange={e => setFormData({...formData, deviceInfo: {...formData.deviceInfo, deviceCount: Number(e.target.value)}})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">MAC Address (Opcional)</label>
                <input
                  type="text"
                  className="input-modern"
                  placeholder="Ex: 00:00:00:00:00:00"
                  value={formData.deviceInfo.macAddress}
                  onChange={e => setFormData({...formData, deviceInfo: {...formData.deviceInfo, macAddress: e.target.value}})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Observações / Notas</label>
              <div className="relative">
                <StickyNote className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                <textarea
                  className="input-modern pl-12 min-h-[100px] py-4"
                  placeholder="Notas internas sobre o cliente..."
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="btn-secondary px-8"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary px-12"
              >
                Salvar Cliente
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="input-modern pl-12"
              placeholder="Buscar por nome ou WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="modern-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
              <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                <tr>
                  <th scope="col" className="py-4 pl-6 pr-3 text-left">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-indigo-600 transition-colors">
                      {selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0 ? (
                        <CheckSquare className="h-5 w-5 text-indigo-600" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                  </th>
                  <th scope="col" className="py-4 px-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Nome</th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">WhatsApp</th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Dispositivos</th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Indicado por</th>
                  <th scope="col" className="relative py-4 pl-3 pr-6">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className={cn(
                    "hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors",
                    selectedCustomers.includes(customer.id) && "bg-indigo-50/30 dark:bg-indigo-500/5"
                  )}>
                    <td className="py-5 pl-6 pr-3">
                      <button onClick={() => toggleSelectCustomer(customer.id)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                        {selectedCustomers.includes(customer.id) ? (
                          <CheckSquare className="h-5 w-5 text-indigo-600" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    <td className="whitespace-nowrap py-5 px-3">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{customer.name}</p>
                      {customer.notes && (
                        <p className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">{customer.notes}</p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500 dark:text-slate-400">{customer.phone}</td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
                          {customer.deviceInfo?.deviceCount || 1} Telas
                        </span>
                        {customer.deviceInfo?.appUsed && (
                          <span className="text-[10px] text-slate-400 font-medium">{customer.deviceInfo.appUsed}</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500">
                      {customer.referredById ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400">
                          {customers.find(c => c.id === customer.referredById)?.name}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700">-</span>
                      )}
                    </td>
                    <td className="relative whitespace-nowrap py-5 pl-3 pr-6 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <a
                          href={generateWhatsAppLink(customer.phone, formatMsg(settings.welcomeMessage, {
                            nome: customer.name,
                            painel: settings.panelName
                          }))}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-all"
                          title="Enviar Boas-vindas"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>
                        <button 
                          onClick={() => handleOpenEdit(customer)} 
                          className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all" 
                          title="Editar cliente"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => setCustomerToDelete(customer.id)} 
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all" 
                          title="Excluir cliente"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-slate-400 italic">Nenhum cliente encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
