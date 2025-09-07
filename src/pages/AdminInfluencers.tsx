import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DollarSign, 
  Users, 
  TrendingUp,
  ArrowLeft,
  Edit,
  ToggleLeft,
  ToggleRight,
  Plus,
  CreditCard,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Dados mock dos influencers
const mockInfluencers = [
  {
    id: 1,
    name: "Maria Silva",
    email: "maria@email.com",
    username: "maria_silva",
    socialMedia: "@maria_silva_oficial",
    password: "********",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b1f7?w=150&h=150&fit=crop&crop=face",
    isActive: true,
    totalSales: 15750.00,
    totalCommissions: 2362.50,
    totalClicks: 1250,
    pendingPayment: 800.00,
    stats: {
      thisMonth: {
        sales: 3200.00,
        commissions: 480.00,
        clicks: 245
      }
    }
  },
  {
    id: 2,
    name: "João Santos",
    email: "joao@email.com",
    username: "joao_santos",
    socialMedia: "@joao_santos_oficial",
    password: "********",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    isActive: true,
    totalSales: 23450.00,
    totalCommissions: 3517.50,
    totalClicks: 1890,
    pendingPayment: 1200.00,
    stats: {
      thisMonth: {
        sales: 5600.00,
        commissions: 840.00,
        clicks: 420
      }
    }
  },
  {
    id: 3,
    name: "Ana Costa",
    email: "ana@email.com",
    username: "ana_costa",
    socialMedia: "@ana_costa_oficial",
    password: "********",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    isActive: false,
    totalSales: 8920.00,
    totalCommissions: 1338.00,
    totalClicks: 750,
    pendingPayment: 0.00,
    stats: {
      thisMonth: {
        sales: 0.00,
        commissions: 0.00,
        clicks: 0
      }
    }
  }
];

const AdminInfluencers = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [influencers, setInfluencers] = useState(mockInfluencers);
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [newSale, setNewSale] = useState({ amount: "", description: "" });

  const toggleInfluencerStatus = (id: number) => {
    setInfluencers(prev => 
      prev.map(inf => 
        inf.id === id ? { ...inf, isActive: !inf.isActive } : inf
      )
    );
    const influencer = influencers.find(inf => inf.id === id);
    toast({
      title: "Status atualizado",
      description: `${influencer?.name} foi ${influencer?.isActive ? 'inativado' : 'ativado'} com sucesso.`,
    });
  };

  const markPaymentAsPaid = (id: number) => {
    setInfluencers(prev => 
      prev.map(inf => 
        inf.id === id ? { ...inf, pendingPayment: 0.00 } : inf
      )
    );
    const influencer = influencers.find(inf => inf.id === id);
    toast({
      title: "Pagamento processado",
      description: `Pagamento de ${influencer?.name} marcado como pago.`,
    });
  };

  const saveInfluencerData = () => {
    if (selectedInfluencer) {
      setInfluencers(prev => 
        prev.map(inf => 
          inf.id === selectedInfluencer.id ? selectedInfluencer : inf
        )
      );
      toast({
        title: "Dados atualizados",
        description: "Informações do influencer foram salvas com sucesso.",
      });
      setEditDialogOpen(false);
    }
  };

  const saveProfileData = () => {
    if (selectedInfluencer) {
      setInfluencers(prev => 
        prev.map(inf => 
          inf.id === selectedInfluencer.id ? selectedInfluencer : inf
        )
      );
      toast({
        title: "Perfil atualizado",
        description: "Dados de perfil do influencer foram salvos com sucesso.",
      });
      setProfileDialogOpen(false);
    }
  };

  const addSale = () => {
    if (selectedInfluencer && newSale.amount) {
      const saleAmount = parseFloat(newSale.amount);
      const commission = saleAmount * 0.15; // 15% de comissão
      
      const updatedInfluencer = {
        ...selectedInfluencer,
        totalSales: selectedInfluencer.totalSales + saleAmount,
        totalCommissions: selectedInfluencer.totalCommissions + commission,
        pendingPayment: selectedInfluencer.pendingPayment + commission,
        stats: {
          ...selectedInfluencer.stats,
          thisMonth: {
            ...selectedInfluencer.stats.thisMonth,
            sales: selectedInfluencer.stats.thisMonth.sales + saleAmount,
            commissions: selectedInfluencer.stats.thisMonth.commissions + commission
          }
        }
      };

      setInfluencers(prev => 
        prev.map(inf => 
          inf.id === selectedInfluencer.id ? updatedInfluencer : inf
        )
      );

      toast({
        title: "Venda registrada",
        description: `Venda de R$ ${saleAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} adicionada com sucesso.`,
      });

      setNewSale({ amount: "", description: "" });
      setSaleDialogOpen(false);
    }
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
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = "/admin"}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <img 
                src="/logo-hive-of-clicks.png" 
                alt="Hive of Clicks" 
                className={isMobile ? "h-28 w-auto" : "h-40 w-auto"}
              />
              <Badge variant="outline" className="border-neon-purple text-neon-purple bg-neon-purple/10">
                Painel Influencers
              </Badge>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-4 md:py-8">
          {/* Title */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">
              Gerenciamento de Influencers
            </h1>
            <p className="text-tech-blue-300">
              Gerencie dados, vendas e pagamentos dos influencers
            </p>
          </div>

          {/* Influencers Table */}
          <Card className="bg-gradient-card border-tech-blue-700/40 shadow-glow">
            <CardHeader>
              <CardTitle className="text-foreground">Lista de Influencers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Influencer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Vendas Totais</TableHead>
                      <TableHead>Comissões</TableHead>
                      <TableHead>Cliques</TableHead>
                      <TableHead>Pendente</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {influencers.map((influencer) => (
                      <TableRow key={influencer.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={influencer.avatar} alt={influencer.name} />
                              <AvatarFallback className="bg-neon-purple/20 text-neon-purple">
                                {influencer.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{influencer.name}</p>
                              <p className="text-sm text-tech-blue-400">{influencer.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={influencer.isActive ? "default" : "secondary"}
                            className={influencer.isActive ? "bg-neon-cyan text-background" : "bg-tech-blue-600 text-tech-blue-300"}
                          >
                            {influencer.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground font-semibold">
                          R$ {influencer.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-neon-purple font-semibold">
                          R$ {influencer.totalCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-neon-blue font-semibold">
                          {influencer.totalClicks.toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-yellow-400 font-semibold">
                          R$ {influencer.pendingPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog open={profileDialogOpen && selectedInfluencer?.id === influencer.id} onOpenChange={setProfileDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedInfluencer(influencer)}
                                  className="border-neon-blue text-neon-blue hover:bg-neon-blue/10"
                                  title="Editar Perfil"
                                >
                                  <User className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-gradient-card border-tech-blue-700/40">
                                <DialogHeader>
                                  <DialogTitle className="text-foreground">Editar Perfil do Influencer</DialogTitle>
                                  <DialogDescription className="text-tech-blue-300">
                                    Edite os dados de perfil que aparecerão para o influencer
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedInfluencer && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                      <div>
                                        <Label className="text-tech-blue-300">Nome Completo</Label>
                                        <Input
                                          value={selectedInfluencer.name}
                                          onChange={(e) => setSelectedInfluencer({
                                            ...selectedInfluencer,
                                            name: e.target.value
                                          })}
                                          className="bg-tech-blue-900/50 border-tech-blue-700 text-foreground"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-tech-blue-300">Nome de Usuário</Label>
                                        <Input
                                          value={selectedInfluencer.username}
                                          onChange={(e) => setSelectedInfluencer({
                                            ...selectedInfluencer,
                                            username: e.target.value
                                          })}
                                          className="bg-tech-blue-900/50 border-tech-blue-700 text-foreground"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-tech-blue-300">Email</Label>
                                        <Input
                                          type="email"
                                          value={selectedInfluencer.email}
                                          onChange={(e) => setSelectedInfluencer({
                                            ...selectedInfluencer,
                                            email: e.target.value
                                          })}
                                          className="bg-tech-blue-900/50 border-tech-blue-700 text-foreground"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-tech-blue-300">Mídia Social</Label>
                                        <Input
                                          value={selectedInfluencer.socialMedia}
                                          onChange={(e) => setSelectedInfluencer({
                                            ...selectedInfluencer,
                                            socialMedia: e.target.value
                                          })}
                                          placeholder="@usuario_oficial"
                                          className="bg-tech-blue-900/50 border-tech-blue-700 text-foreground"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-tech-blue-300">Nova Senha (deixe em branco para manter)</Label>
                                        <Input
                                          type="password"
                                          placeholder="Nova senha..."
                                          onChange={(e) => setSelectedInfluencer({
                                            ...selectedInfluencer,
                                            password: e.target.value || selectedInfluencer.password
                                          })}
                                          className="bg-tech-blue-900/50 border-tech-blue-700 text-foreground"
                                        />
                                      </div>
                                    </div>
                                    <div className="flex space-x-2 pt-4">
                                      <Button
                                        onClick={saveProfileData}
                                        className="flex-1 bg-neon-blue hover:bg-neon-blue/80 text-white"
                                      >
                                        Salvar Perfil
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <Dialog open={editDialogOpen && selectedInfluencer?.id === influencer.id} onOpenChange={setEditDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedInfluencer(influencer)}
                                  className="border-tech-blue-600 text-tech-blue-300 hover:bg-tech-blue-800/30"
                                  title="Editar Dados"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-gradient-card border-tech-blue-700/40">
                                <DialogHeader>
                                  <DialogTitle className="text-foreground">Editar Influencer</DialogTitle>
                                  <DialogDescription className="text-tech-blue-300">
                                    Edite os dados e estatísticas do influencer
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedInfluencer && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-tech-blue-300">Vendas Totais</Label>
                                        <Input
                                          type="number"
                                          value={selectedInfluencer.totalSales}
                                          onChange={(e) => setSelectedInfluencer({
                                            ...selectedInfluencer,
                                            totalSales: parseFloat(e.target.value) || 0
                                          })}
                                          className="bg-tech-blue-900/50 border-tech-blue-700 text-foreground"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-tech-blue-300">Comissões Totais</Label>
                                        <Input
                                          type="number"
                                          value={selectedInfluencer.totalCommissions}
                                          onChange={(e) => setSelectedInfluencer({
                                            ...selectedInfluencer,
                                            totalCommissions: parseFloat(e.target.value) || 0
                                          })}
                                          className="bg-tech-blue-900/50 border-tech-blue-700 text-foreground"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-tech-blue-300">Total de Cliques</Label>
                                        <Input
                                          type="number"
                                          value={selectedInfluencer.totalClicks}
                                          onChange={(e) => setSelectedInfluencer({
                                            ...selectedInfluencer,
                                            totalClicks: parseInt(e.target.value) || 0
                                          })}
                                          className="bg-tech-blue-900/50 border-tech-blue-700 text-foreground"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-tech-blue-300">Pagamento Pendente</Label>
                                        <Input
                                          type="number"
                                          value={selectedInfluencer.pendingPayment}
                                          onChange={(e) => setSelectedInfluencer({
                                            ...selectedInfluencer,
                                            pendingPayment: parseFloat(e.target.value) || 0
                                          })}
                                          className="bg-tech-blue-900/50 border-tech-blue-700 text-foreground"
                                        />
                                      </div>
                                    </div>
                                    <div className="flex space-x-2 pt-4">
                                      <Button
                                        onClick={saveInfluencerData}
                                        className="flex-1 bg-neon-purple hover:bg-neon-purple/80 text-white"
                                      >
                                        Salvar Alterações
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleInfluencerStatus(influencer.id)}
                              className="border-tech-blue-600 text-tech-blue-300 hover:bg-tech-blue-800/30"
                            >
                              {influencer.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                            </Button>

                            <Dialog open={saleDialogOpen && selectedInfluencer?.id === influencer.id} onOpenChange={setSaleDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedInfluencer(influencer)}
                                  className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-gradient-card border-tech-blue-700/40">
                                <DialogHeader>
                                  <DialogTitle className="text-foreground">Registrar Venda</DialogTitle>
                                  <DialogDescription className="text-tech-blue-300">
                                    Adicione uma nova venda para {selectedInfluencer?.name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-tech-blue-300">Valor da Venda</Label>
                                    <Input
                                      type="number"
                                      placeholder="0.00"
                                      value={newSale.amount}
                                      onChange={(e) => setNewSale({...newSale, amount: e.target.value})}
                                      className="bg-tech-blue-900/50 border-tech-blue-700 text-foreground"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-tech-blue-300">Descrição (opcional)</Label>
                                    <Input
                                      placeholder="Descrição da venda"
                                      value={newSale.description}
                                      onChange={(e) => setNewSale({...newSale, description: e.target.value})}
                                      className="bg-tech-blue-900/50 border-tech-blue-700 text-foreground"
                                    />
                                  </div>
                                  <Button
                                    onClick={addSale}
                                    className="w-full bg-neon-cyan hover:bg-neon-cyan/80 text-background"
                                  >
                                    Registrar Venda
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {influencer.pendingPayment > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markPaymentAsPaid(influencer.id)}
                                className="border-neon-purple text-neon-purple hover:bg-neon-purple/10"
                              >
                                <CreditCard className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminInfluencers;