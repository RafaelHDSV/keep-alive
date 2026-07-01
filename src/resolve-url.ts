import type { StartKeepAliveOptions } from './types.js'

const DEFAULT_PATH = '/api/health'
const DEFAULT_INTERVAL_MIN = 10

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, '')
}

export function resolveBaseUrl(env: NodeJS.ProcessEnv = process.env): string | null {
  const explicit = env.KEEP_ALIVE_URL?.trim()
  if (explicit) return stripTrailingSlash(explicit)

  const renderExternal = env.RENDER_EXTERNAL_URL?.trim()
  if (renderExternal) return stripTrailingSlash(renderExternal)

  const renderApp = env.RENDER_APP_URL?.trim()
  if (renderApp) return stripTrailingSlash(renderApp)

  return null
}

export function resolveKeepAliveConfig(
  options: StartKeepAliveOptions = {},
  env: NodeJS.ProcessEnv = process.env,
): { baseUrl: string; healthUrl: string; intervalMin: number } | null {
  const baseUrl = options.url?.trim()
    ? stripTrailingSlash(options.url.trim())
    : resolveBaseUrl(env)

  if (!baseUrl) return null

  const path = options.path ?? env.KEEP_ALIVE_PATH?.trim() ?? DEFAULT_PATH
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const healthUrl = `${baseUrl}${normalizedPath}`

  const intervalMin =
    options.intervalMin ?? (Number(env.KEEP_ALIVE_INTERVAL_MIN) || DEFAULT_INTERVAL_MIN)

  return { baseUrl, healthUrl, intervalMin }
}
