import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Logo from "@/components/Logo";
import { Crown, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { isAdminEmail } from "@/lib/adminAllowlist";

type UserRole = "admin" | "influencer";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("influencer");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({ title: "Erro", description: "Por favor, preencha todos os campos.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      if (selectedRole === "influencer") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Persistir um marcador simples do usuário atual (até criarmos um contexto auth)
        try {
          const user = data.user;
          if (user) {
            window.localStorage.setItem("current_influencer_id", user.id);
            window.localStorage.setItem("current_influencer_email", user.email ?? "");
          }
        } catch {
          // Ignore localStorage write errors (e.g., private mode)
        }
        toast({ title: "Login realizado", description: "Redirecionando...", duration: 2200 });
        navigate("/dashboard");
      } else {
        // Admin login: autentica e valida por allowlist de emails
        // Admin: também autentica no Supabase para que as policies (RLS) reconheçam o admin
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        try {
          const user = data.user;
          if (user) {
            window.localStorage.setItem("current_admin_email", user.email ?? "");
          }
        } catch {}
        toast({ title: "Login (Admin)", description: "Redirecionando para o painel admin..." });
        navigate("/admin");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: "Falha no login", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="w-full max-w-md mx-auto">
        <Card className="w-full bg-gradient-card border border-tech-blue-700/40 shadow-glow backdrop-blur-sm">
        <CardHeader className="text-center pb-1 pt-3 px-4">
          <div className="flex flex-col items-center justify-center space-y-0 sm:space-y-1">
            <div className="w-full flex justify-center">
              <Logo className="w-40 sm:w-44 md:w-48 h-auto object-contain" />
            </div>
            <h1 className="text-foreground/90 text-base sm:text-lg font-semibold tracking-wide">Login</h1>
            <p className="text-tech-blue-300 text-center text-xs">Sistema de Gestão de Afiliados</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-4 pb-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-tech-blue-200 font-medium text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="influencer01@canal.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-tech-blue-950/50 border border-tech-blue-700/50 text-foreground placeholder:text-tech-blue-400 focus:border-tech-blue-500 focus:ring-1 focus:ring-tech-blue-500 transition-colors h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-tech-blue-200 font-medium text-sm">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-tech-blue-950/50 border border-tech-blue-700/50 text-foreground placeholder:text-tech-blue-400 focus:border-tech-blue-500 focus:ring-1 focus:ring-tech-blue-500 transition-colors h-10"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-tech-blue-200 font-medium text-sm">Tipo de Usuário</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="neon"
                  className={`h-10 text-xs flex items-center justify-center gap-1 ${
                    selectedRole === "influencer" 
                      ? "ring-1 ring-tech-blue-500 bg-tech-blue-800/30" 
                      : ""
                  }`}
                  onClick={() => setSelectedRole("influencer")}
                >
                  <Users className="w-3 h-3" />
                  Influencer
                </Button>
                <Button
                  type="button"
                  variant="neon"
                  className={`h-10 text-xs flex items-center justify-center gap-1 ${
                    selectedRole === "admin" 
                      ? "ring-1 ring-tech-blue-500 bg-tech-blue-800/30" 
                      : ""
                  }`}
                  onClick={() => setSelectedRole("admin")}
                >
                  <Crown className="w-3 h-3" />
                  Admin
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              variant="hero"
              disabled={isLoading}
              className="w-full h-10 text-sm font-semibold mt-4"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default LoginForm;