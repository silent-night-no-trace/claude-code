import type { Command } from '../../commands.js'

const fork: Command = {
  name: 'fork',
  description: 'Placeholder command for the unavailable fork/subagent feature in the reduced local build',
  type: 'local',
  supportsNonInteractive: true,
  load: () => import('./fork.js')
}

export default fork
