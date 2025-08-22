import { Routes, Route } from 'react-router-dom'
import { GameProvider } from './contexts/GameContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Library from './pages/Library'
import Search from './pages/Search'
import GameDetails from './pages/GameDetails'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

function App() {
  return (
    <GameProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="/search" element={<Search />} />
          <Route path="/game/:id" element={<GameDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </GameProvider>
  )
}

export default App
