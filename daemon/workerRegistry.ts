export async function runDaemonWorker(_kind?: string): Promise<void> {
  throw new Error(
    'Daemon workers are unavailable in the local reduced build.',
  )
}
