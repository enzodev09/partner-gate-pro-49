import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useWithdraw } from "@/features/withdraw/WithdrawContext";
import { ArrowRight } from "lucide-react";
import PixIcon from "@/components/icons/PixIcon";
import CenteredPage from "@/components/layout/CenteredPage";

export default function WithdrawMethod() {
  const navigate = useNavigate();
  const { actions } = useWithdraw();

  return (
    <CenteredPage>
      <Card className="w-full max-w-2xl shadow-xl border-border/60">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Método de Saque</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          <button
            className="w-full text-left border rounded-xl p-4 bg-card/60 hover:bg-card transition group"
            onClick={() => {
              actions.setMethod("PIX");
              navigate("/dashboard/withdraw/pix");
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2">
                  <PixIcon className="h-7 w-7" />
                </div>
                <div>
                  <div className="font-medium">PIX</div>
                  <div className="text-sm text-muted-foreground">Transferência instantânea</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 rounded-md border border-border/60 px-3 py-1 text-sm text-foreground group-hover:bg-accent/40">
                Selecionar <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </button>
        </CardContent>
      </Card>
    </CenteredPage>
  );
}
