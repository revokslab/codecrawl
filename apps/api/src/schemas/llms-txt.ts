import { z } from 'zod';

export const llmsTxtStatusSchema = z.object({
  jobId: z.string(),
});

export const llmsTxtResponseSchema = z.object({
  success: z.boolean(),
  id: z.string(),
});

export const llmsTxtRequestSchema = z.object({
  url: z.string(),
  showFullText: z.boolean().optional(),
});

export const llmsTxtStatusResponseSchema = z.object({
  success: z.boolean(),
  id: z.string(),
});
