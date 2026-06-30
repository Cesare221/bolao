import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { MatchCard } from '../components/MatchCard'
import { syncBrazilMatches } from '../services/matchSync'
import { getDeletedMatchIds, getLocalMatches } from '../services/localStore'
import { ArrowRight, CalendarDays, Sparkles, Trophy } from 'lucide-react'

export default function HomePage() {
  const [nextMatch, setNextMatch] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      await syncBrazilMatches()
      const deletedMatchIds = new Set(getDeletedMatchIds().map(String))
      const sortByRecent = (a, b) => new Date(b.match_date) - new Date(a.match_date)

      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: false })

      const visibleMatches = (matches && matches.length > 0 ? matches : getLocalMatches())
        .filter(match => !deletedMatchIds.has(String(match.id)) && !deletedMatchIds.has(String(match.api_id)))

      if (visibleMatches.length > 0) {
        const latestFinishedMatch = [...visibleMatches]
          .filter(match => match.is_finished)
          .sort(sortByRecent)[0]
        setNextMatch(latestFinishedMatch || [...visibleMatches].sort(sortByRecent)[0])
      } else {
        const localMatches = getLocalMatches().filter(match => !deletedMatchIds.has(String(match.id)) && !deletedMatchIds.has(String(match.api_id)))
        const latestLocalMatch = [...localMatches].sort(sortByRecent)[0] || null
        setNextMatch(latestLocalMatch)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <div className="page home-page">
      <header className="home-hero">
        <div className="hero-trophy" aria-hidden="true">
          <Trophy size={92} strokeWidth={1.6} />
        </div>
        <div className="hero-badge">
          <Sparkles size={14} />
          Bolão da UCT
        </div>
        <h1 className="app-title">Bolão da UCT</h1>
        <p className="app-subtitle">Faça seus palpites para os jogos da seleção.</p>
        <div className="hero-pills">
        </div>
      </header>

      <main className="home-content">
        {loading ? (
          <p className="loading">Carregando...</p>
        ) : nextMatch ? (
          <section className="next-match-section">
            <div className="section-heading">
              <h2 className="section-title">Último Jogo</h2>
              <span className="section-kicker">Atualizado automaticamente</span>
            </div>
            <MatchCard match={nextMatch} />
            {nextMatch.is_finished ? (
              <Link to="/jogos" className="btn-primary">
                <span>Ver jogos</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <Link to={`/palpite/${nextMatch.id}`} className="btn-primary">
                <span>Enviar meu palpite</span>
                <ArrowRight size={18} />
              </Link>
            )}
          </section>
        ) : (
          <section className="next-match-section">
            <div className="empty-panel">
              <Sparkles size={22} />
              <p className="empty-state">Nenhum jogo do Brasil na Copa agendado ainda.</p>
            </div>
          </section>
        )}

        <div className="home-actions">
          <Link to="/jogos" className="btn-secondary">Ver todos os jogos</Link>
          <Link to="/ranking" className="btn-secondary">Ver ranking</Link>
        </div>
      </main>

      <footer className="app-footer">
        <p>Desenvolvido por Cesar Augusto</p>
      </footer>
    </div>
  )
}
