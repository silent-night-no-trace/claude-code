import type { SetAppState, Task, TaskStateBase } from '../../Task.js'

export type LocalWorkflowTaskState = TaskStateBase & {
  type: 'local_workflow'
}

export const LocalWorkflowTask: Task = {
  name: 'LocalWorkflowTask',
  type: 'local_workflow',
  async kill(_taskId: string, _setAppState: SetAppState): Promise<void> {},
}
