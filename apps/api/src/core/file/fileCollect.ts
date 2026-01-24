import { logger } from '~/lib/logger'
import { initPiscina } from '~/lib/processConcurrency'
import type { RawFile } from './fileTypes'
import type { FileCollectTask } from './workers/fileCollectWorker'
import type { CrawlProgressCallback } from '~/types'

const initTaskRunner = (numOfTasks: number) => {
  const pool = initPiscina(numOfTasks, require.resolve('./workers/fileCollectWorker'))
  return (task: FileCollectTask) => pool.run(task)
}

export const collectFiles = async (
  filePaths: string[],
  rootDir: string,
  progressCallback: CrawlProgressCallback = () => {},
  deps = { initTaskRunner }
): Promise<RawFile[]> => {
  const runTask = deps.initTaskRunner(filePaths.length)
  const tasks = filePaths.map((filePath) => ({ filePath, rootDir }) satisfies FileCollectTask)

  try {
    const startTime = process.hrtime.bigint()
    logger.info(`Starting file collection for ${filePaths.length} files using worker pool`)

    let completedTasks = 0
    const totalTasks = tasks.length

    const results = await Promise.all(
      tasks.map((task) =>
        runTask(task).then((result) => {
          completedTasks++
          progressCallback(`Collect file... (${completedTasks}/${totalTasks})`)
          logger.info(`Collect files... (${completedTasks}/${totalTasks}) ${task.filePath}`)
          return result
        })
      )
    )

    const endTime = process.hrtime.bigint()
    const duration = Number(endTime - startTime) / 1e6

    logger.info(`File collection completed in ${duration.toFixed(2)}ms`)
    return results.filter((file): file is RawFile => file !== null)
  } catch (error) {
    logger.error('Error during file collection')
    throw error
  }
}
