import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from "react-router-dom";

import {
  Home,
  CreditCard,
  GraduationCap,
  MessageCircle,
  Bell,
  Calendar,
  BarChart3,
  Bot,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from '../lib/icons';
import { useAuthStore } from '@/store/authStore';
import { useParent } from '@/contexts/ParentContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const { notificacoes, pagamentos, mensagensNaoLidas } = useParent();

  const unreadNotificationsCount = notificacoes?.filter(n => !n.lida).length || 0;
  const pendingPaymentsCount = pagamentos?.filter(p => p.status === 'pendente' || p.status === 'atrasado').length || 0;
  const unreadChatSendersCount = new Set(mensagensNaoLidas?.map(m => m.senderId)).size || 0;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'pagamentos', label: 'Pagamentos', icon: CreditCard, badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : undefined },
    { id: 'notasepauta', label: 'Notas & Pauta', icon: GraduationCap },
    { id: 'desempenho', label: 'Desempenho', icon: BarChart3 },
    { id: 'chat', label: 'Mensagens', icon: MessageCircle, badge: unreadChatSendersCount > 0 ? unreadChatSendersCount : undefined },
    { id: 'notificacoes', label: 'Notificações', icon: Bell, badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined },
    { id: 'atividades', label: 'Atividades', icon: Calendar },
    { id: 'assistente', label: 'Assistente IA', icon: Bot },
    { id: 'perfil', label: 'Perfil', icon: User }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-background border-r border-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Portal do Encarregado</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex h-8 w-8 p-0 bg-background text-foreground hover:bg-accent hover:text-accent-foreground border border-border"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <nav className={cn("p-2", collapsed && "px-1")}>
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full mb-1 h-10 flex justify-start transition-all",
                collapsed && "px-2 justify-center",
                activeTab === item.id 
                  ? "bg-primary/10 text-primary font-medium hover:bg-primary/20 hover:text-primary" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={
                () => {
                  onTabChange(item.id);
                  navigate("/" + item.id)
                }
              }
            >
              <div className={cn("relative flex items-center justify-center", !collapsed && "mr-3")}>
                <item.icon className="relative h-4 w-4 z-10" />
              </div>
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge variant="destructive" className="rounded-full">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          ))}
        </nav>
      </ScrollArea>

      {/* Logout Button at the bottom */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className={cn(
            "w-full flex items-center text-destructive hover:text-destructive hover:bg-destructive/10",
            collapsed ? "justify-center px-0" : "justify-start"
          )}
          onClick={handleLogout}
        >
          <LogOut className={cn("h-5 w-5", !collapsed && "mr-3")} />
          {!collapsed && <span>Sair</span>}
        </Button>
      </div>
    </div>
  );
}