import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, GraduationCap, ArrowLeft } from "../lib/icons";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api/axios";
import axios from "axios";
export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Recovery State
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate(); 
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post("/auth/login", { email, password });
      
      const token = response.data.access_token;
      
      if (!token) {
        throw new Error("Token não recebido");
      }

      const userProfile = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = userProfile.data;
      
      // In this frontend we expect parents
      if (user.role !== 'PARENT') {
         toast.error("Acesso negado. Apenas para encarregados de educação.");
         return;
      }
      
      setToken(token);
      setUser(user);
      
      toast.success("Login efetuado com sucesso!");
      navigate("/dashboard");
    } catch (error: unknown) {
      console.error(error);
      const msg = axios.isAxiosError(error) ? error.response?.data?.message || "Erro ao efetuar login. Verifique as credenciais." : "Erro ao efetuar login. Verifique as credenciais.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Por favor, insira o seu email.");
      return;
    }

    try {
      setIsLoading(true);
      await api.post("/auth/verify-email", { email, role: 'PARENT' });
      setRecoveryStep(2);
      toast.success("Conta verificada. Insira a nova senha.");
    } catch (error: unknown) {
      console.error(error);
      const msg = axios.isAxiosError(error) ? error.response?.data?.message || "Erro ao verificar conta." : "Erro ao verificar conta.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setIsLoading(true);
      await api.post("/auth/reset-password", { email, role: 'PARENT', newPassword });
      toast.success("Senha alterada com sucesso! Faça login.");
      setIsRecovering(false);
      setRecoveryStep(1);
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      console.error(error);
      const msg = axios.isAxiosError(error) ? error.response?.data?.message || "Erro ao redefinir senha." : "Erro ao redefinir senha.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[100vw] min-h-screen flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
      </div>
      
      <Card className="w-full max-w-md relative z-10 shadow-lg border-border/50 backdrop-blur-sm bg-card/80">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-glow">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Gestão Escolar</CardTitle>
            <CardDescription className="mt-2">
              {isRecovering 
                ? (recoveryStep === 1 ? <span key="step1">Recuperação de conta</span> : <span key="step2">Definir nova senha</span>)
                : <span key="login-desc">Entre na sua conta para acessar o painel</span>
              }
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          {!isRecovering ? (
          <form key="login-form" className="space-y-4" onSubmit={handleEmailLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email-password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors bg-transparent border-0 border-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

            </div>
            
              <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 hover:cursor-pointer"
                  disabled={isLoading}
              >
                {isLoading ? <span key="loading">A entrar...</span> : <span key="idle">Entrar</span>}
              </Button>
          </form>
          ) : recoveryStep === 1 ? (
            <form key="verify-form" className="space-y-4" onSubmit={handleVerifyEmail}>
              <div className="space-y-2">
                <Label htmlFor="recovery-email">Email da Conta</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="recovery-email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 hover:cursor-pointer"
                  disabled={isLoading}
              >
                {isLoading ? <span key="loading">A verificar...</span> : <span key="idle">Verificar Conta</span>}
              </Button>
            </form>
          ) : (
            <form key="reset-form" className="space-y-4" onSubmit={handleResetPassword}>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors bg-transparent border-0 border-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 hover:cursor-pointer"
                  disabled={isLoading}
              >
                {isLoading ? <span key="loading">A redefinir...</span> : <span key="idle">Redefinir Senha</span>}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/50 pt-4">
          {!isRecovering ? (
            <Button key="forgot-btn" variant="link" className="text-sm text-blue-600 p-0" onClick={() => setIsRecovering(true)}>
              Esqueceu a sua senha?
            </Button>
          ) : (
            <Button key="back-btn" variant="link" className="text-sm text-muted-foreground flex items-center gap-1 p-0" onClick={() => { setIsRecovering(false); setRecoveryStep(1); }}>
              <ArrowLeft className="w-4 h-4" /> Voltar ao Login
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};