import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { isBeforeMatch } from '../utils/dateHelpers'
import { PredictionForm } from '../components/PredictionForm'
import { MatchCard } from '../components/MatchCard'
import { MatchPredictionsList } from '../components/MatchPredictionsList'
import { syncBrazilMatches } from '../services/matchSync'
import { getDeletedMatchIds, getLocalMatchById } from '../services/localStore'
import { ArrowLeft, ShieldAlert } from 'lucide-react'

export default function PredictionPage() {
  const { matchId } = useParams()
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [prediction, setPrediction] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    async function fetchMatch() {
      try {
        await syncBrazilMatches()
        const deletedMatchIds = new Set(getDeletedMatchIds().map(String))

        const { data } = await supabase
          .from('matches')
          .select('*')
          .eq('id', matchId)
          .single()

        const localMatch = isSupabaseConfigured ? null : getLocalMatchById(matchId)
        const nextMatch = data && !deletedMatchIds.has(String(data.id)) && !deletedMatchIds.has(String(data.api_id))
          ? data
          : localMatch && !deletedMatchIds.has(String(localMatch.id)) && !deletedMatchIds.has(String(localMatch.api_id))
            ? localMatch
            : null

        setMatch(nextMatch)
      } catch {
        if (!isSupabaseConfigured) {
          const localMatch = getLocalMatchById(matchId)
          setMatch(localMatch)
        } else {
          setMatch(null)
        }
      } finally {
        setLoading(false)
      }
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
        <PredictionForm match={match} onSuccess={() => setRefreshKey(value => value + 1)} />
      ) : (
        <div className="closed-message">
          <p>Palpites encerrados para este jogo!</p>
        </div>
      )}
      <MatchPredictionsList key={refreshKey} matchId={match.id} />
      <Link to="/jogos" className="btn-link-back">
        <ArrowLeft size={16} />
        Voltar aos jogos
      </Link>
    </div>
  )
}
