import type * as React from 'react'
import type { CommandResultDisplay } from '../../commands.js'

type Props = {
  workflow: unknown
  onDone: (result?: string, options?: { display?: CommandResultDisplay }) => void
  onKill?: (...args: unknown[]) => void
  onSkipAgent?: (...args: unknown[]) => void
  onRetryAgent?: (...args: unknown[]) => void
  onBack?: () => void
}

export function WorkflowDetailDialog(_: Props): React.ReactNode {
  return null
}
