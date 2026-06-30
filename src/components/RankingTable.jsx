import React from 'react'

export function RankingTable({ rankings }) {
  if (!rankings || rankings.length === 0) {
    return <p className="empty-state">Nenhum participante no ranking ainda.</p>
  }

  return (
    <div className="ranking-container">
      {rankings.map((participant, index) => {
        const position = index + 1
        const isPodium = position <= 3

        return (
          <div
            key={participant.participant_id}
            className={`ranking-row ${isPodium ? `podium-${position}` : ''}`}
          >
            <div className="position-badge">{position}</div>
            <div className="participant-info">
              <span className="participant-name">{participant.participant_name}</span>
              {participant.sector && (
                <span className="participant-sector">{participant.sector}</span>
              )}
            </div>
            <div className="participant-stats">
              <div className="stat">
                <span className="stat-value">{participant.total_points}</span>
                <span className="stat-label">pts</span>
              </div>
              <div className="stat-detail">
                <span title="Placares exatos">{participant.exact_scores}E</span>
                <span title="Acertos de vencedor/empate">{participant.correct_outcomes}A</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
