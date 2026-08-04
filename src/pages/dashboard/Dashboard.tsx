import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  CreditCard,
  Users,
  GraduationCap,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from '../../lib/icons';
import { useParent } from '@/contexts/ParentContext';

export function Dashboard() {
  const { educandos, pagamentos, notificacoes, atividades } = useParent();

  const totalEducandos = educandos.length;
  const pagamentosPendentes = pagamentos.filter(p => p.status === 'pendente').length;
  const pagamentosAtrasados = pagamentos.filter(p => p.status === 'atrasado').length;
  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida).length;
  const proximasAtividades = atividades.filter(a => new Date(a.data) > new Date()).length;

  const calcularMediaEducando = (educandoId: string) => {
    const educando = educandos.find(e => e.id === educandoId);
    if (!educando || educando.notas.length === 0) return 0;
    
    const soma = educando.notas.reduce((acc, nota) => acc + nota.valor, 0);
    return Math.round((soma / educando.notas.length) * 10) / 10;
  };

  // Process data for charts
  const statusPagamentos = [
    { name: 'Pagos', value: pagamentos.filter(p => p.status === 'pago').length, color: '#10b981' },
    { name: 'Pendentes', value: pagamentosPendentes, color: '#f59e0b' },
    { name: 'Atrasados', value: pagamentosAtrasados, color: '#ef4444' }
  ].filter(s => s.value > 0);
  
  if (statusPagamentos.length === 0) {
     statusPagamentos.push({ name: 'Sem Registos', value: 1, color: '#d1d5db' });
  }

  // Simplified mockup for charts since backend only gives a flat list of payments
  const pagamentosData = pagamentos.slice(-5).map(p => ({ mes: p.mes, valor: p.valor, status: p.status }));
  const notasData = [{ trimestre: 'Geral', ...Object.fromEntries(educandos.map(e => [e.nome.split(' ')[0], calcularMediaEducando(e.id)])) }];


  return (
    <div className="space-y-6">
      {/* Alertas Importantes */}
      {(pagamentosAtrasados > 0 || pagamentosPendentes > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="font-medium text-red-800">Atenção aos Pagamentos</h3>
              <p className="text-sm text-red-600">
                {pagamentosAtrasados > 0 && `${pagamentosAtrasados} pagamento(s) em atraso`}
                {pagamentosAtrasados > 0 && pagamentosPendentes > 0 && ' e '}
                {pagamentosPendentes > 0 && `${pagamentosPendentes} pagamento(s) pendente(s)`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Educandos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEducandos}</div>
            <p className="text-xs text-muted-foreground">Sob sua responsabilidade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pagamentosPendentes}</div>
            <p className="text-xs text-muted-foreground">Requerem atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notificações</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificacoesNaoLidas}</div>
            <p className="text-xs text-muted-foreground">Não lidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividades</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proximasAtividades}</div>
            <p className="text-xs text-muted-foreground">Próximas atividades</p>
          </CardContent>
        </Card>
      </div>

      {/* Informações dos Educandos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="mr-2 h-5 w-5" />
              Meus Educandos
            </CardTitle>
            <CardDescription>Visão geral do desempenho acadêmico</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {educandos.map((educando) => {
                const media = calcularMediaEducando(educando.id);
                const statusColor = media >= 14 ? 'text-green-600' : media >= 10 ? 'text-yellow-600' : 'text-red-600';
                
                return (
                  <div key={educando.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={educando.avatar} alt={educando.nome} />
                      <AvatarFallback>
                        {educando.nome.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium">{educando.nome}</h3>
                      <p className="text-sm text-muted-foreground">
                        {educando.turma} - {educando.serie}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm">Média Geral:</span>
                        <span className={`font-bold ${statusColor}`}>{media}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Status de Pagamentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Status de Pagamentos
            </CardTitle>
            <CardDescription>Situação financeira atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusPagamentos}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusPagamentos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                {statusPagamentos.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div
                      className="w-4 h-4 rounded-full mx-auto"
                      style={{ backgroundColor: item.color }}
                    />
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-lg font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Desempenho por Trimestre */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Desempenho por Trimestre
            </CardTitle>
            <CardDescription>Evolução das notas dos educandos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={notasData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="trimestre" />
                <YAxis domain={[0, 20]} />
                <Tooltip />
                {educandos.map((educando, index) => {
                  const firstName = educando.nome.split(' ')[0];
                  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                  return (
                    <Bar 
                      key={educando.id} 
                      dataKey={firstName} 
                      fill={colors[index % colors.length]} 
                      name={firstName} 
                      radius={[4, 4, 0, 0]} 
                    />
                  );
                })}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Próximas Atividades */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas Atividades</CardTitle>
            <CardDescription>Eventos e atividades escolares</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {atividades.slice(0, 3).map((atividade) => (
                <div key={atividade.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{atividade.titulo}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {atividade.descricao}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {new Date(atividade.data).toLocaleDateString('pt-BR')}
                        </Badge>
                        <Badge variant={atividade.tipo === 'escolar' ? 'default' : 'secondary'}>
                          {atividade.tipo}
                        </Badge>
                      </div>
                      {atividade.horario && (
                        <span className="text-xs text-muted-foreground">
                          {atividade.horario}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro - 2024</CardTitle>
          <CardDescription>Histórico de pagamentos por mês</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">
                {pagamentos.filter(p => p.status === 'pago').length}
              </p>
              <p className="text-sm text-green-700">Pagamentos Realizados</p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">{pagamentosPendentes}</p>
              <p className="text-sm text-yellow-700">Pagamentos Pendentes</p>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{pagamentosAtrasados}</p>
              <p className="text-sm text-red-700">Pagamentos em Atraso</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={pagamentosData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value.toLocaleString()} Kz`, 'Valor']} />
              <Line 
                type="monotone" 
                dataKey="valor" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}