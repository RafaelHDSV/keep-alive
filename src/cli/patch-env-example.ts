import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SNIPPET_MARKER = '# keep-alive — self-ping'

export function patchEnvExample(cwd: string, snippet: string): boolean {
  const envPath = join(cwd, '.env.example')
  const trimmedSnippet = snippet.trimEnd()

  if (!existsSync(envPath)) {
    writeFileSync(envPath, trimmedSnippet + '\n', 'utf-8')
    return true
  }

  const content = readFileSync(envPath, 'utf-8')
  if (content.includes(SNIPPET_MARKER) || content.includes('KEEP_ALIVE_URL=')) {
    return false
  }

  const separator = content.endsWith('\n') ? '' : '\n'
  writeFileSync(envPath, content + separator + '\n' + trimmedSnippet + '\n', 'utf-8')
  return true
}
