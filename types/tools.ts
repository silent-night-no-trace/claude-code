export type ToolProgressData = Record<string, unknown>

type BaseToolProgress<TData extends ToolProgressData = ToolProgressData> = {
  toolUseID?: string
  data?: TData
}

export type SkillToolProgress = BaseToolProgress<{
  message?: unknown
  type?: string
  prompt?: string
  agentId?: string
}>

export type WebSearchProgress = BaseToolProgress<{
  query?: string
  resultsCount?: number
}>

export type MCPProgress = BaseToolProgress<{
  step?: string
  detail?: string
}>

export type REPLToolProgress = BaseToolProgress<{
  frame?: string
}>

export type TaskOutputProgress = BaseToolProgress<{
  outputPreview?: string
}>

export type AgentToolProgress = BaseToolProgress<{
  progress?: number
  taskId?: string
  summary?: string
}>

export type BashProgress = BaseToolProgress<{
  command?: string
  exitCode?: number
}>

export type SdkWorkflowProgress = {
  stage?: string
  progress?: number
  details?: string
} & ToolProgressData

export type ShellProgress = {
  output: string
  fullOutput: string
  elapsedTimeSeconds?: number
  totalLines?: number
  totalBytes?: number
  timeoutMs?: number
  taskId?: string
}
