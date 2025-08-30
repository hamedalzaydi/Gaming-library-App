import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Star,
  Calendar,
  Clock,
  Trophy,
  BarChart3,
  Gamepad2,
  Trash2,
  Building2,
  Users,
  Target,
  Eye,
  Globe,
  Play,
  Award,
  Package,
  Languages,
  Code,
  Tag,
  Link,
  GamepadIcon
} from 'lucide-react'
import { useGame } from '../contexts/GameContext'
import { igdbService, IGDBGame } from '../services/igdbService'
import PlatformOwnershipEditor from '../components/PlatformOwnershipEditor'
import SimilarGamesSection from '../components/SimilarGamesSection'

export default function GameDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { state, updateGame, removeGame, updatePlatformOwnership, addGame } = useGame()
  const [igdbGame, setIgdbGame] = useState<IGDBGame | null>(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editingPlatformOwnership, setEditingPlatformOwnership] = useState(false)
  const [similarGames, setSimilarGames] = useState<IGDBGame[]>([])
  const [loadingSimilarGames, setLoadingSimilarGames] = useState(false)
  const [editForm, setEditForm] = useState({
    status: '',
    rating: '',
    notes: '',
    playtime: ''
  })

  // Debug: Log URL parameter and all game IDs
  useEffect(() => {
    console.log('URL parameter id:', id, 'Type:', typeof id)
    console.log('All game IDs in state:', state.games.map(g => ({ id: g.id, name: g.name, idType: typeof g.id })))
  }, [id, state.games])

  const game = state.games.find(g => g.id === Number(id))

  // Debug: Log the game ID to see what's happening
  useEffect(() => {
    if (game) {
      console.log('Game found:', game)
      console.log('Game ID type:', typeof game.id, 'Game ID value:', game.id)
      console.log('Game ID is array:', Array.isArray(game.id))
      console.log('URL id converted to number:', Number(id))
      console.log('Do they match?', game.id === Number(id))
    }
  }, [game, id])

  useEffect(() => {
    if (game) {
      setEditForm({
        status: game.status,
        rating: game.rating?.toString() || '',
        notes: game.notes || '',
        playtime: game.playtime?.toString() || ''
      })
    }
  }, [game])

  useEffect(() => {
    const fetchIGDBData = async () => {
      if (!game) return
      
      // Fix: Ensure we have a valid numeric ID
      let gameId = game.id
      if (Array.isArray(gameId)) {
        console.warn('Game ID is an array, using first element:', gameId)
        gameId = gameId[0]
      }
      
      if (typeof gameId !== 'number' || isNaN(gameId)) {
        console.error('Invalid game ID:', gameId)
        return
      }
      
      try {
        setLoading(true)
        // Pass the game name instead of ID to avoid corruption
        const igdbData = await igdbService.getGameByName(game.name)
        setIgdbGame(igdbData)
        
        // Fetch similar games if we have IGDB data
        if (igdbData) {
          try {
            setLoadingSimilarGames(true)
            const similar = await igdbService.getSimilarGames(igdbData, 6)
            setSimilarGames(similar)
          } catch (error) {
            console.error('Error fetching similar games:', error)
          } finally {
            setLoadingSimilarGames(false)
          }
        }
      } catch (error) {
        console.error('Error fetching IGDB data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchIGDBData()
  }, [game])

  if (!game) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <X className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-medium text-red-400 mb-2">Game Not Found</h3>
        <p className="text-gray-400 mb-4">The game you're looking for doesn't exist in your library.</p>
        <button
          onClick={() => navigate('/library')}
          className="btn-primary"
        >
          Back to Library
        </button>
      </div>
    )
  }

  const handleSave = () => {
    const updatedGame = {
      ...game,
      status: editForm.status as any,
      rating: editForm.rating ? Number(editForm.rating) : undefined,
      notes: editForm.notes || undefined,
      playtime: editForm.playtime ? Number(editForm.playtime) : undefined,
    }
    
    updateGame(updatedGame)
    setEditing(false)
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to remove "${game.name}" from your library?`)) {
      removeGame(game.id)
      navigate('/library')
    }
  }

  // Helper function to format release date
  const formatReleaseDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Helper function to format region
  const formatRegion = (region: number) => {
    const regions = {
      1: 'Europe',
      2: 'North America',
      3: 'Australia',
      4: 'New Zealand',
      5: 'Japan',
      6: 'China',
      7: 'Asia',
      8: 'Worldwide'
    }
    return regions[region as keyof typeof regions] || 'Unknown'
  }

  // Helper function to format release category
  const formatReleaseCategory = (category: number) => {
    const categories = {
      0: 'Unknown',
      1: 'Worldwide',
      2: 'Europe',
      3: 'North America',
      4: 'Australia',
      5: 'New Zealand',
      6: 'Japan',
      7: 'China',
      8: 'Asia'
    }
    return categories[category as keyof typeof categories] || 'Unknown'
  }

  // Helper function to format time
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  // Helper function to get age rating text
  const getAgeRatingText = (rating: number, category: number) => {
    const ratings = {
      1: '3+',
      2: '7+',
      3: '12+',
      4: '16+',
      5: '18+',
      6: 'RP',
      7: 'EC',
      8: 'E',
      9: 'E10+',
      10: 'T',
      11: 'M',
      12: 'AO'
    }
    const categories = {
      1: 'ESRB',
      2: 'PEGI',
      3: 'CERO',
      4: 'USK',
      5: 'GRAC',
      6: 'ClassInd',
      7: 'ACB'
    }
    return `${categories[category as keyof typeof categories] || 'Unknown'}: ${ratings[rating as keyof typeof ratings] || 'Unknown'}`
  }

  const statusConfig = {
    playing: { icon: Clock, label: 'Playing', color: 'status-playing' },
    completed: { icon: Trophy, label: 'Completed', color: 'status-completed' },
    backlog: { icon: BarChart3, label: 'Backlog', color: 'status-backlog' },
    dropped: { icon: X, label: 'Dropped', color: 'status-dropped' },
  }

  const currentStatus = statusConfig[game.status]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/library')}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Library</span>
        </button>
        
        <div className="flex items-center space-x-3">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                className="btn-primary"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="btn-outline"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="btn-outline"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="btn-outline text-red-400 hover:text-red-300 hover:border-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Game Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Cover and Basic Info */}
        <div className="lg:col-span-1">
          {/* Cover Image */}
          <div className="aspect-[3/4] rounded-xl overflow-hidden mb-6">
            {game.cover ? (
              <img
                src={game.cover}
                alt={game.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-dark-700 flex items-center justify-center">
                <Gamepad2 className="w-16 h-16 text-dark-500" />
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <span className={`status-badge ${currentStatus.color} text-base px-4 py-2`}>
              <currentStatus.icon className="w-4 h-4 mr-2" />
              {currentStatus.label}
            </span>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            {game.rating && (
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-300">Your Rating:</span>
                <span className="text-white font-semibold">{Math.round(game.rating)}/100</span>
              </div>
            )}
            
            {game.playtime && (
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">Playtime:</span>
                <span className="text-white font-semibold">{game.playtime}h</span>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span className="text-gray-300">Added:</span>
              <span className="text-white font-semibold">
                {new Date(game.addedDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Platform Ownership - Compact left column version */}
          {game.platforms && game.platforms.length > 0 && (
            <div className="bg-dark-800 rounded-lg p-4 border border-dark-600 mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider flex items-center">
                  <Package className="w-4 h-4 mr-2 text-primary-400" />
                  Platform Ownership
                </h3>
                <button
                  onClick={() => setEditingPlatformOwnership(!editingPlatformOwnership)}
                  className="text-xs text-primary-400 hover:text-primary-300 transition-colors duration-200"
                >
                  {editingPlatformOwnership ? 'Cancel' : 'Edit'}
                </button>
              </div>
              
              {/* Current Ownership Tags - Compact display */}
              {!editingPlatformOwnership && game.platformOwnership && game.platformOwnership.length > 0 && (
                <div className="space-y-2">
                  {game.platformOwnership.map((ownership, index) => (
                    <div key={index} className="text-xs bg-dark-700 p-2 rounded border border-dark-600">
                      <div className="font-medium text-white">{ownership.platform}</div>
                      {ownership.storefront && (
                        <div className="text-gray-400 text-xs mt-1">
                          Store: {ownership.storefront}
                        </div>
                      )}
                      {ownership.subscriptionService && (
                        <div className="text-yellow-400 text-xs mt-1">
                          {ownership.subscriptionService}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* No ownership data message */}
              {!editingPlatformOwnership && (!game.platformOwnership || game.platformOwnership.length === 0) && (
                <div className="text-center py-3 text-gray-500 text-xs">
                  No ownership data yet. Click Edit to add your collection.
                </div>
              )}

              {/* Edit Form - Compact version */}
              {editingPlatformOwnership && (
                <div className="mt-3">
                  <PlatformOwnershipEditor
                    platforms={game.platforms}
                    platformOwnership={game.platformOwnership || []}
                    onSave={(platformOwnership) => {
                      updatePlatformOwnership(game.id, platformOwnership)
                      setEditingPlatformOwnership(false)
                    }}
                    onCancel={() => setEditingPlatformOwnership(false)}
                    isEditing={true}
                    onEdit={() => {}}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Details and Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Game Title */}
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{game.name}</h1>
            {igdbGame?.aggregated_rating && (
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-gray-300">
                  IGDB Rating: {Math.round(igdbGame.aggregated_rating)}/100
                </span>
              </div>
            )}
          </div>

          {/* Game Information - Moved higher for quick readability */}
          {igdbGame && igdbGame.first_release_date && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                Game Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Release Date and Rating */}
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-400">Release Date:</span>
                    <span className="text-white ml-2 font-medium">
                      {formatReleaseDate(igdbGame.first_release_date)}
                    </span>
                  </div>
                  {igdbGame.rating && (
                    <div>
                      <span className="text-gray-400">User Rating:</span>
                      <span className="text-white ml-2 font-medium">
                        {Math.round(igdbGame.rating)}/100
                      </span>
                    </div>
                  )}
                  {igdbGame.total_rating_count && (
                    <div>
                      <span className="text-gray-400">Total Ratings:</span>
                      <span className="text-white ml-2 font-medium">
                        {igdbGame.total_rating_count.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Genres and Platforms */}
                <div className="space-y-4">
                  {/* Genres */}
                  {igdbGame.genres && igdbGame.genres.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                        <Tag className="w-4 h-4 mr-2" />
                        Genres
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {igdbGame.genres.map((genre) => (
                          <span
                            key={genre.id}
                            className="px-3 py-1 bg-blue-900/30 text-blue-300 text-sm rounded-md border border-blue-700/30"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Platforms */}
                  {igdbGame.platforms && igdbGame.platforms.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        Platforms
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {igdbGame.platforms.map((platform) => (
                          <span
                            key={platform.id}
                            className="px-3 py-1 bg-green-900/30 text-green-300 text-sm rounded-md border border-green-700/30"
                          >
                            {platform.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Additional Game Details */}
          {igdbGame && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <GamepadIcon className="w-5 h-5 mr-2 text-orange-400" />
                Additional Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Developers and Publishers */}
                <div className="space-y-4">
                  {igdbGame.involved_companies && igdbGame.involved_companies.length > 0 && (
                    <>
                      {/* Developers */}
                      {igdbGame.involved_companies.filter(company => company.developer).length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                            <Code className="w-4 h-4 mr-2" />
                            Developers
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {igdbGame.involved_companies
                              .filter(company => company.developer)
                              .map((company, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-purple-900/30 text-purple-300 text-sm rounded-md border border-purple-700/30"
                                >
                                  {company.company.name}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Publishers */}
                      {igdbGame.involved_companies.filter(company => company.publisher).length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                            <Building2 className="w-4 h-4 mr-2" />
                            Publishers
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {igdbGame.involved_companies
                              .filter(company => company.publisher)
                              .map((company, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-indigo-900/30 text-indigo-300 text-sm rounded-md border border-indigo-700/30"
                                >
                                  {company.company.name}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Themes */}
                  {igdbGame.themes && igdbGame.themes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        Themes
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {igdbGame.themes.map((theme) => (
                          <span
                            key={theme.id}
                            className="px-3 py-1 bg-pink-900/30 text-pink-300 text-sm rounded-md border border-pink-700/30"
                          >
                            {theme.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Game Modes */}
                  {igdbGame.game_modes && igdbGame.game_modes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Game Modes
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {igdbGame.game_modes.map((mode) => (
                          <span
                            key={mode.id}
                            className="px-3 py-1 bg-teal-900/30 text-teal-300 text-sm rounded-md border border-teal-700/30"
                          >
                            {mode.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Player Perspectives */}
                  {igdbGame.player_perspectives && igdbGame.player_perspectives.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                        <Eye className="w-4 h-4 mr-2" />
                        Player Perspectives
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {igdbGame.player_perspectives.map((perspective) => (
                          <span
                            key={perspective.id}
                            className="px-3 py-1 bg-amber-900/30 text-amber-300 text-sm rounded-md border border-amber-700/30"
                          >
                            {perspective.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Age Ratings */}
                  {igdbGame.age_ratings && igdbGame.age_ratings.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                        <Award className="w-4 h-4 mr-2" />
                        Age Ratings
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {igdbGame.age_ratings.map((rating, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-red-900/30 text-red-300 text-sm rounded-md border border-red-700/30"
                          >
                            {getAgeRatingText(rating.rating, rating.category)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Alternate Names and Release Dates */}
                <div className="space-y-4">
                  {/* Alternate Names */}
                  {igdbGame.alternative_names && igdbGame.alternative_names.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                        <Languages className="w-4 h-4 mr-2" />
                        Alternate Names
                      </h4>
                      <div className="space-y-2">
                        {igdbGame.alternative_names.map((altName, index) => (
                          <div key={index} className="text-sm">
                            <span className="text-white font-medium">{altName.name}</span>
                            {altName.comment && (
                              <span className="text-gray-400 ml-2">({altName.comment})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Platform-Specific Release Dates */}
                  {igdbGame.release_dates && igdbGame.release_dates.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Release Dates by Platform
                      </h4>
                      <div className="space-y-2">
                        {igdbGame.release_dates
                          .filter(release => release.date && release.platform)
                          .sort((a, b) => (a.date || 0) - (b.date || 0))
                          .map((release, index) => (
                            <div key={index} className="text-sm bg-dark-700 p-2 rounded">
                              <div className="flex justify-between items-start">
                                <span className="text-white font-medium">{release.platform.name}</span>
                                <span className="text-gray-300 text-xs">
                                  {formatReleaseCategory(release.category)}
                                </span>
                              </div>
                              <div className="text-gray-400 text-xs mt-1">
                                {release.human || formatReleaseDate(release.date)}
                                {release.region !== 8 && (
                                  <span className="ml-2 text-gray-500">
                                    ({formatRegion(release.region)})
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Related Content */}
          {igdbGame && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Link className="w-5 h-5 mr-2 text-green-400" />
                Related Content
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* DLCs and Expansions */}
                <div className="space-y-4">
                  {/* DLCs */}
                  {igdbGame.dlcs && igdbGame.dlcs.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        Downloadable Content ({igdbGame.dlcs.length})
                      </h4>
                      <div className="space-y-2">
                        {igdbGame.dlcs.slice(0, 5).map((dlc) => (
                          <button
                            key={dlc.id}
                            onClick={() => {
                              const handleDLCClick = async () => {
                                try {
                                  // Check if the DLC is already in the user's library
                                  const existingGame = state.games.find(g => g.name.toLowerCase() === dlc.name.toLowerCase())
                                  
                                  if (existingGame) {
                                    // If DLC exists, navigate to its details page
                                    navigate(`/game/${existingGame.id}`)
                                    return
                                  }

                                  // If DLC doesn't exist, add it to the library first
                                  const convertedGame = igdbService.convertToGame(dlc)
                                  addGame(convertedGame, dlc.id)
                                  
                                  // Find the newly added game and navigate to it
                                  const newGame = state.games.find(g => g.name.toLowerCase() === dlc.name.toLowerCase())
                                  if (newGame) {
                                    navigate(`/game/${newGame.id}`)
                                  }
                                } catch (error) {
                                  console.error('Error adding DLC to library:', error)
                                  // Fallback: open IGDB page if adding to library fails
                                  window.open(`https://www.igdb.com/search?q=${encodeURIComponent(dlc.name)}`, '_blank')
                                }
                              }
                              handleDLCClick()
                            }}
                            className="w-full flex items-center space-x-3 p-2 bg-dark-700 rounded hover:bg-dark-600 transition-colors duration-200 text-left group"
                          >
                            {dlc.cover && (
                              <img
                                src={`https:${dlc.cover.url.replace('t_thumb', 't_cover_small')}`}
                                alt={dlc.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                            )}
                            <span className="text-white text-sm font-medium group-hover:text-primary-300 transition-colors duration-200">{dlc.name}</span>
                            <Link className="w-3 h-3 text-gray-500 group-hover:text-primary-400 ml-auto transition-colors duration-200" />
                          </button>
                        ))}
                        {igdbGame.dlcs.length > 5 && (
                          <p className="text-xs text-gray-500 text-center">
                            Showing 5 of {igdbGame.dlcs.length} DLCs
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Expansions */}
                  {igdbGame.expansions && igdbGame.expansions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        Expansions ({igdbGame.expansions.length})
                      </h4>
                      <div className="space-y-2">
                        {igdbGame.expansions.slice(0, 5).map((expansion) => (
                          <button
                            key={expansion.id}
                            onClick={() => {
                              const handleExpansionClick = async () => {
                                try {
                                  // Check if the expansion is already in the user's library
                                  const existingGame = state.games.find(g => g.name.toLowerCase() === expansion.name.toLowerCase())
                                  
                                  if (existingGame) {
                                    // If expansion exists, navigate to its details page
                                    navigate(`/game/${existingGame.id}`)
                                    return
                                  }

                                  // If expansion doesn't exist, add it to the library first
                                  const convertedGame = igdbService.convertToGame(expansion)
                                  addGame(convertedGame, expansion.id)
                                  
                                  // Find the newly added game and navigate to it
                                  const newGame = state.games.find(g => g.name.toLowerCase() === expansion.name.toLowerCase())
                                  if (newGame) {
                                    navigate(`/game/${newGame.id}`)
                                  }
                                } catch (error) {
                                  console.error('Error adding expansion to library:', error)
                                  // Fallback: open IGDB page if adding to library fails
                                  window.open(`https://www.igdb.com/search?q=${encodeURIComponent(expansion.name)}`, '_blank')
                                }
                              }
                              handleExpansionClick()
                            }}
                            className="w-full flex items-center space-x-3 p-2 bg-dark-700 rounded hover:bg-dark-600 transition-colors duration-200 text-left group"
                          >
                            {expansion.cover && (
                              <img
                                src={`https:${expansion.cover.url.replace('t_thumb', 't_cover_small')}`}
                                alt={expansion.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                            )}
                            <span className="text-white text-sm font-medium group-hover:text-primary-300 transition-colors duration-200">{expansion.name}</span>
                            <Link className="w-3 h-3 text-gray-500 group-hover:text-primary-400 ml-auto transition-colors duration-200" />
                          </button>
                        ))}
                        {igdbGame.expansions.length > 5 && (
                          <p className="text-xs text-gray-500 text-center">
                            Showing 5 of {igdbGame.expansions.length} expansions
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Standalone Expansions */}
                  {igdbGame.standalone_expansions && igdbGame.standalone_expansions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        Standalone Expansions ({igdbGame.standalone_expansions.length})
                      </h4>
                      <div className="space-y-2">
                        {igdbGame.standalone_expansions.slice(0, 5).map((expansion) => (
                          <button
                            key={expansion.id}
                            onClick={() => {
                              const handleStandaloneExpansionClick = async () => {
                                try {
                                  // Check if the standalone expansion is already in the user's library
                                  const existingGame = state.games.find(g => g.name.toLowerCase() === expansion.name.toLowerCase())
                                  
                                  if (existingGame) {
                                    // If standalone expansion exists, navigate to its details page
                                    navigate(`/game/${existingGame.id}`)
                                    return
                                  }

                                  // If standalone expansion doesn't exist, add it to the library first
                                  const convertedGame = igdbService.convertToGame(expansion)
                                  addGame(convertedGame, expansion.id)
                                  
                                  // Find the newly added game and navigate to it
                                  const newGame = state.games.find(g => g.name.toLowerCase() === expansion.name.toLowerCase())
                                  if (newGame) {
                                    navigate(`/game/${newGame.id}`)
                                  }
                                } catch (error) {
                                  console.error('Error adding standalone expansion to library:', error)
                                  // Fallback: open IGDB page if adding to library fails
                                  window.open(`https://www.igdb.com/search?q=${encodeURIComponent(expansion.name)}`, '_blank')
                                }
                              }
                              handleStandaloneExpansionClick()
                            }}
                            className="w-full flex items-center space-x-3 p-2 bg-dark-700 rounded hover:bg-dark-600 transition-colors duration-200 text-left group"
                          >
                            {expansion.cover && (
                              <img
                                src={`https:${expansion.cover.url.replace('t_thumb', 't_cover_small')}`}
                                alt={expansion.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                            )}
                            <span className="text-white text-sm font-medium group-hover:text-primary-300 transition-colors duration-200">{expansion.name}</span>
                            <Link className="w-3 h-3 text-gray-500 group-hover:text-primary-400 ml-auto transition-colors duration-200" />
                          </button>
                        ))}
                        {igdbGame.standalone_expansions.length > 5 && (
                          <p className="text-xs text-gray-500 text-center">
                            Showing 5 of {igdbGame.standalone_expansions.length} standalone expansions
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bundles */}
                <div className="space-y-4">
                  {igdbGame.bundles && igdbGame.bundles.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        Bundles ({igdbGame.bundles.length})
                      </h4>
                      <div className="space-y-2">
                        {igdbGame.bundles.slice(0, 5).map((bundle) => (
                          <button
                            key={bundle.id}
                            onClick={() => {
                              const handleBundleClick = async () => {
                                try {
                                  // Check if the bundle is already in the user's library
                                  const existingGame = state.games.find(g => g.name.toLowerCase() === bundle.name.toLowerCase())
                                  
                                  if (existingGame) {
                                    // If bundle exists, navigate to its details page
                                    navigate(`/game/${existingGame.id}`)
                                    return
                                  }

                                  // If bundle doesn't exist, add it to the library first
                                  const convertedGame = igdbService.convertToGame(bundle)
                                  addGame(convertedGame, bundle.id)
                                  
                                  // Find the newly added game and navigate to it
                                  const newGame = state.games.find(g => g.name.toLowerCase() === bundle.name.toLowerCase())
                                  if (newGame) {
                                    navigate(`/game/${newGame.id}`)
                                  }
                                } catch (error) {
                                  console.error('Error adding bundle to library:', error)
                                  // Fallback: open IGDB page if adding to library fails
                                  window.open(`https://www.igdb.com/search?q=${encodeURIComponent(bundle.name)}`, '_blank')
                                }
                              }
                              handleBundleClick()
                            }}
                            className="w-full flex items-center space-x-3 p-2 bg-dark-700 rounded hover:bg-dark-600 transition-colors duration-200 text-left group"
                          >
                            {bundle.cover && (
                              <img
                                src={`https:${bundle.cover.url.replace('t_thumb', 't_cover_small')}`}
                                alt={bundle.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                            )}
                            <span className="text-white text-sm font-medium group-hover:text-primary-300 transition-colors duration-200">{bundle.name}</span>
                            <Link className="w-3 h-3 text-gray-500 group-hover:text-primary-400 ml-auto transition-colors duration-200" />
                          </button>
                        ))}
                        {igdbGame.bundles.length > 5 && (
                          <p className="text-xs text-gray-500 text-center">
                            Showing 5 of {igdbGame.bundles.length} bundles
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* No Related Content Message */}
                  {(!igdbGame.dlcs || igdbGame.dlcs.length === 0) &&
                    (!igdbGame.expansions || igdbGame.expansions.length === 0) &&
                    (!igdbGame.standalone_expansions || igdbGame.standalone_expansions.length === 0) &&
                    (!igdbGame.bundles || igdbGame.bundles.length === 0) && (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        <Package className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                        No related content available for this game.
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          {(game.summary || igdbGame?.summary) && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Summary</h3>
              <p className="text-gray-300 leading-relaxed">
                {game.summary || igdbGame?.summary}
              </p>
            </div>
          )}

          {/* Enhanced IGDB Information */}
          {loading && (
            <div className="card">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
                <span className="ml-3 text-gray-400">Loading game details...</span>
              </div>
            </div>
          )}

          {igdbGame && !loading && (
            <>
              {/* Screenshots Gallery */}
              {igdbGame.screenshots && igdbGame.screenshots.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-blue-400" />
                    Screenshots ({igdbGame.screenshots.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {igdbGame.screenshots.slice(0, 8).map((screenshot, index) => (
                      <div key={screenshot.id} className="aspect-video rounded-lg overflow-hidden">
                        <img
                          src={`https:${screenshot.url.replace('t_thumb', 't_cover_big')}`}
                          alt={`${igdbGame.name} screenshot ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                          onClick={() => window.open(`https:${screenshot.url.replace('t_thumb', 't_cover_big')}`, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                  {igdbGame.screenshots.length > 8 && (
                    <p className="text-sm text-gray-400 mt-3 text-center">
                      Showing 8 of {igdbGame.screenshots.length} screenshots
                    </p>
                  )}
                </div>
              )}

              {/* Videos Section */}
              {igdbGame.videos && igdbGame.videos.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Play className="w-5 h-5 mr-2 text-red-400" />
                    Videos ({igdbGame.videos.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {igdbGame.videos.slice(0, 4).map((video) => (
                      <div key={video.id} className="aspect-video rounded-lg overflow-hidden">
                        <iframe
                          src={`https://www.youtube.com/embed/${video.video_id}`}
                          title={`${igdbGame.name} video`}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ))}
                  </div>
                  {igdbGame.videos.length > 4 && (
                    <p className="text-sm text-gray-400 mt-3 text-center">
                      Showing 4 of {igdbGame.videos.length} videos
                    </p>
                  )}
                </div>
              )}

              {/* Websites and Links */}
              {igdbGame.websites && igdbGame.websites.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-green-400" />
                    Links & Resources
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {igdbGame.websites.map((website) => {
                      const categoryNames = {
                        1: 'Official Website',
                        3: 'Wikipedia',
                        5: 'Twitter',
                        6: 'Twitch',
                        13: 'Steam',
                        14: 'Reddit',
                        16: 'Epic Games',
                        23: 'PlayStation Store'
                      }
                      const categoryName = categoryNames[website.category as keyof typeof categoryNames] || 'Other'
                      
                      return (
                        <a
                          key={website.id}
                          href={website.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 p-3 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors duration-200"
                        >
                          <Link className="w-4 h-4 text-primary-400" />
                          <div>
                            <div className="text-white font-medium">{categoryName}</div>
                            <div className="text-sm text-gray-400 truncate">{website.url}</div>
                          </div>
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {!igdbGame && !loading && (
            <div className="card">
              <div className="text-center py-8">
                <GamepadIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No Additional Game Data</h3>
                <p className="text-gray-500 text-sm">
                  Additional game information from IGDB is not available for this title.
                </p>
              </div>
            </div>
          )}

          {/* Edit Form */}
          {editing && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Edit Game Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="input-field w-full"
                  >
                    {Object.entries(statusConfig).map(([status, config]) => (
                      <option key={status} value={status}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Rating (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editForm.rating}
                    onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
                    className="input-field w-full"
                    placeholder="Enter rating"
                  />
                </div>

                {/* Playtime */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Playtime (hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.playtime}
                    onChange={(e) => setEditForm({ ...editForm, playtime: e.target.value })}
                    className="input-field w-full"
                    placeholder="Enter playtime"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="input-field w-full h-32 resize-none"
                  placeholder="Add your thoughts, tips, or notes about this game..."
                />
              </div>
            </div>
          )}

          {/* Notes Display */}
          {!editing && game.notes && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-3">Your Notes</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{game.notes}</p>
            </div>
          )}

          {/* Similar Games - Moved to bottom of page */}
          {igdbGame && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <GamepadIcon className="w-5 h-5 mr-2 text-blue-400" />
                Similar Games
              </h3>
              <SimilarGamesSection currentGame={igdbGame} similarGames={similarGames} loading={loadingSimilarGames} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
