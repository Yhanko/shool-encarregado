import { useState } from 'react';
import { Sidebar } from '@/layout/Sidebar';
import { Header } from '@/layout/Header';
import { Outlet, useLocation } from 'react-router-dom';
import { ParentProvider } from '@/contexts/ParentContext';

export function Layout() {
  const location = useLocation();
  const activeTab = location.pathname.split('/')[1] || 'dashboard';

  return (
    <ParentProvider>
      <div className="flex h-screen w-screen bg-gray-50">
        <Sidebar activeTab={activeTab} onTabChange={() => {}} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </ParentProvider>
  );
}