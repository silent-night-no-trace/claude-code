import type { Message } from '../../types/message.js'

type FrustrationState = 'closed' | 'open'

export function useFrustrationDetection(
  _messages: Message[],
  _isLoading: boolean,
  _hasActivePrompt: boolean,
  _surveyVisible: boolean,
): {
  state: FrustrationState
  handleTranscriptSelect: () => void
} {
  return {
    state: 'closed',
    handleTranscriptSelect: () => {},
  }
}
