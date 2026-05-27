import { LOCAL_BUILD_DEFINE, LOCAL_BUILD_EXTERNAL } from './build-config.ts'

export const LOCAL_BUILD_OUTDIR = './dist/local'

type BuildRunner = (options: Bun.BuildConfig) => Promise<Bun.BuildOutput>
type LogFn = (...args: unknown[]) => void

export function getBuildLocalOptions(debug: boolean): Bun.BuildConfig {
  return {
    entrypoints: ['./entrypoints/cli.local.ts'],
    outdir: LOCAL_BUILD_OUTDIR,
    target: 'bun',
    format: 'esm',
    sourcemap: debug ? 'external' : 'none',
    minify: false,
    external: [...LOCAL_BUILD_EXTERNAL],
    define: LOCAL_BUILD_DEFINE,
  }
}

export async function runBuildLocal({
  argv = process.argv,
  build = Bun.build,
  error = console.error,
  log = console.log,
}: {
  argv?: string[]
  build?: BuildRunner
  error?: LogFn
  log?: LogFn
} = {}): Promise<void> {
  const debug = argv.includes('--debug')
  const result = await build(getBuildLocalOptions(debug))

  if (!result.success) {
    for (const message of result.logs) {
      error(message)
    }
    process.exit(1)
  }

  log(`Built ${result.outputs.length} file(s) into dist/local`)
}

if (import.meta.main) {
  await runBuildLocal()
}
