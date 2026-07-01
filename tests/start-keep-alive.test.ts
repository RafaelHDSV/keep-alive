import { describe, it, mock, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { startKeepAlive } from '../src/start-keep-alive.js'

describe('startKeepAlive', () => {
  let warnCalls: unknown[][]

  beforeEach(() => {
    warnCalls = []
    mock.method(console, 'warn', (...args: unknown[]) => {
      warnCalls.push(args)
    })
  })

  afterEach(() => {
    mock.restoreAll()
  })

  it('não chama fetch quando nenhuma URL é resolvida', () => {
    let fetchCalled = false
    const fetchFn = (async () => {
      fetchCalled = true
      return new Response('ok')
    }) as typeof fetch

    startKeepAlive({ fetchFn })

    assert.equal(fetchCalled, false)
  })

  it('dispara fetch imediatamente e no intervalo configurado', async () => {
    const urls: string[] = []
    const fetchFn = (async (url: string | URL) => {
      urls.push(String(url))
      return new Response('ok', { status: 200 })
    }) as typeof fetch

    const intervals: Array<{ fn: () => void; ms: number }> = []
    const setIntervalFn = ((fn: () => void, ms?: number) => {
      intervals.push({ fn, ms: ms ?? 0 })
      return 1 as unknown as ReturnType<typeof setInterval>
    }) as typeof setInterval

    startKeepAlive({
      url: 'https://app.example.com',
      path: '/api/health',
      intervalMin: 10,
      fetchFn,
      setIntervalFn,
    })

    await new Promise((r) => setImmediate(r))
    assert.equal(urls.length, 1)
    assert.equal(urls[0], 'https://app.example.com/api/health')
    assert.equal(intervals.length, 1)
    assert.equal(intervals[0].ms, 10 * 60 * 1000)

    intervals[0].fn()
    await new Promise((r) => setImmediate(r))
    assert.equal(urls.length, 2)
  })

  it('emite console.warn em falha de fetch sem derrubar o processo', async () => {
    const fetchFn = (async () => {
      throw new Error('network down')
    }) as typeof fetch

    startKeepAlive({
      url: 'https://app.example.com',
      fetchFn,
      setIntervalFn: () => 1 as unknown as ReturnType<typeof setInterval>,
    })

    await new Promise((r) => setImmediate(r))
    assert.equal(warnCalls.length, 1)
    assert.match(String(warnCalls[0][0]), /falhou/)
  })

  it('emite console.warn em resposta HTTP não-ok', async () => {
    const fetchFn = (async () => new Response('fail', { status: 503 })) as typeof fetch

    startKeepAlive({
      url: 'https://app.example.com',
      fetchFn,
      setIntervalFn: () => 1 as unknown as ReturnType<typeof setInterval>,
    })

    await new Promise((r) => setImmediate(r))
    assert.equal(warnCalls.length, 1)
    assert.match(String(warnCalls[0][0]), /HTTP 503/)
  })
})
