import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Edit, Plus, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

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

export default function AdminInfluencers() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const qc = useQueryClient();
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const email = data.session?.user?.email ?? null;
        if (!cancelled) setSessionEmail(email);
      } catch {
        if (!cancelled) setSessionEmail(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { data: influencers, isFetching, isLoading, error, refetch } = useQuery({
    queryKey: ["admin_influencers"],
    queryFn: async (): Promise<InfluencerRow[]> => {
      const { data, error } = await supabase
        .from("influencers")
        .select("*")
        .order("full_name", { ascending: true, nullsFirst: true });
      if (error) throw error;
      return (data ?? []) as InfluencerRow[];
    },
  });

  const [selectedInfluencer, setSelectedInfluencer] = useState<InfluencerRow | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSale, setNewSale] = useState({ product: "", customer: "", commission: "", date: "" });
  const [newInfluencer, setNewInfluencer] = useState<{ full_name: string; email: string; username: string; password: string; affiliate_link?: string }>({ full_name: "", email: "", username: "", password: "" });

  const saveProfileData = async () => {
    if (!selectedInfluencer) return;
    try {
      const { error } = await supabase
        .from("influencers")
        .update({
          full_name: selectedInfluencer.full_name,
          username: selectedInfluencer.username,
          affiliate_link: selectedInfluencer.affiliate_link,
        })
        .eq("id", selectedInfluencer.id);
      if (error) throw error;
      toast({ title: "Perfil atualizado", description: "Dados de perfil salvos." });
      setProfileDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["admin_influencers"] });
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message ?? String(e) });
    }
  };

  const saveInfluencerData = async () => {
    if (!selectedInfluencer) return;
    try {
      const { error } = await supabase
        .from("influencers")
        .update({
          affiliate_link: selectedInfluencer.affiliate_link,
          pending_payment: selectedInfluencer.pending_payment,
          total_sales: selectedInfluencer.total_sales,
          total_commissions: selectedInfluencer.total_commissions,
          total_clicks: selectedInfluencer.total_clicks,
          total_sales_count: selectedInfluencer.total_sales_count,
        })
        .eq("id", selectedInfluencer.id);
      if (error) throw error;
      toast({ title: "Dados atualizados", description: "Informações salvas." });
      setEditDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["admin_influencers"] });
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message ?? String(e) });
    }
  };

  const addSale = async () => {
    if (!selectedInfluencer || !newSale.product || !newSale.customer) return;
    // Se comissão foi informada, calcula valor estimando 15%; senão, mantém 0 para permitir ajuste posterior
    const commission = newSale.commission ? parseFloat(newSale.commission) : 0;
    const value = commission > 0 ? Number((commission / 0.15).toFixed(2)) : 0;
    const dateISO = newSale.date ? new Date(newSale.date).toISOString() : new Date().toISOString();
    try {
      const { error } = await supabase.from("sales").insert([
        {
          influencer_id: selectedInfluencer.id,
          product: newSale.product,
          customer: newSale.customer,
          value,
          commission,
          date: dateISO,
        },
      ]);
      if (error) throw error;
      toast({ title: "Venda registrada", description: `Produto: ${newSale.product} • Cliente: ${newSale.customer} • Comissão: R$ ${commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` });
      setNewSale({ product: "", customer: "", commission: "", date: "" });
      setSaleDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["admin_influencers"] });
    } catch (e: any) {
      toast({ title: "Erro ao registrar venda", description: e.message ?? String(e) });
    }
  };

  const createInfluencer = () => {
    toast({
      title: "Criação via painel",
      description: "Para criar usuários pelo painel, vamos adicionar uma função segura (Edge Function) com Service Role. Por enquanto, use o Supabase Auth.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-background relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_hsl(214_100%_60%_/_0.03)_0%,_transparent_50%)]" />
      <div className="relative z-10">
        <header className="border-b border-tech-blue-700/30 bg-gradient-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-2 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => (window.location.href = "/admin")} className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Logo className={isMobile ? "h-28 w-auto" : "h-40 w-auto"} />
              <Badge variant="outline" className="border-neon-purple text-neon-purple bg-neon-purple/10">
                Painel Influencers
              </Badge>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-4 md:py-8">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">Gerenciamento de Influencers</h1>
            <p className="text-tech-blue-300">Gerencie dados, vendas e pagamentos dos influencers</p>
          </div>

          <Card className="bg-gradient-card border-tech-blue-700/40 shadow-glow">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-foreground">Lista de Influencers</CardTitle>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="neon" size="sm" className="gap-2">
                      <Plus className="h-4 w-4" /> Adicionar Influencer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gradient-card border-tech-blue-700/40">
                    <DialogHeader>
                      <DialogTitle className="text-foreground">Novo Influencer</DialogTitle>
                      <DialogDescription className="text-tech-blue-300">
                        Para criar via painel, precisamos de uma função segura no backend. Por enquanto, use o Supabase Auth.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-tech-blue-300">Nome completo</Label>
                        <Input value={newInfluencer.full_name} onChange={(e) => setNewInfluencer({ ...newInfluencer, full_name: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-tech-blue-300">Nome de usuário</Label>
                        <Input value={newInfluencer.username} onChange={(e) => setNewInfluencer({ ...newInfluencer, username: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-tech-blue-300">Email</Label>
                        <Input type="email" value={newInfluencer.email} onChange={(e) => setNewInfluencer({ ...newInfluencer, email: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-tech-blue-300">Senha</Label>
                        <Input type="password" value={newInfluencer.password} onChange={(e) => setNewInfluencer({ ...newInfluencer, password: e.target.value })} />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-tech-blue-300">Link de afiliado</Label>
                        <Input value={newInfluencer.affiliate_link ?? ""} onChange={(e) => setNewInfluencer({ ...newInfluencer, affiliate_link: e.target.value })} placeholder="https://hiveofclicks.com/ref/usuario" />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={createInfluencer} className="bg-neon-blue hover:bg-neon-blue/80 text-white">
                        Criar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-3 text-red-400">
                  {(() => {
                    const e: any = error as any;
                    const msg = e?.message || e?.error_description || e?.hint || JSON.stringify(e);
                    return `Erro ao carregar: ${msg}`;
                  })()}
                </div>
              )}
              <div className="flex justify-end mb-2">
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                  {isFetching ? 'Atualizando...' : 'Atualizar'}
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Influencer</TableHead>
                      <TableHead className="hidden sm:table-cell">Qtd Vendas</TableHead>
                      <TableHead>Saldo total</TableHead>
                      <TableHead className="hidden md:table-cell">Saldo disponível</TableHead>
                      <TableHead className="hidden lg:table-cell">Cliques</TableHead>
                      <TableHead className="hidden sm:table-cell">Pendente</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!isLoading && (influencers ?? []).length === 0 && !error && (
                      <>
                        <TableRow>
                          <TableCell colSpan={7} className="text-tech-blue-300">
                            Nenhum influencer encontrado. Crie pelo Supabase Auth ou via painel (em breve).
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={7}>
                            <div className="text-xs text-yellow-300/90 space-y-1">
                              <div>
                                Dica: se você tem influenciadores no banco mas não aparecem aqui, pode ser RLS (políticas de linha) ou projeto incorreto.
                              </div>
                              <div>
                                Sessão atual: <span className="font-mono">{sessionEmail ?? '—'}</span>
                              </div>
                              <div>
                                Admin permitido (env VITE_ADMIN_EMAILS ou padrão): <span className="font-mono">lovablemoneyenzo@gmail.com</span>
                              </div>
                              <div>
                                Supabase URL atual: <span className="font-mono">{(import.meta as any).env?.VITE_SUPABASE_URL || '—'}</span>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                    {(influencers ?? []).map((inf) => (
                      <TableRow key={inf.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={"https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(inf.full_name || inf.username || inf.email)} alt={inf.full_name || inf.username || inf.email} />
                              <AvatarFallback className="bg-neon-purple/20 text-neon-purple">
                                {(inf.full_name || inf.username || inf.email).split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{inf.full_name || inf.username || inf.email}</p>
                              <p className="text-sm text-tech-blue-400">{inf.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground font-semibold">{Number(inf.total_sales_count ?? 0).toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="text-foreground font-semibold whitespace-nowrap">R$ {Number(inf.total_commissions ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="hidden md:table-cell text-neon-purple font-semibold whitespace-nowrap">R$ {Number(inf.pending_payment ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="hidden lg:table-cell text-neon-blue font-semibold">{Number(inf.total_clicks ?? 0).toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="hidden sm:table-cell text-yellow-400 font-semibold whitespace-nowrap">R$ {Number(inf.pending_payment ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog open={profileDialogOpen && selectedInfluencer?.id === inf.id} onOpenChange={setProfileDialogOpen}>
                              <DialogTrigger asChild>
                                <Button aria-label="Editar perfil" variant="outline" size="sm" onClick={() => setSelectedInfluencer(inf)} className="border-neon-blue text-neon-blue hover:bg-neon-blue/10" title="Editar Perfil">
                                  <User className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-gradient-card border-tech-blue-700/40">
                                <DialogHeader>
                                  <DialogTitle className="text-foreground">Editar Perfil do Influencer</DialogTitle>
                                  <DialogDescription className="text-tech-blue-300">Edite nome, usuário e link de afiliado</DialogDescription>
                                </DialogHeader>
                                {selectedInfluencer && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                      <div>
                                        <Label className="text-tech-blue-300">Nome Completo</Label>
                                        <Input value={selectedInfluencer.full_name ?? ""} onChange={(e) => setSelectedInfluencer({ ...selectedInfluencer, full_name: e.target.value })} className="bg-tech-blue-900/50 border-tech-blue-700 text-foreground" />
                                      </div>
                                      <div>
                                        <Label className="text-tech-blue-300">Nome de Usuário</Label>
                                        <Input value={selectedInfluencer.username ?? ""} onChange={(e) => setSelectedInfluencer({ ...selectedInfluencer, username: e.target.value })} className="bg-tech-blue-900/50 border-tech-blue-700 text-foreground" />
                                      </div>
                                      <div>
                                        <Label className="text-tech-blue-300">Link de Afiliado</Label>
                                        <Input value={selectedInfluencer.affiliate_link ?? ""} onChange={(e) => setSelectedInfluencer({ ...selectedInfluencer, affiliate_link: e.target.value })} placeholder="https://hiveofclicks.com/ref/usuario" className="bg-tech-blue-900/50 border-tech-blue-700 text-foreground" />
                                      </div>
                                    </div>
                                    <div className="flex space-x-2 pt-4">
                                      <Button onClick={saveProfileData} className="flex-1 bg-neon-blue hover:bg-neon-blue/80 text-white">
                                        Salvar Perfil
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <Dialog open={editDialogOpen && selectedInfluencer?.id === inf.id} onOpenChange={setEditDialogOpen}>
                              <DialogTrigger asChild>
                                <Button aria-label="Editar dados" variant="outline" size="sm" onClick={() => setSelectedInfluencer(inf)} className="border-tech-blue-600 text-tech-blue-300 hover:bg-tech-blue-800/30" title="Editar Dados">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-gradient-card border-tech-blue-700/40">
                                <DialogHeader>
                                  <DialogTitle className="text-foreground">Editar Influencer</DialogTitle>
                                  <DialogDescription className="text-tech-blue-300">Ajuste métricas e link de afiliado (opcional)</DialogDescription>
                                </DialogHeader>
                                {selectedInfluencer && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-tech-blue-300">Qtd. de Vendas</Label>
                                        <Input type="number" value={selectedInfluencer.total_sales_count} onChange={(e) => setSelectedInfluencer({ ...selectedInfluencer, total_sales_count: parseInt(e.target.value) || 0 })} className="bg-tech-blue-900/50 border-tech-blue-700 text-foreground" />
                                      </div>
                                      <div>
                                        <Label className="text-tech-blue-300">Saldo total (R$)</Label>
                                        <Input type="number" value={selectedInfluencer.total_commissions} onChange={(e) => setSelectedInfluencer({ ...selectedInfluencer, total_commissions: parseFloat(e.target.value) || 0 })} className="bg-tech-blue-900/50 border-tech-blue-700 text-foreground" />
                                      </div>
                                      <div>
                                        <Label className="text-tech-blue-300">Saldo disponível (R$)</Label>
                                        <Input type="number" value={selectedInfluencer.pending_payment} onChange={(e) => setSelectedInfluencer({ ...selectedInfluencer, pending_payment: parseFloat(e.target.value) || 0 })} className="bg-tech-blue-900/50 border-tech-blue-700 text-foreground" />
                                      </div>
                                      <div>
                                        <Label className="text-tech-blue-300">Clicks</Label>
                                        <Input type="number" value={selectedInfluencer.total_clicks} onChange={(e) => setSelectedInfluencer({ ...selectedInfluencer, total_clicks: parseInt(e.target.value) || 0 })} className="bg-tech-blue-900/50 border-tech-blue-700 text-foreground" />
                                      </div>
                                      {/* Removido campo de Faturamento conforme solicitado */}
                                      <div className="md:col-span-2">
                                        <Label className="text-tech-blue-300">Link de Afiliado</Label>
                                        <Input value={selectedInfluencer.affiliate_link ?? ""} onChange={(e) => setSelectedInfluencer({ ...selectedInfluencer, affiliate_link: e.target.value })} className="bg-tech-blue-900/50 border-tech-blue-700 text-foreground" />
                                      </div>
                                    </div>
                                    <div className="flex space-x-2 pt-4">
                                      <Button onClick={saveInfluencerData} className="flex-1 bg-neon-purple hover:bg-neon-purple/80 text-white">
                                        Salvar Alterações
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <Dialog open={saleDialogOpen && selectedInfluencer?.id === inf.id} onOpenChange={setSaleDialogOpen}>
                              <DialogTrigger asChild>
                                <Button aria-label="Registrar venda" variant="outline" size="sm" onClick={() => setSelectedInfluencer(inf)} className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10">
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-gradient-card border-tech-blue-700/40">
                                <DialogHeader>
                                  <DialogTitle className="text-foreground">Registrar Venda</DialogTitle>
                                  <DialogDescription className="text-tech-blue-300">Campos detalhados: produto, cliente, valor, comissão e data</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-tech-blue-300">Produto</Label>
                                      <Input value={newSale.product} onChange={(e) => setNewSale({ ...newSale, product: e.target.value })} className="bg-tech-blue-900/50 border-tech-blue-700 text-foreground" />
                                    </div>
                                    <div>
                                      <Label className="text-tech-blue-300">Cliente</Label>
                                      <Input value={newSale.customer} onChange={(e) => setNewSale({ ...newSale, customer: e.target.value })} className="bg-tech-blue-900/50 border-tech-blue-700 text-foreground" />
                                    </div>
                                    <div>
                                      <Label className="text-tech-blue-300">Comissão (R$)</Label>
                                      <Input type="number" placeholder="auto (15%)" value={newSale.commission} onChange={(e) => setNewSale({ ...newSale, commission: e.target.value })} className="bg-tech-blue-900/50 border-tech-blue-700 text-foreground" />
                                    </div>
                                    <div className="md:col-span-2">
                                      <Label className="text-tech-blue-300">Data</Label>
                                      <Input type="datetime-local" value={newSale.date} onChange={(e) => setNewSale({ ...newSale, date: e.target.value })} className="bg-tech-blue-900/50 border-tech-blue-700 text-foreground" />
                                    </div>
                                  </div>
                                  <Button onClick={addSale} className="w-full bg-neon-cyan hover:bg-neon-cyan/80 text-background">
                                    Registrar Venda
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {isFetching && <div className="text-tech-blue-300 mt-2">Atualizando...</div>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}