import type { Command } from '../../commands.js'

const assistant: Command = {
  name: 'assistant',
  description:
    'Placeholder command for the unavailable assistant command in the reduced local build',
  type: 'local',
  supportsNonInteractive: true,
  load: async () => ({
    call: async () => ({
      type: 'text',
      value:
        'The assistant command is not available in the reduced local build.',
    }),
  }),
}

export default assistant
