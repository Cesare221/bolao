export const POINTS = {
  CORRECT: 1,
  WRONG: 0
}

export function calculatePoints(prediction, actualBrazilScore, actualOpponentScore) {
  return calculatePredictionBreakdown(prediction, actualBrazilScore, actualOpponentScore).points
}

export function calculatePredictionBreakdown(prediction, actualBrazilScore, actualOpponentScore) {
  if (actualBrazilScore === null || actualOpponentScore === null) {
    return {
      points: 0,
      exactScore: 0,
      correctOutcome: 0
    }
  }

  const predictedOutcome = Math.sign(prediction.brazil_score - prediction.opponent_score)
  const actualOutcome = Math.sign(actualBrazilScore - actualOpponentScore)
  const exactScore = prediction.brazil_score === actualBrazilScore && prediction.opponent_score === actualOpponentScore ? 1 : 0
  const correctOutcome = predictedOutcome === actualOutcome ? 1 : 0

  return {
    points: exactScore || correctOutcome ? POINTS.CORRECT : POINTS.WRONG,
    exactScore,
    correctOutcome
  }
}
