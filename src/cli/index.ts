import { Command } from 'commander'
import { runInit } from './init.js'

const program = new Command()

program
  .name('keep-alive')
  .description('Self-ping para Web Services Node que hibernam por inatividade')
  .version('1.0.1')

program
  .command('init')
  .description('Configura keep-alive em projeto Express (import, rota health e .env.example)')
  .option('--path <path>', 'Caminho da rota de health', '/api/health')
  .option('--entry <file>', 'Arquivo de entrada do servidor (ex.: server/index.ts)')
  .action((opts: { path: string; entry?: string }) => {
    try {
      const result = runInit({ path: opts.path, entry: opts.entry })

      const changes: string[] = []
      if (result.packageJsonChanged) changes.push('package.json')
      if (result.entryChanged) changes.push(result.entryPath)
      if (result.envExampleChanged) changes.push('.env.example')

      if (changes.length === 0) {
        console.log('[keep-alive] Nada a alterar — projeto já configurado.')
        return
      }

      console.log(`[keep-alive] Configurado em ${result.entryPath}`)
      console.log(`[keep-alive] Arquivos alterados: ${changes.join(', ')}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[keep-alive] Erro: ${message}`)
      process.exit(1)
    }
  })

program.parse()
