import { useState } from 'react';
import { Sidebar } from '@/layout/Sidebar';
import { Header } from '@/layout/Header';
import { Outlet, useLocation } from 'react-router-dom';
import { ParentProvider } from '@/contexts/ParentContext';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export function Layout() {
  const location = useLocation();
  const activeTab = location.pathname.split('/')[1] || 'dashboard';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <ParentProvider>
      <div className="flex h-screen w-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex h-full">
          <Sidebar activeTab={activeTab} onTabChange={() => { }} />
        </div>

        {/* Mobile Sidebar via Sheet */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar activeTab={activeTab} onTabChange={() => setIsMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </ParentProvider>
  );
}