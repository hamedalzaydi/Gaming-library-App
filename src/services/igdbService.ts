// IGDB API Service
// Note: You'll need to get your own IGDB API credentials from https://api.igdb.com/

const IGDB_CLIENT_ID = import.meta.env.VITE_IGDB_CLIENT_ID
const IGDB_CLIENT_SECRET = import.meta.env.VITE_IGDB_CLIENT_SECRET

// Check if environment variables are loaded
if (!IGDB_CLIENT_ID || !IGDB_CLIENT_SECRET) {
  console.error('IGDB API credentials not found. Please check your .env.local file.')
  console.error('Required variables: VITE_IGDB_CLIENT_ID and VITE_IGDB_CLIENT_SECRET')
}

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

class IGDBService {



  private async makeRequest(endpoint: string, body: string): Promise<any[]> {
    console.log('Making IGDB request to:', endpoint)

    const response = await fetch(`http://localhost:3001/api/igdb/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body,
    })

    console.log('Proxy response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Proxy error response:', errorText)
      throw new Error(`Proxy error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('Proxy response received:', result.length, 'items')
    return result
  }

  async searchGames(query: string, limit: number = 20): Promise<IGDBGame[]> {
    try {
      console.log('Searching for games:', query)
      
      const body = `
        search "${query}";
        fields name,cover.url,summary,genres.name,platforms.name,first_release_date,rating,aggregated_rating,total_rating_count,screenshots.url,videos.video_id,websites.url,websites.category;
        limit ${limit};
        where version_parent = null;
      `

      console.log('IGDB query body:', body)
      const games = await this.makeRequest('games', body)
      console.log('Search results:', games.length, 'games found')
      return games
    } catch (error) {
      console.error('Error searching games:', error)
      if (error instanceof Error) {
        throw error
      }
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
