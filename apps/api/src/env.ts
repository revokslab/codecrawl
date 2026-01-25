import { z } from 'zod'

const EnvSchema = z.object({
  // generic stuff
  NODE_ENV: z.string().default('development'),
  PORT: z.string().optional().default('4000'),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  ALLOWED_API_ORIGINS: z.string().default('http://localhost:3000'),
  CODECRAWL_ENCRYPTION_KEY: z.string(),

  // auth providers
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),

  // better-auth
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.url().default('http://localhost:4000'),
  BASE_URL: z.url().default('http://localhost:4000'),
})

export type Environment = z.infer<typeof EnvSchema>

export function parseEnv(data: any) {
  const { data: env, error, success } = EnvSchema.safeParse(data)

  if (!success) {
    console.error('Invalid environment variables:', error.format())
    process.exit(1)
  }

  return env
}
