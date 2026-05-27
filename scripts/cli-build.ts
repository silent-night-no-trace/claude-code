import path from 'path'
import { runCommand, type CommandRunner } from './cli-helpers.ts'

export const reducedCliPath = path.resolve('./dist/local/cli.local.js')
export const fullCliPath = path.resolve('./dist/full/cli.js')

type LogFn = (...args: unknown[]) => void

export async function runCliBuild({
  log = console.log,
  run = runCommand,
}: {
  log?: LogFn
  run?: CommandRunner
} = {}): Promise<void> {
  log('Preparing reduced CLI status artifact...')
  await run(['bun', 'run', 'build:local'])

  log('Preparing full CLI runtime artifact...')
  await run(['bun', 'run', 'build:full-local'])

  log('\nCLI artifacts ready:')
  log(`- ${reducedCliPath}`)
  log(`- ${fullCliPath}`)
}

if (import.meta.main) {
  await runCliBuild()
}
