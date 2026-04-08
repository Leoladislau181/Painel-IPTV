# Painel de Revendedor - Deployment Guide (Vercel)

Este projeto está pronto para ser publicado na Vercel através do GitHub.

## Passos para Publicação

1. **GitHub**:
   - Crie um novo repositório no GitHub.
   - Faça o push do código para o repositório.

2. **Vercel**:
   - Acesse [vercel.com](https://vercel.com) e faça login com sua conta do GitHub.
   - Clique em **"Add New"** > **"Project"**.
   - Importe o repositório que você acabou de criar.

3. **Configurações do Projeto na Vercel**:
   - **Framework Preset**: Vite (deve ser detectado automaticamente).
   - **Build Command**: `npm run build`.
   - **Output Directory**: `dist`.

4. **Variáveis de Ambiente**:
   No passo de configuração na Vercel, adicione as seguintes variáveis de ambiente (Environment Variables):
   - `VITE_SUPABASE_URL`: Sua URL do projeto Supabase.
   - `VITE_SUPABASE_ANON_KEY`: Sua chave anônima (Anon Key) do Supabase.

5. **Deploy**:
   - Clique em **"Deploy"**.

## Configuração de Roteamento
O arquivo `vercel.json` já foi incluído para garantir que o roteamento do React (SPA) funcione corretamente, redirecionando todas as rotas para o `index.html`.
