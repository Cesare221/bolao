# BOLAO SUCT

Sistema de bolao interno para os jogos do Brasil na Copa do Mundo.

Desenvolvido por Cesar Augusto.

## Tecnologias

- React 18 + Vite
- Netlify (hospedagem + functions)
- Supabase (banco de dados PostgreSQL)
- API-Football (placares e dados dos jogos)

## Requisitos

- Node.js 18+
- Conta gratuita no Netlify
- Conta gratuita no Supabase
- Chave de API do API-Football (https://www.api-football.com/)

## Instalacao

```bash
# Clone o repositorio
git clone <seu-repositorio>
cd bolao-suct

# Instale as dependencias
npm install
```

## Configuracao das Variaveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
VITE_API_FOOTBALL_KEY=sua-chave-api-football
VITE_ADMIN_PASSWORD=senha-do-admin
```

**Importante:** No Netlify, configure essas mesmas variaveis no painel:
- Site Settings > Build & Deploy > Environment Variables
- As variaveis VITE_ sao expostas ao frontend
- A chave da API-Football tambem e usada nas Netlify Functions (process.env.API_FOOTBALL_KEY)

## Banco de Dados (Supabase)

Execute o migration script no SQL Editor do Supabase:

1. Acesse o dashboard do Supabase
2. Va para SQL Editor
3. Cole o conteudo de `supabase/migrations/001_initial_schema.sql`
4. Execute

## Desenvolvimento Local

```bash
npm run dev
```

O frontend sera executado em http://localhost:5173

Para testar as Netlify Functions localmente, instale o Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

## Deploy no Netlify

### Opcao 1: Deploy via Git

1. Crie um repositorio no GitHub/GitLab
2. Conecte-o ao Netlify (New site from Git)
3. Configure as variaveis de ambiente no painel do Netlify
4. O netlify.toml ja configurado fara o build automaticamente

### Opcao 2: Deploy via CLI

```bash
npm run build
npx netlify deploy --prod
```

## Funcionalidades

- Pagina inicial com destaque para o proximo jogo do Brasil
- Lista completa de jogos do Brasil na Copa
- Envio de palpites (maximo 2 por pessoa)
- Ranking com pontuacao
- Painel admin protegido por senha
- Atualizacao automatica de placares via API

## Regras de Pontuacao

| Resultado | Pontos |
|-----------|--------|
| Placar exato | 5 pontos |
| Acertou vencedor/empate | 3 pontos |
| Errou | 0 pontos |
