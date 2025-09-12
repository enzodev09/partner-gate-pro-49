import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useWithdraw } from "@/features/withdraw/WithdrawContext";
import CenteredPage from "@/components/layout/CenteredPage";

export default function WithdrawStart() {
  const navigate = useNavigate();
  const { actions } = useWithdraw();

  return (
    <CenteredPage>
      <Card className="w-full max-w-xl shadow-xl border-border/60">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Solicitação de Saque</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between items-center gap-4 p-6">
          <div className="text-muted-foreground">Inicie uma nova solicitação de saque.</div>
          <Button
            className="px-6"
            onClick={() => {
              actions.reset();
              navigate("/dashboard/withdraw/method");
            }}
          >
            Solicitar Saque
          </Button>
        </CardContent>
      </Card>
    </CenteredPage>
  );
}
