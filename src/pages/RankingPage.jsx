import React, { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { RankingTable } from '../components/RankingTable'
import { syncBrazilMatches } from '../services/matchSync'
import { getLocalRankings } from '../services/localStore'
import { isExcludedParticipantName } from '../data/excludedParticipants'
import { Medal } from 'lucide-react'

function sortRankings(rankings) {
  return [...rankings].sort((a, b) => {
    if ((b.total_points || 0) !== (a.total_points || 0)) {
      return (b.total_points || 0) - (a.total_points || 0)
    }

    if ((b.exact_scores || 0) !== (a.exact_scores || 0)) {
      return (b.exact_scores || 0) - (a.exact_scores || 0)
    }

    return String(a.participant_name || '').localeCompare(String(b.participant_name || ''), 'pt-BR')
  })
}

export default function RankingPage() {
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRankings() {
      await syncBrazilMatches()

      const { data } = await supabase
        .from('rankings')
        .select('*')
        .order('total_points', { ascending: false })

      const rankingRows = isSupabaseConfigured
        ? (data || [])
        : getLocalRankings()
        .filter(row => !isExcludedParticipantName(row.participant_name))
      setRankings(sortRankings(rankingRows))
      setLoading(false)
    }

    fetchRankings()
  }, [])

  return (
    <div className="page ranking-page">
      <div className="page-hero compact">
        <div className="page-hero-chip"><Medal size={14} /> Ranking</div>
        <h1 className="page-title">Ranking Geral</h1>
        <p className="page-subtitle">Especialistas da empresa.</p>
      </div>
      {loading ? (
        <p className="loading">Carregando...</p>
      ) : (
        <RankingTable rankings={rankings} />
      )}
    </div>
  )
}
