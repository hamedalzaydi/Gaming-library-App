import { useMemo } from 'react'
import { 
  Trophy, 
  Clock, 
  BarChart3, 
  Calendar,
  Star,
  TrendingUp,
  Target,
  Award
} from 'lucide-react'
import { useGame } from '../contexts/GameContext'

export default function Profile() {
  const { state } = useGame()

  const stats = useMemo(() => {
    const games = state.games
    const totalGames = games.length
    const playing = games.filter(g => g.status === 'playing').length
    const completed = games.filter(g => g.status === 'completed').length
    const backlog = games.filter(g => g.status === 'backlog').length
    const dropped = games.filter(g => g.status === 'dropped').length
    
    const totalRating = games.reduce((sum, g) => sum + (g.rating || 0), 0)
    const ratedGames = games.filter(g => g.rating).length
    const averageRating = ratedGames > 0 ? totalRating / ratedGames : 0
    
    const totalPlaytime = games.reduce((sum, g) => sum + (g.playtime || 0), 0)
    const gamesWithPlaytime = games.filter(g => g.playtime).length
    const averagePlaytime = gamesWithPlaytime > 0 ? totalPlaytime / gamesWithPlaytime : 0

    // Calculate completion rate
    const completionRate = totalGames > 0 ? (completed / totalGames) * 100 : 0

    // Get top rated games
    const topRated = games
      .filter(g => g.rating)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5)

    // Get most played games
    const mostPlayed = games
      .filter(g => g.playtime)
      .sort((a, b) => (b.playtime || 0) - (a.playtime || 0))
      .slice(0, 5)

    // Get recent additions
    const recentAdditions = games
      .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
      .slice(0, 5)

    // Get genre distribution
    const genreCounts: Record<string, number> = {}
    games.forEach(game => {
      game.genres?.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1
      })
    })
    const topGenres = Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    // Get platform distribution
    const platformCounts: Record<string, number> = {}
    games.forEach(game => {
      game.platforms?.forEach(platform => {
        platformCounts[platform] = (platformCounts[platform] || 0) + 1
      })
    })
    const topPlatforms = Object.entries(platformCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    return {
      totalGames,
      playing,
      completed,
      backlog,
      dropped,
      averageRating: Math.round(averageRating),
      averagePlaytime: Math.round(averagePlaytime * 10) / 10,
      completionRate: Math.round(completionRate),
      topRated,
      mostPlayed,
      recentAdditions,
      topGenres,
      topPlatforms,
      totalPlaytime
    }
  }, [state.games])

  const achievements = useMemo(() => {
    const achievements = []
    
    if (stats.totalGames >= 10) achievements.push({ name: 'Game Collector', description: 'Added 10+ games to your library', icon: Trophy, color: 'text-yellow-400' })
    if (stats.totalGames >= 50) achievements.push({ name: 'Game Hoarder', description: 'Added 50+ games to your library', icon: Trophy, color: 'text-yellow-400' })
    if (stats.totalGames >= 100) achievements.push({ name: 'Game Master', description: 'Added 100+ games to your library', icon: Trophy, color: 'text-yellow-400' })
    
    if (stats.completed >= 5) achievements.push({ name: 'Completionist', description: 'Completed 5+ games', icon: Award, color: 'text-blue-400' })
    if (stats.completed >= 25) achievements.push({ name: 'Master Completionist', description: 'Completed 25+ games', icon: Award, color: 'text-blue-400' })
    
    if (stats.completionRate >= 50) achievements.push({ name: 'Efficient Gamer', description: '50%+ completion rate', icon: Target, color: 'text-green-400' })
    if (stats.completionRate >= 75) achievements.push({ name: 'Dedicated Gamer', description: '75%+ completion rate', icon: Target, color: 'text-green-400' })
    
    if (stats.totalPlaytime >= 100) achievements.push({ name: 'Time Sink', description: '100+ hours played', icon: Clock, color: 'text-purple-400' })
    if (stats.totalPlaytime >= 500) achievements.push({ name: 'Time Master', description: '500+ hours played', icon: Clock, color: 'text-purple-400' })
    
    if (stats.averageRating >= 80) achievements.push({ name: 'Quality Gamer', description: '80+ average rating', icon: Star, color: 'text-yellow-400' })
    
    return achievements
  }, [stats])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Your Gaming Profile</h1>
        <p className="text-gray-400">
          Track your gaming journey and discover your achievements
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-primary-900/20 border-primary-700/30">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-primary-900/30">
              <BarChart3 className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Total Games</p>
              <p className="text-2xl font-bold text-white">{stats.totalGames}</p>
            </div>
          </div>
        </div>

        <div className="card bg-green-900/20 border-green-700/30">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-green-900/30">
              <Clock className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Currently Playing</p>
              <p className="text-2xl font-bold text-white">{stats.playing}</p>
            </div>
          </div>
        </div>

        <div className="card bg-blue-900/20 border-blue-700/30">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-blue-900/30">
              <Trophy className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-white">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="card bg-yellow-900/20 border-yellow-700/30">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-yellow-900/30">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-white">{stats.completionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Rating Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span>Rating Statistics</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Average Rating:</span>
                <span className="text-white font-semibold">{stats.averageRating}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rated Games:</span>
                <span className="text-white font-semibold">{stats.topRated.length}</span>
              </div>
            </div>
          </div>

          {/* Playtime Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span>Playtime Statistics</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Hours:</span>
                <span className="text-white font-semibold">{stats.totalPlaytime}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Average per Game:</span>
                <span className="text-white font-semibold">{stats.averagePlaytime}h</span>
              </div>
            </div>
          </div>

          {/* Top Genres */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Top Genres</h3>
            <div className="space-y-3">
              {stats.topGenres.map(([genre, count], index) => (
                <div key={genre} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-primary-400">#{index + 1}</span>
                    <span className="text-gray-300">{genre}</span>
                  </div>
                  <span className="text-white font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Platforms */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Top Platforms</h3>
            <div className="space-y-3">
              {stats.topPlatforms.map(([platform, count], index) => (
                <div key={platform} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-secondary-400">#{index + 1}</span>
                    <span className="text-gray-300">{platform}</span>
                  </div>
                  <span className="text-white font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Top Rated Games */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Top Rated Games</h3>
            <div className="space-y-3">
              {stats.topRated.map((game, index) => (
                <div key={game.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-yellow-400">#{index + 1}</span>
                    <span className="text-gray-300">{game.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white font-semibold">{Math.round(game.rating || 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Most Played Games */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Most Played Games</h3>
            <div className="space-y-3">
              {stats.mostPlayed.map((game, index) => (
                <div key={game.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-blue-400">#{index + 1}</span>
                    <span className="text-gray-300">{game.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-semibold">{game.playtime}h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Additions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Additions</h3>
            <div className="space-y-3">
              {stats.recentAdditions.map((game, index) => (
                <div key={game.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-green-400">#{index + 1}</span>
                    <span className="text-gray-300">{game.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-green-400" />
                    <span className="text-white font-semibold">
                      {new Date(game.addedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
          <Award className="w-5 h-5 text-yellow-400" />
          <span>Achievements</span>
        </h3>
        
        {achievements.length === 0 ? (
          <div className="text-center py-8">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No achievements unlocked yet. Keep gaming to earn them!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 bg-dark-700 rounded-lg border border-dark-600">
                <achievement.icon className={`w-8 h-8 ${achievement.color}`} />
                <div>
                  <h4 className="font-semibold text-white">{achievement.name}</h4>
                  <p className="text-sm text-gray-400">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
