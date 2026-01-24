import type { ConfigMerged } from '~/config/configSchema'
import type { CrawlProgressCallback } from '~/types'
import { type FileManipulator, getFileManipulator } from './fileManipulate'
import type { ProcessedFile, RawFile } from './fileTypes'
import type { FileProcessTask } from './workers/fileProcessWorker'
import { logger } from '~/lib/logger'
import { initPiscina } from '~/lib/processConcurrency'

type GetFileManipulator = (filePath: string) => FileManipulator | null

const initTaskRunner = (numOfTasks: number) => {
  const pool = initPiscina(numOfTasks, require.resolve('./workers/fileProcessWorker'))
  return (task: FileProcessTask) => pool.run(task)
}

export const processFiles = async (
  rawFiles: RawFile[],
  config: ConfigMerged,
  progressCallback: CrawlProgressCallback,
  deps: {
    initTaskRunner: typeof initTaskRunner
    getFileManipulator: GetFileManipulator
  } = {
    initTaskRunner,
    getFileManipulator,
  }
): Promise<ProcessedFile[]> => {
  const runTask = deps.initTaskRunner(rawFiles.length)
  const tasks = rawFiles.map(
    (rawFile, index) =>
      ({
        rawFile,
        config,
      }) satisfies FileProcessTask
  )

  try {
    const startTime = process.hrtime.bigint()
    logger.info(`Starting file processing for ${rawFiles.length} files using worker pool`)

    let completedTasks = 0
    const totalTasks = tasks.length

    const results = await Promise.all(
      tasks.map((task) =>
        runTask(task).then((result) => {
          completedTasks++
          progressCallback(`Processing file... (${completedTasks}/${totalTasks})`)
          logger.info(`Processing file... (${completedTasks}/${totalTasks}) ${task.rawFile.path}`)
          return result
        })
      )
    )

    const endTime = process.hrtime.bigint()
    const duration = Number(endTime - startTime) / 1e6
    logger.info(`File processing completed in ${duration.toFixed(2)}ms`)

    return results
  } catch (error) {
    logger.error('Error during file processing:', error)
    throw error
  }
}
