import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CreditCard,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Receipt,
  Smartphone,
  Building2
} from '../../lib/icons';
import { useParent } from '@/contexts/ParentContext';
import { Pagamento } from '@/types';
import { z } from "zod";
import { cn } from "@/lib/utils";

const pagamentoSchema = z.object({
  metodoPagamento: z.enum(['multicaixa', 'transferencia', 'dinheiro'], { 
    errorMap: () => ({ message: "Selecione um método válido." }) 
  }),
  file: z.any().nullable()
}).superRefine((data, ctx) => {
  if (data.metodoPagamento !== 'dinheiro' && !data.file) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "O comprovativo é obrigatório para este método.",
      path: ["file"]
    });
  }
});

export function Pagamentos() {
  const { pagamentos, educandos } = useParent();
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroEducando, setFiltroEducando] = useState<string>('todos');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago': return CheckCircle;
      case 'processamento': return Clock;
      case 'pendente': return Clock;
      case 'atrasado': return AlertTriangle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'success';
      case 'processamento': return 'default';
      case 'pendente': return 'secondary';
      case 'atrasado': return 'destructive';
      default: return 'secondary';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'propina': return 'Propina';
      case 'matricula': return 'Matrícula';
      case 'confirmacao': return 'Confirmação';
      case 'material': return 'Material Escolar';
      case 'uniforme': return 'Uniforme';
      default: return tipo;
    }
  };

  const pagamentosFiltrados = pagamentos.filter(pagamento => {
    const matchesStatus = filtroStatus === 'todos' || pagamento.status === filtroStatus;
    const matchesEducando = filtroEducando === 'todos' || pagamento.educandoId === filtroEducando;
    return matchesStatus && matchesEducando;
  });

  const totalPago = pagamentos.filter(p => p.status === 'pago').reduce((acc, p) => acc + p.valor, 0);
  const totalProcessamento = pagamentos.filter(p => p.status === 'processamento').reduce((acc, p) => acc + p.valor, 0);
  const totalPendente = pagamentos.filter(p => p.status === 'pendente').reduce((acc, p) => acc + p.valor, 0);
  const totalAtrasado = pagamentos.filter(p => p.status === 'atrasado').reduce((acc, p) => acc + p.valor, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <CreditCard className="mr-3 h-8 w-8" />
            Pagamentos
          </h1>
          <p className="text-muted-foreground">Gerencie os pagamentos dos seus educandos</p>
        </div>
        <NovoPagamentoDialog />
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalPago.toLocaleString()} Kz
            </div>
            <p className="text-xs text-muted-foreground">
              {pagamentos.filter(p => p.status === 'pago').length} pagamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processamento</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalProcessamento.toLocaleString()} Kz
            </div>
            <p className="text-xs text-muted-foreground">
              {pagamentos.filter(p => p.status === 'processamento').length} pagamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {totalPendente.toLocaleString()} Kz
            </div>
            <p className="text-xs text-muted-foreground">
              {pagamentos.filter(p => p.status === 'pendente').length} pagamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Atraso</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalAtrasado.toLocaleString()} Kz
            </div>
            <p className="text-xs text-muted-foreground">
              {pagamentos.filter(p => p.status === 'atrasado').length} pagamentos
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="lista" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lista">Lista de Pagamentos</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="status">Filtrar por Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="atrasado">Em Atraso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="educando">Filtrar por Educando</Label>
              <Select value={filtroEducando} onValueChange={setFiltroEducando}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os educandos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os educandos</SelectItem>
                  {educandos.map(educando => (
                    <SelectItem key={educando.id} value={educando.id}>
                      {educando.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabela de Pagamentos */}
          <Card>
            <CardHeader>
              <CardTitle>Pagamentos</CardTitle>
              <CardDescription>Lista completa de todos os pagamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Educando</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagamentosFiltrados.map((pagamento) => {
                      const educando = educandos.find(e => e.id === pagamento.educandoId);
                      const StatusIcon = getStatusIcon(pagamento.status);
                      
                      return (
                        <TableRow key={pagamento.id}>
                          <TableCell>
                            <div className="font-medium">{educando?.nome}</div>
                            <div className="text-sm text-muted-foreground">{educando?.turma}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getTipoLabel(pagamento.tipo)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {pagamento.mes ? `${pagamento.mes}/${pagamento.ano}` : pagamento.ano}
                          </TableCell>
                          <TableCell className="font-medium">
                            {pagamento.valor.toLocaleString()} Kz
                          </TableCell>
                          <TableCell>
                            {new Date(pagamento.dataVencimento).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(pagamento.status)} className="flex items-center w-fit">
                              <StatusIcon className="mr-1 h-3 w-3" />
                              <span className="capitalize">{pagamento.status === 'processamento' ? 'Em Análise' : pagamento.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {pagamento.status === 'pago' && pagamento.recibo && (
                                <Button variant="outline" size="sm" onClick={() => window.open(pagamento.recibo, '_blank')} title="Baixar Recibo">
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                              {(pagamento.status === 'pendente' || pagamento.status === 'atrasado') && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" onClick={() => {/* Lógica futura de pagamento */}}>Pagar</Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Realizar Pagamento</DialogTitle>
                                      <DialogDescription>
                                        {getTipoLabel(pagamento.tipo)} - {educando?.nome}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <FormularioPagamento pagamento={pagamento} />
                                  </DialogContent>
                                </Dialog>
                              )}
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

        <TabsContent value="realizar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Realizar Pagamento
              </CardTitle>
              <CardDescription>
                Selecione um pagamento pendente para realizar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pagamentos
                  .filter(p => p.status === 'pendente' || p.status === 'atrasado')
                  .map((pagamento) => {
                    const educando = educandos.find(e => e.id === pagamento.educandoId);
                    const StatusIcon = getStatusIcon(pagamento.status);
                    
                    return (
                      <Card key={pagamento.id} className="border-2">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{getTipoLabel(pagamento.tipo)}</CardTitle>
                            <Badge variant={getStatusColor(pagamento.status)}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              <span className="capitalize">{pagamento.status === 'processamento' ? 'Em Análise' : pagamento.status}</span>
                            </Badge>
                          </div>
                          <CardDescription>{educando?.nome} - {educando?.turma}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Valor:</span>
                              <span className="font-bold text-lg">{pagamento.valor.toLocaleString()} Kz</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Vencimento:</span>
                              <span className={`text-sm ${pagamento.status === 'atrasado' ? 'text-red-600 font-medium' : ''}`}>
                                {new Date(pagamento.dataVencimento).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            {pagamento.mes && (
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Período:</span>
                                <span className="text-sm">{pagamento.mes}/{pagamento.ano}</span>
                              </div>
                            )}
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button className="w-full mt-4">
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Pagar Agora
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Realizar Pagamento</DialogTitle>
                                  <DialogDescription>
                                    {getTipoLabel(pagamento.tipo)} - {educando?.nome}
                                  </DialogDescription>
                                </DialogHeader>
                                <FormularioPagamento pagamento={pagamento} />
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardContent>
                      </Card>
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
                <Receipt className="mr-2 h-5 w-5" />
                Histórico de Pagamentos
              </CardTitle>
              <CardDescription>Todos os pagamentos realizados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pagamentos
                  .filter(p => p.status === 'pago')
                  .sort((a, b) => new Date(b.dataPagamento!).getTime() - new Date(a.dataPagamento!).getTime())
                  .map((pagamento) => {
                    const educando = educandos.find(e => e.id === pagamento.educandoId);
                    
                    return (
                      <div key={pagamento.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-green-100 rounded-full">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{getTipoLabel(pagamento.tipo)}</h3>
                            <p className="text-sm text-muted-foreground">
                              {educando?.nome} - {pagamento.mes ? `${pagamento.mes}/${pagamento.ano}` : pagamento.ano}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Pago em: {new Date(pagamento.dataPagamento!).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{pagamento.valor.toLocaleString()} Kz</p>
                          <p className="text-xs text-muted-foreground">{pagamento.metodoPagamento}</p>
                          {pagamento.recibo && (
                            <Button variant="outline" size="sm" className="mt-2" onClick={() => window.open(pagamento.recibo, '_blank')}>
                              <Download className="mr-2 h-4 w-4" />
                              Recibo
                            </Button>
                          )}
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

function NovoPagamentoDialog() {
  const { educandos, createPayment, submitPaymentProof, instituicao } = useParent();
  const [isOpen, setIsOpen] = useState(false);
  const [tipo, setTipo] = useState('');
  const [educandoId, setEducandoId] = useState('');
  const [valor, setValor] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    setErrors({});
    const newErrors: Record<string, string> = {};
    if (!tipo) newErrors.tipo = "Selecione o tipo de pagamento.";
    if (!educandoId) newErrors.educandoId = "Selecione o educando.";
    if (!valor || isNaN(Number(valor)) || Number(valor) <= 0) newErrors.valor = "Introduza um valor válido.";
    if (!metodoPagamento) newErrors.metodoPagamento = "Selecione o método de pagamento.";
    if (metodoPagamento !== 'dinheiro' && !file) newErrors.file = "Anexe o comprovativo.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      let proofUrl = '';
      if (file) {
         const { parentService } = await import('@/services/api/parentService');
         const uploadResult = await parentService.uploadPaymentProof(file);
         proofUrl = uploadResult?.url || uploadResult?.path || uploadResult;
      }
      
      const paymentData = {
        type: tipo === 'propina' ? 'tuition' : tipo === 'matricula' ? 'enrollment' : 'fee',
        amount: Number(valor),
        studentId: educandoId,
        description: tipo,
      };

      const createdPayment = await createPayment(paymentData);
      
      if (proofUrl && createdPayment && createdPayment.id) {
         await submitPaymentProof(createdPayment.id, proofUrl, metodoPagamento);
      }

      setIsOpen(false);
      
      // Reset
      setTipo(''); setEducandoId(''); setValor(''); setMetodoPagamento(''); setFile(null);
    } catch (error) {
      console.error("Erro ao criar pagamento:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <CreditCard className="mr-2 h-4 w-4" />
          Novo Pagamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Pagamento</DialogTitle>
          <DialogDescription>Crie um novo pagamento para o seu educando.</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Educando</Label>
            <Select value={educandoId} onValueChange={(val) => {setEducandoId(val); setErrors(p => ({...p, educandoId: ''}))}}>
              <SelectTrigger className={errors.educandoId ? "border-destructive" : ""}>
                <SelectValue placeholder="Selecione o educando" />
              </SelectTrigger>
              <SelectContent>
                {educandos.map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.educandoId && <p className="text-xs text-destructive">{errors.educandoId}</p>}
          </div>

          <div className="space-y-2">
            <Label>O que está a pagar?</Label>
            <Select value={tipo} onValueChange={(val) => {setTipo(val); setErrors(p => ({...p, tipo: ''}))}}>
              <SelectTrigger className={errors.tipo ? "border-destructive" : ""}>
                <SelectValue placeholder="Selecione o que vai pagar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="propina">Propina</SelectItem>
                <SelectItem value="matricula">Matrícula</SelectItem>
                <SelectItem value="confirmacao">Confirmação</SelectItem>
                <SelectItem value="material">Material Escolar</SelectItem>
                <SelectItem value="uniforme">Uniforme</SelectItem>
                <SelectItem value="bata">Bata</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo && <p className="text-xs text-destructive">{errors.tipo}</p>}
          </div>

          <div className="space-y-2">
            <Label>Valor (Kz)</Label>
            <Input 
              type="number" 
              placeholder="Ex: 15000" 
              value={valor}
              onChange={(e) => {setValor(e.target.value); setErrors(p => ({...p, valor: ''}))}}
              className={errors.valor ? "border-destructive" : ""}
            />
            {errors.valor && <p className="text-xs text-destructive">{errors.valor}</p>}
          </div>

          <div className="space-y-2">
            <Label>Método de Pagamento</Label>
            <Select value={metodoPagamento} onValueChange={(val) => {setMetodoPagamento(val); setErrors(p => ({...p, metodoPagamento: '', file: ''}))}}>
              <SelectTrigger className={errors.metodoPagamento ? "border-destructive" : ""}>
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multicaixa"><div className="flex items-center"><Smartphone className="mr-2 h-4 w-4" />Multicaixa Express</div></SelectItem>
                <SelectItem value="transferencia"><div className="flex items-center"><Building2 className="mr-2 h-4 w-4" />Transferência Bancária</div></SelectItem>
                <SelectItem value="dinheiro"><div className="flex items-center"><DollarSign className="mr-2 h-4 w-4" />Dinheiro (Presencial)</div></SelectItem>
              </SelectContent>
            </Select>
            {errors.metodoPagamento && <p className="text-xs text-destructive">{errors.metodoPagamento}</p>}
          </div>

          {metodoPagamento === 'multicaixa' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Multicaixa Express</h4>
              <p className="text-sm text-blue-700 mb-3">Ref: {instituicao?.paymentReference || 'MC-12345678'}</p>
              <input type="file" className={cn("w-full text-sm", errors.file ? "border-destructive" : "")} onChange={(e) => {setFile(e.target.files?.[0] || null); setErrors(p => ({...p, file: ''}))}} />
              {errors.file && <p className="text-xs text-destructive mt-1">{errors.file}</p>}
            </div>
          )}

          {metodoPagamento === 'transferencia' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Transferência Bancária</h4>
              <p className="text-sm text-green-700 mb-1">IBAN: {instituicao?.iban || 'AO06 0040 0000 1234 5678 1011 2'}</p>
              <input type="file" className={cn("w-full text-sm mt-2", errors.file ? "border-destructive" : "")} onChange={(e) => {setFile(e.target.files?.[0] || null); setErrors(p => ({...p, file: ''}))}} />
              {errors.file && <p className="text-xs text-destructive mt-1">{errors.file}</p>}
            </div>
          )}

          <Button className="w-full mt-4" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Processando...' : 'Confirmar e Enviar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FormularioPagamento({ pagamento, onSuccess }: { pagamento: Pagamento, onSuccess?: () => void }) {
  const { educandos, submitPaymentProof, instituicao } = useParent();
  const [metodoPagamento, setMetodoPagamento] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const educando = educandos.find(e => e.id === pagamento.educandoId);

  const handleSubmit = async () => {
    setErrors({});
    
    const result = pagamentoSchema.safeParse({ 
      metodoPagamento: metodoPagamento || undefined, 
      file 
    });
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      let proofUrl = '';
      if (file) {
         const { parentService } = await import('@/services/api/parentService');
         const uploadResult = await parentService.uploadPaymentProof(file);
         proofUrl = uploadResult?.url || uploadResult?.path || uploadResult;
      }
      
      await submitPaymentProof(pagamento.id, proofUrl, metodoPagamento);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">Detalhes do Pagamento</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Educando:</span>
            <span className="font-medium">{educando?.nome}</span>
          </div>
          <div className="flex justify-between">
            <span>Tipo:</span>
            <span className="font-medium">{pagamento.tipo}</span>
          </div>
          <div className="flex justify-between">
            <span>Valor:</span>
            <span className="font-bold text-lg">{pagamento.valor.toLocaleString()} Kz</span>
          </div>
          {pagamento.mes && (
            <div className="flex justify-between">
              <span>Período:</span>
              <span className="font-medium">{pagamento.mes}/{pagamento.ano}</span>
            </div>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="metodo">Método de Pagamento</Label>
        <Select value={metodoPagamento} onValueChange={(val) => {setMetodoPagamento(val); setErrors(prev => ({...prev, metodoPagamento: '', file: ''}))}}>
          <SelectTrigger className={cn(errors.metodoPagamento ? "border-destructive focus:ring-destructive" : "")}>
            <SelectValue placeholder="Selecione o método" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multicaixa">
              <div className="flex items-center">
                <Smartphone className="mr-2 h-4 w-4" />
                Multicaixa Express
              </div>
            </SelectItem>
            <SelectItem value="transferencia">
              <div className="flex items-center">
                <Building2 className="mr-2 h-4 w-4" />
                Transferência Bancária
              </div>
            </SelectItem>
            <SelectItem value="dinheiro">
              <div className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4" />
                Dinheiro (Presencial)
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {errors.metodoPagamento && <p className="text-xs text-destructive mt-1">{errors.metodoPagamento}</p>}
      </div>

      {metodoPagamento === 'multicaixa' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Pagamento via Multicaixa</h4>
          <p className="text-sm text-blue-700 mb-3">
            Use o código abaixo no seu Multicaixa Express e anexe o comprovativo.
          </p>
          <div className="bg-white p-3 rounded border text-center mb-3">
            <span className="font-mono text-lg font-bold">MC-{pagamento.id.toUpperCase().substring(0, 8)}</span>
          </div>
          <Label htmlFor="comprovativo-mc">Anexar Comprovativo</Label>
          <input 
            id="comprovativo-mc" 
            type="file" 
            className={cn("w-full mt-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100", errors.file ? "p-1 rounded border border-destructive" : "")} 
            onChange={(e) => {setFile(e.target.files?.[0] || null); setErrors(prev => ({...prev, file: ''}))}}
          />
          {errors.file && <p className="text-xs text-destructive mt-1">{errors.file}</p>}
        </div>
      )}

      {metodoPagamento === 'transferencia' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">Dados para Transferência</h4>
          <div className="space-y-2 text-sm mb-3">
            <div><strong>Banco:</strong> {instituicao?.bankName || 'BAI'}</div>
            <div><strong>IBAN:</strong> {instituicao?.iban || 'AO06 0040 0000 1234 5678 1011 2'}</div>
            <div><strong>Titular:</strong> {instituicao?.name || instituicao?.accountHolder || 'Escola Internacional de Luanda'}</div>
            <div><strong>Referência:</strong> {pagamento.id.toUpperCase().substring(0, 8)}</div>
          </div>
          <Label htmlFor="comprovativo-tr">Anexar Comprovativo</Label>
          <input 
            id="comprovativo-tr" 
            type="file" 
            className={cn("w-full mt-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100", errors.file ? "p-1 rounded border border-destructive" : "")}
            onChange={(e) => {setFile(e.target.files?.[0] || null); setErrors(prev => ({...prev, file: ''}))}}
          />
          {errors.file && <p className="text-xs text-destructive mt-1">{errors.file}</p>}
        </div>
      )}

      <div className="flex space-x-2 pt-4">
        <Button 
          className="flex-1" 
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Processando...' : (
             <>
               <CreditCard className="mr-2 h-4 w-4" />
               Confirmar Pagamento
             </>
          )}
        </Button>
      </div>
    </div>
  );
}