import { useState, useEffect } from 'react'
import { 
  Search as SearchIcon, 
  Plus, 
  Loader2, 
  Gamepad2,
  Star,
  Calendar,
  Filter,
  X
} from 'lucide-react'
import { useGame } from '../contexts/GameContext'
import { igdbService, IGDBGame } from '../services/igdbService'

export default function Search() {
  const { addGame, state } = useGame()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<IGDBGame[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [genreFilter, setGenreFilter] = useState<string>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [genres, setGenres] = useState<Array<{ id: number; name: string }>>([])
  const [platforms, setPlatforms] = useState<Array<{ id: number; name: string }>>([])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Load genres and platforms on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [genresData, platformsData] = await Promise.all([
          igdbService.getGenres(),
          igdbService.getPlatforms()
        ])
        setGenres(genresData)
        setPlatforms(platformsData)
      } catch (error) {
        console.error('Error loading filters:', error)
      }
    }

    loadFilters()
  }, [])

  // Search games when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      searchGames(debouncedQuery)
    } else {
      setSearchResults([])
      setError(null)
    }
  }, [debouncedQuery])

  const searchGames = async (query: string) => {
    try {
      setLoading(true)
      setError(null)
      const results = await igdbService.searchGames(query, 50)
      setSearchResults(results)
    } catch (error) {
      console.error('Error searching games:', error)
      let errorMessage = 'Failed to search games. Please try again.'
      
      if (error instanceof Error) {
        if (error.message.includes('credentials not configured')) {
          errorMessage = 'IGDB API not configured. Please check your .env.local file and restart the app.'
        } else if (error.message.includes('Failed to authenticate')) {
          errorMessage = 'Authentication failed. Please check your IGDB API credentials.'
        } else if (error.message.includes('IGDB API error')) {
          errorMessage = 'IGDB API error. Please try again later.'
        }
      }
      
      setError(errorMessage)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddGame = (igdbGame: IGDBGame) => {
    // Check if game is already in library
    const existingGame = state.games.find(g => g.id === igdbGame.id)
    if (existingGame) {
      alert('This game is already in your library!')
      return
    }

    const gameData = igdbService.convertToGame(igdbGame)
    addGame(gameData)
    
    // Show success feedback
    const button = document.querySelector(`[data-game-id="${igdbGame.id}"]`) as HTMLButtonElement
    if (button) {
      const originalText = button.innerHTML
      button.innerHTML = '<span class="text-green-400">✓ Added!</span>'
      button.disabled = true
      button.className = 'w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium cursor-not-allowed'
      
      setTimeout(() => {
        button.innerHTML = originalText
        button.disabled = false
        button.className = 'w-full btn-primary'
      }, 2000)
    }
  }

  const filteredResults = searchResults.filter(game => {
    const matchesGenre = genreFilter === 'all' || 
      game.genres?.some(g => g.name === genreFilter)
    const matchesPlatform = platformFilter === 'all' || 
      game.platforms?.some(p => p.name === platformFilter)
    
    return matchesGenre && matchesPlatform
  })

  const clearFilters = () => {
    setGenreFilter('all')
    setPlatformFilter('all')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Discover Games</h1>
        <p className="text-gray-400">
          Search for games using the IGDB database and add them to your library
        </p>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for games (e.g., 'The Witcher', 'Red Dead Redemption')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field w-full pl-12 pr-4 text-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filters */}
        {(searchResults.length > 0 || loading) && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-dark-600">
            {/* Genre Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="input-field text-sm"
              >
                <option value="all">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.name}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Platform Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="input-field text-sm"
              >
                <option value="all">All Platforms</option>
                {platforms.map((platform) => (
                  <option key={platform.id} value={platform.name}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            {(genreFilter !== 'all' || platformFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Searching for games...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-red-400 mb-2">Search Error</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => searchGames(searchQuery)}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Search Results */}
      {!loading && !error && searchResults.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Search Results ({filteredResults.length})
            </h2>
            {filteredResults.length !== searchResults.length && (
              <span className="text-sm text-gray-400">
                {searchResults.length - filteredResults.length} results hidden by filters
              </span>
            )}
          </div>

          {filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No results match your filters</h3>
              <p className="text-gray-400 mb-4">Try adjusting your genre or platform filters</p>
              <button
                onClick={clearFilters}
                className="btn-outline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredResults.map((game) => {
                const isInLibrary = state.games.some(g => g.id === game.id)
                
                return (
                  <div key={game.id} className="game-card group">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      {game.cover ? (
                        <img
                          src={`https:${game.cover.url.replace('t_thumb', 't_cover_big')}`}
                          alt={game.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-dark-700 flex items-center justify-center">
                          <Gamepad2 className="w-12 h-12 text-dark-500" />
                        </div>
                      )}
                      
                      {/* Rating */}
                      {game.aggregated_rating && (
                        <div className="absolute top-2 right-2 bg-dark-900/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs font-medium text-white">
                            {Math.round(game.aggregated_rating)}
                          </span>
                        </div>
                      )}

                      {/* Release Date */}
                      {game.first_release_date && (
                        <div className="absolute top-2 left-2 bg-primary-600/90 backdrop-blur-sm rounded-lg px-2 py-1">
                          <span className="text-xs font-medium text-white">
                            {new Date(game.first_release_date * 1000).getFullYear()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-white mb-2">
                        {game.name}
                      </h3>

                      {/* Genres */}
                      {game.genres && game.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {game.genres.slice(0, 3).map((genre, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-dark-700 text-gray-300 text-xs rounded-md"
                            >
                              {genre.name}
                            </span>
                          ))}
                          {game.genres.length > 3 && (
                            <span className="px-2 py-1 bg-dark-700 text-gray-400 text-xs rounded-md">
                              +{game.genres.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Platforms */}
                      {game.platforms && game.platforms.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {game.platforms.slice(0, 2).map((platform, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-primary-900/30 text-primary-300 text-xs rounded-md border border-primary-700/30"
                            >
                              {platform.name}
                            </span>
                          ))}
                          {game.platforms.length > 2 && (
                            <span className="px-2 py-1 bg-primary-900/30 text-primary-400 text-xs rounded-md border border-primary-700/30">
                              +{game.platforms.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Summary */}
                      {game.summary && (
                        <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                          {game.summary}
                        </p>
                      )}

                      {/* Add Button */}
                      {isInLibrary ? (
                        <div className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-center">
                          ✓ In Library
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddGame(game)}
                          data-game-id={game.id}
                          className="w-full btn-primary"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add to Library
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && searchQuery && searchResults.length === 0 && (
        <div className="text-center py-12">
          <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No games found</h3>
          <p className="text-gray-400 mb-4">
            Try searching for a different game or check your spelling
          </p>
        </div>
      )}

      {/* Initial State */}
      {!loading && !error && !searchQuery && (
        <div className="text-center py-12">
          <Gamepad2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">Start searching for games</h3>
          <p className="text-gray-400 mb-4">
            Use the search bar above to discover new games from the IGDB database
          </p>
          
          {/* API Configuration Check */}
          {!import.meta.env.VITE_IGDB_CLIENT_ID || !import.meta.env.VITE_IGDB_CLIENT_SECRET ? (
            <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4 max-w-md mx-auto">
              <h4 className="text-yellow-400 font-medium mb-2">⚠️ API Not Configured</h4>
              <p className="text-sm text-gray-300 mb-3">
                To search for games, you need to configure your IGDB API credentials.
              </p>
              <div className="text-xs text-gray-400 space-y-1">
                <p>1. Create a <code className="bg-dark-700 px-1 rounded">.env.local</code> file in your project root</p>
                <p>2. Add your IGDB credentials:</p>
                <div className="bg-dark-800 p-2 rounded font-mono text-xs">
                  VITE_IGDB_CLIENT_ID=your_client_id<br/>
                  VITE_IGDB_CLIENT_SECRET=your_client_secret
                </div>
                <p>3. Restart the development server</p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
