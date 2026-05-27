import path from 'path'
import {
  ensureArtifact,
  runCommand,
  type ArtifactEnsurer,
  type CommandRunner,
} from './cli-helpers.ts'

export const fullCliPath = path.resolve('./dist/full/cli.js')

export async function runCli({
  args = process.argv.slice(2),
  ensure = ensureArtifact,
  run = runCommand,
}: {
  args?: string[]
  ensure?: ArtifactEnsurer
  run?: CommandRunner
} = {}): Promise<void> {
  await ensure(
    fullCliPath,
    'Full CLI build artifact is missing; building it first...',
    ['bun', 'run', 'build:full-local'],
  )

  await run(['bun', fullCliPath, ...args])
}

if (import.meta.main) {
  await runCli()
}
