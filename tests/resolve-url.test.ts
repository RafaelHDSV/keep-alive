import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { resolveBaseUrl, resolveKeepAliveConfig } from '../src/resolve-url.js'

describe('resolveBaseUrl', () => {
  it('retorna null sem variáveis de ambiente', () => {
    assert.equal(resolveBaseUrl({}), null)
  })

  it('prioriza KEEP_ALIVE_URL sobre fallbacks Render', () => {
    const env = {
      KEEP_ALIVE_URL: 'https://custom.example.com/',
      RENDER_EXTERNAL_URL: 'https://render.example.com',
      RENDER_APP_URL: 'https://app.example.com',
    }
    assert.equal(resolveBaseUrl(env), 'https://custom.example.com')
  })

  it('usa RENDER_EXTERNAL_URL quando KEEP_ALIVE_URL ausente', () => {
    const env = {
      RENDER_EXTERNAL_URL: 'https://render.example.com/',
      RENDER_APP_URL: 'https://app.example.com',
    }
    assert.equal(resolveBaseUrl(env), 'https://render.example.com')
  })

  it('usa RENDER_APP_URL como último fallback', () => {
    const env = { RENDER_APP_URL: 'https://app.example.com/' }
    assert.equal(resolveBaseUrl(env), 'https://app.example.com')
  })

  it('ignora strings vazias após trim', () => {
    const env = { KEEP_ALIVE_URL: '   ', RENDER_EXTERNAL_URL: 'https://render.example.com' }
    assert.equal(resolveBaseUrl(env), 'https://render.example.com')
  })
})

describe('resolveKeepAliveConfig', () => {
  it('retorna null sem URL base', () => {
    assert.equal(resolveKeepAliveConfig({}, {}), null)
  })

  it('monta healthUrl com path default', () => {
    const config = resolveKeepAliveConfig({}, { KEEP_ALIVE_URL: 'https://app.example.com' })
    assert.deepEqual(config, {
      baseUrl: 'https://app.example.com',
      healthUrl: 'https://app.example.com/api/health',
      intervalMin: 10,
    })
  })

  it('respeita KEEP_ALIVE_PATH e KEEP_ALIVE_INTERVAL_MIN', () => {
    const config = resolveKeepAliveConfig(
      {},
      {
        KEEP_ALIVE_URL: 'https://app.example.com',
        KEEP_ALIVE_PATH: '/healthz',
        KEEP_ALIVE_INTERVAL_MIN: '5',
      },
    )
    assert.equal(config?.healthUrl, 'https://app.example.com/healthz')
    assert.equal(config?.intervalMin, 5)
  })

  it('aceita overrides via options', () => {
    const config = resolveKeepAliveConfig(
      { url: 'https://override.example.com', path: '/ping', intervalMin: 3 },
      {},
    )
    assert.equal(config?.healthUrl, 'https://override.example.com/ping')
    assert.equal(config?.intervalMin, 3)
  })

  it('usa default 10 quando intervalMin inválido', () => {
    const config = resolveKeepAliveConfig({}, {
      KEEP_ALIVE_URL: 'https://app.example.com',
      KEEP_ALIVE_INTERVAL_MIN: 'abc',
    })
    assert.equal(config?.intervalMin, 10)
  })
})
