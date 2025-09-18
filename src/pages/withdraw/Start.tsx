import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useWithdraw } from "@/features/withdraw/WithdrawContext";
import CenteredPage from "@/components/layout/CenteredPage";
import { ArrowLeft } from "lucide-react";

export default function WithdrawStart() {
  const navigate = useNavigate();
  const { actions } = useWithdraw();
  // Horário 9h–19h
  const withinBusinessHours = (() => {
    try {
      const parts = new Intl.DateTimeFormat('pt-BR', { hour: 'numeric', hour12: false }).formatToParts(new Date());
      const hourStr = parts.find(p => p.type === 'hour')?.value ?? '';
      const hour = parseInt(hourStr, 10);
      return hour >= 9 && hour < 19;
    } catch {
      const h = new Date().getHours();
      return h >= 9 && h < 19;
    }
  })();

  return (
    <>
      {/* Botão de voltar em caixinha (flutuante) */}
      <div className="fixed left-3 top-3 z-40 sm:left-6 sm:top-6">
        <Button
          variant="outline"
          size="icon"
          aria-label="Voltar"
          className="rounded-xl border-border/70 bg-background/80 backdrop-blur hover:bg-accent/40 shadow"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      <CenteredPage>
      <Card className="w-full max-w-xl shadow-xl border-border/60">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Solicitação de Saque</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between items-center gap-4 p-6">
          <div className="text-muted-foreground">
            Inicie uma nova solicitação de saque.
            <div className="text-xs mt-1 text-tech-blue-300">Horário de solicitação: 9h às 19h</div>
          </div>
          <Button
            className="px-6"
            disabled={!withinBusinessHours}
            title={!withinBusinessHours ? 'Fora do horário: disponível das 9h às 19h' : undefined}
            onClick={() => {
              actions.reset();
              navigate("/dashboard/withdraw/method");
            }}
          >
            {withinBusinessHours ? 'Solicitar Saque' : 'Fora do horário'}
          </Button>
        </CardContent>
      </Card>
      </CenteredPage>
    </>
  );
}
