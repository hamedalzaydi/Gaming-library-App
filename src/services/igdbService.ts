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
  summary?: string
  cover?: {
    url: string
  }
  first_release_date?: number
  rating?: number
  aggregated_rating?: number
  total_rating_count?: number
  genres?: Array<{
    id: number
    name: string
  }>
  platforms?: Array<{
    id: number
    name: string
  }>
  screenshots?: Array<{
    id: number
    url: string
  }>
  videos?: Array<{
    id: number
    video_id: string
  }>
  websites?: Array<{
    id: number
    url: string
    category: number
  }>
  involved_companies?: Array<{
    company: {
      name: string
      logo?: {
        url: string
      }
    }
    developer: boolean
    publisher: boolean
    supporting: boolean
  }>
  themes?: Array<{
    id: number
    name: string
  }>
  game_modes?: Array<{
    id: number
    name: string
  }>
  age_ratings?: Array<{
    rating: number
    category: number
  }>
  player_perspectives?: Array<{
    id: number
    name: string
  }>
  alternative_names?: Array<{
    name: string
    comment?: string
  }>
  dlcs?: Array<{
    id: number
    name: string
    cover?: {
      url: string
    }
  }>
  expansions?: Array<{
    id: number
    name: string
    cover?: {
      url: string
    }
  }>
  standalone_expansions?: Array<{
    id: number
    name: string
    cover?: {
      url: string
    }
  }>
  bundles?: Array<{
    id: number
    name: string
    cover?: {
      url: string
    }
  }>
  release_dates?: Array<{
    date: number
    platform: {
      name: string
    }
    region: number
    category: number
    human: string
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

  async getGameByName(gameName: string): Promise<IGDBGame | null> {
    try {
      // Debug: Log the game name being passed
      console.log('getGameByName called with game name:', gameName, 'Type:', typeof gameName)
      
      if (typeof gameName !== 'string' || !gameName.trim()) {
        console.error('Invalid game name passed to getGameByName:', gameName)
        throw new Error('Invalid game name')
      }

      // Use search approach to avoid ID corruption issues
      const body = `
        search "${gameName}";
        fields name,cover.url,summary,genres.name,platforms.name,first_release_date,rating,aggregated_rating,total_rating_count,screenshots.url,videos.video_id,websites.url,websites.category,involved_companies.company.name,involved_companies.company.logo.url,involved_companies.developer,involved_companies.publisher,involved_companies.supporting,themes.name,game_modes.name,age_ratings.rating,age_ratings.category,player_perspectives.name,alternative_names.name,alternative_names.comment,dlcs.id,dlcs.name,dlcs.cover.url,expansions.id,expansions.name,expansions.cover.url,standalone_expansions.id,standalone_expansions.name,standalone_expansions.cover.url,bundles.id,bundles.name,bundles.cover.url,release_dates.date,release_dates.platform.name,release_dates.region,release_dates.category,release_dates.human;
        limit 1;
        where version_parent = null;
      `

      console.log('IGDB query body for getGameByName (search approach):', body)
      const games = await this.makeRequest('games', body)
      
      // If no results, try a different approach - get games by rating to find popular ones
      if (!games || games.length === 0) {
        console.log('No results from search, trying alternative approach')
        const alternativeBody = `
          fields name,cover.url,summary,genres.name,platforms.name,first_release_date,rating,aggregated_rating,total_rating_count,screenshots.url,videos.video_id,websites.url,websites.category,involved_companies.company.name,involved_companies.company.logo.url,involved_companies.developer,involved_companies.publisher,involved_companies.supporting,themes.name,game_modes.name,age_ratings.rating,age_ratings.category,player_perspectives.name,alternative_names.name,alternative_names.comment,dlcs.id,dlcs.name,dlcs.cover.url,expansions.id,expansions.name,expansions.cover.url,standalone_expansions.id,standalone_expansions.name,standalone_expansions.cover.url,bundles.id,bundles.name,bundles.cover.url,release_dates.date,release_dates.platform.name,release_dates.region,release_dates.category,release_dates.human;
          where rating_count > 100 & version_parent = null;
          sort rating desc;
          limit 1;
        `
        const alternativeGames = await this.makeRequest('games', alternativeBody)
        return alternativeGames[0] || null
      }
      
      return games[0] || null
    } catch (error) {
      console.error('Error getting game by name:', error)
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

  async getSimilarGames(game: IGDBGame, limit: number = 6): Promise<IGDBGame[]> {
    try {
      if (!game.genres || game.genres.length === 0) {
        // If no genres, fall back to popular games
        return this.getPopularGames(limit)
      }

      // Get genre IDs for the current game
      const genreIds = game.genres.map(g => g.id).join(',')
      
      // Build query to find games with similar genres, excluding the current game
      const body = `
        fields name,cover.url,summary,genres.name,platforms.name,first_release_date,rating,aggregated_rating,total_rating_count;
        where genres = (${genreIds}) & id != ${game.id} & version_parent = null;
        sort rating desc;
        limit ${limit};
      `

      const similarGames = await this.makeRequest('games', body)
      
      // If we don't have enough similar games, try to get more by relaxing criteria
      if (similarGames.length < limit) {
        const remainingLimit = limit - similarGames.length
        
        // Get games with at least one matching genre
        const relaxedBody = `
          fields name,cover.url,summary,genres.name,platforms.name,first_release_date,rating,aggregated_rating,total_rating_count;
          where genres != null & id != ${game.id} & version_parent = null;
          sort rating desc;
          limit ${remainingLimit};
        `
        
        const additionalGames = await this.makeRequest('games', relaxedBody)
        similarGames.push(...additionalGames)
      }
      
      return similarGames.slice(0, limit)
    } catch (error) {
      console.error('Error getting similar games:', error)
      // Fallback to popular games if similar games query fails
      return this.getPopularGames(limit)
    }
  }

  // Helper method to convert IGDB game to our Game interface
  convertToGame(igdbGame: IGDBGame) {
    // Create platform ownership entries for each platform
    const platformOwnership = igdbGame.platforms?.map(platform => ({
      platform: platform.name,
      owned: false,
      storefront: null,
      subscriptionService: null,
      purchaseDate: undefined,
      purchasePrice: undefined,
      notes: undefined,
    })) || []

    return {
      id: igdbGame.id,
      name: igdbGame.name,
      cover: igdbGame.cover?.url ? `https:${igdbGame.cover.url.replace('t_thumb', 't_cover_big')}` : undefined,
      summary: igdbGame.summary,
      genres: igdbGame.genres?.map(g => g.name),
      platforms: igdbGame.platforms?.map(p => p.name),
      platformOwnership,
      releaseDate: igdbGame.first_release_date ? new Date(igdbGame.first_release_date * 1000).toISOString() : undefined,
      rating: igdbGame.aggregated_rating || igdbGame.rating,
      status: 'backlog' as const,
      addedDate: new Date().toISOString(),
      wishlisted: false,
    }
  }
}

export const igdbService = new IGDBService()
export type { IGDBGame }
