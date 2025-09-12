// Tipos do banco de dados Supabase

export interface User {
  id: string
  email: string
  name?: string
  role: 'influencer' | 'admin'
  created_at: string
  updated_at: string
}

export interface WithdrawalRequest {
  id: string
  user_id: string | null
  method: 'PIX' | 'bank_transfer'
  amount: number
  pix_key?: string | null
  status: 'pending' | 'paid' | 'canceled'
  created_at: string
  deadline_at?: string | null
  paid_at?: string | null
}

// Tipos para inserção (campos opcionais)
export interface NewUser {
  email: string
  name?: string
  role?: 'influencer' | 'admin'
}

export interface NewWithdrawalRequest {
  user_id?: string | null
  method: 'PIX' | 'bank_transfer'
  amount: number
  pix_key?: string | null
  status?: 'pending' | 'paid' | 'canceled'
  deadline_at?: string | null
}

// Tipos para atualizações (todos campos opcionais)
export interface UserUpdate {
  email?: string
  name?: string
  role?: 'influencer' | 'admin'
  updated_at?: string
}

export interface WithdrawalRequestUpdate {
  method?: 'PIX' | 'bank_transfer'
  amount?: number
  pix_key?: string | null
  status?: 'pending' | 'paid' | 'canceled'
  deadline_at?: string | null
  paid_at?: string | null
}

// Esquema completo do banco para TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: NewUser
        Update: UserUpdate
      }
      withdrawal_requests: {
        Row: WithdrawalRequest
        Insert: NewWithdrawalRequest
        Update: WithdrawalRequestUpdate
      }
    }
  }
}