import { logger as _logger } from '~/lib/logger';
import { redisConnection } from '~/services/queue-service';
import type { CrawlOptions } from '~/types';

export type StoredCrawl = {
  repoUrl: string;
  crawlerOptions: CrawlOptions;
  userId: string;
  cancelled?: boolean;
  createdAt: number;
};

export async function saveCrawl(id: string, crawl: StoredCrawl) {
  _logger.debug(`Saving crawl ${id} to Redis...`, {
    crawl,
    module: 'crawl-redis',
    method: 'saveCrawl',
    crawlId: id,
    userId: crawl.userId,
  });
  await redisConnection.set(`crawl:${id}`, JSON.stringify(crawl));
  await redisConnection.expire(`crawl:${id}`, 24 * 60 * 60);
}

export async function getCrawl(id: string): Promise<StoredCrawl | null> {
  const x = await redisConnection.get(`crawl:${id}`);

  if (x == null) {
    return null;
  }

  await redisConnection.expire(`crawl:${id}`, 24 * 60 * 60);
  return JSON.parse(x);
}

export async function getCrawlExpiry(id: string): Promise<Date> {
  const d = new Date();
  const ttl = await redisConnection.pttl(`crawl:${id}`);
  d.setMilliseconds(d.getMilliseconds() + ttl);
  return d;
}

export async function addCrawlJob(id: string, job_id: string) {
  _logger.debug(`Adding crawl job ${job_id} to Redis...`, {
    jobId: job_id,
    module: 'crawl-redis',
    method: 'addCrawlJob',
    crawlId: id,
  });
  await redisConnection.sadd(`crawl:${id}:jobs`, job_id);
  await redisConnection.expire(`crawl:${id}:jobs`, 24 * 60 * 60);
}

export async function addCrawlJobs(id: string, job_ids: string[]) {
  if (job_ids.length === 0) return true;

  _logger.debug('Adding crawl jobs to Redis...', {
    jobIds: job_ids,
    module: 'crawl-redis',
    method: 'addCrawlJobs',
    crawlId: id,
  });

  await redisConnection.sadd(`crawl:${id}:jobs`, ...job_ids);
  await redisConnection.expire(`crawl:${id}:jobs`, 24 * 60 * 60);
}

export async function addCrawlJobDone(
  id: string,
  job_id: string,
  success: boolean,
) {
  _logger.debug('Adding done crawl job to Redis...', {
    jobId: job_id,
    module: 'crawl-redis',
    method: 'addCrawlJobDone',
    crawlId: id,
  });
  await redisConnection.sadd(`crawl:${id}:jobs_done`, job_id);
  await redisConnection.expire(`crawl:${id}:jobs_done`, 24 * 60 * 60);

  if (success) {
    await redisConnection.rpush(`crawl:${id}:jobs_done_ordered`, job_id);
  } else {
    // in case it's already been pushed, make sure it's removed
    await redisConnection.lrem(`crawl:${id}:jobs_done_ordered`, -1, job_id);
  }

  await redisConnection.expire(`crawl:${id}:jobs_done_ordered`, 24 * 60 * 60);
}

export async function getDoneJobsOrderedLength(id: string): Promise<number> {
  await redisConnection.expire(`crawl:${id}:jobs_done_ordered`, 24 * 60 * 60);
  return await redisConnection.llen(`crawl:${id}:jobs_done_ordered`);
}

export async function getDoneJobsOrdered(
  id: string,
  start = 0,
  end = -1,
): Promise<string[]> {
  await redisConnection.expire(`crawl:${id}:jobs_done_ordered`, 24 * 60 * 60);
  return await redisConnection.lrange(
    `crawl:${id}:jobs_done_ordered`,
    start,
    end,
  );
}

export async function isCrawlFinished(id: string) {
  await redisConnection.expire(`crawl:${id}:kickoff:finish`, 24 * 60 * 60);
  return (
    (await redisConnection.scard(`crawl:${id}:jobs_done`)) ===
      (await redisConnection.scard(`crawl:${id}:jobs`)) &&
    (await redisConnection.get(`crawl:${id}:kickoff:finish`)) !== null
  );
}

export async function isCrawlKickoffFinished(id: string) {
  await redisConnection.expire(`crawl:${id}:kickoff:finish`, 24 * 60 * 60);
  return (await redisConnection.get(`crawl:${id}:kickoff:finish`)) !== null;
}

export async function isCrawlFinishedLocked(id: string) {
  return await redisConnection.exists(`crawl:${id}:finish`);
}

export async function finishCrawlKickoff(id: string) {
  await redisConnection.set(
    `crawl:${id}:kickoff:finish`,
    'yes',
    'EX',
    24 * 60 * 60,
  );
}

export async function finishCrawlPre(id: string) {
  if (await isCrawlFinished(id)) {
    _logger.debug('Marking crawl as pre-finished.', {
      module: 'crawl-redis',
      method: 'finishCrawlPre',
      crawlId: id,
    });
    const set = await redisConnection.setnx(`crawl:${id}:finished_pre`, 'yes');
    await redisConnection.expire(`crawl:${id}:finished_pre`, 24 * 60 * 60);
    return set === 1;
  } else {
    _logger.debug(
      'Crawl can not be pre-finished yet, not marking as finished.',
      {
        module: 'crawl-redis',
        method: 'finishCrawlPre',
        crawlId: id,
        jobs_done: await redisConnection.scard(`crawl:${id}:jobs_done`),
        jobs: await redisConnection.scard(`crawl:${id}:jobs`),
        kickoff_finished:
          (await redisConnection.get(`crawl:${id}:kickoff:finish`)) !== null,
      },
    );
  }
}

export async function finishCrawl(id: string) {
  _logger.debug('Marking crawl as finished.', {
    module: 'crawl-redis',
    method: 'finishCrawl',
    crawlId: id,
  });
  await redisConnection.set(`crawl:${id}:finish`, 'yes');
  await redisConnection.expire(`crawl:${id}:finish`, 24 * 60 * 60);
}

export async function getCrawlJobs(id: string): Promise<string[]> {
  return await redisConnection.smembers(`crawl:${id}:jobs`);
}

export async function getCrawlJobCount(id: string): Promise<number> {
  return await redisConnection.scard(`crawl:${id}:jobs`);
}
