import type { SSHSessionManager } from './SSHSessionManager.js'

export class SSHSessionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SSHSessionError'
  }
}

export type SSHSession = {
  remoteCwd: string
  getStderrTail(): string
  proc: {
    exitCode?: number
    signalCode?: number | string | null
  }
  proxy: {
    stop(): void
  }
  createManager(_args: {
    onMessage: (sdkMessage: unknown) => void
    onPermissionRequest: (request: unknown, requestId: string) => void
    onConnected: () => void
    onReconnecting: (attempt: number, max: number) => void
    onDisconnected: () => void
    onError: (error: Error) => void
  }): SSHSessionManager
}

type CreateLocalSSHSessionOptions = {
  cwd?: string
  permissionMode?: string
  dangerouslySkipPermissions?: boolean
}

type CreateSSHSessionOptions = {
  host: string
  cwd?: string
  localVersion?: string
  permissionMode?: string
  dangerouslySkipPermissions?: boolean
  extraCliArgs?: string[]
}

type CreateSSHSessionProgress = {
  onProgress?: (message: string) => void
}

function unavailable(): never {
  throw new SSHSessionError(
    'SSH sessions are unavailable in the local reduced build.',
  )
}

export function createLocalSSHSession(
  _options: CreateLocalSSHSessionOptions,
): SSHSession {
  unavailable()
}

export async function createSSHSession(
  _options: CreateSSHSessionOptions,
  _progress?: CreateSSHSessionProgress,
): Promise<SSHSession> {
  unavailable()
}
