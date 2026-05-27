import type { Command } from '../../commands.js'

const buddy: Command = {
  name: 'buddy',
  description: 'Placeholder command for the unavailable Buddy feature in the reduced local build',
  type: 'local',
  supportsNonInteractive: true,
  load: () => import('./buddy.js')
}

export default buddy
