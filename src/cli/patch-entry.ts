import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { analyzeEntry } from './detect.js'

const PACKAGE_NAME = '@rafaelhdsv/keep-alive'
const IMPORT_LINE = `import { startKeepAlive } from '${PACKAGE_NAME}'`

export interface PatchEntryOptions {
  cwd: string
  entryPath: string
  healthPath: string
  healthRouteSnippet: string
}

export interface PatchEntryResult {
  changed: boolean
  content: string
}

export function patchEntry(options: PatchEntryOptions): PatchEntryResult {
  const filePath = join(options.cwd, options.entryPath)
  let content = readFileSync(filePath, 'utf-8')
  const analysis = analyzeEntry(content, options.healthPath)

  if (!analysis.isExpress) {
    throw new Error(
      'Este comando suporta apenas projetos Express com app.listen(). ' +
        'Para Fastify, Hono ou outros frameworks, use startKeepAlive() manualmente após o servidor subir.',
    )
  }

  let changed = false

  if (!analysis.hasKeepAliveImport) {
    content = injectImport(content)
    changed = true
  }

  if (!analysis.hasHealthRoute) {
    content = injectHealthRoute(content, options.healthRouteSnippet)
    changed = true
  }

  if (!analysis.hasKeepAliveCall) {
    content = injectKeepAliveCall(content)
    changed = true
  }

  if (changed) {
    writeFileSync(filePath, content, 'utf-8')
  }

  return { changed, content }
}

function injectImport(content: string): string {
  const importMatch = content.match(/^import\s.+$/m)
  if (importMatch && importMatch.index !== undefined) {
    const insertAt = content.indexOf('\n', importMatch.index) + 1
    return content.slice(0, insertAt) + IMPORT_LINE + '\n' + content.slice(insertAt)
  }

  return IMPORT_LINE + '\n' + content
}

function injectHealthRoute(content: string, snippet: string): string {
  const listenMatch = content.match(/app\.listen\s*\(/)
  if (!listenMatch || listenMatch.index === undefined) {
    throw new Error('Não foi possível localizar app.listen() no arquivo de entrada.')
  }

  const beforeListen = content.slice(0, listenMatch.index)
  const afterListen = content.slice(listenMatch.index)

  const trimmedSnippet = snippet.trimEnd() + '\n\n'
  return beforeListen + trimmedSnippet + afterListen
}

function injectKeepAliveCall(content: string): string {
  const listenRegex = /app\.listen\s*\([^)]*\)\s*(?:,\s*)?(?:=>\s*)?\{/
  const match = content.match(listenRegex)

  if (!match || match.index === undefined) {
    throw new Error(
      'Não foi possível localizar o callback de app.listen(). ' +
        'Adicione startKeepAlive() manualmente após o servidor subir.',
    )
  }

  const braceIndex = content.indexOf('{', match.index)
  if (braceIndex === -1) {
    throw new Error('Callback de app.listen() deve usar bloco { ... } para injeção automática.')
  }

  const insertAt = braceIndex + 1
  const indent = detectIndent(content, insertAt)
  const injection = `\n${indent}startKeepAlive()`

  return content.slice(0, insertAt) + injection + content.slice(insertAt)
}

function detectIndent(content: string, position: number): string {
  const lineStart = content.lastIndexOf('\n', position - 1) + 1
  const line = content.slice(lineStart, position)
  const match = line.match(/^(\s*)/)
  return (match?.[1] ?? '') + '  '
}

export function patchPackageJson(cwd: string): boolean {
  const pkgPath = join(cwd, 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
  }

  const deps = pkg.dependencies ?? {}
  if (deps[PACKAGE_NAME]) return false

  pkg.dependencies = { ...deps, [PACKAGE_NAME]: '^1.0.0' }
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')
  return true
}
