export type QueueOperation =
  | 'enqueue'
  | 'dequeue'
  | 'remove'
  | 'edit'
  | 'clear'

export type QueueOperationMessage = {
  type: 'queue-operation'
  operation: QueueOperation
  timestamp: string
  sessionId?: string
  content?: string
}
