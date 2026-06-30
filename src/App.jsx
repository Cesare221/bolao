import React from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import HomePage from './pages/HomePage'
import MatchesPage from './pages/MatchesPage'
import PredictionPage from './pages/PredictionPage'
import RankingPage from './pages/RankingPage'
import AdminPage from './pages/AdminPage'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jogos" element={<MatchesPage />} />
          <Route path="/palpite/:matchId" element={<PredictionPage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
        <nav className="bottom-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Home</span>
          </NavLink>
          <NavLink to="/jogos" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">⚽</span>
            <span className="nav-label">Jogos</span>
          </NavLink>
          <NavLink to="/ranking" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">🏆</span>
            <span className="nav-label">Ranking</span>
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Admin</span>
          </NavLink>
        </nav>
      </div>
    </BrowserRouter>
  )
}
