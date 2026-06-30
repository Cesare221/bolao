import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { MatchCard } from '../components/MatchCard'
import { syncBrazilMatches } from '../services/matchSync'
import { getLocalMatches } from '../services/localStore'
import { CalendarDays, RefreshCw } from 'lucide-react'

export default function MatchesPage() {
  const [matches, setMatches] = useState([])
  const [selectedMatchId, setSelectedMatchId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMatches() {
      await syncBrazilMatches()

      const { data } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: true })

      const nextMatches = data && data.length > 0 ? data : getLocalMatches()
      setMatches(nextMatches)
      setSelectedMatchId(nextMatches[0]?.id || null)
      setLoading(false)
    }

    fetchMatches()
  }, [])

  const selectedMatch = useMemo(
    () => matches.find(match => match.id === selectedMatchId) || matches[0] || null,
    [matches, selectedMatchId]
  )

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
          <div className="matches-strip" role="tablist" aria-label="Jogos do Brasil">
            {matches.length === 0 ? (
              <p className="empty-state">Nenhum jogo do Brasil cadastrado ainda.</p>
            ) : (
              matches.map(match => {
                const isActive = match.id === (selectedMatch?.id || selectedMatchId)
                return (
                  <button
                    key={match.id}
                    type="button"
                    className={`match-chip ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedMatchId(match.id)}
                  >
                    <span className="match-chip-date">
                      {new Date(match.match_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                    <span className="match-chip-row">
                      <span className="match-chip-score">
                        {match.brazil_score !== null && match.opponent_score !== null
                          ? `${match.brazil_score} x ${match.opponent_score}`
                          : 'BR x ?'}
                      </span>
                      <span className={`match-chip-status status-${match.status?.toLowerCase() || 'ns'}`}>
                        {match.status === 'FT' ? 'ENCERRADO' : 'AGUARDANDO'}
                      </span>
                    </span>
                    <span className="match-chip-opponent">BR x {match.opponent}</span>
                  </button>
                )
              })
            )}
          </div>

          {selectedMatch && (
            <div className="selected-match-shell">
              <MatchCard match={selectedMatch} />
              {selectedMatch.is_finished ? (
                <div className="closed-message">
                  <p>Palpites Encerrados</p>
                  <span>Este jogo ja comecou. Nao e mais possivel enviar palpites.</span>
                </div>
              ) : (
                <Link to={`/palpite/${selectedMatch.id}`} className="btn-primary">
                  Palpitar agora
                </Link>
              )}
            </div>
          )}

          <div className="matches-footer-actions">
            <Link to="/ranking" className="btn-secondary">Ver ranking</Link>
          </div>
        </>
      )}
    </div>
  )
}
