import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { ensureLocalSeed } from './localStore'
import { brazilCupMatches, brazilCupParticipants, brazilCupRankings } from '../data/brazilCupData'

async function insertMissingMatches() {
  const { data: existingMatches, error } = await supabase
    .from('matches')
    .select('api_id')

  if (error) {
    return false
  }

  if ((existingMatches || []).length > 0) {
    return false
  }

  const existingApiIds = new Set((existingMatches || []).map(match => match.api_id))
  const missingMatches = brazilCupMatches.filter(match => !existingApiIds.has(match.api_id))

  if (missingMatches.length > 0) {
    await supabase.from('matches').insert(missingMatches)
  }

  return missingMatches.length > 0
}

async function insertMissingParticipants() {
  const { data: existingParticipants, error } = await supabase
    .from('participants')
    .select('name')

  if (error) {
    return []
  }

  if ((existingParticipants || []).length > 0) {
    return (await supabase
      .from('participants')
      .select('id, name, sector'))?.data || []
  }

  const existingNames = new Set((existingParticipants || []).map(participant => participant.name.toLowerCase()))
  const missingParticipants = brazilCupParticipants.filter(participant => !existingNames.has(participant.name.toLowerCase()))

  if (missingParticipants.length > 0) {
    await supabase.from('participants').insert(missingParticipants)
  }

  const { data: participants } = await supabase
    .from('participants')
    .select('id, name, sector')

  return participants || []
}

async function insertMissingRankings(participants) {
  const { data: existingRankings, error } = await supabase
    .from('rankings')
    .select('participant_id')

  if (error) {
    return false
  }

  if ((existingRankings || []).length > 0) {
    return false
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
    const { data: existingRankings } = await supabase
      .from('rankings')
      .select('participant_id')

    const existingIds = new Set((existingRankings || []).map(ranking => ranking.participant_id))
    const missingRankings = rankingsToInsert.filter(ranking => !existingIds.has(ranking.participant_id))

    if (missingRankings.length > 0) {
      await supabase.from('rankings').insert(missingRankings)
    }
  }

  return rankingsToInsert.length > 0
}

export async function syncBrazilMatches() {
  ensureLocalSeed()

  if (!isSupabaseConfigured) {
    return false
  }

  // The browser should not try to seed Supabase directly.
  // Read paths already fall back to the local dataset, and writes are handled
  // by the admin flow or trusted backend jobs.
  return false
}
