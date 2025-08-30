import { useNavigate } from 'react-router-dom'
import { Star, Calendar, Package, GamepadIcon } from 'lucide-react'
import { IGDBGame } from '../services/igdbService'
import { useGame } from '../contexts/GameContext'
import { igdbService } from '../services/igdbService'
import { useRef, useEffect, useState } from 'react'

interface SimilarGamesSectionProps {
  currentGame: IGDBGame
  similarGames: IGDBGame[]
  loading: boolean
}

export default function SimilarGamesSection({ currentGame, similarGames, loading }: SimilarGamesSectionProps) {
  const navigate = useNavigate()
  const { state, addGame } = useGame()
  const lastAddedGameName = useRef<string | null>(null)
  const [addingGameId, setAddingGameId] = useState<number | null>(null)

  // Watch for the last added game and navigate to it
  useEffect(() => {
    if (lastAddedGameName.current) {
      const newGame = state.games.find(g => g.name.toLowerCase() === lastAddedGameName.current?.toLowerCase())
      if (newGame) {
        navigate(`/game/${newGame.id}`)
        lastAddedGameName.current = null // Reset after navigation
        setAddingGameId(null) // Reset loading state
      }
    }
  }, [state.games, navigate])

  const handleGameClick = async (game: IGDBGame) => {
    try {
      // Check if the game is already in the user's library
      const existingGame = state.games.find(g => g.name.toLowerCase() === game.name.toLowerCase())
      
      if (existingGame) {
        // If game exists, navigate to its details page
        navigate(`/game/${existingGame.id}`)
        return
      }

      // Set loading state for this specific game
      setAddingGameId(game.id)

      // If game doesn't exist, add it to the library first
      const convertedGame = igdbService.convertToGame(game)
      lastAddedGameName.current = game.name // Track the game being added
      addGame(convertedGame, game.id)
      
      // Navigation will happen in the useEffect when the game is added to state
    } catch (error) {
      console.error('Error adding game to library:', error)
      setAddingGameId(null) // Reset loading state on error
      // Fallback: open IGDB page if adding to library fails
      window.open(`https://www.igdb.com/games/${game.id}`, '_blank')
    }
  }

  const formatReleaseDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
        <span className="ml-3 text-gray-400">Finding similar games...</span>
      </div>
    )
  }

  if (similarGames.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        <GamepadIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <p>No similar games found for this title.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {similarGames.map((game) => {
          const isAdding = addingGameId === game.id
          return (
            <div
              key={game.id}
              onClick={() => !isAdding && handleGameClick(game)}
              className={`bg-dark-700 rounded-lg p-4 transition-all duration-200 group ${
                isAdding 
                  ? 'opacity-75 cursor-not-allowed' 
                  : 'hover:bg-dark-600 cursor-pointer'
              }`}
            >
              {/* Game Cover */}
              <div className="aspect-[3/4] rounded-lg overflow-hidden mb-3 relative">
                {game.cover ? (
                  <img
                    src={`https:${game.cover.url.replace('t_thumb', 't_cover_big')}`}
                    alt={game.name}
                    className={`w-full h-full object-cover transition-transform duration-200 ${
                      !isAdding ? 'group-hover:scale-105' : ''
                    }`}
                  />
                ) : (
                  <div className="w-full h-full bg-dark-600 flex items-center justify-center">
                    <GamepadIcon className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                
                {/* Loading overlay */}
                {isAdding && (
                  <div className="absolute inset-0 bg-dark-800/80 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
                  </div>
                )}
              </div>

              {/* Game Info */}
              <div className="space-y-2">
                {/* Game Name */}
                <h4 className={`font-semibold text-white text-sm leading-tight transition-colors duration-200 ${
                  !isAdding ? 'group-hover:text-primary-300' : ''
                }`}>
                  {game.name}
                </h4>

                {/* Game Details */}
                <div className="space-y-1 text-xs">
                  {/* Rating */}
                  {game.aggregated_rating && (
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>{Math.round(game.aggregated_rating)}/100</span>
                    </div>
                  )}

                  {/* Release Date */}
                  {game.first_release_date && (
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{formatReleaseDate(game.first_release_date)}</span>
                    </div>
                  )}

                  {/* Genres */}
                  {game.genres && game.genres.length > 0 && (
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Package className="w-3 h-3" />
                      <span className="truncate">
                        {game.genres.slice(0, 2).map(g => g.name).join(', ')}
                        {game.genres.length > 2 && '...'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* View More Button */}
      <div className="text-center pt-4">
        <button
          onClick={() => {
            // Open IGDB search for the current game's genres
            const genreNames = currentGame.genres?.map(g => g.name).join(' ') || currentGame.name
            window.open(`https://www.igdb.com/search?q=${encodeURIComponent(genreNames)}`, '_blank')
          }}
          className="btn-outline text-sm px-4 py-2"
        >
          View More Similar Games on IGDB
        </button>
      </div>
    </div>
  )
}
