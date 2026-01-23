import { v4 as uuidv4 } from 'uuid';

import {
  cleanOldConcurrencyLimitEntries,
  getConcurrencyLimitActiveJobs,
  getConcurrencyQueueJobsCount,
  pushConcurrencyLimitActiveJob,
  pushConcurrencyLimitedJob,
} from '~/lib/concurrency-limit';
import { logger } from '~/lib/logger';
import type { CrawlOptions, PlanType } from '~/types';
import { getCrawlQueue } from './queue-service';
import { getConcurrencyLimitMax } from './rate-limiter';

async function _addCrawlJobToConcurrencyQueue(
  codeCrawlOptions: any,
  options: any,
  jobId: string,
  jobPriority: number,
) {
  await pushConcurrencyLimitedJob(codeCrawlOptions.teamId, {
    id: jobId,
    data: codeCrawlOptions,
    opts: {
      ...options,
      priority: jobPriority,
      jobId,
    },
    priority: jobPriority,
  });
}

export async function _addCrawlJobToBullMQ(
  codeCrawlOptions: any,
  options: any,
  jobId: string,
  jobPriority: number,
) {
  if (codeCrawlOptions?.teamId && codeCrawlOptions.plan) {
    await pushConcurrencyLimitActiveJob(
      codeCrawlOptions.teamId,
      jobId,
      60 * 1000,
    );
  }

  await getCrawlQueue().add(jobId, codeCrawlOptions, {
    ...options,
    priority: jobPriority,
    jobId,
  });
}

async function addCrawlJobRaw(
  codeCrawlOptions: any,
  options: any,
  jobId: string,
  jobPriority: number,
) {
  let concurrentLimited = false;
  let concurrentActiveConcurrency = 0;
  let maxConcurrency = 0;

  if (codeCrawlOptions?.teamId) {
    const now = Date.now();
    maxConcurrency = getConcurrencyLimitMax(
      codeCrawlOptions.plan ?? 'free',
      codeCrawlOptions.teamId,
    );
    cleanOldConcurrencyLimitEntries(codeCrawlOptions.teamId, now);
    concurrentActiveConcurrency = (
      await getConcurrencyLimitActiveJobs(codeCrawlOptions.teamId, now)
    ).length;
    concurrentLimited = concurrentActiveConcurrency >= maxConcurrency;
  }

  const concurrencyQueueJobs = await getConcurrencyQueueJobsCount(
    codeCrawlOptions.teamId,
  );

  if (concurrentLimited) {
    // Detect if they hit their concurrent limit
    // If above by 2x, send them an email
    // No need to 2x as if there are more than the max concurrency in the concurrency queue, it is already 2x
    if (concurrencyQueueJobs > maxConcurrency) {
      logger.info(
        'Concurrency limited 2x (single) - ',
        'Concurrency queue jobs: ',
        concurrencyQueueJobs,
        'Max concurrency: ',
        maxConcurrency,
        'Team ID: ',
        codeCrawlOptions.teamId,
      );

      // Only send notification if it's not a crawl or batch scrape
    }

    codeCrawlOptions.concurrencyLimited = true;

    await _addCrawlJobToConcurrencyQueue(
      codeCrawlOptions,
      options,
      jobId,
      jobPriority,
    );
  } else {
    await _addCrawlJobToBullMQ(codeCrawlOptions, options, jobId, jobPriority);
  }
}

export async function addCrawlJob(
  codeCrawlOptions: CrawlOptions,
  options: any = {},
  jobId: string = uuidv4(),
  jobPriority = 10,
) {
  // TODO: Sentry stuff here
  await addCrawlJobRaw(codeCrawlOptions, options, jobId, jobPriority);
}

export async function addCrawlJobs(
  jobs: {
    data: CrawlOptions;
    opts: {
      jobId: string;
      priority: number;
    };
  }[],
) {
  if (jobs.length === 0) return true;

  let countCanBeDirectlyAdded = Number.POSITIVE_INFINITY;
  let currentActiveConcurrency = 0;
  let maxConcurrency = 0;

  if (jobs[0].data?.teamId && jobs[0].data.plan) {
    const now = Date.now();
    maxConcurrency = getConcurrencyLimitMax(
      jobs[0].data.plan as PlanType,
      jobs[0].data.teamId,
    );
    cleanOldConcurrencyLimitEntries(jobs[0].data.teamId, now);

    currentActiveConcurrency = (
      await getConcurrencyLimitActiveJobs(jobs[0].data.teamId, now)
    ).length;

    countCanBeDirectlyAdded = Math.max(
      maxConcurrency - currentActiveConcurrency,
      0,
    );
  }

  const addToBull = jobs.slice(0, countCanBeDirectlyAdded);
  const addToCQ = jobs.slice(countCanBeDirectlyAdded);

  // equals 2x the max concurrency
  if (addToCQ.length > maxConcurrency) {
    logger.info(
      'Concurrency limited 2x (multiple) - ',
      'Concurrency queue jobs: ',
      addToCQ.length,
      'Max concurrency: ',
      maxConcurrency,
      'Team ID: ',
      jobs[0].data.teamId,
    );

    // Only send notification if it's not a crawl or batch scrape
  }

  await Promise.all(
    addToBull.map(async (job) => {
      // TODO: Sentry logging staff
      await _addCrawlJobToBullMQ(
        job.data,
        job.opts,
        job.opts.jobId,
        job.opts.priority,
      );
    }),
  );

  await Promise.all(
    addToCQ.map(async (job) => {
      // TODO: Sentry logging staff
      await _addCrawlJobToConcurrencyQueue(
        job.data,
        job.opts,
        job.opts.jobId,
        job.opts.priority,
      );
    }),
  );

  return true;
}

export function waitForJob<T = unknown>(
  jobId: string,
  timeout: number,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const int = setInterval(async () => {
      if (Date.now() >= start + timeout) {
        clearInterval(int);
        reject(new Error('Job wait '));
      } else {
        const state = await getCrawlQueue().getJobState(jobId);

        if (state === 'completed') {
          clearInterval(int);
          resolve((await getCrawlQueue().getJob(jobId))?.returnvalue);
        } else if (state === 'failed') {
          const job = await getCrawlQueue().getJob(jobId);
          if (job && job.failedReason !== 'Concurrency limit hit') {
            clearInterval(int);
            reject(job.failedReason);
          }
        }
      }
    }, 250);
  });
}
