import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Eye,
  Mail,
  Calendar
} from '../../lib/icons';
import { useParent } from '@/contexts/ParentContext';
import { Educando } from '@/types';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function NotasPauta() {
  const { educandos, isLoading } = useParent();
  const [educandoSelecionado, setEducandoSelecionado] = useState<Educando | null>(null);
  const [trimestreSelecionado, setTrimestreSelecionado] = useState('1');
  const [activeTab, setActiveTab] = useState('pauta');
  const navigate = useNavigate();

  useEffect(() => {
    if (educandos.length > 0 && !educandoSelecionado) {
      setEducandoSelecionado(educandos[0]);
    }
  }, [educandos, educandoSelecionado]);

  const calcularMedia = (educando: Educando, disciplina?: string, trimestre?: number) => {
    let notasFiltradas = educando.notas;
    
    if (disciplina) {
      notasFiltradas = notasFiltradas.filter(n => n.disciplina === disciplina);
    }
    
    if (trimestre) {
      notasFiltradas = notasFiltradas.filter(n => n.trimestre === trimestre);
    }
    
    if (notasFiltradas.length === 0) return 0;
    
    const soma = notasFiltradas.reduce((acc, nota) => acc + nota.valor, 0);
    return Math.round((soma / notasFiltradas.length) * 10) / 10;
  };

  const getStatusNota = (media: number) => {
    if (media >= 14) return { status: 'Aprovado', color: 'default' as const, icon: TrendingUp };
    if (media >= 10) return { status: 'Recuperação', color: 'secondary' as const, icon: Minus };
    return { status: 'Reprovado', color: 'destructive' as const, icon: TrendingDown };
  };

  const obterNotasPorDisciplina = (educando: Educando) => {
    const disciplinas = [...new Set(educando.notas.map(n => n.disciplina))];
    
    return disciplinas.map(disciplina => {
      const notasDisciplina = educando.notas.filter(n => n.disciplina === disciplina);
      const mediaGeral = calcularMedia(educando, disciplina);
      const mediaT1 = calcularMedia(educando, disciplina, 1);
      const mediaT2 = calcularMedia(educando, disciplina, 2);
      const mediaT3 = calcularMedia(educando, disciplina, 3);
      
      // Obter o nome do professor a partir da primeira nota dessa disciplina
      const professor = notasDisciplina.length > 0 ? notasDisciplina[0].professorNome : 'Não atribuído';
      
      return {
        disciplina,
        notas: notasDisciplina,
        mediaGeral,
        mediaT1,
        mediaT2,
        mediaT3,
        professor
      };
    });
  };

  const exportarBoletim = () => {
    toast.success("A gerar boletim...");
    
    const disciplinas = obterNotasPorDisciplina(educandoSelecionado!);
    const isGeral = trimestreSelecionado === 'geral';

    const doc = new jsPDF();
    const titulo = isGeral ? 'Pauta Geral (Final)' : `${trimestreSelecionado}º Trimestre`;

    // Cabeçalho da Escola
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text('Boletim de Avaliação Contínua', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Ano Letivo: ${new Date().getFullYear()}`, 14, 30);
    doc.text(`Período: ${titulo}`, 14, 36);

    // Informações do Aluno
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 45, 182, 25, 3, 3, 'FD');

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text('Aluno:', 18, 53);
    doc.text('Série:', 18, 63);
    
    doc.setFont("helvetica", "normal");
    doc.text(educandoSelecionado!.nome, 35, 53);
    doc.text(educandoSelecionado!.serie, 35, 63);

    doc.setFont("helvetica", "bold");
    doc.text('Turma:', 120, 53);
    doc.text('Data de Emissão:', 120, 63);
    
    doc.setFont("helvetica", "normal");
    doc.text(educandoSelecionado!.turma, 160, 53);
    doc.text(new Date().toLocaleDateString('pt-BR'), 160, 63);

    // Tabela de Notas
    const tableColumn = !isGeral 
      ? ["Disciplina", "Professor", "Nota Trimestre", "Status"]
      : ["Disciplina", "Professor", "1º Trim", "2º Trim", "3º Trim", "Média Final", "Status"];

    const tableRows: any[] = [];

    disciplinas.forEach(d => {
      const notaMedia = isGeral ? d.mediaGeral : (trimestreSelecionado === '1' ? d.mediaT1 : trimestreSelecionado === '2' ? d.mediaT2 : d.mediaT3);
      const statusInfo = getStatusNota(notaMedia);
      const statusText = notaMedia ? statusInfo.status : '-';
      
      const rowData = !isGeral 
        ? [d.disciplina, d.professor, notaMedia || '-', statusText]
        : [d.disciplina, d.professor, d.mediaT1 || '-', d.mediaT2 || '-', d.mediaT3 || '-', d.mediaGeral, statusText];
        
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 80,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [241, 245, 249], textColor: [30, 41, 59], fontStyle: 'bold' },
      columnStyles: {
        0: { fontStyle: 'bold' }
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === tableColumn.length - 1) {
          const status = data.cell.raw as string;
          if (status === 'Aprovado') data.cell.styles.textColor = [22, 163, 74];
          else if (status === 'Recuperação') data.cell.styles.textColor = [202, 138, 4];
          else if (status === 'Reprovado') data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    // Assinatura
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    
    doc.setDrawColor(100);
    doc.line(14, finalY + 40, 90, finalY + 40);
    doc.setFontSize(9);
    doc.text('Assinatura do Encarregado', 14, finalY + 48);

    doc.setTextColor(150);
    doc.text('Documento gerado automaticamente pelo portal da escola.', 14, finalY + 70);

    doc.save(`Boletim_${educandoSelecionado!.nome.replace(/\\s+/g, '_')}_${titulo.replace(/\\s+/g, '_')}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!educandoSelecionado) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center flex-col text-muted-foreground">
        <GraduationCap className="h-16 w-16 mb-4 opacity-50" />
        <p>Nenhum educando encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <GraduationCap className="mr-3 h-8 w-8" />
            Notas & Pauta
          </h1>
          <p className="text-muted-foreground">Acompanhe o desempenho acadêmico dos seus educandos</p>
        </div>
        
        <Button variant="outline" onClick={exportarBoletim}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Boletim
        </Button>
      </div>

      {/* Seleção de Educando */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select value={educandoSelecionado.id} onValueChange={(value) => {
            const educando = educandos.find(e => e.id === value);
            if (educando) setEducandoSelecionado(educando);
          }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {educandos.map(educando => (
                <SelectItem key={educando.id} value={educando.id}>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={educando.avatar} alt={educando.nome} />
                      <AvatarFallback className="text-xs">
                        {educando.nome.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span>{educando.nome} - {educando.turma}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <Select value={trimestreSelecionado} onValueChange={setTrimestreSelecionado}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1º Trimestre</SelectItem>
              <SelectItem value="2">2º Trimestre</SelectItem>
              <SelectItem value="3">3º Trimestre</SelectItem>
              <SelectItem value="geral">Média Geral</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pauta">Pauta Geral</TabsTrigger>
          <TabsTrigger value="disciplinas">Por Disciplina</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="pauta">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={educandoSelecionado.avatar} alt={educandoSelecionado.nome} />
                      <AvatarFallback>
                        {educandoSelecionado.nome.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {educandoSelecionado.nome}
                  </CardTitle>
                  <CardDescription>
                    {educandoSelecionado.turma} - {educandoSelecionado.serie} • 
                    {trimestreSelecionado === 'geral' ? ' Média Geral' : ` ${trimestreSelecionado}º Trimestre`}
                  </CardDescription>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {trimestreSelecionado === 'geral' 
                      ? calcularMedia(educandoSelecionado)
                      : calcularMedia(educandoSelecionado, undefined, parseInt(trimestreSelecionado))
                    }
                  </div>
                  <p className="text-sm text-muted-foreground">Média Geral</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Disciplina</TableHead>
                      <TableHead>Professor</TableHead>
                      <TableHead className="text-center">1º Trim</TableHead>
                      <TableHead className="text-center">2º Trim</TableHead>
                      <TableHead className="text-center">3º Trim</TableHead>
                      <TableHead className="text-center">Média</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {obterNotasPorDisciplina(educandoSelecionado).map((disciplinaData) => {
                      const statusInfo = getStatusNota(disciplinaData.mediaGeral);
                      const StatusIcon = statusInfo.icon;

                      return (
                        <TableRow key={disciplinaData.disciplina}>
                          <TableCell className="font-medium">
                            {disciplinaData.disciplina}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                  {disciplinaData.professor.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">
                                {disciplinaData.professor}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-bold">
                              {disciplinaData.mediaT1 || '-'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-bold">
                              {disciplinaData.mediaT2 || '-'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-bold">
                              {disciplinaData.mediaT3 || '-'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-lg font-bold">
                              {disciplinaData.mediaGeral}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={statusInfo.color} className="flex items-center w-fit mx-auto bg-green-500">
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {statusInfo.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center space-x-1">
                              <Button variant="outline" size="sm" onClick={() => setActiveTab('disciplinas')}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => navigate('/chat')}>
                                <Mail className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disciplinas">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {obterNotasPorDisciplina(educandoSelecionado).map((disciplinaData) => {
              const statusInfo = getStatusNota(disciplinaData.mediaGeral);
              const StatusIcon = statusInfo.icon;

              return (
                <Card key={disciplinaData.disciplina}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{disciplinaData.disciplina}</CardTitle>
                      <Badge variant={statusInfo.color} className="flex items-center">
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusInfo.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      Professor: {disciplinaData.professor || 'N/A'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-3xl font-bold">{disciplinaData.mediaGeral}</div>
                        <p className="text-sm text-muted-foreground">Média Geral</p>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">Avaliações Realizadas:</h4>
                        {disciplinaData.notas
                          .filter(nota => trimestreSelecionado === 'geral' || nota.trimestre === parseInt(trimestreSelecionado))
                          .map((nota) => (
                            <div key={nota.id} className="flex flex-col p-3 border rounded-lg gap-2">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium capitalize">{nota.tipo}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(nota.data).toLocaleDateString('pt-BR')} • {nota.trimestre}º Trimestre
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-bold">{nota.valor}</div>
                                  <div className="text-sm text-muted-foreground">/ 20</div>
                                </div>
                              </div>
                              {nota.observacaoProfessor && (
                                <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded-md border border-blue-100">
                                  <strong>Obs:</strong> {nota.observacaoProfessor}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setActiveTab('historico')}>
                          <Eye className="mr-2 h-4 w-4" />
                          Histórico
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate('/chat')}>
                          <Mail className="mr-2 h-4 w-4" />
                          Contactar Prof.
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="historico">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Histórico de Avaliações - {educandoSelecionado.nome}
              </CardTitle>
              <CardDescription>Todas as avaliações realizadas por trimestre</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {[1, 2, 3].map(trimestre => {
                    const notasTrimestre = educandoSelecionado.notas.filter(n => n.trimestre === trimestre);
                    
                    if (notasTrimestre.length === 0) return null;

                    return (
                      <div key={trimestre} className="border rounded-lg p-4">
                        <h3 className="font-medium mb-3">{trimestre}º Trimestre</h3>
                        <div className="space-y-2">
                          {notasTrimestre.map((nota) => (
                            <div key={nota.id} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div className="flex items-center space-x-3">
                                <Badge variant="outline" className="text-xs">
                                  {nota.disciplina}
                                </Badge>
                                <span className="text-sm capitalize">{nota.tipo}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(nota.data).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold">{nota.valor}</span>
                                <span className="text-xs text-muted-foreground">/ 20</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Média do Trimestre:</span>
                            <span className="text-xl font-bold text-blue-600">
                              {calcularMedia(educandoSelecionado, undefined, trimestre)}
                            </span>
                          </div>
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