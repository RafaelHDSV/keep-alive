export interface StartKeepAliveOptions {
  /** Override de KEEP_ALIVE_URL e fallbacks de plataforma */
  url?: string
  /** Default: process.env.KEEP_ALIVE_PATH ?? '/api/health' */
  path?: string
  /** Default: Number(process.env.KEEP_ALIVE_INTERVAL_MIN) || 10 */
  intervalMin?: number
  /** Para testes: substitui fetch global */
  fetchFn?: typeof fetch
  /** Para testes: substitui setInterval */
  setIntervalFn?: typeof setInterval
}
