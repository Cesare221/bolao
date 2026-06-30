export const excludedParticipantNames = new Set([
  'cesar',
  'cesar augusto'
])

export function isExcludedParticipantName(name) {
  return excludedParticipantNames.has(String(name || '').trim().toLowerCase())
}
