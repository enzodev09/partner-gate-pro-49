import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  TrendingUp, 
  DollarSign, 
  MousePointer, 
  Users, 
  Copy, 
  Check,
  LogOut,
  Calendar,
  Eye,
  Mail,
  MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
// Recharts removed (chart no longer shown)
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient"; // Import supabase client
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type InfluencerRow = {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  affiliate_link: string | null;
  total_sales: number;
  total_commissions: number;
  total_clicks: number;
  total_sales_count: number;
  pending_payment: number;
};

type SaleRow = {
  id: string;
  product: string;
  customer: string;
  value: number;
  commission: number;
  date: string;
};

const InfluencerDashboard = () => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  const currentId = typeof window !== 'undefined' ? window.localStorage.getItem("current_influencer_id") : null;

  const { data: me } = useQuery({
    queryKey: ["me_influencer", currentId],
    enabled: !!currentId,
    queryFn: async (): Promise<InfluencerRow | null> => {
      if (!currentId) return null;
      const { data, error } = await supabase
        .from("influencers")
  .select("*")
        .eq("id", currentId)
        .single();
      if (error) throw error;
      return data as unknown as InfluencerRow;
    },
  });

  const { data: mySales } = useQuery({
    queryKey: ["my_sales", currentId],
    enabled: !!currentId,
    queryFn: async (): Promise<SaleRow[]> => {
      if (!currentId) return [];
      const { data, error } = await supabase
        .from("sales")
        .select("id,product,customer,value,commission,date")
        .eq("influencer_id", currentId)
        .order("date", { ascending: false });
      if (error) throw error;
      return data as unknown as SaleRow[];
    },
  });

  const affiliateLink = me?.affiliate_link || "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    toast({
      title: "Link copiado",
      description: "Copiado para a área de transferência.",
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    supabase.auth.signOut().finally(() => {
      try {
        window.localStorage.removeItem("current_influencer_id");
        window.localStorage.removeItem("current_influencer_email");
      } catch {
        // Intentionally ignore storage cleanup errors (e.g., private mode)
      }
      window.location.href = "/";
    });
  };

  const handleWhatsAppSupport = () => {
    const phoneNumber = "5511999999999"; // Substitua pelo número real
    const message = "Olá! Preciso de suporte no Hive of Clicks.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Histórico de saques pagos (simples: por enquanto, lista todos pagos)
  type PaidWithdrawal = { method: string; amount: number; paid_at: string | null };
  const { data: paid, isLoading: loadingPaid, isError: paidError, error: paidErrObj, refetch: refetchPaid, isFetching: fetchingPaid } = useQuery({
    queryKey: ["paid_withdrawals", currentId],
    queryFn: async (): Promise<PaidWithdrawal[]> => {
      if (!currentId) return [];
      const { data, error } = await supabase
        .from("withdrawal_requests")
        .select("method, amount, paid_at, status")
        .eq("user_id", currentId)
        .eq("status", "paid")
        .order("paid_at", { ascending: false });
      if (error) throw error;
      // map to safe type without using any
      type Row = { method: string; amount: number; paid_at: string | null };
      const rows = (data ?? []) as Row[];
      return rows.map((r) => ({ method: r.method, amount: r.amount, paid_at: r.paid_at ?? null }));
    },
  });

  const paidRows = useMemo(() => paid ?? [], [paid]);
  const formatBRL = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
  const formatDateTime = (iso?: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("pt-BR");
  };

  // Verifica horário comercial de Brasília (9h–19h)
  const withinBusinessHours = useMemo(() => {
    try {
      const parts = new Intl.DateTimeFormat('pt-BR', {
        hour: 'numeric',
        hour12: false,
        timeZone: 'America/Sao_Paulo',
      }).formatToParts(new Date());
      const hourStr = parts.find(p => p.type === 'hour')?.value ?? '';
      const hour = parseInt(hourStr, 10);
      if (Number.isNaN(hour)) {
        const fallback = new Date().getHours();
        return fallback >= 9 && fallback < 19;
      }
      return hour >= 9 && hour < 19;
    } catch {
      // Fallback para horário local
      const h = new Date().getHours();
      return h >= 9 && h < 19;
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-background relative">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_hsl(214_100%_60%_/_0.03)_0%,_transparent_50%)]"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-tech-blue-700/30 bg-gradient-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-2 flex justify-between items-center">
            <div className="flex items-center">
              <Logo className={isMobile ? "h-28 w-auto" : "h-40 w-auto"} />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={`relative rounded-full ${isMobile ? 'h-10 w-10' : 'h-14 w-14'}`}>
                  <Avatar className={isMobile ? "h-10 w-10" : "h-14 w-14"}>
                    <AvatarImage src={"https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(me?.full_name || me?.username || me?.email || "User")} alt={me?.full_name || me?.username || me?.email || "User"} />
                    <AvatarFallback className="bg-neon-blue/20 text-neon-blue">
                      {(me?.full_name || me?.username || me?.email || "U").split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 bg-gradient-card border-tech-blue-700/40" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className={isMobile ? "h-12 w-12" : "h-16 w-16"}>
                        <AvatarImage src={"https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(me?.full_name || me?.username || me?.email || "User")} alt={me?.full_name || me?.username || me?.email || "User"} />
                        <AvatarFallback className="bg-neon-blue/20 text-neon-blue">
                          {(me?.full_name || me?.username || me?.email || "U").split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none text-foreground">Perfil do Influencer</p>
                        <p className="text-xs leading-none text-tech-blue-300 mt-1">
                          {me?.full_name || me?.username || me?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator className="bg-tech-blue-700/30" />
                
                <div className="p-3 space-y-3">
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-tech-blue-300 uppercase tracking-wider">Dados Pessoais</h4>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-3 w-3 text-tech-blue-400" />
                        <span className="text-foreground">{me?.email}</span>
                      </div>
                    </div>
                  </div>

                </div>

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
          {/* Stats Cards - usando dados reais */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            <Card className="bg-gradient-card border-tech-blue-700/40 shadow-glow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`font-medium text-tech-blue-300 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                  Total de Vendas
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-sky-400" />
              </CardHeader>
              <CardContent>
                <div className={`font-bold text-foreground ${isMobile ? 'text-3xl' : 'text-3xl'}`}>{(me?.total_sales_count ?? 0).toLocaleString('pt-BR')}</div>
                {!isMobile && (
                  <p className="text-xs text-tech-blue-400">Quantidade de vendas realizadas</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-tech-blue-700/40 shadow-glow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`font-medium text-tech-blue-300 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                  {isMobile ? 'Saldo total' : 'Comissão'}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className={`font-bold text-foreground ${isMobile ? 'text-xl' : 'text-3xl'}`}>R$ {(me?.total_commissions ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                {!isMobile && (
                  <p className="text-xs text-tech-blue-400">Comissão total acumulada</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-tech-blue-700/40 shadow-glow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`font-medium text-tech-blue-300 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                  Saldo disponível
                </CardTitle>
                <DollarSign className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className={`font-bold text-neon-blue ${isMobile ? 'text-xl' : 'text-3xl'}`}>R$ {(me?.pending_payment ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                {!isMobile && (
                  <p className="text-xs text-tech-blue-400">Saldo disponível para saque</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-tech-blue-700/40 shadow-glow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`font-medium text-tech-blue-300 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                  Total de Clicks
                </CardTitle>
                <MousePointer className="h-4 w-4 text-violet-400" />
              </CardHeader>
              <CardContent>
                <div className={`font-bold text-foreground ${isMobile ? 'text-3xl' : 'text-3xl'}`}>{(me?.total_clicks ?? 0).toLocaleString('pt-BR')}</div>
                {!isMobile && (
                  <p className="text-xs text-tech-blue-400">Clicks nos seus links</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4 md:space-y-6">
            <TabsList className={`bg-gradient-card border-tech-blue-700/40 ${isMobile ? 'w-full grid grid-cols-4' : ''}`}>
              <TabsTrigger value="overview" className="data-[state=active]:bg-tech-blue-800/30">
                <Eye className="w-4 h-4 mr-1 md:mr-2" />
                {isMobile ? 'Geral' : 'Visão Geral'}
              </TabsTrigger>
              <TabsTrigger value="sales" className="data-[state=active]:bg-tech-blue-800/30">
                <TrendingUp className="w-4 h-4 mr-1 md:mr-2" />
                Vendas
              </TabsTrigger>
              <TabsTrigger value="links" className="data-[state=active]:bg-tech-blue-800/30">
                <Users className="w-4 h-4 mr-1 md:mr-2" />
                {isMobile ? 'Saque' : 'Saque'}
              </TabsTrigger>
              <TabsTrigger value="support" className="data-[state=active]:bg-tech-blue-800/30">
                <MessageCircle className="w-4 h-4 mr-1 md:mr-2" />
                Suporte
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Link de Afiliado */}
                <Card className="bg-gradient-card border-tech-blue-700/40 shadow-glow">
                  <CardHeader>
                    <CardTitle className="text-foreground">Seu Link de Afiliado</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Input 
                        value={affiliateLink} 
                        readOnly 
                        className="bg-tech-blue-950/50 border-tech-blue-700/50 text-tech-blue-200"
                      />
                      <Button 
                        onClick={handleCopyLink}
                        variant="neon"
                        size="sm"
                        className="min-w-[80px]"
                      >
                        {copied ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-tech-blue-400">
                      Compartilhe este link para ganhar comissão em cada venda realizada
                    </p>
                  </CardContent>
                </Card>

                {/* Gráfico de Receitas removido */}
              </div>
            </TabsContent>

            <TabsContent value="sales" className="space-y-4 md:space-y-6">
              <Card className="bg-gradient-card border-tech-blue-700/40 shadow-glow">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-sky-400" />
                    Histórico de Vendas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 md:p-6">
                  {isMobile ? (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3 p-4">
                        {mySales?.map((sale) => (
                          <Card key={sale.id} className="bg-tech-blue-950/30 border-tech-blue-700/40 p-4 shadow-sm">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-foreground text-sm">{sale.product}</p>
                                  <p className="text-xs text-tech-blue-300">{sale.customer}</p>
                                </div>
                              </div>
                              {/* Valor da venda ocultado para o influencer */}
                              <div className="flex justify-between text-sm">
                                <span className="text-tech-blue-300">Comissão:</span>
                                <span className="text-neon-blue font-mono font-semibold inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neon-blue/10 border border-neon-blue/30">
                                  R$ {sale.commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-tech-blue-300">Data:</span>
                                <span className="text-tech-blue-300">
                                  {new Date(sale.date).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-tech-blue-700/30 bg-tech-blue-900/20">
                          <TableHead className="text-tech-blue-300 uppercase tracking-wider text-[11px]">ID</TableHead>
                          <TableHead className="text-tech-blue-300 uppercase tracking-wider text-[11px]">Produto</TableHead>
                          <TableHead className="text-tech-blue-300 uppercase tracking-wider text-[11px]">Cliente</TableHead>
                          {/* Valor da venda ocultado para o influencer */}
                          <TableHead className="text-tech-blue-300 uppercase tracking-wider text-[11px]">Comissão</TableHead>
                          <TableHead className="text-tech-blue-300 uppercase tracking-wider text-[11px]">Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mySales?.map((sale) => (
                          <TableRow key={sale.id} className="border-tech-blue-700/20 hover:bg-tech-blue-800/20 even:bg-tech-blue-900/10">
                            <TableCell className="font-medium text-tech-blue-200 font-mono">{`${sale.id.slice(0, 8)}…${sale.id.slice(-4)}`}</TableCell>
                            <TableCell className="text-foreground font-medium">{sale.product}</TableCell>
                            <TableCell className="text-tech-blue-300">{sale.customer}</TableCell>
                            {/* Valor da venda ocultado para o influencer */}
                            <TableCell className="text-neon-blue font-mono font-semibold">
                              R$ {sale.commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-tech-blue-300">
                              {new Date(sale.date).toLocaleDateString('pt-BR')}
                            </TableCell>
                          </TableRow>
                        ))}
                          {/* Sem status por enquanto */}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="links" className="space-y-6">
              <Card className="bg-gradient-card border-tech-blue-700/40 shadow-glow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-neon-blue" />
                    Solicitação de Saque
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-tech-blue-700/40 bg-tech-blue-950/40 p-3">
                      <div className="text-xs text-tech-blue-300">Saldo disponível</div>
                      <div className="text-lg font-bold text-neon-blue">R$ {(me?.pending_payment ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
                      <div className="text-xs text-emerald-300">Método</div>
                      <div className="text-sm text-foreground">PIX</div>
                    </div>
                    <div className="rounded-xl border border-tech-blue-700/30 bg-tech-blue-950/30 p-3">
                      <div className="text-xs text-tech-blue-300">Mínimo</div>
                      <div className="text-sm text-foreground">R$ 50,00</div>
                    </div>
                  </div>
                  <div className="text-xs text-tech-blue-300">
                    Horário de solicitação: 9h às 19h (Brasília)
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-3">
                    <p className="text-tech-blue-300 text-sm">Solicite o saque das suas comissões acumuladas via PIX.</p>
                    <Button
                      className="border-tech-blue-700/50"
                      onClick={() => navigate('/dashboard/withdraw/method')}
                      disabled={!withinBusinessHours}
                      title={!withinBusinessHours ? 'Fora do horário: disponível das 9h às 19h (Brasília)' : undefined}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {withinBusinessHours ? 'Solicitar Saque' : 'Fora do horário'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Histórico de Saques Pagos */}
              <Card className="bg-gradient-card border-tech-blue-700/40 shadow-glow">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-foreground">Histórico de Saques Pagos</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => refetchPaid()} disabled={fetchingPaid}>
                    {fetchingPaid ? 'Atualizando...' : 'Atualizar'}
                  </Button>
                </CardHeader>
                <CardContent>
                  {loadingPaid ? (
                    <div className="text-tech-blue-300">Carregando...</div>
                  ) : paidError ? (
                    <div className="text-red-400">Erro: {paidErrObj instanceof Error ? paidErrObj.message : String(paidErrObj)}</div>
                  ) : paidRows.length === 0 ? (
                    <div className="text-tech-blue-300">Você ainda não possui saques pagos.</div>
                  ) : (
                    <div className="rounded-md border border-tech-blue-700/30 overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-tech-blue-700/30">
                            <TableHead className="text-tech-blue-300">Data</TableHead>
                            <TableHead className="text-tech-blue-300 hidden sm:table-cell">Método</TableHead>
                            <TableHead className="text-tech-blue-300">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paidRows.map((w, idx) => (
                            <TableRow key={idx} className="border-tech-blue-700/20 hover:bg-tech-blue-800/20">
                              <TableCell className="text-foreground whitespace-nowrap">{formatDateTime(w.paid_at)}</TableCell>
                              <TableCell className="text-tech-blue-200 hidden sm:table-cell">{w.method}</TableCell>
                              <TableCell className="text-foreground font-semibold whitespace-nowrap">{formatBRL(w.amount)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="support" className="space-y-6">
              <Card className="bg-gradient-card border-tech-blue-700/40 shadow-glow">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-3">
                    <MessageCircle className="w-8 h-8 text-neon-blue" />
                    Suporte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center space-y-4">
                    <p className="text-tech-blue-300 text-lg">
                      Precisa de ajuda? Entre em contato conosco!
                    </p>
                    <p className="text-tech-blue-400">
                      Nossa equipe está pronta para te ajudar com qualquer dúvida sobre o sistema, 
                      comissões, saques ou qualquer outra questão.
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-4">
                    <div className="bg-tech-blue-950/30 border border-tech-blue-700/30 rounded-lg p-6 text-center w-full max-w-md">
                      <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.539z" fill="#25D366"/>
                      </svg>
                      <h3 className="text-foreground font-semibold mb-2">
                        Atendimento via WhatsApp
                      </h3>
                      <p className="text-tech-blue-300 text-sm mb-4">
                        Resposta rápida e personalizada
                      </p>
                      <Button 
                        onClick={handleWhatsAppSupport}
                        variant="neon"
                        className="w-full bg-green-600 hover:bg-green-700 text-white border-green-500"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Entrar em Contato
                      </Button>
                    </div>
                  </div>

                  <div className="bg-tech-blue-950/20 border border-tech-blue-700/20 rounded-lg p-4">
                    <h4 className="text-foreground font-medium mb-2">
                      Horário de Atendimento:
                    </h4>
                    <div className="space-y-1 text-tech-blue-300 text-sm">
                      <p>Segunda a Sexta: 9h às 18h</p>
                      <p>Sábado: 9h às 14h</p>
                      <p>Domingo: Fechado</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default InfluencerDashboard;