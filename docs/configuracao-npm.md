# Configuração — publicação no npm

Passo a passo para publicar `@rafaelhdsv/keep-alive` no registry público npm.

---

## Pré-requisitos

- Conta em [npmjs.com](https://www.npmjs.com/signup)
- Node 22 (ou ≥ 18) e Yarn instalados
- Build e testes passando: `yarn build && yarn test`

---

## 1. Criar conta e fazer login

```bash
npm login
```

Informe username, password e e-mail OTP se solicitado.

Verifique:

```bash
npm whoami
```

---

## 2. Escopo `@rafaelhdsv`

O `package.json` já define:

```json
{
  "name": "@rafaelhdsv/keep-alive",
  "publishConfig": {
    "access": "public"
  }
}
```

Pacotes com escopo (`@org/`) são **privados por padrão** no npm. A primeira publicação **deve** usar `--access public`.

---

## 3. Primeira publicação

Na raiz do repositório:

```bash
yarn build
npm publish --access public
```

O script `prepublishOnly` executa `yarn build` automaticamente se você usar apenas `npm publish --access public`.

---

## 4. Versionamento (SemVer)

| Tipo | Quando | Exemplo |
|------|--------|---------|
| PATCH | Correção de bug | 1.0.0 → 1.0.1 |
| MINOR | Feature compatível | 1.0.0 → 1.1.0 |
| MAJOR | Breaking change | 1.0.0 → 2.0.0 |

Fluxo recomendado:

```bash
# Atualize CHANGELOG.md e package.json
npm version patch   # ou minor / major
yarn build
npm publish --access public
git push && git push --tags
```

---

## 5. Verificação pós-publish

```bash
npm view @rafaelhdsv/keep-alive
npx @rafaelhdsv/keep-alive init --help
```

---

## 6. Boas práticas

- **Não** publique `.env`, tokens ou `yarn.lock` no pacote (`files` limita a `dist` e `templates`).
- Evite `npm unpublish`; prefira patch semver para correções.
- Mantenha o repositório GitHub em sync com a versão publicada (tag `v1.0.0`, etc.).

---

## Troubleshooting

| Erro | Ação |
|------|------|
| 402 Payment Required / private scope | Use `npm publish --access public` |
| 403 Forbidden | Confirme que o usuário npm pertence à org `rafaelhdsv` ou que o escopo está liberado na sua conta |
| Nome já existe | O escopo `@rafaelhdsv` evita conflito com `keep-alive` unscoped |
