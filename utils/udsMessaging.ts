import { tmpdir } from 'os'
import { join } from 'path'

type StartOptions = {
  isExplicit?: boolean
}

let currentSocketPath: string | undefined
let onEnqueue: (() => void) | undefined

export function getDefaultUdsSocketPath(): string {
  return join(tmpdir(), 'claude-code-reduced-build.sock')
}

export function getUdsMessagingSocketPath(): string | undefined {
  return currentSocketPath
}

export async function startUdsMessaging(
  socketPath: string,
  _options?: StartOptions,
): Promise<void> {
  currentSocketPath = socketPath
}

export function setOnEnqueue(callback: () => void): void {
  onEnqueue = callback
}

export function notifyEnqueue(): void {
  onEnqueue?.()
}
