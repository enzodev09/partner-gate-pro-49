import { supabase } from "@/lib/supabaseClient"
import type { User, NewUser, UserUpdate } from "@/types/database"

// Lista todos os usuários
export async function listUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, role, created_at, updated_at")
    .order("created_at", { ascending: false })
    
  if (error) {
    console.error("Erro ao listar usuários:", error)
    throw new Error(`Falha ao listar usuários: ${error.message}`)
  }
  
  return data as User[]
}

// Busca um usuário por ID
export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, role, created_at, updated_at")
    .eq("id", id)
    .single()
    
  if (error) {
    if (error.code === 'PGRST116') {
      // Registro não encontrado
      return null
    }
    console.error("Erro ao buscar usuário:", error)
    throw new Error(`Falha ao buscar usuário: ${error.message}`)
  }
  
  return data as User
}

// Busca um usuário por email
export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, role, created_at, updated_at")
    .eq("email", email)
    .single()
    
  if (error) {
    if (error.code === 'PGRST116') {
      // Registro não encontrado
      return null
    }
    console.error("Erro ao buscar usuário por email:", error)
    throw new Error(`Falha ao buscar usuário por email: ${error.message}`)
  }
  
  return data as User
}

// Cria um novo usuário
export async function createUser(user: NewUser): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .insert([{
      email: user.email,
      name: user.name,
      role: user.role ?? "influencer"
    }])
    .select("id, email, name, role, created_at, updated_at")
    .single()
    
  if (error) {
    console.error("Erro ao criar usuário:", error)
    throw new Error(`Falha ao criar usuário: ${error.message}`)
  }
  
  return data as User
}

// Atualiza um usuário
export async function updateUser(id: string, updates: UserUpdate): Promise<User> {
  const updateData = {
    ...updates,
    updated_at: new Date().toISOString()
  }
  
  const { data, error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", id)
    .select("id, email, name, role, created_at, updated_at")
    .single()
    
  if (error) {
    console.error("Erro ao atualizar usuário:", error)
    throw new Error(`Falha ao atualizar usuário: ${error.message}`)
  }
  
  return data as User
}

// Remove um usuário (soft delete ou hard delete dependendo da necessidade)
export async function deleteUser(id: string): Promise<void> {
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", id)
    
  if (error) {
    console.error("Erro ao deletar usuário:", error)
    throw new Error(`Falha ao deletar usuário: ${error.message}`)
  }
}

// Conta o total de usuários
export async function countUsers(): Promise<number> {
  const { count, error } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    
  if (error) {
    console.error("Erro ao contar usuários:", error)
    throw new Error(`Falha ao contar usuários: ${error.message}`)
  }
  
  return count ?? 0
}

// Lista usuários por role
export async function getUsersByRole(role: 'influencer' | 'admin'): Promise<User[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, role, created_at, updated_at")
    .eq("role", role)
    .order("created_at", { ascending: false })
    
  if (error) {
    console.error("Erro ao listar usuários por role:", error)
    throw new Error(`Falha ao listar usuários por role: ${error.message}`)
  }
  
  return data as User[]
}