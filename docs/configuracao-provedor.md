# Configuração — provedores de hospedagem

Como configurar variáveis de ambiente para `@rafaelhdsv/keep-alive` em cada provedor.

**Regra geral:** o pacote precisa de uma **URL pública HTTPS** apontando para o próprio app. Sem ela, `startKeepAlive()` é no-op (útil em dev local).

---

## Ordem de resolução

1. `KEEP_ALIVE_URL` — override manual (qualquer provedor)
2. `RENDER_EXTERNAL_URL` — Render (automática no deploy)
3. `RENDER_APP_URL` — fallback Render

Path e intervalo: `KEEP_ALIVE_PATH` (default `/api/health`), `KEEP_ALIVE_INTERVAL_MIN` (default `10`).

---

## Render

| Item | Valor |
|------|-------|
| URL | Automática via `RENDER_EXTERNAL_URL` — **não** precisa definir `KEEP_ALIVE_URL` |
| Health Check Path | No painel: **Settings → Health Check Path** = `/api/health` (ou seu path) |
| Intervalo | Default 10 min (&lt; 15 min de idle do Free tier) |

**Logs esperados após deploy:**

```
[keep-alive] ativo: https://seu-app.onrender.com/api/health a cada 10 min
```

**Limitação:** se a instância já hibernou, o self-ping interno não a acorda — o health check do Render ou tráfego externo reativa.

---

## Railway

| Variável | Exemplo |
|----------|---------|
| `KEEP_ALIVE_URL` | `https://seu-app.up.railway.app` |

Railway não define `RENDER_*`. Use `KEEP_ALIVE_URL` com a URL pública do serviço (Settings → Networking → Public domain).

Opcional no painel: health check apontando para o mesmo path (`/api/health`).

---

## Fly.io

| Variável | Exemplo |
|----------|---------|
| `KEEP_ALIVE_URL` | `https://seu-app.fly.dev` |

Configure no `fly.toml` ou secrets:

```bash
fly secrets set KEEP_ALIVE_URL=https://seu-app.fly.dev
```

---

## Outros provedores (Vercel serverless, etc.)

Self-ping contínuo aplica-se a **processos long-lived** (Web Service). Em serverless sem processo persistente, use ping externo (cron, UptimeRobot) em vez deste pacote.

Para VPS, Docker ou PaaS genérico:

```env
KEEP_ALIVE_URL=https://api.seudominio.com
KEEP_ALIVE_PATH=/api/health
KEEP_ALIVE_INTERVAL_MIN=10
```

---

## Checklist pós-configuração

- [ ] Rota GET no path configurado responde 200 sem consultar banco
- [ ] URL pública acessível de fora (HTTPS)
- [ ] Log `[keep-alive] ativo` aparece após `app.listen`
- [ ] Intervalo &lt; janela de idle do provedor (ex.: &lt; 15 min no Render Free)

---

## Referência

- README — limitações e diferencial vs ping externo
- `templates/env.example.snippet.txt` — vars comentadas para `.env.example`
