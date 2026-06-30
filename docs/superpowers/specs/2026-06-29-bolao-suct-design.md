# BOLÃO SUCT - Documento de Design

**Data:** 2026-06-29  
**Versão:** 1.0  
**Status:** Aprovado

---

## 1. Visão Geral

Sistema web de bolão interno para empresa, focado exclusivamente nos jogos do Brasil na Copa do Mundo. O sistema permite que até 15 participantes façam palpites e acompanhem o ranking atualizado.

**Nome do Sistema:** BOLÃO SUCT  
**Crédito:** Desenvolvido por Cesar Augusto  
**Plataforma:** 100% Mobile-First (exclusivamente para celular)

---

## 2. Arquitetura

### 2.1 Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite |
| Hospedagem | Netlify (static hosting + functions) |
| Backend | Netlify Functions (serverless) |
| Banco de Dados | Supabase (PostgreSQL) |
| API Externa | API-Football |
| Autenticação | Nenhuma (nome + setor apenas) |

### 2.2 Estrutura de Pastas

```
bolao-suct/
├── netlify/
│   └── functions/
│       ├── getBrazilMatches.js    # Busca jogos do Brasil
│       ├── getLiveScore.js        # Placar ao vivo
│       └── calculateRankings.js   # Recalcula ranking
├── src/
│   ├── components/
│   │   ├── MatchCard.jsx
│   │   ├── PredictionForm.jsx
│   │   ├── RankingTable.jsx
│   │   └── AdminLayout.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── MatchesPage.jsx
│   │   ├── PredictionPage.jsx
│   │   ├── RankingPage.jsx
│   │   └── AdminPage.jsx
│   ├── services/
│   │   └── footballApiService.js  # Service isolado para API
│   ├── lib/
│   │   └── supabaseClient.js      # Cliente Supabase
│   ├── utils/
│   │   ├── scoring.js             # Regras de pontuação
│   │   └── dateHelpers.js         # Helpers de data
│   └── App.jsx
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── public/
├── netlify.toml
├── package.json
└── README.md
```

---

## 3. Design Mobile-First

### 3.1 Estratégia Mobile-Only

O sistema será desenvolvido **exclusivamente para dispositivos móveis**, não havendo consideração para layouts desktop.

- **Viewport:** 320px - 428px (mobile padrão)
- **Touch targets:** Mínimo 44x44px
- **Fontes:** Legíveis em telas pequenas (mínimo 16px)
- **Navegação:** Bottom tab bar para fácil acesso
- **Cards:** Layout em pilha vertical, full-width

### 3.2 Paleta de Cores (Brasil)

| Cor | Hex | Uso |
|-----|-----|-----|
| Verde Escuro | #006400 | Header, botões primários |
| Verde Limão | #32CD32 | Destaques, acertos |
| Amarelo | #FFD700 | Destaque Brasil, pódio 1º |
| Azul Royal | #0000CD | Secundário, links |
| Azul Claro | #87CEEB | Backgrounds, cards |
| Branco | #FFFFFF | Texto, backgrounds |
| Vermelho | #DC143C | Erros, alertas |
| Cinza Claro | #F5F5F5 | Background geral |

### 3.3 Componentes Visuais

- **Header:** Verde escuro com logo "BOLÃO SUCT" e credencial "Desenvolvido por Cesar Augusto"
- **Cards de Jogos:** Full-width, rounded corners, shadow suave, bandeira do Brasil e adversário
- **Bottom Navigation:** 4 itens (Home, Jogos, Ranking, Admin)
- **Ranking Pódio:** Destaque visual para top 3 com coroas/medalhas
- **Formulários:** Inputs grandes, botões full-width, feedback visual imediato

---

## 4. Funcionalidades

### 4.1 Página Inicial (Home)

- Nome do sistema: **BOLÃO SUCT**
- Slogan: "Bolão interno dos jogos do Brasil na Copa do Mundo"
- Destaque para o próximo jogo do Brasil (card grande)
- Botão "Enviar meu palpite" (se hoje tiver jogo)
- Botão "Ver ranking" destacado
- Credencial: "Desenvolvido por Cesar Augusto" no footer

### 4.2 Jogos do Brasil

- Lista vertical de cards com todos os jogos
- Cada card exibe:
  - Seleção adversária (nome + bandeira)
  - Data e horário (formato brasileiro)
  - Status: Não iniciado / Ao vivo / Intervalo / Encerrado
  - Placar atual (atualizado automaticamente via API)
  - Se o usuário já palpitou, mostrar o palpite

### 4.3 Envio de Palpite

- Campos:
  - Nome do participante (texto)
  - Setor/departamento (opcional)
  - Palpite placar Brasil (número)
  - Palpite placar adversário (número)
- Validações:
  - Nome obrigatório
  - Máximo de 2 palpites por pessoa no total
  - Bloquear envio/edição após o início da partida (1 hora antes)
  - Não permitir palpite em jogo encerrado
- Feedback: Toast de sucesso ou erro

### 4.4 Ranking

- Lista de participantes ordenada por pontuação
- Destaque visual para top 3 (pódio com cores dourada, prata, bronze)
- Informações exibidas:
  - Posição
  - Nome
  - Setor
  - Pontuação total
  - Placares exatos (5 pts)
  - Acertos de vencedor/empate (3 pts)
- Atualização automática após cada jogo

### 4.5 Regras de Pontuação

| Resultado | Pontos |
|-----------|--------|
| Placar exato | 5 pontos |
| Acertou vencedor ou empate | 3 pontos |
| Errou | 0 pontos |

### 4.6 Admin Simples

- Acesso por senha via variável de ambiente `ADMIN_PASSWORD`
- URL: `/admin`
- Funcionalidades:
  - Visualizar todos os palpites (tabela)
  - Cadastrar/editar jogos manualmente
  - Confirmar resultado final manualmente (caso API falhe)
  - Botão "Recalcular ranking"
  - Estatísticas gerais (total de palpites, participantes, etc.)

---

## 5. Integração com API

### 5.1 Netlify Functions

**getBrazilMatches:**
- Endpoint: `/.netlify/functions/getBrazilMatches`
- Método: GET
- Busca na API-Football fixtures do Brasil (team_id = 6)
- Cache de 5 minutos para evitar rate limits
- Retorna: lista de jogos formatada

**getLiveScore:**
- Endpoint: `/.netlify/functions/getLiveScore`
- Busca placar atual de um jogo específico
- Retorna: placar atual, status, tempo

**calculateRankings:**
- Endpoint: `/.netlify/functions/calculateRankings`
- Calcula pontuação de todos participantes
- Atualiza tabela `rankings`
- Retorna: ranking atualizado

### 5.2 Service Isolado (footballApiService.js)

```javascript
// src/services/footballApiService.js
// Facilita troca de API no futuro
class FootballApiService {
  async getBrazilMatches() { ... }
  async getLiveScore(matchId) { ... }
  async getMatchDetails(matchId) { ... }
}
```

### 5.3 Variáveis de Ambiente

```
SUPABASE_URL=<url-do-supabase>
SUPABASE_ANON_KEY=<chave-anonima>
API_FOOTBALL_KEY=<chave-api-football>
ADMIN_PASSWORD=<senha-admin>
```

---

## 6. Banco de Dados (Supabase)

### 6.1 Tabelas

**participants:**
```sql
id: uuid (PK)
name: text (not null)
sector: text
prediction_count: int (default 0, max 2)
created_at: timestamp
```

**matches:**
```sql
id: uuid (PK)
api_id: int (ID da API Football)
opponent: text
opponent_flag: text
match_date: timestamp
brazil_score: int
opponent_score: int
status: text (NS, LIVE, HT, FT)
is_finished: boolean
created_at: timestamp
```

**predictions:**
```sql
id: uuid (PK)
participant_id: uuid (FK)
match_id: uuid (FK)
brazil_score: int
opponent_score: int
points: int (default 0)
created_at: timestamp
```

**rankings (view materializada ou tabela):**
```sql
participant_id: uuid (PK, FK)
participant_name: text
sector: text
total_points: int
exact_scores: int
correct_outcomes: int
updated_at: timestamp
```

### 6.2 Índices e Constraints

- Unique constraint em `predictions` para `participant_id + match_id`
- Índice em `matches.match_date`
- Índice em `predictions.participant_id`
- Check: `prediction_count <= 2` em participants

---

## 7. Fluxo de Dados (Data Flow)

### 7.1 Busca de Jogos
```
Usuario -> HomePage -> getBrazilMatches (Netlify Function) 
-> API-Football -> Cache Supabase -> Retorna jogos
```

### 7.2 Envio de Palpite
```
Usuario -> PredictionForm -> Supabase (predictions)
-> Trigger atualiza prediction_count -> Feedback sucesso
```

### 7.3 Atualização de Placar
```
Netlify Function (cron ou manual) -> API-Football 
-> Atualiza matches -> Trigger recalcula predictions.points
-> Atualiza rankings
```

### 7.4 Cálculo de Ranking
```
Recalcular -> Para cada prediction:
  - Se placar exato: 5 pts
  - Se acertou vencedor/empate: 3 pts
  - Senão: 0 pts
-> Soma por participante -> Atualiza rankings
```

---

## 8. Error Handling

### 8.1 API-Football Indisponível
- Fallback: Usar dados cadastrados manualmente pelo admin
- Status do jogo: "Status não disponível"
- Placar: "-" ou último valor conhecido

### 8.2 Limite de Palpites
- Frontend: Desabilitar botão após 2 palpites
- Backend: Validar `prediction_count <= 2` antes de inserir
- Mensagem: "Você já usou seus 2 palpites!"

### 8.3 Palpite Após Início do Jogo
- Verificar `match_date` (1 hora antes)
- Bloquear envio/edição
- Mensagem: "Palpites encerrados para este jogo!"

### 8.4 Supabase Offline
- Mensagem: "Erro de conexão. Tente novamente."
- Retry automático (3 tentativas)

---

## 9. Cron Job (Opcional)

Para atualização automática de placares:
- Netlify não suporta cron nativamente no tier free
- Alternativa: Atualização manual pelo admin ou trigger ao carregar a página
- Ou usar serviço externo (cron-job.org) para ping a cada 5 min

---

## 10. Deploy

### 10.1 Netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[dev]
  command = "npm run dev"
  targetPort = 5173

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 10.2 Variáveis de Ambiente no Netlify

Configurar no painel do Netlify:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- API_FOOTBALL_KEY
- ADMIN_PASSWORD

### 10.3 Supabase Migrations

Rodar via CLI do Supabase:
```bash
npx supabase migration up
```

---

## 11. Considerações Finais

### 11.1 Limitações
- Máximo 15 participantes
- 2 palpites por pessoa
- Somente jogos do Brasil
- API-Football pode ter limites de requisição

### 11.2 Próximos Passos
1. Implementar estrutura base (Vite + React)
2. Configurar Supabase e criar tabelas
3. Implementar Netlify Functions
4. Construir componentes frontend (mobile-first)
5. Testar fluxo completo
6. Deploy no Netlify

---

## 12. Changelog

- v1.0 (2026-06-29): Documento inicial aprovado

---

**Aprovado por:** Cesar Augusto  
**Data de Aprovação:** 2026-06-29
