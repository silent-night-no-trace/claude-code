import path from 'path'
import {
  ensureArtifact,
  runCommand,
  type ArtifactEnsurer,
  type CommandRunner,
} from './cli-helpers.js'

export const fullCliPath = path.resolve('./dist/full/cli.js')

type LogFn = (...args: unknown[]) => void

export async function runVerifyPtyStartup({
  ensure = ensureArtifact,
  run = runCommand,
  log = console.log,
}: {
  ensure?: ArtifactEnsurer
  run?: CommandRunner
  log?: LogFn
} = {}): Promise<void> {
  await ensure(
    fullCliPath,
    'Full CLI build artifact is missing; building it first...',
    ['bun', 'run', 'build:full-local'],
  )

  log('Verifying pseudo-TTY startup surface...')
  await run(['script', '-q', '/dev/null', 'bun', fullCliPath, '--help'])
  log('\nverify:pty-startup passed.')
}

if (import.meta.main) {
  await runVerifyPtyStartup()
}
