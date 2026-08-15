import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bot,
  Send,
  BookOpen,
  Lightbulb,
  Users,
  Target,
  MessageCircle,
  Heart
} from '../../lib/icons';
import { useParent } from '@/contexts/ParentContext';
import { parentService } from '@/services/api/parentService';
import { Loader2 } from 'lucide-react';

interface Conversa {
  id: string;
  pergunta: string;
  resposta: string;
  categoria: string;
  hora: string;
}

export function IAAssistant() {
  const { educandos, isLoading: parentLoading } = useParent();
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [sugestoes, setSugestoes] = useState<any[]>([]);
  const [recursosIA, setRecursosIA] = useState<any[]>([]);
  const [pergunta, setPergunta] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyses = async () => {
      if (parentLoading) return;
      
      setInitialLoading(true);
      try {
        let [fetchedSuggestions, fetchedResources] = await Promise.all([
          parentService.getAiSuggestions(),
          parentService.getAiResources()
        ]);
        
        if (!fetchedSuggestions || fetchedSuggestions.length === 0) {
          fetchedSuggestions = [
            { texto: 'Quais as melhores estratégias para melhorar o foco e comportamento nas aulas?', categoria: 'Comportamento' },
            { texto: 'Dicas práticas para participar ativamente no processo de aprendizagem do meu filho.', categoria: 'Participação Ativa' },
            { texto: 'Como posso apoiar a saúde psicológica e gerir o stress escolar do meu educando?', categoria: 'Saúde Psicológica' },
            { texto: 'Com base no histórico escolar, que áreas profissionais se adequam mais ao meu filho?', categoria: 'Orientação Vocacional' },
            { texto: 'Como criar uma rotina saudável de educação e estudos em casa?', categoria: 'Educação em Casa' }
          ];
        }

        if (!fetchedResources || fetchedResources.length === 0) {
          fetchedResources = [
            { titulo: 'Análise de Tendência Vocacional', descricao: 'Relatório inteligente baseado nas notas para alinhar o futuro profissional.', categoria: 'Carreira', icon: 'Target' },
            { titulo: 'Guia de Saúde Mental', descricao: 'Sinais de alerta de baixo desempenho, stress e como lidar com eles.', categoria: 'Psicologia', icon: 'Heart' },
            { titulo: 'Manual de Ensino em Casa', descricao: 'Métodos para melhorar o rendimento escolar fora da escola.', categoria: 'Educação', icon: 'BookOpen' },
            { titulo: 'Parceria Escola-Família', descricao: 'Estratégias de acompanhamento contínuo e ativo.', categoria: 'Família', icon: 'Users' }
          ];
        }

        setSugestoes(fetchedSuggestions);
        setRecursosIA(fetchedResources);
        
        if (educandos.length > 0) {
          const generatedConversas: Conversa[] = [];
          
          for (const educando of educandos) {
            const analysis = await parentService.getStudentAnalysis(educando.id);
            
            let respostaCompleta = `${analysis.summary}\n\n`;
            if (analysis.strengths && analysis.strengths.length > 0) {
               respostaCompleta += `**Pontos Fortes:** ${analysis.strengths.join(', ')}\n`;
            }
            if (analysis.weaknesses && analysis.weaknesses.length > 0) {
               respostaCompleta += `**Áreas de Melhoria:** ${analysis.weaknesses.join(', ')}\n`;
            }
            if (analysis.recommendations && analysis.recommendations.length > 0) {
               respostaCompleta += `\n**Recomendações:**\n${analysis.recommendations.map((r: string) => `• ${r}`).join('\n')}`;
            }

            generatedConversas.push({
              id: `auto-${educando.id}`,
              pergunta: `Análise automática do desempenho de ${educando.nome}`,
              resposta: respostaCompleta,
              categoria: 'análise_desempenho',
              hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            });
          }
          
          setConversas(generatedConversas);
        }
      } catch (error) {
        console.error('Failed to fetch AI analysis', error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAnalyses();
  }, [educandos, parentLoading]);

  const enviarPergunta = async () => {
    if (!pergunta.trim()) return;

    setLoading(true);
    
    try {
      // Usar o primeiro educando como contexto principal se existir
      const studentId = educandos.length > 0 ? educandos[0].id : undefined;
      const result = await parentService.chatWithAi(pergunta, studentId);
      
      const novaConversa: Conversa = {
        id: Date.now().toString(),
        pergunta: pergunta,
        resposta: result.resposta,
        categoria: result.categoria || 'apoio_geral',
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setConversas([novaConversa, ...conversas]);
      setPergunta('');
    } catch(err) {
      console.error("Erro ao comunicar com a IA:", err);
      // Fallback in case of error
      const novaConversa: Conversa = {
        id: Date.now().toString(),
        pergunta: pergunta,
        resposta: 'Desculpe, ocorreu um erro ao contactar o servidor. Por favor, tente novamente.',
        categoria: 'erro',
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setConversas([novaConversa, ...conversas]);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading || parentLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">A gerar análise com IA...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Bot className="mr-3 h-8 w-8 text-blue-600" />
            Assistente IA Familiar
          </h1>
          <p className="text-muted-foreground">Seu parceiro inteligente para apoiar o sucesso educacional dos seus filhos</p>
        </div>
      </div>

      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">Chat IA</TabsTrigger>
          <TabsTrigger value="recursos">Recursos</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Área de Chat */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Conversar com a IA
                </CardTitle>
                <CardDescription>
                  Faça perguntas sobre educação, desenvolvimento infantil, estratégias de estudo e apoio familiar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Faça sua pergunta sobre como apoiar seu educando: dificuldades de aprendizagem, motivação, rotina de estudos..."
                    value={pergunta}
                    onChange={(e) => setPergunta(e.target.value)}
                    className="flex-1 min-h-[100px]"
                  />
                </div>
                
                <Button 
                  onClick={enviarPergunta} 
                  disabled={loading || !pergunta.trim()}
                  className="w-full text-white"
                >
                  {loading ? (
                    <>
                      <Bot className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Pergunta
                    </>
                  )}
                </Button>

                {conversas.length > 0 && (
                  <div className="space-y-4 pt-4">
                    <Separator />
                    <h3 className="font-semibold">Conversas Recentes</h3>
                    <ScrollArea className="h-96 pr-4">
                      <div className="space-y-4">
                        {conversas.map((conversa) => (
                          <div key={conversa.id} className="p-4 border rounded-lg space-y-3">
                            <div className="flex items-start space-x-3">
                              <div className="p-2 bg-blue-100 rounded-full">
                                <Users className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{conversa.pergunta}</p>
                                <p className="text-xs text-muted-foreground">{conversa.hora}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                              <div className="p-2 bg-green-100 rounded-full">
                                <Bot className="h-4 w-4 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm whitespace-pre-line leading-relaxed">{conversa.resposta}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sugestões */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5" />
                  Sugestões
                </CardTitle>
                <CardDescription>Tópicos populares para começar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sugestoes.map((sugestao, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left h-auto p-3 hover:bg-blue-50 hover:text-blue-700"
                      onClick={() => setPergunta(sugestao.texto)}
                    >
                      <div>
                        <p className="text-sm font-medium">{sugestao.texto}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {sugestao.categoria}
                        </Badge>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recursos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recursosIA.map((recurso, index) => {
              const iconMap: Record<string, any> = {
                Target,
                BookOpen,
                Heart,
                Users,
                Bot,
                Lightbulb,
                MessageCircle
              };
              const IconComponent = iconMap[recurso.icon] || BookOpen;

              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <IconComponent className="mr-2 h-5 w-5 text-blue-600" />
                      {recurso.titulo}
                    </CardTitle>
                    <CardDescription>{recurso.descricao}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{recurso.categoria}</Badge>
                      <Button size="sm" variant="outline">
                        Usar Recurso
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Conversas</CardTitle>
              <CardDescription>Todas as suas interações com a IA familiar</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {conversas.map((conversa) => (
                    <div key={conversa.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{conversa.categoria}</Badge>
                        <span className="text-xs text-muted-foreground">{conversa.hora}</span>
                      </div>
                      <p className="font-medium text-sm mb-2">{conversa.pergunta}</p>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {conversa.resposta}
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Ver Completo
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}