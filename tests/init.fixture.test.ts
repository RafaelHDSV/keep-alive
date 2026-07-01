import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { cpSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { runInit } from '../src/cli/init.js'

const FIXTURE = join(import.meta.dirname, 'fixtures', 'express-minimal')

describe('CLI init (fixture Express)', () => {
  let workDir: string

  beforeEach(() => {
    workDir = mkdtempSync(join(tmpdir(), 'keep-alive-init-'))
    cpSync(FIXTURE, workDir, { recursive: true })
  })

  afterEach(() => {
    rmSync(workDir, { recursive: true, force: true })
  })

  it('injeta import, rota health e startKeepAlive após app.listen', () => {
    const result = runInit({ cwd: workDir, path: '/api/health', entry: 'server/index.ts' })

    assert.equal(result.entryChanged, true)
    assert.equal(result.packageJsonChanged, true)
    assert.equal(result.envExampleChanged, true)

    const entry = readFileSync(join(workDir, 'server/index.ts'), 'utf-8')
    assert.match(entry, /@rafaelhdsv\/keep-alive/)
    assert.match(entry, /startKeepAlive\(\)/)
    assert.match(entry, /app\.get\('\/api\/health'/)

    const pkg = JSON.parse(readFileSync(join(workDir, 'package.json'), 'utf-8'))
    assert.ok(pkg.dependencies['@rafaelhdsv/keep-alive'])

    const envExample = readFileSync(join(workDir, '.env.example'), 'utf-8')
    assert.match(envExample, /KEEP_ALIVE_URL/)
  })

  it('é idempotente na segunda execução', () => {
    runInit({ cwd: workDir, entry: 'server/index.ts' })
    const entryAfterFirst = readFileSync(join(workDir, 'server/index.ts'), 'utf-8')

    const second = runInit({ cwd: workDir, entry: 'server/index.ts' })
    const entryAfterSecond = readFileSync(join(workDir, 'server/index.ts'), 'utf-8')

    assert.equal(second.entryChanged, false)
    assert.equal(second.packageJsonChanged, false)
    assert.equal(second.envExampleChanged, false)
    assert.equal(entryAfterFirst, entryAfterSecond)
  })

  it('falha com mensagem clara quando entry não existe', () => {
    assert.throws(
      () => runInit({ cwd: workDir, entry: 'server/missing.ts' }),
      /Arquivo não encontrado|Nenhum entry detectado/,
    )
  })

  it('detecta entry padrão server/index.ts', () => {
    const result = runInit({ cwd: workDir })
    assert.equal(result.entryPath, 'server/index.ts')
  })
})
