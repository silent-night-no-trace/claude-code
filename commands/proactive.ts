import type { Command } from '../commands.js'

const proactive: Command = {
  name: 'proactive',
  description:
    'Placeholder command for the unavailable proactive mode in the reduced local build',
  type: 'local',
  supportsNonInteractive: true,
  load: async () => ({
    call: async () => ({
      type: 'text',
      value: 'Proactive mode is not available in the reduced local build.',
    }),
  }),
}

export default proactive
