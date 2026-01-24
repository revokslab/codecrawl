import { createRoute } from '@hono/zod-openapi';

import {
  getGeneratedLLmsTxt,
  getGeneratedLlmsTxtExpiry,
  saveGeneratedLlmsTxt,
} from '~/lib/generate-llms-txt/redis';
import {
  llmsTxtRequestSchema,
  llmsTxtResponseSchema,
  llmsTxtStatusResponseSchema,
  llmsTxtStatusSchema,
} from '~/schemas';
import { getGenerateLlmsTxtQueue } from '~/services/queue-service';
import { createRouter, generateId, validateResponse } from '~/utils';

const llmsTxtRouter = createRouter();

llmsTxtRouter.openapi(
  createRoute({
    method: 'post',
    tags: ['LLMs.txt'],
    path: '/',
    summary: 'Generate LLMs.txt',
    request: {
      body: {
        content: {
          'application/json': {
            schema: llmsTxtRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'LLMs.txt generation job created',
        content: {
          'application/json': {
            schema: llmsTxtResponseSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    const generationId = generateId();
    const body = await c.req.json();

    const jobData = {
      request: body,
      generationId,
    };

    await saveGeneratedLlmsTxt(generationId, {
      id: generationId,
      createdAt: Date.now(),
      status: 'processing',
      url: body.url,
      showFullText: body.showFullText,
      generatedText: '',
      fullText: '',
    });

    await getGenerateLlmsTxtQueue().add(generationId, jobData, {
      jobId: generationId,
    });

    return c.json(
      validateResponse(
        {
          success: true,
          id: generationId,
        },
        llmsTxtResponseSchema,
      ),
    );
  },
);

llmsTxtRouter.openapi(
  createRoute({
    method: 'get',
    tags: ['LLMs.txt'],
    path: '/:jobId',
    summary: 'Get LLMs.txt status',
    request: {
      params: llmsTxtStatusSchema,
    },
    responses: {
      200: {
        description: 'LLMs.txt status',
        content: {
          'application/json': {
            schema: llmsTxtStatusResponseSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    const { jobId } = c.req.param();

    if (!jobId) {
      return c.json(
        validateResponse(
          {
            success: false,
            error: 'jobId is required',
          },
          llmsTxtStatusResponseSchema,
        ),
      );
    }

    const generation = await getGeneratedLLmsTxt(jobId);

    if (!generation) {
      return c.json(
        validateResponse(
          {
            success: false,
            error: 'llmsTxt generation job not found',
          },
          llmsTxtStatusResponseSchema,
        ),
      );
    }

    const showFullText = generation.showFullText ?? false;

    const data = showFullText
      ? {
          llmstxt: generation.generatedText,
          llmsfulltxt: generation.fullText,
        }
      : {
          llmstxt: generation.generatedText,
        };

    const expiry = await getGeneratedLlmsTxtExpiry(jobId);

    return c.json(
      validateResponse(
        {
          success: generation.status !== 'failed',
          data,
          status: generation.status,
          error: generation.error ?? undefined,
          expiresAt: expiry ? expiry.toISOString() : undefined,
        },
        llmsTxtStatusResponseSchema,
      ),
    );
  },
);

export { llmsTxtRouter };
