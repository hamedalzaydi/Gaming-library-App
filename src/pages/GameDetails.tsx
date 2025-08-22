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
  Trash2
} from 'lucide-react'
import { useGame } from '../contexts/GameContext'
import { igdbService, IGDBGame } from '../services/igdbService'
import PlatformOwnershipEditor from '../components/PlatformOwnershipEditor'

export default function GameDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { state, updateGame, removeGame, updatePlatformOwnership } = useGame()
  const [igdbGame, setIgdbGame] = useState<IGDBGame | null>(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editingPlatformOwnership, setEditingPlatformOwnership] = useState(false)
  const [editForm, setEditForm] = useState({
    status: '',
    rating: '',
    notes: '',
    playtime: ''
  })

  const game = state.games.find(g => g.id === Number(id))

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
      
      try {
        setLoading(true)
        const igdbData = await igdbService.getGameById(game.id)
        setIgdbGame(igdbData)
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

            {game.releaseDate && (
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Released:</span>
                <span className="text-white font-semibold">
                  {new Date(game.releaseDate).toLocaleDateString()}
                </span>
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

          {/* Genres and Platforms */}
          <div className="flex flex-wrap gap-4">
            {game.genres && game.genres.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Genres
                </h3>
                <div className="flex flex-wrap gap-2">
                  {game.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-dark-700 text-gray-300 text-sm rounded-md"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {game.platforms && game.platforms.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Platforms
                </h3>
                <div className="flex flex-wrap gap-2">
                  {game.platforms.map((platform, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-900/30 text-primary-300 text-sm rounded-md border border-primary-700/30"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Platform Ownership */}
          {game.platforms && game.platforms.length > 0 && (
            <div className="card">
              <PlatformOwnershipEditor
                platforms={game.platforms}
                platformOwnership={game.platformOwnership || []}
                onSave={(platformOwnership) => {
                  updatePlatformOwnership(game.id, platformOwnership)
                  setEditingPlatformOwnership(false)
                }}
                onCancel={() => setEditingPlatformOwnership(false)}
                isEditing={editingPlatformOwnership}
                onEdit={() => setEditingPlatformOwnership(true)}
              />
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

          {/* IGDB Additional Info */}
          {igdbGame && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-3">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {igdbGame.total_rating_count && (
                  <div>
                    <span className="text-gray-400">Total Ratings:</span>
                    <span className="text-white ml-2">{igdbGame.total_rating_count.toLocaleString()}</span>
                  </div>
                )}
                
                {igdbGame.websites && igdbGame.websites.length > 0 && (
                  <div>
                    <span className="text-gray-400">Official Website:</span>
                    <a
                      href={igdbGame.websites.find(w => w.category === 1)?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300 ml-2"
                    >
                      Visit Site
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
