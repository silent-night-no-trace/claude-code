import { inspectLocalBuild } from '../utils/localBuildInspector.js'

const VERSION = '0.0.0-local'

function printBuildInspectionSection(title: string, values: string[]): void {
  if (values.length === 0) {
    return
  }

  console.log(`\n${title}`)
  for (const value of values) {
    console.log(`  - ${value}`)
  }
}

function printMissingImportBuckets(
  buckets: Array<{
    label: string
    count: number
    hint: string
    examples: string[]
  }>
): void {
  console.log('\nMissing import triage')
  for (const bucket of buckets) {
    console.log(`  - ${bucket.label}: ${bucket.count}`)
    console.log(`    ${bucket.hint}`)
    for (const example of bucket.examples) {
      console.log(`      • ${example}`)
    }
  }
}

function printInternalFeatureTriage(
  buckets: Array<{
    label: string
    count: number
    hint: string
    examples: string[]
  }>
): void {
  console.log('\nInternal feature repair triage')
  for (const bucket of buckets) {
    console.log(`  - ${bucket.label}: ${bucket.count}`)
    console.log(`    ${bucket.hint}`)
    for (const example of bucket.examples) {
      console.log(`      • ${example}`)
    }
  }
}

function printHelp() {
  console.log(`Claude Code (local reduced build)\n\nUsage:\n  claude-local --version\n  claude-local --help\n  claude-local inspect-build\n  claude-local doctor\n\nThis local source build is a reduced compatibility fork.\nUnavailable upstream-only features remain disabled because this repository snapshot is missing internal packages, generated files, and original build metadata.`)
}

async function runBuildInspection(): Promise<void> {
  const report = await inspectLocalBuild(process.cwd())

  console.log('Claude Code local source-build inspector\n')
  console.log(`Repository: ${report.cwd}`)
  console.log(`Source files scanned: ${report.counts.sourceFilesScanned}`)

  console.log('\nRoot build metadata')
  for (const entry of report.rootFiles) {
    const status = entry.present ? 'present' : 'missing'
    console.log(`  - ${entry.file}: ${status}${entry.note ? ` — ${entry.note}` : ''}`)
  }

  console.log('\nStructural blocker counts')
  console.log(`  - src/* alias imports: ${report.counts.srcAliasImports}`)
  console.log(`  - private @ant/* imports: ${report.counts.privateAntImports}`)
  console.log(`  - bun:bundle imports: ${report.counts.bunBundleImports}`)
  console.log(`  - MACRO.* references: ${report.counts.macroReferences}`)
  console.log(`  - missing relative imports: ${report.counts.missingRelativeImports}`)
  console.log(`  - undeclared external packages: ${report.counts.undeclaredExternalPackages}`)

  printMissingImportBuckets(report.missingImportBuckets)
  printInternalFeatureTriage(report.internalFeatureTriage)

  printBuildInspectionSection('Example missing relative imports', report.examples.missingRelativeImports)
  printBuildInspectionSection('Example undeclared external packages', report.examples.undeclaredExternalPackages)
  printBuildInspectionSection('Example private @ant/* imports', report.examples.privateAntImports)
  printBuildInspectionSection('Conclusion', report.conclusion)
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp()
    return
  }

  if (args.length === 1 && ['--version', '-v', '-V'].includes(args[0]!)) {
    console.log(`${VERSION} (Claude Code local reduced build)`)
    return
  }

  if (args.length === 1 && ['inspect-build', 'doctor'].includes(args[0]!)) {
    await runBuildInspection()
    return
  }

  console.error('This local reduced build does not support the full Claude Code command surface yet.')
  console.error('Supported commands: --help, --version, inspect-build, doctor')
  process.exitCode = 2
}

void main()
