import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWithdraw } from "@/features/withdraw/WithdrawContext";
import { createWithdrawalRequest } from "@/lib/db/withdrawals";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CenteredPage from "@/components/layout/CenteredPage";
import PixIcon from "@/components/icons/PixIcon";

const MIN_WITHDRAW = 50;

export default function WithdrawPix() {
  const navigate = useNavigate();
  const { state, actions } = useWithdraw();
  const { toast } = useToast();
  const [amountInput, setAmountInput] = useState(state.amount?.toString() ?? "");
  const [pixKeyInput, setPixKeyInput] = useState(state.pixKey ?? "");
  const amount = Number(amountInput || 0);

  const valid =
    state.method === "PIX" &&
    pixKeyInput.trim().length > 3 &&
    !Number.isNaN(amount) &&
    amount >= MIN_WITHDRAW;

  return (
    <CenteredPage>
      <Card className="relative w-full max-w-xl shadow-xl border-border/60 overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -inset-1 bg-gradient-to-b from-emerald-500/5 to-transparent" />
        <CardHeader className="relative z-10 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <PixIcon className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Saque via PIX</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 space-y-6 p-6">
          <div className="grid gap-2">
            <Label>Chave PIX</Label>
            <Input
              placeholder="email@exemplo.com ou CPF/CNPJ"
              value={pixKeyInput}
              onChange={(e) => setPixKeyInput(e.target.value)}
              className=""
            />
          </div>
          <div className="grid gap-2">
            <Label>Valor (R$)</Label>
            <Input
              type="number"
              min={MIN_WITHDRAW}
              step="0.01"
              placeholder="Ex.: 150,00"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className=""
            />
            <div className="text-xs text-muted-foreground">Valor mínimo: R$ {MIN_WITHDRAW.toFixed(2)}</div>
          </div>
        </CardContent>
        <CardFooter className="relative z-10 flex gap-3 justify-end p-6 pt-0">
          <Button variant="outline" onClick={() => navigate("/dashboard/withdraw/method")}>
            Voltar
          </Button>
          <Button
            disabled={!valid}
            onClick={async () => {
              const pixKey = pixKeyInput.trim();
              actions.setPixKey(pixKey);
              actions.setAmount(amount);
              actions.confirm(); // define deadline +1h (front-only)

              // Try to persist on Supabase (best-effort; keep UX even if it fails)
              try {
                if (state.method !== "PIX") throw new Error("Método inválido");
                const { data: userRes } = await supabase.auth.getUser();
                const userId = userRes?.user?.id ?? null;
                const deadline = new Date(Date.now() + 60 * 60 * 1000).toISOString();
                const created = await createWithdrawalRequest({
                  user_id: userId,
                  method: "PIX",
                  amount,
                  pix_key: pixKey,
                  status: "pending",
                  deadline_at: deadline,
                });
                toast({ title: "Solicitação registrada", description: `ID: ${created.id ?? "-"}` });
                actions.setLastRequestId(created.id ?? null);
              } catch (e) {
                // eslint-disable-next-line no-console
                console.warn("Falha ao salvar solicitação no Supabase (seguindo só no front)", e);
                toast({
                  title: "Não foi possível salvar no banco",
                  description: "Fluxo seguiu no front para você não perder tempo.",
                });
              }

              navigate("/dashboard/withdraw/confirmed");
            }}
          >
            Confirmar Saque
          </Button>
        </CardFooter>
      </Card>
    </CenteredPage>
  );
}
