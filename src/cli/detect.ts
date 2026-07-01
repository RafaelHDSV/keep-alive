import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const DEFAULT_ENTRY = 'server/index.ts'
const EXPRESS_MARKERS = [/from\s+['"]express['"]/, /require\s*\(\s*['"]express['"]\s*\)/]

export interface DetectResult {
  entryPath: string
  isExpress: boolean
  hasHealthRoute: boolean
  hasKeepAliveImport: boolean
  hasKeepAliveCall: boolean
}

export function detectEntry(cwd: string, entryOverride?: string): string | null {
  if (entryOverride) {
    const resolved = join(cwd, entryOverride)
    return existsSync(resolved) ? entryOverride : null
  }

  const defaultPath = join(cwd, DEFAULT_ENTRY)
  if (existsSync(defaultPath)) return DEFAULT_ENTRY

  const fromStart = detectEntryFromStartScript(cwd)
  if (fromStart && existsSync(join(cwd, fromStart))) return fromStart

  return null
}

function detectEntryFromStartScript(cwd: string): string | null {
  const pkgPath = join(cwd, 'package.json')
  if (!existsSync(pkgPath)) return null

  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
      scripts?: Record<string, string>
    }
    const start = pkg.scripts?.start
    if (!start) return null

    const tsMatch = start.match(/(?:^|\s)([\w./-]+\.(?:ts|tsx|js|mjs|cjs))(?:\s|$)/)
    if (tsMatch) return tsMatch[1]

    const nodeMatch = start.match(/node\s+(?:--\S+\s+)*([\w./-]+\.(?:ts|tsx|js|mjs|cjs))/)
    if (nodeMatch) return nodeMatch[1]

    return null
  } catch {
    return null
  }
}

export function analyzeEntry(content: string, healthPath: string): DetectResult {
  const isExpress =
    EXPRESS_MARKERS.some((re) => re.test(content)) && /app\.listen\s*\(/.test(content)

  const escapedPath = escapeRegExp(healthPath)
  const hasHealthRoute = new RegExp(
    `app\\.(?:get|use)\\s*\\(\\s*['"\`]${escapedPath}['"\`]`,
  ).test(content)

  const hasKeepAliveImport = /@rafaelhdsv\/keep-alive/.test(content)
  const hasKeepAliveCall = /\bstartKeepAlive\s*\(/.test(content)

  return {
    entryPath: '',
    isExpress,
    hasHealthRoute,
    hasKeepAliveImport,
    hasKeepAliveCall,
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function readEntryFile(cwd: string, entryPath: string): string {
  return readFileSync(join(cwd, entryPath), 'utf-8')
}
