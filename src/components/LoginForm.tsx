import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Crown, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UserRole = "admin" | "influencer";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("influencer");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    console.log("Login attempt:", { email, role: selectedRole });
    
    // Simula um delay de autenticação
    setTimeout(() => {
      if (selectedRole === "influencer") {
        toast({
          title: "Login realizado!",
          description: "Redirecionando para o dashboard...",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Login realizado!",
          description: "Redirecionando para o painel admin...",
        });
        navigate("/admin");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-3 sm:p-4">
      {/* Video Background */}
      <div className="fixed inset-0 w-full h-full overflow-hidden z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="https://i.imgur.com/SKNhnTL.mp4" type="video/mp4" />
        </video>
        {/* Overlay for better contrast */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full flex items-center justify-center">
      <Card className="w-full max-w-sm sm:max-w-md bg-gradient-card border border-tech-blue-700/40 shadow-glow backdrop-blur-sm mx-2">
        <CardHeader className="text-center pb-1 pt-3 px-4 sm:px-6">
          <div className="flex flex-col items-center justify-center space-y-0 sm:space-y-1">
            <div className="w-full flex justify-center">
              <img 
                src="/lovable-uploads/8e9f0a3d-8f2c-41c2-987b-ee15fd7d5b96.png" 
                alt="Hive of Clicks Logo" 
                className="w-56 sm:w-72 h-auto object-contain"
              />
            </div>
            <p className="text-tech-blue-300 text-center text-xs sm:text-sm">Sistema de Gestão de Afiliados</p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
                className="bg-tech-blue-950/50 border border-tech-blue-700/50 text-foreground placeholder:text-tech-blue-400 focus:border-tech-blue-500 focus:ring-1 focus:ring-tech-blue-500 transition-colors h-10 sm:h-11 text-sm sm:text-base"
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
                className="bg-tech-blue-950/50 border border-tech-blue-700/50 text-foreground placeholder:text-tech-blue-400 focus:border-tech-blue-500 focus:ring-1 focus:ring-tech-blue-500 transition-colors h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-tech-blue-200 font-medium text-sm">Tipo de Usuário</Label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Button
                  type="button"
                  variant="neon"
                  className={`h-10 sm:h-12 text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 ${
                    selectedRole === "influencer" 
                      ? "ring-1 ring-tech-blue-500 bg-tech-blue-800/30" 
                      : ""
                  }`}
                  onClick={() => setSelectedRole("influencer")}
                >
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  Influencer
                </Button>
                <Button
                  type="button"
                  variant="neon"
                  className={`h-10 sm:h-12 text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 ${
                    selectedRole === "admin" 
                      ? "ring-1 ring-tech-blue-500 bg-tech-blue-800/30" 
                      : ""
                  }`}
                  onClick={() => setSelectedRole("admin")}
                >
                  <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                  Admin
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              variant="hero"
              size="lg"
              disabled={isLoading}
              className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold mt-6"
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