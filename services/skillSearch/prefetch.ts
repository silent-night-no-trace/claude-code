export function startSkillDiscoveryPrefetch(
  _query: string | null,
  _messages: unknown,
  _toolUseContext: unknown,
): Promise<unknown[]> {
  return Promise.resolve([])
}

export async function collectSkillDiscoveryPrefetch(
  pending: Promise<unknown[]>,
): Promise<unknown[]> {
  return await pending
}
