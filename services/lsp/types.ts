export type LspServerState = 'stopped' | 'starting' | 'running' | 'stopping' | 'error'

export type ScopedLspServerConfig = {
  command: string
  args?: string[]
  env?: Record<string, string>
  workspaceFolder?: string
  extensionToLanguage: Record<string, string>
  maxRestarts?: number
  initializationOptions?: Record<string, unknown>
  restartOnCrash?: boolean
  shutdownTimeout?: number
}
