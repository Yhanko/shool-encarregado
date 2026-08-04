import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Trophy,
  BookOpen,
  Camera,
  Download,
  ChevronLeft,
  ChevronRight
} from '../../lib/icons';
import { useParent } from '@/contexts/ParentContext';
import { AtividadeEscolar } from '@/types';
import { toast } from 'sonner';

export function Atividades() {
  const { atividades, educandos } = useParent();
  const [filtroTipo, setFiltroTipo] = useState<string>('todas');
  const [dataCalendario, setDataCalendario] = useState(new Date());

  const proximasAtividades = atividades.filter(a => new Date(a.data) > new Date());
  const atividadesPassadas = atividades.filter(a => new Date(a.data) <= new Date());

  const atividadesEsteMes = atividades.filter(a => {
    const dataAtiv = new Date(a.data);
    const hoje = new Date();
    return dataAtiv.getMonth() === hoje.getMonth() && dataAtiv.getFullYear() === hoje.getFullYear();
  });

  const verificarParticipacao = (atividade: AtividadeEscolar) => {
    return educandos.some(educando => 
      atividade.turmasParticipantes.includes(educando.turma)
    );
  };

  const obterEducandosParticipantes = (atividade: AtividadeEscolar) => {
    return educandos.filter(educando => 
      atividade.turmasParticipantes.includes(educando.turma)
    );
  };

  const handleDownloadICS = (atividade: AtividadeEscolar) => {
    const startDate = new Date(atividade.data);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '').substring(0, 15) + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${atividade.titulo}`,
      `DESCRIPTION:${atividade.descricao}`,
      atividade.local ? `LOCATION:${atividade.local}` : '',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${atividade.titulo.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Atividade adicionada à sua agenda!');
  };

  const diasNoMes = new Date(dataCalendario.getFullYear(), dataCalendario.getMonth() + 1, 0).getDate();
  const primeiroDiaDoMes = new Date(dataCalendario.getFullYear(), dataCalendario.getMonth(), 1).getDay();

  const handleMudarMes = (direcao: number) => {
    setDataCalendario(prev => new Date(prev.getFullYear(), prev.getMonth() + direcao, 1));
  };

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Calendar className="mr-3 h-8 w-8" />
            Atividades Escolares
          </h1>
          <p className="text-muted-foreground">Acompanhe eventos e atividades dos seus educandos</p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Atividades</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{proximasAtividades.length}</div>
            <p className="text-xs text-muted-foreground">Eventos programados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meus Educandos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {proximasAtividades.filter(verificarParticipacao).length}
            </div>
            <p className="text-xs text-muted-foreground">Atividades com participação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{atividadesEsteMes.length}</div>
            <p className="text-xs text-muted-foreground">Atividades este mês</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="proximas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="proximas">Próximas Atividades</TabsTrigger>
          <TabsTrigger value="calendario">Calendário</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="proximas" className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as atividades</SelectItem>
                  <SelectItem value="escolar">Atividades Escolares</SelectItem>
                  <SelectItem value="extraescolar">Atividades Extraescolares</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lista de Atividades */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {proximasAtividades
              .filter(a => filtroTipo === 'todas' || a.tipo === filtroTipo)
              .map((atividade) => {
                const participantes = obterEducandosParticipantes(atividade);
                const temParticipacao = participantes.length > 0;

                return (
                  <Card key={atividade.id} className={`hover:shadow-md transition-shadow ${
                    temParticipacao ? 'border-blue-200 bg-blue-50' : ''
                  }`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{atividade.titulo}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant={atividade.tipo === 'escolar' ? 'default' : 'secondary'}>
                            {atividade.tipo === 'escolar' ? 'Escolar' : 'Extraescolar'}
                          </Badge>
                          {temParticipacao && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-700">
                              Seus educandos participam
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardDescription>{atividade.descricao}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(atividade.data).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                        </div>

                        {atividade.horario && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{atividade.horario}</span>
                          </div>
                        )}

                        {atividade.local && (
                          <div className="flex items-center space-x-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{atividade.local}</span>
                          </div>
                        )}

                        <div className="flex items-center space-x-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>Turmas: {atividade.turmasParticipantes.join(', ')}</span>
                        </div>

                        {temParticipacao && (
                          <div className="p-3 bg-blue-100 border border-blue-200 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-2">Seus educandos participantes:</h4>
                            <div className="flex flex-wrap gap-2">
                              {participantes.map(educando => (
                                <Badge key={educando.id} variant="outline" className="bg-white">
                                  {educando.nome} ({educando.turma})
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-2 pt-2">
                          {temParticipacao && (
                            <Button size="sm" className="flex-1" onClick={() => handleDownloadICS(atividade)}>
                              <Calendar className="mr-2 h-4 w-4" />
                              Adicionar à Agenda
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        <TabsContent value="calendario" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Calendário de Atividades</CardTitle>
                <CardDescription>Visão mensal das atividades escolares</CardDescription>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="icon" onClick={() => handleMudarMes(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-medium min-w-[120px] text-center">
                  {meses[dataCalendario.getMonth()]} de {dataCalendario.getFullYear()}
                </span>
                <Button variant="outline" size="icon" onClick={() => handleMudarMes(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
                  <div key={dia} className="p-2 text-center font-medium text-sm bg-muted rounded">
                    {dia}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 42 }).map((_, i) => {
                  const dia = i - primeiroDiaDoMes + 1;
                  const isValidDay = dia > 0 && dia <= diasNoMes;
                  
                  if (i >= 35 && dia > diasNoMes) return null;
                  
                  let atividadesDoDia: AtividadeEscolar[] = [];
                  if (isValidDay) {
                    const dataAtualLoop = new Date(dataCalendario.getFullYear(), dataCalendario.getMonth(), dia);
                    atividadesDoDia = atividades.filter(a => {
                      const dataA = new Date(a.data);
                      return dataA.getDate() === dataAtualLoop.getDate() && 
                             dataA.getMonth() === dataAtualLoop.getMonth() && 
                             dataA.getFullYear() === dataAtualLoop.getFullYear();
                    });
                  }

                  return (
                    <div key={i} className={`p-2 min-h-[80px] border rounded ${
                      isValidDay ? 'bg-white' : 'bg-gray-50'
                    }`}>
                      {isValidDay && (
                        <>
                          <div className={`font-medium text-sm mb-1 flex items-center justify-center ${
                            dia === new Date().getDate() && dataCalendario.getMonth() === new Date().getMonth() && dataCalendario.getFullYear() === new Date().getFullYear() 
                              ? 'bg-blue-600 text-white w-6 h-6 rounded-full' 
                              : ''
                          }`}>{dia}</div>
                          {atividadesDoDia.map(atividade => (
                            <div key={atividade.id} className={`text-xs p-1 rounded mb-1 truncate ${
                              atividade.tipo === 'escolar' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`} title={atividade.titulo}>
                              {atividade.titulo}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5" />
                Atividades Realizadas
              </CardTitle>
              <CardDescription>Histórico de participação dos seus educandos</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {atividadesPassadas.map((atividade) => {
                    const participantes = obterEducandosParticipantes(atividade);
                    const temParticipacao = participantes.length > 0;

                    return (
                      <div key={atividade.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${
                            atividade.tipo === 'escolar' ? 'bg-blue-100' : 'bg-green-100'
                          }`}>
                            {atividade.tipo === 'escolar' ? (
                              <BookOpen className={`h-5 w-5 ${
                                atividade.tipo === 'escolar' ? 'text-blue-600' : 'text-green-600'
                              }`} />
                            ) : (
                              <Trophy className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{atividade.titulo}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(atividade.data).toLocaleDateString('pt-BR')}
                              {atividade.local && ` • ${atividade.local}`}
                            </p>
                            {temParticipacao && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {participantes.map(educando => (
                                  <Badge key={educando.id} variant="outline" className="text-xs">
                                    {educando.nome}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => toast.info('As fotos desta atividade ainda não foram disponibilizadas.')} title="Ver Fotos">
                            <Camera className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => toast.info('Não há documentos associados a esta atividade.')} title="Descarregar Documento">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}