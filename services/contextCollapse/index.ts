import type { ToolUseContext } from '../../Tool.js'
import type { Message } from '../../types/message.js'

type QuerySource = string

type CollapseResult = {
  messages: Message[]
}

type CollapseStats = {
  committed: number
  pending: number
  enabled: boolean
}

const defaultStats: CollapseStats = {
  committed: 0,
  pending: 0,
  enabled: false,
}

export async function applyCollapsesIfNeeded(
  messages: Message[],
  _toolUseContext: ToolUseContext,
  _querySource?: QuerySource,
): Promise<CollapseResult> {
  return { messages }
}

export function isContextCollapseEnabled(): boolean {
  return false
}

export function isWithheldPromptTooLong(
  _message: Message,
  _isPromptTooLongMessage: (message: Message) => boolean,
  _querySource?: QuerySource,
): boolean {
  return false
}

export function recoverFromOverflow(
  messages: Message[],
  _querySource?: QuerySource,
): { committed: number; messages: Message[] } {
  return { committed: 0, messages }
}

export function resetContextCollapse(): void {}

export function getStats(): CollapseStats {
  return defaultStats
}
