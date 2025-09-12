import { supabase } from "@/lib/supabaseClient"
import type { WithdrawalRequest, NewWithdrawalRequest, WithdrawalRequestUpdate } from "@/types/database"

export type WithdrawalMethod = "PIX" | "bank_transfer"

// Insere uma solicitação de saque. Retorna o registro inserido ou lança erro.
export async function createWithdrawalRequest(req: NewWithdrawalRequest): Promise<WithdrawalRequest> {
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .insert([{
      user_id: req.user_id ?? null,
      method: req.method,
      amount: req.amount,
      pix_key: req.pix_key ?? null,
      status: req.status ?? "pending",
      deadline_at: req.deadline_at ?? null,
    }])
    .select()
    .single()

  if (error) {
    console.error("Erro ao criar solicitação de saque:", error)
    throw new Error(`Falha ao criar solicitação de saque: ${error.message}`)
  }
  
  return data as WithdrawalRequest
}

// Lista todas as solicitações de saque, ordenadas por data de criação (mais recentes primeiro)
export async function listWithdrawalRequests(): Promise<WithdrawalRequest[]> {
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .select("id, user_id, method, amount, pix_key, status, created_at, deadline_at, paid_at")
    .order("created_at", { ascending: false })
    
  if (error) {
    console.error("Erro ao listar solicitações de saque:", error)
    throw new Error(`Falha ao listar solicitações de saque: ${error.message}`)
  }
  
  return data as WithdrawalRequest[]
}

// Lista solicitações de saque de um usuário específico
export async function getUserWithdrawalRequests(userId: string): Promise<WithdrawalRequest[]> {
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .select("id, user_id, method, amount, pix_key, status, created_at, deadline_at, paid_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    
  if (error) {
    console.error("Erro ao listar solicitações do usuário:", error)
    throw new Error(`Falha ao listar solicitações do usuário: ${error.message}`)
  }
  
  return data as WithdrawalRequest[]
}

// Marca uma solicitação como paga
export async function markWithdrawalAsPaid(id: string): Promise<WithdrawalRequest> {
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .update({ 
      status: "paid", 
      paid_at: new Date().toISOString() 
    })
    .eq("id", id)
    .select("id, status, paid_at, user_id, method, amount, pix_key, created_at, deadline_at")
    .single()
    
  if (error) {
    console.error("Erro ao marcar saque como pago:", error)
    throw new Error(`Falha ao marcar saque como pago: ${error.message}`)
  }
  
  return data as WithdrawalRequest
}

// Cancela uma solicitação de saque
export async function cancelWithdrawalRequest(id: string): Promise<WithdrawalRequest> {
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .update({ status: "canceled" })
    .eq("id", id)
    .select("id, status, user_id, method, amount, pix_key, created_at, deadline_at, paid_at")
    .single()
    
  if (error) {
    console.error("Erro ao cancelar solicitação de saque:", error)
    throw new Error(`Falha ao cancelar solicitação de saque: ${error.message}`)
  }
  
  return data as WithdrawalRequest
}

// Atualiza uma solicitação de saque
export async function updateWithdrawalRequest(id: string, updates: WithdrawalRequestUpdate): Promise<WithdrawalRequest> {
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .update(updates)
    .eq("id", id)
    .select("id, user_id, method, amount, pix_key, status, created_at, deadline_at, paid_at")
    .single()
    
  if (error) {
    console.error("Erro ao atualizar solicitação de saque:", error)
    throw new Error(`Falha ao atualizar solicitação de saque: ${error.message}`)
  }
  
  return data as WithdrawalRequest
}
