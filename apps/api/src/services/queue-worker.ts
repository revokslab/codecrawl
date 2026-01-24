import { Worker, type Job, type Queue } from 'bullmq'
import 'dotenv/config'
import { v4 as uuidv4 } from 'uuid'

import { runComprehensiveLlmsTxtAction, runFileTreeAction, runLlmsTxtAction } from '~/core/actions'
import {
  cleanOldConcurrencyLimitEntries,
  pushConcurrencyLimitActiveJob,
  removeConcurrencyLimitActiveJob,
  takeConcurrencyLimitedJob,
} from '~/lib/concurrency-limit'
import { getLlmsTextFromCache, saveLlmsTxtToCache } from '~/lib/generate-llms-txt'
import { updateGeneratedLlmsTxt } from '~/lib/generate-llms-txt/redis'
import { updateTreeGenerationDataStatus } from '~/lib/generate-tree'
import { logger as _logger } from '~/lib/logger'
import { getGenerateLlmsTxtQueue, getGenerateTreeQueue, redisConnection } from './queue-service'
import systemMonitor from './system-monitor'

/**
 * Globals
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const runningJobs: Set<string> = new Set()
const jobLockExtendInterval = Number(process.env.JOB_LOCK_EXTEND_INTERVAL) || 15000
const jobLockExtensionTime = Number(process.env.JOB_LOCK_EXTENSION_TIME) || 60000

const cantAcceptConnectionInterval = Number(process.env.CANT_ACCEPT_CONNECTION_INTERVAL) || 2000
const connectionMonitorInterval = Number(process.env.CONNECTION_MONITOR_INTERVAL) || 10
const gotJobInterval = Number(process.env.CONNECTION_MONITOR_INTERVAL) || 20

/**
 * Core Layer
 */
let isShuttingDown = false

process.on('SIGINT', () => {
  console.log('Received SIGTERM. Shutting down gracefully...')
  isShuttingDown = true
})

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...')
  isShuttingDown = true
})

let cantAcceptConnectionCount = 0

/**
 * Worker function runner and processor utility
 * @param queue - Queue storing jobs to be processed by the woker
 * @param processJobInternal - Process Job function
 */
const workerFun = async (
  queue: Queue,
  processJobInternal: (token: string, job: Job) => Promise<any>
) => {
  const loggger = _logger.child({
    module: 'queue-worker',
    method: 'workerFun',
  })

  const worker = new Worker(queue.name, null, {
    connection: redisConnection,
    lockDuration: 1 * 60 * 1000, // 1 minute
    stalledInterval: 30 * 1000, // 30 seconds
    maxStalledCount: 10, // 10 times
  })

  worker.startStalledCheckTimer()

  const monitor = await systemMonitor

  while (true) {
    if (isShuttingDown) {
      console.log('No longer accepting new jobs. SIGINT')
      break
    }
    const token = uuidv4()
    const canAcceptConnection = await monitor.acceptConnection()

    if (!canAcceptConnection) {
      console.log("Can't accept connection due to RAM/CPU load")
      loggger.info("Can't accept connection due to RAM/CPU load")
      cantAcceptConnectionCount++

      if (cantAcceptConnectionCount >= 25) {
        loggger.error('WORKER STALLED', {
          cpuUsage: await monitor.checkCpuUsage(),
          memoryUsage: await monitor.checkMemoryUsage(),
        })
      }

      await sleep(cantAcceptConnectionInterval) // more sleep
      continue
    } else {
      cantAcceptConnectionCount = 0
    }

    const job = await worker.getNextJob(token)

    if (job) {
      if (job.id) {
        runningJobs.add(job.id)
      }

      async function afterJobDone(job: Job<any, any, string>) {
        if (job.id) {
          runningJobs.delete(job.id)
        }

        if (job.id && job.data && job.data.teamId && job.data.plan) {
          await removeConcurrencyLimitActiveJob(job.data.teamId, job.id)
          cleanOldConcurrencyLimitEntries(job.data.teamId)

          const nextJob = await takeConcurrencyLimitedJob(job.data.teamId)
          if (nextJob !== null) {
            await pushConcurrencyLimitActiveJob(job.data.teamId, nextJob.id, 60 * 1000)

            await queue.add(
              nextJob.id,
              {
                ...nextJob.data,
                concurrencyLimitHit: true,
              },
              {
                ...nextJob.opts,
                jobId: nextJob.id,
                priority: nextJob.priority,
              }
            )
          }
        }
      }

      if (job.data) {
        try {
          processJobInternal(token, job).finally(() => afterJobDone(job))
        } catch (processError) {
          loggger.error('Error during processJobInternal invocation', {
            jobId: job.id,
            processError,
          })
          afterJobDone(job)
        }
      } else {
        loggger.warn('Job received without data', { jobId: job.id })
        afterJobDone(job)
      }

      await sleep(gotJobInterval)
    } else {
      await sleep(connectionMonitorInterval)
    }
  }
}

/**
 * Job Processor for LLMs Text Generation
 */
const processGenerateLlmsTxtJobInternal = async (
  token: string,
  job: Job & { id: string }
): Promise<{ success: boolean; data?: any; error?: string }> => {
  const { generationId, request, teamId } = job.data
  const { url, maxUrls, showFullText } = request

  const logger = _logger.child({
    module: 'generate-llmstxt-worker',
    method: 'processJobInternal',
    jobId: job.id,
    generationId,
    teamId: teamId ?? undefined,
    url: url,
  })

  const extendLockInterval = setInterval(async () => {
    try {
      logger.info(`🔄 Worker extending lock on job ${job.id}`)
      await job.extendLock(token, jobLockExtensionTime)
    } catch (lockError) {
      logger.error(`Failed to extend lock for job ${job.id}`, { lockError })
    }
  }, jobLockExtendInterval)

  let jobResult: { success: boolean; data?: any; error?: string } = {
    success: false,
    error: 'Processing did not complete',
  }

  try {
    logger.info(`🚀 Starting LLMs text generation job`, { showFullText })

    const effectiveMaxUrls = Math.min(maxUrls ?? 5000, 5000)
    logger.info('Checking cache...')
    const cachedResult = await getLlmsTextFromCache(url, effectiveMaxUrls)

    if (cachedResult) {
      logger.info('Cache hit!', { url })
      await updateGeneratedLlmsTxt(generationId, {
        status: 'completed',
        generatedText: cachedResult.llmstxt,
        fullText: cachedResult.llmstxt_full,
        showFullText: showFullText,
      })
      jobResult = {
        success: true,
        data: {
          generatedText: cachedResult.llmstxt,
          fullText: cachedResult.llmstxt_full,
          showFullText: showFullText,
        },
      }
      await job.moveToCompleted(jobResult, token, false)
      logger.info(`✅ Job completed from cache`)
      return jobResult
    }

    logger.info('Cache miss. Running appropriate action...')
    let actionResult: any
    let generatedText: string
    let fullText: string

    if (showFullText) {
      logger.info('Running Comprehensive Action...')
      actionResult = await runComprehensiveLlmsTxtAction(url, {
        fileSummary: true,
        headerText: 'Comprehensive',
      })
      generatedText = actionResult.comprehensiveText
      fullText = actionResult.comprehensiveText
    } else {
      logger.info('Running Standard Action...')
      actionResult = await runLlmsTxtAction(url, {
        compress: true,
        removeComments: true,
        removeEmptyLines: true,
        topFilesLen: 5,
      })
      generatedText = actionResult.llmsTxt
      fullText = actionResult.llmsTxt
    }

    logger.info('Action completed. Saving to cache...')
    await saveLlmsTxtToCache(url, generatedText, fullText, effectiveMaxUrls)

    logger.info('Updating job status in Redis...')
    await updateGeneratedLlmsTxt(generationId, {
      status: 'completed',
      generatedText: generatedText,
      fullText: fullText,
      showFullText: showFullText,
    })

    jobResult = {
      success: true,
      data: { generatedText, fullText, showFullText },
    }
    await job.moveToCompleted(jobResult, token, false)
    logger.info(`✅ Job completed successfully after running action`)
  } catch (error) {
    logger.error(`🚫 Job errored`, { error })
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during processing'
    jobResult = { success: false, error: errorMessage }

    try {
      await job.moveToFailed(error instanceof Error ? error : new Error(errorMessage), token, false)
    } catch (moveError) {
      logger.error('Failed to move job to failed state', { moveError })
    }

    await updateGeneratedLlmsTxt(generationId, {
      status: 'failed',
      error: errorMessage,
    })
  } finally {
    clearInterval(extendLockInterval)
    logger.info(`🛑 Job processing finished.`)
  }
  return jobResult
}

/**
 * Job Processor for File Tree Generation
 */
const processTreeJobInternal = async (
  token: string,
  job: Job & { id: string }
): Promise<{ success: boolean; data?: any; error?: string }> => {
  const { url, generationId, userId } = job.data // Extract necessary data

  const logger = _logger.child({
    module: 'generate-tree-worker',
    method: 'processTreeJobInternal',
    jobId: job.id,
    generationId,
    userId: userId ?? undefined, // Include userId if present
    url: url,
  })

  const extendLockInterval = setInterval(async () => {
    try {
      logger.info(`🔄 Worker extending lock on job ${job.id}`)
      await job.extendLock(token, jobLockExtensionTime)
    } catch (lockError) {
      logger.error(`Failed to extend lock for job ${job.id}`, { lockError })
    }
  }, jobLockExtendInterval)

  let jobResult: { success: boolean; data?: any; error?: string } = {
    success: false,
    error: 'Processing did not complete',
  }

  try {
    logger.info(`🚀 Starting File Tree generation job`)

    await updateTreeGenerationDataStatus(generationId, 'processing')

    const tree = await runFileTreeAction(url, {})

    logger.info('File Tree action completed.')

    await updateTreeGenerationDataStatus(generationId, 'completed', tree.treeString)

    jobResult = {
      success: true,
      data: { tree },
    }
    await job.moveToCompleted(jobResult, token, false)
    logger.info(`✅ Job completed successfully`)
  } catch (error) {
    logger.error(`🚫 Job errored`, { error })
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during processing'
    jobResult = { success: false, error: errorMessage }

    try {
      await updateTreeGenerationDataStatus(generationId, 'failed', errorMessage)
    } catch (statusUpdateError) {
      logger.error('Failed to update job status to failed in storage', {
        statusUpdateError,
      })
    }

    try {
      await job.moveToFailed(error instanceof Error ? error : new Error(errorMessage), token, false)
    } catch (moveError) {
      logger.error('Failed to move job to failed state in queue', {
        moveError,
      })
    }
  } finally {
    clearInterval(extendLockInterval)
    logger.info(`🛑 Job processing finished.`)
  }

  return jobResult
}

// Start all workers
;(async () => {
  await Promise.all([
    workerFun(getGenerateLlmsTxtQueue(), processGenerateLlmsTxtJobInternal as any),
    workerFun(getGenerateTreeQueue(), processTreeJobInternal as any),
  ])

  console.log('All workers exited. Waiting for all jobs to finish...')

  while (runningJobs.size > 0) {
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  console.log('All jobs finished. Worker out!')
  process.exit(0)
})()
