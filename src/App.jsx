import React from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import HomePage from './pages/HomePage'
import MatchesPage from './pages/MatchesPage'
import PredictionPage from './pages/PredictionPage'
import RankingPage from './pages/RankingPage'
import AdminPage from './pages/AdminPage'
import './App.css'
import { House, CalendarDays, Trophy, Shield } from 'lucide-react'

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
            <House className="nav-icon" />
            <span className="nav-label">Home</span>
          </NavLink>
          <NavLink to="/jogos" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <CalendarDays className="nav-icon" />
            <span className="nav-label">Jogos</span>
          </NavLink>
          <NavLink to="/ranking" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Trophy className="nav-icon" />
            <span className="nav-label">Ranking</span>
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Shield className="nav-icon" />
            <span className="nav-label">Admin</span>
          </NavLink>
        </nav>
      </div>
    </BrowserRouter>
  )
}
