export type AssistantSession = {
  id: string
  name?: string
}

export async function discoverAssistantSessions(): Promise<AssistantSession[]> {
  return []
}
