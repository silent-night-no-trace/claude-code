import type { Command } from '../commands.js'

const forceSnip: Command = {
  name: 'force-snip',
  description:
    'Placeholder command for the unavailable snip feature in the reduced local build',
  type: 'local',
  supportsNonInteractive: true,
  load: async () => ({
    call: async () => ({
      type: 'text',
      value: 'Force-snip is not available in the reduced local build.',
    }),
  }),
}

export default forceSnip
