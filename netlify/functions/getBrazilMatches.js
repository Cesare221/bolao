const { createClient } = require('@supabase/supabase-js')

const API_BASE = 'https://v3.football.api-sports.io'
const TEAM_BRAZIL = 6
const DEFAULT_SEASON = 2026

function getOpponentAndScore(fixture) {
  const homeTeam = fixture.teams?.home
  const awayTeam = fixture.teams?.away
  const brazilIsHome = homeTeam?.id === TEAM_BRAZIL

  const opponent = brazilIsHome ? awayTeam : homeTeam

  return {
    opponentName: opponent?.name || 'Adversario',
    brazilScore: brazilIsHome ? fixture.goals?.home : fixture.goals?.away,
    opponentScore: brazilIsHome ? fixture.goals?.away : fixture.goals?.home
  }
}

function calculatePoints(brazilScore, opponentScore, actualBrazilScore, actualOpponentScore) {
  if (actualBrazilScore === null || actualOpponentScore === null) {
    return 0
  }

  if (brazilScore === actualBrazilScore && opponentScore === actualOpponentScore) {
    return 1
  }

  const predictedOutcome = Math.sign(brazilScore - opponentScore)
  const actualOutcome = Math.sign(actualBrazilScore - actualOpponentScore)

  return predictedOutcome === actualOutcome ? 1 : 0
}

exports.handler = async () => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY
  const apiKey = process.env.API_FOOTBALL_KEY

  if (!supabaseUrl || !supabaseKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Supabase credentials not configured' })
    }
  }

  if (!apiKey) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'API_FOOTBALL_KEY not configured. External sync skipped.'
      })
    }
  }

  try {
    const response = await fetch(
      `${API_BASE}/fixtures?team=${TEAM_BRAZIL}&season=${DEFAULT_SEASON}&last=10&next=10`,
      {
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`)
    }

    const data = await response.json()
    const supabase = createClient(supabaseUrl, supabaseKey)

    const fixtures = data.response || []

    for (const fixture of fixtures) {
      const { opponentName, brazilScore, opponentScore } = getOpponentAndScore(fixture)
      const status = fixture.fixture?.status?.short || 'NS'

      await supabase.from('matches').upsert({
        api_id: fixture.fixture?.id,
        opponent: opponentName,
        opponent_flag: '',
        match_date: fixture.fixture?.date,
        brazil_score: Number.isFinite(brazilScore) ? brazilScore : null,
        opponent_score: Number.isFinite(opponentScore) ? opponentScore : null,
        status,
        is_finished: ['FT', 'AET', 'PEN'].includes(status)
        }, {
        onConflict: 'api_id'
      })
    }

    const { data: finishedMatches, error: matchesError } = await supabase
      .from('matches')
      .select('id,brazil_score,opponent_score,predictions(*)')
      .eq('is_finished', true)

    if (matchesError) {
      throw matchesError
    }

    for (const match of finishedMatches || []) {
      for (const prediction of match.predictions || []) {
        const points = calculatePoints(
          prediction.brazil_score,
          prediction.opponent_score,
          match.brazil_score,
          match.opponent_score
        )

        if (prediction.points !== points) {
          await supabase
            .from('predictions')
            .update({ points })
            .eq('id', prediction.id)
        }
      }
    }

    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('id,name,sector,predictions(*)')

    if (participantsError) {
      throw participantsError
    }

    for (const participant of participants || []) {
      const totalPoints = (participant.predictions || []).reduce((sum, prediction) => sum + (prediction.points || 0), 0)
      const correctPredictions = (participant.predictions || []).filter(prediction => prediction.points === 1).length

      await supabase.from('rankings').upsert({
        participant_id: participant.id,
        participant_name: participant.name,
        sector: participant.sector,
        total_points: totalPoints,
        exact_scores: correctPredictions,
        correct_outcomes: correctPredictions,
        updated_at: new Date().toISOString()
      })
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Brazil matches synchronized successfully',
        count: fixtures.length,
        rankingsRecalculated: true
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}
