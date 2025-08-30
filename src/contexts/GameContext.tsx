import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'

// Types
export interface Game {
  id: number
  name: string
  cover?: string
  summary?: string
  genres?: string[]
  platforms?: string[]
  platformOwnership?: PlatformOwnership[]
  releaseDate?: string
  rating?: number
  playtime?: number
  status: 'playing' | 'completed' | 'backlog' | 'dropped'
  addedDate: string
  notes?: string
  wishlisted: boolean
}

export interface PlatformOwnership {
  platform: string
  owned: boolean
  storefront: Storefront | null
  subscriptionService: SubscriptionService | null
  purchaseDate?: string
  purchasePrice?: number
  notes?: string
}

export interface Toast {
  id: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  duration?: number
}

export type Storefront = 
  // Physical Copies
  | 'Physical'
  // PC Storefronts
  | 'Steam' | 'Epic Games Store' | 'GOG Galaxy' | 'Battle.net' | 'Origin' | 'EA App' | 'Ubisoft Connect' | 'Rockstar Games Launcher' | 'Bethesda.net' | 'Microsoft Store' | 'itch.io' | 'Humble Store' | 'Green Man Gaming' | 'Fanatical'
  // Console Storefronts
  | 'PlayStation Store' | 'Xbox Store' | 'Nintendo eShop'
  // Mobile Storefronts
  | 'App Store' | 'Google Play Store' | 'Amazon Appstore'
  // Other
  | 'Other'

export type SubscriptionService = 
  // PC Subscriptions
  | 'Xbox Game Pass (PC)' | 'EA Play' | 'Ubisoft+' | 'Apple Arcade' | 'Amazon Prime Gaming'
  // Console Subscriptions
  | 'Xbox Game Pass (Console)' | 'Xbox Game Pass Ultimate' | 'PlayStation Plus' | 'PlayStation Now' | 'Nintendo Switch Online'
  // Other
  | 'Other' | null

export interface GameState {
  games: Game[]
  loading: boolean
  error: string | null
  searchResults: Game[]
  currentGame: Game | null
  toasts: Toast[]
}

export type GameAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_GAME'; payload: Game }
  | { type: 'UPDATE_GAME'; payload: Game }
  | { type: 'REMOVE_GAME'; payload: number }
  | { type: 'SET_GAMES'; payload: Game[] }
  | { type: 'SET_SEARCH_RESULTS'; payload: Game[] }
  | { type: 'SET_CURRENT_GAME'; payload: Game | null }
  | { type: 'TOGGLE_WISHLIST'; payload: number }
  | { type: 'UPDATE_PLATFORM_OWNERSHIP'; payload: { gameId: number; platformOwnership: PlatformOwnership[] } }
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string }

// Initial state
const initialState: GameState = {
  games: [],
  loading: false,
  error: null,
  searchResults: [],
  currentGame: null,
  toasts: [],
}

// Reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'ADD_GAME':
      return { ...state, games: [...state.games, action.payload] }
    case 'UPDATE_GAME':
      return {
        ...state,
        games: state.games.map(game =>
          game.id === action.payload.id ? action.payload : game
        ),
      }
    case 'REMOVE_GAME':
      return {
        ...state,
        games: state.games.filter(game => game.id !== action.payload),
      }
    case 'SET_GAMES':
      return { ...state, games: action.payload }
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload }
    case 'SET_CURRENT_GAME':
      return { ...state, currentGame: action.payload }
    case 'TOGGLE_WISHLIST':
      return {
        ...state,
        games: state.games.map(game =>
          game.id === action.payload ? { ...game, wishlisted: !game.wishlisted } : game
        ),
      }
    case 'UPDATE_PLATFORM_OWNERSHIP':
      return {
        ...state,
        games: state.games.map(game =>
          game.id === action.payload.gameId ? { ...game, platformOwnership: action.payload.platformOwnership } : game
        ),
      }
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      }
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload),
      }
    default:
      return state
  }
}

// Context
interface GameContextType {
  state: GameState
  dispatch: React.Dispatch<GameAction>
  addGame: (game: Omit<Game, 'id' | 'addedDate'>, preserveId?: number) => void
  updateGame: (game: Game) => void
  removeGame: (id: number) => void
  searchGames: (query: string) => Promise<void>
  getGameById: (id: number) => Game | undefined
  toggleWishlist: (id: number) => void
  getWishlistedGames: () => Game[]
  updatePlatformOwnership: (gameId: number, platformOwnership: PlatformOwnership[]) => void
  addToast: (message: string, type: Toast['type'], duration?: number) => void
  removeToast: (id: string) => void
  cleanupDuplicates: () => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

// Provider
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  // Load games from localStorage on mount
  useEffect(() => {
    const savedGames = localStorage.getItem('gameLibrary')
    if (savedGames) {
      try {
        const games = JSON.parse(savedGames)
        dispatch({ type: 'SET_GAMES', payload: games })
      } catch (error) {
        console.error('Error loading games from localStorage:', error)
      }
    }
  }, [])

  // Save games to localStorage whenever games change
  useEffect(() => {
    localStorage.setItem('gameLibrary', JSON.stringify(state.games))
  }, [state.games])

  // Auto-remove toasts after duration
  useEffect(() => {
    state.toasts.forEach(toast => {
      if (toast.duration) {
        const timer = setTimeout(() => {
          removeToast(toast.id)
        }, toast.duration)
        return () => clearTimeout(timer)
      }
    })
  }, [state.toasts])

  // Helper functions
  const addGame = (gameData: Omit<Game, 'id' | 'addedDate'>, preserveId?: number) => {
    // Check if a game with the same name already exists
    const existingGame = state.games.find(g => 
      g.name.toLowerCase() === gameData.name.toLowerCase()
    )
    
    if (existingGame) {
      // If game exists, don't add a duplicate - just show a toast
      addToast(`"${gameData.name}" is already in your library! 🎮`, 'info', 3000)
      return
    }

    // Use the preserved ID if provided (for IGDB games), otherwise generate a unique local ID
    const gameId = preserveId || (Date.now() + Math.floor(Math.random() * 1000))
    
    const newGame: Game = {
      ...gameData,
      id: gameId,
      addedDate: new Date().toISOString(),
      wishlisted: gameData.wishlisted || false,
    }
    dispatch({ type: 'ADD_GAME', payload: newGame })
  }

  // Function to clean up duplicate games (useful for existing libraries)
  const cleanupDuplicates = () => {
    const seenNames = new Set<string>()
    const uniqueGames: Game[] = []
    let duplicatesRemoved = 0
    
    state.games.forEach(game => {
      const normalizedName = game.name.toLowerCase().trim()
      if (seenNames.has(normalizedName)) {
        duplicatesRemoved++
      } else {
        seenNames.add(normalizedName)
        uniqueGames.push(game)
      }
    })
    
    if (duplicatesRemoved > 0) {
      dispatch({ type: 'SET_GAMES', payload: uniqueGames })
      addToast(`Cleaned up ${duplicatesRemoved} duplicate game(s)`, 'success', 3000)
    } else {
      addToast('No duplicates found in your library', 'info', 3000)
    }
  }

  const updateGame = (game: Game) => {
    dispatch({ type: 'UPDATE_GAME', payload: game })
  }

  const removeGame = (id: number) => {
    dispatch({ type: 'REMOVE_GAME', payload: id })
  }

  const searchGames = async (query: string) => {
    if (!query.trim()) {
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: [] })
      return
    }

    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      // This would integrate with IGDB API
      // For now, we'll search local games
      const results = state.games.filter(game =>
        game.name.toLowerCase().includes(query.toLowerCase()) ||
        game.genres?.some(genre => genre.toLowerCase().includes(query.toLowerCase()))
      )
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: results })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error searching games' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const getGameById = (id: number) => {
    return state.games.find(game => game.id === id)
  }

  const toggleWishlist = (id: number) => {
    const game = state.games.find(g => g.id === id)
    if (game) {
      const newWishlistedState = !game.wishlisted
      dispatch({ type: 'TOGGLE_WISHLIST', payload: id })
      
      // Show toast notification
      const message = newWishlistedState 
        ? `"${game.name}" added to wishlist! ❤️`
        : `"${game.name}" removed from wishlist 💔`
      addToast(message, 'success', 3000)
    }
  }

  const getWishlistedGames = () => {
    return state.games.filter(game => game.wishlisted)
  }

  const updatePlatformOwnership = (gameId: number, platformOwnership: PlatformOwnership[]) => {
    dispatch({ type: 'UPDATE_PLATFORM_OWNERSHIP', payload: { gameId, platformOwnership } })
  }

  const addToast = (message: string, type: Toast['type'], duration: number = 3000) => {
    const id = Date.now().toString()
    const toast: Toast = { id, message, type, duration }
    dispatch({ type: 'ADD_TOAST', payload: toast })
  }

  const removeToast = (id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id })
  }

  const value: GameContextType = {
    state,
    dispatch,
    addGame,
    updateGame,
    removeGame,
    searchGames,
    getGameById,
    toggleWishlist,
    getWishlistedGames,
    updatePlatformOwnership,
    addToast,
    removeToast,
    cleanupDuplicates,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

// Hook
export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
