import { runCommand } from './cli-helpers.ts'

console.log('Running canonical local verification suite...')

await runCommand(['bun', 'run', 'verify:bootstrap'])
await runCommand(['bun', 'run', 'verify:build'])
await runCommand(['bun', 'run', 'verify:status'])
await runCommand(['bun', 'run', 'verify:startup'])
await runCommand(['bun', 'run', 'verify:pty-startup'])
await runCommand(['bun', 'run', 'verify:typecheck'])
await runCommand(['bun', 'run', 'verify:restoration'])

console.log('\nverify passed.')

export {}
