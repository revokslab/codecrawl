import type { JobsOptions } from 'bullmq'

import { redisConnection } from '~/services/queue-service'

const constructKey = (userId: string) => `concurrency-limiter:${userId}`
const constructQueueKey = (userId: string) => `concurrency-limit-queue:${userId}`

export async function cleanOldConcurrencyLimitEntries(userId: string, now: number = Date.now()) {
  await redisConnection.zremrangebyscore(constructKey(userId), Number.NEGATIVE_INFINITY, now)
}

export async function getConcurrencyLimitActiveJobs(
  userId: string,
  now: number = Date.now()
): Promise<string[]> {
  return await redisConnection.zrangebyscore(constructKey(userId), now, Number.POSITIVE_INFINITY)
}

export async function pushConcurrencyLimitActiveJob(
  userId: string,
  id: string,
  timeout: number,
  now: number = Date.now()
) {
  await redisConnection.zadd(constructKey(userId), now + timeout, id)
}

export async function removeConcurrencyLimitActiveJob(userId: string, id: string) {
  await redisConnection.zrem(constructKey(userId), id)
}

export type ConcurrencyLimitedJob = {
  id: string
  data: any
  opts: JobsOptions
  priority?: number
}

type ZMPopResult = [string, [string, string]] // [key, [member, score]]

export async function takeConcurrencyLimitedJob(
  userId: string
): Promise<ConcurrencyLimitedJob | null> {
  const res = await redisConnection.zmpop(1, constructQueueKey(userId), 'MIN')
  if (res === null || res === undefined) {
    return null
  }

  // Cast to the expected type after null check
  const typedRes = res as ZMPopResult
  return JSON.parse(typedRes[1][0])
}

export async function pushConcurrencyLimitedJob(userId: string, job: ConcurrencyLimitedJob) {
  await redisConnection.zadd(constructQueueKey(userId), job.priority ?? 1, JSON.stringify(job))
}

export async function getConcurrencyLimitedJobs(userId: string) {
  return new Set(
    (await redisConnection.zrange(constructQueueKey(userId), 0, -1)).map((x) => JSON.parse(x).id)
  )
}

export async function getConcurrencyQueueJobsCount(userId: string): Promise<number> {
  const count = await redisConnection.zcard(constructQueueKey(userId))
  return count
}
