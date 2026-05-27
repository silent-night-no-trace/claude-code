import type { Command } from '../commands.js'

const subscribePr: Command = {
  name: 'subscribe-pr',
  description:
    'Placeholder command for the unavailable GitHub webhook subscription feature in the reduced local build',
  type: 'local',
  supportsNonInteractive: true,
  load: async () => ({
    call: async () => ({
      type: 'text',
      value:
        'The subscribe-pr command is not available in the reduced local build.',
    }),
  }),
}

export default subscribePr
