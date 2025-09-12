# Configuração do Supabase - Passo a Passo

Este guia te ajudará a conectar seu projeto com o Supabase do zero.

## 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New project"
4. Escolha sua organização
5. Dê um nome ao projeto (ex: "partner-gate-pro")
6. Crie uma senha forte para o banco de dados
7. Escolha a região mais próxima (Brazil East para melhor performance)
8. Clique em "Create new project"

## 2. Obter as Credenciais

1. No dashboard do seu projeto, vá para **Settings** > **API**
2. Copie os seguintes valores:
   - **Project URL**: `https://[seu-projeto].supabase.co`
   - **anon public key**: Uma chave longa que começa com `eyJhbGciOiJIUzI1NiIs...`

## 3. Configurar Variáveis de Ambiente

1. Abra o arquivo `.env` na raiz do projeto
2. Substitua os valores placeholder pelas suas credenciais reais:

```env
VITE_SUPABASE_URL=https://[seu-projeto].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs[...resto-da-sua-chave...]
```

## 4. Criar as Tabelas no Banco de Dados

1. No dashboard do Supabase, vá para **SQL Editor**
2. Execute o seguinte script para criar as tabelas necessárias:

```sql
-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'influencer', -- 'influencer' ou 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Tabela de solicitações de saque
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  method VARCHAR(50) NOT NULL, -- 'PIX', 'bank_transfer', etc.
  amount DECIMAL(10, 2) NOT NULL,
  pix_key VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'canceled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  deadline_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON withdrawal_requests(created_at);

-- RLS (Row Level Security) - opcional mas recomendado
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Política básica para usuários verem apenas seus próprios dados
CREATE POLICY "Users can view their own data" ON users 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view their own withdrawal requests" ON withdrawal_requests 
  FOR SELECT USING (auth.uid() = user_id);

-- Inserir usuário de teste (opcional)
INSERT INTO users (id, email, name, role) 
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'teste@exemplo.com', 'Usuário Teste', 'influencer')
ON CONFLICT (email) DO NOTHING;
```

## 5. Testar a Conexão

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse a página de debug: `http://localhost:5173/debug/supabase`

3. Se a conexão estiver funcionando, você verá: `OK: conexão ativa. Tabela users acessível.`

## 6. Configurações Opcionais

### Autenticação (se necessário)
1. No dashboard do Supabase, vá para **Authentication** > **Settings**
2. Configure provedores de autenticação (email, Google, etc.)
3. Configure URLs de redirecionamento se necessário

### Armazenamento de Arquivos (se necessário)
1. Vá para **Storage**
2. Crie buckets para armazenar imagens, documentos, etc.

## Solução de Problemas

### Erro: "Invalid API key" ou "Project URL not found"
- Verifique se as variáveis no `.env` estão corretas
- Verifique se não há espaços em branco antes/depois das URLs
- Confirme que você está usando as credenciais do projeto correto

### Erro: "relation does not exist"
- Execute os scripts SQL acima para criar as tabelas
- Verifique se você está no projeto correto no dashboard

### Conexão lenta ou com timeout
- Escolha uma região mais próxima ao criar um novo projeto
- Verifique sua conexão com a internet

## Próximos Passos

Após a configuração, você pode:
1. Implementar autenticação de usuários
2. Criar mais tabelas conforme necessário
3. Configurar policies de segurança mais específicas
4. Implementar backup automático
5. Monitorar uso e performance no dashboard

Para dúvidas, consulte a [documentação oficial do Supabase](https://supabase.com/docs).