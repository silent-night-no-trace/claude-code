export async function selfHostedRunnerMain(_args: string[]): Promise<void> {
  throw new Error(
    'Self-hosted runner is unavailable in the local reduced build.',
  )
}
