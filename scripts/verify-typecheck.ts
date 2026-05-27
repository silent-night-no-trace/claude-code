import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'

export const TYPECHECK_BASELINE_PATH = path.resolve(
  './artifacts/typecheck-baseline.txt',
)

const TYPECHECK_COMMAND = [
  'bun',
  'x',
  'tsc',
  '--noEmit',
  '--pretty',
  'false',
  '-p',
  'tsconfig.json',
] as const

const BASELINE_HEADER = [
  '# TypeScript no-regression baseline',
  '# Format: <count>\t<normalized diagnostic key>',
  '# Key: <file> :: <TS code> :: <message> (line/column stripped)',
] as const

type SpawnLike = (argv: string[]) => {
  stdout: ReadableStream<Uint8Array>
  stderr: ReadableStream<Uint8Array>
  exited: Promise<number>
}

type LogFn = (...args: unknown[]) => void

export type TypecheckRunResult = {
  exitCode: number
  stdout: string
  stderr: string
  lines: string[]
}

export type TypecheckBaseline = {
  counts: Map<string, number>
  total: number
}

export type TypecheckRegression = {
  key: string
  baselineCount: number
  currentCount: number
}

export function normalizeDiagnosticLine(line: string): string | null {
  const trimmed = line.trim()
  if (trimmed === '') {
    return null
  }

  const match = trimmed.match(/^(.*)\(\d+,\d+\): error (TS\d+): (.*)$/)
  if (match) {
    const [, filePath, code, message] = match
    return `${filePath} :: ${code} :: ${message}`
  }

  return `__raw__ :: ${trimmed}`
}

export function buildBaselineFromLines(lines: string[]): TypecheckBaseline {
  const counts = new Map<string, number>()

  for (const line of lines) {
    const normalized = normalizeDiagnosticLine(line)
    if (!normalized) continue
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1)
  }

  const total = [...counts.values()].reduce((sum, value) => sum + value, 0)
  return { counts, total }
}

export function serializeBaseline(baseline: TypecheckBaseline): string {
  const entries = [...baseline.counts.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  )

  return [...BASELINE_HEADER, ...entries.map(([key, count]) => `${count}\t${key}`), ''].join(
    '\n',
  )
}

export function parseBaseline(content: string): TypecheckBaseline {
  const counts = new Map<string, number>()

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trimEnd()
    if (line === '' || line.startsWith('#')) {
      continue
    }

    const tabIndex = line.indexOf('\t')
    if (tabIndex === -1) {
      throw new Error(`Invalid baseline line: ${line}`)
    }

    const count = Number.parseInt(line.slice(0, tabIndex), 10)
    const key = line.slice(tabIndex + 1)

    if (!Number.isFinite(count) || count < 0 || key === '') {
      throw new Error(`Invalid baseline entry: ${line}`)
    }

    counts.set(key, count)
  }

  const total = [...counts.values()].reduce((sum, value) => sum + value, 0)
  return { counts, total }
}

export function diffAgainstBaseline(
  baseline: TypecheckBaseline,
  current: TypecheckBaseline,
): TypecheckRegression[] {
  const regressions: TypecheckRegression[] = []

  for (const [key, currentCount] of current.counts.entries()) {
    const baselineCount = baseline.counts.get(key) ?? 0
    if (currentCount > baselineCount) {
      regressions.push({ key, baselineCount, currentCount })
    }
  }

  regressions.sort((left, right) => left.key.localeCompare(right.key))
  return regressions
}

export async function runRawTypecheck({
  spawn = argv =>
    Bun.spawn(argv, {
      stdout: 'pipe',
      stderr: 'pipe',
    }),
}: {
  spawn?: SpawnLike
} = {}): Promise<TypecheckRunResult> {
  const proc = spawn([...TYPECHECK_COMMAND])
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])

  const combinedOutput = `${stdout}${stderr}`.trim()
  const lines = combinedOutput === '' ? [] : combinedOutput.split('\n')

  return {
    exitCode,
    stdout,
    stderr,
    lines,
  }
}

export async function writeTypecheckBaseline({
  baselinePath = TYPECHECK_BASELINE_PATH,
  log = console.log,
  run = runRawTypecheck,
}: {
  baselinePath?: string
  log?: LogFn
  run?: typeof runRawTypecheck
} = {}): Promise<void> {
  log('Generating TypeScript no-regression baseline...')
  const result = await run()
  const baseline = buildBaselineFromLines(result.lines)

  await mkdir(path.dirname(baselinePath), { recursive: true })
  await writeFile(baselinePath, serializeBaseline(baseline), 'utf8')

  log(
    `Wrote ${baseline.total} normalized diagnostic occurrence(s) to ${baselinePath}`,
  )
}

export async function verifyTypecheck({
  argv = process.argv.slice(2),
  baselinePath = TYPECHECK_BASELINE_PATH,
  log = console.log,
  error = console.error,
  run = runRawTypecheck,
  readBaseline = async (filePath: string) => readFile(filePath, 'utf8'),
}: {
  argv?: string[]
  baselinePath?: string
  log?: LogFn
  error?: LogFn
  run?: typeof runRawTypecheck
  readBaseline?: (filePath: string) => Promise<string>
} = {}): Promise<void> {
  if (argv.includes('--write-baseline')) {
    await writeTypecheckBaseline({ baselinePath, log, run })
    return
  }

  log('Running TypeScript no-regression check...')

  let baselineContent: string
  try {
    baselineContent = await readBaseline(baselinePath)
  } catch {
    error(
      `verify:typecheck: missing baseline artifact at ${baselinePath}. Run \`bun run scripts/verify-typecheck.ts --write-baseline\` to create it.`,
    )
    process.exit(1)
  }

  const baseline = parseBaseline(baselineContent)
  const result = await run()
  const current = buildBaselineFromLines(result.lines)
  const regressions = diffAgainstBaseline(baseline, current)

  if (result.exitCode === 0) {
    log('\nverify:typecheck: OK - full typecheck passed cleanly.')
    if (baseline.total > 0) {
      log(
        `Current snapshot improved from ${baseline.total} baseline occurrence(s) to 0.`,
      )
    }
    return
  }

  if (regressions.length === 0) {
    const delta = current.total - baseline.total
    log('\nverify:typecheck: OK - no new normalized diagnostics compared with baseline.')
    log(
      `Baseline occurrences: ${baseline.total}; current occurrences: ${current.total}; delta: ${delta}.`,
    )
    log(
      'Type errors still exist in the snapshot, but this gate now blocks only regressions beyond the committed baseline.',
    )
    return
  }

  error('\nverify:typecheck: FAIL - new normalized TypeScript diagnostics exceed the committed baseline.')
  error(
    `Baseline occurrences: ${baseline.total}; current occurrences: ${current.total}; regressions: ${regressions.length}.`,
  )

  const preview = regressions.slice(0, 12)
  for (const regression of preview) {
    error(
      `- +${regression.currentCount - regression.baselineCount} :: ${regression.key}`,
    )
  }

  if (regressions.length > preview.length) {
    error(`... ${regressions.length - preview.length} more regression(s) omitted.`)
  }

  process.exit(1)
}

if (import.meta.main) {
  await verifyTypecheck()
}
