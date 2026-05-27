import path from 'path'
import {
  ensureArtifact,
  runCommand,
  type ArtifactEnsurer,
  type CommandRunner,
} from './cli-helpers.ts'

export const reducedCliPath = path.resolve('./dist/local/cli.local.js')

type LogFn = (...args: unknown[]) => void

export async function runDebugInspector({
  ensure = ensureArtifact,
  run = runCommand,
  log = console.log,
}: {
  ensure?: ArtifactEnsurer
  run?: CommandRunner
  log?: LogFn
} = {}): Promise<void> {
  await ensure(
    reducedCliPath,
    'Reduced CLI artifact is missing; building it first...',
    ['bun', 'run', 'build:local'],
  )

  log('Running reduced-build inspector...')
  await run(['bun', reducedCliPath, 'inspect-build'])
}

if (import.meta.main) {
  await runDebugInspector()
}
