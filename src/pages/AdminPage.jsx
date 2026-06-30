import React, { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { AdminLayout } from '../components/AdminLayout'
import { calculatePredictionBreakdown } from '../utils/scoring'
import { syncBrazilMatches } from '../services/matchSync'
import { addLocalMatch, addLocalParticipant, deleteLocalMatch, ensureLocalSeed, recalculateLocalRankings, saveLocalMatchScore, saveLocalPrediction } from '../services/localStore'
import { CalendarDays, ClipboardList, PlusCircle, RotateCcw, UserPlus, PenSquare, Trash2 } from 'lucide-react'

const initialParticipantForm = { name: '', sector: '' }
const initialPredictionForm = { participantId: '', matchId: '', brazilScore: '', opponentScore: '' }

export default function AdminPage() {
  const [matches, setMatches] = useState([])
  const [participants, setParticipants] = useState([])
  const [predictions, setPredictions] = useState([])
  const [activeTab, setActiveTab] = useState('matches')
  const [editScores, setEditScores] = useState({})
  const [newMatch, setNewMatch] = useState({ opponent: '', match_date: '', opponent_flag: '' })
  const [newParticipant, setNewParticipant] = useState(initialParticipantForm)
  const [manualPrediction, setManualPrediction] = useState(initialPredictionForm)
  const [statusMessage, setStatusMessage] = useState('')

  async function fetchData() {
    await syncBrazilMatches()
    try {
      const { data: matchesData } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: false })

      const { data: participantsData } = await supabase
        .from('participants')
        .select('id, name, sector, prediction_count')
        .order('name', { ascending: true })

      const { data: predictionsData } = await supabase
        .from('predictions')
        .select('*, participants(name), matches(opponent)')
        .order('created_at', { ascending: false })

      const localState = ensureLocalSeed()
      const deletedMatchIds = new Set((localState.deletedMatchIds || []).map(String))

      setMatches(
        (isSupabaseConfigured ? (matchesData || []) : localState.matches)
          .filter(match => !deletedMatchIds.has(String(match.id)) && !deletedMatchIds.has(String(match.api_id)))
      )
      setParticipants(isSupabaseConfigured ? (participantsData || []) : localState.participants)
      setPredictions(isSupabaseConfigured ? (predictionsData || []) : localState.predictions)
    } catch {
      if (!isSupabaseConfigured) {
        const localState = ensureLocalSeed()
        const deletedMatchIds = new Set((localState.deletedMatchIds || []).map(String))
        setMatches(localState.matches.filter(match => !deletedMatchIds.has(String(match.id)) && !deletedMatchIds.has(String(match.api_id))))
        setParticipants(localState.participants)
        setPredictions(localState.predictions)
      } else {
        setMatches([])
        setParticipants([])
        setPredictions([])
      }
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleUpdateScore(matchId) {
    const scores = editScores[matchId] || {}
    if (scores.brazil === undefined || scores.opponent === undefined) return

    try {
      const { error } = await supabase
        .from('matches')
        .update({
          brazil_score: parseInt(scores.brazil, 10),
          opponent_score: parseInt(scores.opponent, 10),
          is_finished: true,
          status: 'FT'
        })
        .eq('id', matchId)

      if (error) throw error
    } catch (err) {
      if (!isSupabaseConfigured) {
        saveLocalMatchScore(matchId, {
          brazil_score: parseInt(scores.brazil, 10),
          opponent_score: parseInt(scores.opponent, 10),
          is_finished: true,
          status: 'FT'
        })
      } else {
        setStatusMessage(err.message || 'Nao foi possivel atualizar o placar.')
        return
      }
    }

    setStatusMessage('Placar atualizado!')
    setTimeout(() => setStatusMessage(''), 3000)
    fetchData()
  }

  async function handleDeleteMatch(matchId) {
    const match = matches.find(item => item.id === matchId)
    const confirmDelete = window.confirm(`Excluir o jogo "${match ? `Brasil vs ${match.opponent}` : 'selecionado'}"? Esta aÃ§Ã£o tambÃ©m remove os palpites desse jogo.`)
    if (!confirmDelete) return

    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId)

      if (error) throw error
    } catch (err) {
      if (isSupabaseConfigured) {
        setStatusMessage(err.message || 'Nao foi possivel excluir o jogo.')
        return
      }
    } finally {
      if (!isSupabaseConfigured) {
        try {
          deleteLocalMatch(match || matchId)
        } catch {
          // ignore local cleanup errors; fetchData will reconcile what remains
        }
      }
    }

    setStatusMessage('Jogo excluido!')
    setTimeout(() => setStatusMessage(''), 3000)
    setMatches(prev => prev.filter(match => match.id !== matchId))
    setPredictions(prev => prev.filter(prediction => prediction.match_id !== matchId))
    fetchData()
  }

  async function handleCreateMatch(e) {
    e.preventDefault()
    if (!newMatch.opponent || !newMatch.match_date) return

    try {
      const { error } = await supabase
        .from('matches')
        .insert({
          opponent: newMatch.opponent,
          opponent_flag: newMatch.opponent_flag || '',
          match_date: new Date(newMatch.match_date).toISOString(),
          status: 'NS',
          is_finished: false
        })

      if (error) throw error
      setStatusMessage('Jogo criado com sucesso!')
    } catch (err) {
      if (!isSupabaseConfigured) {
        addLocalMatch({
          opponent: newMatch.opponent,
          opponent_flag: newMatch.opponent_flag || '',
          match_date: new Date(newMatch.match_date).toISOString(),
          status: 'NS',
          is_finished: false
        })
        setStatusMessage('Jogo criado localmente!')
      } else {
        setStatusMessage(err.message || 'Nao foi possivel criar o jogo.')
        return
      }
    }

    setNewMatch({ opponent: '', match_date: '', opponent_flag: '' })
    setTimeout(() => setStatusMessage(''), 3000)
    fetchData()
  }

  async function handleCreateParticipant(e) {
    e.preventDefault()
    const name = newParticipant.name.trim()
    const sector = newParticipant.sector.trim()
    if (!name) return

    try {
      const { error } = await supabase
        .from('participants')
        .insert({ name, sector })

      if (error) throw error
      setStatusMessage('Funcionário cadastrado com sucesso!')
    } catch (err) {
      if (!isSupabaseConfigured) {
        try {
          addLocalParticipant({ name, sector })
          setStatusMessage('Funcionário cadastrado localmente!')
        } catch (localError) {
          setStatusMessage(localError.message)
        }
      } else {
        setStatusMessage(err.message || 'Nao foi possivel cadastrar o funcionario.')
        return
      }
    }

    setNewParticipant(initialParticipantForm)
    setTimeout(() => setStatusMessage(''), 3000)
    fetchData()
  }
  async function handleManualPrediction(e) {
    e.preventDefault()

    const participant = participants.find(item => item.id === manualPrediction.participantId)
    const match = matches.find(item => item.id === manualPrediction.matchId)

    if (!participant || !match) {
      setStatusMessage('Selecione participante e jogo.')
      return
    }

    const payload = {
      participant_id: participant.id,
      match_id: match.id,
      brazil_score: parseInt(manualPrediction.brazilScore, 10),
      opponent_score: parseInt(manualPrediction.opponentScore, 10)
    }

    try {
      const { error } = await supabase
        .from('predictions')
        .insert(payload)

      if (error) throw error
      setStatusMessage('Palpite lançado com sucesso!')
    } catch (err) {
      if (!isSupabaseConfigured) {
        saveLocalPrediction({
          matchId: match.id,
          name: participant.name,
          sector: participant.sector,
          brazilScore: payload.brazil_score,
          opponentScore: payload.opponent_score
        })
        recalculateLocalRankings()
        setStatusMessage('Palpite lançado localmente!')
      } else {
        setStatusMessage(err.message || 'Nao foi possivel lançar o palpite.')
        return
      }
    }

    setManualPrediction(initialPredictionForm)
    setTimeout(() => setStatusMessage(''), 3000)
    fetchData()
  }
  async function handleRecalculate() {
    try {
      const { data: allPredictions } = await supabase
        .from('predictions')
        .select('*, matches(*)')

      if (!allPredictions) {
        throw new Error('No predictions data')
      }

      for (const pred of allPredictions) {
        if (pred.matches?.is_finished && pred.matches?.brazil_score !== null) {
          const breakdown = calculatePredictionBreakdown(pred, pred.matches.brazil_score, pred.matches.opponent_score)
          const { error } = await supabase.from('predictions').update({ points: breakdown.points }).eq('id', pred.id)
          if (error) throw error
        }
      }

      const { data: participantsData } = await supabase.from('participants').select('*, predictions(*)')
      if (participantsData) {
        for (const participant of participantsData) {
          const stats = participant.predictions.reduce((sum, pr) => {
            const breakdown = calculatePredictionBreakdown(
              pr,
              pr.matches?.brazil_score ?? pr.brazil_score ?? null,
              pr.matches?.opponent_score ?? pr.opponent_score ?? null
            )

            return {
              totalPoints: sum.totalPoints + breakdown.points,
              exactScores: sum.exactScores + breakdown.exactScore,
              correctOutcomes: sum.correctOutcomes + breakdown.correctOutcome
            }
          }, { totalPoints: 0, exactScores: 0, correctOutcomes: 0 })

          const { error } = await supabase.from('rankings').upsert({
            participant_id: participant.id,
            participant_name: participant.name,
            sector: participant.sector,
            total_points: stats.totalPoints,
            exact_scores: stats.exactScores,
            correct_outcomes: stats.correctOutcomes,
            updated_at: new Date().toISOString()
          })

          if (error) throw error
        }
      }
      setStatusMessage('Ranking recalculado!')
    } catch (err) {
      if (!isSupabaseConfigured) {
        recalculateLocalRankings()
        setStatusMessage('Ranking recalculado localmente!')
      } else {
        setStatusMessage(err.message || 'Nao foi possivel recalcular o ranking.')
        return
      }
    }

    setTimeout(() => setStatusMessage(''), 3000)
    fetchData()
  }
  function setMatchScore(matchId, field, value) {
    setEditScores(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], [field]: value }
    }))
  }

  const manualPredictionMatches = matches

  const totalParticipants = participants.length
  const totalPredictions = predictions.length

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
          <button className={`tab-btn ${activeTab === 'matches' ? 'active' : ''}`} onClick={() => setActiveTab('matches')}>
            Jogos
          </button>
          <button className={`tab-btn ${activeTab === 'predictions' ? 'active' : ''}`} onClick={() => setActiveTab('predictions')}>
            Palpites
          </button>
          <button className={`tab-btn ${activeTab === 'cadastro' ? 'active' : ''}`} onClick={() => setActiveTab('cadastro')}>
            Cadastro
          </button>
        </div>

        {activeTab === 'matches' && (
          <div className="admin-section">
            <div className="section-heading">
              <h2 className="section-title"><CalendarDays size={18} /> Resultados dos Jogos do Brasil</h2>
            </div>
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
                  <button className="btn-small btn-danger" onClick={() => handleDeleteMatch(match.id)}>
                    <Trash2 size={14} />
                    Excluir
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
            <div className="section-heading">
              <h2 className="section-title"><ClipboardList size={18} /> Todos os Palpites ({totalPredictions})</h2>
            </div>
            <div className="predictions-list">
              {predictions.map(pred => (
                <div key={pred.id} className="prediction-row">
                  <span className="pred-participant">{pred.participants?.name || pred.participant_name}</span>
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

        {activeTab === 'cadastro' && (
          <div className="admin-section">
            <div className="section-heading">
              <h2 className="section-title"><UserPlus size={18} /> Cadastro</h2>
            </div>

            <div className="admin-subsection">
              <h3 className="subsection-title">Novo FuncionÃ¡rio</h3>
              <form onSubmit={handleCreateParticipant} className="create-match-form">
                <div className="form-group">
                  <label>Nome</label>
                  <input
                    type="text"
                    value={newParticipant.name}
                    onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                    placeholder="Ex: Maria"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Setor</label>
                  <input
                    type="text"
                    value={newParticipant.sector}
                    onChange={(e) => setNewParticipant({ ...newParticipant, sector: e.target.value })}
                    placeholder="Ex: RecepÃ§Ã£o"
                  />
                </div>
                <button type="submit" className="btn-submit">Cadastrar FuncionÃ¡rio</button>
              </form>
            </div>

            <div className="admin-subsection">
              <h3 className="subsection-title"><PenSquare size={16} /> LanÃ§ar Palpite Manual</h3>
              <form onSubmit={handleManualPrediction} className="create-match-form">
                <div className="form-group">
                  <label>FuncionÃ¡rio</label>
                  <select
                    value={manualPrediction.participantId}
                    onChange={(e) => setManualPrediction({ ...manualPrediction, participantId: e.target.value })}
                    required
                  >
                    <option value="">Selecione</option>
                    {participants.map(participant => (
                      <option key={participant.id} value={participant.id}>
                        {participant.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Jogo</label>
                  <select
                    value={manualPrediction.matchId}
                    onChange={(e) => setManualPrediction({ ...manualPrediction, matchId: e.target.value })}
                    required
                  >
                    <option value="">Selecione</option>
                    {manualPredictionMatches.map(match => (
                      <option key={match.id} value={match.id}>
                        Brasil x {match.opponent}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="score-inputs">
                  <div className="form-group">
                    <label>Brasil</label>
                    <input
                      type="number"
                      min="0"
                      value={manualPrediction.brazilScore}
                      onChange={(e) => setManualPrediction({ ...manualPrediction, brazilScore: e.target.value })}
                      required
                    />
                  </div>
                  <span className="vs-label">x</span>
                  <div className="form-group">
                    <label>AdversÃ¡rio</label>
                    <input
                      type="number"
                      min="0"
                      value={manualPrediction.opponentScore}
                      onChange={(e) => setManualPrediction({ ...manualPrediction, opponentScore: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-submit">Salvar Palpite</button>
              </form>
            </div>

            <div className="admin-subsection">
              <h3 className="subsection-title">Novo Jogo</h3>
              <form onSubmit={handleCreateMatch} className="create-match-form">
                <div className="form-group">
                  <label>Adversario do Brasil</label>
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
                    placeholder="Ex: ðŸ‡¦ðŸ‡·"
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
          </div>
        )}

        <button className="btn-recalculate" onClick={handleRecalculate}>
          <RotateCcw size={16} />
          Recalcular Ranking
        </button>
      </div>
    </AdminLayout>
  )
}




