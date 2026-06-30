# Graph Report - Bolao  (2026-06-29)

## Corpus Check
- 24 files · ~5,305 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 132 nodes · 152 edges · 16 communities (15 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9f7180a6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]

## God Nodes (most connected - your core abstractions)
1. `BOLÃO SUCT - Documento de Design` - 13 edges
2. `supabase` - 7 edges
3. `4. Funcionalidades` - 7 edges
4. `MatchCard()` - 6 edges
5. `FootballApiService` - 6 edges
6. `6.1 Tabelas` - 5 edges
7. `7. Fluxo de Dados (Data Flow)` - 5 edges
8. `8. Error Handling` - 5 edges
9. `scripts` - 4 edges
10. `3. Design Mobile-First` - 4 edges

## Surprising Connections (you probably didn't know these)
- `MatchCard()` --calls--> `getMatchStatus()`  [EXTRACTED]
  src/components/MatchCard.jsx → src/utils/dateHelpers.js
- `MatchCard()` --calls--> `formatDateTime()`  [EXTRACTED]
  src/components/MatchCard.jsx → src/utils/dateHelpers.js
- `PredictionPage()` --calls--> `isBeforeMatch()`  [EXTRACTED]
  src/pages/PredictionPage.jsx → src/utils/dateHelpers.js

## Communities (16 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.18
Nodes (8): MatchCard(), PredictionForm(), RankingTable(), supabase, PredictionPage(), formatDateTime(), getMatchStatus(), isBeforeMatch()

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (20): 11.1 Limitações, 11.2 Próximos Passos, 11. Considerações Finais, 12. Changelog, 1. Visão Geral, 2.1 Stack Tecnológico, 2.2 Estrutura de Pastas, 2. Arquitetura (+12 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (16): dependencies, react, react-dom, react-router-dom, @supabase/supabase-js, devDependencies, vite, @vitejs/plugin-react (+8 more)

### Community 3 - "Community 3"
Cohesion: 0.18
Nodes (10): Resumo das Variï¿½veis de Ambiente, Tarefa 1: Inicializar Projeto, Tarefa 2: Configurar Supabase e Schema, Tarefa 3: Criar Serviï¿½o de API, Tarefa 4: Funï¿½ï¿½es Utilitï¿½rias, Tarefa 5: Componentes Reutilizï¿½veis, Tarefa 6: Pï¿½ginas, Tarefa 7: Roteamento e Layout (+2 more)

### Community 4 - "Community 4"
Cohesion: 0.22
Nodes (9): 7.1 Busca de Jogos, 7.2 Envio de Palpite, 7.3 Atualização de Placar, 7.4 Cálculo de Ranking, 7. Fluxo de Dados (Data Flow), code:block10 (Netlify Function (cron ou manual) -> API-Football), code:block11 (Recalcular -> Para cada prediction:), code:block8 (Usuario -> HomePage -> getBrazilMatches (Netlify Function)) (+1 more)

### Community 6 - "Community 6"
Cohesion: 0.29
Nodes (7): 4.1 Página Inicial (Home), 4.2 Jogos do Brasil, 4.3 Envio de Palpite, 4.4 Ranking, 4.5 Regras de Pontuação, 4.6 Admin Simples, 4. Funcionalidades

### Community 7 - "Community 7"
Cohesion: 0.29
Nodes (7): 6.1 Tabelas, 6.2 Índices e Constraints, 6. Banco de Dados (Supabase), code:sql (id: uuid (PK)), code:sql (id: uuid (PK)), code:sql (id: uuid (PK)), code:sql (participant_id: uuid (PK, FK))

### Community 8 - "Community 8"
Cohesion: 0.38
Nodes (3): AdminLayout(), calculatePoints(), POINTS

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (5): actualOutcome, { createClient }, predictedOutcome, supabase, totalPoints

### Community 10 - "Community 10"
Cohesion: 0.33
Nodes (6): 10.1 Netlify.toml, 10.2 Variáveis de Ambiente no Netlify, 10.3 Supabase Migrations, 10. Deploy, code:toml ([build]), code:bash (npx supabase migration up)

### Community 11 - "Community 11"
Cohesion: 0.33
Nodes (6): 5.1 Netlify Functions, 5.2 Service Isolado (footballApiService.js), 5.3 Variáveis de Ambiente, 5. Integração com API, code:javascript (// src/services/footballApiService.js), code:block3 (SUPABASE_URL=<url-do-supabase>)

## Knowledge Gaps
- **65 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+60 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BOLÃO SUCT - Documento de Design` connect `Community 1` to `Community 4`, `Community 6`, `Community 7`, `Community 10`, `Community 11`?**
  _High betweenness centrality (0.159) - this node is a cross-community bridge._
- **Why does `7. Fluxo de Dados (Data Flow)` connect `Community 4` to `Community 1`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `4. Funcionalidades` connect `Community 6` to `Community 1`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _65 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._