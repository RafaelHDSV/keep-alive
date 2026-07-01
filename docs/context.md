# @rafaelhdsv/keep-alive — contexto do projeto

> Contexto primário para assistentes de IA (regra `ai-context.mdc`).

**Pacote:** `@rafaelhdsv/keep-alive` | **Ano:** 2026

---

## Objetivo

Biblioteca npm com `startKeepAlive()` para self-ping periódico em Web Services Node que hibernam por inatividade (Render, Railway, Fly.io, etc.), mais CLI `keep-alive init` para adoção rápida em projetos Express. Produto genérico — Render é exemplo comum, não único alvo.

---

## Stack

| Camada | Tecnologia / nota |
|--------|-------------------|
| Runtime | Node ≥ 18 (`fetch` nativo); repo usa Node 22 (`.nvmrc`) |
| Linguagem | TypeScript strict, ESM |
| Build | tsup → `dist/index.js`, `dist/cli/index.js`, `.d.ts` |
| CLI | commander (devDependency) |
| Testes | `node:test` + `node:assert` + tsx |
| Package manager | Yarn Classic v1 — lockfile commitado |
| Publicação | npm público, escopo `@rafaelhdsv` |

**Zero dependências de runtime** no `package.json`.

---

## Decisões fixas

1. API pública: `startKeepAlive()` — não `startRenderKeepAlive`
2. Bin CLI: `keep-alive` → `npx @rafaelhdsv/keep-alive init`
3. URL: `KEEP_ALIVE_URL` → `RENDER_EXTERNAL_URL` → `RENDER_APP_URL` (strip `/` final)
4. Path default `/api/health`; intervalo default 10 min; timeout fetch 90s
5. No-op silencioso sem URL (dev local)
6. CLI v1: Express only; Fastify/Hono via lib manual
7. Patch por heurística regex (sem ts-morph na v1)
8. Migração Cronograma e demais consumidores: issue #2 (fora deste repo)

---

## Links

| Tipo | URL |
|------|-----|
| Repositório | https://github.com/RafaelHDSV/keep-alive |
| Epic | https://github.com/RafaelHDSV/keep-alive/issues/1 |
| Migração consumidores | https://github.com/RafaelHDSV/keep-alive/issues/2 |
| Referência original | https://github.com/RafaelHDSV/Cronograma-de-Gravacoes — `server/keepAlive.ts` |
| Especificação | `docs/especificacao.md` |
| Config npm | `docs/configuracao-npm.md` |
| Config provedor | `docs/configuracao-provedor.md` |

---

## Fora de escopo (v1)

- Publicação automática no npm (documentada, execução manual)
- Plugin Vieira CLI
- CLI para Fastify/Hono
- Dogfooding Cronograma (issue #2)
- GitHub Actions de keep-alive nos consumidores

---

*Atualizado na implementação das fases 1–2 (2026-07-01).*
