import type { Command } from '../../commands.js'

const agentsPlatform: Command = {
  name: 'agents-platform',
  description:
    'Placeholder command for the unavailable agents platform feature in the reduced local build',
  type: 'local',
  supportsNonInteractive: true,
  load: async () => ({
    call: async () => ({
      type: 'text',
      value:
        'The agents platform command is not available in the reduced local build.',
    }),
  }),
}

export default agentsPlatform
