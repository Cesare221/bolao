import React from 'react'
import { formatDateTime, getMatchStatus } from '../utils/dateHelpers'

export function MatchCard({ match, prediction }) {
  return (
    <div className="match-card">
      <div className="match-header">
        <span className={`match-status status-${match.status?.toLowerCase() || 'ns'}`}>
          {getMatchStatus(match.status)}
        </span>
        <span className="match-date">{formatDateTime(match.match_date)}</span>
      </div>
      <div className="match-teams">
        <div className="team brazil">
          <span className="team-flag">🇧🇷</span>
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
          <span className="team-flag">{match.opponent_flag || '🏳️'}</span>
          <span className="team-name">{match.opponent}</span>
        </div>
      </div>
      {prediction && (
        <div className="prediction-badge">
          Seu palpite: {prediction.brazil_score} - {prediction.opponent_score}
        </div>
      )}
    </div>
  )
}
