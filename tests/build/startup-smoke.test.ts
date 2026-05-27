import { beforeAll, describe, expect, test } from 'bun:test'

type CommandResult = {
  exitCode: number
  stdout: string
  stderr: string
}

async function runCommand(argv: string[]): Promise<CommandResult> {
  const proc = Bun.spawn(argv, {
    cwd: process.cwd(),
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      ...process.env,
      CI: '1',
      NO_COLOR: '1',
    },
  })

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])

  return { exitCode, stdout, stderr }
}

async function expectSuccess(argv: string[]): Promise<CommandResult> {
  const result = await runCommand(argv)
  expect(result.exitCode).toBe(0)
  return result
}

describe('startup smoke', () => {
  beforeAll(async () => {
    await expectSuccess([process.execPath, 'run', 'cli:build'])
  })

  test('reduced CLI starts and reports a local version', async () => {
    const result = await expectSuccess([
      process.execPath,
      './dist/local/cli.local.js',
      '--version',
    ])

    expect(result.stdout).toContain('0.0.0-local')
  })

  test('full CLI startup wrapper reaches the help surface', async () => {
    const result = await expectSuccess([
      process.execPath,
      'run',
      'cli:run',
      '--',
      '--help',
    ])

    expect(result.stdout).toContain('Usage:')
  })
})
