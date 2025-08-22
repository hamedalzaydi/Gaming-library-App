// IGDB API Service
// Note: You'll need to get your own IGDB API credentials from https://api.igdb.com/

const IGDB_CLIENT_ID = import.meta.env.VITE_IGDB_CLIENT_ID
const IGDB_CLIENT_SECRET = import.meta.env.VITE_IGDB_CLIENT_SECRET

interface IGDBGame {
  id: number
  name: string
  cover?: {
    url: string
  }
  summary?: string
  genres?: Array<{
    id: number
    name: string
  }>
  platforms?: Array<{
    id: number
    name: string
  }>
  first_release_date?: number
  rating?: number
  aggregated_rating?: number
  total_rating_count?: number
  screenshots?: Array<{
    url: string
  }>
  videos?: Array<{
    video_id: string
  }>
  websites?: Array<{
    url: string
    category: number
  }>
}

interface IGDBToken {
  access_token: string
  expires_in: number
  token_type: string
}

class IGDBService {
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: IGDB_CLIENT_ID,
          client_secret: IGDB_CLIENT_SECRET,
          grant_type: 'client_credentials',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get access token')
      }

      const tokenData: IGDBToken = await response.json()
      this.accessToken = tokenData.access_token
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000) - 60000 // 1 minute buffer

      return this.accessToken
    } catch (error) {
      console.error('Error getting IGDB access token:', error)
      throw new Error('Failed to authenticate with IGDB API')
    }
  }

  private async makeRequest(endpoint: string, body: string): Promise<any[]> {
    const token = await this.getAccessToken()

    const response = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
      method: 'POST',
      headers: {
        'Client-ID': IGDB_CLIENT_ID,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body,
    })

    if (!response.ok) {
      throw new Error(`IGDB API error: ${response.status}`)
    }

    return response.json()
  }

  async searchGames(query: string, limit: number = 20): Promise<IGDBGame[]> {
    try {
      const body = `
        search "${query}";
        fields name,cover.url,summary,genres.name,platforms.name,first_release_date,rating,aggregated_rating,total_rating_count,screenshots.url,videos.video_id,websites.url,websites.category;
        limit ${limit};
        where version_parent = null;
      `

      const games = await this.makeRequest('games', body)
      return games
    } catch (error) {
      console.error('Error searching games:', error)
      throw new Error('Failed to search games')
    }
  }

  async getGameById(id: number): Promise<IGDBGame | null> {
    try {
      const body = `
        where id = ${id};
        fields name,cover.url,summary,genres.name,platforms.name,first_release_date,rating,aggregated_rating,total_rating_count,screenshots.url,videos.video_id,websites.url,websites.category;
      `

      const games = await this.makeRequest('games', body)
      return games[0] || null
    } catch (error) {
      console.error('Error getting game by ID:', error)
      throw new Error('Failed to get game details')
    }
  }

  async getPopularGames(limit: number = 20): Promise<IGDBGame[]> {
    try {
      const body = `
        fields name,cover.url,summary,genres.name,platforms.name,first_release_date,rating,aggregated_rating,total_rating_count;
        where rating_count > 100 & version_parent = null;
        sort rating desc;
        limit ${limit};
      `

      const games = await this.makeRequest('games', body)
      return games
    } catch (error) {
      console.error('Error getting popular games:', error)
      throw new Error('Failed to get popular games')
    }
  }

  async getUpcomingGames(limit: number = 20): Promise<IGDBGame[]> {
    try {
      const now = Math.floor(Date.now() / 1000)
      const body = `
        fields name,cover.url,summary,genres.name,platforms.name,first_release_date,rating,aggregated_rating,total_rating_count;
        where first_release_date > ${now} & version_parent = null;
        sort first_release_date asc;
        limit ${limit};
      `

      const games = await this.makeRequest('games', body)
      return games
    } catch (error) {
      console.error('Error getting upcoming games:', error)
      throw new Error('Failed to get upcoming games')
    }
  }

  async getGenres(): Promise<Array<{ id: number; name: string }>> {
    try {
      const body = `
        fields name;
        sort name asc;
      `

      const genres = await this.makeRequest('genres', body)
      return genres
    } catch (error) {
      console.error('Error getting genres:', error)
      throw new Error('Failed to get genres')
    }
  }

  async getPlatforms(): Promise<Array<{ id: number; name: string }>> {
    try {
      const body = `
        fields name;
        sort name asc;
      `

      const platforms = await this.makeRequest('platforms', body)
      return platforms
    } catch (error) {
      console.error('Error getting platforms:', error)
      throw new Error('Failed to get platforms')
    }
  }

  // Helper method to convert IGDB game to our Game interface
  convertToGame(igdbGame: IGDBGame) {
    return {
      id: igdbGame.id,
      name: igdbGame.name,
      cover: igdbGame.cover?.url ? `https:${igdbGame.cover.url.replace('t_thumb', 't_cover_big')}` : undefined,
      summary: igdbGame.summary,
      genres: igdbGame.genres?.map(g => g.name),
      platforms: igdbGame.platforms?.map(p => p.name),
      releaseDate: igdbGame.first_release_date ? new Date(igdbGame.first_release_date * 1000).toISOString() : undefined,
      rating: igdbGame.aggregated_rating || igdbGame.rating,
      status: 'backlog' as const,
      addedDate: new Date().toISOString(),
    }
  }
}

export const igdbService = new IGDBService()
export type { IGDBGame }
