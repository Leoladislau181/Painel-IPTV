import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 flex md:hidden ${sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div 
          className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setSidebarOpen(false)}
        />
        <div className={`relative flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
            <button type="button" className="p-2.5 rounded-full bg-white/10 text-white" onClick={() => setSidebarOpen(false)}>
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <Sidebar />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-80 md:flex-col">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:gap-x-6 sm:px-6 lg:px-8 md:hidden">
          <button type="button" className="-m-2.5 p-2.5 text-slate-700 dark:text-slate-300 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Painel Revendedor</span>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="py-8 lg:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
