import type { TiktokenEncoding } from 'tiktoken'

import { logger } from '~/lib/logger'
import { initPiscina } from '~/lib/processConcurrency'
import type { FileMetricsTask } from './workers/fileMetricsWorker'
import type { ProcessedFile } from '../file/fileTypes'
import type { CrawlProgressCallback } from '~/types'
import type { FileMetrics } from './workers/types'

const initTaskRunner = (numOfTasks: number) => {
  const pool = initPiscina(numOfTasks, require.resolve('./workers/fileMetricsWorker'))
  return (task: FileMetricsTask) => pool.run(task)
}

export const calculateAllFileMetrics = async (
  processedFiles: ProcessedFile[],
  tokenCounterEncoding: TiktokenEncoding,
  progressCallback: CrawlProgressCallback,
  deps = {
    initTaskRunner,
  }
): Promise<FileMetrics[]> => {
  const runTask = deps.initTaskRunner(processedFiles.length)
  const tasks = processedFiles.map(
    (file, index) =>
      ({
        file,
        index,
        totalFiles: processedFiles.length,
        encoding: tokenCounterEncoding,
      }) satisfies FileMetricsTask
  )

  try {
    const startTime = process.hrtime.bigint()
    logger.info(`Starting metrics calculation for ${processedFiles.length} files using worker pool`)

    let completedTasks = 0
    const results = await Promise.all(
      tasks.map((task) =>
        runTask(task).then((result) => {
          completedTasks++
          progressCallback(`Calculating metrics... (${completedTasks}/${task.totalFiles})`)
          logger.info(
            `Calculating metrics... (${completedTasks}/${task.totalFiles}) ${task.file.path}`
          )
          return result
        })
      )
    )

    const endTime = process.hrtime.bigint()
    const duration = Number(endTime - startTime) / 1e6
    logger.info(`Metrics calculation completed in ${duration.toFixed(2)}ms`)

    return results
  } catch (error) {
    logger.error('Error during metrics calculation:', error)
    throw error
  }
}
