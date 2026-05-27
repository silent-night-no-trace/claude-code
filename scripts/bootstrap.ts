import { existsSync } from 'fs'
import path from 'path'
import { runCommand } from './cli-helpers.ts'

function fail(message: string): never {
  console.error(`bootstrap: ${message}`)
  process.exit(1)
}

function ensure(condition: boolean, message: string): void {
  if (!condition) {
    fail(message)
  }
}

function isSupportedBunVersion(version: string): boolean {
  return /^1\.3\./.test(version)
}

const repoRoot = path.resolve('.')
const requiredRepoPaths = [
  path.resolve('./package.json'),
  path.resolve('./stubs/ant-computer-use-mcp'),
  path.resolve('./stubs/ant-computer-use-swift'),
]

const requiredInstalledPaths = [
  path.resolve('./node_modules'),
  path.resolve('./bun.lock'),
  path.resolve('./node_modules/@anthropic-ai/claude-agent-sdk/vendor/ripgrep'),
]

console.log('Claude Code local bootstrap\n')
console.log(`Repository: ${repoRoot}`)

ensure(process.platform !== 'win32', 'current bootstrap contract only covers macOS / Unix-like shells')
ensure(isSupportedBunVersion(Bun.version), `expected Bun 1.3.x, found ${Bun.version}`)

for (const filePath of requiredRepoPaths) {
  ensure(existsSync(filePath), `required repository path is missing: ${filePath}`)
}

console.log(`Bun version: ${Bun.version} (supported)`)
console.log('Installing dependencies and wiring local file:stubs packages...')
await runCommand(['bun', 'install'])

console.log('\nVerifying install-time assets...')
for (const filePath of requiredInstalledPaths) {
  ensure(existsSync(filePath), `expected install-time asset is missing: ${filePath}`)
  console.log(`- OK: ${filePath}`)
}

console.log('\nBootstrap complete.')
console.log('Next recommended commands:')
console.log('- npm run cli:build')
console.log('- npm run cli:check')

export {}
