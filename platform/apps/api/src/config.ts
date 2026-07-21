import { z } from 'zod'

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(4100),
  DATABASE_URL: z.string().default('file:../../var/workbench.db'),
  SEED_ADMIN_EMAIL: z.email().default('admin@example.com'),
  SEED_ADMIN_PASSWORD: z.string().min(16).default('ChangeMe-Local-Only-123!'),
})

export type AppConfig = z.infer<typeof configSchema>

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  return configSchema.parse(environment)
}
