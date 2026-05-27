import type { Command } from '../../commands.js'

const workflowCommand: Command = {
  name: 'workflow',
  description:
    'Placeholder command for the unavailable workflow feature in the reduced local build',
  type: 'local',
  supportsNonInteractive: true,
  load: async () => ({
    call: async () => ({
      type: 'text',
      value: 'Workflow scripts are not available in the reduced local build.',
    }),
  }),
}

export async function getWorkflowCommands(): Promise<Command[]> {
  return [workflowCommand]
}
