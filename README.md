# Partner Gate Pro - Sistema de Gestão de Afiliados

Este é um sistema de gestão de afiliados e influenciadores construído com React + TypeScript + Vite e integrado com Supabase.

## 🚀 Configuração do Projeto

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### 1. Instalação das Dependências

```bash
npm install
```

### 2. Configuração do Supabase

**⚠️ IMPORTANTE**: Este projeto requer configuração do Supabase para funcionar corretamente.

1. **Consulte o guia completo**: Leia o arquivo `SUPABASE_SETUP.md` para instruções detalhadas
2. **Configure as variáveis de ambiente**: 
   - Copie suas credenciais do Supabase
   - Edite o arquivo `.env` na raiz do projeto
   - Substitua os valores placeholder pelas suas credenciais reais

### 3. Executar o Projeto

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

### 4. Testar a Conexão

Após configurar o Supabase, acesse: `http://localhost:8080/debug/supabase`

Esta página mostrará o status da conexão e ajudará a identificar problemas de configuração.

## 🗃️ Estrutura do Banco de Dados

O projeto utiliza as seguintes tabelas principais:

- **users**: Usuários do sistema (influenciadores e administradores)
- **withdrawal_requests**: Solicitações de saque dos influenciadores

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
├── pages/              # Páginas da aplicação
├── lib/
│   ├── db/            # Funções do banco de dados
│   │   ├── users.ts   # Operações de usuários
│   │   └── withdrawals.ts # Operações de saques
│   └── supabaseClient.ts # Cliente Supabase
├── types/
│   └── database.ts    # Tipos TypeScript do banco
└── features/          # Features específicas
```

## 🔧 Funcionalidades

### Para Influenciadores
- Dashboard com métricas pessoais
- Solicitação de saques via PIX
- Histórico de transações

### Para Administradores
- Gestão de influenciadores
- Aprovação de saques
- Relatórios financeiros

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Faz build para produção
- `npm run lint` - Executa ESLint
- `npm run preview` - Preview da build de produção

## 📚 Documentação

- `SUPABASE_SETUP.md` - Guia completo de configuração do Supabase
- Documentação do Supabase: https://supabase.com/docs

## 🔒 Segurança

- As credenciais do Supabase são carregadas via variáveis de ambiente
- O arquivo `.env` está no `.gitignore` para evitar vazamento de credenciais
- Row Level Security (RLS) configurado nas tabelas sensíveis

## 🚨 Solução de Problemas

### Erro de conexão com Supabase
1. Verifique se as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão corretas
2. Confirme se as tabelas foram criadas no banco
3. Use a página `/debug/supabase` para diagnosticar problemas

### Build falhando
1. Execute `npm run lint` para verificar erros de código
2. Verifique se todas as dependências estão instaladas
3. Confirme se as variáveis de ambiente estão configuradas

---

## Projeto Lovable

**URL do Projeto**: https://lovable.dev/projects/e1c16ab1-9ab6-4fa6-9f45-cf28290b158b

### Tecnologias Utilizadas

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase

### Deploy

Para fazer deploy, acesse [Lovable](https://lovable.dev/projects/e1c16ab1-9ab6-4fa6-9f45-cf28290b158b) e clique em Share → Publish.
