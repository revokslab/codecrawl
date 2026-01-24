import { Queue } from 'bullmq'
import IORedis from 'ioredis'
import { logger } from '~/lib/logger'

export type QueueFunction = () => Queue<any, any, string, any, any, string>

let crawlQueue: Queue
let generateLlmsTxtQueue: Queue
let billingQueue: Queue
let treeQueue: Queue

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL environment variable is missing...')
}

export const redisConnection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
})

export const indexStoreQueueName = '{indexQueue}'
export const treeQueueName = '{treeQueue}'
export const generateLlmsTxtQueueName = '{generateLlmsTextQueue}'
export const crawlQueueName = '{crawlQueue}'
export const billingQueueName = '{billingQueue}'

export function getCrawlQueue() {
  if (!crawlQueue) {
    crawlQueue = new Queue(crawlQueueName, {
      connection: redisConnection,
      defaultJobOptions: {
        removeOnComplete: {
          age: 10800, // 3 hours
        },
        removeOnFail: {
          age: 10800, // 3 hours
        },
      },
    })
    logger.info('Codebase crawling queue created')
  }
  return crawlQueue
}

export function getGenerateLlmsTxtQueue() {
  if (!generateLlmsTxtQueue) {
    generateLlmsTxtQueue = new Queue(generateLlmsTxtQueueName, {
      connection: redisConnection,
      defaultJobOptions: {
        removeOnComplete: {
          age: 90000, // 25 hours
        },
        removeOnFail: {
          age: 90000, // 25 hours
        },
      },
    })
    logger.info('LLMs TXT generation queue created')
  }
  return generateLlmsTxtQueue
}

export function getBillingQueue() {
  if (!billingQueue) {
    billingQueue = new Queue(billingQueueName, {
      connection: redisConnection,
      defaultJobOptions: {
        removeOnComplete: {
          age: 90000, // 25 hours
        },
        removeOnFail: {
          age: 90000, // 25 hours
        },
      },
    })
    logger.info('Billing queue created')
  }
  return billingQueue
}

export function getGenerateTreeQueue() {
  if (!treeQueue) {
    treeQueue = new Queue(treeQueueName, {
      connection: redisConnection,
      defaultJobOptions: {
        removeOnComplete: {
          age: 90000, // 25 hours
        },
        removeOnFail: {
          age: 90000, // 25 hours
        },
      },
    })
    logger.info('Tree generation queue created')
  }
  return treeQueue
}
