import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { listWithdrawalRequests, markWithdrawalAsPaid, type WithdrawalRequest } from "@/lib/db/withdrawals";

export default function AdminFinancial() {
	const [rows, setRows] = useState<WithdrawalRequest[] | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function load() {
		setLoading(true);
		setError(null);
		try {
			const data = await listWithdrawalRequests();
			setRows(data);
		} catch (e: any) {
			setError(e.message ?? String(e));
		} finally {
			setLoading(false);
		}
	}

	async function markPaid(id: string) {
		try {
			await markWithdrawalAsPaid(id);
			await load();
		} catch (e) {
			console.error(e);
			alert("Falha ao marcar como pago");
		}
	}

	useEffect(() => {
		load();
	}, []);

	return (
		<div className="min-h-screen bg-gradient-background p-6">
			<Card className="bg-gradient-card border-tech-blue-700/40 shadow-glow">
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="text-foreground">Financeiro • Solicitações de Saque</CardTitle>
					<div className="flex gap-2">
						<Button variant="outline" onClick={load} disabled={loading}>
							{loading ? "Atualizando..." : "Atualizar"}
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{error && (
						<div className="text-sm text-red-400 mb-3">Erro: {error}</div>
					)}
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>ID</TableHead>
									<TableHead>Usuário</TableHead>
									<TableHead>Método</TableHead>
									<TableHead>Valor</TableHead>
									<TableHead>PIX</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Criado em</TableHead>
									<TableHead>Ações</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows?.map((r) => (
									<TableRow key={r.id}>
										<TableCell className="text-xs">{r.id}</TableCell>
										<TableCell className="text-xs">{r.user_id ?? "-"}</TableCell>
										<TableCell>{r.method}</TableCell>
										<TableCell>R$ {Number(r.amount).toFixed(2)}</TableCell>
										<TableCell className="max-w-[240px] truncate" title={r.pix_key ?? undefined}>{r.pix_key ?? "-"}</TableCell>
										<TableCell>
											<Badge variant={r.status === "paid" ? "default" : "secondary"}>{r.status ?? "?"}</Badge>
										</TableCell>
										<TableCell className="text-sm">
											{r.created_at ? new Date(r.created_at).toLocaleString("pt-BR") : "-"}
										</TableCell>
										<TableCell>
											{r.status !== "paid" && r.id && (
												<Button size="sm" onClick={() => markPaid(r.id!)}>Marcar pago</Button>
											)}
										</TableCell>
									</TableRow>
								))}
								{rows && rows.length === 0 && (
									<TableRow>
										<TableCell colSpan={8} className="text-center text-tech-blue-300 py-8">
											Nenhuma solicitação encontrada.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
