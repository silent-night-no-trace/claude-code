let active = false
let paused = false
let contextBlocked = false

const listeners = new Set<() => void>()

function notify(): void {
  for (const listener of listeners) {
    listener()
  }
}

export function activateProactive(_source: string): void {
  active = true
  paused = false
  notify()
}

export function deactivateProactive(): void {
  active = false
  paused = false
  contextBlocked = false
  notify()
}

export function isProactiveActive(): boolean {
  return active
}

export function isProactivePaused(): boolean {
  return paused
}

export function pauseProactive(): void {
  paused = true
  notify()
}

export function resumeProactive(): void {
  paused = false
  notify()
}

export function setContextBlocked(next: boolean): void {
  contextBlocked = next
  if (next) {
    paused = true
  }
  notify()
}

export function getNextTickAt(): number | undefined {
  return contextBlocked ? undefined : Date.now()
}

export function subscribeToProactiveChanges(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
