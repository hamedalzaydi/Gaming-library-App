import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  TrendingUp, 
  Clock, 
  Trophy, 
  BarChart3,
  ArrowRight,
  Gamepad2,
  Star,
  Heart
} from 'lucide-react'
import { useGame } from '../contexts/GameContext'
import { igdbService, IGDBGame } from '../services/igdbService'
import GameCard from '../components/GameCard'

export default function Home() {
  const { state, addGame, toggleWishlist } = useGame()
  const [popularGames, setPopularGames] = useState<IGDBGame[]>([])
  const [upcomingGames, setUpcomingGames] = useState<IGDBGame[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true)
        const [popular, upcoming] = await Promise.all([
          igdbService.getPopularGames(6),
          igdbService.getUpcomingGames(6)
        ])
        setPopularGames(popular)
        setUpcomingGames(upcoming)
      } catch (error) {
        console.error('Error fetching games:', error)
        // Fallback to empty arrays if API fails
        setPopularGames([])
        setUpcomingGames([])
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

  const handleAddGame = (igdbGame: IGDBGame) => {
    const gameData = igdbService.convertToGame(igdbGame)
    addGame(gameData)
  }

  const handleWishlistToggle = (igdbGame: IGDBGame) => {
    // Check if game is already in library
    const existingGame = state.games.find(g => g.id === igdbGame.id)
    
    if (existingGame) {
      // If game exists in library, toggle its wishlist status
      toggleWishlist(existingGame.id)
    } else {
      // If game doesn't exist in library, add it as wishlisted
      const gameData = igdbService.convertToGame(igdbGame)
      const wishlistedGame = { ...gameData, wishlisted: true }
      addGame(wishlistedGame)
    }
  }

  const isGameWishlisted = (igdbGame: IGDBGame) => {
    const existingGame = state.games.find(g => g.id === igdbGame.id)
    return existingGame?.wishlisted || false
  }

  const recentGames = state.games
    .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
    .slice(0, 6)

  const stats = [
    {
      name: 'Total Games',
      value: state.games.length,
      icon: Gamepad2,
      color: 'text-primary-400',
      bgColor: 'bg-primary-900/20',
    },
    {
      name: 'Currently Playing',
      value: state.games.filter(g => g.status === 'playing').length,
      icon: Clock,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
    },
    {
      name: 'Completed',
      value: state.games.filter(g => g.status === 'completed').length,
      icon: Trophy,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
    },
    {
      name: 'Backlog',
      value: state.games.filter(g => g.status === 'backlog').length,
      icon: BarChart3,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
    },
    {
      name: 'Wishlist',
      value: state.games.filter(g => g.wishlisted).length,
      icon: Heart,
      color: 'text-pink-400',
      bgColor: 'bg-pink-900/20',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-gaming font-bold text-gradient">
          Welcome to GameVault
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Your personal gaming library. Track your progress, discover new games, and never lose track of your gaming journey.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/search" className="btn-primary text-lg px-8 py-3">
            <Plus className="w-5 h-5 mr-2" />
            Add New Game
          </Link>
          <Link to="/library" className="btn-outline text-lg px-8 py-3">
            View Library
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className={`card ${stat.bgColor} border-0`}>
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Games */}
      {recentGames.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Recent Additions</h2>
            <Link to="/library" className="text-primary-400 hover:text-primary-300 transition-colors duration-200">
              View All
              <ArrowRight className="w-4 h-4 ml-1 inline" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {recentGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}

      {/* Popular Games */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-primary-400" />
            <span>Popular Games</span>
          </h2>
          <Link to="/search" className="text-primary-400 hover:text-primary-300 transition-colors duration-200">
            Discover More
            <ArrowRight className="w-4 h-4 ml-1 inline" />
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="game-card animate-pulse">
                <div className="aspect-[3/4] bg-dark-700 rounded-t-xl" />
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-dark-700 rounded" />
                  <div className="h-4 bg-dark-700 rounded w-3/4" />
                  <div className="h-4 bg-dark-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularGames.map((igdbGame) => {
              const isWishlisted = isGameWishlisted(igdbGame)
              
              return (
                <div key={igdbGame.id} className="game-card group">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {igdbGame.cover ? (
                      <img
                        src={`https:${igdbGame.cover.url.replace('t_thumb', 't_cover_big')}`}
                        alt={igdbGame.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-dark-700 flex items-center justify-center">
                        <Gamepad2 className="w-12 h-12 text-dark-500" />
                      </div>
                    )}
                    
                    {/* Wishlist Button */}
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => handleWishlistToggle(igdbGame)}
                        className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                          isWishlisted 
                            ? 'bg-pink-600/90 text-white shadow-lg' 
                            : 'bg-dark-900/80 text-gray-300 hover:text-white hover:bg-dark-700'
                        }`}
                        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    
                    {/* Rating */}
                    {igdbGame.aggregated_rating && (
                      <div className="absolute top-2 right-12 bg-dark-900/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs font-medium text-white">
                          {Math.round(igdbGame.aggregated_rating)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-white mb-2">
                      {igdbGame.name}
                    </h3>

                    {/* Genres */}
                    {igdbGame.genres && igdbGame.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {igdbGame.genres.slice(0, 2).map((genre, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-dark-700 text-gray-300 text-xs rounded-md"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Summary */}
                    {igdbGame.summary && (
                      <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                        {igdbGame.summary}
                      </p>
                    )}

                    <button
                      onClick={() => handleAddGame(igdbGame)}
                      className="w-full btn-primary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Library
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Upcoming Games */}
      {upcomingGames.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Upcoming Releases</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingGames.map((igdbGame) => {
              const isWishlisted = isGameWishlisted(igdbGame)
              
              return (
                <div key={igdbGame.id} className="game-card group">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {igdbGame.cover ? (
                      <img
                        src={`https:${igdbGame.cover.url.replace('t_thumb', 't_cover_big')}`}
                        alt={igdbGame.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-dark-700 flex items-center justify-center">
                        <Gamepad2 className="w-12 h-12 text-dark-500" />
                      </div>
                    )}
                    
                    {/* Wishlist Button */}
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => handleWishlistToggle(igdbGame)}
                        className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                          isWishlisted 
                            ? 'bg-pink-600/90 text-white shadow-lg' 
                            : 'bg-dark-900/80 text-gray-300 hover:text-white hover:bg-dark-700'
                        }`}
                        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    
                    {/* Release Date */}
                    {igdbGame.first_release_date && (
                      <div className="absolute top-2 left-2 bg-primary-600/90 backdrop-blur-sm rounded-lg px-2 py-1">
                        <span className="text-xs font-medium text-white">
                          {new Date(igdbGame.first_release_date * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-white mb-2">
                      {igdbGame.name}
                    </h3>

                    {/* Genres */}
                    {igdbGame.genres && igdbGame.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {igdbGame.genres.slice(0, 2).map((genre, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-dark-700 text-gray-300 text-xs rounded-md"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => handleWishlistToggle(igdbGame)}
                      className={`w-full transition-colors duration-200 ${
                        isWishlisted 
                          ? 'bg-pink-600 text-white hover:bg-pink-700' 
                          : 'btn-secondary'
                      }`}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? 'fill-current' : ''}`} />
                      {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
