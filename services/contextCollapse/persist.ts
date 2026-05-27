type ContextCollapseSnapshot = {
  [key: string]: unknown
}

let currentSnapshot: ContextCollapseSnapshot | undefined

export function restoreFromEntries(
  _entries: unknown[],
  snapshot?: ContextCollapseSnapshot,
): void {
  currentSnapshot = snapshot
}

export function getPersistedSnapshot(): ContextCollapseSnapshot | undefined {
  return currentSnapshot
}
