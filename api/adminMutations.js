import { createClient } from '@supabase/supabase-js'

function calculatePredictionBreakdown(prediction, actualBrazilScore, actualOpponentScore) {
  if (actualBrazilScore === null || actualOpponentScore === null) {
    return {
      points: 0,
      exactScore: 0,
      correctOutcome: 0
    }
  }

  const exactScore = prediction.brazil_score === actualBrazilScore && prediction.opponent_score === actualOpponentScore ? 1 : 0
  const correctOutcome = Math.sign(prediction.brazil_score - prediction.opponent_score) === Math.sign(actualBrazilScore - actualOpponentScore) ? 1 : 0

  return {
    points: exactScore || correctOutcome ? 1 : 0,
    exactScore,
    correctOutcome
  }
}

async function getAdminClientAndUser(token) {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente da Vercel.')
  }

  if (!token) {
    throw new Error('Sessao admin ausente.')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const { data: userData, error: userError } = await supabase.auth.getUser(token)

  if (userError) {
    throw new Error(`Falha ao validar o usuario admin: ${userError.message}`)
  }

  const user = userData?.user
  const email = user?.email?.trim().toLowerCase()

  if (!email) {
    throw new Error('Usuario admin sem email.')
  }

  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('email')
    .eq('email', email)
    .maybeSingle()

  if (adminError) {
    throw new Error(`Falha ao verificar admin: ${adminError.message}`)
  }

  if (!adminUser) {
    throw new Error('Este usuario nao tem acesso ao painel administrativo.')
  }

  return { supabase }
}

async function recalculateRanking(supabase) {
  const { data: allPredictions, error: predictionsError } = await supabase
    .from('predictions')
    .select('id,brazil_score,opponent_score,points, matches(id,brazil_score,opponent_score,is_finished), participants(id,name,sector)')

  if (predictionsError) throw predictionsError

  for (const pred of allPredictions || []) {
    if (pred.matches?.is_finished && pred.matches?.brazil_score !== null) {
      const breakdown = calculatePredictionBreakdown(pred, pred.matches.brazil_score, pred.matches.opponent_score)
      const { error } = await supabase.from('predictions').update({ points: breakdown.points }).eq('id', pred.id)
      if (error) throw error
    }
  }

  const { data: participantsData, error: participantsError } = await supabase
    .from('participants')
    .select('id,name,sector,predictions(id,brazil_score,opponent_score,points,matches(brazil_score,opponent_score,is_finished))')

  if (participantsError) throw participantsError

  for (const participant of participantsData || []) {
    const stats = (participant.predictions || []).reduce((sum, pr) => {
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

async function createOrUpdatePrediction(supabase, body) {
  const participantId = body.participant_id
  const matchId = body.match_id
  const brazilScore = Number.parseInt(body.brazil_score, 10)
  const opponentScore = Number.parseInt(body.opponent_score, 10)

  if (!participantId || !matchId) {
    throw new Error('Participante e jogo sao obrigatorios.')
  }

  if (Number.isNaN(brazilScore) || Number.isNaN(opponentScore)) {
    throw new Error('Informe placares validos para o palpite.')
  }

  const { data: existingPrediction, error: existingPredictionError } = await supabase
    .from('predictions')
    .select('id')
    .eq('participant_id', participantId)
    .eq('match_id', matchId)
    .maybeSingle()

  if (existingPredictionError) throw existingPredictionError

  if (existingPrediction) {
    const { error } = await supabase
      .from('predictions')
      .update({
        brazil_score: brazilScore,
        opponent_score: opponentScore
      })
      .eq('id', existingPrediction.id)

    if (error) throw error
    return { message: 'Palpite atualizado com sucesso!' }
  }

  const { error } = await supabase.from('predictions').insert({
    participant_id: participantId,
    match_id: matchId,
    brazil_score: brazilScore,
    opponent_score: opponentScore
  })

  if (error) throw error

  return { message: 'Palpite lancado com sucesso!' }
}

export const config = {
  runtime: 'nodejs'
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      return res.status(405).json({ error: 'Metodo nao permitido.' })
    }

    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    const { supabase } = await getAdminClientAndUser(token)
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {})
    const action = body.action

    if (action === 'create_match') {
      const { error } = await supabase.from('matches').insert({
        opponent: body.opponent,
        opponent_flag: body.opponent_flag || '',
        match_date: body.match_date,
        status: body.status || 'NS',
        is_finished: Boolean(body.is_finished)
      })

      if (error) throw error
      return res.status(200).json({ message: 'Jogo criado com sucesso!' })
    }

    if (action === 'update_match_score') {
      const { error } = await supabase
        .from('matches')
        .update({
          brazil_score: body.brazil_score,
          opponent_score: body.opponent_score,
          is_finished: true,
          status: 'FT'
        })
        .eq('id', body.match_id)

      if (error) throw error
      await recalculateRanking(supabase)
      return res.status(200).json({ message: 'Placar atualizado!' })
    }

    if (action === 'delete_match') {
      const { error: predictionsDeleteError } = await supabase
        .from('predictions')
        .delete()
        .eq('match_id', body.match_id)

      if (predictionsDeleteError) throw predictionsDeleteError

      const { error } = await supabase.from('matches').delete().eq('id', body.match_id)
      if (error) throw error
      await recalculateRanking(supabase)
      return res.status(200).json({ message: 'Jogo excluido!' })
    }

    if (action === 'create_participant') {
      const { error } = await supabase.from('participants').insert({
        name: body.name,
        sector: body.sector || ''
      })

      if (error) throw error
      return res.status(200).json({ message: 'Funcionário cadastrado com sucesso!' })
    }

    if (action === 'create_prediction') {
      const result = await createOrUpdatePrediction(supabase, body)
      return res.status(200).json(result)
    }

    if (action === 'delete_prediction') {
      const { error } = await supabase.from('predictions').delete().eq('id', body.prediction_id)
      if (error) throw error
      await recalculateRanking(supabase)
      return res.status(200).json({ message: 'Palpite excluido com sucesso!' })
    }

    if (action === 'recalculate_ranking') {
      await recalculateRanking(supabase)
      return res.status(200).json({ message: 'Ranking recalculado com sucesso!' })
    }

    return res.status(400).json({ error: 'Ação inválida.' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
