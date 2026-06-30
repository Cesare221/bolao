import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { ensureLocalSeed } from './localStore'
import { brazilCupMatches, brazilCupParticipants, brazilCupRankings } from '../data/brazilCupData'

async function insertMissingMatches() {
  const { data: existingMatches, error } = await supabase
    .from('matches')
    .select('api_id')

  if (error) {
    throw error
  }

  const existingApiIds = new Set((existingMatches || []).map(match => match.api_id))
  const missingMatches = brazilCupMatches.filter(match => !existingApiIds.has(match.api_id))

  if (missingMatches.length > 0) {
    const { error: insertError } = await supabase
      .from('matches')
      .upsert(missingMatches, { onConflict: 'api_id' })

    if (insertError) {
      throw insertError
    }
  }

  return missingMatches.length > 0
}

async function insertMissingParticipants() {
  const { data: existingParticipants, error } = await supabase
    .from('participants')
    .select('name')

  if (error) {
    throw error
  }

  const existingNames = new Set((existingParticipants || []).map(participant => participant.name.toLowerCase()))
  const missingParticipants = brazilCupParticipants.filter(participant => !existingNames.has(participant.name.toLowerCase()))

  if (missingParticipants.length > 0) {
    const { error: insertError } = await supabase
      .from('participants')
      .insert(missingParticipants)

    if (insertError) {
      throw insertError
    }
  }

  const { data: participants } = await supabase
    .from('participants')
    .select('id, name, sector')

  return {
    participants: participants || [],
    seeded: missingParticipants.length > 0
  }
}

async function insertMissingRankings(participants) {
  const { data: existingRankings, error } = await supabase
    .from('rankings')
    .select('participant_id')

  if (error) {
    throw error
  }

  const participantByName = new Map(participants.map(participant => [participant.name.toLowerCase(), participant]))
  const rankingsToInsert = brazilCupRankings
    .map(ranking => {
      const participant = participantByName.get(ranking.participant_name.toLowerCase())
      if (!participant) return null

      return {
        participant_id: participant.id,
        participant_name: ranking.participant_name,
        sector: ranking.sector,
        total_points: ranking.total_points,
        exact_scores: ranking.exact_scores,
        correct_outcomes: ranking.correct_outcomes,
        updated_at: new Date().toISOString()
      }
    })
    .filter(Boolean)

  if (rankingsToInsert.length > 0) {
    const existingIds = new Set((existingRankings || []).map(ranking => ranking.participant_id))
    const missingRankings = rankingsToInsert.filter(ranking => !existingIds.has(ranking.participant_id))

    if (missingRankings.length > 0) {
      const { error: insertError } = await supabase
        .from('rankings')
        .insert(missingRankings)

      if (insertError) {
        throw insertError
      }
    }
  }

  return rankingsToInsert.length > 0
}

export async function syncBrazilMatches() {
  ensureLocalSeed()

  if (!isSupabaseConfigured) {
    return false
  }

  const matchesSeeded = await insertMissingMatches()
  const { participants, seeded: participantsSeeded } = await insertMissingParticipants()
  const rankingsSeeded = await insertMissingRankings(participants)

  return matchesSeeded || participantsSeeded || rankingsSeeded
}
