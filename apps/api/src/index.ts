import { Scalar } from '@scalar/hono-api-reference'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'

import { env } from '~/env-runtime'
import { auth } from '~/lib/auth'
import { BASE_URL } from '~/lib/constants'
import { logger } from '~/lib/logger'
import { routers } from '~/rest/routers'
import { createRouter } from '~/utils'

const app = createRouter()

app.use(secureHeaders())

app.use(
  '*',
  cors({
    origin: env.ALLOWED_API_ORIGINS.split(','),
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowHeaders: [
      'Authorization',
      'Access-Control-Allow-Credentials',
      'Cookie',
      'Content-Type',
      'accept-language',
      'x-trpc-source',
      'x-user-locale',
      'x-user-timezone',
      'x-user-country',
      'X-Retry-After',
    ],
    exposeHeaders: ['Content-Length'],
    maxAge: 86400,
  })
)

app.on(['POST', 'GET'], '/auth/*', (c) => {
  return auth.handler(c.req.raw)
})

app.route('/v1', routers)

app.openAPIRegistry.registerComponent('securitySchemes', 'token', {
  type: 'http',
  scheme: 'bearer',
  description: 'Default authentication mechanism',
  'x-api-key-example': 'CC_API_KEY',
})

app.doc('/openapi', {
  openapi: '3.1.0',
  info: {
    version: '0.0.1',
    title: 'Codecrawl API',
    description: 'Codecrawl API',
    contact: {
      name: 'Support',
      email: 'hello@codecrawl.com',
      url: 'https://codecrawl.com',
    },
    license: {
      name: 'AGPL-3.0 license',
      url: 'https://github.com/irere123/codecrawl/blob/main/LICENSE',
    },
  },
  servers: [
    {
      url: BASE_URL,
      description: 'Production API',
    },
  ],
  security: [{ token: [] }],
})

app.get(
  '/',
  Scalar({
    url: '/openapi',
    pageTitle: 'Codecrawl API',
    theme: 'saturn',
    showSidebar: true,
  })
)

const DEFAULT_PORT = env.PORT

// Graceful shutdown handling
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully...`)
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

logger.info(`Server starting on port ${DEFAULT_PORT}`)
logger.info(`Worker ${process.pid} started`)

export default {
  fetch: app.fetch,
  port: Number(DEFAULT_PORT),
}
