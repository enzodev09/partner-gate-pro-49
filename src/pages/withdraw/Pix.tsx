import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWithdraw } from "@/features/withdraw/WithdrawContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CenteredPage from "@/components/layout/CenteredPage";
import { ArrowLeft } from "lucide-react";
// PIX represented by user-provided image

export default function WithdrawPix() {
  const navigate = useNavigate();
  const { state, actions } = useWithdraw();
  const { toast } = useToast();
  const [amountInput, setAmountInput] = useState(state.amount?.toString() ?? "");
  const [pixKeyInput, setPixKeyInput] = useState(state.pixKey ?? "");
  const amount = Number(amountInput || 0);
  const currentId = typeof window !== 'undefined' ? window.localStorage.getItem("current_influencer_id") : null;

  const valid =
    state.method === "PIX" &&
    pixKeyInput.trim().length > 3 &&
    !Number.isNaN(amount) &&
    amount > 0;
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
      <Card className="relative w-full max-w-xl shadow-xl border-border/60 overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -inset-1 bg-gradient-to-b from-emerald-500/5 to-transparent" />
        <CardHeader className="relative z-10 text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 overflow-hidden">
            <img
              src="https://oxnkdfaiwbnbbmrjlkei.supabase.co/storage/v1/object/public/imagens/imagens%20hive%20of%20clicks/Blue%20and%20White%20Modern%20Background%20Instagram%20Post%20(4).png"
              alt="PIX"
              className="h-10 w-10 object-contain"
              loading="eager"
              decoding="async"
            />
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
              step="0.01"
              placeholder="Ex.: 150,00"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className=""
            />
            <div className="text-xs text-muted-foreground">Horário de solicitação: 9h às 19h</div>
          </div>
        </CardContent>
        <CardFooter className="relative z-10 flex gap-3 justify-end p-6 pt-0">
          <Button variant="outline" onClick={() => navigate("/dashboard/withdraw/method")}>
            Voltar
          </Button>
          <Button
            disabled={!valid || !withinBusinessHours}
            onClick={async () => {
              if (!withinBusinessHours) {
                toast({ title: 'Fora do horário', description: 'Solicitações estão disponíveis das 9h às 19h.' });
                return;
              }
              const pixKey = pixKeyInput.trim();
              actions.setPixKey(pixKey);
              actions.setAmount(amount);
              actions.confirm(); // define deadline +1h (front-only)

              // Inserir no Supabase (agora com backend real)
              try {
                if (!currentId) {
                  toast({ title: "É necessário estar logado", description: "Faça login para solicitar o saque." });
                  return;
                }
                const deadline = new Date(Date.now() + 60 * 60 * 1000).toISOString();
                const { data, error } = await supabase
                  .from("withdrawal_requests")
                  .insert([
                    {
                      user_id: currentId,
                      method: "PIX",
                      amount,
                      pix_key: pixKey,
                      status: "pending",
                      deadline_at: deadline,
                    },
                  ])
                  .select()
                  .single();

                if (error) throw error;
                toast({ title: "Solicitação registrada", description: `ID: ${data?.id ?? '-'}` });
              } catch (e: unknown) {
                console.error(e);
                const msg = e instanceof Error ? e.message : typeof e === "string" ? e : JSON.stringify(e);
                toast({ title: "Erro ao salvar no Supabase", description: msg });
              }

              navigate("/dashboard/withdraw/confirmed");
            }}
          >
            Confirmar Saque
          </Button>
        </CardFooter>
      </Card>
      </CenteredPage>
    </>
  );
}
