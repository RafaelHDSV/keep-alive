# Configuração — desenvolvimento local

Setup do repositório `@rafaelhdsv/keep-alive` para contribuir ou validar antes de publicar.

---

## Pré-requisitos

- **Node.js 22** — use `nvm use` (`.nvmrc` na raiz)
- **Yarn Classic (v1)** — `npm install -g yarn` se necessário

Verifique:

```bash
node -v    # v22.x
yarn -v    # 1.22.x
```

---

## Instalação

```bash
git clone https://github.com/RafaelHDSV/keep-alive.git
cd keep-alive
nvm use
yarn
```

---

## Scripts

| Comando | Ação |
|---------|------|
| `yarn build` | Compila lib e CLI em `dist/` via tsup |
| `yarn test` | Testes com `node:test` (tsx para TypeScript) |

---

## Estrutura relevante

```
src/
  index.ts              # export público
  start-keep-alive.ts   # loop de ping
  resolve-url.ts        # env + options
  cli/                  # bin keep-alive
templates/              # snippets para init
tests/                  # unit + fixture Express
```

---

## Testar CLI localmente (sem publicar)

```bash
yarn build
node dist/cli.js init --help
```

Em cópia de projeto Express:

```bash
node /caminho/para/keep-alive/dist/cli.js init --entry server/index.ts
```

---

## Convenções

- **ESM** em todo o projeto (`"type": "module"`)
- Imports com sufixo `.js` nos fontes TypeScript
- Sem dependências de runtime — apenas devDependencies para build/test/CLI
- Textos de usuário em **pt-BR** com acentuação nos docs e mensagens CLI

---

## Antes de commitar

```bash
yarn build
yarn test
```

Não commite `node_modules/`, `dist/` (gerado no CI/local) ou `.env` com segredos.
