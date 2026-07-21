import { buildApp } from './app.js'
import { loadConfig } from './config.js'

const config = loadConfig()
const app = await buildApp()

await app.listen({ host: '0.0.0.0', port: config.API_PORT })
