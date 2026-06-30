export function formatDateTime(dateString) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function isBeforeMatch(matchDate, hoursBefore = 1) {
  const now = new Date()
  const match = new Date(matchDate)
  const cutoff = new Date(match.getTime() - hoursBefore * 60 * 60 * 1000)
  return now < cutoff
}

export function getMatchStatus(status) {
  const statusMap = {
    'NS': 'Nao iniciado',
    'LIVE': 'Ao vivo',
    'HT': 'Intervalo',
    'FT': 'Encerrado'
  }
  return statusMap[status] || status
}
