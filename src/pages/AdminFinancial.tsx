import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type WithdrawalStatus = "pending" | "paid" | "canceled";

type WithdrawalRequest = {
	id: string;
	user_id: string | null;
	method: string; // "PIX" for now
	amount: number;
	pix_key: string | null;
	status: WithdrawalStatus;
	created_at: string;
	deadline_at: string | null;
	paid_at: string | null;
};

function formatBRL(n: number) {
	return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

function formatDateTime(iso?: string | null) {
	if (!iso) return "—";
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "—";
	return d.toLocaleString("pt-BR");
}

export default function AdminFinancial() {
	const { toast } = useToast();
	const qc = useQueryClient();

	const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
		queryKey: ["withdrawal_requests"],
		queryFn: async (): Promise<WithdrawalRequest[]> => {
			const { data, error } = await supabase
				.from("withdrawal_requests")
				.select("*")
				.order("created_at", { ascending: false });
			if (error) throw error;
			return data as unknown as WithdrawalRequest[];
		},
	});

	const markPaid = useMutation({
		mutationFn: async (row: WithdrawalRequest) => {
			const now = new Date().toISOString();
			const { data, error } = await supabase
				.from("withdrawal_requests")
				.update({ status: "paid", paid_at: now })
				.eq("id", row.id)
				.select()
				.single();
			if (error) throw error;
			return data as WithdrawalRequest;
		},
		onSuccess: () => {
			toast({ title: "Pagamento confirmado", description: "Status atualizado para pago." });
			qc.invalidateQueries({ queryKey: ["withdrawal_requests"] });
		},
			onError: (e: unknown) => {
				const msg = e instanceof Error ? e.message : typeof e === "string" ? e : JSON.stringify(e);
				toast({ title: "Erro ao atualizar", description: msg });
		},
	});

	const rows = useMemo(() => data ?? [], [data]);

	return (
		<div className="min-h-screen bg-gradient-background p-6">
			<Card className="bg-gradient-card border-tech-blue-700/40 shadow-glow">
				<CardHeader className="flex flex-row items-center justify-between gap-4">
					<CardTitle className="text-foreground">Financeiro • Solicitações de Saque</CardTitle>
					<div className="flex gap-2">
						<Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
							{isFetching ? "Atualizando..." : "Atualizar"}
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="text-muted-foreground">Carregando...</div>
								) : isError ? (
									<div className="text-destructive">
										Erro: {error instanceof Error ? error.message : String(error)}
									</div>
					) : rows.length === 0 ? (
						<div className="text-muted-foreground">Nenhuma solicitação encontrada.</div>
					) : (
						<div className="rounded-md border overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="hidden md:table-cell">ID</TableHead>
										<TableHead>Criado em</TableHead>
										<TableHead>Método</TableHead>
										<TableHead>Valor</TableHead>
										<TableHead className="hidden lg:table-cell">Chave PIX</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="hidden sm:table-cell">Vence em</TableHead>
										<TableHead className="hidden sm:table-cell">Pago em</TableHead>
										<TableHead className="text-right">Ações</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{rows.map((r) => (
										<TableRow key={r.id}>
											<TableCell className="hidden md:table-cell font-mono text-xs max-w-[12rem] truncate" title={r.id}>
												{r.id}
											</TableCell>
											<TableCell className="whitespace-nowrap">{formatDateTime(r.created_at)}</TableCell>
											<TableCell>{r.method}</TableCell>
											<TableCell className="whitespace-nowrap">{formatBRL(r.amount)}</TableCell>
											<TableCell className="hidden lg:table-cell max-w-[16rem] truncate" title={r.pix_key ?? undefined}>
												{r.pix_key ?? "—"}
											</TableCell>
											<TableCell>
												{r.status === "pending" && <Badge variant="secondary">Pendente</Badge>}
												{r.status === "paid" && <Badge className="bg-emerald-600 hover:bg-emerald-600">Pago</Badge>}
												{r.status === "canceled" && <Badge variant="destructive">Cancelado</Badge>}
											</TableCell>
											<TableCell className="hidden sm:table-cell whitespace-nowrap">{formatDateTime(r.deadline_at)}</TableCell>
											<TableCell className="hidden sm:table-cell whitespace-nowrap">{formatDateTime(r.paid_at)}</TableCell>
											<TableCell className="text-right">
												{r.status === "pending" ? (
													<AlertDialog>
														<AlertDialogTrigger asChild>
															<Button size="sm" aria-label="Marcar como pago" disabled={markPaid.isPending}>
																Marcar pago
															</Button>
														</AlertDialogTrigger>
														<AlertDialogContent>
															<AlertDialogHeader>
																<AlertDialogTitle>Confirmar pagamento?</AlertDialogTitle>
																<AlertDialogDescription>
																	Esta ação irá marcar a solicitação como paga e registrar a data de pagamento. Continue?
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel>Cancelar</AlertDialogCancel>
																<AlertDialogAction onClick={() => markPaid.mutate(r)}>
																	Confirmar
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													</AlertDialog>
												) : (
													<Button size="sm" variant="outline" disabled>
														—
													</Button>
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
