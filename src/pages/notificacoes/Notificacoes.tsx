import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  Calendar,
  DollarSign,
  GraduationCap,
  Users,
  Eye,
  Check,
  Filter,
  MessageCircle,
  AlertTriangle
} from '../../lib/icons';
import { useParent } from '@/contexts/ParentContext';
import { Notificacao } from '@/types';
import { toast } from 'sonner';

export function Notificacoes() {
  const { notificacoes, educandos, markAsRead, markAllAsRead } = useParent();
  const [notificacaoSelecionada, setNotificacaoSelecionada] = useState<Notificacao | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>('todas');
  const navigate = useNavigate();

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'pagamento': return DollarSign;
      case 'atividade': return Calendar;
      case 'nota': return GraduationCap;
      case 'reuniao': return Users;
      case 'mensagem': return MessageCircle;
      case 'falta': return AlertTriangle;
      default: return Bell;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'pagamento': return 'bg-red-100 text-red-600';
      case 'atividade': return 'bg-blue-100 text-blue-600';
      case 'nota': return 'bg-green-100 text-green-600';
      case 'reuniao': return 'bg-purple-100 text-purple-600';
      case 'mensagem': return 'bg-cyan-100 text-cyan-600';
      case 'falta': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'pagamento': return 'Pagamento';
      case 'atividade': return 'Atividade';
      case 'nota': return 'Nota';
      case 'reuniao': return 'Reunião';
      case 'mensagem': return 'Mensagem';
      case 'falta': return 'Falta';
      default: return 'Geral';
    }
  };

  const notificacoesFiltradas = filtroTipo === 'todas'
    ? notificacoes
    : notificacoes.filter(n => n.tipo === filtroTipo);

  const naoLidas = notificacoes.filter(n => !n.lida).length;
  const importantes = notificacoes.filter(n => n.importante).length;
  const notificacoesEsteMes = notificacoes.filter(n => {
    const d = new Date(n.data);
    const h = new Date();
    return d.getMonth() === h.getMonth() && d.getFullYear() === h.getFullYear();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Bell className="mr-3 h-8 w-8" />
            Notificações
          </h1>
          <p className="text-muted-foreground">
            Mantenha-se informado sobre a vida escolar dos seus educandos
          </p>
        </div>

        <div className="flex space-x-2">
          <Button size="sm" onClick={async () => {
            await markAllAsRead();
            toast.success('Todas as notificações marcadas como lidas');
          }}>
            <Eye className="mr-2 h-4 w-4" />
            Marcar todas como lidas
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info('Funcionalidade de filtros avançados em desenvolvimento.')}>
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{naoLidas}</div>
            <p className="text-xs text-muted-foreground">Requerem atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Importantes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{importantes}</div>
            <p className="text-xs text-muted-foreground">Alta prioridade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificacoesEsteMes.length}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="todas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todas" onClick={() => setFiltroTipo('todas')}>
            Todas ({notificacoes.length})
          </TabsTrigger>
          <TabsTrigger value="pagamento" onClick={() => setFiltroTipo('pagamento')}>
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="atividade" onClick={() => setFiltroTipo('atividade')}>
            Atividades
          </TabsTrigger>
          <TabsTrigger value="nota" onClick={() => setFiltroTipo('nota')}>
            Notas
          </TabsTrigger>
          <TabsTrigger value="mensagem" onClick={() => setFiltroTipo('mensagem')}>
            Mensagens
          </TabsTrigger>
          <TabsTrigger value="falta" onClick={() => setFiltroTipo('falta')}>
            Faltas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de Notificações */}
            <Card>
              <CardHeader>
                <CardTitle>Notificações Recentes</CardTitle>
                <CardDescription>Ordenadas por data de recebimento</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2 p-4">
                    {notificacoesFiltradas.map((notificacao) => {
                      const Icon = getTipoIcon(notificacao.tipo);
                      const educando = notificacao.educandoId ? educandos.find(e => e.id === notificacao.educandoId) : null;

                      return (
                        <div
                          key={notificacao.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${!notificacao.lida ? 'border-blue-200 bg-blue-50' : 'hover:bg-muted/50'
                            } ${notificacaoSelecionada?.id === notificacao.id ? 'ring-2 ring-blue-500' : ''
                            }`}
                          onClick={() => setNotificacaoSelecionada(notificacao)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full ${getTipoColor(notificacao.tipo)}`}>
                              <Icon className="h-4 w-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className={`font-medium ${!notificacao.lida ? 'text-blue-900' : ''}`}>
                                  {notificacao.titulo}
                                </h3>
                                <div className="flex items-center space-x-2">
                                  {notificacao.importante && (
                                    <Badge variant="destructive" className="text-xs">
                                      Importante
                                    </Badge>
                                  )}
                                  {!notificacao.lida && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                  )}
                                </div>
                              </div>

                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {notificacao.conteudo}
                              </p>

                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-xs">
                                    {getTipoLabel(notificacao.tipo)}
                                  </Badge>
                                  {educando && (
                                    <Badge variant="outline" className="text-xs">
                                      {educando.nome}
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(notificacao.data).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Detalhes da Notificação Selecionada */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes da Notificação</CardTitle>
                <CardDescription>
                  {notificacaoSelecionada ? 'Informações completas' : 'Selecione uma notificação'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notificacaoSelecionada ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-full ${getTipoColor(notificacaoSelecionada.tipo)}`}>
                        {(() => {
                          const Icon = getTipoIcon(notificacaoSelecionada.tipo);
                          return <Icon className="h-6 w-6" />;
                        })()}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">{notificacaoSelecionada.titulo}</h2>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">
                            {getTipoLabel(notificacaoSelecionada.tipo)}
                          </Badge>
                          {notificacaoSelecionada.importante && (
                            <Badge variant="destructive">Importante</Badge>
                          )}
                          {!notificacaoSelecionada.lida && (
                            <Badge variant="secondary">Não lida</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-medium mb-2">Conteúdo</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {notificacaoSelecionada.conteudo}
                      </p>
                    </div>

                    {notificacaoSelecionada.educandoId && (
                      <div>
                        <h3 className="font-medium mb-2">Educando</h3>
                        <p className="text-sm text-muted-foreground">
                          {educandos.find(e => e.id === notificacaoSelecionada.educandoId)?.nome}
                        </p>
                      </div>
                    )}

                    <div>
                      <h3 className="font-medium mb-2">Data de Recebimento</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(notificacaoSelecionada.data).toLocaleString('pt-BR')}
                      </p>
                    </div>

                    {notificacaoSelecionada.tipo === 'pagamento' && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <DollarSign className="h-5 w-5 text-red-600" />
                          <h3 className="font-medium text-red-800">Ação Necessária</h3>
                        </div>
                        <p className="text-sm text-red-700 mb-3">
                          Este pagamento requer sua atenção imediata.
                        </p>
                        <Button size="sm" onClick={() => navigate('/pagamentos')}>
                          <DollarSign className="mr-2 h-4 w-4" />
                          Ver Pagamentos
                        </Button>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-4">
                      {!notificacaoSelecionada.lida && (
                        <Button variant="outline" size="sm" onClick={async () => {
                          await markAsRead(notificacaoSelecionada.id);
                          setNotificacaoSelecionada({ ...notificacaoSelecionada, lida: true });
                          toast.success('Notificação marcada como lida');
                        }}>
                          <Check className="mr-2 h-4 w-4" />
                          Marcar como Lida
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Selecione uma notificação para ver os detalhes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conteúdo similar para outras abas */}
        <TabsContent value="pagamento">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Notificações de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificacoes
                  .filter(n => n.tipo === 'pagamento')
                  .map((notificacao) => {
                    const educando = notificacao.educandoId ? educandos.find(e => e.id === notificacao.educandoId) : null;

                    return (
                      <div key={notificacao.id} className="p-4 border rounded-lg bg-red-50">
                        <h3 className="font-medium">{notificacao.titulo}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notificacao.conteudo}
                        </p>
                        {educando && (
                          <Badge variant="outline" className="mt-2">
                            {educando.nome}
                          </Badge>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <Badge variant="outline">Pagamento</Badge>
                          <Button size="sm" onClick={() => navigate('/pagamentos')}>Ver Detalhes</Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="atividade">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Atividades Escolares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificacoes
                  .filter(n => n.tipo === 'atividade')
                  .map((notificacao) => {
                    const educando = notificacao.educandoId ? educandos.find(e => e.id === notificacao.educandoId) : null;

                    return (
                      <div key={notificacao.id} className="p-4 border rounded-lg">
                        <h3 className="font-medium">{notificacao.titulo}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notificacao.conteudo}
                        </p>
                        {educando && (
                          <Badge variant="outline" className="mt-2">
                            {educando.nome}
                          </Badge>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <Badge variant="outline">Atividade</Badge>
                          <Button size="sm" onClick={() => navigate('/atividades')}>Ver Detalhes</Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nota">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="mr-2 h-5 w-5" />
                Notificações de Notas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificacoes
                  .filter(n => n.tipo === 'nota')
                  .map((notificacao) => {
                    const educando = notificacao.educandoId ? educandos.find(e => e.id === notificacao.educandoId) : null;

                    return (
                      <div key={notificacao.id} className="p-4 border rounded-lg bg-green-50">
                        <h3 className="font-medium">{notificacao.titulo}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notificacao.conteudo}
                        </p>
                        {educando && (
                          <Badge variant="outline" className="mt-2">
                            {educando.nome}
                          </Badge>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <Badge variant="outline">Nota</Badge>
                          <Button size="sm" onClick={() => navigate('/notas')}>Ver Notas</Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}