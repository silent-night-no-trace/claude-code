import type { LocalCommandModule } from '../../types/command.js'

export const call: LocalCommandModule['call'] = async () => ({
  type: 'text',
  value:
    'The fork/subagent command is unavailable in this reduced local build because the required upstream modules are absent from this source snapshot.'
})
