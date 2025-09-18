import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/Logo";
import { 
  DollarSign, 
  Users, 
  TrendingUp,
  LogOut,
  Menu,
  User,
  Settings,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

const formatBRL = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);

const AdminDashboard = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Query 1: total de faturamento (somatório do total_sales dos influencers)
  const { data: influencers, isLoading: loadingInf, error: errorInf } = useQuery({
    queryKey: ["admin_total_revenue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("influencers")
        .select("total_sales");
      if (error) throw error;
      return (data ?? []) as { total_sales: number }[];
    },
  });

  // Query 2: comissões pagas (somatório de withdrawal_requests.amount com status='paid')
  const { data: withdrawalsPaid, isLoading: loadingPaid, error: errorPaid } = useQuery({
    queryKey: ["admin_total_commissions_paid"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("withdrawal_requests")
        .select("amount,status")
        .eq("status", "paid");
      if (error) throw error;
      return (data ?? []) as { amount: number; status: string }[];
    },
  });

  // Query 3: influencers ativos (vendas últimos 30 dias)
  const sinceISO = useMemo(() => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), []);
  const { data: recentSales, isLoading: loadingRecent, error: errorRecent } = useQuery({
    queryKey: ["admin_active_influencers", sinceISO],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("influencer_id,date")
        .gte("date", sinceISO);
      if (error) throw error;
      return (data ?? []) as { influencer_id: string; date: string }[];
    },
  });

  const totalRevenue = useMemo(() => {
    if (!influencers) return 0;
    return influencers.reduce((sum, r) => sum + (Number(r.total_sales) || 0), 0);
  }, [influencers]);

  const totalCommissionsPaid = useMemo(() => {
    if (!withdrawalsPaid) return 0;
    return withdrawalsPaid.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  }, [withdrawalsPaid]);

  const activeInfluencers = useMemo(() => {
    if (!recentSales) return 0;
    const ids = new Set<string>();
    for (const s of recentSales) ids.add(s.influencer_id);
    return ids.size;
  }, [recentSales]);

  const loading = loadingInf || loadingPaid || loadingRecent;
  const hasError = errorInf || errorPaid || errorRecent;

  const handleLogout = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-background relative">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_hsl(214_100%_60%_/_0.03)_0%,_transparent_50%)]"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-tech-blue-700/30 bg-gradient-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-2 flex justify-between items-center">
            <div className="flex items-center space-x-4">
                  <Logo className={isMobile ? "h-28 w-auto" : "h-40 w-auto"} />
              <Badge variant="outline" className="border-neon-purple text-neon-purple bg-neon-purple/10">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={`relative rounded-full ${isMobile ? 'h-10 w-10' : 'h-14 w-14'}`}>
                    <Avatar className={isMobile ? "h-10 w-10" : "h-14 w-14"}>
                    <AvatarImage src={"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"} alt={"Admin Sistema"} />
                    <AvatarFallback className="bg-neon-purple/20 text-neon-purple">AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 bg-gradient-card border-tech-blue-700/40" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3">
                        <Avatar className={isMobile ? "h-12 w-12" : "h-16 w-16"}>
                        <AvatarImage src={"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"} alt={"Admin Sistema"} />
                        <AvatarFallback className="bg-neon-purple/20 text-neon-purple">AD</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none text-foreground">
                          Painel Administrativo
                        </p>
                        <p className="text-xs leading-none text-tech-blue-300 mt-1">
                          Admin Sistema
                        </p>
                        <p className="text-xs leading-none text-tech-blue-400 mt-0.5">
                          admin@hiveofclicks.com
                        </p>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator className="bg-tech-blue-700/30" />
                
                <DropdownMenuItem className="focus:bg-tech-blue-800/30">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-tech-blue-700/30" />
                
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="container mx-auto px-4 py-4 md:py-8">
          {/* Welcome Section */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">
              Painel Administrativo
            </h1>
            <p className="text-tech-blue-300">
              Visão geral do sistema Hive of Clicks
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Faturamento Total (real) */}
            <Card className="bg-gradient-card border-tech-blue-700/40 shadow-glow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`font-medium text-tech-blue-300 ${isMobile ? 'text-sm' : 'text-base'}`}>
                  Faturamento Total
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-neon-cyan" />
              </CardHeader>
              <CardContent>
                <div className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                  {loading ? '—' : formatBRL(totalRevenue)}
                </div>
                <p className="text-sm text-tech-blue-400 mt-1">
                  Total de vendas realizadas
                </p>
                {hasError && (
                  <p className="text-xs text-red-400 mt-1">Erro ao carregar dados.</p>
                )}
              </CardContent>
            </Card>

            {/* Comissões Totais (pagas) */}
            <Card className="bg-gradient-card border-tech-blue-700/40 shadow-glow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`font-medium text-tech-blue-300 ${isMobile ? 'text-sm' : 'text-base'}`}>
                  Comissões Totais
                </CardTitle>
                <DollarSign className="h-5 w-5 text-neon-purple" />
              </CardHeader>
              <CardContent>
                <div className={`font-bold text-neon-purple ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                  {loading ? '—' : formatBRL(totalCommissionsPaid)}
                </div>
                <p className="text-sm text-tech-blue-400 mt-1">
                  Pagas aos influencers
                </p>
                {hasError && (
                  <p className="text-xs text-red-400 mt-1">Erro ao carregar dados.</p>
                )}
              </CardContent>
            </Card>

            {/* Influencers Ativos (últimos 30 dias) */}
            <Card className="bg-gradient-card border-tech-blue-700/40 shadow-glow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`font-medium text-tech-blue-300 ${isMobile ? 'text-sm' : 'text-base'}`}>
                  Influencers Ativos
                </CardTitle>
                <Users className="h-5 w-5 text-neon-blue" />
              </CardHeader>
              <CardContent>
                <div className={`font-bold text-neon-blue ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                  {loading ? '—' : activeInfluencers}
                </div>
                <p className="text-sm text-tech-blue-400 mt-1">
                  Com vendas no último mês
                </p>
                {hasError && (
                  <p className="text-xs text-red-400 mt-1">Erro ao carregar dados.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Navegação Admin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card className="bg-gradient-card border-tech-blue-700/40 shadow-glow">
              <CardHeader>
                <CardTitle className="text-foreground">Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-tech-blue-300 text-sm">
                  Gerencie solicitações de saque e confirme pagamentos.
                </p>
                <Button 
                  onClick={() => window.location.href = "/admin/financial"}
                  className="w-full bg-neon-blue hover:bg-neon-blue/80 text-white"
                >
                  Abrir Financeiro
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-tech-blue-700/40 shadow-glow">
              <CardHeader>
                <CardTitle className="text-foreground">Painel Influencers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-tech-blue-300 text-sm">
                  Cadastre, edite e acompanhe os influencers da plataforma.
                </p>
                <Button 
                  onClick={() => window.location.href = "/admin/influencers"}
                  className="w-full bg-neon-purple hover:bg-neon-purple/80 text-white"
                >
                  Gerenciar Influencers
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;