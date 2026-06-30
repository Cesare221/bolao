const API_BASE = 'https://v3.football.api-sports.io'

exports.handler = async (event) => {
  const API_KEY = process.env.API_FOOTBALL_KEY

  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API_FOOTBALL_KEY not configured' })
    }
  }

  const { fixtureId } = event.queryStringParameters || {}

  if (!fixtureId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'fixtureId parameter is required' })
    }
  }

  try {
    const response = await fetch(
      `${API_BASE}/fixtures?id=${fixtureId}`,
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
      body: JSON.stringify(data.response?.[0] || null)
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}
