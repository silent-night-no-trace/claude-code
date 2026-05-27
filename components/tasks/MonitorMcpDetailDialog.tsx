import type * as React from 'react'
import type { DeepImmutable } from 'src/types/utils.js'
import type { MonitorMcpTaskState } from '../../tasks/MonitorMcpTask/MonitorMcpTask.js'

type Props = {
  task: DeepImmutable<MonitorMcpTaskState>
  onKill?: () => void
  onBack?: () => void
}

export function MonitorMcpDetailDialog(_: Props): React.ReactNode {
  return null
}
