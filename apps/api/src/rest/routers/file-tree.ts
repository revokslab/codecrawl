import { createRoute } from '@hono/zod-openapi'

import {
  getTreeGenerationData,
  getTreeGenerationDataExpiry,
  saveTreeGenerationData,
} from '~/lib/generate-tree'
import {
  fileTreeRequestSchema,
  fileTreeResponseSchema,
  fileTreeStatusResponseSchema,
  fileTreeStatusSchema,
} from '~/schemas'
import { getGenerateTreeQueue } from '~/services/queue-service'
import { createRouter, generateId, validateResponse } from '~/utils'

const fileTreeRouter = createRouter()

fileTreeRouter.openapi(
  createRoute({
    method: 'post',
    tags: ['File Tree'],
    path: '/',
    summary: 'Create file tree generation job',
    request: {
      body: {
        content: {
          'application/json': {
            schema: fileTreeRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'File tree generation job created',
        content: {
          'application/json': {
            schema: fileTreeResponseSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    const session = c.get('session')
    const body = c.req.valid('json')

    const generationId = generateId()
    const jobData = {
      url: body.url,
      userId: session.userId,
      generationId,
    }

    await saveTreeGenerationData({
      id: generationId,
      userId: session.userId,
      createdAt: Date.now(),
      status: 'processing',
      url: body.url,
      fileTree: '',
    })

    await getGenerateTreeQueue().add(generationId, jobData, {
      jobId: generationId,
    })

    return c.json(
      validateResponse(
        {
          success: true,
          id: generationId,
        },
        fileTreeResponseSchema
      )
    )
  }
)

fileTreeRouter.openapi(
  createRoute({
    method: 'get',
    tags: ['File Tree'],
    path: '/:jobId',
    summary: 'Get file tree status',
    request: {
      params: fileTreeStatusSchema,
    },
    responses: {
      200: {
        description: 'File tree status',
        content: {
          'application/json': {
            schema: fileTreeStatusResponseSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    const { jobId } = c.req.valid('param')

    const generation = await getTreeGenerationData(jobId)

    if (!generation) {
      return c.json(
        validateResponse(
          {
            success: false,
            error: 'tree generation job not found',
          },
          fileTreeStatusResponseSchema
        )
      )
    }

    const expiry = await getTreeGenerationDataExpiry(jobId)

    return c.json(
      validateResponse(
        {
          success: generation.status !== 'failed',
          data: {
            tree: generation.fileTree,
          },
          status: generation.status,
          error: generation?.error ?? undefined,
          expiresAt: expiry ? expiry.toISOString() : undefined,
        },
        fileTreeStatusResponseSchema
      )
    )
  }
)

export { fileTreeRouter }
