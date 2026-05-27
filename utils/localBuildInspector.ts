import { access, readFile, readdir } from 'node:fs/promises'
import { builtinModules } from 'node:module'
import { dirname, extname, join, relative, resolve } from 'node:path'

type BuildInspectionReport = {
  cwd: string
  rootFiles: Array<{ file: string; present: boolean; note?: string }>
  counts: {
    sourceFilesScanned: number
    srcAliasImports: number
    privateAntImports: number
    bunBundleImports: number
    macroReferences: number
    missingRelativeImports: number
    undeclaredExternalPackages: number
  }
  missingImportBuckets: Array<{
    key: 'generated-artifact' | 'internal-feature' | 'content-asset' | 'general-source-gap'
    label: string
    count: number
    hint: string
    examples: string[]
  }>
  internalFeatureTriage: Array<{
    key: 'gate-exclude' | 'stub-surface' | 'caller-rewrite'
    label: string
    count: number
    hint: string
    examples: string[]
  }>
  examples: {
    missingRelativeImports: string[]
    undeclaredExternalPackages: string[]
    privateAntImports: string[]
  }
  conclusion: string[]
}

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.mts', '.cts'])
const CANDIDATE_SUFFIXES = ['', '.ts', '.tsx', '.js', '.jsx', '.mts', '.cts', '.mjs', '.cjs', '.json', '.md', '.txt']
const CANDIDATE_INDEXES = ['/index.ts', '/index.tsx', '/index.js', '/index.jsx', '/index.mts', '/index.cts', '/index.mjs', '/index.cjs']
const IMPORT_SPECIFIER_RE = /(?:import\s+(?:type\s+)?(?:[^'"\n]+?\s+from\s+)?|export\s+[^'"\n]+?\s+from\s+|import\s*\(|require\s*\()\s*["']([^"']+)["']/g
const BUILTIN_PACKAGES = new Set([...builtinModules, ...builtinModules.map(name => `node:${name}`)])
const GENERATED_IMPORT_PATTERNS = [
  /\.generated\./,
  /\/generated\//,
  /sdk\/controlTypes/i,
  /sdk\/runtimeTypes/i,
  /sdk\/toolTypes/i,
  /coreTypes\.generated/i,
  /types\/message\.js$/,
  /types\/utils\.js$/,
  /types\/connectorText\.js$/
]
const INTERNAL_FEATURE_PATTERNS = [
  /assistant\//,
  /proactive\//,
  /TungstenTool/,
  /WorkflowTool/,
  /MonitorTool/,
  /ReviewArtifactTool/,
  /snipCompact/,
  /snipProjection/,
  /contextCollapse/,
  /buddy\//,
  /peers\//,
  /fork\//
]
const CONTENT_ASSET_PATTERNS = [/\.md$/i, /\.txt$/i, /\.prompt$/i]
const INTERNAL_GATE_PATTERNS = [
  /proactive\//,
  /snipCompact/,
  /snipProjection/,
  /WorkflowTool/,
  /MonitorTool/,
  /ReviewArtifactTool/,
  /assistant\//
]
const INTERNAL_STUB_PATTERNS = [/commands\/assistant\//, /commands\/buddy\//, /commands\/fork\//, /commands\/peers\//]

function classifyInternalFeatureRepair(specifier: string): BuildInspectionReport['internalFeatureTriage'][number]['key'] {
  if (INTERNAL_GATE_PATTERNS.some(pattern => pattern.test(specifier))) {
    return 'gate-exclude'
  }

  if (INTERNAL_STUB_PATTERNS.some(pattern => pattern.test(specifier))) {
    return 'stub-surface'
  }

  return 'caller-rewrite'
}

function classifyMissingRelativeImport(specifier: string): BuildInspectionReport['missingImportBuckets'][number]['key'] {
  if (GENERATED_IMPORT_PATTERNS.some(pattern => pattern.test(specifier))) {
    return 'generated-artifact'
  }

  if (CONTENT_ASSET_PATTERNS.some(pattern => pattern.test(specifier))) {
    return 'content-asset'
  }

  if (INTERNAL_FEATURE_PATTERNS.some(pattern => pattern.test(specifier))) {
    return 'internal-feature'
  }

  return 'general-source-gap'
}

function getPackageName(specifier: string): string {
  if (specifier.startsWith('@')) {
    const [scope = '', name = ''] = specifier.split('/')
    return `${scope}/${name}`
  }

  return specifier.split('/')[0] ?? specifier
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function resolveRelativeImport(importer: string, specifier: string): Promise<boolean> {
  const basePath = resolve(dirname(importer), specifier)
  const baseExtension = extname(basePath)
  const stemPath = baseExtension ? basePath.slice(0, -baseExtension.length) : basePath

  if (await pathExists(basePath)) {
    return true
  }

  for (const suffix of CANDIDATE_SUFFIXES) {
    if (await pathExists(`${stemPath}${suffix}`)) {
      return true
    }
  }

  for (const indexSuffix of CANDIDATE_INDEXES) {
    if (await pathExists(`${basePath}${indexSuffix}`) || await pathExists(`${stemPath}${indexSuffix}`)) {
      return true
    }
  }

  return false
}

async function walkSourceFiles(rootDir: string): Promise<string[]> {
  const results: string[] = []
  const stack = [rootDir]

  while (stack.length > 0) {
    const current = stack.pop()!
    const entries = await readdir(current, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist') {
        continue
      }

      const fullPath = join(current, entry.name)

      if (entry.isDirectory()) {
        stack.push(fullPath)
        continue
      }

      if (SOURCE_EXTENSIONS.has(extname(entry.name))) {
        results.push(fullPath)
      }
    }
  }

  return results
}

export async function inspectLocalBuild(repoRoot: string): Promise<BuildInspectionReport> {
  const files = await walkSourceFiles(repoRoot)
  const packageJsonPath = join(repoRoot, 'package.json')
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8')) as {
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
  }
  const declaredPackages = new Set([
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {})
  ])

  const missingRelativeImports = new Set<string>()
  const missingImportBuckets = {
    'generated-artifact': new Set<string>(),
    'internal-feature': new Set<string>(),
    'content-asset': new Set<string>(),
    'general-source-gap': new Set<string>()
  } satisfies Record<BuildInspectionReport['missingImportBuckets'][number]['key'], Set<string>>
  const internalFeatureTriage = {
    'gate-exclude': new Set<string>(),
    'stub-surface': new Set<string>(),
    'caller-rewrite': new Set<string>()
  } satisfies Record<BuildInspectionReport['internalFeatureTriage'][number]['key'], Set<string>>
  const undeclaredExternalPackages = new Set<string>()
  const privateAntImports = new Set<string>()
  let srcAliasImports = 0
  let privateAntImportCount = 0
  let bunBundleImports = 0
  let macroReferences = 0

  for (const filePath of files) {
    const content = await readFile(filePath, 'utf8')
    srcAliasImports += (content.match(/from ['"]src\//g) ?? []).length
    bunBundleImports += (content.match(/bun:bundle/g) ?? []).length
    macroReferences += (content.match(/MACRO\./g) ?? []).length

    for (const match of content.matchAll(IMPORT_SPECIFIER_RE)) {
      const specifier = match[1]
      if (!specifier) continue

      if (specifier.startsWith('@ant/')) {
        privateAntImportCount += 1
        privateAntImports.add(specifier)
      }

      if (specifier.startsWith('./') || specifier.startsWith('../')) {
        const resolved = await resolveRelativeImport(filePath, specifier)
        if (!resolved) {
          const missingEdge = `${relative(repoRoot, filePath)} -> ${specifier}`
          missingRelativeImports.add(missingEdge)
          const bucket = classifyMissingRelativeImport(specifier)
          missingImportBuckets[bucket].add(missingEdge)
          if (bucket === 'internal-feature') {
            internalFeatureTriage[classifyInternalFeatureRepair(specifier)].add(missingEdge)
          }
        }
        continue
      }

      if (specifier.startsWith('src/')) {
        continue
      }

      if (specifier.startsWith('bun:') || BUILTIN_PACKAGES.has(specifier)) {
        continue
      }

      const packageName = getPackageName(specifier)
      if (!declaredPackages.has(packageName)) {
        undeclaredExternalPackages.add(packageName)
      }
    }
  }

  const rootFiles = await Promise.all(
    [
      ['package.json', 'local bootstrap manifest exists'],
      ['tsconfig.json', 'local TypeScript config exists'],
    ['README.md', 'local open-source readme exists; original upstream readme content is not part of this snapshot'],
      ['Cargo.toml', 'native/rust workspace manifest is absent at root']
    ].map(async ([file, note]) => ({
      file,
      present: await pathExists(join(repoRoot, file)),
      note
    }))
  )

  const conclusions: string[] = []
  if (privateAntImportCount > 0) {
    conclusions.push('Private @ant/* imports are still present in the source tree and block a faithful public rebuild.')
  }
  if (missingRelativeImports.size > 0) {
    conclusions.push('Some relative imports point at files missing from this snapshot, indicating generated or omitted source artifacts.')
  }
  if (undeclaredExternalPackages.size > 0) {
    conclusions.push('The source references external packages that are not declared in the local bootstrap manifest yet.')
  }
  if (srcAliasImports > 0 || bunBundleImports > 0 || macroReferences > 0) {
    conclusions.push('The upstream code still depends on custom build-time aliasing, Bun feature flags, and macro injection.')
  }
  if (conclusions.length === 0) {
    conclusions.push('No major structural blockers were detected by the reduced local inspector.')
  }

  const missingImportBucketSummary: BuildInspectionReport['missingImportBuckets'] = [
    {
      key: 'generated-artifact',
      label: 'Likely generated artifacts',
      count: missingImportBuckets['generated-artifact'].size,
      hint: 'These usually need upstream codegen output or checked-in generated files.',
      examples: [...missingImportBuckets['generated-artifact']].sort().slice(0, 8)
    },
    {
      key: 'internal-feature',
      label: 'Likely omitted internal feature modules',
      count: missingImportBuckets['internal-feature'].size,
      hint: 'These are good candidates for feature gating, stubbing, or excluding from the reduced build.',
      examples: [...missingImportBuckets['internal-feature']].sort().slice(0, 8)
    },
    {
      key: 'content-asset',
      label: 'Missing content assets',
      count: missingImportBuckets['content-asset'].size,
      hint: 'These usually require restoring markdown/text assets or replacing them with inline fallback content.',
      examples: [...missingImportBuckets['content-asset']].sort().slice(0, 8)
    },
    {
      key: 'general-source-gap',
      label: 'General source gaps',
      count: missingImportBuckets['general-source-gap'].size,
      hint: 'These are ordinary missing source files and are the best place to consider targeted stubs or reconstruction.',
      examples: [...missingImportBuckets['general-source-gap']].sort().slice(0, 8)
    }
  ]

  const internalFeatureTriageSummary: BuildInspectionReport['internalFeatureTriage'] = [
    {
      key: 'gate-exclude',
      label: 'Gate or exclude first',
      count: internalFeatureTriage['gate-exclude'].size,
      hint: 'These are mostly feature-flagged or optional internal modules. Keep them out of the reduced build before trying to reconstruct them.',
      examples: [...internalFeatureTriage['gate-exclude']].sort().slice(0, 8)
    },
    {
      key: 'stub-surface',
      label: 'Stub with minimal surface',
      count: internalFeatureTriage['stub-surface'].size,
      hint: 'These look like missing command entry surfaces where a no-op/default export can unblock module resolution for reduced builds.',
      examples: [...internalFeatureTriage['stub-surface']].sort().slice(0, 8)
    },
    {
      key: 'caller-rewrite',
      label: 'Needs caller rewrite',
      count: internalFeatureTriage['caller-rewrite'].size,
      hint: 'These gaps likely sit on shared interfaces and need import-site changes or adapter shims rather than a trivial stub.',
      examples: [...internalFeatureTriage['caller-rewrite']].sort().slice(0, 8)
    }
  ]

  return {
    cwd: repoRoot,
    rootFiles,
    counts: {
      sourceFilesScanned: files.length,
      srcAliasImports,
      privateAntImports: privateAntImportCount,
      bunBundleImports,
      macroReferences,
      missingRelativeImports: missingRelativeImports.size,
      undeclaredExternalPackages: undeclaredExternalPackages.size
    },
    missingImportBuckets: missingImportBucketSummary,
    internalFeatureTriage: internalFeatureTriageSummary,
    examples: {
      missingRelativeImports: [...missingRelativeImports].sort().slice(0, 12),
      undeclaredExternalPackages: [...undeclaredExternalPackages].sort().slice(0, 20),
      privateAntImports: [...privateAntImports].sort().slice(0, 12)
    },
    conclusion: conclusions
  }
}
