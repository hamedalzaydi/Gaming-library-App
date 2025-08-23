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
  const [ownershipFilter, setOwnershipFilter] = useState<string>('all')
  const [storefrontFilter, setStorefrontFilter] = useState<string>('all')
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Get unique values for filter options
  const allGenres = useMemo(() => {
    const genres = new Set<string>()
    state.games.forEach(game => {
      game.genres?.forEach(genre => genres.add(genre))
    })
    return Array.from(genres).sort()
  }, [state.games])

  const allPlatforms = useMemo(() => {
    const platforms = new Set<string>()
    state.games.forEach(game => {
      game.platforms?.forEach(platform => platforms.add(platform))
    })
    return Array.from(platforms).sort()
  }, [state.games])

  const allStorefronts = useMemo(() => {
    const storefronts = new Set<string>()
    state.games.forEach(game => {
      game.platformOwnership?.forEach(ownership => {
        if (ownership.owned && ownership.storefront) {
          storefronts.add(ownership.storefront)
        }
      })
    })
    return Array.from(storefronts).sort()
  }, [state.games])

  const allSubscriptions = useMemo(() => {
    const subscriptions = new Set<string>()
    state.games.forEach(game => {
      game.platformOwnership?.forEach(ownership => {
        if (ownership.owned && ownership.subscriptionService) {
          subscriptions.add(ownership.subscriptionService)
        }
      })
    })
    return Array.from(subscriptions).sort()
  }, [state.games])

  // Filter and sort games
  const filteredAndSortedGames = useMemo(() => {
    let filtered = state.games

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(game => 
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.genres?.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(game => game.status === statusFilter)
    }

    // Apply genre filter
    if (genreFilter !== 'all') {
      filtered = filtered.filter(game => game.genres?.includes(genreFilter))
    }

    // Apply platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter(game => game.platforms?.includes(platformFilter))
    }

    // Apply ownership filter
    if (ownershipFilter !== 'all') {
      if (ownershipFilter === 'owned') {
        filtered = filtered.filter(game => 
          game.platformOwnership?.some(ownership => ownership.owned)
        )
      } else if (ownershipFilter === 'not-owned') {
        filtered = filtered.filter(game => 
          !game.platformOwnership?.some(ownership => ownership.owned)
        )
      }
    }

    // Apply storefront filter
    if (storefrontFilter !== 'all') {
      filtered = filtered.filter(game => 
        game.platformOwnership?.some(ownership => 
          ownership.owned && ownership.storefront === storefrontFilter
        )
      )
    }

    // Apply subscription filter
    if (subscriptionFilter !== 'all') {
      if (subscriptionFilter === 'no-subscription') {
        filtered = filtered.filter(game => 
          game.platformOwnership?.some(ownership => 
            ownership.owned && !ownership.subscriptionService
          )
        )
      } else {
        filtered = filtered.filter(game => 
          game.platformOwnership?.some(ownership => 
            ownership.owned && ownership.subscriptionService === subscriptionFilter
          )
        )
      }
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
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
        case 'releaseDate':
          aValue = a.releaseDate ? new Date(a.releaseDate).getTime() : 0
          bValue = b.releaseDate ? new Date(b.releaseDate).getTime() : 0
          break
        case 'rating':
          aValue = a.rating || 0
          bValue = b.rating || 0
          break
        case 'playtime':
          aValue = a.playtime || 0
          bValue = b.playtime || 0
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return sorted
  }, [state.games, searchQuery, statusFilter, genreFilter, platformFilter, ownershipFilter, storefrontFilter, subscriptionFilter, sortBy, sortOrder])

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
    setOwnershipFilter('all')
    setStorefrontFilter('all')
    setSubscriptionFilter('all')
    setSortBy('name')
    setSortOrder('asc')
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
          {/* Active Filters Indicator */}
          {(searchQuery || statusFilter !== 'all' || genreFilter !== 'all' || platformFilter !== 'all' || ownershipFilter !== 'all' || storefrontFilter !== 'all' || subscriptionFilter !== 'all') && (
            <div className="w-full mb-2">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>Active filters:</span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded-md border border-blue-700/30 hover:bg-blue-800/40 transition-colors"
                  >
                    Search: "{searchQuery}" ×
                  </button>
                )}
                {statusFilter !== 'all' && (
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="px-2 py-1 bg-green-900/30 text-green-300 rounded-md border border-green-700/30 hover:bg-green-800/40 transition-colors"
                  >
                    Status: {statusFilter} ×
                  </button>
                )}
                {genreFilter !== 'all' && (
                  <button
                    onClick={() => setGenreFilter('all')}
                    className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded-md border border-purple-700/30 hover:bg-purple-800/40 transition-colors"
                  >
                    Genre: {genreFilter} ×
                  </button>
                )}
                {platformFilter !== 'all' && (
                  <button
                    onClick={() => setPlatformFilter('all')}
                    className="px-2 py-1 bg-yellow-900/30 text-yellow-300 rounded-md border border-yellow-700/30 hover:bg-yellow-800/40 transition-colors"
                  >
                    Platform: {platformFilter} ×
                  </button>
                )}
                {ownershipFilter !== 'all' && (
                  <button
                    onClick={() => setOwnershipFilter('all')}
                    className="px-2 py-1 bg-orange-900/30 text-orange-300 rounded-md border border-orange-700/30 hover:bg-orange-800/40 transition-colors"
                  >
                    Ownership: {ownershipFilter === 'owned' ? 'Owned' : 'Not Owned'} ×
                  </button>
                )}
                {storefrontFilter !== 'all' && (
                  <button
                    onClick={() => setStorefrontFilter('all')}
                    className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded-md border border-blue-700/30 hover:bg-blue-800/40 transition-colors"
                  >
                    Storefront: {storefrontFilter} ×
                  </button>
                )}
                {subscriptionFilter !== 'all' && (
                  <button
                    onClick={() => setSubscriptionFilter('all')}
                    className="px-2 py-1 bg-green-900/30 text-green-300 rounded-md border border-green-700/30 hover:bg-green-800/40 transition-colors"
                  >
                    Subscription: {subscriptionFilter === 'no-subscription' ? 'No Subscription' : subscriptionFilter} ×
                  </button>
                )}
              </div>
            </div>
          )}
          {/* Genre Filter */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-300">Genre Filter</label>
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Genres</option>
              {allGenres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          {/* Platform Filter */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-300">Platform Filter</label>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Platforms</option>
              {allPlatforms.map((platform) => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>
          </div>

          {/* Ownership Filter */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-300">Ownership Filter</label>
            <select
              value={ownershipFilter}
              onChange={(e) => setOwnershipFilter(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Ownership</option>
              <option value="owned">Owned</option>
              <option value="not-owned">Not Owned</option>
            </select>
          </div>

          {/* Storefront Filter */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-300">Storefront Filter</label>
            <select
              value={storefrontFilter}
              onChange={(e) => setStorefrontFilter(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {allStorefronts.map(storefront => (
                <option key={storefront} value={storefront}>{storefront}</option>
              ))}
            </select>
          </div>

          {/* Subscription Filter */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-300">Subscription Filter</label>
            <select
              value={subscriptionFilter}
              onChange={(e) => setSubscriptionFilter(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Subscriptions</option>
              <option value="no-subscription">No Subscription</option>
              {allSubscriptions.map(subscription => (
                <option key={subscription} value={subscription}>{subscription}</option>
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
          <div className="flex items-center">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors duration-200 flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Clear All Filters</span>
            </button>
          </div>
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

