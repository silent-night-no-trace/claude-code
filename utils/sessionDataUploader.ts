type SessionMessage = {
  type?: string
}

export function createSessionTurnUploader(): (messages: SessionMessage[]) => void {
  return (_messages: SessionMessage[]) => {}
}
