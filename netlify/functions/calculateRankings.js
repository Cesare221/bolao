const { createClient } = require('@supabase/supabase-js')

exports.handler = async () => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Supabase credentials not configured' })
    }
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select('*, predictions(*)')
      .eq('is_finished', true)

    if (matchError) throw matchError

    for (const match of matches || []) {
      for (const prediction of match.predictions || []) {
        let points = 0

        const exactMatch = prediction.brazil_score === match.brazil_score &&
          prediction.opponent_score === match.opponent_score

        const predictedOutcome = Math.sign(prediction.brazil_score - prediction.opponent_score)
        const actualOutcome = Math.sign(match.brazil_score - match.opponent_score)
        const outcomeMatch = predictedOutcome === actualOutcome

        if (exactMatch || outcomeMatch) {
          points = 1
        }

        if (prediction.points !== points) {
          await supabase
            .from('predictions')
            .update({ points })
            .eq('id', prediction.id)
        }
      }
    }

    const { data: participants, error: pError } = await supabase
      .from('participants')
      .select('*, predictions(*)')

    if (pError) throw pError

    for (const participant of participants || []) {
      const totalPoints = (participant.predictions || []).reduce((sum, p) => sum + (p.points || 0), 0)
      const correctPredictions = (participant.predictions || []).filter(p => p.points === 1).length

      await supabase
        .from('rankings')
        .upsert({
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
      body: JSON.stringify({ message: 'Ranking recalculated successfully' })
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}
