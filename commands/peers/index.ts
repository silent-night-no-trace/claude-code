import type { Command } from '../../commands.js'

const peers: Command = {
  name: 'peers',
  description: 'Placeholder command for the unavailable peers feature in the reduced local build',
  type: 'local',
  supportsNonInteractive: true,
  load: () => import('./peers.js')
}

export default peers
