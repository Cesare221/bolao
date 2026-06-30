# Guia Completo de Configuracao e Deploy - BOLAO SUCT

Guia passo a passo para configurar o Supabase e fazer o deploy no Netlify.

---

## Sumario

1. [Criar Conta no Supabase](#1-criar-conta-no-supabase)
2. [Criar Projeto no Supabase](#2-criar-projeto-no-supabase)
3. [Executar Migration (criar tabelas)](#3-executar-migration-criar-tabelas)
4. [Inserir Participantes](#4-inserir-participantes)
5. [Obter Credenciais do Supabase](#5-obter-credenciais-do-supabase)
6. [Criar Conta no Netlify](#6-criar-conta-no-netlify)
7. [Fazer Deploy no Netlify](#7-fazer-deploy-no-netlify)
8. [Configurar Variaveis de Ambiente no Netlify](#8-configurar-variaveis-de-ambiente-no-netlify)
9. [Testar o Sistema](#9-testar-o-sistema)
10. [Proximo Jogo - Sincronizar Dados](#10-proximo-jogo---sincronizar-dados)

---

## 1. Criar Conta no Supabase

1. Acesse https://supabase.com
2. Clique em "Start your project" ou "Sign in"
3. Faca login com sua conta do GitHub
4. Autorize o Supabase a acessar sua conta do GitHub

---

## 2. Criar Projeto no Supabase

1. No dashboard do Supabase, clique em "New project"
2. Preencha:
   - **Name:** `bolao-suct`
   - **Database Password:** Crie uma senha forte e GUARDE (ex: `Bolao@2026!`)
   - **Region:** Escolha "South America (Sao Paulo)" se disponivel, ou "US East"
   - **Pricing Plan:** Free (o suficiente para o bolao)
3. Clique em "Create new project"
4. Aguarde 2-3 minutos enquanto o banco e criado

---

## 3. Executar Migration (criar tabelas)

Apos o projeto criar, voce precisa criar as tabelas no banco:

1. No dashboard do Supabase, va em **SQL Editor** (menu lateral esquerdo)
2. Clique em **"New query"**
3. Abra o arquivo `supabase/migrations/001_initial_schema.sql` do seu projeto
4. Copie TODO o conteudo do arquivo
5. Cole no editor do Supabase
6. Clique em **"Run"** (ou Ctrl + Enter)
7. Voce vera "Success. No rows returned" - as tabelas foram criadas!

**Tabelas criadas:**
- `participants` - Participantes do bolao
- `matches` - Jogos do Brasil
- `predictions` - Palpites dos participantes
- `rankings` - Ranking com pontuacao

---

## 4. Inserir Participantes

Para inserir os participantes iniciais:

1. Ainda no SQL Editor, clique em "New query"
2. Abra o arquivo `supabase/seed.sql` do seu projeto
3. Copie o conteudo e cole no editor
4. Clique em "Run"

Isso criara os 12 participantes:
Adrianne, Fran, Stefany, Noel, Denise, Huainny, Andreza, Wilson, Regineide, Rafael, Carol, Giza

---

## 5. Obter Credenciais do Supabase

Voce precisara de 2 informacoes para conectar o frontend ao Supabase:

1. No menu lateral, va em **Project Settings** (icone de engrenagem)
2. Clique em **"API"** no menu
3. Anote os valores:
   - **Project URL** (ex: `https://abcdefghijkl.supabase.co`)
   - **anon public** key (uma string longa comecando com `eyJ...`)

Nao compartilhe a chave `service_role` - apenas a `anon public` e segura para o frontend.

---

## 6. Criar Conta no Netlify

1. Acesse https://netlify.com
2. Clique em "Sign up"
3. Faca login com sua conta do GitHub
4. Autorize o acesso

---

## 7. Fazer Deploy no Netlify

### Opcao A: Via GitHub (recomendado)

1. Crie um repositorio no GitHub:
   - Acesse https://github.com/new
   - Nome: `bolao-suct`
   - Visibilidade: Private
   - Nao inicie com README

2. Envie o codigo para o GitHub (pelo terminal):
   ```bash
   cd Desktop\PROJETOS\Bolao
   git remote add origin https://github.com/SEU_USUARIO/bolao-suct.git
   git push -u origin master
   ```

3. No Netlify:
   - Clique em "Add new site" > "Import an existing project"
   - Escolha "GitHub" e autorize
   - Selecione o repositorio `bolao-suct`
   - As configuracoes ja estao no `netlify.toml` - nao precisa alterar
   - Clique em "Deploy site"

4. Aguarde o build (cerca de 1-2 minutos)

### Opcao B: Via Drag and Drop (mais rapido)

1. No terminal, gere o build:
   ```bash
   cd Desktop\PROJETOS\Bolao
   npm run build
   ```

2. No Netlify, va em "Sites" e arraste a pasta `dist` para a area indicada
3. Apos o upload, va em Site Settings > Functions e certifique-se de que a pasta de functions esta configurada como `netlify/functions`

---

## 8. Configurar Variaveis de Ambiente no Netlify

Apos o deploy, configure as variaveis de ambiente:

1. No Netlify, va em **Site Settings** (do seu site)
2. Va em **Environment variables**
3. Clique em **"Add a variable"** e adicione UMA POR UMA:

   | Nome | Valor | Onde encontrar |
   |------|-------|----------------|
   | `VITE_SUPABASE_URL` | `https://SEU_PROJETO.supabase.co` | Supabase > Project Settings > API > Project URL |
   | `VITE_SUPABASE_ANON_KEY` | `eyJ...` (string longa) | Supabase > Project Settings > API > anon public |
   | `VITE_API_FOOTBALL_KEY` | Sua chave da API-Football | https://dashboard.api-football.com |
   | `VITE_ADMIN_PASSWORD` | `admin123` (ou a senha que quiser) | Voce escolhe |
   | `API_FOOTBALL_KEY` | Mesma chave acima (para as functions) | Repetir a chave |
   | `SUPABASE_URL` | Mesma URL acima (para as functions) | Repetir a URL |
   | `SUPABASE_ANON_KEY` | Mesma chave acima (para as functions) | Repetir a chave |

4. Apos adicionar todas, va em **Deploy > Trigger deploy > Deploy site** para recompilar com as variaveis

**Dica:** As variaveis que comecam com `VITE_` sao enviadas ao frontend. As sem `VITE_` (como `API_FOOTBALL_KEY`) ficam apenas nas Netlify Functions (protegidas).

---

## 9. Testar o Sistema

1. Acesse a URL do seu site no Netlify (ex: `https://bolao-suct.netlify.app`)
2. A pagina inicial deve mostrar "BOLAO SUCT"
3. Va em `/admin` e digite a senha que voce configurou
4. Va em "Novo Jogo" e cadastre o primeiro jogo do Brasil
5. Va em `/ranking` para ver os participantes

---

## 10. Proximo Jogo - Sincronizar Dados

### Para cadastrar um jogo manualmente:

1. Va em `/admin`
2. Va na aba "Novo Jogo"
3. Preencha:
   - Adversario: nome do time (ex: "Argentina")
   - Bandeira: emoji da bandeira (ex: "🇦🇷")
   - Data e horario: escolha no calendario
4. Clique em "Criar Jogo"

### Para atualizar o placar de um jogo encerrado:

1. Va em `/admin`
2. Va na aba "Jogos"
3. Digite o placar do Brasil e do adversario
4. Clique em "Salvar"
5. Clique em "Recalcular Ranking" para atualizar as pontuacoes

### Para usar a API automatica (API-Football):

1. Crie uma conta em https://www.api-football.com/
2. No plano gratuito, voce tem 100 requisicoes/dia
3. Configure a chave nas variaveis de ambiente do Netlify (`VITE_API_FOOTBALL_KEY` e `API_FOOTBALL_KEY`)
4. A function `getBrazilMatches` buscara os jogos automaticamente

---

## Solucao de Problemas

### "Erro de conexao" no site
- Verifique se as variaveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estao configuradas corretamente no Netlify
- Recompile o site apos alterar variaveis (Trigger deploy)

### Tabelas nao encontradas
- Execute o migration novamente no SQL Editor do Supabase
- Verifique se nao ha erros de sintaxe

### Palpite nao salva
- Verifique se o participante nao excedeu o limite de palpites
- Verifique se o jogo ja nao comecou

### Login admin nao funciona
- Verifique se `VITE_ADMIN_PASSWORD` esta configurada no Netlify
- A senha e case-sensitive

---

## Links Uteis

- Supabase Dashboard: https://supabase.com/dashboard
- Netlify Dashboard: https://app.netlify.com
- API-Football: https://www.api-football.com/
