# @rafaelhdsv/keep-alive — especificação do projeto

> Guia de produto e entrega deste repositório. Complementa **`docs/context.md`**.

**Ano:** 2026 · **Versão inicial:** 1.0.0

---

## Objetivo

Reduzir cold starts em Web Services Node hospedados em planos com hibernação por inatividade, via self-ping interno leve. Público-alvo: desenvolvedores que deployam Express (ou Node genérico) em Render Free, Railway, Fly.io e similares.

---

## Stack

- **Runtime:** Node ≥ 18, ESM
- **Build:** tsup, TypeScript strict
- **CLI:** commander (devDep)
- **Testes:** node:test
- **Tooling:** Yarn Classic v1, Node 22

---

## Setup e comandos locais

```bash
yarn          # instalar dependências
yarn build    # dist/ + declarações
yarn test     # testes unitários e fixture CLI
```

---

## Decisões registradas

| # | Tema | Decisão |
|---|------|---------|
| 1 | Registry | npm público |
| 2 | Nome | `@rafaelhdsv/keep-alive` |
| 3 | API | `startKeepAlive()` |
| 4 | Escopo produto | Genérico (idle/hibernação), Render como exemplo |
| 5 | URL v1 | KEEP_ALIVE_URL → RENDER_* fallbacks |
| 6 | CLI v1 | Express only; init idempotente |
| 7 | Runtime deps | Zero |
| 8 | PM repo | Yarn Classic v1 |

---

## Epic / issue GitHub

| Item | Link |
|------|------|
| Epic principal | https://github.com/RafaelHDSV/keep-alive/issues/1 |
| Migração projetos | https://github.com/RafaelHDSV/keep-alive/issues/2 |
| Proposta implementação | `.issues/2026-07-01-render-keep-alive.md` |

---

## Roadmap

| Fase | Escopo | Status |
|------|--------|--------|
| 1 | Lib `startKeepAlive` + testes | Concluída |
| 2 | CLI `init` + fixture Express | Concluída |
| Docs | README, context, config guides | Concluída |
| 3 | `npm publish` + migração Cronograma (#2) | Pendente |
| 4 | Polimento (Fastify/Hono docs, semver) | Parcial (nota manual no README) |

---

## Fora de escopo

- Static Site, cron externo embutido
- Métricas/alertas na v1
- AST-based patch (ts-morph)

---

## Relação com outros docs

| Arquivo | Uso |
|---------|-----|
| `docs/context.md` | Contexto para IA |
| `docs/configuracao-npm.md` | Publicar no npm |
| `docs/configuracao-provedor.md` | Variáveis por provedor |
| `docs/configuracao-desenvolvimento.md` | Setup local Yarn/Node |

---

*Implementação fases 1–2 aprovada em 2026-07-01.*
