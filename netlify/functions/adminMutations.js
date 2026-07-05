const { createClient } = require('@supabase/supabase-js')

const baseRankings = new Map([
  ['adrianne', { total_points: 3, exact_scores: 3, correct_outcomes: 3 }],
  ['fran', { total_points: 1, exact_scores: 1, correct_outcomes: 1 }],
  ['francilda', { total_points: 1, exact_scores: 1, correct_outcomes: 1 }],
  ['stefany', { total_points: 2, exact_scores: 2, correct_outcomes: 2 }],
  ['noel', { total_points: 1, exact_scores: 1, correct_outcomes: 1 }],
  ['denise', { total_points: 2, exact_scores: 2, correct_outcomes: 2 }],
  ['huainny', { total_points: 1, exact_scores: 1, correct_outcomes: 1 }],
  ['andreza', { total_points: 1, exact_scores: 1, correct_outcomes: 1 }],
  ['wilson', { total_points: 1, exact_scores: 1, correct_outcomes: 1 }],
  ['regineide', { total_points: 1, exact_scores: 1, correct_outcomes: 1 }],
  ['rafael', { total_points: 1, exact_scores: 1, correct_outcomes: 1 }],
  ['carol', { total_points: 1, exact_scores: 1, correct_outcomes: 1 }],
  ['giza', { total_points: 1, exact_scores: 1, correct_outcomes: 1 }]
])

const baselineMatchApiIds = new Set([1001, 1002, 1003, 1004])

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
    throw new Error('Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no Netlify.')
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

  return { supabase, user }
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

exports.handler = async (event) => {
  try {
    const authHeader = event.headers.authorization || event.headers.Authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    const { supabase } = await getAdminClientAndUser(token)
    const body = event.body ? JSON.parse(event.body) : {}
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
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Jogo criado com sucesso!' })
      }
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
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Placar atualizado!' })
      }
    }

    if (action === 'delete_match') {
      const { error } = await supabase.from('matches').delete().eq('id', body.match_id)
      if (error) throw error
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Jogo excluido!' })
      }
    }

    if (action === 'create_participant') {
      const { error } = await supabase.from('participants').insert({
        name: body.name,
        sector: body.sector || ''
      })

      if (error) throw error
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Funcionário cadastrado com sucesso!' })
      }
    }

    if (action === 'create_prediction') {
      const result = await createOrUpdatePrediction(supabase, body)
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      }
    }

    if (action === 'recalculate_ranking') {
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
        .select('id,name,sector,predictions(id,brazil_score,opponent_score,points,matches(api_id,brazil_score,opponent_score,is_finished))')

      if (participantsError) throw participantsError

      for (const participant of participantsData || []) {
        const baseStats = baseRankings.get(String(participant.name || '').trim().toLowerCase()) || {
          total_points: 0,
          exact_scores: 0,
          correct_outcomes: 0
        }

        const stats = (participant.predictions || []).reduce((sum, pr) => {
          if (baselineMatchApiIds.has(pr.matches?.api_id)) {
            return sum
          }

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
        }, {
          totalPoints: baseStats.total_points,
          exactScores: baseStats.exact_scores,
          correctOutcomes: baseStats.correct_outcomes
        })

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

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Ranking recalculado com sucesso!' })
      }
    }

    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Ação inválida.' })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    }
  }
}
