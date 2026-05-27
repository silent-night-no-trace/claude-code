export async function daemonMain(_args: string[]): Promise<void> {
  throw new Error('Daemon mode is unavailable in the local reduced build.')
}
