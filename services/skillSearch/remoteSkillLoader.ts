export async function loadRemoteSkill(_slug: string, url: string): Promise<{
  cacheHit: boolean
  latencyMs: number
  skillPath: string
  content: string
  fileCount: number
  totalBytes: number
  fetchMethod: string
}> {
  return {
    cacheHit: false,
    latencyMs: 0,
    skillPath: url,
    content: '',
    fileCount: 0,
    totalBytes: 0,
    fetchMethod: 'none',
  }
}
