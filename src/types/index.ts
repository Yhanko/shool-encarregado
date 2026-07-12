export interface Encarregado {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  relacao: string;
  avatar?: string;
  educandos: string[];
}

export interface Educando {
  id: string;
  nome: string;
  turma: string;
  serie: string;
  ano: number;
  avatar?: string;
  notas: Nota[];
  disciplinas: string[];
  encarregadoId: string;
}

export interface Nota {
  id: string;
  educandoId: string;
  disciplina: string;
  valor: number;
  trimestre: number;
  tipo: 'avaliacao' | 'teste' | 'trabalho';
  data: string;
  professorId: string;
  professorNome: string;
  observacaoProfessor?: string;
}

export interface Pagamento {
  id: string;
  tipo: 'propina' | 'matricula' | 'confirmacao' | 'material' | 'uniforme';
  valor: number;
  mes?: string;
  ano: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado' | 'processamento';
  educandoId: string;
  recibo?: string;
  metodoPagamento?: string;
}

export interface Professor {
  id: string;
  nome: string;
  email: string;
  disciplinas: string[];
  avatar?: string;
}

export interface Mensagem {
  id: string;
  remetenteId: string;
  remetenteTipo: 'encarregado' | 'professor' | 'escola';
  destinatarioId: string;
  conteudo: string;
  data: string;
  lida: boolean;
  assunto?: string;
}

export interface Notificacao {
  id: string;
  titulo: string;
  conteudo: string;
  tipo: 'pagamento' | 'atividade' | 'nota' | 'reuniao' | 'geral';
  data: string;
  lida: boolean;
  importante: boolean;
  educandoId?: string;
}

export interface AtividadeEscolar {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  tipo: 'escolar' | 'extraescolar';
  turmasParticipantes: string[];
  local?: string;
  horario?: string;
}

export interface DesempenhoEducando {
  educandoId: string;
  disciplina: string;
  mediaGeral: number;
  mediaT1: number;
  mediaT2: number;
  mediaT3: number;
  frequencia: number;
  observacoes: string[];
  pontosFracos: string[];
  pontosFortes: string[];
}