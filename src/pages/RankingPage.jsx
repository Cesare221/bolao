import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { RankingTable } from '../components/RankingTable'

export default function RankingPage() {
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRankings() {
      const { data } = await supabase
        .from('rankings')
        .select('*')
        .order('total_points', { ascending: false })
      setRankings(data || [])
      setLoading(false)
    }
    fetchRankings()
  }, [])

  return (
    <div className="page ranking-page">
      <h1 className="page-title">Ranking</h1>
      {loading ? (
        <p className="loading">Carregando...</p>
      ) : (
        <RankingTable rankings={rankings} />
      )}
    </div>
  )
}
