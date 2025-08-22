import { useState, useMemo } from 'react'
import { 
  Filter, 
  Search as SearchIcon, 
  SortAsc, 
  Grid, 
  List,
  Heart,
  Trash2
} from 'lucide-react'
import { useGame, Game } from '../contexts/GameContext'
import GameCard from '../components/GameCard'

type SortOption = 'name' | 'addedDate' | 'rating' | 'releaseDate'

export default function Wishlist() {
  const { state, toggleWishlist, updateGame } = useGame()
  const [searchQuery, setSearchQuery] = useState('')
  const [genreFilter, setGenreFilter] = useState<string>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('addedDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Get wishlisted games
  const wishlistedGames = useMemo(() => {
    return state.games.filter(game => game.wishlisted)
  }, [state.games])

  // Get unique genres and platforms from wishlisted games
  const genres = useMemo(() => {
    const allGenres = wishlistedGames.flatMap(game => game.genres || [])
    return ['all', ...Array.from(new Set(allGenres))]
  }, [wishlistedGames])

  const platforms = useMemo(() => {
    const allPlatforms = wishlistedGames.flatMap(game => game.platforms || [])
    return ['all', ...Array.from(new Set(allPlatforms))]
  }, [wishlistedGames])

  // Filter and sort wishlisted games
  const filteredAndSortedGames = useMemo(() => {
    let filtered = wishlistedGames.filter(game => {
      const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.genres?.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesGenre = genreFilter === 'all' || game.genres?.includes(genreFilter)
      const matchesPlatform = platformFilter === 'all' || game.platforms?.includes(platformFilter)
      
      return matchesSearch && matchesGenre && matchesPlatform
    })

    // Sort games
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'rating':
          aValue = a.rating || 0
          bValue = b.rating || 0
          break
        case 'releaseDate':
          aValue = a.releaseDate ? new Date(a.releaseDate).getTime() : 0
          bValue = b.releaseDate ? new Date(b.releaseDate).getTime() : 0
          break
        case 'addedDate':
        default:
          aValue = new Date(a.addedDate).getTime()
          bValue = new Date(b.addedDate).getTime()
          break
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [wishlistedGames, searchQuery, genreFilter, platformFilter, sortBy, sortOrder])

  const handleStatusChange = (gameId: number, status: Game['status']) => {
    const game = state.games.find(g => g.id === gameId)
    if (game) {
      const updatedGame = { ...game, status }
      updateGame(updatedGame)
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setGenreFilter('all')
    setPlatformFilter('all')
    setSortBy('addedDate')
    setSortOrder('desc')
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Wishlist</h1>
          <p className="text-gray-400">
            {wishlistedGames.length} game{wishlistedGames.length !== 1 ? 's' : ''} in your wishlist
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-dark-800 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Genre Filter */}
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre === 'all' ? 'All Genres' : genre}
              </option>
            ))}
          </select>

          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {platforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform === 'all' ? 'All Platforms' : platform}
              </option>
            ))}
          </select>

          {/* Sort */}
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="name">Name</option>
              <option value="addedDate">Added Date</option>
              <option value="rating">Rating</option>
              <option value="releaseDate">Release Date</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white hover:bg-dark-600 transition-colors duration-200"
            >
              <SortAsc className={`w-4 h-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* View Mode and Clear Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {(searchQuery || genreFilter !== 'all' || platformFilter !== 'all') && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Games Grid/List */}
      {filteredAndSortedGames.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">No wishlisted games found</h3>
          <p className="text-gray-400 mb-4">
            {wishlistedGames.length === 0 
              ? "You haven't added any games to your wishlist yet."
              : "Try adjusting your search or filters."
            }
          </p>
          {wishlistedGames.length === 0 && (
            <p className="text-sm text-gray-500">
              Use the heart icon on game cards to add games to your wishlist.
            </p>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6'
            : 'space-y-4'
        }>
          {filteredAndSortedGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
