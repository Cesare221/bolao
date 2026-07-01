import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { brazilCupMatches, brazilCupParticipants, brazilCupRankings } from '../src/data/brazilCupData.js'

function readEnvFile(filePath) {
  const env = {}
  const content = readFileSync(filePath, 'utf8')

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const equalsIndex = line.indexOf('=')
    if (equalsIndex === -1) continue

    const key = line.slice(0, equalsIndex).trim()
    let value = line.slice(equalsIndex + 1).trim()

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    env[key] = value
  }

  return env
}

function pickValue(env, keys) {
  for (const key of keys) {
    if (env[key]) return env[key]
  }
  return null
}

async function main() {
  const envPath = resolve(process.cwd(), '.env')
  const env = readEnvFile(envPath)

  const supabaseUrl = pickValue(env, ['SUPABASE_URL', 'VITE_SUPABASE_URL'])
  const supabaseKey = pickValue(env, ['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY'])
  const adminEmail = pickValue(env, ['VITE_ADMIN_EMAIL', 'ADMIN_EMAIL'])
  const adminPassword = pickValue(env, ['VITE_ADMIN_PASSWORD', 'ADMIN_PASSWORD'])

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltam SUPABASE_URL e/ou chave no .env')
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    if (!adminEmail || !adminPassword) {
      throw new Error('Sem SUPABASE_SERVICE_ROLE_KEY, preciso de VITE_ADMIN_EMAIL e VITE_ADMIN_PASSWORD para autenticar como admin.')
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    })

    if (signInError) {
      throw new Error(`Falha ao autenticar como admin: ${signInError.message}`)
    }
  }

  const { data: participantsData, error: participantsError } = await supabase
    .from('participants')
    .select('id,name,sector,prediction_count')

  if (participantsError) {
    throw participantsError
  }

  const participantsByName = new Map(
    (participantsData || []).map(participant => [String(participant.name).toLowerCase(), participant])
  )

  const missingParticipants = brazilCupParticipants.filter(participant => !participantsByName.has(participant.name.toLowerCase()))

  if (missingParticipants.length > 0) {
    const { error: insertParticipantsError } = await supabase
      .from('participants')
      .insert(missingParticipants)

    if (insertParticipantsError) {
      throw insertParticipantsError
    }

    const { data: refreshedParticipants, error: refreshedParticipantsError } = await supabase
      .from('participants')
      .select('id,name,sector,prediction_count')

    if (refreshedParticipantsError) {
      throw refreshedParticipantsError
    }

    participantsByName.clear()
    for (const participant of refreshedParticipants || []) {
      participantsByName.set(String(participant.name).toLowerCase(), participant)
    }
  }

  const matchRows = brazilCupMatches.map(match => ({
    api_id: match.api_id,
    opponent: match.opponent,
    opponent_flag: match.opponent_flag,
    match_date: match.match_date,
    brazil_score: match.brazil_score,
    opponent_score: match.opponent_score,
    status: match.status,
    is_finished: match.is_finished
  }))

  const rankingRows = brazilCupRankings.map(ranking => {
    const participant = participantsByName.get(ranking.participant_name.toLowerCase())

    if (!participant) {
      throw new Error(`Participante nao encontrado para ranking: ${ranking.participant_name}`)
    }

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

  const { error: matchesError } = await supabase
    .from('matches')
    .upsert(matchRows, { onConflict: 'api_id' })

  if (matchesError) {
    throw matchesError
  }

  const { error: rankingsError } = await supabase
    .from('rankings')
    .upsert(rankingRows, { onConflict: 'participant_id' })

  if (rankingsError) {
    throw rankingsError
  }

  console.log(`Seed aplicado com sucesso: ${matchRows.length} jogos e ${rankingRows.length} linhas de ranking.`)
}

main().catch(error => {
  console.error(error?.message || error)
  process.exitCode = 1
})
