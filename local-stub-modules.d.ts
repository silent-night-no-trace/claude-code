declare module 'claude-code-local-claude-for-chrome-mcp' {
  export const BROWSER_TOOLS: string[]
  export function createClaudeForChromeMcpServer(...args: unknown[]): unknown
  export type ClaudeForChromeContext = Record<string, unknown>
  export type Logger = Record<string, unknown>
  export type PermissionMode = 'ask' | 'skip_all_permission_checks' | 'follow_a_plan'
}

declare module 'claude-code-local-computer-use-input' {
  export type ComputerUseInputAPI = Record<string, unknown>
  export type ComputerUseInput = {
    isSupported: boolean
  }
  const input: ComputerUseInput
  export default input
  export const isSupported: boolean
}

declare module 'claude-code-local-computer-use-swift' {
  export type ComputerUseAPI = Record<string, unknown>
  const api: ComputerUseAPI
  export default api
}

declare module 'claude-code-local-computer-use-mcp' {
  export type ComputerExecutor = Record<string, unknown>
  export type DisplayGeometry = Record<string, unknown>
  export type FrontmostApp = Record<string, unknown>
  export type InstalledApp = Record<string, unknown>
  export type ResolvePrepareCaptureResult = Record<string, unknown>
  export type RunningApp = Record<string, unknown>
  export type ScreenshotResult = Record<string, unknown>
  export type ComputerUseSessionContext = Record<string, unknown>
  export type CuCallToolResult = Record<string, unknown>
  export type CuPermissionRequest = Record<string, unknown>
  export type CuPermissionResponse = Record<string, unknown>
  export type ScreenshotDims = Record<string, unknown>
  export const API_RESIZE_PARAMS: Record<string, unknown>
  export const DEFAULT_GRANT_FLAGS: Record<string, unknown>
  export function targetImageSize(width: number, height: number, params?: unknown): [number, number]
  export function bindSessionContext<T>(value: T): T
  export function buildComputerUseTools(...args: unknown[]): unknown[]
}

declare module 'claude-code-local-computer-use-mcp/types' {
  export type CoordinateMode = string
  export type CuSubGates = Record<string, unknown>
  export type CuPermissionRequest = Record<string, unknown>
  export type CuPermissionResponse = Record<string, unknown>
  export const DEFAULT_GRANT_FLAGS: Record<string, unknown>
}

declare module 'claude-code-local-computer-use-mcp/sentinelApps' {
  export function getSentinelCategory(...args: unknown[]): unknown
}
