import { describe, expect, test } from 'bun:test'
import { existsSync } from 'fs'
import path from 'path'
import {
  FULL_BUILD_OUTDIR,
  getBuildFullLocalOptions,
  RIPGREP_VENDOR_SOURCE,
  RIPGREP_VENDOR_TARGET,
} from '../../scripts/build-full-local.js'
import {
  getBuildLocalOptions,
  LOCAL_BUILD_OUTDIR,
} from '../../scripts/build-local.js'
import {
  LOCAL_BUILD_DEFINE,
  LOCAL_BUILD_EXTERNAL,
} from '../../scripts/build-config.js'

describe('build contracts', () => {
  test('stub file dependencies resolve to checked-in directories', async () => {
    const packageJson = await Bun.file(path.resolve('package.json')).json() as {
      dependencies?: Record<string, string>
    }

    const stubDependencyPaths = Object.values(packageJson.dependencies ?? {}).filter(
      value => value.startsWith('file:stubs/'),
    )

    expect(stubDependencyPaths.length).toBeGreaterThan(0)

    for (const dependencyPath of stubDependencyPaths) {
      expect(existsSync(path.resolve(dependencyPath.slice('file:'.length)))).toBeTrue()
    }
  })

  test('reduced and full build configs share the local macro/external contract', () => {
    const reducedOptions = getBuildLocalOptions(false)
    const fullOptions = getBuildFullLocalOptions(true)

    expect(reducedOptions.entrypoints).toEqual(['./entrypoints/cli.local.ts'])
    expect(reducedOptions.outdir).toBe(LOCAL_BUILD_OUTDIR)
    expect(reducedOptions.external).toEqual([...LOCAL_BUILD_EXTERNAL])
    expect(reducedOptions.define).toEqual(LOCAL_BUILD_DEFINE)
    expect(reducedOptions.sourcemap).toBe('none')

    expect(fullOptions.entrypoints).toEqual(['./entrypoints/cli.tsx'])
    expect(fullOptions.outdir).toBe(FULL_BUILD_OUTDIR)
    expect(fullOptions.external).toEqual([...LOCAL_BUILD_EXTERNAL])
    expect(fullOptions.define).toEqual(LOCAL_BUILD_DEFINE)
    expect(fullOptions.sourcemap).toBe('external')
  })

  test('full build keeps the vendored ripgrep runtime contract explicit', () => {
    expect(RIPGREP_VENDOR_SOURCE).toEndWith(
      path.join(
        'node_modules',
        '@anthropic-ai',
        'claude-agent-sdk',
        'vendor',
        'ripgrep',
      ),
    )
    expect(RIPGREP_VENDOR_TARGET).toBe(
      path.resolve(FULL_BUILD_OUTDIR, 'vendor/ripgrep'),
    )
  })
})
