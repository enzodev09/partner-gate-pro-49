import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useWithdraw } from "@/features/withdraw/WithdrawContext";
import { ArrowRight, ArrowLeft } from "lucide-react";
import CenteredPage from "@/components/layout/CenteredPage";

export default function WithdrawMethod() {
  const navigate = useNavigate();
  const { actions } = useWithdraw();
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
        <Card className="w-full max-w-2xl shadow-xl border-border/60">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Método de Saque</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            <div className="text-xs text-muted-foreground mb-2">Horário de solicitação: 9h às 19h</div>
            <button
              className="w-full text-left border rounded-xl p-4 bg-card/60 hover:bg-card transition group"
              disabled={!withinBusinessHours}
              onClick={() => {
                actions.setMethod("PIX");
                navigate("/dashboard/withdraw/pix");
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 overflow-hidden">
                    <img
                      src="https://oxnkdfaiwbnbbmrjlkei.supabase.co/storage/v1/object/public/imagens/imagens%20hive%20of%20clicks/Blue%20and%20White%20Modern%20Background%20Instagram%20Post%20(4).png"
                      alt="PIX"
                      className="h-12 w-12 object-contain"
                      decoding="async"
                      loading="eager"
                    />
                  </div>
                  <div>
                    <div className="font-medium">PIX</div>
                    <div className="text-sm text-muted-foreground">Transferência instantânea</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 rounded-md border border-border/60 px-3 py-1 text-sm text-foreground group-hover:bg-accent/40">
                  {withinBusinessHours ? (
                    <>
                      Selecionar <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    'Fora do horário'
                  )}
                </span>
              </div>
            </button>
          </CardContent>
        </Card>
      </CenteredPage>
    </>
  );
}
