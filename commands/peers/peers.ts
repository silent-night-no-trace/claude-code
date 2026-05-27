import type { LocalCommandModule } from '../../types/command.js'

export const call: LocalCommandModule['call'] = async () => ({
  type: 'text',
  value:
    'The peers command is unavailable in this reduced local build because the inbox/peer runtime has not been restored from the upstream source tree.'
})
