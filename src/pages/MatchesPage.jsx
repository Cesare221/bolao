import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { MatchCard } from '../components/MatchCard'

export default function MatchesPage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMatches() {
      const { data } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: true })
      setMatches(data || [])
      setLoading(false)
    }
    fetchMatches()
  }, [])

  return (
    <div className="page matches-page">
      <h1 className="page-title">Jogos do Brasil</h1>
      {loading ? (
        <p className="loading">Carregando...</p>
      ) : (
        <div className="matches-list">
          {matches.length === 0 ? (
            <p className="empty-state">Nenhum jogo encontrado.</p>
          ) : (
            matches.map(match => (
              <Link to={`/palpite/${match.id}`} key={match.id} className="match-link">
                <MatchCard match={match} />
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
