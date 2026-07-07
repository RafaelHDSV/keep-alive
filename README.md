[![NPM](https://nodei.co/npm/@rafaelhdsv/keep-alive.svg?data=d,s)](https://nodei.co/npm/@rafaelhdsv/keep-alive/)

# @rafaelhdsv/keep-alive

Self-ping periódico para **Web Services Node** com processo long-lived que hibernam por inatividade (Render Free, Railway, Fly.io e similares). Zero dependências de runtime — usa `fetch` nativo do Node 18+.

---

## Para quem é (e para quem não é)

| Cenário | Este pacote ajuda? |
|---------|------------------|
| API Express/Node em PaaS com idle (~15 min sem tráfego) | **Sim** |
| App já no ar e você quer evitar hibernação **enquanto o processo roda** | **Sim** |
| Static Site, serverless sem processo persistente | **Não** — use ping externo (UptimeRobot, cron) |
| Acordar instância **já hibernada** sem tráfego externo | **Não** — self-ping só funciona com processo ativo |
| Substituir plano pago / SLA garantido | **Não** — é workaround para idle, não produto de disponibilidade |

---

## Como funciona (em 30 segundos)

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

## Qual opção escolher?

Há duas formas de adotar o pacote. A escolha depende do seu projeto, não da “qualidade” da solução — ambas usam a mesma lib por baixo.

### Comparativo rápido

| Critério | **Opção A — CLI `init`** | **Opção B — Manual** |
|----------|--------------------------|----------------------|
| Framework | Express | Qualquer (Express, Fastify, Hono, etc.) |
| Tempo de adoção | ~1 comando | ~5 minutos copiando código |
| Controle do diff | Automático (edita arquivos) | Total — você decide onde injetar |
| Rota health | Cria se não existir no path | Você garante a rota |
| `.env.example` | Atualiza com vars comentadas | Você documenta as vars |
| Rodar de novo | Idempotente (não duplica) | N/A |
| Quando preferir | Projeto novo ou Express padrão | Framework diferente, health customizada, ou diff mínimo revisado à mão |

### Escolha a Opção A (`init`) se…

- O servidor é **Express** com entry em `server/index.ts` (ou script `start` apontando para um `.ts`/`.js` claro).
- Você quer **adoção rápida** sem editar vários arquivos.
- Ainda **não tem** rota de health leve — ou aceita que o CLI crie uma mínima em `/api/health`.
- Está começando um projeto ou pode revisar o diff do `init` num PR.

### Escolha a Opção B (manual) se…

- Usa **Fastify, Hono** ou outro framework (CLI v1 não suporta).
- Já tem rota `/api/health` com lógica sensível (ex.: checagem de banco) e quer **manter ou refatorar** sem o CLI tocar no arquivo.
- Prefere **controle explícito** do import e do momento em que `startKeepAlive()` é chamado.
- O entry não segue o padrão `server/index.ts` e você não quer forçar `--entry`.

### Self-ping interno vs ping externo

| Abordagem | Por que escolher | Limitação |
|-----------|------------------|-----------|
| **Este pacote (self-ping)** | Sem UptimeRobot, sem cron, sem GitHub Actions; zero serviço extra; mesmo deploy | Só age enquanto o processo Node está no ar |
| **UptimeRobot / cron externo** | Pode acordar instância já dormindo | Conta/config extra, latência, mais um ponto de falha |
| **GitHub Actions schedule** | Gratuito em repos públicos | Workflow redundante se o app já está rodando; não substitui health do painel do provedor |
| **Combinar self-ping + health do provedor** | Redundância razoável em Render | Ainda não é SLA; documente limitações do plano Free |

**Recomendação prática:** use este pacote como camada principal em Web Services Node; configure também o **Health Check Path** no painel do provedor (Render, Railway, etc.) quando disponível.

---

## Opção A — CLI `init` (Express)

### 1. Executar

Na raiz do projeto Express:

```bash
npx @rafaelhdsv/keep-alive init
```

Com opções explícitas (útil quando o entry não é o default):

```bash
npx @rafaelhdsv/keep-alive init --path /api/health --entry server/index.ts
npx @rafaelhdsv/keep-alive init --help
```

| Flag | Default | Quando mudar |
|------|---------|--------------|
| `--path` | `/api/health` | Sua API já usa `/health`, `/healthz` ou path do painel do Render |
| `--entry` | `server/index.ts` ou script `start` | Monorepo, `src/server.ts`, `api/index.ts`, etc. |

### 2. O que o comando altera

1. **`package.json`** — adiciona `"@rafaelhdsv/keep-alive"` em `dependencies` (se ausente).
2. **Entry do servidor** — insere `import { startKeepAlive } from '@rafaelhdsv/keep-alive'` e chama `startKeepAlive()` **dentro do callback** de `app.listen` (após o servidor estar ouvindo).
3. **Rota health** — se não existir `app.get('<path>', ...)` (ou equivalente) no entry, injeta:

   ```ts
   app.get('/api/health', (_req, res) => {
     res.status(200).json({ ok: true })
   })
   ```

4. **`.env.example`** — acrescenta variáveis comentadas (`KEEP_ALIVE_*`).

### 3. Exemplo — antes e depois

**Antes** (`server/index.ts`):

```ts
app.listen(PORT, () => {
  console.log(`Server on ${PORT}`)
})
```

**Depois** (`init`):

```ts
import { startKeepAlive } from '@rafaelhdsv/keep-alive'

app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`Server on ${PORT}`)
  startKeepAlive()
})
```

### 4. Segunda execução (idempotência)

```bash
npx @rafaelhdsv/keep-alive init
# [keep-alive] Nada a alterar — projeto já configurado.
```

Pode rodar após merge, em CI de scaffold ou ao atualizar o template — não duplica import nem rota.

### 5. Depois do `init` — checklist

```bash
yarn install          # ou npm install — instala a nova dependência
yarn dev              # local: sem URL pública → no-op (sem log de ativo)
```

Em produção:

- [ ] Deploy com variáveis corretas (ver [Variáveis de ambiente](#variáveis-de-ambiente))
- [ ] Painel do provedor: **Health Check Path** = mesmo path do `--path` (ex.: `/api/health`)
- [ ] Logs com `[keep-alive] ativo: ...`
- [ ] `GET /api/health` responde 200 **sem** consultar banco na rota do ping

### 6. Erros comuns do `init`

| Mensagem / situação | Causa | O que fazer |
|---------------------|-------|-------------|
| Entry não encontrado | Sem `server/index.ts` nem `start` legível | `init --entry caminho/para/seu/server.ts` |
| Estrutura não-Express | Fastify/Hono/outro | Use [Opção B — manual](#opção-b--uso-manual) |
| Rota health “pesada” já existe | CLI não substitui rota existente | Refatore manualmente ou use path dedicado (`--path /ping`) |

---

## Opção B — Uso manual

### 1. Instalar

```bash
yarn add @rafaelhdsv/keep-alive
# ou: npm install @rafaelhdsv/keep-alive
```

### 2. Chamar após `listen`

O ping só deve começar quando o servidor **já está aceitando conexões**:

```ts
import express from 'express'
import { startKeepAlive } from '@rafaelhdsv/keep-alive'

const app = express()
const PORT = Number(process.env.PORT ?? 3000)

// Rota leve — sem banco, sem filas, sem I/O pesado
app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`Server on port ${PORT}`)
  startKeepAlive()
})
```

**Por que no callback de `listen`?** O self-ping faz HTTP para a URL pública do app; se o servidor ainda não subiu, o primeiro tick falharia sem necessidade.

### 3. Opções em código vs env

| Configuração | Onde definir | Quando usar |
|--------------|--------------|-------------|
| URL base | `KEEP_ALIVE_URL` (env) | **Produção** — URL pública HTTPS do app |
| Path | `KEEP_ALIVE_PATH` (env) | Path padrão do time (`/health`, `/api/health`) |
| Path | `startKeepAlive({ path: '...' })` | Teste local, multi-tenant, ou override pontual |
| Intervalo | `KEEP_ALIVE_INTERVAL_MIN` (env) | Ajuste fino por ambiente |
| Intervalo | `startKeepAlive({ intervalMin: 8 })` | Provedor com idle &lt; 15 min |

Precedência: **argumentos de `startKeepAlive()`** sobrescrevem env para `url`, `path` e `intervalMin`.

```ts
startKeepAlive({
  path: '/api/health',
  intervalMin: 10,
  // url: 'https://...'  // raro; prefira KEEP_ALIVE_URL em produção
})
```

### 4. Fastify

```ts
import Fastify from 'fastify'
import { startKeepAlive } from '@rafaelhdsv/keep-alive'

const app = Fastify()

app.get('/api/health', async () => ({ ok: true }))

await app.listen({ port: 3000, host: '0.0.0.0' })
startKeepAlive({ path: '/api/health' })
```

### 5. Hono (Node adapter)

```ts
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { startKeepAlive } from '@rafaelhdsv/keep-alive'

const app = new Hono()
app.get('/api/health', (c) => c.json({ ok: true }))

serve({ fetch: app.fetch, port: 3000 }, () => {
  startKeepAlive({ path: '/api/health' })
})
```

---

## Variáveis de ambiente

### Variáveis do pacote (as que você configura)

| Variável | Default | Descrição |
|----------|---------|-----------|
| `KEEP_ALIVE_URL` | — | URL base pública HTTPS do app — **use em qualquer provedor** (Railway, Fly.io, VPS, staging, etc.) |
| `KEEP_ALIVE_PATH` | `/api/health` | Caminho do ping (sem query string) |
| `KEEP_ALIVE_INTERVAL_MIN` | `10` | Intervalo em minutos entre pings |

**Em dev local:** não defina nada → sem `KEEP_ALIVE_URL` → **no-op silencioso** (sem log `[keep-alive] ativo`).

### Qual variável usar?

| Situação | O que fazer |
|----------|-------------|
| **Produção (qualquer provedor)** | `KEEP_ALIVE_URL=https://seu-dominio-publico` |
| **Dev local** | Nada |

### Intervalo — como escolher

| Idle do provedor | `KEEP_ALIVE_INTERVAL_MIN` sugerido |
|------------------|-------------------------------------|
| ~15 min (Render Free) | `10` (default) — margem segura |
| ~5 min (alguns PaaS) | `3` ou `4` |
| Muito agressivo (&lt; 5 min) | Avalie plano pago ou ping externo |

Regra: **intervalo &lt; janela de idle** do provedor.

### Exemplo `.env` (Railway / genérico)

```env
KEEP_ALIVE_URL=https://meu-app.up.railway.app
KEEP_ALIVE_PATH=/api/health
KEEP_ALIVE_INTERVAL_MIN=10
```

---

## Fluxo completo — deploy (exemplo)

1. **Adotar o pacote**

   ```bash
   npx @rafaelhdsv/keep-alive init
   yarn install
   ```

2. **Variáveis no painel do provedor**

   - `KEEP_ALIVE_URL` = URL pública HTTPS do app (ex.: `https://meu-app.exemplo.com`)
   - **Health Check Path** (se o provedor oferecer) = mesmo path do `--path` (ex.: `/api/health`)

3. **Deploy**

   - Nos logs: `[keep-alive] ativo: https://meu-app.exemplo.com/api/health a cada 10 min`

4. **Validar**

   ```bash
   curl -s https://meu-app.exemplo.com/api/health
   # {"ok":true}
   ```

---

## Boas práticas — rota de health

A rota usada pelo keep-alive deve ser **a mais leve possível**:

| Faça | Evite |
|------|-------|
| `res.json({ ok: true })` imediato | `SELECT 1` ou ping em Mongo/Postgres |
| Path dedicado (`/api/health`) | Reutilizar rota que carrega sessão/auth pesada |
| `ready` em rota separada (`/api/ready`) se precisar de DB | Bloquear o ping em migração de schema |

**Projetos existentes:** se `/api/health` já consulta banco, o `init` **não** altera essa rota. Opções:

1. Refatorar health para ser leve no ping e mover checagens para `/api/ready`.
2. Criar path novo: `init --path /ping` e configurar o keep-alive nesse path.

---

## Limitações (leia antes de depender em produção)

- **Self-ping não acorda instância já hibernada.** Processo morto ou instância dormindo só voltam com tráfego externo (usuário, health do provedor, UptimeRobot).
- **Workaround para idle**, não substituto de plano pago nem garantia de SLA.
- Políticas de provedores podem mudar — acompanhe changelogs (ex.: Render Free).
- CLI `init` v1: **apenas Express**. Demais frameworks: lib manual.

---

## API pública

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

## Solução de problemas

| Sintoma | Provável causa | Ação |
|---------|----------------|------|
| Sem log `[keep-alive] ativo` em produção | `KEEP_ALIVE_URL` ausente ou incorreta | Defina a URL pública HTTPS do app |
| Log aparece mas app ainda dorme | Intervalo ≥ idle do provedor | Reduza `KEEP_ALIVE_INTERVAL_MIN` |
| `HTTP 4xx/5xx` nos warns | Path errado ou health pesada/falhando | Confira `KEEP_ALIVE_PATH` e resposta da rota |
| Funciona local, não em prod | URL interna ou HTTP em vez de HTTPS | Use URL **pública HTTPS** em `KEEP_ALIVE_URL` |
| `init` não acha o entry | Estrutura fora do padrão | `--entry` ou adoção manual |

---

## Desenvolvimento do pacote

```bash
yarn
yarn build
yarn test
```

Requer Node ≥ 18 (recomendado: 22, conforme `.nvmrc`).

## Licença

MIT © 2026 Rafael Vieira — veja [LICENSE](./LICENSE).
