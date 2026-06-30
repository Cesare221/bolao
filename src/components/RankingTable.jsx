import React from 'react'
import { Crown, Medal, Award } from 'lucide-react'
import { isExcludedParticipantName } from '../data/excludedParticipants'

function sortRankings(rankings) {
  return [...rankings].sort((a, b) => {
    if ((b.total_points || 0) !== (a.total_points || 0)) {
      return (b.total_points || 0) - (a.total_points || 0)
    }

    if ((b.exact_scores || 0) !== (a.exact_scores || 0)) {
      return (b.exact_scores || 0) - (a.exact_scores || 0)
    }

    return String(a.participant_name || '').localeCompare(String(b.participant_name || ''), 'pt-BR')
  })
}

export function RankingTable({ rankings }) {
  const visibleRankings = (rankings || []).filter(participant => !isExcludedParticipantName(participant.participant_name))

  if (visibleRankings.length === 0) {
    return <p className="empty-state">Nenhum participante no ranking ainda.</p>
  }

  return (
    <div className="ranking-container">
      {sortRankings(visibleRankings).map((participant, index) => {
        const position = index + 1
        const isPodium = position <= 3

        return (
          <div
            key={participant.participant_id}
            className={`ranking-row ${isPodium ? `podium-${position}` : ''}`}
          >
            <div className="position-badge">
              {position === 1 ? <Crown size={16} /> : position === 2 ? <Medal size={16} /> : position === 3 ? <Award size={16} /> : `${position}º`}
            </div>
            <div className="participant-info">
              <span className="participant-name">{participant.participant_name}</span>
            </div>
            <div className="points-pill">{participant.total_points} pts</div>
          </div>
        )
      })}
    </div>
  )
}
