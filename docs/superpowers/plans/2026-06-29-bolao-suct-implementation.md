# BOLï¿½O SUCT - Plano de Implementaï¿½ï¿½o

> **Para agentes:** Use superpowers:subagent-driven-development ou superpowers:executing-plans

**Objetivo:** Construir aplicaï¿½ï¿½o mobile-first de bolï¿½o para jogos do Brasil na Copa

**Arquitetura:** React + Vite + Netlify Functions + Supabase + API-Football

**Stack:** React 18, Vite, Netlify Functions, Supabase, API-Football

---

## Tarefa 1: Inicializar Projeto

**Arquivos:**
- Criar: package.json
- Criar: vite.config.js
- Criar: index.html
- Criar: .gitignore

- [ ] **Passo 1: Criar package.json**

package.json:
`
{
  "name": "bolao-suct",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@supabase/supabase-js": "^2.39.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
`

- [ ] **Passo 2: Instalar dependï¿½ncias**

Run: npm install

- [ ] **Passo 3: Commit**

git add . && git commit -m "chore: inicializa projeto com vite e react"

---

## Tarefa 2: Configurar Supabase e Schema

**Arquivos:**
- Criar: src/lib/supabaseClient.js
- Criar: supabase/migrations/001_initial_schema.sql
- Criar: .env.example

- [ ] **Passo 1: Cliente Supabase**

`javascript
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)
`

- [ ] **Passo 2: Schema do banco**

SQL para tabelas: participants, matches, predictions, rankings

- [ ] **Passo 3: Commit**

git add . && git commit -m "feat: adiciona cliente supabase e schema"

---

## Tarefa 3: Criar Serviï¿½o de API

**Arquivos:**
- Criar: src/services/footballApiService.js

- [ ] **Passo 1: Serviï¿½o isolado**

`javascript
class FootballApiService {
  async getBrazilMatches() { ... }
  async getLiveScore(fixtureId) { ... }
}
`

- [ ] **Passo 2: Commit**

git add . && git commit -m "feat: adiciona serviï¿½o de api football"

---

## Tarefa 4: Funï¿½ï¿½es Utilitï¿½rias

**Arquivos:**
- Criar: src/utils/scoring.js
- Criar: src/utils/dateHelpers.js

- [ ] **Passo 1: Regras de pontuaï¿½ï¿½o**

`javascript
export function calculatePoints(prediction, actual) { ... }
`

- [ ] **Passo 2: Helpers de data**

`javascript
export function isBeforeMatch(matchDate, hoursBefore) { ... }
`

- [ ] **Passo 3: Commit**

git add . && git commit -m "feat: adiciona utilitï¿½rios"

---

## Tarefa 5: Componentes Reutilizï¿½veis

**Arquivos:**
- Criar: src/components/MatchCard.jsx
- Criar: src/components/PredictionForm.jsx
- Criar: src/components/RankingTable.jsx
- Criar: src/components/AdminLayout.jsx

- [ ] **Passo 1-4: Criar componentes**

- [ ] **Passo 5: Commit**

git add . && git commit -m "feat: adiciona componentes reutilizï¿½veis"

---

## Tarefa 6: Pï¿½ginas

**Arquivos:**
- Criar: src/pages/HomePage.jsx
- Criar: src/pages/MatchesPage.jsx
- Criar: src/pages/PredictionPage.jsx
- Criar: src/pages/RankingPage.jsx
- Criar: src/pages/AdminPage.jsx

- [ ] **Passo 1-5: Criar pï¿½ginas**

- [ ] **Passo 6: Commit**

git add . && git commit -m "feat: adiciona pï¿½ginas"

---

## Tarefa 7: Roteamento e Layout

**Arquivos:**
- Criar: src/App.jsx
- Criar: src/main.jsx
- Criar: src/App.css

- [ ] **Passo 1: Rotas**

`jsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/jogos" element={<MatchesPage />} />
    <Route path="/palpite/:matchId" element={<PredictionPage />} />
    <Route path="/ranking" element={<RankingPage />} />
    <Route path="/admin" element={<AdminPage />} />
  </Routes>
</BrowserRouter>
`

- [ ] **Passo 2: Commit**

git add . && git commit -m "feat: adds routing and layout"

---

## Tarefa 8: Netlify Functions

**Arquivos:**
- Criar: netlify/functions/getBrazilMatches.js
- Criar: netlify/functions/getLiveScore.js
- Criar: netlify/functions/calculateRankings.js

- [ ] **Passo 1-3: Criar functions**

- [ ] **Passo 4: Commit**

git add . && git commit -m "feat: adds netlify functions"

---

## Tarefa 9: Configuraï¿½ï¿½o e Deploy

**Arquivos:**
- Criar: netlify.toml
- Criar: README.md
- Criar: .env.example

---

## Resumo das Variï¿½veis de Ambiente

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
API_FOOTBALL_KEY=
ADMIN_PASSWORD=
