import { runCommand, type CommandRunner } from './cli-helpers.ts'

type LogFn = (...args: unknown[]) => void

export function getRequestReadinessMessage(hasApiKey: boolean): string {
  return hasApiKey
    ? '- request readiness: OK - ANTHROPIC_API_KEY detected for follow-up print-mode checks'
    : '- request readiness: WARN - smoke check passed, but authenticated requests still depend on environment'
}

export async function runCliCheck({
  env = process.env,
  log = console.log,
  run = runCommand,
}: {
  env?: NodeJS.ProcessEnv
  log?: LogFn
  run?: CommandRunner
} = {}): Promise<void> {
  const hasApiKey = Boolean(env.ANTHROPIC_API_KEY?.trim())

  log('Checking product-style CLI surface...')

  await run(['bun', 'run', 'cli:build'])
  await run(['bun', 'run', 'cli:status'])
  await run(['bun', 'run', 'cli:run', '--', '--version'])
  await run(['bun', 'run', 'cli:run', '--', '--help'])

  log('\nVerdict')
  log('- overall: OK - build, status, version, and help all passed')
  log(getRequestReadinessMessage(hasApiKey))

  log('\nCLI surface check passed.')
}

if (import.meta.main) {
  await runCliCheck()
}
