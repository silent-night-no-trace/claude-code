import { inspectLocalBuild } from '../utils/localBuildInspector.js'

function fail(message: string): never {
  console.error(`verify:restoration: ${message}`)
  process.exit(1)
}

const report = await inspectLocalBuild(process.cwd())

const blockingCounts = [
  ['missing relative imports', report.counts.missingRelativeImports],
  ['undeclared external packages', report.counts.undeclaredExternalPackages],
  ['generated artifact gaps', report.missingImportBuckets.find(bucket => bucket.key === 'generated-artifact')?.count ?? 0],
  ['internal feature gaps', report.missingImportBuckets.find(bucket => bucket.key === 'internal-feature')?.count ?? 0],
  ['content asset gaps', report.missingImportBuckets.find(bucket => bucket.key === 'content-asset')?.count ?? 0],
  ['general source gaps', report.missingImportBuckets.find(bucket => bucket.key === 'general-source-gap')?.count ?? 0],
] as const

console.log('Checking restoration / missing-module contract...')
console.log('Governed restoration objects are tracked in docs/MODULE_RESTORATION_LEDGER.md\n')

for (const [label, value] of blockingCounts) {
  console.log(`- ${label}: ${value}`)
  if (value !== 0) {
    fail(`${label} must remain 0 for the local rebuild contract`)
  }
}

console.log('\nverify:restoration passed.')

export {}
