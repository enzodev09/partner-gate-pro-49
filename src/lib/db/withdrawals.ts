import { supabase } from "@/lib/supabaseClient";

export type WithdrawalMethod = "PIX";

export type WithdrawalRequest = {
  id?: string;
  user_id?: string | null;
  method: WithdrawalMethod;
  amount: number;
  pix_key?: string | null;
  status?: string; // e.g., 'pending' | 'paid' | 'canceled'
  created_at?: string;
  deadline_at?: string | null;
};

// Inserts a withdrawal request. Returns the inserted row or throws.
export async function createWithdrawalRequest(req: WithdrawalRequest) {
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .insert([
      {
        user_id: req.user_id ?? null,
        method: req.method,
        amount: req.amount,
        pix_key: req.pix_key ?? null,
        status: req.status ?? "pending",
        deadline_at: req.deadline_at ?? null,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as WithdrawalRequest;
}

export async function listWithdrawalRequests() {
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .select("id, user_id, method, amount, pix_key, status, created_at, deadline_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as WithdrawalRequest[];
}

export async function markWithdrawalAsPaid(id: string) {
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, status, paid_at")
    .single();
  if (error) throw error;
  return data;
}
