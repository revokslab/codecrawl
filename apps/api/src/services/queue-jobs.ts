import { v4 as uuidv4 } from 'uuid'

import { pushConcurrencyLimitedJob } from '~/lib/concurrency-limit'
import type { CrawlOptions } from '~/types'
import { getCrawlQueue } from './queue-service'

async function _addCrawlJobToConcurrencyQueue(
  codeCrawlOptions: any,
  options: any,
  jobId: string,
  jobPriority: number
) {
  await pushConcurrencyLimitedJob(codeCrawlOptions.userId, {
    id: jobId,
    data: codeCrawlOptions,
    opts: {
      ...options,
      priority: jobPriority,
      jobId,
    },
    priority: jobPriority,
  })
}

export async function _addCrawlJobToBullMQ(
  codeCrawlOptions: any,
  options: any,
  jobId: string,
  jobPriority: number
) {
  await getCrawlQueue().add(jobId, codeCrawlOptions, {
    ...options,
    priority: jobPriority,
    jobId,
  })
}

async function addCrawlJobRaw(
  codeCrawlOptions: any,
  options: any,
  jobId: string,
  jobPriority: number
) {
  await _addCrawlJobToConcurrencyQueue(codeCrawlOptions, options, jobId, jobPriority)
}

export async function addCrawlJob(
  codeCrawlOptions: CrawlOptions,
  options: any = {},
  jobId: string = uuidv4(),
  jobPriority = 10
) {
  // TODO: Sentry stuff here
  await addCrawlJobRaw(codeCrawlOptions, options, jobId, jobPriority)
}

export async function addCrawlJobs(
  jobs: {
    data: CrawlOptions
    opts: {
      jobId: string
      priority: number
    }
  }[]
) {
  if (jobs.length === 0) return true

  await Promise.all(
    jobs.map(async (job) => {
      // TODO: Sentry logging staff
      await _addCrawlJobToBullMQ(job.data, job.opts, job.opts.jobId, job.opts.priority)
    })
  )

  return true
}

export function waitForJob<T = unknown>(jobId: string, timeout: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const int = setInterval(async () => {
      if (Date.now() >= start + timeout) {
        clearInterval(int)
        reject(new Error('Job wait '))
      } else {
        const state = await getCrawlQueue().getJobState(jobId)

        if (state === 'completed') {
          clearInterval(int)
          resolve((await getCrawlQueue().getJob(jobId))?.returnvalue)
        } else if (state === 'failed') {
          const job = await getCrawlQueue().getJob(jobId)
          if (job && job.failedReason !== 'Concurrency limit hit') {
            clearInterval(int)
            reject(job.failedReason)
          }
        }
      }
    }, 250)
  })
}
