import { defineConfig,devices } from '@playwright/test'
import { join,resolve } from 'node:path'

const node = process.execPath
const platformRoot=resolve(import.meta.dirname,'../..')
const quote=(value:string)=>`"${value}"`
const webServerCommand = `${quote(node)} ${quote(join(platformRoot,'node_modules/concurrently/dist/bin/concurrently.js'))} -k -n api,worker,workbench "${quote(node)} ${quote(join(platformRoot,'apps/api/node_modules/tsx/dist/cli.mjs'))} ${quote(join(platformRoot,'apps/api/src/server.ts'))}" "${quote(node)} ${quote(join(platformRoot,'apps/api/node_modules/tsx/dist/cli.mjs'))} ${quote(join(platformRoot,'apps/api/src/worker.ts'))}" "${quote(node)} ${quote(join(platformRoot,'apps/workbench/node_modules/vite/bin/vite.js'))} ${quote(join(platformRoot,'apps/workbench'))} --port 4273"`

export default defineConfig({
  testDir:'./e2e',timeout:45_000,fullyParallel:false,retries:0,
  use:{baseURL:'http://localhost:4273',trace:'retain-on-failure',screenshot:'only-on-failure'},
  projects:[{name:'chromium',use:{...devices['Desktop Chrome']}}],
  webServer:{
    command:webServerCommand,url:'http://localhost:4273',reuseExistingServer:false,timeout:120_000,
    env:{...process.env,DATABASE_URL:`file:${join(platformRoot,'var/e2e.db')}`,FILE_STORAGE_ROOT:join(platformRoot,'var/e2e-files'),DOWNLOAD_TOKEN_SECRET:'e2e-download-token-secret-longer-than-32',AI_PROVIDER:'fake',NODE_ENV:'test'},
  },
})
