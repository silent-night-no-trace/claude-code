import type { LocalCommandModule } from '../../types/command.js'

export const call: LocalCommandModule['call'] = async () => ({
  type: 'text',
  value:
    'The Buddy feature is not available in this reduced local build because the public source snapshot is missing its upstream implementation.'
})
