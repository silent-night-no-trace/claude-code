import { runCommand, type CommandRunner } from './cli-helpers.ts'

type LogFn = (...args: unknown[]) => void

export async function runVerifyStartup({
  log = console.log,
  run = runCommand,
}: {
  log?: LogFn
  run?: CommandRunner
} = {}): Promise<void> {
  log('Verifying startup-oriented CLI surface...')

  await run(['bun', 'run', 'cli:build'])
  await run(['bun', 'run', 'cli:run', '--', '--version'])
  await run(['bun', 'run', 'cli:run', '--', '--help'])

  log('\nverify:startup passed.')
}

if (import.meta.main) {
  await runVerifyStartup()
}
