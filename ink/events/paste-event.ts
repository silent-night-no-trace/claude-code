import type { TerminalEvent } from './terminal-event.js'

export type PasteEvent = TerminalEvent & {
  text: string
  clipboardData?: {
    getData(type: string): string
  } | null
}
