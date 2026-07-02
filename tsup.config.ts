import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'node18',
    outDir: 'dist',
  },
  {
    entry: { cli: 'src/cli/index.ts' },
    format: ['cjs'],
    platform: 'node',
    sourcemap: true,
    target: 'node18',
    outDir: 'dist',
    outExtension: () => ({ js: '.cjs' }),
    clean: false,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
])
