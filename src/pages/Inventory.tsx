import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Package, Plus, Edit2, X, Trash2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { format, parseISO } from 'date-fns';

export function Inventory() {
  const { packages, buyCredits, creditsAvailable, transactions, addPackage, updatePackage, deletePackage } = useAppContext();
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [packageFormData, setPackageFormData] = useState({ name: '', credits: 0, price: 0 });
  const [packageToDelete, setPackageToDelete] = useState<string | null>(null);

  const handleOpenAddModal = () => {
    setEditingPackageId(null);
    setPackageFormData({ name: '', credits: 10, price: 50 });
    setIsPackageModalOpen(true);
  };

  const handleOpenEditModal = (pkg: any) => {
    setEditingPackageId(pkg.id);
    setPackageFormData({ name: pkg.name, credits: pkg.credits, price: pkg.price });
    setIsPackageModalOpen(true);
  };

  const handlePackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPackageId) {
      updatePackage(editingPackageId, packageFormData);
    } else {
      addPackage(packageFormData);
    }
    setIsPackageModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (packageToDelete) {
      deletePackage(packageToDelete);
      setPackageToDelete(null);
    }
  };

  const sortedPackages = [...packages].sort((a, b) => a.price - b.price);

  return (
    <div className="space-y-10">
      <header className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Estoque de Créditos</h1>
          <p className="mt-2 text-slate-500">
            Gerencie seus pacotes e acompanhe o saldo de créditos.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex items-center gap-4">
          <div className="px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-3">
            <Package className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-none">Saldo Atual</p>
              <p className="text-lg font-black text-indigo-700 leading-none mt-1">{creditsAvailable}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Pacote
          </button>
        </div>
      </header>

      {/* Delete Confirmation Modal */}
      {packageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full border border-slate-100">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 rounded-full bg-rose-50 mb-4">
                <Trash2 className="h-8 w-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Excluir Pacote</h3>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                Tem certeza que deseja excluir este pacote? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={handleDeleteConfirm}
                className="btn-primary bg-rose-600 hover:bg-rose-700 w-full py-4"
              >
                Sim, Excluir
              </button>
              <button
                onClick={() => setPackageToDelete(null)}
                className="btn-secondary w-full py-4"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Package Modal */}
      {isPackageModalOpen && (
        <section className="modern-card p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {editingPackageId ? 'Editar Pacote' : 'Novo Pacote'}
            </h3>
            <button onClick={() => setIsPackageModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handlePackageSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 items-end">
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nome do Pacote</label>
              <input
                type="text"
                required
                className="input-modern"
                placeholder="Ex: Pacote Premium 50"
                value={packageFormData.name}
                onChange={e => setPackageFormData({...packageFormData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Créditos</label>
              <input
                type="number"
                required
                min="1"
                className="input-modern"
                value={packageFormData.credits}
                onChange={e => setPackageFormData({...packageFormData, credits: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Preço de Custo (R$)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="input-modern"
                value={packageFormData.price}
                onChange={e => setPackageFormData({...packageFormData, price: Number(e.target.value)})}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setIsPackageModalOpen(false)}
                className="btn-secondary px-8"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary px-12"
              >
                Salvar Pacote
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sortedPackages.map((pkg) => (
          <div key={pkg.id} className="modern-card p-8 flex flex-col group hover:shadow-xl transition-all duration-300 border-transparent hover:border-indigo-100">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Package className="h-6 w-6" />
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleOpenEditModal(pkg)} 
                  className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all" 
                  title="Editar pacote"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setPackageToDelete(pkg.id)} 
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all" 
                  title="Excluir pacote"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 mb-1">{pkg.name}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
              {pkg.credits} Créditos
            </p>
            
            <div className="mt-auto pt-6 border-t border-slate-50">
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-black text-slate-900">{formatCurrency(pkg.price)}</span>
                <span className="text-xs text-slate-400 font-medium">/ pacote</span>
              </div>
              
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">
                <span>Custo p/ crédito</span>
                <span className="text-emerald-600">{formatCurrency(pkg.price / pkg.credits)}</span>
              </div>

              <button
                onClick={() => buyCredits(pkg.id)}
                className="btn-primary w-full py-4 shadow-lg shadow-indigo-200"
              >
                Comprar Agora
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Histórico de Movimentações</h2>
        <div className="modern-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr>
                  <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Data</th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Tipo</th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Quantidade</th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Custo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.slice().reverse().map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="whitespace-nowrap py-5 pl-6 pr-3 text-sm text-slate-500 font-medium">{format(parseISO(tx.date), 'dd/MM/yyyy HH:mm')}</td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        tx.type === 'buy' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        {tx.type === 'buy' ? 'Compra' : 'Uso (Ativação)'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm font-black text-slate-900">
                      <span className={tx.type === 'buy' ? 'text-emerald-600' : 'text-rose-600'}>
                        {tx.type === 'buy' ? '+' : '-'}{tx.amount}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500 font-semibold">
                      {tx.cost ? formatCurrency(tx.cost) : <span className="text-slate-300">-</span>}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-sm text-slate-400 italic">Nenhuma movimentação registrada.</td>
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
