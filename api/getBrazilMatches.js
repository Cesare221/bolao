import { createClient } from '@supabase/supabase-js'

const API_BASE = 'https://v3.football.api-sports.io'
const TEAM_BRAZIL = 6
const DEFAULT_SEASON = 2026
const baselineMatchApiIds = new Set([1001, 1002, 1003, 1004])
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

export const config = {
  runtime: 'nodejs'
}

export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const apiKey = process.env.API_FOOTBALL_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      error: 'Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente da Vercel.'
    })
  }

  if (!apiKey) {
    return res.status(200).json({
      message: 'API_FOOTBALL_KEY not configured. External sync skipped.'
    })
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
        const breakdown = calculatePredictionBreakdown(prediction, match.brazil_score, match.opponent_score)

        if (prediction.points !== breakdown.points) {
          await supabase
            .from('predictions')
            .update({ points: breakdown.points })
            .eq('id', prediction.id)
        }
      }
    }

    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('id,name,sector,predictions(id,brazil_score,opponent_score,points,matches(api_id,brazil_score,opponent_score,is_finished))')

    if (participantsError) {
      throw participantsError
    }

    for (const participant of participants || []) {
      const baseStats = baseRankings.get(String(participant.name || '').trim().toLowerCase()) || {
        total_points: 0,
        exact_scores: 0,
        correct_outcomes: 0
      }

      const predictionStats = (participant.predictions || []).reduce((sum, prediction) => {
        if (baselineMatchApiIds.has(prediction.matches?.api_id)) {
          return sum
        }

        const breakdown = calculatePredictionBreakdown(
          prediction,
          prediction.matches?.brazil_score ?? null,
          prediction.matches?.opponent_score ?? null
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

      await supabase.from('rankings').upsert({
        participant_id: participant.id,
        participant_name: participant.name,
        sector: participant.sector,
        total_points: predictionStats.totalPoints,
        exact_scores: predictionStats.exactScores,
        correct_outcomes: predictionStats.correctOutcomes,
        updated_at: new Date().toISOString()
      })
    }

    return res.status(200).json({
      message: 'Brazil matches synchronized successfully',
      count: fixtures.length,
      rankingsRecalculated: true
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
