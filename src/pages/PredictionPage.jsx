import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { isBeforeMatch } from '../utils/dateHelpers'
import { PredictionForm } from '../components/PredictionForm'
import { MatchCard } from '../components/MatchCard'

export default function PredictionPage() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [prediction, setPrediction] = useState(null)

  useEffect(() => {
    async function fetchMatch() {
      const { data } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single()
      setMatch(data)
      setLoading(false)
    }
    fetchMatch()
  }, [matchId])

  if (loading) return <div className="page"><p className="loading">Carregando...</p></div>
  if (!match) return <div className="page"><p className="empty-state">Jogo nao encontrado</p></div>

  const canPredict = isBeforeMatch(match.match_date, 1) && !match.is_finished

  return (
    <div className="page prediction-page">
      <h1 className="page-title">Enviar Palpite</h1>
      <MatchCard match={match} prediction={prediction} />
      {canPredict ? (
        <PredictionForm match={match} onSuccess={() => navigate('/ranking')} />
      ) : (
        <div className="closed-message">
          <p>Palpites encerrados para este jogo!</p>
        </div>
      )}
    </div>
  )
}
