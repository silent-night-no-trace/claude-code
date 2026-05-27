import { describe, expect, test } from 'bun:test'
import {
  fullCliPath as cliBuildFullCliPath,
  reducedCliPath as cliBuildReducedCliPath,
  runCliBuild,
} from '../../scripts/cli-build.js'
import {
  getRequestReadinessMessage,
  runCliCheck,
} from '../../scripts/cli-check.js'
import {
  getFullCliStatus,
  getOverallStatus,
  getQuickCheckStatus,
  getRequestPathStatus,
  runCliStatus,
} from '../../scripts/cli-status.js'
import { fullCliPath, runCli } from '../../scripts/cli-run.js'
import { runDebugPrint } from '../../scripts/debug-print.js'
import { runDebugStartup } from '../../scripts/debug-startup.js'
import { runVerifyStartup } from '../../scripts/verify-startup.js'
import { runVerifyPtyStartup } from '../../scripts/verify-pty-startup.js'
import {
  reducedCliPath as debugInspectorReducedCliPath,
  runDebugInspector,
} from '../../scripts/debug-inspector.js'

type LoggerCapture = {
  lines: string[]
  log: (...args: unknown[]) => void
}

function createLoggerCapture(): LoggerCapture {
  const lines: string[] = []
  return {
    lines,
    log: (...args: unknown[]) => {
      lines.push(args.join(' '))
    },
  }
}

describe('script surfaces', () => {
  test('runCliBuild invokes reduced and full builds in order', async () => {
    const commands: string[][] = []
    const logger = createLoggerCapture()

    await runCliBuild({
      log: logger.log,
      run: async argv => {
        commands.push(argv)
      },
    })

    expect(commands).toEqual([
      ['bun', 'run', 'build:local'],
      ['bun', 'run', 'build:full-local'],
    ])
    expect(logger.lines).toContain('Preparing reduced CLI status artifact...')
    expect(logger.lines).toContain('Preparing full CLI runtime artifact...')
    expect(logger.lines).toContain(`- ${cliBuildReducedCliPath}`)
    expect(logger.lines).toContain(`- ${cliBuildFullCliPath}`)
  })

  test('runCliCheck reports readiness based on API key presence', async () => {
    const commands: string[][] = []
    const logger = createLoggerCapture()

    await runCliCheck({
      env: { ANTHROPIC_API_KEY: 'token' },
      log: logger.log,
      run: async argv => {
        commands.push(argv)
      },
    })

    expect(commands).toEqual([
      ['bun', 'run', 'cli:build'],
      ['bun', 'run', 'cli:status'],
      ['bun', 'run', 'cli:run', '--', '--version'],
      ['bun', 'run', 'cli:run', '--', '--help'],
    ])
    expect(logger.lines).toContain('\nVerdict')
    expect(logger.lines).toContain(
      '- overall: OK - build, status, version, and help all passed',
    )
    expect(logger.lines).toContain(getRequestReadinessMessage(true))
  })

  test('status helpers map artifact and auth states correctly', () => {
    expect(getOverallStatus(true, true)).toEqual({
      level: 'OK',
      value: 'ready for local CLI usage and authenticated requests',
    })
    expect(getOverallStatus(true, false)).toEqual({
      level: 'WARN',
      value: 'ready for local CLI usage; requests still depend on auth',
    })
    expect(getFullCliStatus(false)).toEqual({
      level: 'INFO',
      value: 'not built yet (run `npm run cli:build` or `npm run cli:run`)',
    })
    expect(getRequestPathStatus(false)).toEqual({
      level: 'WARN',
      value: 'environment-dependent (use API key or existing login state)',
    })
    expect(getQuickCheckStatus()).toEqual({
      level: 'INFO',
      value: 'run `npm run cli:check` for a full smoke test',
    })
  })

  test('runCliStatus ensures reduced artifact and invokes doctor', async () => {
    const ensured: Array<{
      artifactPath: string
      missingMessage: string
      buildCommand: string[]
    }> = []
    const commands: string[][] = []
    const logger = createLoggerCapture()

    await runCliStatus({
      reducedArtifactPath: '/tmp/reduced-cli.js',
      fullArtifactPath: '/tmp/full-cli.js',
      env: {},
      log: logger.log,
      fileExists: filePath => filePath === '/tmp/full-cli.js',
      ensure: async (artifactPath, missingMessage, buildCommand) => {
        ensured.push({ artifactPath, missingMessage, buildCommand })
      },
      run: async argv => {
        commands.push(argv)
      },
    })

    expect(ensured).toEqual([
      {
        artifactPath: '/tmp/reduced-cli.js',
        missingMessage: 'CLI status artifact is missing; building it first...',
        buildCommand: ['bun', 'run', 'build:local'],
      },
    ])
    expect(commands).toEqual([['bun', '/tmp/reduced-cli.js', 'doctor']])
    expect(logger.lines).toContain('- overall: WARN - ready for local CLI usage; requests still depend on auth')
    expect(logger.lines).toContain('- full interactive CLI: OK - ready')
  })

  test('runCli forwards args to the built full CLI artifact', async () => {
    const ensured: string[][] = []
    const commands: string[][] = []

    await runCli({
      args: ['--help'],
      ensure: async (artifactPath, _missingMessage, buildCommand) => {
        ensured.push([artifactPath, ...buildCommand])
      },
      run: async argv => {
        commands.push(argv)
      },
    })

    expect(ensured).toEqual([[fullCliPath, 'bun', 'run', 'build:full-local']])
    expect(commands).toEqual([['bun', fullCliPath, '--help']])
  })

  test('runVerifyStartup performs the canonical startup smoke sequence', async () => {
    const commands: string[][] = []
    const logger = createLoggerCapture()

    await runVerifyStartup({
      log: logger.log,
      run: async argv => {
        commands.push(argv)
      },
    })

    expect(commands).toEqual([
      ['bun', 'run', 'cli:build'],
      ['bun', 'run', 'cli:run', '--', '--version'],
      ['bun', 'run', 'cli:run', '--', '--help'],
    ])
    expect(logger.lines).toContain('Verifying startup-oriented CLI surface...')
    expect(logger.lines).toContain('\nverify:startup passed.')
  })

  test('runVerifyPtyStartup checks help under a pseudo-TTY wrapper', async () => {
    const ensured: string[][] = []
    const commands: string[][] = []
    const logger = createLoggerCapture()

    await runVerifyPtyStartup({
      log: logger.log,
      ensure: async (artifactPath, _missingMessage, buildCommand) => {
        ensured.push([artifactPath, ...buildCommand])
      },
      run: async argv => {
        commands.push(argv)
      },
    })

    expect(ensured).toEqual([
      [fullCliPath, 'bun', 'run', 'build:full-local'],
    ])
    expect(commands).toEqual([
      ['script', '-q', '/dev/null', 'bun', fullCliPath, '--help'],
    ])
    expect(logger.lines).toContain('Verifying pseudo-TTY startup surface...')
    expect(logger.lines).toContain('\nverify:pty-startup passed.')
  })

  test('runDebugStartup probes startup logging through help mode', async () => {
    const commands: string[][] = []
    const logger = createLoggerCapture()

    await runDebugStartup({
      log: logger.log,
      run: async argv => {
        commands.push(argv)
      },
    })

    expect(commands).toEqual([
      ['bun', 'run', 'cli:run', '--', '--debug-to-stderr', '--help'],
    ])
    expect(logger.lines).toContain('Running startup debug surface...')
  })

  test('runDebugPrint treats auth failures as informative rather than fatal', async () => {
    const logger = createLoggerCapture()

    await runDebugPrint({
      ensure: async () => {},
      log: logger.log,
      error: logger.log,
      spawn: () => ({
        stdout: new Response('').body!,
        stderr: new Response('Failed to authenticate. API Error: 401').body!,
        exited: Promise.resolve(1),
        kill: () => {},
      }),
    })

    expect(logger.lines).toContain(
      'debug:print: WARN - print path reached the request/auth boundary; command remains environment-dependent in CI.',
    )
  })

  test('runDebugPrint reports successful print-mode completion', async () => {
    const logger = createLoggerCapture()
    let killCalls = 0

    await runDebugPrint({
      ensure: async () => {},
      log: logger.log,
      error: logger.log,
      spawn: () => ({
        stdout: new Response('hello').body!,
        stderr: new Response('').body!,
        exited: Promise.resolve(0),
        kill: () => {
          killCalls += 1
        },
      }),
    })

    expect(killCalls).toBe(0)
    expect(logger.lines).toContain(
      'debug:print: OK - print path completed successfully.',
    )
  })

  test('runDebugPrint builds missing artifacts and spawns the full CLI directly', async () => {
    const ensured: string[][] = []
    const commands: string[][] = []
    const logger = createLoggerCapture()

    await runDebugPrint({
      log: logger.log,
      error: logger.log,
      ensure: async (artifactPath, _missingMessage, buildCommand) => {
        ensured.push([artifactPath, ...buildCommand])
      },
      spawn: argv => {
        commands.push(argv)
        return {
          stdout: new Response('').body!,
          stderr: new Response('').body!,
          exited: Promise.resolve(0),
          kill: () => {},
        }
      },
    })

    expect(ensured).toEqual([[fullCliPath, 'bun', 'run', 'build:full-local']])
    expect(commands).toEqual([['bun', fullCliPath, '-p', 'hello']])
  })

  test('runDebugPrint waits for the timed-out print process to exit after killing it', async () => {
    const logger = createLoggerCapture()
    let resolveExit!: (exitCode: number) => void
    const events: string[] = []

    const runPromise = runDebugPrint({
      timeoutMs: 1,
      ensure: async () => {},
      log: logger.log,
      error: logger.log,
      spawn: () => ({
        stdout: new Response('').body!,
        stderr: new Response('').body!,
        exited: new Promise<number>(resolve => {
          resolveExit = exitCode => {
            events.push('exit')
            resolve(exitCode)
          }
        }),
        kill: () => {
          events.push('kill')
        },
      }),
    })

    await new Promise(resolve => setTimeout(resolve, 10))
    expect(events).toEqual(['kill'])

    let settled = false
    runPromise.then(() => {
      settled = true
    })
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(settled).toBe(false)

    resolveExit(143)
    await runPromise

    expect(settled).toBe(true)
    expect(logger.lines).toContain(
      'debug:print: WARN - print path did not finish within 1ms; terminated the print process cleanly and treated this as an environment/network-bound debug proof, not a build regression.',
    )
  })

  test('runDebugInspector ensures reduced artifact before inspect-build', async () => {
    const ensured: string[][] = []
    const commands: string[][] = []
    const logger = createLoggerCapture()

    await runDebugInspector({
      log: logger.log,
      ensure: async (artifactPath, _missingMessage, buildCommand) => {
        ensured.push([artifactPath, ...buildCommand])
      },
      run: async argv => {
        commands.push(argv)
      },
    })

    expect(ensured).toEqual([
      [debugInspectorReducedCliPath, 'bun', 'run', 'build:local'],
    ])
    expect(commands).toEqual([
      ['bun', debugInspectorReducedCliPath, 'inspect-build'],
    ])
    expect(logger.lines).toContain('Running reduced-build inspector...')
  })
})
