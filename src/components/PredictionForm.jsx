import React, { useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { saveLocalPrediction } from '../services/localStore'
import { Send, User, Users } from 'lucide-react'

async function getPredictionCount(participantId) {
  const { count, error } = await supabase
    .from('predictions')
    .select('id', { count: 'exact', head: true })
    .eq('participant_id', participantId)

  if (error) {
    throw error
  }

  return count || 0
}

export function PredictionForm({ match, onSuccess }) {
  const [name, setName] = useState('')
  const [sector, setSector] = useState('')
  const [brazilScore, setBrazilScore] = useState('')
  const [opponentScore, setOpponentScore] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const normalizedName = name.trim()
    const normalizedSector = sector.trim()

    try {
      if (match.id.startsWith('local-')) {
        saveLocalPrediction({
          matchId: match.id,
          name: normalizedName,
          sector: normalizedSector,
          brazilScore: parseInt(brazilScore, 10),
          opponentScore: parseInt(opponentScore, 10)
        })
        setSuccess(true)
        setTimeout(() => onSuccess(), 1000)
        return
      }

      let { data: participant, error: participantError } = await supabase
        .from('participants')
        .select('*')
        .ilike('name', normalizedName)
        .maybeSingle()

      if (participantError) {
        throw participantError
      }

      if (!participant) {
        const { data, error: createError } = await supabase
          .from('participants')
          .insert({ name: normalizedName, sector: normalizedSector })
          .select('*')
          .single()
        if (createError) throw createError
        participant = data
      }

      const predictionCount = await getPredictionCount(participant.id)

      if (predictionCount >= 2) {
        throw new Error('Voce ja usou seus 2 palpites!')
      }

      const { error: predictionError } = await supabase
        .from('predictions')
        .insert({
          participant_id: participant.id,
          match_id: match.id,
          brazil_score: parseInt(brazilScore, 10),
          opponent_score: parseInt(opponentScore, 10)
        })

      if (predictionError) {
        if (predictionError.code === '23505') {
          throw new Error('Voce ja enviou palpite para este jogo!')
        }
        throw predictionError
      }

      setSuccess(true)
      setTimeout(() => onSuccess(), 2000)
    } catch (err) {
      if (match.id.startsWith('local-') || !isSupabaseConfigured) {
        try {
          saveLocalPrediction({
            matchId: match.id,
            name: normalizedName,
            sector: normalizedSector,
            brazilScore: parseInt(brazilScore, 10),
            opponentScore: parseInt(opponentScore, 10)
          })
          setSuccess(true)
          setTimeout(() => onSuccess(), 1000)
          return
        } catch (fallbackError) {
          setError(fallbackError.message || err.message)
        }
      } else {
        setError(err.message || 'Nao foi possivel enviar seu palpite agora.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="prediction-form">
        <div className="success-message">
          Palpite registrado com sucesso!
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="prediction-form">
      <h2>Seu palpite</h2>
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="name"><User size={14} /> Nome</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="sector"><Users size={14} /> Setor (opcional)</label>
        <input
          id="sector"
          type="text"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          placeholder="Seu departamento"
        />
      </div>

      <div className="score-inputs">
        <div className="form-group">
          <label>Brasil</label>
          <input
            type="number"
            min="0"
            max="20"
            value={brazilScore}
            onChange={(e) => setBrazilScore(e.target.value)}
            placeholder="0"
            required
          />
        </div>
        <span className="vs-label">x</span>
        <div className="form-group">
          <label>{match.opponent}</label>
          <input
            type="number"
            min="0"
            max="20"
            value={opponentScore}
            onChange={(e) => setOpponentScore(e.target.value)}
            placeholder="0"
            required
          />
        </div>
      </div>

      <button type="submit" className="btn-submit" disabled={loading}>
        {loading ? 'Enviando...' : (<><Send size={16} /> Enviar Palpite</>)}
      </button>
    </form>
  )
}
