import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminFinancial() {
	return (
		<div className="min-h-screen bg-gradient-background p-6">
			<Card className="bg-gradient-card border-tech-blue-700/40 shadow-glow">
				<CardHeader>
					<CardTitle className="text-foreground">Financeiro • Solicitações de Saque</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-tech-blue-300">
						Integração com backend foi resetada. Vamos refazer do zero com Supabase (criação de tabela, policies, inserts, listagem e confirmação de pagamento).
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
