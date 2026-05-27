export async function postInterClaudeMessage(
  _target: string,
  _message: string,
): Promise<{ ok: boolean; error?: string }> {
  return { ok: false, error: 'Remote Control unavailable in local reduced build.' }
}
