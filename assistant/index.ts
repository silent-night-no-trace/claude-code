import type { Command } from '../commands.js'

const assistantCommand: Command = {
  name: 'assistant',
  description:
    'Placeholder command for the unavailable assistant feature in the reduced local build',
  type: 'local',
  supportsNonInteractive: true,
  load: async () => ({
    call: async () => ({
      type: 'text',
      value:
        'Assistant mode is not available in the reduced local build.',
    }),
  }),
}

export function isAssistantMode(): boolean {
  return false
}

export function isAssistantForced(): boolean {
  return false
}

export function markAssistantForced(): void {}

export function getAssistantActivationPath(): 'unavailable' {
  return 'unavailable'
}

export function getAssistantSystemPromptAddendum(): string {
  return ''
}

export async function initializeAssistantTeam(): Promise<void> {}

export default assistantCommand
