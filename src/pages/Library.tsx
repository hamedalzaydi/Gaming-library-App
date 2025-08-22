import { useState, useMemo } from 'react'
import { 
  Filter, 
  Search as SearchIcon, 
  SortAsc, 
  Grid, 
  List,
  Plus
} from 'lucide-react'
import { useGame } from '../contexts/GameContext'
import GameCard from '../components/GameCard'
import { Link } from 'react-router-dom'

type SortOption = 'name' | 'addedDate' | 'rating' | 'releaseDate'
type ViewMode = 'grid' | 'list'

export default function Library() {
  const { state, updateGame } = useGame()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [genreFilter, setGenreFilter] = useState<string>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('addedDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Get unique genres and platforms from games
  const genres = useMemo(() => {
    const allGenres = state.games.flatMap(game => game.genres || [])
    return ['all', ...Array.from(new Set(allGenres))]
  }, [state.games])

  const platforms = useMemo(() => {
    const allPlatforms = state.games.flatMap(game => game.platforms || [])
    return ['all', ...Array.from(new Set(allPlatforms))]
  }, [state.games])

  // Filter and sort games
  const filteredAndSortedGames = useMemo(() => {
    let filtered = state.games.filter(game => {
      const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           game.summary?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || game.status === statusFilter
      const matchesGenre = genreFilter === 'all' || game.genres?.includes(genreFilter)
      const matchesPlatform = platformFilter === 'all' || game.platforms?.includes(platformFilter)
      
      return matchesSearch && matchesStatus && matchesGenre && matchesPlatform
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
        case 'addedDate':
          aValue = new Date(a.addedDate).getTime()
          bValue = new Date(b.addedDate).getTime()
          break
        case 'rating':
          aValue = a.rating || 0
          bValue = b.rating || 0
          break
        case 'releaseDate':
          aValue = a.releaseDate ? new Date(a.releaseDate).getTime() : 0
          bValue = b.releaseDate ? new Date(b.releaseDate).getTime() : 0
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [state.games, searchQuery, statusFilter, genreFilter, platformFilter, sortBy, sortOrder])

  const handleStatusChange = (gameId: number, newStatus: string) => {
    const game = state.games.find(g => g.id === gameId)
    if (game) {
      updateGame({ ...game, status: newStatus as any })
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setGenreFilter('all')
    setPlatformFilter('all')
  }

  const statusCounts = {
    all: state.games.length,
    playing: state.games.filter(g => g.status === 'playing').length,
    completed: state.games.filter(g => g.status === 'completed').length,
    backlog: state.games.filter(g => g.status === 'backlog').length,
    dropped: state.games.filter(g => g.status === 'dropped').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Library</h1>
          <p className="text-gray-400">
            {filteredAndSortedGames.length} of {state.games.length} games
          </p>
        </div>
        <Link to="/search" className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Game
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field w-full pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-700 text-gray-300 hover:bg-dark-600 hover:text-white'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="ml-2 text-xs opacity-75">({count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Filters */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-dark-600">
          {/* Genre Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="input-field text-sm"
            >
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre === 'all' ? 'All Genres' : genre}
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
              {platforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platform === 'all' ? 'All Platforms' : platform}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <SortAsc className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="input-field text-sm"
            >
              <option value="addedDate">Date Added</option>
              <option value="name">Name</option>
              <option value="rating">Rating</option>
              <option value="releaseDate">Release Date</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors duration-200"
            >
              <SortAsc className={`w-4 h-4 text-gray-400 transform ${
                sortOrder === 'desc' ? 'rotate-180' : ''
              }`} />
            </button>
          </div>

          {/* View Mode */}
          <div className="flex items-center space-x-1 bg-dark-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewMode === 'grid'
                  ? 'bg-dark-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewMode === 'list'
                  ? 'bg-dark-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Clear Filters */}
          {(searchQuery || statusFilter !== 'all' || genreFilter !== 'all' || platformFilter !== 'all') && (
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
            <SearchIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">No games found</h3>
          <p className="text-gray-400 mb-4">
            {state.games.length === 0 
              ? "You haven't added any games to your library yet."
              : "Try adjusting your search or filters."
            }
          </p>
          {state.games.length === 0 && (
            <Link to="/search" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Game
            </Link>
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
