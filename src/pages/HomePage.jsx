import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { MatchCard } from '../components/MatchCard'

export default function HomePage() {
  const [nextMatch, setNextMatch] = useState(null)
  const [nextMatchPrediction, setNextMatchPrediction] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: true })
        .gte('match_date', new Date().toISOString())
        .limit(1)

      if (matches && matches.length > 0) {
        setNextMatch(matches[0])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <div className="page home-page">
      <header className="app-header">
        <h1 className="app-title">BOLAO SUCT</h1>
        <p className="app-subtitle">Bolao interno dos jogos do Brasil na Copa do Mundo</p>
      </header>

      <main className="home-content">
        {loading ? (
          <p className="loading">Carregando...</p>
        ) : nextMatch ? (
          <section className="next-match-section">
            <h2 className="section-title">Proximo Jogo</h2>
            <MatchCard match={nextMatch} prediction={nextMatchPrediction} />
            <Link to={`/palpite/${nextMatch.id}`} className="btn-primary">
              Enviar meu palpite
            </Link>
          </section>
        ) : (
          <section className="next-match-section">
            <p className="empty-state">Nenhum jogo do Brasil agendado ainda.</p>
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
