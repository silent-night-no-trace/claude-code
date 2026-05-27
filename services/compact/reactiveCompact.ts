import type { Message } from '../../types/message.js'

type ReactiveCompactFailureReason =
  | 'too_few_groups'
  | 'aborted'
  | 'exhausted'
  | 'error'
  | 'media_unstrippable'

type ReactiveCompactSuccess = {
  ok: true
  result: {
    userDisplayMessage?: string
    [key: string]: unknown
  }
}

type ReactiveCompactFailure = {
  ok: false
  reason: ReactiveCompactFailureReason
}

export function isReactiveOnlyMode(): boolean {
  return false
}

export async function reactiveCompactOnPromptTooLong(
  _messages: Message[],
  _cacheSafeParams: unknown,
  _options: unknown,
): Promise<ReactiveCompactSuccess | ReactiveCompactFailure> {
  return {
    ok: false,
    reason: 'too_few_groups',
  }
}
