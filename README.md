# BOLAO SUCT

Sistema de bolao interno para os jogos do Brasil na Copa do Mundo.

Desenvolvido por Cesar Augusto.

## Tecnologias

- React 18 + Vite
- Netlify (hospedagem + functions)
- Supabase (banco de dados PostgreSQL)
- Fallback local no navegador para teste e contingencia

## Requisitos

- Node.js 18+
- Conta gratuita no Netlify
- Conta gratuita no Supabase

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
VITE_ADMIN_EMAIL=admin@seu-dominio.com
```

**Importante:** No Netlify, configure as mesmas variaveis no painel:
- `VITE_...` vai para o frontend
- `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` ficam para as Netlify Functions
- `API_FOOTBALL_KEY` e opcional, se voce quiser a sincronizacao externa
- `VITE_ADMIN_EMAIL` deve ser o email do usuario admin cadastrado no Supabase Auth
- Painel: `Site Settings > Build & Deploy > Environment Variables`

Depois de criar o usuario no Supabase Auth, insira o email dele na tabela `admin_users`:

```sql
insert into admin_users (email) values ('admin@seu-dominio.com');
```

## Roadmap Para Acessar o Site

Se voce quer ir direto ao ponto, siga este roteiro:

1. Criar o projeto no Supabase
2. Copiar `Project URL` e `anon public key`
3. Preencher o arquivo `.env`
4. Executar `supabase/migrations/001_initial_schema.sql`
5. Executar `supabase/migrations/002_public_access_policies.sql`
6. Executar `supabase/seed.sql`
7. Executar `supabase/migrations/004_admin_auth_policies.sql`
8. Rodar `npm run dev` para testar localmente
9. Fazer deploy no Netlify
10. Abrir a URL gerada pelo Netlify

O passo a passo completo esta em [`ROADMAP_ACESSO.md`](./ROADMAP_ACESSO.md).

## Banco de Dados (Supabase)

Execute o migration script no SQL Editor do Supabase:

1. Acesse o dashboard do Supabase
2. Va para SQL Editor
3. Cole o conteudo de `supabase/migrations/001_initial_schema.sql`
4. Execute

Depois, rode também `supabase/migrations/004_admin_auth_policies.sql` para proteger as alteracoes administrativas com o email autorizado.

## Desenvolvimento Local

```bash
npm run dev
```

O frontend sera executado em http://localhost:5173

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
- Painel admin protegido por login real no Supabase Auth
- Atualizacao automatica dos jogos do Brasil quando a API estiver configurada
- Fallback local para testes quando o Supabase estiver vazio ou bloqueado

## Regras de Pontuacao

| Resultado | Pontos |
|-----------|--------|
| Acertou o resultado | 1 ponto |
| Errou | 0 pontos |
