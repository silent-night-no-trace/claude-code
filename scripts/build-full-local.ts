import { cp, mkdir } from 'fs/promises'
import path from 'path'
import { LOCAL_BUILD_DEFINE, LOCAL_BUILD_EXTERNAL } from './build-config.ts'

export const FULL_BUILD_OUTDIR = './dist/full'
export const RIPGREP_VENDOR_SOURCE = path.resolve(
  './node_modules/@anthropic-ai/claude-agent-sdk/vendor/ripgrep',
)
export const RIPGREP_VENDOR_TARGET = path.resolve(FULL_BUILD_OUTDIR, 'vendor/ripgrep')

type BuildRunner = (options: Bun.BuildConfig) => Promise<Bun.BuildOutput>
type LogFn = (...args: unknown[]) => void

export function getBuildFullLocalOptions(debug: boolean): Bun.BuildConfig {
  return {
    entrypoints: ['./entrypoints/cli.tsx'],
    outdir: FULL_BUILD_OUTDIR,
    target: 'bun',
    format: 'esm',
    sourcemap: debug ? 'external' : 'none',
    minify: false,
    external: [...LOCAL_BUILD_EXTERNAL],
    define: LOCAL_BUILD_DEFINE,
  }
}

export async function runBuildFullLocal({
  argv = process.argv,
  build = Bun.build,
  copy = cp,
  makeDir = mkdir,
  error = console.error,
  log = console.log,
}: {
  argv?: string[]
  build?: BuildRunner
  copy?: typeof cp
  makeDir?: typeof mkdir
  error?: LogFn
  log?: LogFn
} = {}): Promise<void> {
  const debug = argv.includes('--debug')
  const result = await build(getBuildFullLocalOptions(debug))

  if (!result.success) {
    for (const message of result.logs) {
      error(message)
    }
    process.exit(1)
  }

  await makeDir(path.dirname(RIPGREP_VENDOR_TARGET), { recursive: true })
  await copy(RIPGREP_VENDOR_SOURCE, RIPGREP_VENDOR_TARGET, { recursive: true })

  log(`Built ${result.outputs.length} file(s) into dist/full`)
}

if (import.meta.main) {
  await runBuildFullLocal()
}
