import type { PermissionAskDecision } from '../types/permissions.js'
import type { RemoteMessageContent } from '../utils/teleport/api.js'

export type SSHSessionManager = {
  connect(): void
  disconnect(): void
  sendMessage(content: RemoteMessageContent): Promise<boolean>
  respondToPermissionRequest(
    requestId: string,
    response: PermissionAskDecision | { behavior: 'allow'; updatedInput: unknown },
  ): void
  sendInterrupt(): void
}
