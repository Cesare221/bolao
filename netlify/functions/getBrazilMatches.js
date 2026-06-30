const API_BASE = 'https://v3.football.api-sports.io'
const TEAM_BRAZIL = 6

exports.handler = async () => {
  const API_KEY = process.env.API_FOOTBALL_KEY

  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API_FOOTBALL_KEY not configured' })
    }
  }

  try {
    const response = await fetch(
      `${API_BASE}/fixtures?team=${TEAM_BRAZIL}&season=2026&last=10&next=10`,
      {
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`)
    }

    const data = await response.json()

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data.response || [])
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}
