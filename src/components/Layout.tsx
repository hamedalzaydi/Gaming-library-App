import { ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Library, 
  Search, 
  User, 
  Settings, 
  Menu, 
  X,
  Gamepad2,
  BarChart3,
  Clock,
  Trophy,
  Heart
} from 'lucide-react'
import { useGame } from '../contexts/GameContext'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { state } = useGame()

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Library', href: '/library', icon: Library },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Wishlist', href: '/wishlist', icon: Heart },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const stats = [
    {
      name: 'Total Games',
      value: state.games.length,
      icon: Gamepad2,
      color: 'text-primary-400',
    },
    {
      name: 'Playing',
      value: state.games.filter(g => g.status === 'playing').length,
      icon: Clock,
      color: 'text-green-400',
    },
    {
      name: 'Completed',
      value: state.games.filter(g => g.status === 'completed').length,
      icon: Trophy,
      color: 'text-blue-400',
    },
    {
      name: 'Backlog',
      value: state.games.filter(g => g.status === 'backlog').length,
      icon: BarChart3,
      color: 'text-yellow-400',
    },
    {
      name: 'Wishlist',
      value: state.games.filter(g => g.wishlisted).length,
      icon: Heart,
      color: 'text-pink-400',
    },
  ]

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-800 border-r border-dark-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-dark-700">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-gaming font-bold text-gradient">GameVault</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-dark-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-dark-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Stats */}
        <div className="mt-8 px-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Library Stats
          </h3>
          <div className="space-y-3">
            {stats.map((stat) => (
              <div key={stat.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-sm text-gray-300">{stat.name}</span>
                </div>
                <span className="text-sm font-semibold text-white">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-dark-800 border-b border-dark-700">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-dark-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-400">
                <span>Welcome to GameVault</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
