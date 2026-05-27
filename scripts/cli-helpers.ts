import { existsSync } from 'fs'

export type CommandRunner = (argv: string[]) => Promise<void>
export type ArtifactEnsurer = (
  artifactPath: string,
  missingMessage: string,
  buildCommand: string[],
) => Promise<void>

export async function getCommandExitCode(argv: string[]): Promise<number> {
  const proc = Bun.spawn(argv, {
    stdin: 'inherit',
    stdout: 'inherit',
    stderr: 'inherit',
  })

  return await proc.exited
}

export async function runCommand(argv: string[]): Promise<void> {
  const exitCode = await getCommandExitCode(argv)
  if (exitCode !== 0) {
    process.exit(exitCode)
  }
}

export async function ensureArtifact(
  artifactPath: string,
  missingMessage: string,
  buildCommand: string[],
): Promise<void> {
  if (!existsSync(artifactPath)) {
    console.log(missingMessage)
    await runCommand(buildCommand)
  }
}
