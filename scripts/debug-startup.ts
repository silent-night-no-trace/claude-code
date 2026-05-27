import { runCommand, type CommandRunner } from './cli-helpers.js'

type LogFn = (...args: unknown[]) => void

export async function runDebugStartup({
  run = runCommand,
  log = console.log,
}: {
  run?: CommandRunner
  log?: LogFn
} = {}): Promise<void> {
  log('Running startup debug surface...')
  await run(['bun', 'run', 'cli:run', '--', '--debug-to-stderr', '--help'])
}

if (import.meta.main) {
  await runDebugStartup()
}
