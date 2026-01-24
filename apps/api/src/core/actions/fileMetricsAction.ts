import { isGitInstalled } from '../file/gitCommand'
import { configMergedSchema, type ConfigBase, type ConfigMerged } from '~/config/configSchema'
import { logger } from '~/lib/logger'
import type { CrawlOptions } from '~/types'
import { rethrowValidationErrorIfZodError } from '~/utils/errorHandle'
import type { ProcessedFile } from '../file/fileTypes'
import { collectFiles } from '../file/fileCollect'
import { processFiles } from '../file/fileProcess'
import { searchFiles } from '../file/fileSearch'
import { sortPaths } from '../file/filePathSort'
import {
  parseRemoteValue,
  createTempDirectory,
  cloneRepository,
  cleanupTempDirectory,
} from '../utils/remoteUtils'

export interface FileMetrics {
  path: string
  content: string
  lineCount: number
  characterCount: number
  fileSize: number
}

export interface FileMetricsActionRunnerResult {
  files: FileMetrics[]
  config: ConfigMerged
}

/**
 * Clones a remote repository, processes its files, and calculates metrics.
 * @param remoteUrl The remote repository URL or shorthand.
 * @param options Crawl options influencing file processing.
 * @returns An array of file metrics and the merged configuration.
 */
export const runFileMetricsAction = async (
  remoteUrl: string,
  options: CrawlOptions,
  deps = {
    isGitInstalled,
    parseRemoteValue,
    createTempDirectory,
    cloneRepository,
    cleanupTempDirectory,
    searchFiles,
    sortPaths,
    collectFiles,
    processFiles,
    buildConfig,
  }
): Promise<FileMetricsActionRunnerResult> => {
  logger.info('Running file metrics action for remote URL:', remoteUrl)

  if (!(await deps.isGitInstalled())) {
    throw new Error('Git is not installed or not in the system PATH.')
  }

  const parsedFields = deps.parseRemoteValue(remoteUrl)
  const tempDirPath = await deps.createTempDirectory()
  let filesWithMetrics: FileMetrics[] = []

  try {
    await deps.cloneRepository(
      parsedFields.repoUrl,
      tempDirPath,
      options.remoteBranch || parsedFields.remoteBranch
    )

    const config = deps.buildConfig(options)

    // --- Pipeline: Search -> Sort -> Collect -> Process ---
    logger.info('Searching files...')
    const { filePaths } = await deps.searchFiles(tempDirPath, config)

    logger.info('Sorting files...')
    const sortedFilePaths = await deps.sortPaths(filePaths)

    logger.info('Collecting files...')
    const rawFiles = await deps.collectFiles(sortedFilePaths, tempDirPath, () => {})

    logger.info('Processing files...')
    const processedFiles = await deps.processFiles(rawFiles, config, () => {})
    // --- End of pipeline ---

    logger.info('Calculating metrics...')
    filesWithMetrics = processedFiles.map((file: ProcessedFile) => ({
      path: file.path,
      content: file.content,
      lineCount: file.content.split('\n').length,
      characterCount: file.content.length,
      fileSize: Buffer.byteLength(file.content, 'utf8'),
    }))
  } finally {
    await deps.cleanupTempDirectory(tempDirPath)
  }

  const finalConfig = buildConfig(options)

  return {
    files: filesWithMetrics,
    config: finalConfig,
  }
}

/**
 * Builds configuration relevant to file metrics generation.
 */
const buildConfig = (options: CrawlOptions): ConfigMerged => {
  const config: ConfigBase = {}

  if (options.include) {
    config.include = options.include.split(',')
  }
  if (options.ignore) {
    config.ignore = { customPatterns: options.ignore.split(',') }
  }
  if (options.gitignore === false) {
    config.ignore = { ...config.ignore, useGitignore: options.gitignore }
  }
  if (options.defaultPatterns === false) {
    config.ignore = {
      ...config.ignore,
      useDefaultPatterns: options.defaultPatterns,
    }
  }
  if (options.removeComments !== undefined) {
    config.output = {
      ...config.output,
      removeComments: options.removeComments,
    }
  }
  if (options.removeEmptyLines !== undefined) {
    config.output = {
      ...config.output,
      removeEmptyLines: options.removeEmptyLines,
    }
  }

  try {
    return configMergedSchema.parse(config)
  } catch (error) {
    rethrowValidationErrorIfZodError(error, 'Invalid configuration options for file metrics')
    throw error
  }
}
