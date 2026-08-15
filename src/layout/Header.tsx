import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Menu, Bell, User, LogOut, Settings } from '../lib/icons';
import { useAuthStore } from '@/store/authStore';
import { useParent } from '@/contexts/ParentContext';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuthStore();
  const { notificacoes } = useParent();

  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida).length;

  const nomeAbreviado = user?.name ? user.name.split(' ')[0] : 'Usuário';

  return (
    <header className="bg-background border-b border-border px-4 md:px-6 py-4 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <Button variant="outline" size="icon" className="lg:hidden" onClick={onMenuClick}>
              <Menu className="h-6 w-6" />
            </Button>
          )}
          <div>
            <h2 className="text-xl lg:text-2xl font-semibold text-foreground">
              Bem-vindo, {nomeAbreviado}!
            </h2>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative text-foreground hover:text-primary">
            <Bell className="h-5 w-5" />
            {notificacoesNaoLidas > 0 && (
              <Badge variant="destructive" className="absolute left-6 top-1 h-4 w-4 p-0 text-[10px] rounded-full flex items-center justify-center">
                {notificacoesNaoLidas}
              </Badge>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-border hover:bg-accent">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                    {user?.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || 'Usuário'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'Sem email'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Encarregado de Educação
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}