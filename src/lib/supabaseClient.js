import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

function createMockQuery() {
  const emptyResult = Promise.resolve({ data: [], error: null })
  const singleResult = Promise.resolve({ data: null, error: null })

  const query = {
    select: () => query,
    insert: () => query,
    update: () => query,
    upsert: () => query,
    delete: () => query,
    eq: () => query,
    gte: () => query,
    lte: () => query,
    lt: () => query,
    order: () => query,
    limit: () => query,
    single: () => singleResult,
    maybeSingle: () => singleResult,
    then: (resolve) => emptyResult.then(resolve)
  }

  return query
}

function createMockSupabase() {
  return {
    from: () => createMockQuery()
  }
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : createMockSupabase()

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)
