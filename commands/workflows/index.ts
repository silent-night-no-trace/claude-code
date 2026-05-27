import type { Command } from '../../commands.js'

const workflows: Command = {
  name: 'workflows',
  description:
    'Placeholder command for the unavailable workflows feature in the reduced local build',
  type: 'local',
  supportsNonInteractive: true,
  load: async () => ({
    call: async () => ({
      type: 'text',
      value: 'Workflow commands are not available in the reduced local build.',
    }),
  }),
}

export default workflows
