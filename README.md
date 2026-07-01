# Bolao do Brasil

Plataforma web de bolao para acompanhar jogos do Brasil, enviar palpites, calcular pontuacao automaticamente e exibir ranking em tempo real.

## Demo ao vivo

[Acessar a demo](https://bolaohemo.vercel.app/)

## Screenshot

![Screenshot do projeto](./funcionalimg.png)

## Visao geral

O projeto esta estruturado para servir tanto como app real quanto como projeto de portfolio, reunindo frontend moderno, autenticacao, banco de dados, regras de negocio e deploy em producao.

## Principais recursos

- Envio de palpites por participante
- Lista de jogos com destaque para partidas abertas e resultados encerrados
- Ranking automatico com pontuacao
- Painel admin para criar jogos, atualizar placares, cadastrar participantes e remover palpites
- Login administrativo com Supabase Auth
- Persistencia dos dados no Supabase
- Deploy pronto para Vercel

## Stack

- React 18
- Vite
- Supabase
- Vercel Functions
- React Router
- Lucide React

## Destaques tecnicos

- Integracao com banco relacional via Supabase
- Autenticacao separada para admin
- Recalculo automatico de ranking
- Exclusao segura de jogos e palpites
- Suporte a SPA com rotas amigaveis
- Estrutura pronta para evoluir sem reescrever o projeto

## Como rodar localmente

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variaveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Depois ajuste os valores no `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
VITE_ADMIN_EMAIL=admin@seu-dominio.com
VITE_ADMIN_PASSWORD=sua-senha-apenas-para-desenvolvimento-local

SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
API_FOOTBALL_KEY=sua-chave-api-football
```

### 3. Rodar o projeto

```bash
npm run dev
```

O app fica disponivel em `http://localhost:5173`.

## Deploy na Vercel

O projeto tambem esta preparado para Vercel.

### Variaveis exigidas na Vercel

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_EMAIL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `API_FOOTBALL_KEY`

### Comando de teste local na Vercel

```bash
npm run dev:vercel
```

## Banco de dados

O schema e os seeds ficam em:

- [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql)
- [`supabase/migrations/002_public_access_policies.sql`](./supabase/migrations/002_public_access_policies.sql)
- [`supabase/migrations/004_admin_auth_policies.sql`](./supabase/migrations/004_admin_auth_policies.sql)
- [`supabase/seed.sql`](./supabase/seed.sql)

## Estrutura principal

- [`src/pages/HomePage.jsx`](./src/pages/HomePage.jsx)
- [`src/pages/MatchesPage.jsx`](./src/pages/MatchesPage.jsx)
- [`src/pages/RankingPage.jsx`](./src/pages/RankingPage.jsx)
- [`src/pages/PredictionPage.jsx`](./src/pages/PredictionPage.jsx)
- [`src/pages/AdminPage.jsx`](./src/pages/AdminPage.jsx)

## Checklist para publicar no GitHub

- Mantenha apenas `.env.example` no repositorio. O `.env` real ja esta ignorado pelo Git.
- Configure segredos somente no provedor de deploy e no seu ambiente local.
- Se alguma chave real ja tiver sido commitada no passado, rotacione essas credenciais antes de abrir o repositorio.
- Revise URLs de demo, capturas de tela e textos para garantir que nao exponham contexto privado.

## Para portfolio

Se quiser descrever o projeto em uma frase curta:

> Plataforma web de bolao com envio de palpites, ranking automatico e painel administrativo integrado ao Supabase.

## Licenca

Projeto de portfolio e demonstracao tecnica.
