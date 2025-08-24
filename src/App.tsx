import { Routes, Route } from 'react-router-dom'
import { GameProvider, useGame } from './contexts/GameContext'
import Layout from './components/Layout'
import { ToastContainer } from './components/Toast'
import Home from './pages/Home'
import Library from './pages/Library'
import Search from './pages/Search'
import Wishlist from './pages/Wishlist'
import GameDetails from './pages/GameDetails'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

function AppContent() {
  const { state, removeToast } = useGame()
  
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="/search" element={<Search />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/game/:id" element={<GameDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
      <ToastContainer toasts={state.toasts} onRemove={removeToast} />
    </>
  )
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  )
}

export default App
