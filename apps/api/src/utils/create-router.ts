import { OpenAPIHono } from '@hono/zod-openapi'

import type { AppBindings } from '~/types'

export function createRouter() {
  return new OpenAPIHono<AppBindings>()
}
