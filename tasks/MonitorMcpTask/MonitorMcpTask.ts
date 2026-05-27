export type MonitorMcpTaskState = {
  id: string
  type: 'monitor_mcp'
  status: string
  label?: string
  startTime: number
  endTime?: number
}

export function killMonitorMcp(
  _taskId: string,
  _setAppState: unknown,
): void {}
