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
        description: 'LLMs.txt generated',
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
    const generation = await getGeneratedLLmsTxt(jobId);
    const showFullText = generation?.showFullText ?? false;

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

    let data: any = null;

    if (showFullText) {
      data = {
        llmstxt: generation.generatedText,
        llmsfulltxt: generation.fullText,
      };
    } else {
      data = {
        llmstxt: generation.generatedText,
      };
    }

    return c.json(
      validateResponse(
        {
          success: generation.status !== 'failed',
          data: data,
          status: generation.status,
          error: generation?.error ?? undefined,
          expiresAt: (await getGeneratedLlmsTxtExpiry(jobId)).toISOString(),
        },
        llmsTxtStatusResponseSchema,
      ),
    );
  },
);

export { llmsTxtRouter };
