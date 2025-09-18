import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWithdraw } from "@/features/withdraw/WithdrawContext";
import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CenteredPage from "@/components/layout/CenteredPage";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

export default function WithdrawConfirmed() {
  const { state } = useWithdraw();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paid] = useState(false);

  if (!state.deadlineISO) {
    return (
      <CenteredPage>
        <Card className="w-full max-w-md shadow-xl border-border/60">
          <CardHeader className="text-center">
            <CardTitle>Solicitação não encontrada</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate("/dashboard/withdraw")}>Voltar</Button>
          </CardContent>
        </Card>
      </CenteredPage>
    );
  }

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
      {/* Caixinhas de info fora do template/card */}
      <div className="mx-auto mb-4 flex max-w-xl items-center justify-center gap-3 px-4">
        {paid ? (
          <div className="inline-flex items-center gap-2 rounded-xl border border-green-500/50 bg-green-500/10 px-3 py-1.5 text-sm text-green-300">
            <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
            Pagamento realizado
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/5 px-3 py-1.5 text-sm text-green-300">
            <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
            Solicitação enviada
          </div>
        )}
        <div className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3 py-1.5 text-sm text-foreground">
          Método: PIX • Valor: R$ {Number(state.amount ?? 0).toFixed(2)}
        </div>
      </div>
      <CenteredPage>
      <Card className="relative w-full max-w-xl shadow-xl border-border/60 overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -inset-1 bg-gradient-to-b from-green-500/5 to-transparent" />
        <CardHeader className="relative z-10 flex flex-col items-center gap-3">
          <div className="relative">
            <span className="absolute -inset-4 rounded-full bg-green-500/10 blur-xl" />
            <CheckCircle2 className="relative h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Saque confirmado</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 text-center space-y-4 p-6">
          <p className="text-muted-foreground">Sua solicitação foi recebida. O pagamento será processado em até 1 hora.</p>
          <div className="pt-2">
            <Button variant="secondary" onClick={() => navigate("/dashboard")}>Voltar ao painel</Button>
          </div>
        </CardContent>
      </Card>
      </CenteredPage>
    </>
  );
}
