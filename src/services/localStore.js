import { calculatePoints } from '../utils/scoring'
import { brazilCupMatches, brazilCupParticipants, brazilCupRankings } from '../data/brazilCupData'
import { isExcludedParticipantName } from '../data/excludedParticipants'

const STORAGE_KEY = 'bolao-suct-local-db'

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function createMatchId(apiId) {
  return `local-match-${apiId}`
}

function createParticipantId(name) {
  return `local-participant-${slugify(name)}`
}

function createPredictionId() {
  return `local-prediction-${crypto.randomUUID()}`
}

function buildBaseRankings() {
  return new Map(
    brazilCupRankings
      .filter(ranking => !isExcludedParticipantName(ranking.participant_name))
      .map(ranking => [
      ranking.participant_name.toLowerCase(),
      {
        total_points: ranking.total_points || 0,
        exact_scores: ranking.exact_scores || 0,
        correct_outcomes: ranking.correct_outcomes || 0
      }
      ])
  )
}

function sortRankings(rows) {
  return [...rows].sort((a, b) => {
    if ((b.total_points || 0) !== (a.total_points || 0)) {
      return (b.total_points || 0) - (a.total_points || 0)
    }

    if ((b.exact_scores || 0) !== (a.exact_scores || 0)) {
      return (b.exact_scores || 0) - (a.exact_scores || 0)
    }

    return String(a.participant_name || '').localeCompare(String(b.participant_name || ''), 'pt-BR')
  })
}

function buildDefaultState() {
  const testMatchDate = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  return {
    matches: brazilCupMatches.map(match => ({
      ...match,
      id: createMatchId(match.api_id),
      match_date: match.api_id === 1005 ? testMatchDate : match.match_date,
      is_test: match.api_id === 1005 ? true : Boolean(match.is_test)
    })),
    participants: brazilCupParticipants
      .filter(participant => !isExcludedParticipantName(participant.name))
      .map(participant => ({
      ...participant,
      id: createParticipantId(participant.name)
      })),
    rankings: brazilCupRankings
      .filter(ranking => !isExcludedParticipantName(ranking.participant_name))
      .map(ranking => ({
      ...ranking,
      participant_id: createParticipantId(ranking.participant_name)
      })),
    predictions: [],
    deletedMatchIds: []
  }
}

function persistState(state) {
  if (typeof window === 'undefined') return state
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  return state
}

export function ensureLocalSeed() {
  if (typeof window === 'undefined') return buildDefaultState()

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return persistState(buildDefaultState())
  }

  try {
    const parsed = JSON.parse(raw)
    const defaults = buildDefaultState()
    const defaultMatchesByApiId = new Map(defaults.matches.map(match => [match.api_id, match]))

    const merged = {
      ...defaults,
      ...parsed,
      matches: parsed.matches?.length
        ? parsed.matches.map(match => {
            const defaultMatch = defaultMatchesByApiId.get(match.api_id)
            return defaultMatch
              ? { ...match, match_date: defaultMatch.match_date, is_test: defaultMatch.is_test }
              : match
          })
        : defaults.matches,
      participants: parsed.participants?.length
        ? parsed.participants.filter(participant => !isExcludedParticipantName(participant.name))
        : defaults.participants,
      rankings: parsed.rankings?.length
        ? parsed.rankings.filter(ranking => !isExcludedParticipantName(ranking.participant_name))
        : defaults.rankings,
      predictions: parsed.predictions || [],
      deletedMatchIds: parsed.deletedMatchIds || []
    }

    return persistState(merged)
  } catch {
    return persistState(buildDefaultState())
  }
}

function getMatchByIdFromState(state, matchId) {
  return state.matches.find(match => match.id === matchId || String(match.api_id) === String(matchId)) || null
}

function getParticipantByIdFromState(state, participantId) {
  return state.participants.find(participant => participant.id === participantId) || null
}

export function recalculateLocalRankings() {
  const state = ensureLocalSeed()
  const baseRankings = buildBaseRankings()
  const rankingAccumulator = new Map()

  for (const participant of state.participants) {
    if (isExcludedParticipantName(participant.name)) {
      continue
    }

    const base = baseRankings.get(participant.name.toLowerCase()) || {
      total_points: 0,
      exact_scores: 0,
      correct_outcomes: 0
    }

    rankingAccumulator.set(participant.id, {
      participant_id: participant.id,
      participant_name: participant.name,
      sector: participant.sector,
      total_points: base.total_points,
      exact_scores: base.exact_scores,
      correct_outcomes: base.correct_outcomes
    })
  }

  for (const prediction of state.predictions) {
    const match = getMatchByIdFromState(state, prediction.match_id)
    if (!match || !match.is_finished || match.brazil_score === null || match.opponent_score === null) {
      prediction.points = 0
      continue
    }

    const points = calculatePoints(
      prediction,
      match.brazil_score,
      match.opponent_score
    )

    prediction.points = points

    const participant = getParticipantByIdFromState(state, prediction.participant_id)
    if (!participant) continue

    const currentRanking = rankingAccumulator.get(participant.id) || {
      participant_id: participant.id,
      participant_name: participant.name,
      sector: participant.sector,
      total_points: 0,
      exact_scores: 0,
      correct_outcomes: 0
    }

    currentRanking.total_points += points
    currentRanking.exact_scores += points
    currentRanking.correct_outcomes += points
    rankingAccumulator.set(participant.id, currentRanking)
  }

  state.rankings = sortRankings(Array.from(rankingAccumulator.values()))
  persistState(state)
  return state
}

export function getLocalMatches() {
  const state = ensureLocalSeed()
  return state.matches.filter(match => !state.deletedMatchIds.includes(String(match.id)))
}

export function getLocalRankings() {
  return ensureLocalSeed().rankings
}

export function getLocalMatchById(matchId) {
  const state = ensureLocalSeed()
  if (state.deletedMatchIds.includes(String(matchId))) {
    return null
  }
  return getMatchByIdFromState(state, matchId)
}

export function getDeletedMatchIds() {
  return ensureLocalSeed().deletedMatchIds || []
}

export function saveLocalPrediction({ matchId, name, sector, brazilScore, opponentScore }) {
  const state = ensureLocalSeed()
  const normalizedName = name.trim()
  if (isExcludedParticipantName(normalizedName)) {
    throw new Error('Este participante nao pode aparecer no ranking.')
  }
  const participantId = createParticipantId(normalizedName)

  const existingPrediction = state.predictions.find(prediction => (
    prediction.match_id === matchId && prediction.participant_id === participantId
  ))

  if (existingPrediction) {
    throw new Error('Voce ja enviou palpite para este jogo!')
  }

  const participantIndex = state.participants.findIndex(participant => participant.id === participantId)
  if (participantIndex >= 0) {
    state.participants[participantIndex] = {
      ...state.participants[participantIndex],
      sector: sector || state.participants[participantIndex].sector,
      prediction_count: (state.participants[participantIndex].prediction_count || 0) + 1
    }
  } else {
    state.participants.push({
      id: participantId,
      name: normalizedName,
      sector,
      prediction_count: 1
    })
  }

  state.predictions.push({
    id: createPredictionId(),
    participant_id: participantId,
    match_id: matchId,
    brazil_score: brazilScore,
    opponent_score: opponentScore,
    points: 0,
    created_at: new Date().toISOString()
  })

  recalculateLocalRankings()
  return ensureLocalSeed()
}

export function saveLocalMatch(match) {
  const state = ensureLocalSeed()
  const index = state.matches.findIndex(item => item.id === match.id || String(item.api_id) === String(match.api_id))

  const normalizedMatch = {
    ...match,
    id: match.id || createMatchId(match.api_id || Date.now()),
    is_test: Boolean(match.is_test)
  }

  if (index >= 0) {
    state.matches[index] = {
      ...state.matches[index],
      ...normalizedMatch
    }
  } else {
    state.matches.unshift(normalizedMatch)
  }

  persistState(state)
  return state
}

export function saveLocalMatchScore(matchId, { brazil_score, opponent_score, is_finished = true, status = 'FT' }) {
  const state = ensureLocalSeed()
  const index = state.matches.findIndex(item => item.id === matchId || String(item.api_id) === String(matchId))

  if (index === -1) {
    throw new Error('Jogo local nao encontrado')
  }

  state.matches[index] = {
    ...state.matches[index],
    brazil_score,
    opponent_score,
    is_finished,
    status
  }

  persistState(state)
  recalculateLocalRankings()
  return ensureLocalSeed()
}

export function addLocalMatch(match) {
  const state = ensureLocalSeed()
  const nextMatch = {
    ...match,
    id: match.id || createMatchId(match.api_id || Date.now()),
    is_test: Boolean(match.is_test)
  }

  state.matches.unshift(nextMatch)
  persistState(state)
  return ensureLocalSeed()
}

export function addLocalParticipant({ name, sector }) {
  const state = ensureLocalSeed()
  const normalizedName = name.trim()
  if (isExcludedParticipantName(normalizedName)) {
    throw new Error('Este participante nao pode aparecer no ranking.')
  }
  const participantId = createParticipantId(normalizedName)
  const existingIndex = state.participants.findIndex(participant => participant.id === participantId)

  if (existingIndex >= 0) {
    state.participants[existingIndex] = {
      ...state.participants[existingIndex],
      sector: sector || state.participants[existingIndex].sector
    }
  } else {
    state.participants.push({
      id: participantId,
      name: normalizedName,
      sector,
      prediction_count: 0
    })
  }

  const baseRankings = buildBaseRankings()
  const base = baseRankings.get(normalizedName.toLowerCase()) || {
    total_points: 0,
    exact_scores: 0,
    correct_outcomes: 0
  }

  const rankingIndex = state.rankings.findIndex(ranking => ranking.participant_id === participantId)
  const rankingRow = {
    participant_id: participantId,
    participant_name: normalizedName,
    sector,
    total_points: base.total_points,
    exact_scores: base.exact_scores,
    correct_outcomes: base.correct_outcomes
  }

  if (rankingIndex >= 0) {
    state.rankings[rankingIndex] = rankingRow
  } else {
    state.rankings.push(rankingRow)
  }

  state.rankings = sortRankings(state.rankings)
  persistState(state)
  return ensureLocalSeed()
}

export function deleteLocalMatch(matchId) {
  const state = ensureLocalSeed()
  const normalizedMatchId = String(matchId)
  const matchIndex = state.matches.findIndex(item => item.id === matchId || String(item.api_id) === normalizedMatchId)

  if (matchIndex === -1) {
    throw new Error('Jogo local nao encontrado')
  }

  const removedMatch = state.matches[matchIndex]
  state.matches.splice(matchIndex, 1)
  state.predictions = state.predictions.filter(prediction => prediction.match_id !== removedMatch.id)
  state.deletedMatchIds = Array.from(new Set([...(state.deletedMatchIds || []), String(removedMatch.id), String(removedMatch.api_id)]))

  recalculateLocalRankings()
  return ensureLocalSeed()
}
