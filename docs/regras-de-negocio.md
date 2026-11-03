# Regras de negócio

> **Para que serve:** algoritmos e regras do domínio que a IA não deve reinventar
> **Fonte da verdade:** módulos de domínio no código
> **Relacionados:** [especificacao](especificacao.md) · [api](api.md) · [banco-de-dados](banco-de-dados.md)

## Regras

1. API pública: `startKeepAlive()` — não `startRenderKeepAlive`
2. Bin CLI: `keep-alive` → `npx @rafaelhdsv/keep-alive init`
3. URL: `KEEP_ALIVE_URL` → `RENDER_EXTERNAL_URL` → `RENDER_APP_URL` (strip `/` final)
4. Path default `/api/health`; intervalo default 10 min; timeout fetch 90s
5. No-op silencioso sem URL (dev local)
6. CLI v1: Express only; Fastify/Hono via lib manual
7. Patch por heurística regex (sem ts-morph na v1)
8. Migração Cronograma e demais consumidores: issue #2 (fora deste repo)

---
