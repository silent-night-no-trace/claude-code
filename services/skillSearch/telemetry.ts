export function isSkillSearchEnabled(): boolean {
  return false
}

export function logRemoteSkillLoaded(_data: {
  slug: string
  cacheHit: boolean
  latencyMs: number
  urlScheme: 'gs' | 'http' | 'https' | 's3'
  error?: string
  fileCount?: number
  totalBytes?: number
  fetchMethod?: string
}): void {}
