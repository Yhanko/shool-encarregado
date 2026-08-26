import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Educando, Pagamento, Notificacao, AtividadeEscolar, Nota, DesempenhoEducando } from '@/types';
import { parentService } from '@/services/api/parentService';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

interface ParentContextType {
  educandos: Educando[];
  pagamentos: Pagamento[];
  notificacoes: Notificacao[];
  atividades: AtividadeEscolar[];
  desempenhos: DesempenhoEducando[];
  mensagensNaoLidas: any[];
  instituicao: any;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  submitPaymentProof: (id: string, proofUrl: string, method: string) => Promise<void>;
  markChatAsRead: (userId: string) => Promise<void>;
  fetchUnreadMessages: () => Promise<void>;
  createPayment: (data: any) => Promise<any>;
  fetchParentData: () => Promise<void>;
}

const ParentContext = createContext<ParentContextType | undefined>(undefined);

export function ParentProvider({ children }: { children: ReactNode }) {
  const [educandos, setEducandos] = useState<Educando[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [atividades, setAtividades] = useState<AtividadeEscolar[]>([]);
  const [desempenhos, setDesempenhos] = useState<DesempenhoEducando[]>([]);
  const [mensagensNaoLidas, setMensagensNaoLidas] = useState<any[]>([]);
  const [instituicao, setInstituicao] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);

  const fetchParentData = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // 1. Fetch parent profile (includes children)
      const profile = await parentService.getProfile();
      setUser({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role || 'parent',
        institutionId: profile.institutionId || '',
        avatar: profile.avatar || ''
      });
      
      const rawChildren = profile.children || [];
      const allEducandos: Educando[] = [];
      const allPagamentos: Pagamento[] = [];
      
      // 2. Iterate through each child to fetch grades, payments and attendance
      for (const child of rawChildren) {
        const classId = child.classes && child.classes.length > 0 ? child.classes[0].id : '';
        
        let rawGrades = [];
        let rawAttendance = [];
        if (classId) {
           rawGrades = await parentService.getStudentGrades(child.id, classId);
           rawAttendance = await parentService.getStudentAttendance(child.id, classId);
        }
        const rawPayments = await parentService.getStudentPayments(child.id);

        // Map Grades to Frontend Nota
        const notas: Nota[] = rawGrades.map((g: any) => ({
          id: g.id,
          educandoId: child.id,
          disciplina: g.subject?.name || 'Disciplina',
          valor: g.value,
          trimestre: g.term === 'first' ? 1 : g.term === 'second' ? 2 : 3,
          tipo: g.type === 'test' ? 'teste' : g.type === 'assignment' ? 'trabalho' : 'avaliacao',
          data: g.createdAt,
          professorId: g.teacherId,
          professorNome: g.teacher?.name || 'Não atribuído',
          observacaoProfessor: g.description || g.observation
        }));

        const disciplinas = Array.from(new Set(notas.map(n => n.disciplina)));

        // Construct Educando
        allEducandos.push({
          id: child.id,
          nome: child.name,
          turma: child.classes?.[0]?.name || 'Sem Turma',
          serie: child.classes?.[0]?.period || 'Sem Período',
          ano: new Date().getFullYear(),
          avatar: '', 
          encarregadoId: profile.id,
          disciplinas, 
          notas,
        });

        // Compute Desempenhos per discipline
        disciplinas.forEach(disciplina => {
           const notasDisciplina = notas.filter(n => n.disciplina === disciplina);
           const soma = notasDisciplina.reduce((acc, n) => acc + n.valor, 0);
           const mediaGeral = notasDisciplina.length > 0 ? Math.round((soma / notasDisciplina.length) * 10) / 10 : 0;
           
           // Compute Frequencia
           // Total records
           const attendanceRecords = rawAttendance.filter((a: any) => a.subject?.name === disciplina || !a.subjectId);
           const presentRecords = attendanceRecords.filter((a: any) => a.status === 'present' || a.status === 'late').length;
           const frequencia = attendanceRecords.length > 0 ? Math.round((presentRecords / attendanceRecords.length) * 100) : 100;

           const pontosFortes: string[] = [];
           const pontosFracos: string[] = [];
           const observacoes = notasDisciplina
             .map(n => n.observacaoProfessor)
             .filter(Boolean) as string[];

           setDesempenhos(prev => {
             const exist = prev.find(p => p.educandoId === child.id && p.disciplina === disciplina);
             if (exist) return prev;
             return [...prev, {
               educandoId: child.id,
               disciplina,
               mediaGeral,
               mediaT1: 0,
               mediaT2: 0,
               mediaT3: 0,
               frequencia,
               pontosFortes,
               pontosFracos,
               observacoes
             }];
           });
        });

        // Map Payments
        rawPayments.forEach((p: any) => {
           allPagamentos.push({
              id: p.id,
              tipo: p.type === 'enrollment' ? 'matricula' : p.type === 'tuition' ? 'propina' : 'confirmacao',
              valor: p.amount,
              mes: new Date(p.createdAt).toLocaleString('pt-PT', { month: 'long' }),
              ano: new Date(p.createdAt).getFullYear(),
              dataVencimento: p.createdAt,
              dataPagamento: p.paymentDate,
              status: ['paid', 'confirmed', 'pago'].includes(p.status?.toLowerCase()) ? 'pago' : 
                      ['processing', 'processamento'].includes(p.status?.toLowerCase()) ? 'processamento' : 
                      ['pending', 'pendente'].includes(p.status?.toLowerCase()) ? 'pendente' : 
                      ['cancelled', 'cancelado'].includes(p.status?.toLowerCase()) ? 'cancelado' : 'atrasado',
              recibo: p.proofUrl || p.receiptUrl || p.recibo,
              metodoPagamento: p.paymentMethod,
              educandoId: child.id,
           });
           // We are mapping processing to pendente in frontend for backward compatibility, but we can map processing -> processing if type supports it. Wait, the frontend type supports: 'pendente' | 'pago' | 'atrasado' | 'cancelado'. Wait, let's map 'processing' -> 'pendente' but maybe add processing later. 
        });
      }

      setEducandos(allEducandos);
      setPagamentos(allPagamentos);

      // 3. Fetch global events, notifications, unread messages and institution info
      const [rawEvents, rawNotifications, rawUnreadMessages, rawInstituicao] = await Promise.all([
         parentService.getEvents(),
         parentService.getNotifications(),
         parentService.getUnreadMessages(),
         parentService.getInstitutionInfo()
      ]);

      setInstituicao(rawInstituicao);

      const formattedAtividades = rawEvents.map((e: any) => {
        const dateObj = new Date(e.date);
        const horario = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return {
          id: e.id,
          titulo: e.title,
          descricao: e.description,
          data: e.date,
          tipo: e.type === 'escolar' ? 'escolar' : 'extraescolar',
          turmasParticipantes: e.classes ? e.classes.map((c: any) => c.name) : [],
          local: e.location,
          horario: horario !== '00:00' ? horario : 'Dia inteiro'
        };
      });
      setAtividades(formattedAtividades);

      const formattedNotificacoes = rawNotifications.map((n: any) => ({
         id: n.id,
         titulo: n.title,
         conteudo: n.description,
         tipo: n.type || 'geral',
         data: n.createdAt,
         lida: n.isRead,
         importante: n.priority === 'high',
         educandoId: n.relatedStudentId
      }));
      setNotificacoes(formattedNotificacoes);
      setMensagensNaoLidas(rawUnreadMessages || []);

    } catch (error) {
      console.error("Erro ao carregar dados do Encarregado", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadMessages = async () => {
    if (!token) return;
    try {
      const unread = await parentService.getUnreadMessages();
      setMensagensNaoLidas(unread || []);
    } catch (error) {
      console.error("Erro ao carregar mensagens não lidas", error);
    }
  };

  useEffect(() => {
    fetchParentData();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      fetchUnreadMessages();
    }, 10000);
    return () => clearInterval(interval);
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const markAsRead = async (id: string) => {
    try {
      await parentService.markNotificationAsRead(id);
      setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
    } catch (error) {
      console.error("Erro ao marcar notificação como lida", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await parentService.markAllNotificationsAsRead();
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
    } catch (error) {
      console.error("Erro ao marcar todas notificações como lidas", error);
    }
  };

  const markChatAsRead = async (userId: string) => {
    try {
      await parentService.markConversationAsRead(userId);
      setMensagensNaoLidas(prev => prev.filter(m => m.senderId !== userId));
    } catch (error) {
      console.error("Erro ao marcar conversa como lida", error);
    }
  };

  const submitPaymentProof = async (id: string, proofUrl: string, method: string) => {
    try {
      await parentService.submitPaymentProof(id, proofUrl, method);
      setPagamentos(prev => prev.map(p => p.id === id ? { ...p, status: 'processamento', recibo: proofUrl, metodoPagamento: method } : p));
    } catch (error) {
      console.error("Erro ao enviar comprovativo", error);
      throw error;
    }
  };

  const createPayment = async (data: any) => {
    try {
      const response = await parentService.createPayment(data);
      await fetchParentData();
      return response;
    } catch (error) {
      console.error("Erro ao criar pagamento", error);
      throw error;
    }
  };

  return (
    <ParentContext.Provider value={{ 
      educandos, 
      pagamentos, 
      notificacoes, 
      atividades,
      desempenhos,
      mensagensNaoLidas,
      instituicao,
      isLoading,
      markAsRead,
      markAllAsRead,
      submitPaymentProof,
      markChatAsRead,
      fetchUnreadMessages,
      createPayment,
      fetchParentData
    }}>
      {children}
    </ParentContext.Provider>
  );
}

export function useParent() {
  const context = useContext(ParentContext);
  if (context === undefined) {
    throw new Error('useParent must be used within a ParentProvider');
  }
  return context;
}
