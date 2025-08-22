import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Clock, 
  Trophy, 
  BarChart3, 
  X, 
  Star,
  Calendar,
  Gamepad2,
  Heart
} from 'lucide-react'
import { Game } from '../contexts/GameContext'
import { useGame } from '../contexts/GameContext'

interface GameCardProps {
  game: Game
  showActions?: boolean
  onStatusChange?: (gameId: number, status: Game['status']) => void
}

export default function GameCard({ game, showActions = true, onStatusChange }: GameCardProps) {
  const { removeGame, toggleWishlist } = useGame()
  const [showMenu, setShowMenu] = useState(false)

  const statusConfig = {
    playing: { icon: Clock, label: 'Playing', color: 'status-playing' },
    completed: { icon: Trophy, label: 'Completed', color: 'status-completed' },
    backlog: { icon: BarChart3, label: 'Backlog', color: 'status-backlog' },
    dropped: { icon: X, label: 'Dropped', color: 'status-dropped' },
  }

  const currentStatus = statusConfig[game.status]

  const handleStatusChange = (newStatus: Game['status']) => {
    if (onStatusChange) {
      onStatusChange(game.id, newStatus)
    }
    setShowMenu(false)
  }

  const handleRemove = () => {
    if (confirm(`Are you sure you want to remove "${game.name}" from your library?`)) {
      removeGame(game.id)
    }
  }

  const handleWishlistToggle = () => {
    toggleWishlist(game.id)
  }

  return (
    <div className="game-card group">
      {/* Game Cover */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {game.cover ? (
          <img
            src={game.cover}
            alt={game.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-dark-700 flex items-center justify-center">
            <Gamepad2 className="w-12 h-12 text-dark-500" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span className={`status-badge ${currentStatus.color}`}>
            <currentStatus.icon className="w-3 h-3 mr-1" />
            {currentStatus.label}
          </span>
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-2 right-2">
          <button
            onClick={handleWishlistToggle}
            className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
              game.wishlisted 
                ? 'bg-pink-600/90 text-white shadow-lg' 
                : 'bg-dark-900/80 text-gray-300 hover:text-white hover:bg-dark-700'
            }`}
            title={game.wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 ${game.wishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Rating */}
        {game.rating && (
          <div className="absolute top-2 right-12 bg-dark-900/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-xs font-medium text-white">
              {Math.round(game.rating)}
            </span>
          </div>
        )}

        {/* Actions Menu */}
        {showActions && (
          <div className="absolute bottom-2 right-2">
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 bg-dark-900/80 backdrop-blur-sm rounded-full text-gray-300 hover:text-white transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {showMenu && (
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-dark-800 border border-dark-600 rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase">
                      Change Status
                    </div>
                    {Object.entries(statusConfig).map(([status, config]) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status as Game['status'])}
                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-dark-700 hover:text-white transition-colors duration-200 flex items-center space-x-2"
                      >
                        <config.icon className="w-4 h-4" />
                        <span>{config.label}</span>
                      </button>
                    ))}
                    <div className="border-t border-dark-600 my-1" />
                    <button
                      onClick={handleRemove}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-dark-700 hover:text-red-300 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Remove from Library</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Game Info */}
      <div className="p-4">
        <Link to={`/game/${game.id}`}>
          <h3 className="font-semibold text-lg text-white hover:text-primary-400 transition-colors duration-200 mb-2">
            {game.name}
          </h3>
        </Link>

        {/* Genres */}
        {game.genres && game.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {game.genres.slice(0, 3).map((genre, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-dark-700 text-gray-300 text-xs rounded-md"
              >
                {genre}
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
                {platform}
              </span>
            ))}
            {game.platforms.length > 2 && (
              <span className="px-2 py-1 bg-primary-900/30 text-primary-400 text-xs rounded-md border border-primary-700/30">
                +{game.platforms.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Release Date */}
        {game.releaseDate && (
          <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(game.releaseDate).getFullYear()}</span>
          </div>
        )}

        {/* Summary */}
        {game.summary && (
          <p className="text-sm text-gray-300 line-clamp-2 mb-3">
            {game.summary}
          </p>
        )}

        {/* Added Date */}
        <div className="text-xs text-gray-500">
          Added {new Date(game.addedDate).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}
