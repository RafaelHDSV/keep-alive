# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o versionamento [SemVer](https://semver.org/lang/pt-BR/).

## [1.0.1] - 2026-07-01

### Corrigido

- CLI no Windows: shebang duplicado quebrava `npx @rafaelhdsv/keep-alive init`
- Build do CLI em CJS (`dist/cli.cjs`) para compatibilidade com `commander` no Windows
- Resolução de templates no bundle via `__dirname`

## [1.0.0] - 2026-07-01

### Adicionado

- `startKeepAlive()` — self-ping periódico com zero dependências de runtime
- Resolução de URL: `KEEP_ALIVE_URL` → `RENDER_EXTERNAL_URL` → `RENDER_APP_URL`
- Variáveis `KEEP_ALIVE_PATH` (default `/api/health`) e `KEEP_ALIVE_INTERVAL_MIN` (default `10`)
- Timeout de fetch de 90s para cold start pós-deploy
- CLI `keep-alive init` para projetos Express (import, rota health, `.env.example`)
- Documentação completa em README e `docs/`

[1.0.1]: https://github.com/RafaelHDSV/keep-alive/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/RafaelHDSV/keep-alive/releases/tag/v1.0.0
