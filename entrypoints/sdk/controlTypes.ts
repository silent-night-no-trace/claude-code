import type { z } from 'zod/v4'
import type {
  SDKControlCancelRequestSchema,
  SDKControlInitializeRequestSchema,
  SDKControlRequestInnerSchema,
  SDKControlRequestSchema,
  SDKControlResponseSchema,
  SDKControlPermissionRequestSchema,
  StdinMessageSchema,
  StdoutMessageSchema,
} from './controlSchemas.js'
import type { SDKPartialAssistantMessageSchema } from './coreSchemas.js'

export type SDKControlCancelRequest = z.infer<typeof SDKControlCancelRequestSchema>
export type SDKControlInitializeRequest = z.infer<
  typeof SDKControlInitializeRequestSchema
>
export type SDKControlPermissionRequest = z.infer<
  typeof SDKControlPermissionRequestSchema
>
export type SDKControlRequestInner = z.infer<typeof SDKControlRequestInnerSchema>
export type SDKControlRequest = z.infer<typeof SDKControlRequestSchema>
export type SDKControlResponse = z.infer<typeof SDKControlResponseSchema>
export type SDKPartialAssistantMessage = z.infer<
  typeof SDKPartialAssistantMessageSchema
>
export type StdinMessage = z.infer<typeof StdinMessageSchema>
export type StdoutMessage = z.infer<typeof StdoutMessageSchema>

export type SDKControlInitializeResponse = SDKControlResponse

export type SDKControlMcpSetServersResponse = SDKControlResponse
export type SDKControlReloadPluginsResponse = SDKControlResponse
