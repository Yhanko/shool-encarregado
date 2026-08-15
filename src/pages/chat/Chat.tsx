import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  MessageCircle,
  Send,
  Search,
  GraduationCap
} from '../../lib/icons';
import { parentService } from '@/services/api/parentService';
import { useParent } from '@/contexts/ParentContext';
import { useAuthStore } from '@/store/authStore';

interface Conversa {
  id: string;
  nome: string;
  tipo: 'professor' | 'escola' | 'filho';
  disciplina?: string;
  avatar?: string;
  ultimaMensagem: string;
  hora: string;
  naoLidas: number;
  online: boolean;
}

interface Mensagem {
  id: string;
  remetente: string;
  conteudo: string;
  hora: string;
  minha: boolean;
}

export function Chat() {
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [conversaSelecionada, setConversaSelecionada] = useState<Conversa | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [busca, setBusca] = useState('');
  
  const { educandos, mensagensNaoLidas, markChatAsRead } = useParent();
  const currentUser = useAuthStore(state => state.user);

  const getUnreadCount = (userId: string) => mensagensNaoLidas?.filter(m => m.senderId === userId).length || 0;

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const staff = await parentService.getContacts();
        
        const staffContacts: Conversa[] = staff.map((u: any) => ({
          id: u.id,
          nome: u.name,
          tipo: u.role === 'TEACHER' ? 'professor' : 'escola',
          disciplina: u.role === 'TEACHER' ? 'Professor' : (u.role === 'ADMIN' ? 'Administração' : 'Secretaria'),
          ultimaMensagem: 'Clique para abrir',
          hora: '',
          naoLidas: 0,
          online: false
        }));

        const childrenContacts: Conversa[] = educandos.map(e => ({
          id: e.id,
          nome: e.nome,
          tipo: 'filho',
          disciplina: 'Educando',
          ultimaMensagem: 'Clique para abrir',
          hora: '',
          naoLidas: 0,
          online: false
        }));

        setConversas([...staffContacts, ...childrenContacts]);
      } catch (error) {
        console.error('Failed to load contacts:', error);
      }
    };
    
    fetchContacts();
  }, [educandos]);

  useEffect(() => {
    if (!conversaSelecionada || !currentUser) return;

    if (getUnreadCount(conversaSelecionada.id) > 0) {
      markChatAsRead(conversaSelecionada.id);
    }

    const fetchMessages = async () => {
      try {
        const rawMessages = await parentService.getConversation(conversaSelecionada.id);
        const formatted: Mensagem[] = rawMessages.map((m: any) => ({
          id: m.id,
          remetente: m.senderId === currentUser.id ? 'Você' : m.sender?.name || conversaSelecionada.nome,
          conteudo: m.content,
          hora: new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          minha: m.senderId === currentUser.id
        }));
        setMensagens(formatted);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [conversaSelecionada, currentUser]);

  const getTipoLabel = (tipo: string) => {
    if (tipo === 'professor') return 'Professor';
    if (tipo === 'filho') return 'Filho(a)';
    return 'Escola';
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !conversaSelecionada) return;

    try {
      const msg = await parentService.sendMessage(conversaSelecionada.id, novaMensagem);
      
      const newMsg: Mensagem = {
        id: msg.id,
        remetente: 'Você',
        conteudo: msg.content,
        hora: new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        minha: true
      };

      setMensagens(prev => [...prev, newMsg]);
      setNovaMensagem('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const conversasFiltradas = conversas.filter(conversa =>
    conversa.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (conversa.disciplina && conversa.disciplina.toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <MessageCircle className="mr-3 h-8 w-8" />
            Mensagens
          </h1>
          <p className="text-muted-foreground">Comunicação direta com professores e escola</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
        {/* Lista de Conversas */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="mr-2 h-5 w-5" />
              Contactos
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar contactos..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              {conversasFiltradas.map((conversa) => (
                <div
                  key={conversa.id}
                  className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                    conversaSelecionada?.id === conversa.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => setConversaSelecionada(conversa)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversa.avatar} alt={conversa.nome} />
                        <AvatarFallback>
                          {conversa.tipo === 'professor' ? (
                            <GraduationCap className="h-5 w-5" />
                          ) : (
                            conversa.nome.split(' ').map(n => n[0]).join('')
                          )}
                        </AvatarFallback>
                      </Avatar>
                      {conversa.online && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
                      )}
                      {getUnreadCount(conversa.id) > 0 && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 border-2 border-white rounded-full" title="Mensagem nova" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{conversa.nome}</p>
                        <div className="flex items-center space-x-2">
                          {getUnreadCount(conversa.id) > 0 && (
                            <Badge variant="destructive" className="rounded-full">
                              {getUnreadCount(conversa.id)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {getTipoLabel(conversa.tipo)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Área de Conversa */}
        <Card className="lg:col-span-2 flex flex-col h-[700px]">
          {conversaSelecionada ? (
            <>
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversaSelecionada.avatar} alt={conversaSelecionada.nome} />
                        <AvatarFallback>
                          {conversaSelecionada.tipo === 'professor' ? (
                            <GraduationCap className="h-5 w-5" />
                          ) : (
                            conversaSelecionada.nome.split(' ').map(n => n[0]).join('')
                          )}
                        </AvatarFallback>
                      </Avatar>
                      {conversaSelecionada.online && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{conversaSelecionada.nome}</CardTitle>
                      <CardDescription className="flex items-center">
                        <Badge variant="outline" className="text-xs mr-2">
                          {getTipoLabel(conversaSelecionada.tipo)}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <Separator />

              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {mensagens.map((mensagem) => (
                      <div
                        key={mensagem.id}
                        className={`flex ${mensagem.minha ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            mensagem.minha
                              ? 'bg-blue-600 text-white'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{mensagem.conteudo}</p>
                          <p className={`text-xs mt-1 ${
                            mensagem.minha ? 'text-blue-100' : 'text-muted-foreground'
                          }`}>
                            {mensagem.hora}
                          </p>
                        </div>
                      </div>
                    ))}
                    {mensagens.length === 0 && (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                        Nenhuma mensagem enviada. Envie a primeira mensagem!
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && enviarMensagem()}
                      className="flex-1"
                    />
                    <Button onClick={enviarMensagem}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="h-full flex items-center justify-center flex-col text-muted-foreground">
              <MessageCircle className="h-16 w-16 mb-4 opacity-50" />
              <p>Selecione um contacto para iniciar a conversa.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}