# Proposta de implementação — keep-alive (pacote npm + CLI init)

**Referência:** [Issue #1 — epic](https://github.com/RafaelHDSV/keep-alive/issues/1) · [Issue #2 — migração de projetos](https://github.com/RafaelHDSV/keep-alive/issues/2)  
**Repositório:** `RafaelHDSV/keep-alive` (scaffold Vieira; código ainda não iniciado)  
**Data:** 2026-07-01 · **Atualizado:** 2026-07-01 (decisões do Rafael)

---

## 1. Resumo executivo

Implementar o pacote npm **`@rafaelhdsv/keep-alive`**: biblioteca com `startKeepAlive()` para self-ping periódico em **qualquer Web Service Node que hiberne por inatividade** (Render Free, Railway, Fly.io, etc.), mais CLI `keep-alive init` (`npx @rafaelhdsv/keep-alive init`) para adoção em um passo em projetos Express.

---

## 2. Contexto e referências

| Item | Link / nota |
|------|-------------|
| Epic GitHub | https://github.com/RafaelHDSV/keep-alive/issues/1 |
| Implementação de referência | https://github.com/RafaelHDSV/Cronograma-de-Gravacoes — `server/keepAlive.ts`, `server/index.ts` |
| Deploy Render (referência) | https://github.com/RafaelHDSV/Cronograma-de-Gravacoes — `docs/deploy-render.md` |
| Repositório atual | Scaffold Vieira (`docs/context.md`, `docs/especificacao.md` vazios); sem `package.json` |
| Node | `.nvmrc` → v22 |
| npm — pacote publicado | **`@rafaelhdsv/keep-alive`** (decisão #6A) |
| npm — `keep-alive` unscoped | Ocupado por [cmilhench/keep-alive](https://www.npmjs.com/package/keep-alive) |
| Sub-issue migração | https://github.com/RafaelHDSV/keep-alive/issues/2 (assignee: RafaelHDSV, project Vieira) |

---

## 3. Regras de negócio

Extraídas da issue #1 e do código de referência — sem invenção.

1. **Problema:** serviços em planos gratuitos / com política de idle (ex.: Render ~15 min, outros provedores com comportamento similar) hibernam sem tráfego; self-ping interno evita cold start prolongado **enquanto o processo Node estiver ativo** (não acorda instância já dormindo).
2. **Escopo v1:** apenas **Web Service Node** (Express no CLI `init`); Static Site, Fastify/Hono no CLI e plugin Vieira ficam fora.
3. **Zero dependências de runtime** — usar `fetch` nativo (Node ≥ 18).
4. **No-op em dev local:** sem URL pública resolvida → função retorna sem efeito (silencioso).
5. **Resolução de URL base** (ordem de precedência v1): `KEEP_ALIVE_URL` → `RENDER_EXTERNAL_URL` → `RENDER_APP_URL` (fallbacks Render mantidos por compatibilidade com código existente; outros provedores via `KEEP_ALIVE_URL` ou expansão futura — ver dúvida #7).
6. **Path do ping:** `KEEP_ALIVE_PATH` (default `/api/health`); configurável via options e CLI `--path`.
7. **Intervalo:** `KEEP_ALIVE_INTERVAL_MIN` (default **10**; recomendado &lt; 15 min).
8. **Timeout de fetch:** 90s (cold start pós-deploy).
9. **Logging:** sucesso de ativação → `[keep-alive] ativo: {url} a cada {n} min`; falhas → `console.warn`, sem derrubar o processo.
10. **Health leve:** rota de ping não deve consultar banco; `init` injeta snippet mínimo (`{ ok: true }`) se rota ausente.
11. **CLI idempotente:** segunda execução de `init` não duplica import, chamada nem rota.
12. **CLI Express:** detectar entry (`server/index.ts` ou script `start` no `package.json`); estrutura não-Express → erro claro.
13. **Sem GitHub Actions** de keep-alive nos consumidores — self-ping interno substitui workflows redundantes.
14. **Opção C:** lib + CLI no mesmo repo e mesma versão semver.
15. **Dogfooding:** migrar Cronograma para o pacote e remover `server/keepAlive.ts` (critério de aceite da epic; repo separado).

---

## 4. Critérios de aceitação

### Lib

- [x] Zero deps de runtime no `package.json` (`dependencies` vazio ou ausente)
- [x] `startKeepAlive()` retorna sem efeito quando nenhuma URL é resolvida
- [x] Com `KEEP_ALIVE_URL` mock, ping dispara no intervalo configurado (teste unitário com timers fake ou injeção)
- [x] Tipos TypeScript exportados (`StartKeepAliveOptions`, etc.)
- [x] `KEEP_ALIVE_PATH` respeitado (melhoria vs referência Cronograma)

### CLI

- [x] `npx keep-alive init` funciona em fixture Express tipo Vieira/Cronograma
- [x] `npx keep-alive init --path /api/health --entry server/index.ts`
- [x] Segunda execução não altera arquivos (idempotência)
- [x] `--help` documentado
- [x] Entry não encontrado → mensagem clara + sugestão `--entry`

### Docs

- [x] README: instalação (`yarn add @rafaelhdsv/keep-alive`) vs `npx @rafaelhdsv/keep-alive init`, tabela de env vars, Render como exemplo (não único alvo)
- [x] README: limitações — self-ping não acorda instância já dormida; workaround idle, não substituto de plano pago
- [x] README: diferencial vs UptimeRobot / Cron-job / GitHub Actions (sem serviço externo)
- [x] README: exemplo health sem DB; aviso sobre health pesada em migrações
- [x] `docs/context.md` e `docs/especificacao.md` atualizados com stack e link da epic

### Dogfooding (fase 3 — repo Cronograma)

- [ ] Cronograma usa pacote em produção
- [ ] `server/keepAlive.ts` removido
- [ ] Deploy Render com log `[keep-alive] ativo`

### Geral

- [x] `yarn build` e `yarn test` passam localmente
- [x] Sem GitHub Actions de keep-alive neste pacote nem obrigatórios nos consumidores

---

## 5. Análise do código existente

| Local | Estado | Uso na implementação |
|-------|--------|----------------------|
| `keep-alive/` (este repo) | Scaffold Vieira apenas — README, LICENSE, `.cursor/`, templates de issue | Base do novo pacote; **criar** toda estrutura `src/`, `package.json`, testes |
| `Cronograma-de-Gravacoes/server/keepAlive.ts` | ~45 linhas, `startKeepAlive()`, path fixo `/api/health` | **Referência direta** para `resolve-url` e loop de ping; manter `startKeepAlive` como API pública |
| `Cronograma-de-Gravacoes/server/index.ts` | `app.get('/api/health', ...)`, `startKeepAlive()` após `listen` | Modelo para detecção CLI e snippet de health |
| `docs/context.md`, `docs/especificacao.md` | Placeholders Vieira | **Alterar** após implementação |

**Justificativa:** não há código reutilizável neste repo; a extração parte do Cronograma validado em produção. Não recriar padrões divergentes — manter mesma semântica de env, logs e timeout.

---

## 6. Arquitetura proposta

```
Consumidor Express                    Pacote keep-alive
─────────────────────                 ──────────────────
app.listen(PORT, () => {    ───────►  startKeepAlive()
  startKeepAlive()                    │
})                                    ├─ resolveBaseUrl(env + options)
                                      │     └─ null → return (dev)
                                      ├─ healthUrl = base + path
                                      ├─ tick() imediato
                                      └─ setInterval(tick, intervalMin)

CLI init
────────
detect entry → read package.json → patch dependencies
              → inject import + call após app.listen (AST/string heurística)
              → inject health route se ausente no path
              → append .env.example snippet
```

**Camadas:** CLI (devDep `commander`) → filesystem; Lib (runtime puro) → `process.env` + `fetch`; sem UI, API HTTP própria, DB ou fila.

**Build:** `tsup` gera `dist/index.js` (ESM) + `dist/cli.js` (bin) + `.d.ts`.

---

## 7. Mudanças por arquivo

| Arquivo | Tipo | Descrição da mudança | Tamanho estimado |
|---------|------|----------------------|------------------|
| `package.json` | criar | Nome `@rafaelhdsv/keep-alive`, bin `keep-alive`, **Yarn Classic** | M |
| `tsconfig.json` | criar | Strict, ESM, declarações | P |
| `tsup.config.ts` | criar | Entry `src/index.ts` + `src/cli/index.ts` | P |
| `src/index.ts` | criar | Reexport `startRenderKeepAlive` | P |
| `src/start-keep-alive.ts` | criar | Loop de ping (extraído do Cronograma + options) | M |
| `src/resolve-url.ts` | criar | Resolução de URL + path + intervalo | P |
| `src/types.ts` | criar | `StartRenderKeepAliveOptions` | P |
| `src/cli/index.ts` | criar | Entry bin, commander, comando `init` | M |
| `src/cli/init.ts` | criar | Orquestração do init | G |
| `src/cli/detect.ts` | criar | Detecção entry Express, rota health existente | M |
| `src/cli/patch-entry.ts` | criar | Injeção idempotente import + listen callback | M |
| `src/cli/patch-env-example.ts` | criar | Snippet em `.env.example` | P |
| `templates/health-route.express.ts.txt` | criar | Snippet GET health leve | P |
| `templates/env.example.snippet.txt` | criar | Vars comentadas | P |
| `tests/resolve-url.test.ts` | criar | Precedência env, trim, path default | M |
| `tests/start-keep-alive.test.ts` | criar | No-op sem URL; mock fetch | M |
| `yarn.lock` | criar | Lockfile Yarn Classic (commitado; não publicado no npm) | G |
| `tests/fixtures/express-minimal/` | criar | Projeto fake para teste do init | M |
| `tests/init.fixture.test.ts` | criar | Snapshot/diff do init + idempotência | M |
| `README.md` | alterar | Documentação completa do pacote | G |
| `docs/context.md` | alterar | Stack, objetivo, decisões | M |
| `docs/especificacao.md` | alterar | Link epic, escopo, roadmap | M |
| `CHANGELOG.md` | criar | v1.0.0 inicial | P |
| `.gitignore` | criar | `node_modules`, `dist` | P |

**Fora deste repo (fase 3):** alterações em `Cronograma-de-Gravacoes` — issue/PR separado.

---

## 8. Contratos e tipos

```ts
// src/types.ts
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

export function startKeepAlive(options?: StartKeepAliveOptions): void

export function resolveBaseUrl(env?: NodeJS.ProcessEnv): string | null

export function resolveKeepAliveConfig(
  options?: StartKeepAliveOptions,
  env?: NodeJS.ProcessEnv
): { baseUrl: string; healthUrl: string; intervalMin: number } | null
```

**CLI:**

```bash
keep-alive init [--path <path>] [--entry <file>] [--dry-run]  # dry-run: pós-v1; não v1
```

**Snippet health (template):**

```ts
app.get('{{PATH}}', (_req, res) => {
  res.status(200).json({ ok: true })
})
```

**Env vars documentadas:**

| Variável | Default | Papel |
|----------|---------|-------|
| `KEEP_ALIVE_URL` | — | Override da URL base |
| `RENDER_EXTERNAL_URL` | Render | URL pública (preferida no Render) |
| `RENDER_APP_URL` | Render | Fallback |
| `KEEP_ALIVE_PATH` | `/api/health` | Caminho do ping |
| `KEEP_ALIVE_INTERVAL_MIN` | `10` | Intervalo em minutos |

---

## 9. Impactos colaterais e dependências

| Área | Impacto |
|------|---------|
| **Cronograma-de-Gravacoes** | Fase 3: trocar import, remover `keepAlive.ts`, atualizar `docs/deploy-render.md` |
| **Projetos Vieira/AGX Express** | Adoção via `npx keep-alive init` ou import manual |
| **npm registry** | Publicação necessária antes do dogfooding via `yarn add <nome-final>` |
| **Issue #2** | Migração Cronograma e demais repos — fora do escopo imediato de código |
| **Nome `keep-alive` no npm** | Ocupado — decisão de nome alternativo pendente (dúvida #6) |
| **Render Free** | Política pode mudar; documentar no README |
| **Permissões / feature flags** | Não se aplica |
| **HML / prod** | Comportamento idêntico; ativo só quando URL Render presente |

---

## 10. Plano de execução em etapas

Ordem incremental para revisão em PRs/commits lógicos:

1. **Scaffold do pacote** — `package.json`, `tsconfig`, `tsup`, `.gitignore`, estrutura `src/`
2. **Fase 1 — Lib** — `resolve-url.ts`, `startKeepAlive()`, testes unitários
3. **README inicial (lib)** — vars, uso manual, limitações
4. **Fase 2 — CLI** — `detect`, `init`, templates, testes fixture + idempotência
5. **Docs do repo** — `context.md`, `especificacao.md`, `CHANGELOG.md`
6. **Fase 3 — Publicação** — `npm publish` (npm público) + execução da issue #2
7. **Fase 4 — Polimento** — nota Fastify/Hono manual no README, revisão semver

**Estimativa:** 5–7 dias (conforme epic); fases 1–2 neste repo ≈ 3–4 dias.

---

## 11. Riscos, trade-offs e alternativas consideradas

| Risco / decisão | Mitigação / escolha |
|-----------------|---------------------|
| Render proibir keep-alive no Free | README honesto; monitorar changelog |
| CLI quebra Prettier/Biome | Injeção mínima; testes com fixture; evitar reformatar arquivo inteiro |
| Patch por string vs AST | **v1:** heurística por regex/localização de `app.listen` (como projetos Vieira são previsíveis); AST (`ts-morph`) descartado na v1 por complexidade e devDep pesada |
| `tsup` vs `tsc` | **tsup** — bundle bin CLI, declarações, DX |
| `commander` vs `cac` | **commander** — `--help` maduro; devDep apenas |
| `node:test` vs vitest | **node:test** — zero deps extras, Node 22 nativo |
| Nome npm ocupado (`keep-alive`) | Usar `render-keep-alive` (disponível) |
| Repo `keep-alive` vs npm `keep-alive` | Nome desejado pelo produto, mas **conflito no registry** — ver dúvida #6 |
| Yarn vs npm no repo da lib | **Yarn Classic (v1)** — alinhado ao fluxo do Rafael; lockfile commitado; npm continua sendo o registry de publicação |

---

## 12. Plano de testes

| Tipo | Cenário |
|------|---------|
| **Unit** | `resolveBaseUrl`: precedência `KEEP_ALIVE_URL` > `RENDER_EXTERNAL_URL` > `RENDER_APP_URL`; trim de `/`; null sem vars |
| **Unit** | `resolveKeepAliveConfig`: path default e override; intervalMin default 10 e inválido |
| **Unit** | `startKeepAlive`: sem URL → fetch não chamado; com URL → fetch no tick inicial + intervalo (mock) |
| **Unit** | Falha de fetch → `console.warn`, processo continua |
| **Integration CLI** | Fixture `express-minimal/`: após `init`, entry contém import e `startKeepAlive()` |
| **Integration CLI** | Segundo `init` → diff vazio |
| **Integration CLI** | Entry inexistente → exit code ≠ 0, mensagem com `--entry` |
| **Manual** | `yarn build && node dist/cli.js init` em cópia local do Cronograma (dry-run mental) |
| **Manual (fase 3)** | Deploy Render Cronograma; log `[keep-alive] ativo` |

**Dados de teste:** env vars mockadas; fixture Express mínima com `app.listen(PORT, () => {})`.

---

## 13. Observabilidade e rollback

| Item | Abordagem |
|------|-----------|
| **Logs** | `console.log` na ativação; `console.warn` em falhas — suficiente para Render logs |
| **Métricas / alertas** | Não se aplica na v1 |
| **Rollback** | Consumidor remove import e dep; ou fix semver anterior no `package.json` |
| **Feature toggle** | Ausência de URL Render funciona como toggle off em dev |
| **Publicação npm** | `npm unpublish` evitado; preferir patch semver para correções |

---

## 14. Dúvidas em aberto

### Decisões registradas (2026-07-01)

| # | Tema | Decisão do Rafael |
|---|------|-------------------|
| 1 | Registry | **(A) npm público** |
| 2 | Nome / escopo do produto | **Genérico** — não amarrado ao Render; repo `keep-alive` ok |
| 3 | Escopo de implementação | **Fases 1–2 + docs** neste repo; migração de projetos na **issue #2** |
| 4 | Package manager | **Yarn Classic (v1)** — fluxo habitual do Rafael; lockfile commitado (padrão de mercado para libs OSS: um gerenciador + lock no repo; consumidor usa `yarn`/`npm`/`pnpm` à vontade) |
| 5 | API pública | **`startKeepAlive()`** — sem prefixo Render |
| 6 | Nome npm | **`@rafaelhdsv/keep-alive`** (escopo RafaelHDSV) |
| 7 | Fallbacks URL v1 | **(A)** `KEEP_ALIVE_URL` → `RENDER_EXTERNAL_URL` → `RENDER_APP_URL`; demais provedores via `KEEP_ALIVE_URL` + README |
| 8 | Epic #1 | **Renomeada** — título alinhado ao produto genérico |

### Apontamentos de documentação (registrados)

| # | Tema | Tratamento na entrega |
|---|------|------------------------|
| 1 | Self-ping não acorda instância já hibernada | README — seção **Limitações** |
| 2 | Render é exemplo comum, não único alvo | README + docs; linguagem genérica “idle/hibernação” |
| 3 | Diferencial vs ping externo (UptimeRobot, GH Actions) | README — seção **Por que self-ping interno** |
| 4 | Health pesada em projetos existentes | `init` injeta rota mínima; migração (#2) revisa health manualmente |
| 5 | CLI Express-only na v1 | Mantido; Fastify/Hono via lib manual no README |

### Dúvidas resolvidas — sem pendências bloqueantes

Todas as dúvidas #1–#8 foram respondidas em 2026-07-01.

---

## 15. Aprovação

**Status:** implementado (fases 1–2 + docs, 2026-07-01).

**Sub-issue:** [#2 — Migrar projetos existentes](https://github.com/RafaelHDSV/keep-alive/issues/2) (assignee: RafaelHDSV, project Vieira).

**Epic #1:** título atualizado para refletir escopo genérico e pacote `@rafaelhdsv/keep-alive`.
