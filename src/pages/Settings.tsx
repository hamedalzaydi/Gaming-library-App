import { useState } from 'react'
import { 
  Download, 
  Upload, 
  Trash2, 
  Save, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Database,
  Palette,
  Bell
} from 'lucide-react'
import { useGame } from '../contexts/GameContext'

export default function Settings() {
  const { state, dispatch } = useGame()
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle')
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle')
  const [importData, setImportData] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleExport = async () => {
    try {
      setExportStatus('exporting')
      
      const data = {
        games: state.games,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gamevault-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setExportStatus('success')
      setTimeout(() => setExportStatus('idle'), 3000)
    } catch (error) {
      console.error('Export error:', error)
      setExportStatus('error')
      setTimeout(() => setExportStatus('idle'), 3000)
    }
  }

  const handleImport = async () => {
    if (!importData.trim()) {
      setImportStatus('error')
      setTimeout(() => setImportStatus('idle'), 3000)
      return
    }

    try {
      setImportStatus('importing')
      
      const parsedData = JSON.parse(importData)
      
      if (!parsedData.games || !Array.isArray(parsedData.games)) {
        throw new Error('Invalid backup file format')
      }

      // Validate game data structure
      const validGames = parsedData.games.filter((game: any) => {
        return game.id && game.name && game.status && game.addedDate
      })

      if (validGames.length === 0) {
        throw new Error('No valid games found in backup file')
      }

      // Clear current games and import new ones
      dispatch({ type: 'SET_GAMES', payload: validGames })
      
      setImportData('')
      setImportStatus('success')
      setTimeout(() => setImportStatus('idle'), 3000)
    } catch (error) {
      console.error('Import error:', error)
      setImportStatus('error')
      setTimeout(() => setImportStatus('idle'), 3000)
    }
  }

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all your game data? This action cannot be undone.')) {
      dispatch({ type: 'SET_GAMES', payload: [] })
      setShowDeleteConfirm(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />
      case 'exporting':
      case 'importing':
        return <div className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'Success!'
      case 'error':
        return 'Error occurred'
      case 'exporting':
        return 'Exporting...'
      case 'importing':
        return 'Importing...'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400">
          Manage your app preferences and data
        </p>
      </div>

      {/* Data Management */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
          <Database className="w-5 h-5 text-primary-400" />
          <span>Data Management</span>
        </h2>

        {/* Export Data */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Export Your Data</h3>
          <p className="text-gray-400 mb-4">
            Download a backup of your game library as a JSON file. This includes all your games, ratings, notes, and playtime data.
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleExport}
              disabled={exportStatus === 'exporting'}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Library</span>
            </button>
            {exportStatus !== 'idle' && (
              <div className="flex items-center space-x-2 text-sm">
                {getStatusIcon(exportStatus)}
                <span className={exportStatus === 'success' ? 'text-green-400' : exportStatus === 'error' ? 'text-red-400' : 'text-primary-400'}>
                  {getStatusText(exportStatus)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Import Data */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Import Data</h3>
          <p className="text-gray-400 mb-4">
            Import a previously exported backup file. This will replace your current library with the imported data.
          </p>
          <div className="space-y-4">
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste your backup JSON data here..."
              className="input-field w-full h-32 resize-none font-mono text-sm"
            />
            <div className="flex items-center space-x-4">
              <button
                onClick={handleImport}
                disabled={importStatus === 'importing' || !importData.trim()}
                className="btn-secondary flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Import Library</span>
              </button>
              {importStatus !== 'idle' && (
                <div className="flex items-center space-x-2 text-sm">
                  {getStatusIcon(importStatus)}
                  <span className={importStatus === 'success' ? 'text-green-400' : importStatus === 'error' ? 'text-red-400' : 'text-primary-400'}>
                    {getStatusText(importStatus)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Clear Data */}
        <div className="card border-red-700/30">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span>Danger Zone</span>
          </h3>
          <p className="text-gray-400 mb-4">
            Permanently delete all your game data. This action cannot be undone.
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-outline text-red-400 hover:text-red-300 hover:border-red-400 flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Data</span>
            </button>
            <span className="text-sm text-gray-500">
              {state.games.length} games in library
            </span>
          </div>
        </div>
      </div>

      {/* App Preferences */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
          <Palette className="w-5 h-5 text-secondary-400" />
          <span>App Preferences</span>
        </h2>

        {/* Theme Settings */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Theme</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="dark-theme"
                name="theme"
                value="dark"
                defaultChecked
                className="w-4 h-4 text-primary-600 bg-dark-700 border-dark-600 focus:ring-primary-500"
              />
              <label htmlFor="dark-theme" className="text-gray-300">
                Dark Theme (Default)
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="light-theme"
                name="theme"
                value="light"
                disabled
                className="w-4 h-4 text-primary-600 bg-dark-700 border-dark-600 focus:ring-primary-500 disabled:opacity-50"
              />
              <label htmlFor="light-theme" className="text-gray-500">
                Light Theme (Coming Soon)
              </label>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Bell className="w-5 h-5 text-yellow-400" />
            <span>Notifications</span>
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 font-medium">Backlog Reminders</p>
                <p className="text-sm text-gray-400">Get reminded about games in your backlog</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 font-medium">New Game Releases</p>
                <p className="text-sm text-gray-400">Get notified about new game releases</p>
              </div>
              <input
                type="checkbox"
                className="w-4 h-4 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Data Settings */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Data Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 font-medium">Auto-save</p>
                <p className="text-sm text-gray-400">Automatically save changes to your library</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                disabled
                className="w-4 h-4 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500 disabled:opacity-50"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 font-medium">Cloud Sync</p>
                <p className="text-sm text-gray-400">Sync your library across devices (Coming Soon)</p>
              </div>
              <input
                type="checkbox"
                disabled
                className="w-4 h-4 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500 disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">About GameVault</h2>
        <div className="space-y-3 text-gray-400">
          <p>Version: 1.0.0</p>
          <p>A comprehensive gaming library app for tracking and managing your game collection.</p>
          <p>Powered by IGDB API for game data and information.</p>
          <p className="text-sm text-gray-500">
            Built with React, TypeScript, and Tailwind CSS
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-800 border border-red-700 rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <h3 className="text-lg font-semibold text-white">Clear All Data?</h3>
            </div>
            <p className="text-gray-300 mb-6">
              This will permanently delete all your games, ratings, notes, and playtime data. 
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleClearData}
                className="btn-outline text-red-400 hover:text-red-300 hover:border-red-400 flex-1"
              >
                Yes, Clear Everything
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-primary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
