import React, { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { getLocalPredictionsByMatchId } from '../services/localStore'
import { Users, Clock3 } from 'lucide-react'

function formatPredictionTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function MatchPredictionsList({ matchId }) {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function fetchPredictions() {
      setLoading(true)

      if (!isSupabaseConfigured) {
        if (mounted) {
          setPredictions(getLocalPredictionsByMatchId(matchId))
          setLoading(false)
        }
        return
      }

      const { data, error } = await supabase
        .from('predictions')
        .select('id,brazil_score,opponent_score,created_at, participants(name, sector)')
        .eq('match_id', matchId)
        .order('created_at', { ascending: false })

      if (!mounted) return

      if (error) {
        setPredictions([])
      } else {
        setPredictions(data || [])
      }

      setLoading(false)
    }

    fetchPredictions()

    return () => {
      mounted = false
    }
  }, [matchId])

  if (loading) {
    return (
      <section className="prediction-form">
        <h2>Palpites deste jogo</h2>
        <p className="loading">Carregando palpites...</p>
      </section>
    )
  }

  return (
    <section className="prediction-form">
      <h2>Palpites deste jogo</h2>
      {predictions.length === 0 ? (
        <p className="empty-state">Ainda nao ha palpites registrados para este jogo.</p>
      ) : (
        <div className="predictions-list">
          {predictions.map(prediction => (
            <div key={prediction.id} className="prediction-row">
              <div className="prediction-row-main">
                <strong>{prediction.participants?.name || 'Participante'}</strong>
                <span>
                  <Users size={13} /> {prediction.participants?.sector || 'Sem setor'}
                </span>
              </div>
              <div className="prediction-row-score">
                {prediction.brazil_score} x {prediction.opponent_score}
              </div>
              <div className="prediction-row-time">
                <Clock3 size={13} /> {formatPredictionTime(prediction.created_at)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
