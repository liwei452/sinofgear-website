import { z } from 'zod'

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(4100),
  DATABASE_URL: z.string().default('file:../../var/workbench.db'),
  FILE_STORAGE_ROOT: z.string().default('./var/files'),
  DOWNLOAD_TOKEN_SECRET: z.string().min(32).default('local-download-token-secret-change-me'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().min(1).default('gpt-5.6-terra'),
  AI_PROVIDER: z.enum(['fake', 'openai']).default('fake'),
  SEED_ADMIN_EMAIL: z.email().default('admin@example.com'),
  SEED_ADMIN_PASSWORD: z.string().min(16).default('ChangeMe-Local-Only-123!'),
})

export type AppConfig = z.infer<typeof configSchema>

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  return configSchema.parse(environment)
}
