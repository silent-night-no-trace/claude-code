import type { Command } from '../../commands.js'

const remoteControlServer: Command = {
  name: 'remote-control-server',
  description:
    'Placeholder command for the unavailable remote control server feature in the reduced local build',
  type: 'local',
  supportsNonInteractive: true,
  load: async () => ({
    call: async () => ({
      type: 'text',
      value:
        'The remote control server command is not available in the reduced local build.',
    }),
  }),
}

export default remoteControlServer
