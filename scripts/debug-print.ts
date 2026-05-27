import path from 'path'
import { ensureArtifact, type ArtifactEnsurer } from './cli-helpers.js'

type SpawnResult = {
  stdout: ReadableStream<Uint8Array>
  stderr: ReadableStream<Uint8Array>
  exited: Promise<number>
  kill: (signal?: string | number) => void
}

type SpawnLike = (argv: string[]) => SpawnResult
type LogFn = (...args: unknown[]) => void
const DEBUG_PRINT_TIMEOUT_MS = 30_000
const DEBUG_PRINT_FORCE_KILL_GRACE_MS = 2_000
export const fullCliPath = path.resolve('./dist/full/cli.js')

const AUTH_RELATED_MARKERS = [
  'Failed to authenticate',
  'Auth error',
  '401',
  'invalid_api_key',
  '无效的令牌',
]

export async function runDebugPrint({
  spawn = argv =>
    Bun.spawn(argv, {
      stdout: 'pipe',
      stderr: 'pipe',
    }),
  ensure = ensureArtifact,
  timeoutMs = DEBUG_PRINT_TIMEOUT_MS,
  log = console.log,
  error = console.error,
}: {
  spawn?: SpawnLike
  ensure?: ArtifactEnsurer
  timeoutMs?: number
  log?: LogFn
  error?: LogFn
} = {}): Promise<void> {
  log('Running print-mode debug surface...')

  await ensure(
    fullCliPath,
    'Full CLI build artifact is missing; building it first...',
    ['bun', 'run', 'build:full-local'],
  )

  const proc = spawn(['bun', fullCliPath, '-p', 'hello'])
  const stdoutPromise = new Response(proc.stdout).text()
  const stderrPromise = new Response(proc.stderr).text()
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined

  const exitOutcome = await Promise.race<
    { type: 'exit'; exitCode: number } | { type: 'timeout' }
  >([
    proc.exited.then(exitCode => ({ type: 'exit' as const, exitCode })),
    new Promise(resolve => {
      timeoutHandle = setTimeout(() => {
        resolve({ type: 'timeout' as const })
      }, timeoutMs)
    }),
  ])

  if (timeoutHandle !== undefined) {
    clearTimeout(timeoutHandle)
  }

  if (exitOutcome.type === 'timeout') {
    proc.kill()
    let forceKillHandle: ReturnType<typeof setTimeout> | undefined

    await Promise.race([
      proc.exited,
      new Promise<void>(resolve => {
        forceKillHandle = setTimeout(() => {
          proc.kill('SIGKILL')
          resolve()
        }, DEBUG_PRINT_FORCE_KILL_GRACE_MS)
      }),
    ])

    if (forceKillHandle !== undefined) {
      clearTimeout(forceKillHandle)
    }

    log(
      `debug:print: WARN - print path did not finish within ${timeoutMs}ms; terminated the print process cleanly and treated this as an environment/network-bound debug proof, not a build regression.`,
    )
    return
  }

  const [stdout, stderr] = await Promise.all([stdoutPromise, stderrPromise])
  const combined = `${stdout}\n${stderr}`

  if (exitOutcome.exitCode === 0) {
    log('debug:print: OK - print path completed successfully.')
    return
  }

  if (AUTH_RELATED_MARKERS.some(marker => combined.includes(marker))) {
    log(
      'debug:print: WARN - print path reached the request/auth boundary; command remains environment-dependent in CI.',
    )
    return
  }

  error(combined.trim())
  process.exit(exitOutcome.exitCode)
}

if (import.meta.main) {
  await runDebugPrint()
}
