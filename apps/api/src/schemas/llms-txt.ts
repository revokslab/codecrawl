import { z } from '@hono/zod-openapi'

export const llmsTxtRequestSchema = z.object({
  url: z.string().url(),
  showFullText: z.boolean().optional(),
})

export const llmsTxtResponseSchema = z.object({
  success: z.boolean(),
  id: z.string(),
})

export const llmsTxtStatusSchema = z.object({
  jobId: z.string(),
})

export const llmsTxtStatusResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      llmstxt: z.string(),
      llmsfulltxt: z.string().optional(),
    })
    .nullable()
    .optional(),
  status: z.string(),
  error: z.string().optional(),
  expiresAt: z.string().optional(),
})
