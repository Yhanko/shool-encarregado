import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "../lib/icons";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api/axios";
import axios from "axios";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres.")
});

const verifyEmailSchema = z.object({
  email: z.string().email("Email inválido.")
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres."),
  confirmPassword: z.string().min(6, "A confirmação da senha deve ter pelo menos 6 caracteres.")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
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
    setErrors({});

    const result = verifyEmailSchema.safeParse({ email });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
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
    setErrors({});

    const result = resetPasswordSchema.safeParse({ newPassword, confirmPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
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
      setErrors({});
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
          <div>
            <CardTitle className="text-2xl font-bold">Gestão Escolar</CardTitle>
            <CardDescription className="mt-2">
              {isRecovering
                ? (recoveryStep === 1 ? <span key="step1">Recuperação de conta</span> : <span key="step2">Definir nova senha</span>)
                : <span key="login-desc">Entre na sua conta de encarregado para acessar o portal</span>
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
                    className={cn("pl-10", errors.email ? "border-destructive focus-visible:ring-destructive" : "")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}

              </div>

              <div className="space-y-2">
                <Label htmlFor="email-password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={cn("pl-10 pr-10", errors.password ? "border-destructive focus-visible:ring-destructive" : "")}
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
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}

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
                    className={cn("pl-10", errors.email ? "border-destructive focus-visible:ring-destructive" : "")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
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
                    className={cn("pl-10 pr-10", errors.newPassword ? "border-destructive focus-visible:ring-destructive" : "")}
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
                {errors.newPassword && <p className="text-xs text-destructive mt-1">{errors.newPassword}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={cn("pl-10 pr-10", errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : "")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
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
            <Button key="forgot-btn" variant="link" className="text-sm text-blue-600 p-0" onClick={() => { setIsRecovering(true); setErrors({}); }}>
              Esqueceu a sua senha?
            </Button>
          ) : (
            <Button key="back-btn" variant="link" className="text-sm text-muted-foreground flex items-center gap-1 p-0" onClick={() => { setIsRecovering(false); setRecoveryStep(1); setErrors({}); }}>
              <ArrowLeft className="w-4 h-4" /> Voltar ao Login
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};