import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CreditCard, Package, BarChart3, Settings, 
  Menu, X, ChevronDown, ChevronRight, MessageSquare, Globe, Database, 
  Settings as SettingsIcon, LogOut, Moon, Sun, Monitor
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clientes', href: '/customers', icon: Users },
  { name: 'Assinaturas', href: '/subscriptions', icon: CreditCard },
  { name: 'Estoque (Créditos)', href: '/inventory', icon: Package },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
];

const settingsSubItems = [
  { name: 'Geral', href: '/settings/general', icon: SettingsIcon },
  { name: 'Planos', href: '/settings/plans', icon: Package },
  { name: 'Fornecedores', href: '/settings/suppliers', icon: Globe },
  { name: 'Mensagens', href: '/settings/messages', icon: MessageSquare },
  { name: 'Indicações', href: '/settings/referral', icon: Users },
  { name: 'Backup', href: '/settings/backup', icon: Database },
];

export function Sidebar() {
  const { creditsAvailable, settings, updateSettings } = useAppContext();
  const { logout, user } = useAuth();
  const location = useLocation();
  const isSettingsActive = location.pathname.startsWith('/settings');
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(isSettingsActive);

  const toggleTheme = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(settings.theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    updateSettings({ ...settings, theme: themes[nextIndex] });
  };

  const getThemeIcon = () => {
    switch (settings.theme) {
      case 'light': return <Sun className="h-4 w-4" />;
      case 'dark': return <Moon className="h-4 w-4" />;
      case 'system': return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex h-full flex-col gap-y-6 overflow-y-auto bg-slate-950 px-6 pb-6 border-r border-slate-800">
      <div className="flex h-20 shrink-0 items-center">
        <div className="flex items-center gap-3">
          {settings.logoUrl ? (
            <img 
              src={settings.logoUrl} 
              alt={settings.panelName} 
              className="h-8 w-8 rounded-xl object-cover" 
              referrerPolicy="no-referrer" 
            />
          ) : (
            <div className="h-8 w-8 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
          )}
          <span className="text-xl font-bold text-white tracking-tight">{settings.panelName}</span>
        </div>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-8">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        isActive
                          ? 'bg-white/10 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-white/5',
                        'group flex gap-x-3 rounded-2xl p-3 text-sm leading-6 font-medium transition-all duration-200'
                      )
                    }
                  >
                    <item.icon className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      "group-hover:text-white"
                    )} aria-hidden="true" />
                    {item.name}
                  </NavLink>
                </li>
              ))}
              
              {/* Settings Item with Sub-items */}
              <li>
                <button
                  onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
                  className={cn(
                    isSettingsActive
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5',
                    'w-full group flex items-center gap-x-3 rounded-2xl p-3 text-sm leading-6 font-medium transition-all duration-200'
                  )}
                >
                  <Settings className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    "group-hover:text-white"
                  )} aria-hidden="true" />
                  <span className="flex-1 text-left">Configurações</span>
                  {isSettingsExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                {isSettingsExpanded && (
                  <ul className="mt-1 ml-4 space-y-1 border-l border-slate-800">
                    {settingsSubItems.map((subItem) => (
                      <li key={subItem.name}>
                        <NavLink
                          to={subItem.href}
                          className={({ isActive }) =>
                            cn(
                              isActive
                                ? 'text-white bg-white/5'
                                : 'text-slate-500 hover:text-white hover:bg-white/5',
                              'group flex gap-x-3 rounded-xl p-2.5 ml-4 text-xs font-medium transition-all duration-200'
                            )
                          }
                        >
                          <subItem.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                          {subItem.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            </ul>
          </li>
          
          <li className="mt-auto space-y-4">
            {/* Theme Toggle & User Info */}
            <div className="flex items-center justify-between px-2">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white transition-all"
                title={`Tema: ${settings.theme}`}
              >
                {getThemeIcon()}
              </button>
              
              <button 
                onClick={logout}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-rose-500 transition-all"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            <div className="px-2 py-3 rounded-2xl bg-slate-900/50 border border-slate-800">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Usuário</p>
              <p className="text-xs font-bold text-white truncate ml-1">{user?.email}</p>
            </div>

            <div className="rounded-3xl bg-indigo-600 p-5 shadow-lg shadow-indigo-600/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <Package className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">Estoque</span>
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-bold text-white">{creditsAvailable}</p>
                <span className="text-xs text-indigo-200 font-medium">créditos</span>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );
}
