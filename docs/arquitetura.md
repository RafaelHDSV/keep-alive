# Arquitetura

> **Para que serve:** estrutura do repositório, ciclo de request e fronteiras de empacotamento/deploy
> **Fonte da verdade:** layout de pastas, entrypoints, `vercel.json` / scripts de build
> **Relacionados:** [context](context.md) · [api](api.md) · [ambiente-e-operacao](ambiente-e-operacao.md)

## Visão

Depois de `app.listen`, o pacote faz um `GET` periódico na rota de health **do próprio app**, usando a URL pública configurada. Isso gera tráfego HTTP interno e mantém a instância dentro da janela de atividade do provedor.

```
app.listen() → startKeepAlive()
                 ├─ resolve URL pública (env)
                 ├─ sem URL? → no-op (dev local)
                 └─ a cada N min: GET https://seu-app/.../api/health
```

**Log esperado em produção:**

```
[keep-alive] ativo: https://seu-app.onrender.com/api/health a cada 10 min
```

---

## Fronteiras

| Fronteira | Nota |
|---|---|
| App vs docs | `docs/` é contrato de living docs (board#7), não runtime |
| Segredos | Só `.env` / painel do provedor — nunca no Git |

Dependências declaradas em `package.json` (amostra): @types/node, commander, tsup, tsx, typescript.
