import React from 'react'
import { formatDateTime, getMatchStatus } from '../utils/dateHelpers'
import { Clock3, ChevronRight } from 'lucide-react'

export function MatchCard({ match, prediction }) {
  const opponentCode = (match.opponent || '??')
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="match-card">
      <div className="match-header">
        <span className={`match-status status-${match.status?.toLowerCase() || 'ns'}`}>
          {getMatchStatus(match.status)}
        </span>
        {match.is_test && (
          <span className="test-badge">Teste local</span>
        )}
        <span className="match-date"><Clock3 size={12} /> {formatDateTime(match.match_date)}</span>
      </div>
      <div className="match-teams">
        <div className="team brazil">
          <span className="team-code">BR</span>
          <span className="team-name">Brasil</span>
        </div>
        <div className="score-display">
          {match.brazil_score !== null && match.opponent_score !== null ? (
            <span className="score-value">{match.brazil_score} - {match.opponent_score}</span>
          ) : (
            <span className="score-value">vs</span>
          )}
        </div>
        <div className="team opponent">
          <span className="team-code">{opponentCode}</span>
          <span className="team-name">{match.opponent}</span>
        </div>
      </div>
      {prediction && (
        <div className="prediction-badge">
          Seu palpite: {prediction.brazil_score} - {prediction.opponent_score}
          <ChevronRight size={14} />
        </div>
      )}
    </div>
  )
}
