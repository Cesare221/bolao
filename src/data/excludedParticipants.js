export const excludedParticipantNames = new Set([])

export function isExcludedParticipantName(name) {
  return excludedParticipantNames.has(String(name || '').trim().toLowerCase())
}
