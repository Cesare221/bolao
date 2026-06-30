import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { AdminLayout } from '../components/AdminLayout'
import { calculatePoints } from '../utils/scoring'

export default function AdminPage() {
  const [matches, setMatches] = useState([])
  const [predictions, setPredictions] = useState([])
  const [activeTab, setActiveTab] = useState('matches')
  const [editScores, setEditScores] = useState({})
  const [newMatch, setNewMatch] = useState({ opponent: '', match_date: '', opponent_flag: '' })
  const [statusMessage, setStatusMessage] = useState('')

  async function fetchData() {
    const { data: matchesData } = await supabase
      .from('matches')
      .select('*')
      .order('match_date', { ascending: true })

    const { data: predictionsData } = await supabase
      .from('predictions')
      .select('*, participants(name), matches(opponent)')
      .order('created_at', { ascending: false })

    setMatches(matchesData || [])
    setPredictions(predictionsData || [])
  }

  useEffect(() => { fetchData() }, [])

  async function handleUpdateScore(matchId) {
    const scores = editScores[matchId] || {}
    if (scores.brazil === undefined || scores.opponent === undefined) return

    await supabase
      .from('matches')
      .update({
        brazil_score: parseInt(scores.brazil),
        opponent_score: parseInt(scores.opponent),
        is_finished: true,
        status: 'FT'
      })
      .eq('id', matchId)

    setStatusMessage('Placar atualizado!')
    setTimeout(() => setStatusMessage(''), 3000)
    fetchData()
  }

  async function handleCreateMatch(e) {
    e.preventDefault()
    if (!newMatch.opponent || !newMatch.match_date) return

    const { error } = await supabase
      .from('matches')
      .insert({
        opponent: newMatch.opponent,
        opponent_flag: newMatch.opponent_flag || '',
        match_date: new Date(newMatch.match_date).toISOString(),
        status: 'NS',
        is_finished: false
      })

    if (error) {
      setStatusMessage('Erro ao criar jogo: ' + error.message)
    } else {
      setStatusMessage('Jogo criado com sucesso!')
      setNewMatch({ opponent: '', match_date: '', opponent_flag: '' })
    }
    setTimeout(() => setStatusMessage(''), 3000)
    fetchData()
  }

  async function handleRecalculate() {
    const { data: allPredictions } = await supabase
      .from('predictions')
      .select('*, matches(*)')

    if (!allPredictions) return

    for (const pred of allPredictions) {
      if (pred.matches?.is_finished && pred.matches?.brazil_score !== null) {
        const points = calculatePoints(pred, pred.matches.brazil_score, pred.matches.opponent_score)
        await supabase.from('predictions').update({ points }).eq('id', pred.id)
      }
    }

    const { data: participants } = await supabase.from('participants').select('*, predictions(*)')
    if (participants) {
      for (const p of participants) {
        const totalPoints = p.predictions.reduce((sum, pr) => sum + (pr.points || 0), 0)
        const correctPredictions = p.predictions.filter(pr => pr.points === 1).length

        await supabase.from('rankings').upsert({
          participant_id: p.id,
          participant_name: p.name,
          sector: p.sector,
          total_points: totalPoints,
          exact_scores: correctPredictions,
          correct_outcomes: correctPredictions,
          updated_at: new Date().toISOString()
        })
      }
    }

    setStatusMessage('Ranking recalculado!')
    setTimeout(() => setStatusMessage(''), 3000)
    fetchData()
  }

  function setMatchScore(matchId, field, value) {
    setEditScores(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], [field]: value }
    }))
  }

  const totalParticipants = new Set(predictions.map(p => p.participant_id)).size
  const totalPredictions = predictions.length
  const finishedMatches = matches.filter(m => m.is_finished).length

  return (
    <AdminLayout>
      <div className="admin-page">
        {statusMessage && <div className="status-message">{statusMessage}</div>}

        <div className="admin-stats">
          <div className="stat-card">
            <span className="stat-number">{matches.length}</span>
            <span className="stat-desc">Jogos</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{totalParticipants}</span>
            <span className="stat-desc">Participantes</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{totalPredictions}</span>
            <span className="stat-desc">Palpites</span>
          </div>
        </div>

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            Jogos
          </button>
          <button
            className={`tab-btn ${activeTab === 'predictions' ? 'active' : ''}`}
            onClick={() => setActiveTab('predictions')}
          >
            Palpites
          </button>
          <button
            className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Novo Jogo
          </button>
        </div>

        {activeTab === 'matches' && (
          <div className="admin-section">
            <h2>Resultados dos Jogos</h2>
            {matches.map(match => (
              <div key={match.id} className="admin-match-row">
                <span className="match-label">Brasil vs {match.opponent}</span>
                <div className="match-score-edit">
                  <input
                    type="number"
                    min="0"
                    placeholder="Brasil"
                    defaultValue={match.brazil_score ?? ''}
                    onChange={(e) => setMatchScore(match.id, 'brazil', e.target.value)}
                  />
                  <span>x</span>
                  <input
                    type="number"
                    min="0"
                    placeholder={match.opponent}
                    defaultValue={match.opponent_score ?? ''}
                    onChange={(e) => setMatchScore(match.id, 'opponent', e.target.value)}
                  />
                  <button className="btn-small" onClick={() => handleUpdateScore(match.id)}>
                    Salvar
                  </button>
                </div>
                <span className="match-status-admin">
                  {match.is_finished ? 'Encerrado' : (match.status === 'LIVE' ? 'Ao vivo' : 'Pendente')}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="admin-section">
            <h2>Todos os Palpites ({totalPredictions})</h2>
            <div className="predictions-list">
              {predictions.map(pred => (
                <div key={pred.id} className="prediction-row">
                  <span className="pred-participant">{pred.participants?.name}</span>
                  <span className="pred-match">vs {pred.matches?.opponent}</span>
                  <span className="pred-score">{pred.brazil_score} x {pred.opponent_score}</span>
                  <span className={`pred-points ${pred.points > 0 ? 'scored' : ''}`}>
                    {pred.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="admin-section">
            <h2>Cadastrar Novo Jogo</h2>
            <form onSubmit={handleCreateMatch} className="create-match-form">
              <div className="form-group">
                <label>Adversario</label>
                <input
                  type="text"
                  value={newMatch.opponent}
                  onChange={(e) => setNewMatch({ ...newMatch, opponent: e.target.value })}
                  placeholder="Ex: Argentina"
                  required
                />
              </div>
              <div className="form-group">
                <label>Bandeira (emoji)</label>
                <input
                  type="text"
                  value={newMatch.opponent_flag}
                  onChange={(e) => setNewMatch({ ...newMatch, opponent_flag: e.target.value })}
                  placeholder="Ex: 🇦🇷"
                />
              </div>
              <div className="form-group">
                <label>Data e Horario</label>
                <input
                  type="datetime-local"
                  value={newMatch.match_date}
                  onChange={(e) => setNewMatch({ ...newMatch, match_date: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn-submit">Criar Jogo</button>
            </form>
          </div>
        )}

        <button className="btn-recalculate" onClick={handleRecalculate}>
          Recalcular Ranking
        </button>
      </div>
    </AdminLayout>
  )
}
