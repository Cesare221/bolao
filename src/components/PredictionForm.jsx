import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

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

    try {
      let { data: participant } = await supabase
        .from('participants')
        .select('*')
        .eq('name', name)
        .single()

      if (!participant) {
        const { data, error: createError } = await supabase
          .from('participants')
          .insert({ name, sector })
          .select()
          .single()
        if (createError) throw createError
        participant = data
      }

      // Double-check prediction count client-side
      if (participant.prediction_count >= 2) {
        throw new Error('Voce ja usou seus 2 palpites!')
      }

      const { error: predictionError } = await supabase
        .from('predictions')
        .insert({
          participant_id: participant.id,
          match_id: match.id,
          brazil_score: parseInt(brazilScore),
          opponent_score: parseInt(opponentScore)
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
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="prediction-form">
        <div className="success-message">
          Palpite enviado com sucesso!
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="prediction-form">
      <h2>Seu Palpite</h2>
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="name">Nome</label>
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
        <label htmlFor="sector">Setor (opcional)</label>
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
        {loading ? 'Enviando...' : 'Enviar Palpite'}
      </button>
    </form>
  )
}
