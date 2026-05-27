import { existsSync } from 'fs'
import path from 'path'
import {
  ensureArtifact,
  runCommand,
  type ArtifactEnsurer,
  type CommandRunner,
} from './cli-helpers.ts'

export const reducedCliPath = path.resolve('./dist/local/cli.local.js')
export const fullCliPath = path.resolve('./dist/full/cli.js')

export type StatusLevel = 'OK' | 'WARN' | 'INFO'

export type StatusEntry = {
  level: StatusLevel
  value: string
}

type LogFn = (...args: unknown[]) => void

type CliStatusDependencies = {
  ensure?: ArtifactEnsurer
  run?: CommandRunner
  fileExists?: (filePath: string) => boolean
  env?: NodeJS.ProcessEnv
  log?: LogFn
  reducedArtifactPath?: string
  fullArtifactPath?: string
}

function printStatusLine(
  log: LogFn,
  label: string,
  entry: StatusEntry,
): void {
  log(`- ${label}: ${entry.level} - ${entry.value}`)
}

export function getOverallStatus(
  hasFullCliArtifact: boolean,
  hasApiKey: boolean,
): StatusEntry {
  if (hasFullCliArtifact && hasApiKey) {
    return {
      level: 'OK',
      value: 'ready for local CLI usage and authenticated requests',
    }
  }

  if (hasFullCliArtifact) {
    return {
      level: 'WARN',
      value: 'ready for local CLI usage; requests still depend on auth',
    }
  }

  if (hasApiKey) {
    return {
      level: 'INFO',
      value: 'diagnostics ready; full CLI will build on first run',
    }
  }

  return {
    level: 'INFO',
    value:
      'diagnostics ready; full CLI builds on demand and requests still depend on auth',
  }
}

export function getFullCliStatus(hasFullCliArtifact: boolean): StatusEntry {
  return hasFullCliArtifact
    ? {
        level: 'OK',
        value: 'ready',
      }
    : {
        level: 'INFO',
        value: 'not built yet (run `npm run cli:build` or `npm run cli:run`)',
      }
}

export function getRequestPathStatus(hasApiKey: boolean): StatusEntry {
  return hasApiKey
    ? {
        level: 'OK',
        value: 'ANTHROPIC_API_KEY detected',
      }
    : {
        level: 'WARN',
        value: 'environment-dependent (use API key or existing login state)',
      }
}

export function getQuickCheckStatus(): StatusEntry {
  return {
    level: 'INFO',
    value: 'run `npm run cli:check` for a full smoke test',
  }
}

export async function runCliStatus({
  ensure = ensureArtifact,
  run = runCommand,
  fileExists = existsSync,
  env = process.env,
  log = console.log,
  reducedArtifactPath = reducedCliPath,
  fullArtifactPath = fullCliPath,
}: CliStatusDependencies = {}): Promise<void> {
  await ensure(
    reducedArtifactPath,
    'CLI status artifact is missing; building it first...',
    ['bun', 'run', 'build:local'],
  )

  const hasFullCliArtifact = fileExists(fullArtifactPath)
  const hasApiKey = Boolean(env.ANTHROPIC_API_KEY?.trim())

  const overallStatus = getOverallStatus(hasFullCliArtifact, hasApiKey)

  const reducedDiagnosticsStatus: StatusEntry = {
    level: 'OK',
    value: 'ready',
  }

  const fullCliStatus = getFullCliStatus(hasFullCliArtifact)
  const requestPathStatus = getRequestPathStatus(hasApiKey)
  const quickCheckStatus = getQuickCheckStatus()

  log('Claude Code local CLI status\n')
  log('Overall')
  printStatusLine(log, 'overall', overallStatus)

  log('Summary')
  printStatusLine(log, 'reduced diagnostics', reducedDiagnosticsStatus)
  printStatusLine(log, 'full interactive CLI', fullCliStatus)
  printStatusLine(log, 'request path', requestPathStatus)
  printStatusLine(log, 'quick check', quickCheckStatus)

  log('\nDetailed diagnostics\n')

  await run(['bun', reducedArtifactPath, 'doctor'])
}

if (import.meta.main) {
  await runCliStatus()
}
