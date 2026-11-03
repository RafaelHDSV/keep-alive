# Histórico de mudanças

> **Para que serve:** registro datado de mudanças notáveis — não é estado atual
> **Fonte da verdade:** o que entrou/saiu do produto em cada data
> **Relacionados:** [context](context.md) · [especificacao](especificacao.md) · [CHANGELOG](../CHANGELOG.md)

Use `CHANGELOG.md` na raiz para releases Keep a Changelog. Este arquivo guarda o detalhe por data.

## 2026-11-03

### Living docs (board#7)

- Conjunto canônico de 12 documentos em `docs/` alinhado ao padrão forge.
- Arquivos de comunidade e README vendável.

## Extraído do CHANGELOG

# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o versionamento [SemVer](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Adicionado

- Alinhamento ao padrão de living docs (board#7): links de comunidade no README.

## [1.0.1] - 2026-07-01

### Corrigido

- CLI no Windows: shebang duplicado quebrava `npx @rafaelhdsv/keep-alive init`
- Build do CLI em CJS (`dist/cli.cjs`) para compatibilidade com `commander` no Windows
- Resolução de templates no bundle via `__dirname`

## [1.0.0] - 2026-07-01

### Adicionado
