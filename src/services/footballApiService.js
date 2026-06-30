const API_FOOTBALL_BASE = 'https://v3.football.api-sports.io'
const TEAM_BRAZIL = 6

class FootballApiService {
  constructor() {
    this.headers = {}
  }

  getApiKey() {
    if (!this.headers['x-rapidapi-key']) {
      this.headers = {
        'x-rapidapi-key': import.meta.env.VITE_API_FOOTBALL_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    }
    return this.headers
  }

  async getBrazilMatches() {
    const response = await fetch(
      `${API_FOOTBALL_BASE}/fixtures?team=${TEAM_BRAZIL}&season=2026&last=10&next=10`,
      { headers: this.getApiKey() }
    )
    const data = await response.json()
    return data.response || []
  }

  async getLiveScore(fixtureId) {
    const response = await fetch(
      `${API_FOOTBALL_BASE}/fixtures?id=${fixtureId}`,
      { headers: this.getApiKey() }
    )
    const data = await response.json()
    return data.response?.[0] || null
  }

  async getMatchDetails(fixtureId) {
    const response = await fetch(
      `${API_FOOTBALL_BASE}/fixtures?id=${fixtureId}`,
      { headers: this.getApiKey() }
    )
    const data = await response.json()
    return data.response?.[0] || null
  }
}

export const footballApi = new FootballApiService()
