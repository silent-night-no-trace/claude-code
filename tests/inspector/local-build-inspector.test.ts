import { describe, expect, test } from 'bun:test'
import { mkdtemp, mkdir, rm, writeFile } from 'fs/promises'
import os from 'os'
import path from 'path'
import { inspectLocalBuild } from '../../utils/localBuildInspector.js'

async function writeFixtureFiles(
  rootDir: string,
  files: Record<string, string>,
): Promise<void> {
  for (const [relativePath, content] of Object.entries(files)) {
    const filePath = path.join(rootDir, relativePath)
    await mkdir(path.dirname(filePath), { recursive: true })
    await writeFile(filePath, content)
  }
}

function staticImport(binding: string, specifier: string): string {
  return ['im', `port ${binding} from '${specifier}'`].join('')
}

function dynamicImport(binding: string, specifier: string): string {
  return `const ${binding} = ${['im', 'port'].join('')}('${specifier}')`
}

function macroAssignment(binding: string, member: string): string {
  return `const ${binding} = ${['MACRO', member].join('.')}`
}

describe('local build inspector', () => {
  test('classifies alias usage, missing import buckets, and contract signals', async () => {
    const rootDir = await mkdtemp(path.join(os.tmpdir(), 'local-build-inspector-'))

    try {
      await writeFixtureFiles(rootDir, {
        'package.json': JSON.stringify(
          {
            name: 'fixture',
            dependencies: {
              chalk: '^5.0.0',
              '@ant/private': 'file:stubs/private',
            },
          },
          null,
          2,
        ),
        'tsconfig.json': JSON.stringify({ compilerOptions: {} }, null, 2),
        'README.md': '# fixture\n',
        'src/aliasThing.ts': 'export const aliasThing = 1\n',
        'src/existing.ts': 'export const existing = 1\n',
        'src/sample.ts': [
          staticImport('{ existing }', './existing.js'),
          staticImport('generatedThing', './types/message.js'),
          staticImport('internalThing', './assistant/entry.js'),
          staticImport('contentThing', './prompts/help.md'),
          staticImport('generalThing', './missing.js'),
          staticImport('aliasThing', 'src/aliasThing'),
          staticImport('antThing', '@ant/private'),
          staticImport('externalThing', 'not-declared'),
          macroAssignment('version', 'VERSION'),
          dynamicImport('bundlePromise', ['bun', 'bundle'].join(':')),
          'void existing',
          'void generatedThing',
          'void internalThing',
          'void contentThing',
          'void generalThing',
          'void aliasThing',
          'void antThing',
          'void externalThing',
          'void version',
          'void bundlePromise',
          '',
        ].join('\n'),
      })

      const report = await inspectLocalBuild(rootDir)

      expect(report.counts.sourceFilesScanned).toBe(3)
      expect(report.counts.srcAliasImports).toBe(1)
      expect(report.counts.privateAntImports).toBe(1)
      expect(report.counts.bunBundleImports).toBe(1)
      expect(report.counts.macroReferences).toBe(1)
      expect(report.counts.missingRelativeImports).toBe(4)
      expect(report.counts.undeclaredExternalPackages).toBe(1)

      expect(
        report.missingImportBuckets.find(bucket => bucket.key === 'generated-artifact')
          ?.count,
      ).toBe(1)
      expect(
        report.missingImportBuckets.find(bucket => bucket.key === 'internal-feature')
          ?.count,
      ).toBe(1)
      expect(
        report.missingImportBuckets.find(bucket => bucket.key === 'content-asset')
          ?.count,
      ).toBe(1)
      expect(
        report.missingImportBuckets.find(bucket => bucket.key === 'general-source-gap')
          ?.count,
      ).toBe(1)
      expect(
        report.internalFeatureTriage.find(item => item.key === 'gate-exclude')?.count,
      ).toBe(1)
      expect(report.examples.privateAntImports).toContain('@ant/private')
      expect(report.examples.undeclaredExternalPackages).toContain('not-declared')
      expect(
        report.conclusion.some(line =>
          line.includes('Private @ant/* imports are still present in the source tree'),
        ),
      ).toBeTrue()
      expect(
        report.conclusion.some(line =>
          line.includes('custom build-time aliasing, Bun feature flags, and macro injection'),
        ),
      ).toBeTrue()
    } finally {
      await rm(rootDir, { force: true, recursive: true })
    }
  })
})
