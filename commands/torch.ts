import type { Command } from '../commands.js'

const torch: Command = {
  name: 'torch',
  description:
    'Placeholder command for the unavailable torch feature in the reduced local build',
  type: 'local',
  supportsNonInteractive: true,
  load: async () => ({
    call: async () => ({
      type: 'text',
      value: 'The torch command is not available in the reduced local build.',
    }),
  }),
}

export default torch
