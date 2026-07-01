# @rafaelhdsv/keep-alive

Self-ping periódico para **Web Services Node** que hibernam por inatividade (Render Free, Railway, Fly.io e similares). Zero dependências de runtime — usa `fetch` nativo do Node 18+.

## Problema

Provedores com política de idle (ex.: Render ~15 min sem tráfego) colocam a instância em hibernação. O próximo request paga cold start prolongado. Um ping interno leve, enquanto o processo Node estiver ativo, mantém a instância acordada.

## Instalação

### Opção A — CLI (Express)

```bash
npx @rafaelhdsv/keep-alive init
```

O comando:

1. Detecta o entry (`server/index.ts` ou script `start` do `package.json`)
2. Adiciona `@rafaelhdsv/keep-alive` às dependências
3. Injeta `import` + `startKeepAlive()` no callback de `app.listen`
4. Cria rota GET mínima em `/api/health` se ausente
5. Acrescenta variáveis comentadas em `.env.example`

Opções:

```bash
npx @rafaelhdsv/keep-alive init --help
npx @rafaelhdsv/keep-alive init --path /api/health --entry server/index.ts
```

Segunda execução é **idempotente** — não duplica código.

### Opção B — Uso manual

```bash
yarn add @rafaelhdsv/keep-alive
```

```ts
import { startKeepAlive } from '@rafaelhdsv/keep-alive'

app.listen(PORT, () => {
  console.log(`Server on port ${PORT}`)
  startKeepAlive()
})
```

Garanta uma rota de health **leve** (sem consulta a banco) no path configurado.

## Variáveis de ambiente

| Variável | Default | Descrição |
|----------|---------|-----------|
| `KEEP_ALIVE_URL` | — | URL base pública do app (override; use em qualquer provedor) |
| `RENDER_EXTERNAL_URL` | — | URL pública no Render (definida automaticamente no deploy) |
| `RENDER_APP_URL` | — | Fallback Render |
| `KEEP_ALIVE_PATH` | `/api/health` | Caminho do ping |
| `KEEP_ALIVE_INTERVAL_MIN` | `10` | Intervalo em minutos (recomendado &lt; 15) |

**Ordem de resolução da URL:** `KEEP_ALIVE_URL` → `RENDER_EXTERNAL_URL` → `RENDER_APP_URL` (barra final removida).

Sem URL resolvida (ex.: dev local) → **no-op silencioso**.

## Exemplo — Render

1. `npx @rafaelhdsv/keep-alive init`
2. No painel Render, configure **Health Check Path** = `/api/health` (ou o path usado)
3. Deploy — nos logs: `[keep-alive] ativo: https://seu-app.onrender.com/api/health a cada 10 min`

Render define `RENDER_EXTERNAL_URL` automaticamente; em outros provedores use `KEEP_ALIVE_URL`. Veja [docs/configuracao-provedor.md](./docs/configuracao-provedor.md).

## Por que self-ping interno

| Abordagem | Prós | Contras |
|-----------|------|---------|
| **Self-ping (este pacote)** | Sem serviço externo, sem cron, sem GitHub Actions; mesmo processo que já está no ar | Só funciona enquanto o processo está ativo |
| UptimeRobot / cron externo | Acorda instância já hibernada | Serviço extra, latência, configuração separada |
| GitHub Actions schedule | Gratuito em repos públicos | Workflow redundante se o app já está no ar; não substitui health do provedor |

## Limitações

- **Self-ping não acorda instância já hibernada.** Se o processo morreu ou a instância dormiu, só tráfego externo (usuário, UptimeRobot, health check do provedor) a reativa.
- É um **workaround para idle**, não substituto de plano pago ou SLA.
- Políticas de provedores podem mudar; monitore changelogs (ex.: Render Free).
- Na v1, o CLI `init` suporta apenas **Express**. Fastify, Hono e outros: use a lib manualmente após `listen`.

## Boas práticas — rota de health

- Responda rápido: `{ ok: true }` ou status 200 sem I/O pesado.
- **Não** consulte banco na rota usada pelo keep-alive — migrações de projetos existentes devem revisar a health manualmente.
- O `init` injeta rota mínima apenas se o path estiver ausente.

## Fastify / Hono (manual)

```ts
import { startKeepAlive } from '@rafaelhdsv/keep-alive'

// Após o servidor estar ouvindo:
startKeepAlive()
```

Registre a rota equivalente no framework e configure `KEEP_ALIVE_PATH` se necessário.

## API

```ts
import {
  startKeepAlive,
  resolveBaseUrl,
  resolveKeepAliveConfig,
  type StartKeepAliveOptions,
} from '@rafaelhdsv/keep-alive'

startKeepAlive({
  url: 'https://example.com',      // opcional
  path: '/api/health',              // opcional
  intervalMin: 10,                  // opcional
})
```

## Desenvolvimento

```bash
yarn
yarn build
yarn test
```

Guia local: [docs/configuracao-desenvolvimento.md](./docs/configuracao-desenvolvimento.md).

## Publicação npm

[docs/configuracao-npm.md](./docs/configuracao-npm.md)

## Licença

MIT © 2026 Rafael Vieira — veja [LICENSE](./LICENSE).
