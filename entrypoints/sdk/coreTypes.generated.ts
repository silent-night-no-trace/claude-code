type SDKContentBlock = {
  type: string
  text?: string
  [key: string]: unknown
}

type SDKMessageBase = {
  type: string
  subtype?: string
  uuid?: string
  session_id?: string
  request_id?: string
  message?: {
    role?: string
    content?: string | SDKContentBlock[]
    [key: string]: unknown
  }
  [key: string]: unknown
}

export type SDKMessage = SDKMessageBase
export type SDKUserMessage = SDKMessageBase & { type: 'user' }
export type SDKAssistantMessage = SDKMessageBase & { type: 'assistant' }
export type SDKSystemMessage = SDKMessageBase & { type: 'system' }
export type SDKStatusMessage = SDKMessageBase & { type: 'status' }
export type SDKToolProgressMessage = SDKMessageBase & { type: 'progress' }
export type SDKResultMessage = SDKMessageBase & { type: 'result' }
export type SDKCompactBoundaryMessage = SDKMessageBase & {
  type: 'compact_boundary'
}
export type SDKPartialAssistantMessage = SDKMessageBase & {
  type: 'assistant_partial'
}
export type SDKAssistantMessageError = SDKMessageBase & {
  type: 'assistant_error'
}
export type SDKUserMessageReplay = SDKMessageBase & {
  type: 'user_replay'
}

export type SDKRateLimitInfo = Record<string, unknown>
export type SDKPermissionDenial = Record<string, unknown>
export type SDKResultSuccess = Record<string, unknown>
export type SDKSessionInfo = Record<string, unknown>
export type PermissionMode = string
export type PermissionResult = Record<string, unknown>
export type PermissionUpdate = Record<string, unknown>
export type ExitReason = string
export type HookEvent = string
export type HookInput = Record<string, unknown>
export type HookJSONOutput = Record<string, unknown>
export type SyncHookJSONOutput = Record<string, unknown>
export type AsyncHookJSONOutput = Record<string, unknown>
export type ModelInfo = Record<string, unknown>
export type ModelUsage = Record<string, unknown>
export type RewindFilesResult = Record<string, unknown>
export type McpServerConfigForProcessTransport = Record<string, unknown>
export type McpServerStatus = Record<string, unknown>
export type ApiKeySource = string
export type PreToolUseHookInput = HookInput
export type PostToolUseHookInput = HookInput
export type PostToolUseFailureHookInput = HookInput
export type NotificationHookInput = HookInput
export type UserPromptSubmitHookInput = HookInput
export type SessionStartHookInput = HookInput
export type SessionEndHookInput = HookInput
export type StopHookInput = HookInput
export type StopFailureHookInput = HookInput
export type SubagentStartHookInput = HookInput
export type SubagentStopHookInput = HookInput
export type PreCompactHookInput = HookInput
export type PostCompactHookInput = HookInput
export type PermissionRequestHookInput = HookInput
export type PermissionDeniedHookInput = HookInput
export type SetupHookInput = HookInput
export type TeammateIdleHookInput = HookInput
export type TaskCreatedHookInput = HookInput
export type TaskCompletedHookInput = HookInput
export type ElicitationHookInput = HookInput
export type ElicitationResultHookInput = HookInput
export type ConfigChangeHookInput = HookInput
export type CwdChangedHookInput = HookInput
export type FileChangedHookInput = HookInput
export type InstructionsLoadedHookInput = HookInput
export type SDKStatus = string
