export function parseCcshareId(input: string): string | null {
  const match = input.match(/\/ccshare\/([^/?#]+)/)
  return match?.[1] ?? null
}

export async function loadCcshare(ccshareId: string): Promise<string> {
  return ccshareId
}
