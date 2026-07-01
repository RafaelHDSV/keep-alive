import { resolveKeepAliveConfig } from './resolve-url.js'
import type { StartKeepAliveOptions } from './types.js'

async function ping(url: string, fetchFn: typeof fetch): Promise<void> {
  const res = await fetchFn(url, { signal: AbortSignal.timeout(90_000) })
  if (!res.ok) {
    console.warn(`[keep-alive] ${url} → HTTP ${res.status}`)
  }
}

export function startKeepAlive(options?: StartKeepAliveOptions): void {
  const config = resolveKeepAliveConfig(options)
  if (!config) return

  const { healthUrl, intervalMin } = config
  const fetchFn = options?.fetchFn ?? fetch
  const setIntervalFn = options?.setIntervalFn ?? setInterval
  const intervalMs = intervalMin * 60 * 1000

  const tick = async () => {
    try {
      await ping(healthUrl, fetchFn)
    } catch (err) {
      console.warn('[keep-alive] falhou', err)
    }
  }

  console.log(`[keep-alive] ativo: ${healthUrl} a cada ${intervalMin} min`)

  void tick()
  setIntervalFn(() => void tick(), intervalMs)
}
