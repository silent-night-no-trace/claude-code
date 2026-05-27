type MessageContentBlock = {
  type: string
  text?: string
  [key: string]: unknown
}

type MessagePayload = {
  role?: string
  content: string | MessageContentBlock[]
  [key: string]: unknown
}

export type MessageOrigin = {
  kind: string
  [key: string]: unknown
}

type BaseMessage = {
  uuid?: string
  parentUuid?: string
  sessionId?: string
  timestamp?: number | string
  type: string
  subtype?: string
  message: MessagePayload
  origin?: MessageOrigin
  isMeta?: boolean
  isVirtual?: boolean
  isCompactSummary?: boolean
  toolUseResult?: unknown
  [key: string]: unknown
}

export type UserMessage = BaseMessage & {
  type: 'user'
  message: MessagePayload & { role?: 'user' | string }
}

export type AssistantMessage = BaseMessage & {
  type: 'assistant'
  message: MessagePayload & { role?: 'assistant' | string }
}

export type SystemMessage = BaseMessage & {
  type: 'system'
}

export type AttachmentMessage = BaseMessage & {
  type: 'attachment'
}

export type ProgressMessage = BaseMessage & {
  type: 'progress'
}

export type HookResultMessage = BaseMessage & {
  type: 'hook_result'
}

export type TombstoneMessage = BaseMessage & {
  type: 'tombstone'
}

export type ToolUseSummaryMessage = BaseMessage & {
  type: 'tool_use_summary'
}

export type GroupedToolUseMessage = BaseMessage & {
  type: 'grouped_tool_use'
}

export type CollapsedReadSearchGroup = BaseMessage & {
  type: 'collapsed_read_search_group'
}

export type RequestStartEvent = BaseMessage & {
  type: 'request_start'
}

export type StreamEvent = BaseMessage & {
  type: 'stream_event'
}

export type SystemAPIErrorMessage = SystemMessage & {
  subtype: 'api_error'
}

export type SystemInformationalMessage = SystemMessage & {
  subtype: 'informational'
}

export type SystemLocalCommandMessage = SystemMessage & {
  subtype: 'local_command'
}

export type SystemStopHookSummaryMessage = SystemMessage & {
  subtype: 'stop_hook_summary'
}

export type SystemBridgeStatusMessage = SystemMessage & {
  subtype: 'bridge_status'
}

export type SystemTurnDurationMessage = SystemMessage & {
  subtype: 'turn_duration'
}

export type SystemThinkingMessage = SystemMessage & {
  subtype: 'thinking'
}

export type SystemMemorySavedMessage = SystemMessage & {
  subtype: 'memory_saved'
}

export type SystemAgentsKilledMessage = SystemMessage & {
  subtype: 'agents_killed'
}

export type SystemApiMetricsMessage = SystemMessage & {
  subtype: 'api_metrics'
}

export type SystemAwaySummaryMessage = SystemMessage & {
  subtype: 'away_summary'
}

export type SystemCompactBoundaryMessage = SystemMessage & {
  subtype: 'compact_boundary'
}

export type SystemMicrocompactBoundaryMessage = SystemMessage & {
  subtype: 'microcompact_boundary'
}

export type SystemFileSnapshotMessage = SystemMessage & {
  subtype: 'file_snapshot'
}

export type SystemPermissionRetryMessage = SystemMessage & {
  subtype: 'permission_retry'
}

export type SystemScheduledTaskFireMessage = SystemMessage & {
  subtype: 'scheduled_task_fire'
}

export type StopHookInfo = {
  [key: string]: unknown
}

export type CompactMetadata = {
  [key: string]: unknown
}

export type SystemMessageLevel = 'info' | 'warning' | 'error'

export type PartialCompactDirection = 'before' | 'after' | 'none'

export type CollapsibleMessage = Message

export type NormalizedMessage = Message
export type NormalizedAssistantMessage = AssistantMessage
export type NormalizedUserMessage = UserMessage
export type RenderableMessage = Message

export type Message =
  | UserMessage
  | AssistantMessage
  | SystemMessage
  | AttachmentMessage
  | ProgressMessage
  | HookResultMessage
  | TombstoneMessage
  | ToolUseSummaryMessage
  | GroupedToolUseMessage
  | CollapsedReadSearchGroup
  | RequestStartEvent
  | StreamEvent
