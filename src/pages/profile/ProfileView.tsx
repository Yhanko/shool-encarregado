import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  User, Mail, Lock, Edit, Save, X, GraduationCap,
  Camera, Users, BookOpen, Bell, CheckCircle, AlertTriangle,
  Clock, Shield, School, BadgeCheck, Baby, Activity, TrendingUp, Eye, EyeOff
} from '../../lib/icons';
import { useParent } from '@/contexts/ParentContext';
import { useAuthStore } from '@/store/authStore';
import { parentService } from '@/services/api/parentService';
import { toast } from 'sonner';

export function ProfileView() {
  const { user, setUser } = useAuthStore();
  const { educandos, pagamentos, notificacoes, desempenhos } = useParent();

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [saveError, setSaveError] = useState('');

  // Derived stats from real data
  const totalPagamentosDevidos = pagamentos.filter(p => p.status === 'atrasado').length;
  const totalPagamentosPendes = pagamentos.filter(p => p.status === 'pendente').length;
  const totalPagamentosPagos = pagamentos.filter(p => p.status === 'pago').length;
  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida).length;

  // Average performance across all children
  const mediaGeral = desempenhos.length > 0
    ? Math.round((desempenhos.reduce((acc, d) => acc + d.mediaGeral, 0) / desempenhos.length) * 10) / 10
    : null;

  const initials = (user?.name || 'E')
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      const updatedUser = await parentService.updateProfile({ name: editedData.name, email: editedData.email });
      setUser({ ...user!, name: updatedUser.name, email: updatedUser.email });
      setIsEditing(false);
      toast.success('Perfil atualizado com sucesso!');
    } catch {
      setSaveError('Não foi possível guardar as alterações. Tente novamente.');
      toast.error('Erro ao atualizar o perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As palavras-passe não coincidem');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('A nova palavra-passe deve ter pelo menos 6 caracteres');
      return;
    }
    setIsChangingPwd(true);
    try {
      await parentService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Palavra-passe alterada com sucesso!');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Erro ao alterar palavra-passe. Verifique a palavra-passe atual.';
      toast.error(msg);
    } finally {
      setIsChangingPwd(false);
    }
  };

  const getPerformanceBadge = (media: number) => {
    if (media >= 16) return { label: 'Excelente', color: 'bg-green-100 text-green-700 border-green-200' };
    if (media >= 14) return { label: 'Muito Bom', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    if (media >= 10) return { label: 'Suficiente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    return { label: 'Necessita Atenção', color: 'bg-red-100 text-red-700 border-red-200' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="w-7 h-7 text-blue-600" />
            Perfil do Encarregado
          </h1>
          <p className="text-gray-500 text-sm mt-1">Informações pessoais e acompanhamento escolar</p>
        </div>
        <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50 px-3 py-1">
          <BadgeCheck className="w-4 h-4 mr-1" />
          Conta Verificada
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT COLUMN ── */}
        <div className="space-y-6 lg:col-span-1">

          {/* Avatar card */}
          <Card className="overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600" />
            <CardContent className="pt-0 pb-6 text-center">
              <div className="relative inline-block -mt-12 mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                  {initials}
                </div>
                <Button
                  size="sm"
                  className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 shadow"
                  variant="secondary"
                >
                  <Camera className="w-3 h-3" />
                </Button>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name || '—'}</h2>
              <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <Badge className="bg-blue-600 text-white text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Encarregado
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Educandos count card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-gray-700">
                <Users className="w-4 h-4 text-indigo-500" />
                Meus Educandos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {educandos.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-2">Nenhum educando associado</p>
              ) : (
                <div className="space-y-3">
                  {educandos.map(edu => {
                    const eduDesempenhos = desempenhos.filter(d => d.educandoId === edu.id);
                    const media = eduDesempenhos.length > 0
                      ? Math.round((eduDesempenhos.reduce((a, d) => a + d.mediaGeral, 0) / eduDesempenhos.length) * 10) / 10
                      : null;
                    const badge = media !== null ? getPerformanceBadge(media) : null;

                    return (
                      <div key={edu.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {edu.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{edu.nome}</p>
                          <p className="text-xs text-gray-500">{edu.turma}</p>
                        </div>
                        {badge && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badge.color}`}>
                            {media?.toFixed(1)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-gray-700">
                <Activity className="w-4 h-4 text-green-500" />
                Resumo da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-indigo-400" />
                  Educandos
                </div>
                <span className="font-semibold text-gray-900">{educandos.length}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Bell className="w-4 h-4 text-amber-400" />
                  Notificações por Ler
                </div>
                <span className={`font-semibold ${notificacoesNaoLidas > 0 ? 'text-amber-500' : 'text-gray-900'}`}>
                  {notificacoesNaoLidas}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Pagamentos Efetuados
                </div>
                <span className="font-semibold text-green-600">{totalPagamentosPagos}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Pagamentos Pendentes
                </div>
                <span className={`font-semibold ${totalPagamentosPendes > 0 ? 'text-blue-500' : 'text-gray-900'}`}>
                  {totalPagamentosPendes}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Pagamentos em Atraso
                </div>
                <span className={`font-semibold ${totalPagamentosDevidos > 0 ? 'text-red-500' : 'text-gray-900'}`}>
                  {totalPagamentosDevidos}
                </span>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Personal info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="w-5 h-5 text-blue-600" />
                  Informações Pessoais
                </CardTitle>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveProfile} disabled={isSaving}>
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? <span key="saving">A guardar...</span> : <span key="idle">Guardar</span>}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setSaveError(''); }}>
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {saveError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {saveError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      value={editedData.name}
                      onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-800">{user?.name || '—'}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editedData.email}
                      onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-800">{user?.email || '—'}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Perfil</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-800 capitalize">Encarregado de Educação</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Número de Filhos / Educandos</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <Baby className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-800">{educandos.length} educando{educandos.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Children detail cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="w-5 h-5 text-green-600" />
                Detalhes dos Educandos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {educandos.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Nenhum educando associado à sua conta</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {educandos.map((edu, idx) => {
                    const eduDesempenhos = desempenhos.filter(d => d.educandoId === edu.id);
                    const media = eduDesempenhos.length > 0
                      ? Math.round((eduDesempenhos.reduce((a, d) => a + d.mediaGeral, 0) / eduDesempenhos.length) * 10) / 10
                      : null;
                    const badge = media !== null ? getPerformanceBadge(media) : null;
                    const mediaFrequencia = eduDesempenhos.length > 0
                      ? Math.round(eduDesempenhos.reduce((a, d) => a + d.frequencia, 0) / eduDesempenhos.length)
                      : null;
                    const pagamentosAluno = pagamentos.filter(p => p.educandoId === edu.id);
                    const pagamentosAtrasados = pagamentosAluno.filter(p => p.status === 'atrasado').length;

                    const gradients = [
                      'from-blue-400 to-indigo-500',
                      'from-emerald-400 to-teal-500',
                      'from-orange-400 to-rose-500',
                      'from-violet-400 to-purple-500',
                    ];

                    return (
                      <div key={edu.id} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        {/* colored bar */}
                        <div className={`h-2 bg-gradient-to-r ${gradients[idx % gradients.length]}`} />
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradients[idx % gradients.length]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                                {edu.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{edu.nome}</h3>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <Badge variant="outline" className="text-xs">
                                    <School className="w-3 h-3 mr-1" />
                                    {edu.turma}
                                  </Badge>
                                  {edu.serie && (
                                    <Badge variant="outline" className="text-xs">
                                      {edu.serie}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            {badge && (
                              <span className={`text-xs px-3 py-1 rounded-full border font-semibold flex-shrink-0 ${badge.color}`}>
                                {badge.label}
                              </span>
                            )}
                          </div>

                          {/* stats row */}
                          <div className="grid grid-cols-3 gap-3 mt-4">
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                              <div className="flex items-center justify-center mb-1">
                                <BookOpen className="w-4 h-4 text-blue-500" />
                              </div>
                              <p className="text-xs text-gray-500">Disciplinas</p>
                              <p className="font-bold text-gray-900 text-sm">{edu.disciplinas.length}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                              <div className="flex items-center justify-center mb-1">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                              </div>
                              <p className="text-xs text-gray-500">Média Geral</p>
                              <p className={`font-bold text-sm ${media !== null && media >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                                {media !== null ? `${media} val.` : '—'}
                              </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                              <div className="flex items-center justify-center mb-1">
                                <Activity className="w-4 h-4 text-purple-500" />
                              </div>
                              <p className="text-xs text-gray-500">Frequência</p>
                              <p className={`font-bold text-sm ${mediaFrequencia !== null && mediaFrequencia >= 75 ? 'text-green-600' : 'text-red-500'}`}>
                                {mediaFrequencia !== null ? `${mediaFrequencia}%` : '—'}
                              </p>
                            </div>
                          </div>

                          {/* disciplines list */}
                          {edu.disciplinas.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs text-gray-500 mb-2">Disciplinas matriculadas:</p>
                              <div className="flex flex-wrap gap-1">
                                {edu.disciplinas.slice(0, 8).map(d => (
                                  <span key={d} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
                                    {d}
                                  </span>
                                ))}
                                {edu.disciplinas.length > 8 && (
                                  <span className="text-xs text-gray-400 px-2 py-0.5">+{edu.disciplinas.length - 8}</span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* financial alert if any late */}
                          {pagamentosAtrasados > 0 && (
                            <div className="mt-3 flex items-center gap-2 p-2 bg-red-50 border border-red-100 rounded-lg">
                              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                              <p className="text-xs text-red-700">
                                {pagamentosAtrasados} pagamento{pagamentosAtrasados > 1 ? 's' : ''} em atraso
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Global performance overview */}
          {mediaGeral !== null && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Desempenho Global dos Educandos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-3xl font-extrabold text-purple-700">{mediaGeral}</p>
                    <p className="text-xs text-purple-500 mt-1">Média Global</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-3xl font-extrabold text-green-700">{totalPagamentosPagos}</p>
                    <p className="text-xs text-green-500 mt-1">Pagamentos Ok</p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-3xl font-extrabold text-amber-700">{notificacoesNaoLidas}</p>
                    <p className="text-xs text-amber-500 mt-1">Notificações</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-3xl font-extrabold text-blue-700">{educandos.length}</p>
                    <p className="text-xs text-blue-500 mt-1">Educandos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock className="w-5 h-5 text-red-600" />
                Segurança da Conta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <h4 className="font-medium text-gray-900">Palavra-passe</h4>
                    <p className="text-sm text-gray-500">Altere regularmente para maior segurança</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Lock className="w-4 h-4 mr-2" />
                        Alterar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Alterar Palavra-passe</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Palavra-passe Atual</Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showPasswords.current ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            >
                              {showPasswords.current ? <EyeOff className="w-4 h-4 stroke-[2.5]" /> : <Eye className="w-4 h-4 stroke-[2.5]" />}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">Nova Palavra-passe</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showPasswords.new ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            >
                              {showPasswords.new ? <EyeOff className="w-4 h-4 stroke-[2.5]" /> : <Eye className="w-4 h-4 stroke-[2.5]" />}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirmar Nova Palavra-passe</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showPasswords.confirm ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            >
                              {showPasswords.confirm ? <EyeOff className="w-4 h-4 stroke-[2.5]" /> : <Eye className="w-4 h-4 stroke-[2.5]" />}
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button onClick={handleChangePassword} className="flex-1" disabled={isChangingPwd}>
                            {isChangingPwd ? <span key="changing">A alterar...</span> : <span key="idle">Alterar Palavra-passe</span>}
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <h4 className="font-medium text-gray-900">Sessão Ativa</h4>
                      <p className="text-sm text-gray-500">Autenticado com sucesso via token seguro</p>
                    </div>
                  </div>
                  <Badge className="bg-green-600 text-white">Ativo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}