import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { MatchCard } from '../components/MatchCard'
import { syncBrazilMatches } from '../services/matchSync'
import { getDeletedMatchIds, getLocalMatches } from '../services/localStore'
import { CalendarDays, CheckCircle2, RefreshCw } from 'lucide-react'

export default function MatchesPage() {
  const [matches, setMatches] = useState([])
  const [selectedMatchId, setSelectedMatchId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMatches() {
      await syncBrazilMatches()
      const deletedMatchIds = new Set(getDeletedMatchIds().map(String))

      const { data } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: false })

      const nextMatches = isSupabaseConfigured
        ? (data || [])
        : getLocalMatches()
        .filter(match => !deletedMatchIds.has(String(match.id)) && !deletedMatchIds.has(String(match.api_id)))

      const latestFinishedMatch = [...nextMatches]
        .filter(match => match.is_finished)
        .sort((a, b) => new Date(b.match_date) - new Date(a.match_date))[0]
      const firstOpenMatch = latestFinishedMatch || nextMatches.find(match => !match.is_finished) || nextMatches[0] || null

      setMatches(nextMatches)
      setSelectedMatchId(firstOpenMatch?.id || null)
      setLoading(false)
    }

    fetchMatches()
  }, [])

  const selectedMatch = useMemo(
    () => matches.find(match => match.id === selectedMatchId) || matches[0] || null,
    [matches, selectedMatchId]
  )

  const upcomingMatches = useMemo(
    () => matches.filter(match => !match.is_finished),
    [matches]
  )

  const finishedMatches = useMemo(
    () => [...matches]
      .filter(match => match.is_finished)
      .sort((a, b) => new Date(b.match_date) - new Date(a.match_date)),
    [matches]
  )

  const highlightedMatch = selectedMatch || upcomingMatches[0] || matches[0] || null
  const heroTitle = highlightedMatch?.is_finished ? 'Último resultado' : 'Próximo jogo'

  return (
    <div className="page matches-page">
      <div className="page-hero compact">
        <div className="page-hero-chip"><CalendarDays size={14} /> Jogos e palpites</div>
        <h1 className="page-title">Jogos e Palpites</h1>
        <p className="page-subtitle">Toque em um jogo para ver os detalhes e palpitar.</p>
      </div>

      {loading ? (
        <p className="loading"><RefreshCw className="spin" size={18} /> Carregando...</p>
      ) : (
        <>
          {highlightedMatch && (
            <section className="featured-match-section">
              <div className="section-heading">
                <h2 className="section-title"><CalendarDays size={18} /> {heroTitle}</h2>
                <span className="section-kicker">Destaque principal</span>
              </div>
              <div className="selected-match-shell">
                <MatchCard match={highlightedMatch} />
                {highlightedMatch.is_finished ? (
                  <div className="closed-message">
                    <p>Palpites Encerrados</p>
                    <span>Este jogo já começou. Não é mais possível enviar palpites.</span>
                  </div>
                ) : (
                  <Link to={`/palpite/${highlightedMatch.id}`} className="btn-primary">
                    Palpitar agora
                  </Link>
                )}
              </div>
            </section>
          )}

          {upcomingMatches.length > 0 && (
            <section className="matches-section">
              <div className="section-heading">
                <h2 className="section-title"><CalendarDays size={18} /> Jogos abertos</h2>
                <span className="section-kicker">{upcomingMatches.length} disponíveis</span>
              </div>
              <div className="match-list-vertical">
                {upcomingMatches.map(match => (
                  <button
                    key={match.id}
                    type="button"
                    className={`match-row-card ${match.id === highlightedMatch?.id ? 'active' : ''}`}
                    onClick={() => setSelectedMatchId(match.id)}
                  >
                    <div className="match-row-topline">
                      <span>{new Date(match.match_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                      <span className={`match-row-status status-${match.status?.toLowerCase() || 'ns'}`}>
                        {match.status === 'FT' ? 'ENCERRADO' : 'AGUARDANDO'}
                      </span>
                    </div>
                    <strong className="match-row-title">Brasil x {match.opponent}</strong>
                    <span className="match-row-score">
                      {match.brazil_score !== null && match.opponent_score !== null
                        ? `${match.brazil_score} x ${match.opponent_score}`
                        : 'Placar ainda não definido'}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="matches-section">
            <div className="section-heading">
              <h2 className="section-title"><CheckCircle2 size={18} /> Jogos encerrados</h2>
              <span className="section-kicker">{finishedMatches.length} resultados</span>
            </div>
            {finishedMatches.length === 0 ? (
              <p className="empty-state">Ainda não há jogos encerrados.</p>
            ) : (
              <div className="match-list-vertical">
                {finishedMatches.map(match => (
                  <button
                    key={match.id}
                    type="button"
                    className={`match-row-card compact ${match.id === highlightedMatch?.id ? 'active' : ''}`}
                    onClick={() => setSelectedMatchId(match.id)}
                  >
                    <div className="match-row-topline">
                      <span>{new Date(match.match_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                      <span className="match-row-status status-ft">ENCERRADO</span>
                    </div>
                    <strong className="match-row-title">Brasil x {match.opponent}</strong>
                    <span className="match-row-score">
                      {match.brazil_score} x {match.opponent_score}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <div className="matches-footer-actions">
            <Link to="/ranking" className="btn-secondary">Ver ranking</Link>
          </div>
        </>
      )}
    </div>
  )
}
