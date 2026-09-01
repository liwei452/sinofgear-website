import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@sinofgear/site-bridge-cloudflare': path.resolve(__dirname, '../vendor/site-bridge-cloudflare/src/index.ts'),
      '@': path.resolve(__dirname, '../src'),
    },
  },
  test: { environment: 'node' },
})
