import { existsSync } from 'fs'
import path from 'path'
import { runCommand } from './cli-helpers.ts'

function ensurePath(filePath: string, label: string): void {
  if (!existsSync(filePath)) {
    console.error(`verify:bootstrap: missing ${label}: ${filePath}`)
    process.exit(1)
  }
  console.log(`- OK: ${label}`)
}

const reducedCliPath = path.resolve('./dist/local/cli.local.js')
const fullCliPath = path.resolve('./dist/full/cli.js')
const fullRipgrepPath = path.resolve('./dist/full/vendor/ripgrep')

console.log('Verifying clean-checkout bootstrap path...\n')

await runCommand(['bun', 'run', 'bootstrap'])
await runCommand(['bun', 'run', 'cli:build'])

console.log('\nChecking required build artifacts...')
ensurePath(reducedCliPath, 'reduced CLI artifact')
ensurePath(fullCliPath, 'full CLI artifact')
ensurePath(fullRipgrepPath, 'full build vendored ripgrep asset')

console.log('\nRunning CLI smoke checks...')
await runCommand(['bun', 'run', 'cli:check'])

console.log('\nverify:bootstrap passed.')

export {}
