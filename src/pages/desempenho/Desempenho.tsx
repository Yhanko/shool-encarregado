import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  TrendingUp,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Calendar,
  Bot
} from '../../lib/icons';
import { useParent } from '@/contexts/ParentContext';
import { Educando } from '@/types';
import { Loader2 } from 'lucide-react';
import { parentService } from '@/services/api/parentService';

export function Desempenho() {
  const { educandos, desempenhos, isLoading } = useParent();
  const [educandoSelecionado, setEducandoSelecionado] = useState<Educando | null>(null);
  const [studentAnalysis, setStudentAnalysis] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    if (educandos.length > 0 && !educandoSelecionado) {
      setEducandoSelecionado(educandos[0]);
    }
  }, [educandos, educandoSelecionado]);

  useEffect(() => {
    if (educandoSelecionado) {
      const fetchAnalysis = async () => {
        setAnalysisLoading(true);
        try {
          const data = await parentService.getStudentAnalysis(educandoSelecionado.id);
          setStudentAnalysis(data);
        } catch (error) {
          setStudentAnalysis(null);
        } finally {
          setAnalysisLoading(false);
        }
      };
      fetchAnalysis();
    }
  }, [educandoSelecionado]);

  const calcularMediaPorTrimestre = (educando: Educando) => {
    const trimestres = [1, 2, 3];
    return trimestres.map(trimestre => {
      const notasTrimestre = educando.notas.filter(n => n.trimestre === trimestre);
      if (notasTrimestre.length === 0) return { trimestre: `${trimestre}º Trim`, media: 0 };
      
      const soma = notasTrimestre.reduce((acc, nota) => acc + nota.valor, 0);
      const media = Math.round((soma / notasTrimestre.length) * 10) / 10;
      
      return { trimestre: `${trimestre}º Trim`, media };
    });
  };

  const calcularMediaPorDisciplina = (educando: Educando) => {
    const disciplinas = [...new Set(educando.notas.map(n => n.disciplina))];
    
    return disciplinas.map(disciplina => {
      const notasDisciplina = educando.notas.filter(n => n.disciplina === disciplina);
      const soma = notasDisciplina.reduce((acc, nota) => acc + nota.valor, 0);
      const media = Math.round((soma / notasDisciplina.length) * 10) / 10;
      
      return { disciplina, media };
    });
  };

  const obterDesempenhoEducando = (educandoId: string) => {
    return desempenhos.filter(d => d.educandoId === educandoId);
  };

  const calcularMediaGeral = (educando: Educando) => {
    if (educando.notas.length === 0) return 0;
    const soma = educando.notas.reduce((acc, nota) => acc + nota.valor, 0);
    return Math.round((soma / educando.notas.length) * 10) / 10;
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
        <Target className="h-16 w-16 mb-4 opacity-50" />
        <p>Nenhum educando encontrado.</p>
      </div>
    );
  }

  const dadosRadar = calcularMediaPorDisciplina(educandoSelecionado).map(item => ({
    disciplina: item.disciplina.substring(0, 8),
    valor: item.media,
    maximo: 20
  }));

  const mediaGeral = calcularMediaGeral(educandoSelecionado);
  const desempenhoEducando = obterDesempenhoEducando(educandoSelecionado.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Target className="mr-3 h-8 w-8" />
            Análise de Desempenho
          </h1>
          <p className="text-muted-foreground">Acompanhe o progresso acadêmico detalhado dos seus educandos</p>
        </div>
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
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaGeral}</div>
            <p className="text-xs text-muted-foreground">
              {mediaGeral >= 14 ? 'Excelente desempenho' : mediaGeral >= 10 ? 'Bom desempenho' : 'Precisa melhorar'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disciplinas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{educandoSelecionado.disciplinas.length}</div>
            <p className="text-xs text-muted-foreground">Disciplinas cursadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliações</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{educandoSelecionado.notas.length}</div>
            <p className="text-xs text-muted-foreground">Realizadas este ano</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Frequência</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {desempenhoEducando.length > 0 
                ? Math.round(desempenhoEducando.reduce((acc, d) => acc + d.frequencia, 0) / desempenhoEducando.length)
                : 95
              }%
            </div>
            <p className="text-xs text-muted-foreground">Presença nas aulas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução por Trimestre */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Evolução por Trimestre
            </CardTitle>
            <CardDescription>Progresso acadêmico ao longo do ano</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={calcularMediaPorTrimestre(educandoSelecionado)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="trimestre" />
                <YAxis domain={[0, 20]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="media" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Desempenho por Disciplina */}
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Disciplina</CardTitle>
            <CardDescription>Comparação entre disciplinas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={calcularMediaPorDisciplina(educandoSelecionado)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="disciplina" />
                <YAxis domain={[0, 20]} />
                <Tooltip />
                <Bar dataKey="media" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar de Competências */}
        <Card>
          <CardHeader>
            <CardTitle>Radar de Competências</CardTitle>
            <CardDescription>Visão geral das habilidades por disciplina</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={dadosRadar}>
                <PolarGrid />
                <PolarAngleAxis dataKey="disciplina" />
                <PolarRadiusAxis angle={90} domain={[0, 20]} />
                <Radar
                  name="Desempenho"
                  dataKey="valor"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Análise Detalhada */}
        <Card>
          <CardHeader>
            <CardTitle>Análise Detalhada</CardTitle>
            <CardDescription>Pontos fortes e áreas de melhoria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {desempenhoEducando.map((item) => (
                <div key={item.disciplina} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{item.disciplina}</h3>
                    <Badge variant={item.mediaGeral >= 14 ? 'default' : item.mediaGeral >= 10 ? 'secondary' : 'destructive'}>
                      {item.mediaGeral}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{item.mediaGeral}/20</span>
                    </div>
                    <Progress value={(item.mediaGeral / 20) * 100} className="h-2" />
                  </div>

                  {item.pontosFortes && item.pontosFortes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Pontos Fortes
                      </h4>
                      <ul className="text-sm text-green-600 space-y-1">
                        {item.pontosFortes.map((ponto, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            {ponto}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.pontosFracos && item.pontosFracos.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center">
                        <AlertCircle className="mr-1 h-4 w-4" />
                        Áreas de Melhoria
                      </h4>
                      <ul className="text-sm text-red-600 space-y-1">
                        {item.pontosFracos.map((ponto, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            {ponto}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.observacoes && item.observacoes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-blue-700 mb-2">Observações do Professor</h4>
                      <ul className="text-sm text-blue-600 space-y-1">
                        {item.observacoes.map((obs, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            {obs}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
              {desempenhoEducando.length === 0 && (
                 <p className="text-sm text-muted-foreground">Sem dados suficientes para análise por disciplina.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise Global com IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="mr-2 h-5 w-5 text-blue-600" />
            Análise Global por Inteligência Artificial
          </CardTitle>
          <CardDescription>Resumo e recomendações geradas com base em todo o histórico escolar do seu educando</CardDescription>
        </CardHeader>
        <CardContent>
          {analysisLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-muted-foreground text-sm">A analisar o desempenho escolar...</p>
            </div>
          ) : studentAnalysis ? (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 text-blue-900 rounded-lg">
                <p className="text-sm leading-relaxed">{studentAnalysis.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-green-700 flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4" /> Pontos Fortes
                  </h3>
                  <div className="space-y-2">
                    {studentAnalysis.strengths?.map((strength: string, i: number) => (
                       <p key={i} className="text-sm text-green-800 flex items-start">
                         <span className="mr-2">•</span> {strength}
                       </p>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-red-700 flex items-center">
                    <AlertCircle className="mr-2 h-4 w-4" /> Áreas de Atenção
                  </h3>
                  <div className="space-y-2">
                    {studentAnalysis.weaknesses?.map((weakness: string, i: number) => (
                       <p key={i} className="text-sm text-red-800 flex items-start">
                         <span className="mr-2">•</span> {weakness}
                       </p>
                    ))}
                  </div>
                </div>
              </div>

              {studentAnalysis.recommendations && studentAnalysis.recommendations.length > 0 && (
                <div className="pt-4 border-t">
                  <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                    <Target className="mr-2 h-4 w-4 text-gray-600" /> Recomendações de Ação
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {studentAnalysis.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <span className="mr-2 font-bold text-blue-500">{i + 1}.</span> {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>A análise global por IA não está disponível neste momento.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}