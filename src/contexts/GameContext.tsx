import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'

// Types
export interface Game {
  id: number
  name: string
  cover?: string
  summary?: string
  genres?: string[]
  platforms?: string[]
  releaseDate?: string
  rating?: number
  playtime?: number
  status: 'playing' | 'completed' | 'backlog' | 'dropped'
  addedDate: string
  notes?: string
  wishlisted: boolean
}

export interface GameState {
  games: Game[]
  loading: boolean
  error: string | null
  searchResults: Game[]
  currentGame: Game | null
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

// Initial state
const initialState: GameState = {
  games: [],
  loading: false,
  error: null,
  searchResults: [],
  currentGame: null,
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
    default:
      return state
  }
}

// Context
interface GameContextType {
  state: GameState
  dispatch: React.Dispatch<GameAction>
  addGame: (game: Omit<Game, 'id' | 'addedDate'>) => void
  updateGame: (game: Game) => void
  removeGame: (id: number) => void
  searchGames: (query: string) => Promise<void>
  getGameById: (id: number) => Game | undefined
  toggleWishlist: (id: number) => void
  getWishlistedGames: () => Game[]
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

  // Helper functions
  const addGame = (gameData: Omit<Game, 'id' | 'addedDate'>) => {
    const newGame: Game = {
      ...gameData,
      id: Date.now(),
      addedDate: new Date().toISOString(),
      wishlisted: gameData.wishlisted || false,
    }
    dispatch({ type: 'ADD_GAME', payload: newGame })
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
    dispatch({ type: 'TOGGLE_WISHLIST', payload: id })
  }

  const getWishlistedGames = () => {
    return state.games.filter(game => game.wishlisted)
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
