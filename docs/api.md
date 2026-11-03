# API

> **Para que serve:** rotas HTTP, CLI I/O, códigos de erro e contratos
> **Fonte da verdade:** handlers / routers / entrypoints CLI
> **Relacionados:** [arquitetura](arquitetura.md) · [banco-de-dados](banco-de-dados.md) · [seguranca](seguranca.md)

## Convenções

- Prefixo / entrypoint: ver código (`/api`, `/v1`, binário CLI, etc.)
- Auth: ver [seguranca](seguranca.md)

## Superfície

```ts
import {
  startKeepAlive,
  resolveBaseUrl,
  resolveKeepAliveConfig,
  type StartKeepAliveOptions,
} from '@rafaelhdsv/keep-alive'

// Uso típico — lê env
startKeepAlive()

// Override explícito (testes ou casos especiais)
startKeepAlive({
  url: 'https://example.com',
  path: '/api/health',
  intervalMin: 10,
})

// Inspeção sem iniciar ping
resolveBaseUrl()           // string | null
resolveKeepAliveConfig()   // { baseUrl, healthUrl, intervalMin } | null
```

Comportamento em falha de rede: `console.warn` — **não** derruba o processo. Timeout do fetch: **90s** (tolera cold start pós-deploy).

---

| Método / comando | Caminho | Auth | Nota |
|---|---|---|---|
| | | | Preencher a partir do código |
