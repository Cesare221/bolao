import React from 'react'
import { Medal } from 'lucide-react'

export default function RankingPage() {
  return (
    <div className="page ranking-page">
      <div className="page-hero compact">
        <div className="page-hero-chip"><Medal size={14} /> Ranking</div>
        <h1 className="page-title">Ranking Geral</h1>
        <p className="page-subtitle">Ranking fora do ar, voltamos ao final da partida.</p>
      </div>
      <div className="empty-panel">
        <Medal size={22} />
        <p className="empty-state">Ranking fora do ar, voltamos ao final da partida.</p>
      </div>
    </div>
  )
}
