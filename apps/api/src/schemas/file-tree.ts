import { z } from '@hono/zod-openapi'

export const fileTreeStatusSchema = z.object({
  jobId: z.string(),
})

export const fileTreeRequestSchema = z.object({
  url: z.string(),
})

export const fileTreeResponseSchema = z.object({
  tree: z.string(),
})

export const fileTreeStatusResponseSchema = z.object({
  success: z.boolean(),
  data: fileTreeResponseSchema,
  status: z.enum(['processing', 'completed', 'failed']),
  error: z.string().optional(),
  expiresAt: z.string(),
})
