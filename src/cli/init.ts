import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { detectEntry, readEntryFile } from './detect.js'
import { patchEntry, patchPackageJson } from './patch-entry.js'
import { patchEnvExample } from './patch-env-example.js'

export interface InitOptions {
  cwd?: string
  path?: string
  entry?: string
}

export interface InitResult {
  entryPath: string
  entryChanged: boolean
  packageJsonChanged: boolean
  envExampleChanged: boolean
}

function moduleDirname(): string {
  // CJS bundle (CLI publicado): tsup injeta __dirname em dist/cli.cjs
  if (typeof __dirname !== 'undefined') {
    return __dirname
  }
  return dirname(fileURLToPath(import.meta.url))
}

function getPackageRoot(): string {
  let dir = moduleDirname()
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, 'templates', 'health-route.express.ts.txt'))) {
      return dir
    }
    dir = dirname(dir)
  }
  throw new Error('Não foi possível localizar templates do pacote keep-alive')
}

function loadTemplate(name: string): string {
  return readFileSync(join(getPackageRoot(), 'templates', name), 'utf-8')
}

export function runInit(options: InitOptions = {}): InitResult {
  const cwd = options.cwd ?? process.cwd()
  const healthPath = options.path ?? '/api/health'

  const entryPath = detectEntry(cwd, options.entry)
  if (!entryPath) {
    const hint = options.entry
      ? `Arquivo não encontrado: ${options.entry}`
      : 'Nenhum entry detectado. Tente --entry server/index.ts'
    throw new Error(hint)
  }

  const healthSnippet = loadTemplate('health-route.express.ts.txt').replace(
    /\{\{PATH\}\}/g,
    healthPath,
  )
  const envSnippet = loadTemplate('env.example.snippet.txt')

  readEntryFile(cwd, entryPath)

  const packageJsonChanged = patchPackageJson(cwd)
  const { changed: entryChanged } = patchEntry({
    cwd,
    entryPath,
    healthPath,
    healthRouteSnippet: healthSnippet,
  })
  const envExampleChanged = patchEnvExample(cwd, envSnippet)

  return {
    entryPath,
    entryChanged,
    packageJsonChanged,
    envExampleChanged,
  }
}
