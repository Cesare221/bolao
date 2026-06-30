export const POINTS = {
  CORRECT: 1,
  WRONG: 0
}

export function calculatePoints(prediction, actualBrazilScore, actualOpponentScore) {
  if (actualBrazilScore === null || actualOpponentScore === null) {
    return 0
  }

  if (prediction.brazil_score === actualBrazilScore && prediction.opponent_score === actualOpponentScore) {
    return POINTS.CORRECT
  }

  const predictedOutcome = Math.sign(prediction.brazil_score - prediction.opponent_score)
  const actualOutcome = Math.sign(actualBrazilScore - actualOpponentScore)

  if (predictedOutcome === actualOutcome) {
    return POINTS.CORRECT
  }

  return POINTS.WRONG
}
