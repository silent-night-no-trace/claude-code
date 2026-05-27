import type { Message } from '../../types/message.js'

type ContextProjection = {
  messages: Message[]
  archivedMessages: Message[]
  committed: number
}

export function projectView(messages: Message[]): ContextProjection {
  return {
    messages,
    archivedMessages: [],
    committed: 0,
  }
}
