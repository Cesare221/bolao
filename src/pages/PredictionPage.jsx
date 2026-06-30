import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { isBeforeMatch } from '../utils/dateHelpers'
import { PredictionForm } from '../components/PredictionForm'
import { MatchCard } from '../components/MatchCard'
import { syncBrazilMatches } from '../services/matchSync'
import { getLocalMatchById } from '../services/localStore'
import { ArrowLeft, ShieldAlert } from 'lucide-react'

export default function PredictionPage() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [prediction, setPrediction] = useState(null)

  useEffect(() => {
    async function fetchMatch() {
      await syncBrazilMatches()

      const { data } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single()

      setMatch(data || getLocalMatchById(matchId))
      setLoading(false)
    }

    fetchMatch()
  }, [matchId])

  if (loading) return <div className="page"><p className="loading">Carregando...</p></div>
  if (!match) return <div className="page"><p className="empty-state">Jogo do Brasil nao encontrado</p></div>

  const canPredict = (match.is_test || isBeforeMatch(match.match_date, 1)) && !match.is_finished

  return (
    <div className="page prediction-page">
      <div className={`page-hero compact ${match.is_test ? 'test-mode' : ''}`}>
        <div className="page-hero-chip"><ShieldAlert size={14} /> Palpite do Brasil</div>
        <h1 className="page-title">Enviar Palpite</h1>
        <p className="page-subtitle">
          {match.is_test ? 'Modo de teste ativo. Você pode enviar palpite agora.' : 'Escolha seu placar antes da bola rolar.'}
        </p>
      </div>
      <MatchCard match={match} prediction={prediction} />
      {canPredict ? (
        <PredictionForm match={match} onSuccess={() => navigate('/ranking')} />
      ) : (
        <div className="closed-message">
          <p>Palpites encerrados para este jogo!</p>
        </div>
      )}
      <Link to="/jogos" className="btn-link-back">
        <ArrowLeft size={16} />
        Voltar aos jogos
      </Link>
    </div>
  )
}
